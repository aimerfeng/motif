import { appendEvent, applyDefaults, buildSystemPrompt, carryValues, remixItem, runAgent, starterItem, type AgentEvent, type AgentRunner, type PromptImage } from '@motif/agent'
import { checkParamValue, type ItemSource, type ParamValues } from '@motif/schema'
import { FONT_FAMILIES, VENDOR_IDS } from '@motif/vendor/manifest'
import { HttpError } from '@/lib/community/http'
import { marketSource } from '@/lib/community/market-source'
import { itemChanges } from './diff'
import { evaluateItem, promptSkills, studioHost } from './host'
import { sessionTokenBudget } from './runner'
import { loadSession, newSessionId, pruneSessions, saveSession, type StudioSession } from './store'

/** 正在运行的会话：一个会话同时只跑一轮，中止也从这里找。挂在 globalThis 上，所有路由共用。 */
const running = ((globalThis as { __motifStudioRuns?: Map<string, AbortController> }).__motifStudioRuns ??= new Map())

export function isRunning(id: string): boolean {
  return running.has(id)
}

/** 中止一轮。reason 写进对话记录（例如订单超时）；不给就是用户自己按了停止。 */
export function abortRun(id: string, reason?: string): boolean {
  const controller = running.get(id)
  controller?.abort(reason ? new Error(reason) : undefined)
  return controller !== undefined
}

/*
 * 同一个会话的修改（保存代码、回退、应用默认值、记参数）排队执行，每次都在锁里重新读会话：
 * 先检查、再等几十秒编译、再保存一份过时的副本，会把同时发生的另一次修改覆盖掉。
 * 有修改在排队或进行时也不能开始新的一轮 agent（它会在修改之前的版本上干活）。
 */
const locks = ((globalThis as { __motifStudioLocks?: Map<string, Promise<unknown>> }).__motifStudioLocks ??= new Map())

function withSession<T>(id: string, change: (session: StudioSession) => Promise<T>): Promise<T> {
  const previous = locks.get(id) ?? Promise.resolve()
  const current = previous
    .catch(() => {})
    .then(async () => {
      if (isRunning(id)) throw new HttpError(409, 'the agent is still working on this item')
      const session = await loadSession(id)
      if (!session) throw new HttpError(404, 'no such studio session')
      return change(session)
    })
  locks.set(id, current)
  void current
    .catch(() => {})
    .finally(() => {
      if (locks.get(id) === current) locks.delete(id)
    })
  return current
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
export function updateItem(id: string, item: ItemSource): Promise<StudioSession> {
  return withSession(id, (session) => replaceItem(session, item, session.values))
}

async function replaceItem(session: StudioSession, item: ItemSource, values: ParamValues): Promise<StudioSession> {
  const evaluation = await evaluateItem(item, (session.evaluation?.version ?? 0) + 1)
  const updated: StudioSession = { ...withSnapshot(session).session, item, values: sanitizeValues(item, carryValues(session.item, item, values)), evaluation }
  await saveSession(updated)
  return updated
}

/** 记住预览里调的参数（刷新页面后还在）。agent 正在运行时由它负责写，这里不覆盖，返回 false。 */
export async function saveValues(id: string, values: unknown): Promise<boolean> {
  if (isRunning(id)) return false
  try {
    return await withSession(id, async (session) => {
      await saveSession({ ...session, values: sanitizeValues(session.item, values) })
      return true
    })
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) return false
    throw error
  }
}

/**
 * 回到某个快照。回退之前的版本也存成快照，记在对话里，所以回退本身也能撤销。
 * agent 的对话历史里还是回退前的样子，下一轮开头会提醒它重新读文件。
 */
export function revertTo(id: string, snapshotId: number, label: string): Promise<StudioSession> {
  return withSession(id, (session) => revertSession(session, snapshotId, label))
}

async function revertSession(session: StudioSession, snapshotId: number, label: string): Promise<StudioSession> {
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
export function applyValuesAsDefaults(id: string, values: unknown): Promise<StudioSession> {
  return withSession(id, (session) => {
    const tuned = sanitizeValues(session.item, values)
    return replaceItem(session, applyDefaults(session.item, tuned), tuned)
  })
}

const encoder = new TextEncoder()

/**
 * 跑一轮 agent，返回 NDJSON 事件流（每行一个 AgentEvent）。
 * 事件同时并进对话记录；工作区每次变化、以及这一轮结束时都写盘，中途断线也不丢进度。
 */
const BUDGET_EXHAUSTED = 'this session has used up its model budget; start a new session'

export function startRun(session: StudioSession, prompt: string, runner: AgentRunner, attachments: { images: PromptImage[]; thumbnails: string[] } = { images: [], thumbnails: [] }): ReadableStream<Uint8Array> {
  if (isRunning(session.id)) throw new HttpError(409, 'the agent is already working on this item')
  if (locks.has(session.id)) throw new HttpError(409, 'your changes are still being saved; try again in a moment')
  const budget = sessionTokenBudget()
  if (session.usage.inputTokens + session.usage.outputTokens >= budget) throw new HttpError(429, BUDGET_EXHAUSTED)

  const controller = new AbortController()
  running.set(session.id, controller)
  let version = session.evaluation?.version ?? 0
  // 这一轮开始前的版本存成快照，挂在这条用户消息上，用户可以回到这里。
  const { session: snapshotted, snapshot } = withSnapshot(session)
  const state: StudioSession = {
    ...snapshotted,
    transcript: [...session.transcript, { role: 'user', text: prompt, at: Date.now(), snapshot, ...(attachments.thumbnails.length > 0 ? { images: attachments.thumbnails } : {}) }],
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
          state.values = event.values
          void persist()
        } else if (event.type === 'params') {
          state.values = event.values
        } else if (event.type === 'usage') {
          state.usage.inputTokens += event.inputTokens
          state.usage.outputTokens += event.outputTokens
          // 额度在每一步之后核对，不只是开始前：一轮几十步，每步都带着整段历史，开始时没超不代表跑完不超。
          if (state.usage.inputTokens + state.usage.outputTokens >= budget && !controller.signal.aborted) controller.abort(new Error(BUDGET_EXHAUSTED))
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
          images: attachments.images,
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
        // 这一轮没动条目和参数（只是聊天）：开头留的快照没有意义，不占快照的位置，也不显示「回到这一步之前」。
        if (JSON.stringify({ item: state.item, values: state.values }) === JSON.stringify({ item: session.item, values: session.values })) {
          state.snapshots = state.snapshots?.filter((entry) => entry.id !== snapshot)
          const asked = state.transcript.findLast((entry) => entry.role === 'user')
          if (asked?.role === 'user' && asked.snapshot === snapshot) delete asked.snapshot
        } else {
          // 记下这一轮改了哪些文件，用户能看到 agent 到底动了什么（逐行差异按需从快照算）。
          const files = itemChanges(session.item, state.item)
          if (files.length > 0) state.transcript.push({ role: 'changes', at: Date.now(), snapshot, files })
        }
        if (result.abortReason !== null) state.transcript.push({ role: 'notice', kind: 'aborted', text: result.abortReason, at: Date.now() })
        // 没跑完的一轮（中止、出错）不会进模型的历史，但这一轮里改过的文件留下了：下一轮开头提醒它重新读文件。
        if (!result.completed) {
          state.pendingNote = 'Note: your previous turn was interrupted before it finished, so some of your edits from it may not be in your memory. Read the files again before changing them.'
        }
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
