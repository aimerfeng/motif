import { callTool, type AgentRunner } from '../runner.ts'
import type { AgentSession } from '../session.ts'

/** 脚本的一步：说一句话，或者调用一个工具（输入可以根据当前工作区算出来）。 */
export type ScriptStep = { say: string } | { tool: string; input: Record<string, unknown> | ((session: AgentSession) => Record<string, unknown>) }

/**
 * 默认脚本：对任何条目都成立的一次「出错再自己修好」的改动。
 * 读文件 → 改坏组件（编译报错）→ 改回来 → 看预览 → 调一个颜色参数 → 结束。
 * e2e 用它验证工具、事件流、预览回报和对话记录的整条链路，不调用任何模型。
 */
export const DEFAULT_SCRIPT: ScriptStep[] = [
  { say: 'Let me look at the item first.' },
  { tool: 'list_files', input: {} },
  { tool: 'read_file', input: (session) => ({ path: session.item.manifest.entry.file }) },
  {
    tool: 'edit_file',
    input: (session) => ({ path: session.item.manifest.entry.file, old_string: 'export function ', new_string: 'export function (' }),
  },
  { say: 'That broke the build. Fixing it.' },
  {
    tool: 'edit_file',
    input: (session) => ({ path: session.item.manifest.entry.file, old_string: 'export function (', new_string: 'export function ' }),
  },
  { tool: 'check_preview', input: {} },
  {
    tool: 'set_params',
    input: (session) => {
      const color = session.item.manifest.params.find((param) => param.type === 'color')
      return { values: color ? { [color.key]: '#22d3ee' } : {} }
    },
  },
  { tool: 'finish', input: { summary: 'Scripted run finished: fixed a compile error and tuned a colour.' } },
]

let callId = 0

/** 按脚本回放工具调用的运行器：测试和 e2e 用，不需要模型或网络。 */
export function scriptedRunner(script: ScriptStep[] = DEFAULT_SCRIPT): AgentRunner {
  return {
    id: 'scripted',
    async run({ session, signal, emit, state }) {
      for (const step of script) {
        if (signal.aborted) throw new Error('aborted')
        if ('say' in step) {
          emit({ type: 'text', delta: step.say })
          continue
        }
        const input = typeof step.input === 'function' ? step.input(session) : step.input
        const id = `script-${++callId}`
        emit({ type: 'tool-call', id, name: step.tool, input })
        const output = await callTool(session, step.tool, input)
        emit({ type: 'tool-result', id, name: step.tool, output: output.text, isError: output.isError ?? false })
      }
      return { state: (typeof state === 'number' ? state : 0) + 1 }
    },
  }
}
