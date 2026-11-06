/*
 * 浏览器调站点接口的小工具：JSON 进、JSON 出，出错时抛 ApiError（带状态码和接口给的 code，例如积分不够、要补 GitHub 授权）。
 */

export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly details: Record<string, unknown>
  constructor(status: number, message: string, details: Record<string, unknown>) {
    super(message)
    this.status = status
    this.code = typeof details.code === 'string' ? details.code : null
    this.details = details
  }
}

export async function api<T>(url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(url, {
    method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
    headers: init.body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  })
  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok) throw new ApiError(response.status, typeof json.error === 'string' ? json.error : response.statusText, json)
  return json as T
}

export const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error))
