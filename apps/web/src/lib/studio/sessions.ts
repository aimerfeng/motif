import { appendEvent, applyDefaults, buildSystemPrompt, carryValues, remixItem, runAgent, starterItem, type AgentEvent, type AgentRunner } from '@motif/agent'
import { checkParamValue, type ItemSource, type ParamValues } from '@motif/schema'
import { FONT_FAMILIES, VENDOR_IDS } from '@motif/vendor/manifest'
import { HttpError } from '@/lib/community/http'
import { marketSource } from '@/lib/community/market-source'
import { evaluateItem, promptSkills, studioHost } from './host'
import { sessionTokenBudget } from './runner'
import { newSessionId, pruneSessions, saveSession, type StudioSession } from './store'

/** 正在运行的会话：一个会话同时只跑一轮，中止也从这里找。挂在 globalThis 上，所有路由共用。 */
const running = ((globalThis as { __motifStudioRuns?: Map<string, AbortController> }).__motifStudioRuns ??= new Map())

export function isRunning(id: string): boolean {
  return running.has(id)
}

export function abortRun(id: string): boolean {
  const controller = running.get(id)
  controller?.abort()
  return controller !== undefined
}

/** 新会话：base 是要改的市场条目（目录条目或审核通过的社区作品），values 是用户在详情页调好的参数。 */
export async function createSession(base: string | null, values?: unknown): Promise<StudioSession> {
  void pruneSessions().catch((error: unknown) => console.error('[studio] prune failed', error))
  const id = newSessionId()
  let item: ItemSource
  if (base) {
    const source = await marketSource(base)
    if (!source) throw new HttpError(404, `no published item named "${base}"`)
    item = remixItem(source, `${base}-remix`)
  } else {
    item = starterItem(`studio-${id.slice(0, 6)}`)
  }
  const session: StudioSession = {
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    base,
    item,
    values: sanitizeValues(item, values),
    evaluation: await evaluateItem(item, 1),
    transcript: [],
    runner: null,
    usage: { inputTokens: 0, outputTokens: 0 },
  }
  await saveSession(session)
  return session
}

/** 只保留参数定义里存在、且取值合法的参数，缺的补默认值。 */
export function sanitizeValues(item: ItemSource, values: unknown): ParamValues {
  const input = typeof values === 'object' && values !== null && !Array.isArray(values) ? (values as Record<string, unknown>) : {}
  const result: ParamValues = {}
  for (const param of Array.isArray(item.manifest.params) ? item.manifest.params : []) {
    const value = input[param.key]
    result[param.key] = value !== undefined && checkParamValue(param, value) === null ? (value as ParamValues[string]) : param.default
  }
  return result
}

const MAX_SNAPSHOTS = 15

/** 把当前版本存成快照（只留最近的几份），返回新的会话和快照编号。 */
function withSnapshot(session: StudioSession): { session: StudioSession; snapshot: number } {
  const snapshots = session.snapshots ?? []
  const id = (snapshots.at(-1)?.id ?? 0) + 1
  const next = [...snapshots, { id, at: Date.now(), item: session.item, values: session.values }].slice(-MAX_SNAPSHOTS)
  return { session: { ...session, snapshots: next }, snapshot: id }
}

/** 用户在代码编辑器里手动改了条目：先留快照，再重新检查、编译。 */
export async function updateItem(session: StudioSession, item: ItemSource): Promise<StudioSession> {
  if (isRunning(session.id)) throw new HttpError(409, 'the agent is still working on this item')
  const evaluation = await evaluateItem(item, (session.evaluation?.version ?? 0) + 1)
  const updated: StudioSession = { ...withSnapshot(session).session, item, values: sanitizeValues(item, carryValues(session.item, item, session.values)), evaluation }
  await saveSession(updated)
  return updated
}

/**
 * 回到某个快照。回退之前的版本也存成快照，记在对话里，所以回退本身也能撤销。
 * agent 的对话历史里还是回退前的样子，下一轮开头会提醒它重新读文件。
 */
export async function revertTo(session: StudioSession, snapshotId: number, label: string): Promise<StudioSession> {
  if (isRunning(session.id)) throw new HttpError(409, 'the agent is still working on this item')
  const target = session.snapshots?.find((snapshot) => snapshot.id === snapshotId)
  if (!target) throw new HttpError(404, 'that version is no longer kept')
  const { session: saved, snapshot } = withSnapshot(session)
  const evaluation = await evaluateItem(target.item, (session.evaluation?.version ?? 0) + 1)
  const reverted: StudioSession = {
    ...saved,
    item: target.item,
    values: target.values,
    evaluation,
    transcript: [...session.transcript, { role: 'notice', kind: 'reverted', text: label, at: Date.now(), snapshot }],
    pendingNote: 'Note: the user restored an earlier version of the item, so edits you made after that point are gone. Read the files again before changing them.',
  }
  await saveSession(reverted)
  return reverted
}

/** 「应用为默认值」：把预览里调好的参数写回参数定义和组件的默认值区域。 */
export async function applyValuesAsDefaults(session: StudioSession, values: ParamValues): Promise<StudioSession> {
  return updateItem({ ...session, values }, applyDefaults(session.item, sanitizeValues(session.item, values)))
}

const encoder = new TextEncoder()

/**
 * 跑一轮 agent，返回 NDJSON 事件流（每行一个 AgentEvent）。
 * 事件同时并进对话记录；工作区每次变化、以及这一轮结束时都写盘，中途断线也不丢进度。
 */
export function startRun(session: StudioSession, prompt: string, runner: AgentRunner): ReadableStream<Uint8Array> {
  if (isRunning(session.id)) throw new HttpError(409, 'the agent is already working on this item')
  const used = session.usage.inputTokens + session.usage.outputTokens
  if (used >= sessionTokenBudget()) throw new HttpError(429, 'this session has used up its model budget; start a new session')

  const controller = new AbortController()
  running.set(session.id, controller)
  let version = session.evaluation?.version ?? 0
  // 这一轮开始前的版本存成快照，挂在这条用户消息上，用户可以回到这里。
  const { session: snapshotted, snapshot } = withSnapshot(session)
  const state: StudioSession = {
    ...snapshotted,
    transcript: [...session.transcript, { role: 'user', text: prompt, at: Date.now(), snapshot }],
    usage: { ...session.usage },
    pendingNote: null,
  }
  const agentPrompt = session.pendingNote ? `${session.pendingNote}\n\n${prompt}` : prompt
  let saving = Promise.resolve()
  const persist = () => {
    saving = saving.then(() => saveSession(state)).catch((error: unknown) => console.error('[studio] save failed', error))
    return saving
  }

  return new ReadableStream<Uint8Array>({
    async start(stream) {
      const send = (event: AgentEvent) => {
        appendEvent(state.transcript, event)
        if (event.type === 'workspace') {
          state.item = event.item
          state.evaluation = event.evaluation
          void persist()
        } else if (event.type === 'params') {
          state.values = event.values
        } else if (event.type === 'usage') {
          state.usage.inputTokens += event.inputTokens
          state.usage.outputTokens += event.outputTokens
        }
        try {
          stream.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
        } catch {
          // 浏览器断开了：继续跑完这一轮，结果照样写盘，刷新页面就能看到。
        }
      }

      try {
        const system = buildSystemPrompt({ vendorIds: VENDOR_IDS, fonts: FONT_FAMILIES, skills: await promptSkills() })
        const result = await runAgent({
          runner,
          host: studioHost(session.id, () => ++version),
          system,
          prompt: agentPrompt,
          item: state.item,
          values: state.values,
          evaluation: state.evaluation,
          // 换了运行器就不接上一家的状态。
          state: session.runner?.id === runner.id ? session.runner.state : undefined,
          signal: controller.signal,
          onEvent: send,
        })
        state.item = result.item
        state.values = result.values
        state.evaluation = result.evaluation
        state.runner = { id: runner.id, state: result.state }
        if (controller.signal.aborted) state.transcript.push({ role: 'notice', kind: 'aborted', text: 'aborted', at: Date.now() })
      } catch (error) {
        // runAgent 自己会把运行中的错误变成事件；能走到这里的是准备阶段的错误（比如读不到 skill）。
        send({ type: 'error', message: error instanceof Error ? error.message : String(error) })
      } finally {
        running.delete(session.id)
        await persist()
        try {
          stream.close()
        } catch {
          // 已经断开。
        }
      }
    },
    cancel() {
      // 浏览器取消读取不等于要中止 agent（可能只是刷新页面）；中止走 abort 接口。
    },
  })
}
