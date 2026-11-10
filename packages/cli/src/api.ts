import { CliError, keyFor, VERSION, type Context } from './context.ts'

interface RequestOptions {
  body?: unknown
  /** 不给就用这个站点存下的密钥；null 是明确不带。 */
  key?: string | null
}

/** 调站点的 JSON 接口。站点的错误都是 { error: "…" }，原样告诉用户。 */
export async function http<T>(context: Context, method: string, pathname: string, options: RequestOptions = {}): Promise<T> {
  const key = options.key === undefined ? keyFor(context.origin) : options.key
  let response: Response
  try {
    response = await fetch(`${context.origin}${pathname}`, {
      method,
      headers: {
        accept: 'application/json',
        'user-agent': `motif-cli/${VERSION}`,
        ...(options.body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(key ? { authorization: `Bearer ${key}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (cause) {
    const reason = cause instanceof Error ? ((cause.cause as Error | undefined)?.message ?? cause.message) : String(cause)
    throw new CliError(`cannot reach ${context.origin} (${reason})`)
  }
  const text = await response.text()
  let payload: unknown = null
  try {
    payload = JSON.parse(text)
  } catch {
    // 不是 JSON（比如反向代理的错误页）：下面按状态码报错。
  }
  if (!response.ok) {
    if (response.status === 401) throw new CliError(key ? 'the saved API key is not valid any more' : 'not signed in: this needs an API key', 'run: motif login', 401)
    const message = payload && typeof payload === 'object' && typeof (payload as { error?: unknown }).error === 'string' ? (payload as { error: string }).error : `HTTP ${response.status}`
    throw new CliError(message, response.status === 402 ? `buy credits at ${context.origin}/pricing` : undefined, response.status)
  }
  return payload as T
}

export interface ToolImage {
  data: string
  mediaType: string
}

/** 调商店的一个工具（和 MCP 里的是同一批，定义在站点的 lib/store/tools.ts）。 */
export async function callTool<T>(context: Context, name: string, input: Record<string, unknown>): Promise<{ data: T; images?: ToolImage[] }> {
  return http(context, 'POST', `/api/agent/${encodeURIComponent(name)}`, { body: input })
}
