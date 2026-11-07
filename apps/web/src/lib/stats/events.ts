/*
 * 排行榜统计的事件和权重（docs/decisions/0010-motion-cursor-ranking.md）。浏览器和服务端共用，不能引用 node 模块。
 *
 * - view：打开条目详情页
 * - copy：复制安装命令、代码或 Skill
 * - favorite：收藏（取消收藏记成 −1）
 * - take：拿走（shadcn 安装、下载 zip、积分解锁、MCP 交付）
 * - remix：改编（在工作台打开、fork 成仓库）
 */
export const STAT_EVENTS = ['view', 'copy', 'favorite', 'take', 'remix'] as const
export type StatEvent = (typeof STAT_EVENTS)[number]

/** 浏览器可以上报的动作。unfavorite 记在 favorite 上（−1）；remix 只由服务端记（打开工作台、fork 都经过服务端）。 */
export const CLIENT_ACTIONS = ['view', 'copy', 'favorite', 'unfavorite', 'take'] as const
export type ClientAction = (typeof CLIENT_ACTIONS)[number]

/** 综合分的权重：真正用上了（拿走、改编）比看一眼重得多。 */
export const SCORE_WEIGHTS: Record<StatEvent, number> = { view: 1, copy: 3, favorite: 4, take: 6, remix: 5 }

export type StatCounts = Record<StatEvent, number>

export const emptyCounts = (): StatCounts => ({ view: 0, copy: 0, favorite: 0, take: 0, remix: 0 })

export function scoreOf(counts: StatCounts): number {
  let score = 0
  for (const event of STAT_EVENTS) score += Math.max(0, counts[event]) * SCORE_WEIGHTS[event]
  return score
}

/** 榜单：综合分、收藏最多、拿走最多。 */
export const RANK_BOARDS = ['score', 'favorite', 'take'] as const
export type RankBoard = (typeof RANK_BOARDS)[number]

export const RANK_PERIODS = ['7d', '30d', 'all'] as const
export type RankPeriod = (typeof RANK_PERIODS)[number]

export const PERIOD_DAYS: Record<RankPeriod, number | null> = { '7d': 7, '30d': 30, all: null }

/** 统计开始的日子（页面上写明，之前的使用没有记录）。 */
export const STATS_SINCE = '2026-11-07'
