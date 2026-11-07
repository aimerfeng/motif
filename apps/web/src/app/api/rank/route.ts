import { KINDS, type Kind } from '@motif/schema/core'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { RANK_BOARDS, RANK_PERIODS, STATS_SINCE, type RankBoard, type RankPeriod } from '@/lib/stats/events'
import { leaderboard } from '@/lib/stats/board'

const pick = <T extends string>(value: string | null, options: readonly T[], fallback: T): T => (value !== null && (options as readonly string[]).includes(value) ? (value as T) : fallback)

/**
 * 排行榜的数据（首页的「本周热门」在浏览器里取，首页本身保持静态）。
 * ?period=7d|30d|all &board=score|favorite|take &kind=<层级> &limit=1..50 &locale=zh-CN|en
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const locale = params.get('locale')
  const kind = params.get('kind')
  const limit = Math.min(50, Math.max(1, Number.parseInt(params.get('limit') ?? '10', 10) || 10))
  const board = await leaderboard({
    period: pick<RankPeriod>(params.get('period'), RANK_PERIODS, '7d'),
    board: pick<RankBoard>(params.get('board'), RANK_BOARDS, 'score'),
    kind: kind !== null && (KINDS as readonly string[]).includes(kind) ? (kind as Kind) : null,
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    limit,
  })
  return Response.json({ since: STATS_SINCE, ...board }, { headers: { 'Cache-Control': 'public, max-age=60' } })
}
