import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { hasToolCall, isStepCount, tool, ToolLoopAgent, type LanguageModel, type ModelMessage, type ToolSet } from 'ai'
import { callTool, type AgentRunner } from '../runner.ts'
import type { AgentSession } from '../session.ts'
import { TOOLS, type ToolOutput } from '../tools.ts'

export type ModelConfig =
  | { provider: 'anthropic'; apiKey: string; model: string; baseURL?: string }
  | { provider: 'openai-compatible'; apiKey: string; model: string; baseURL: string }

/** 站点内置的模型：key 放在服务端环境变量里（见 apps/web/.env.example），由 provider 接口选择。 */
export function createModel(config: ModelConfig): LanguageModel {
  if (config.provider === 'anthropic') {
    return createAnthropic({ apiKey: config.apiKey, ...(config.baseURL ? { baseURL: config.baseURL } : {}) })(config.model)
  }
  return createOpenAICompatible({ name: 'motif', apiKey: config.apiKey, baseURL: config.baseURL, includeUsage: true }).chatModel(config.model)
}

function toolSet(session: AgentSession): ToolSet {
  return Object.fromEntries(
    TOOLS.map((spec) => [
      spec.name,
      tool({
        description: spec.description,
        inputSchema: spec.input,
        execute: (input): Promise<ToolOutput> => callTool(session, spec.name, input),
        toModelOutput: ({ output }) => {
          const result = output as ToolOutput
          if (result.isError) return { type: 'error-text', value: result.text }
          if (!result.images?.length) return { type: 'text', value: result.text }
          // 截图作为图片内容交给模型（look_at_preview）。
          return { type: 'content', value: [{ type: 'text', text: result.text }, ...result.images.map((image) => ({ type: 'file-data' as const, data: image.data, mediaType: image.mediaType }))] }
        },
      }),
    ]),
  )
}

/**
 * 生产用的运行器：AI SDK 的 ToolLoopAgent。续接状态就是历史消息（不含系统提示词），
 * 每轮末尾把这一轮的响应消息接上去。调用 finish 或步数用完时停下。
 */
export function aiSdkRunner(model: LanguageModel, options: { maxSteps?: number } = {}): AgentRunner {
  const maxSteps = options.maxSteps ?? 40
  return {
    id: 'ai-sdk',
    async run({ prompt, system, session, state, signal, emit }) {
      const history = Array.isArray(state) ? (state as ModelMessage[]) : []
      const messages: ModelMessage[] = [...history, { role: 'user', content: prompt }]
      const agent = new ToolLoopAgent({ model, instructions: system, tools: toolSet(session), stopWhen: [isStepCount(maxSteps), hasToolCall('finish')] })
      const result = await agent.stream({ messages, abortSignal: signal })

      for await (const part of result.stream) {
        switch (part.type) {
          case 'text-delta':
            emit({ type: 'text', delta: part.text })
            break
          case 'tool-call':
            emit({ type: 'tool-call', id: part.toolCallId, name: part.toolName, input: part.input })
            break
          case 'tool-result': {
            const output = part.output as ToolOutput
            emit({ type: 'tool-result', id: part.toolCallId, name: part.toolName, output: output.text, isError: output.isError ?? false })
            break
          }
          case 'tool-error':
            emit({ type: 'tool-result', id: part.toolCallId, name: part.toolName, output: String(part.error), isError: true })
            break
          case 'finish-step':
            emit({ type: 'usage', inputTokens: part.usage.inputTokens ?? 0, outputTokens: part.usage.outputTokens ?? 0 })
            break
          case 'error':
            throw part.error instanceof Error ? part.error : new Error(String(part.error))
          default:
            break
        }
      }
      return { state: [...messages, ...(await result.responseMessages)] }
    },
  }
}
