import type { ClientAction } from './events'

/**
 * 在浏览器里上报一次使用（排行榜用，docs/decisions/0010-motion-cursor-ranking.md）。
 * 用 sendBeacon：不占主线程，页面跳走了也能送达；上报失败不影响任何功能。去重由服务端做。
 */
export function reportStat(slug: string, action: ClientAction): void {
  if (typeof navigator === 'undefined') return
  const body = JSON.stringify({ slug, action })
  try {
    if (navigator.sendBeacon('/api/stats', new Blob([body], { type: 'application/json' }))) return
  } catch {
    // 有的浏览器扩展会拦掉 sendBeacon，退回 fetch。
  }
  fetch('/api/stats', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => undefined)
}
