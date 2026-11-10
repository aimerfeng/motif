import readline from 'node:readline'
import { keyFor, note, VERSION, type Context } from './context.ts'

/*
 * `motif mcp`：把站点的 MCP 服务（/mcp，Streamable HTTP）接成一个 stdio 服务。
 * 每个 coding agent 都会起 stdio 的 MCP 服务，但不是每个都能给 HTTP 服务配请求头；
 * 更要紧的是，这样 API 密钥只留在 ~/.motif/config.json，不用写进各个 agent 的配置文件（有些还会被提交进仓库）。
 * 站点那边是无状态的：一条消息一个请求，这里不需要维持会话。
 */

export interface UpstreamResponse {
  status: number
  contentType: string
  text: string
}

export type Upstream = (body: string) => Promise<UpstreamResponse>

interface RpcMessage {
  jsonrpc?: string
  id?: string | number | null
  method?: string
  result?: { protocolVersion?: string }
}

const isObject = (value: unknown): value is RpcMessage => typeof value === 'object' && value !== null && !Array.isArray(value)

/** 这条消息里等着回复的请求的 id（通知和回复没有）。 */
function requestIds(message: unknown): (string | number)[] {
  const messages = Array.isArray(message) ? message : [message]
  return messages.filter(isObject).flatMap((entry) => (typeof entry.method === 'string' && entry.id != null ? [entry.id] : []))
}

const rpcError = (id: string | number | null, code: number, message: string) => JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } })

/** SSE 回复里每个事件的 data 是一条 JSON-RPC 消息。 */
function sseMessages(text: string): string[] {
  return text
    .split(/\r?\n\r?\n/)
    .map((event) =>
      event
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n'),
    )
    .filter(Boolean)
}

/**
 * 转发 stdin 上的一行，返回要写到 stdout 的行（每行一条 JSON-RPC 消息）。
 * 出了任何错都要给等着的请求一个 JSON-RPC 错误：不回复的话 agent 会一直等到超时。
 */
export async function relay(line: string, upstream: Upstream): Promise<string[]> {
  let message: unknown
  try {
    message = JSON.parse(line)
  } catch {
    return [rpcError(null, -32700, 'Parse error')]
  }
  const waiting = requestIds(message)
  try {
    const response = await upstream(line)
    if (response.status === 202 || response.text.trim() === '') return []
    if (response.contentType.includes('text/event-stream')) return sseMessages(response.text).map((data) => JSON.stringify(JSON.parse(data)))
    const body: unknown = JSON.parse(response.text)
    const rpc = Array.isArray(body) || (isObject(body) && body.jsonrpc === '2.0')
    if (!rpc) throw new Error(isObject(body) && typeof (body as { error?: unknown }).error === 'string' ? (body as { error: string }).error : `HTTP ${response.status}`)
    // 重新序列化：stdio 传输一行一条消息，回复里不能有换行。
    return [JSON.stringify(body)]
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause)
    return waiting.map((id) => rpcError(id, -32000, `Motif is unreachable: ${reason}`))
  }
}

export async function runProxy(context: Context): Promise<void> {
  // initialize 协商出的协议版本，之后每个请求都要带（MCP 的 Streamable HTTP 规定）。
  let protocolVersion: string | undefined
  const upstream: Upstream = async (body) => {
    // 每次都重新读密钥：agent 开着的时候用户去跑了 motif login，不用重启 agent 就能生效。
    const key = keyFor(context.origin)
    const response = await fetch(`${context.origin}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        'user-agent': `motif-cli/${VERSION}`,
        ...(protocolVersion ? { 'mcp-protocol-version': protocolVersion } : {}),
        ...(key ? { authorization: `Bearer ${key}` } : {}),
      },
      body,
    })
    return { status: response.status, contentType: response.headers.get('content-type') ?? '', text: await response.text() }
  }

  note(`motif mcp ${VERSION} → ${context.origin}/mcp${keyFor(context.origin) ? '' : ' (not signed in: browsing works, buying needs "motif login")'}`)
  const pending = new Set<Promise<void>>()
  const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity })
  for await (const line of lines) {
    if (line.trim() === '') continue
    const task = relay(line, upstream).then((replies) => {
      for (const reply of replies) {
        const parsed = JSON.parse(reply) as RpcMessage
        if (parsed.result?.protocolVersion) protocolVersion = parsed.result.protocolVersion
        process.stdout.write(`${reply}\n`)
      }
    })
    pending.add(task)
    void task.finally(() => pending.delete(task))
  }
  // stdin 关了（agent 退出）：把还在路上的回复发完再走。
  await Promise.all(pending)
}
