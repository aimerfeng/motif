import { homedir } from 'node:os'
import path from 'node:path'
import { createSdkMcpServer, query, tool } from '@anthropic-ai/claude-agent-sdk'
import { callTool, TOOLS, type AgentRunner } from '@motif/agent'

/*
 * 开发期运行器：用本机 Claude Code CLI（Sonnet 5.5）驱动 Studio 的工具，不调用付费 API。
 * Agent SDK 是专有许可证，只能在开发机上用：这个包不进生产依赖，站点按 MOTIF_AGENT_PROVIDER 动态加载它。
 * 选项的来由见 docs/decisions/0003-claude-cli-dev-runner.md。
 */

const SERVER = 'motif'
const PREFIX = `mcp__${SERVER}__`

export interface ClaudeCliOptions {
  /** claude.exe 的路径；Windows 上要用正斜杠。默认 ~/.local/bin/claude(.exe)。 */
  executable?: string
  model?: string
}

export function defaultExecutable(): string {
  return path.join(homedir(), '.local', 'bin', process.platform === 'win32' ? 'claude.exe' : 'claude').replaceAll('\\', '/')
}

/** 续接状态是 CLI 的会话 id：下一轮用 resume 接上，模型能看到之前的全部工具调用。 */
export function claudeCliRunner(options: ClaudeCliOptions = {}): AgentRunner {
  const executable = options.executable ?? defaultExecutable()
  const model = options.model ?? 'claude-sonnet-5-5'

  return {
    id: 'claude-cli',
    async run({ prompt, system, session, state, signal, emit }) {
      const server = createSdkMcpServer({
        name: SERVER,
        tools: TOOLS.map((spec) =>
          tool(spec.name, spec.description, spec.input.shape, async (args: unknown) => {
            const output = await callTool(session, spec.name, args)
            const images = (output.images ?? []).map((image) => ({ type: 'image' as const, data: image.data, mimeType: image.mediaType }))
            return { content: [{ type: 'text' as const, text: output.text }, ...images], isError: output.isError ?? false }
          }),
        ),
      })
      const abortController = new AbortController()
      const abort = () => abortController.abort()
      signal.addEventListener('abort', abort)

      let sessionId = typeof state === 'string' ? state : undefined
      try {
        const messages = query({
          prompt,
          options: {
            model,
            pathToClaudeCodeExecutable: executable,
            mcpServers: { [SERVER]: server },
            tools: [],
            allowedTools: TOOLS.map((spec) => `${PREFIX}${spec.name}`),
            permissionMode: 'dontAsk',
            systemPrompt: system,
            // 读 ~/.claude/settings.json 的 env：本机网关代理和证书在那里。
            settingSources: ['user'],
            strictMcpConfig: true,
            includePartialMessages: true,
            abortController,
            ...(sessionId ? { resume: sessionId } : {}),
          },
        })

        for await (const message of messages) {
          switch (message.type) {
            case 'system':
              if (message.subtype === 'init') sessionId = message.session_id
              break
            case 'stream_event': {
              const event = message.event
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') emit({ type: 'text', delta: event.delta.text })
              break
            }
            case 'assistant':
              for (const block of message.message.content) {
                if (block.type === 'tool_use') emit({ type: 'tool-call', id: block.id, name: block.name.replace(PREFIX, ''), input: block.input })
              }
              break
            case 'user': {
              const content = message.message.content
              if (typeof content === 'string') break
              for (const block of content) {
                if (block.type !== 'tool_result') continue
                const raw = typeof block.content === 'string' ? block.content : (block.content ?? []).map((part) => (part.type === 'text' ? part.text : '')).join('')
                // CLI 把工具结果里的图片换成一段带本机路径的占位文字，对话记录里不需要它。
                const text = raw.replace(/\[Image: source: [^\]]*\]/g, '').trim()
                emit({ type: 'tool-result', id: block.tool_use_id, name: '', output: text, isError: block.is_error ?? false })
              }
              break
            }
            case 'result':
              emit({ type: 'usage', inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens })
              if (message.subtype !== 'success') throw new Error(`Claude CLI stopped: ${message.subtype}${'errors' in message ? ` ${message.errors.join('; ')}` : ''}`)
              break
            default:
              break
          }
        }
      } finally {
        signal.removeEventListener('abort', abort)
      }
      return { state: sessionId }
    },
  }
}
