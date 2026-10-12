import { HttpError } from './http'

/*
 * 写接口的限流：固定窗口计数，进程内存里记账。多实例部署要换成共享存储里的限流，见 docs/deploy-community.md。
 *
 * 来源 IP 只信任自己的反向代理：X-Forwarded-For 最左边那段是客户端自己能随便写的，拿它当键等于没有限流。
 * MOTIF_TRUSTED_PROXY_HOPS 是站点前面有几层自己的代理（例如 nginx 一层就是 1），取从右往左数第 N 段——
 * 那是最外层代理亲眼看到的地址。没配置时（本地开发、直接对外）拿不到可信的 IP，所有请求算同一个来源，
 * 限流退化成全站共用一个额度：宁可严一点，也不让人换个请求头就绕过去。
 */

interface Window {
  start: number
  count: number
}

const MINUTE = 60_000
const DAY = 86_400_000
const windows = ((globalThis as { __motifRateLimit?: Map<string, Window> }).__motifRateLimit ??= new Map())

function trustedHops(): number {
  const hops = Number.parseInt(process.env.MOTIF_TRUSTED_PROXY_HOPS ?? '', 10)
  return Number.isInteger(hops) && hops > 0 ? hops : 0
}

export function clientKey(request: Request): string {
  const hops = trustedHops()
  if (hops === 0) return 'all'
  const chain = (request.headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  return chain[chain.length - hops] ?? 'unknown'
}

function count(key: string, limit: number, windowMs: number, message: string): void {
  const now = Date.now()
  const window = windows.get(key)
  if (!window || now - window.start > windowMs) {
    windows.set(key, { start: now, count: 1 })
    // 表太大时顺手清掉过期的窗口（按天计的窗口留着）。
    if (windows.size > 10_000) for (const [entry, value] of windows) if (now - value.start > DAY) windows.delete(entry)
    return
  }
  window.count += 1
  if (window.count > limit) throw new HttpError(429, message)
}

/** 每个来源每分钟最多 limit 次，超过就抛 429。scope 区分不同的接口，各自计数。 */
export function rateLimit(request: Request, scope: string, limit: number): void {
  count(`${scope}:${clientKey(request)}`, limit, MINUTE, 'too many requests; try again in a minute')
}

/**
 * 全站每天最多 limit 次，不分来源：给要花钱的操作（跑模型、截图）兜底，
 * 就算有人握着很多 IP，一天的花费也有上限。
 */
export function dailyCap(scope: string, limit: number): void {
  count(`daily:${scope}`, limit, DAY, 'the daily capacity for this action is used up; try again tomorrow')
}
