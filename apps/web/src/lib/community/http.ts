/** 社区接口的小工具：限制请求体大小、统一错误格式。 */

const MAX_BODY_BYTES = 2_000_000

export class HttpError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** 读取 JSON 请求体。不信任 Content-Length，边读边数字节，超过上限立刻中止，不把整个请求体读进内存。 */
export async function readJson(request: Request): Promise<unknown> {
  const chunks: Uint8Array[] = []
  let size = 0
  const reader = request.body?.getReader()
  while (reader) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_BODY_BYTES) {
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
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status })
  console.error('[community]', error)
  return Response.json({ error: 'internal error' }, { status: 500 })
}

export const NO_STORE = { 'Cache-Control': 'no-store' }
