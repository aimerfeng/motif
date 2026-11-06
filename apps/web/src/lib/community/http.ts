/** 社区接口的小工具：限制请求体大小、统一错误格式。 */

const MAX_BODY_BYTES = 2_000_000

export class HttpError extends Error {
  readonly status: number
  /** 给客户端的结构化信息（例如积分差多少），和错误说明一起返回。 */
  readonly details?: Record<string, unknown>
  constructor(status: number, message: string, details?: Record<string, unknown>) {
    super(message)
    this.status = status
    this.details = details
  }
}

/** 读取 JSON 请求体。不信任 Content-Length，边读边数字节，超过上限立刻中止，不把整个请求体读进内存。 */
export async function readJson(request: Request, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  const chunks: Uint8Array[] = []
  let size = 0
  const reader = request.body?.getReader()
  while (reader) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel()
      throw new HttpError(413, 'request body is too large')
    }
    chunks.push(value)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new HttpError(400, 'request body is not valid JSON')
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) return Response.json({ error: error.message, ...error.details }, { status: error.status })
  console.error('[community]', error)
  return Response.json({ error: 'internal error' }, { status: 500 })
}

export const NO_STORE = { 'Cache-Control': 'no-store' }
