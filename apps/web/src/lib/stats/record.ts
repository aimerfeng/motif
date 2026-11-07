import { createHmac } from 'node:crypto'
import { clientKey } from '@/lib/community/rate-limit'
import { one, run, transaction } from '@/lib/db'
import type { StatEvent } from './events'

/*
 * 记一次使用（docs/decisions/0010-motion-cursor-ranking.md）。表结构见 lib/db/migrations.ts（第 3 版）。
 * 调用方负责先 await authReady()（迁移由它统一安排）。
 */

const HOUR = 3_600_000

/** 统计日：按北京时间切天（站点的用户主要在国内，「今天」应该从他们的零点算起）。 */
export function statDay(now = Date.now()): string {
  return new Date(now + 8 * HOUR).toISOString().slice(0, 10)
}

/** day 往前（负数）或往后数 n 天。 */
export function dayOffset(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const BOT = /bot|crawl|spider|slurp|headless|lighthouse/i

/**
 * 同一个来源（地址）同一天对同一个条目的同一种操作，最多算几个不同的访客。UA 是客户端自己写的，
 * 不设上限的话换着 UA 就能刷；设成 1 又会把同一个网络（学校、公司）后面的很多人算成一个。
 */
export const MAX_VISITORS_PER_SOURCE = 5

function digest(day: string, source: string): string {
  // 盐是站点密钥加上日期：同一个人第二天就是另一个访客，表里的值还原不出 IP。
  return createHmac('sha256', process.env.MOTIF_AUTH_SECRET || 'motif-dev-stats')
    .update(`${day}\n${source}`)
    .digest('hex')
    .slice(0, 16)
}

/**
 * 匿名访客：「来源:浏览器」两段哈希。来源是地址（只信自己的反向代理，见 lib/community/rate-limit.ts），
 * 浏览器是地址加 UA。前一段用来给同一来源设上限。爬虫返回 null，不计。
 */
export function visitorOf(request: Request, day = statDay()): string | null {
  const agent = request.headers.get('user-agent') ?? ''
  if (BOT.test(agent)) return null
  const source = clientKey(request)
  return `${digest(day, `ip\n${source}`)}:${digest(day, `ua\n${source}\n${agent}`)}`
}

/** 登录用户（例如带 API 密钥的 MCP 调用）按账号去重：账号自己就是一个来源。 */
export function visitorOfUser(userId: string, day = statDay()): string {
  const id = digest(day, `user\n${userId}`)
  return `${id}:${id}`
}

let lastPurge = 0

/**
 * 计一次事件：同一访客、同一天、同一条目、同一动作只算一次；同一来源最多算 MAX_VISITORS_PER_SOURCE 个访客。
 * 取消收藏是单独的动作（un + 事件名），记在 favorite 上 −1。返回这次是否计入。
 */
export function recordStat({ slug, event, visitor, delta = 1, day = statDay() }: { slug: string; event: StatEvent; visitor: string; delta?: 1 | -1; day?: string }): boolean {
  const action = delta < 0 ? `un${event}` : event
  const source = visitor.slice(0, visitor.indexOf(':') + 1)
  const counted = transaction(() => {
    if (one('SELECT 1 FROM item_stat_seen WHERE day = ? AND slug = ? AND event = ? AND visitor = ?', day, slug, action, visitor)) return false
    // 同一来源的访客按前缀排在一起，在主键上做范围查询（「:」的下一个字符是「;」）。
    const sameSource = one<{ n: number }>(
      'SELECT COUNT(*) AS n FROM item_stat_seen WHERE day = ? AND slug = ? AND event = ? AND visitor >= ? AND visitor < ?',
      day,
      slug,
      action,
      source,
      `${source.slice(0, -1)};`,
    )!.n
    if (sameSource >= MAX_VISITORS_PER_SOURCE) return false
    run('INSERT INTO item_stat_seen (day, slug, event, visitor) VALUES (?, ?, ?, ?)', day, slug, action, visitor)
    run(
      'INSERT INTO item_stat_daily (day, slug, event, count) VALUES (?, ?, ?, ?) ON CONFLICT (day, slug, event) DO UPDATE SET count = count + excluded.count',
      day,
      slug,
      event,
      delta,
    )
    return true
  })
  // 去重只需要今天和昨天（跨零点的那一会儿），更早的每小时清一次。
  const now = Date.now()
  if (now - lastPurge > HOUR) {
    lastPurge = now
    run('DELETE FROM item_stat_seen WHERE day < ?', dayOffset(day, -1))
  }
  return counted
}
