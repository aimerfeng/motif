import type { ItemSource, ParamValues } from '@motif/schema/core'
import type { Evaluation } from './host.ts'

/**
 * 一次 agent 运行发出的事件。三个运行器（AI SDK、本机 Claude CLI、脚本）都只产出这一种事件，
 * 站点把它们原样流给浏览器，也按它们整理出可以保存的对话记录。
 */
export type AgentEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool-call'; id: string; name: string; input: unknown }
  | { type: 'tool-result'; id: string; name: string; output: string; isError: boolean }
  /**
   * 工作区变了（写文件、改清单）：带上新的条目、这一版的检查和编译结果，以及跟着新参数定义调整过的预览参数
   * （agent 改了默认值或增删参数时，浏览器的预览要用新的参数，不然看到的不是 agent 截图里的样子）。
   */
  | { type: 'workspace'; item: ItemSource; evaluation: Evaluation; values: ParamValues }
  /** agent 调了预览里的参数。 */
  | { type: 'params'; values: ParamValues }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'done'; summary: string | null }
  | { type: 'error'; message: string }

/** 保存下来的对话：用户的话、agent 的话，以及 agent 调用过的工具（只留摘要）。 */
export type TranscriptEntry =
  /** snapshot：这一轮开始前的版本，可以回到那里。 */
  | { role: 'user'; text: string; at: number; snapshot?: number }
  | { role: 'assistant'; text: string; at: number }
  | { role: 'tool'; id: string; name: string; input: unknown; output: string | null; isError: boolean; at: number }
  /** reverted：用户回到了某个快照；snapshot 是回退前的版本，回退本身也能撤销。 */
  | { role: 'notice'; kind: 'done' | 'error' | 'aborted' | 'reverted'; text: string; at: number; snapshot?: number }

const MAX_STORED_STRING = 2_000

/**
 * 对话记录里只需要知道 agent 调了什么（界面上显示「修改 effect.tsx」），不需要整份文件内容：
 * 写文件的输入动辄几十 KB，原样存下来会让会话文件和每次轮询的响应越来越大。长字符串只留开头和长度。
 */
function compactInput(input: unknown): unknown {
  if (typeof input === 'string') return input.length > MAX_STORED_STRING ? `${input.slice(0, 200)}… [${input.length} chars]` : input
  if (Array.isArray(input)) return input.map(compactInput)
  if (typeof input === 'object' && input !== null) return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, compactInput(value)]))
  return input
}

/** 把一串事件并进对话记录（运行中的增量文本合并到最后一条 assistant）。 */
export function appendEvent(transcript: TranscriptEntry[], event: AgentEvent, now = Date.now()): void {
  const last = transcript.at(-1)
  switch (event.type) {
    case 'text':
      if (last?.role === 'assistant') last.text += event.delta
      else transcript.push({ role: 'assistant', text: event.delta, at: now })
      return
    case 'tool-call':
      transcript.push({ role: 'tool', id: event.id, name: event.name, input: compactInput(event.input), output: null, isError: false, at: now })
      return
    case 'tool-result': {
      const call = transcript.findLast((entry) => entry.role === 'tool' && entry.id === event.id)
      if (call?.role === 'tool') {
        call.output = event.output
        call.isError = event.isError
      }
      return
    }
    case 'done':
      if (event.summary) transcript.push({ role: 'notice', kind: 'done', text: event.summary, at: now })
      return
    case 'error':
      transcript.push({ role: 'notice', kind: 'error', text: event.message, at: now })
      return
    case 'workspace':
    case 'params':
    case 'usage':
      return
  }
}
