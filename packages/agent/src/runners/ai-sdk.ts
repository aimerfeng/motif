import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { isStepCount, tool, ToolLoopAgent, type LanguageModel, type ModelMessage, type PrepareStepFunction, type ToolSet } from 'ai'
import { callTool, type AgentRunner } from '../runner.ts'
import type { AgentSession } from '../session.ts'
import { TOOLS, type ToolOutput } from '../tools.ts'

/** vision：模型能不能看图。看不了的（例如 deepseek-v4-pro）不给截图工具，否则图被丢掉，模型对着空白推理。 */
export type ModelConfig =
  | { provider: 'anthropic'; apiKey: string; model: string; baseURL?: string; vision: boolean }
  | { provider: 'openai-compatible'; apiKey: string; model: string; baseURL: string; vision: boolean }

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
  const vision = !/^(0|false|off|no)$/i.test(env.MOTIF_AGENT_VISION?.trim() ?? '')
  if (!apiKey || !model) return null
  if (provider === 'anthropic') return { provider, apiKey, model, vision, ...(baseURL ? { baseURL } : {}) }
  if (provider === 'openai-compatible' && baseURL) return { provider, apiKey, model, baseURL, vision }
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
          return { type: 'content', value: [{ type: 'text', text: result.text }, ...result.images.map((image) => ({ type: 'file' as const, mediaType: image.mediaType, data: { type: 'data' as const, data: image.data } }))] }
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
      { role: 'user', content: [{ type: 'text', text: 'Screenshots from look_at_preview:' }, ...images.map((image) => ({ type: 'file' as const, mediaType: image.mediaType, data: image.data }))] },
    ],
  }
}

/** 历史里旧工具结果最多留多少字（读文件的输出动辄几万字，早就被后面的改动取代了）。 */
const OLD_TOOL_OUTPUT_CHARS = 1_500
/** 历史的总字数上限（约等于 10 万 token）。超过就丢最早的几轮。 */
const HISTORY_CHARS = 400_000

function trimText(value: string): string {
  return value.length > OLD_TOOL_OUTPUT_CHARS ? `${value.slice(0, OLD_TOOL_OUTPUT_CHARS)}… [trimmed; read the file again if you need the rest]` : value
}

/** 工具结果瘦身：截图换成一句话（存下来的历史里不带图片），旧的长文本截断。 */
function compactToolOutput(output: unknown, trim: boolean): unknown {
  if (typeof output !== 'object' || output === null) return output
  const result = output as { type?: string; value?: unknown }
  if ((result.type === 'text' || result.type === 'error-text') && typeof result.value === 'string') return trim ? { ...result, value: trimText(result.value) } : result
  if (result.type === 'content' && Array.isArray(result.value)) {
    const parts = result.value as { type?: string; text?: string }[]
    return {
      ...result,
      value: parts.map((part) => (part.type === 'text' && typeof part.text === 'string' ? (trim ? { ...part, text: trimText(part.text) } : part) : { type: 'text', text: '[screenshot omitted]' })),
    }
  }
  return result
}

/**
 * 跨轮保存的历史要控制大小：每一步都把整段历史发给模型，历史越长每步越贵，最后还会超出上下文窗口。
 * 截图一律不留；这一轮之前的长工具输出截断；还是太长就从最早的一轮丢起（至少留最近一轮），并在留下的第一条用户消息里说明。
 */
export function compactHistory(history: ModelMessage[]): ModelMessage[] {
  const turnStarts = history.flatMap((message, index) => (message.role === 'user' && typeof message.content === 'string' ? [index] : []))
  const lastTurn = turnStarts.at(-1) ?? 0
  const compacted: ModelMessage[] = history.map((message, index) => {
    if (message.role === 'tool') {
      return { ...message, content: message.content.map((part) => (part.type === 'tool-result' ? { ...part, output: compactToolOutput(part.output, index < lastTurn) as typeof part.output } : part)) }
    }
    if (message.role === 'user' && Array.isArray(message.content)) {
      return { ...message, content: message.content.map((part) => (part.type === 'text' ? part : { type: 'text' as const, text: '[screenshot omitted]' })) }
    }
    return message
  })
  // 从一轮的开头切（用户消息处），工具调用和它的结果不会被拆开。
  let cut = 0
  while (JSON.stringify(compacted.slice(cut)).length > HISTORY_CHARS) {
    const next = turnStarts.find((start) => start > cut && start <= lastTurn)
    if (next === undefined) break
    cut = next
  }
  const kept = compacted.slice(cut)
  const first = kept[0]
  if (cut > 0 && first?.role === 'user' && typeof first.content === 'string') {
    return [{ ...first, content: `(Earlier turns of this conversation were dropped to save space. Read the files again before relying on what you remember.)\n\n${first.content}` }, ...kept.slice(1)]
  }
  return kept
}

export interface AiSdkRunnerOptions {
  maxSteps?: number
  /** 模型接口能否在工具结果里接收图片：Anthropic 原生接口可以，OpenAI 兼容接口不行。 */
  imagesInToolResults?: boolean
}

/**
 * 生产用的运行器：AI SDK 的 ToolLoopAgent。续接状态就是历史消息（不含系统提示词），
 * 每轮末尾把这一轮的响应消息接上去。finish 成功（条目通过检查）或步数用完时停下；条目有错时 finish 会被拒绝，循环继续。
 */
export function aiSdkRunner(model: LanguageModel, options: AiSdkRunnerOptions = {}): AgentRunner {
  const maxSteps = options.maxSteps ?? 40
  const imagesInToolResults = options.imagesInToolResults ?? true
  return {
    id: 'ai-sdk',
    async run({ prompt, system, session, state, signal, emit }) {
      const history = Array.isArray(state) ? compactHistory(state as ModelMessage[]) : []
      const messages: ModelMessage[] = [...history, { role: 'user', content: prompt }]
      // 一轮要调用几十次模型：网络抖一下（连接超时）不该让整轮失败。退避从 2 秒起翻倍，5 次能扛过约一分钟的中断。
      const agent = new ToolLoopAgent({ model, instructions: system, tools: toolSet(session, imagesInToolResults), stopWhen: [isStepCount(maxSteps), () => session.finished !== null], maxRetries: 5, ...(imagesInToolResults ? {} : { prepareStep: screenshotsAsUserMessage }) })
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
      // 存下来的历史先瘦身（去掉截图、截断旧输出），下一轮发给模型的就是它。
      return { state: compactHistory([...messages, ...(await result.responseMessages)]) }
    },
  }
}

/** 用站点内置模型跑 agent：只有 Anthropic 原生接口能在工具结果里收图片。 */
export function modelRunner(config: ModelConfig, options: Omit<AiSdkRunnerOptions, 'imagesInToolResults'> = {}): AgentRunner {
  return aiSdkRunner(createModel(config), { ...options, imagesInToolResults: config.provider === 'anthropic' })
}
