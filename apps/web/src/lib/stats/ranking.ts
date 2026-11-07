import { all } from '@/lib/db'
import { emptyCounts, PERIOD_DAYS, scoreOf, STAT_EVENTS, type RankBoard, type RankPeriod, type StatCounts, type StatEvent } from './events'
import { dayOffset, statDay } from './record'

/*
 * 排行榜的计算（docs/decisions/0010-motion-cursor-ranking.md）。数据量很小（天 × 条目 × 事件），每次请求现算。
 * 调用方负责先 await authReady()。
 */

export interface RankEntry {
  slug: string
  counts: StatCounts
  score: number
  /** 这个榜单比的那个数（综合分、净收藏数或拿走次数）。 */
  value: number
  rank: number
  /** 上一个同样长的时间段里的名次；没上榜是 null。「全部」没有上一段，也是 null。 */
  previousRank: number | null
  /** 最近 SERIES_DAYS 天每天的值（最早的在前），画走势用。 */
  series: number[]
}

export const SERIES_DAYS = 14

const isEvent = (value: string): value is StatEvent => (STAT_EVENTS as readonly string[]).includes(value)

/** [from, to] 两端都含；null 表示不限。 */
function totals(from: string | null, to: string | null): Map<string, StatCounts> {
  const where: string[] = []
  const params: string[] = []
  if (from) {
    where.push('day >= ?')
    params.push(from)
  }
  if (to) {
    where.push('day <= ?')
    params.push(to)
  }
  const rows = all<{ slug: string; event: string; total: number }>(
    `SELECT slug, event, SUM(count) AS total FROM item_stat_daily ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''} GROUP BY slug, event`,
    ...params,
  )
  const map = new Map<string, StatCounts>()
  for (const row of rows) {
    if (!isEvent(row.event)) continue
    const counts = map.get(row.slug) ?? emptyCounts()
    counts[row.event] = Number(row.total)
    map.set(row.slug, counts)
  }
  return map
}

function valueOf(board: RankBoard, counts: StatCounts): number {
  return board === 'score' ? scoreOf(counts) : Math.max(0, counts[board])
}

interface RankOptions {
  period: RankPeriod
  board: RankBoard
  /** 只排这些条目（还在市场里的、选中层级的）。 */
  include?: (slug: string) => boolean
  /** 同分时的次序（精选顺序），让名次稳定。 */
  tieBreak?: (a: string, b: string) => number
  limit?: number
  now?: number
}

function ranked(map: Map<string, StatCounts>, board: RankBoard, include: (slug: string) => boolean, tieBreak: (a: string, b: string) => number) {
  return [...map.entries()]
    .filter(([slug, counts]) => include(slug) && valueOf(board, counts) > 0)
    .map(([slug, counts]) => ({ slug, counts, value: valueOf(board, counts), score: scoreOf(counts) }))
    .sort((a, b) => b.value - a.value || b.score - a.score || tieBreak(a.slug, b.slug) || a.slug.localeCompare(b.slug))
}

/** 一张榜单：按值从高到低，值为 0 的不上榜。 */
export function rankItems({ period, board, include = () => true, tieBreak = () => 0, limit = 50, now = Date.now() }: RankOptions): RankEntry[] {
  const today = statDay(now)
  const days = PERIOD_DAYS[period]
  const from = days === null ? null : dayOffset(today, -(days - 1))
  const current = ranked(totals(from, null), board, include, tieBreak).slice(0, limit)

  const previousRanks = new Map<string, number>()
  if (from !== null && days !== null) {
    ranked(totals(dayOffset(from, -days), dayOffset(from, -1)), board, include, tieBreak).forEach((entry, index) => previousRanks.set(entry.slug, index + 1))
  }

  const seriesFrom = dayOffset(today, -(SERIES_DAYS - 1))
  const series = new Map(current.map((entry) => [entry.slug, Array.from({ length: SERIES_DAYS }, emptyCounts)]))
  if (current.length > 0) {
    const rows = all<{ day: string; slug: string; event: string; total: number }>(
      `SELECT day, slug, event, SUM(count) AS total FROM item_stat_daily WHERE day >= ? AND slug IN (${current.map(() => '?').join(', ')}) GROUP BY day, slug, event`,
      seriesFrom,
      ...current.map((entry) => entry.slug),
    )
    for (const row of rows) {
      const index = Math.round((Date.parse(`${row.day}T00:00:00Z`) - Date.parse(`${seriesFrom}T00:00:00Z`)) / 86_400_000)
      const bucket = series.get(row.slug)?.[index]
      if (bucket && isEvent(row.event)) bucket[row.event] = Number(row.total)
    }
  }

  return current.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    previousRank: previousRanks.get(entry.slug) ?? null,
    series: (series.get(entry.slug) ?? []).map((counts) => valueOf(board, counts)),
  }))
}

/** 本周综合榜的名次（slug → 名次），市场的「热门」排序和卡片上的名次标记用。 */
export function weeklyRanks(include?: (slug: string) => boolean, now = Date.now()): Map<string, number> {
  return new Map(rankItems({ period: '7d', board: 'score', include, limit: 1000, now }).map((entry) => [entry.slug, entry.rank]))
}
