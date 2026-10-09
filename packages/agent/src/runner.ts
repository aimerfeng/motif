import type { ItemSource, ParamValues } from '@motif/schema/core'
import type { AgentEvent } from './events.ts'
import type { AgentHost, Evaluation } from './host.ts'
import { AgentSession } from './session.ts'
import { findTool, type ToolOutput } from './tools.ts'

export interface RunnerInput {
  prompt: string
  system: string
  session: AgentSession
  /** 这个运行器上一轮返回的续接状态（AI SDK 的历史消息、Claude CLI 的会话 id），第一轮为 undefined。 */
  state: unknown
  signal: AbortSignal
  emit: (event: AgentEvent) => void
}

/** 运行器：驱动一个模型（或脚本）调用工具，直到它停下。返回下一轮要用的续接状态。 */
export interface AgentRunner {
  readonly id: string
  run(input: RunnerInput): Promise<{ state: unknown }>
}

/** 执行一次工具调用：校验输入、运行、把异常变成给模型看的错误结果。三个运行器共用。 */
export async function callTool(session: AgentSession, name: string, rawInput: unknown): Promise<ToolOutput> {
  const tool = findTool(name)
  if (!tool) return { text: `Unknown tool "${name}".`, isError: true }
  const parsed = tool.input.safeParse(rawInput ?? {})
  if (!parsed.success) return { text: `Invalid input for ${name}: ${parsed.error.issues.map((issue) => `${issue.path.join('.') || 'input'} ${issue.message}`).join('; ')}`, isError: true }
  try {
    return await tool.run(session, parsed.data)
  } catch (error) {
    return { text: `${name} failed: ${error instanceof Error ? error.message : String(error)}`, isError: true }
  }
}

export interface RunAgentOptions {
  runner: AgentRunner
  host: AgentHost
  system: string
  prompt: string
  item: ItemSource
  values: ParamValues
  evaluation: Evaluation | null
  state: unknown
  signal: AbortSignal
  onEvent: (event: AgentEvent) => void
}

export interface RunAgentResult {
  state: unknown
  item: ItemSource
  values: ParamValues
  evaluation: Evaluation | null
  /** 运行是否正常结束（没有出错、没有被中止）。 */
  completed: boolean
}

/**
 * 跑一轮：建会话、交给运行器、收尾。任何异常都变成 error 事件，调用方只需要处理事件流。
 * 返回最终的工作区和续接状态，由调用方保存。
 */
export async function runAgent(options: RunAgentOptions): Promise<RunAgentResult> {
  const { runner, host, onEvent } = options
  const session = new AgentSession({ item: options.item, values: options.values, evaluation: options.evaluation }, host, onEvent)
  let state = options.state
  let completed = false
  try {
    const result = await runner.run({ prompt: options.prompt, system: options.system, session, state, signal: options.signal, emit: onEvent })
    state = result.state
    completed = !options.signal.aborted
    onEvent({ type: 'done', summary: session.finished?.summary ?? null })
  } catch (error) {
    if (options.signal.aborted) onEvent({ type: 'error', message: 'aborted' })
    else onEvent({ type: 'error', message: error instanceof Error ? error.message : String(error) })
  }
  return { state, item: session.item, values: session.values, evaluation: session.evaluation, completed }
}
