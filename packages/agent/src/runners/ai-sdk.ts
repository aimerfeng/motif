import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { hasToolCall, isStepCount, tool, ToolLoopAgent, type LanguageModel, type ModelMessage, type PrepareStepFunction, type ToolSet } from 'ai'
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

/** 从环境变量读站点内置的模型（MOTIF_AGENT_*，见 apps/web/.env.example）；缺必填项时返回 null。 */
export function modelConfigFromEnv(env: Record<string, string | undefined>): ModelConfig | null {
  const provider = env.MOTIF_AGENT_PROVIDER?.trim()
  const apiKey = env.MOTIF_AGENT_API_KEY?.trim()
  const model = env.MOTIF_AGENT_MODEL?.trim()
  const baseURL = env.MOTIF_AGENT_BASE_URL?.trim() || undefined
  if (!apiKey || !model) return null
  if (provider === 'anthropic') return { provider, apiKey, model, ...(baseURL ? { baseURL } : {}) }
  if (provider === 'openai-compatible' && baseURL) return { provider, apiKey, model, baseURL }
  return null
}

function toolSet(session: AgentSession, imagesInToolResults: boolean): ToolSet {
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
          // 截图作为图片内容交给模型（look_at_preview）；接口不支持时改由下一条用户消息带上。
          if (!imagesInToolResults) return { type: 'text', value: `${result.text} The screenshots follow in the next message.` }
          return { type: 'content', value: [{ type: 'text', text: result.text }, ...result.images.map((image) => ({ type: 'file-data' as const, data: image.data, mediaType: image.mediaType }))] }
        },
      }),
    ]),
  )
}

/**
 * OpenAI 格式的工具消息只能放文字（中转站也不一定转换其中的图片）：
 * 截图改成紧跟在工具结果后面的一条用户消息。返回的 messages 会沿用到后面的步骤。
 */
const screenshotsAsUserMessage: PrepareStepFunction<ToolSet> = ({ steps, messages }) => {
  const images = (steps.at(-1)?.toolResults ?? []).flatMap((result) => (result.output as ToolOutput).images ?? [])
  if (images.length === 0) return undefined
  return {
    messages: [
      ...messages,
      { role: 'user', content: [{ type: 'text', text: 'Screenshots from look_at_preview:' }, ...images.map((image) => ({ type: 'image' as const, image: image.data, mediaType: image.mediaType }))] },
    ],
  }
}

export interface AiSdkRunnerOptions {
  maxSteps?: number
  /** 模型接口能否在工具结果里接收图片：Anthropic 原生接口可以，OpenAI 兼容接口不行。 */
  imagesInToolResults?: boolean
}

/**
 * 生产用的运行器：AI SDK 的 ToolLoopAgent。续接状态就是历史消息（不含系统提示词），
 * 每轮末尾把这一轮的响应消息接上去。调用 finish 或步数用完时停下。
 */
export function aiSdkRunner(model: LanguageModel, options: AiSdkRunnerOptions = {}): AgentRunner {
  const maxSteps = options.maxSteps ?? 40
  const imagesInToolResults = options.imagesInToolResults ?? true
  return {
    id: 'ai-sdk',
    async run({ prompt, system, session, state, signal, emit }) {
      const history = Array.isArray(state) ? (state as ModelMessage[]) : []
      const messages: ModelMessage[] = [...history, { role: 'user', content: prompt }]
      const agent = new ToolLoopAgent({ model, instructions: system, tools: toolSet(session, imagesInToolResults), stopWhen: [isStepCount(maxSteps), hasToolCall('finish')], ...(imagesInToolResults ? {} : { prepareStep: screenshotsAsUserMessage }) })
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

/** 用站点内置模型跑 agent：只有 Anthropic 原生接口能在工具结果里收图片。 */
export function modelRunner(config: ModelConfig, options: Omit<AiSdkRunnerOptions, 'imagesInToolResults'> = {}): AgentRunner {
  return aiSdkRunner(createModel(config), { ...options, imagesInToolResults: config.provider === 'anthropic' })
}
