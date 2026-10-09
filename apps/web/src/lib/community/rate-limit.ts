import { HttpError } from './http'

/*
 * 社区写接口的简单限流：按来源 IP 的固定窗口计数，进程内存里记账。
 * 只能挡住随手的刷接口（每次投稿预检都要编译，托管文字会写磁盘）；多实例部署要换成共享存储里的限流，见 docs/deploy-community.md。
 */

interface Window {
  start: number
  count: number
}

const WINDOW_MS = 60_000
const windows = ((globalThis as { __motifRateLimit?: Map<string, Window> }).__motifRateLimit ??= new Map())

function clientKey(request: Request): string {
  // 站点放在反向代理后面时由代理填这两个头；本地开发没有，统一算作一个来源。
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || 'local'
}

/** 超过每分钟 limit 次就抛 429。scope 区分不同的接口，各自计数。 */
export function rateLimit(request: Request, scope: string, limit: number): void {
  const key = `${scope}:${clientKey(request)}`
  const now = Date.now()
  const window = windows.get(key)
  if (!window || now - window.start > WINDOW_MS) {
    windows.set(key, { start: now, count: 1 })
    // 顺手清理过期的窗口，防止表无限增长。
    if (windows.size > 10_000) for (const [entry, value] of windows) if (now - value.start > WINDOW_MS) windows.delete(entry)
    return
  }
  window.count += 1
  if (window.count > limit) throw new HttpError(429, 'too many requests; try again in a minute')
}
