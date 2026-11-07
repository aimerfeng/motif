import type { Kind } from '@motif/schema/core'
import type { Locale } from '@/i18n/routing'
import { authReady } from '@/lib/auth/server'
import { getPublishedItems, summarize, type ItemSummary } from '@/lib/catalog'
import { communitySummaries } from '@/lib/community/summaries'
import { getCommunity } from '@/lib/community/state'
import { FEATURED, marketOrder } from '@/lib/featured'
import type { RankBoard, RankPeriod } from './events'
import { rankItems, weeklyRanks, type RankEntry } from './ranking'

/** 市场里现有的全部条目（目录在前，按精选顺序；社区作品接在后面）。排行榜只排还在市场里的条目。 */
export async function marketSummaries(locale: Locale): Promise<ItemSummary[]> {
  const catalog = (await getPublishedItems()).map((item) => summarize(item, locale)).sort(marketOrder)
  let community: ItemSummary[] = []
  try {
    community = await communitySummaries(await getCommunity(), locale)
  } catch {
    // 社区链连不上时只排目录条目。
  }
  return [...catalog, ...community]
}

export interface LeaderEntry extends RankEntry {
  item: ItemSummary
}

export interface Leaderboard {
  entries: LeaderEntry[]
  /** 上榜的不到 10 个时，接在后面的精选（不是排名，只是推荐）。 */
  picks: ItemSummary[]
}

const MIN_ENTRIES = 10

export async function leaderboard({ period, board, kind, locale, limit = 50 }: { period: RankPeriod; board: RankBoard; kind: Kind | null; locale: Locale; limit?: number }): Promise<Leaderboard> {
  const items = await marketSummaries(locale)
  const bySlug = new Map(items.map((item) => [item.slug, item]))
  const order = new Map(items.map((item, index) => [item.slug, index]))
  await authReady()
  const entries = rankItems({
    period,
    board,
    limit,
    include: (slug) => {
      const item = bySlug.get(slug)
      return item !== undefined && (kind === null || item.kind === kind)
    },
    tieBreak: (a, b) => (order.get(a) ?? Infinity) - (order.get(b) ?? Infinity),
  }).map((entry) => ({ ...entry, item: bySlug.get(entry.slug)! }))

  const ranked = new Set(entries.map((entry) => entry.slug))
  const picks =
    entries.length >= MIN_ENTRIES
      ? []
      : FEATURED.map((slug) => bySlug.get(slug))
          .filter((item): item is ItemSummary => item !== undefined && !ranked.has(item.slug) && (kind === null || item.kind === kind))
          .slice(0, 6)
  return { entries, picks }
}

/** 本周综合榜的名次：市场的「热门」排序和卡片上的名次标记。数据库出问题时返回空表，市场照常能用。 */
export async function weeklyRankMap(slugs: Iterable<string>): Promise<Record<string, number>> {
  try {
    const known = new Set(slugs)
    await authReady()
    return Object.fromEntries(weeklyRanks((slug) => known.has(slug)))
  } catch (error) {
    console.error('[stats] weekly ranks unavailable', error)
    return {}
  }
}
