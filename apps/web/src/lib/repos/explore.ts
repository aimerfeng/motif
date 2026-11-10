import { all, one } from '@/lib/db'
import { dayOffset, statDay } from '@/lib/stats/record'
import { OWNER_JOIN, WITH_OWNER, type RepoWithOwner } from './repos'

/*
 * 社区栏目里不依赖链的那部分要的查询：公开仓库的搜索和分页、创作者榜、首页的几个数字。
 * 数据都在已有的 repo / profile / item_stat_daily 里，不加表、不加迁移。
 * 调用方负责先 await authReady()（迁移由它统一安排）。
 */

/**
 * 在社区里露出的仓库：公开，而且里面有文件——空仓库点进去没有东西可看，不算数。
 * 和 recentPublicRepos 是同一个条件，首页的数字、列表和搜索结果才对得上。
 */
const LISTED = `r.visibility = 'public' AND r.file_count > 0`

export const EXPLORE_SORTS = ['recent', 'forks'] as const
export type ExploreSort = (typeof EXPLORE_SORTS)[number]

export const EXPLORE_PAGE_SIZE = 24
export const CREATORS_PAGE_SIZE = 24
/** 搜索词的长度上限：再长也不会让结果更准，只会让 LIKE 更慢。 */
export const SEARCH_MAX = 80
/** 页面大小的上限：limit 来自调用方，不能让一次请求把整张表拉出来。 */
const MAX_PAGE_SIZE = 60
const MAX_TERMS = 5
/** 创作者卡片上列出的仓库数。 */
const TOP_REPOS = 3

export interface Paged<Row> {
  rows: Row[]
  total: number
  /** 实际返回的是第几页（超出范围的页码会被拉回最后一页）。 */
  page: number
  pages: number
  pageSize: number
}

const wholeNumber = (value: number, fallback: number): number => (Number.isFinite(value) ? Math.trunc(value) : fallback)

/** 页码拉回 [1, 总页数]：地址栏里的 ?page= 可以随便写，查询不能因此跑到几百万行之后去。 */
function paging(total: number, page: number, size: number): { page: number; pages: number; pageSize: number; offset: number } {
  const pageSize = Math.min(Math.max(1, wholeNumber(size, EXPLORE_PAGE_SIZE)), MAX_PAGE_SIZE)
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, wholeNumber(page, 1)), pages)
  return { page: current, pages, pageSize, offset: (current - 1) * pageSize }
}

/** LIKE 里的 % 和 _ 是通配符：搜「100%」「snake_case」要按字面找。配合 ESCAPE '\' 用。 */
export function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`)
}

/** 搜索词：按空白分开，每个词都要命中。开头的 @ 去掉（很多人会照着页面上的 @handle 输）。 */
export function searchTerms(q: string): string[] {
  return q
    .slice(0, SEARCH_MAX)
    .split(/\s+/)
    .map((term) => term.replace(/^@+/, ''))
    .filter((term) => term.length > 0)
    .slice(0, MAX_TERMS)
}

export interface ExploreQuery {
  q: string
  sort: ExploreSort
  page: number
}

type RawParam = string | string[] | undefined

const first = (value: RawParam): string | undefined => (Array.isArray(value) ? value[0] : value)

/** ?page= → 正整数；不是数字、小于 1 都当第一页。 */
export function parsePage(raw: RawParam): number {
  const text = first(raw) ?? ''
  if (!/^\d{1,9}$/.test(text)) return 1
  return Math.max(1, Number.parseInt(text, 10))
}

/** 地址栏里的参数 → 规范的查询。不认识的排序当默认值，页面上的链接和表单就不会带着坏参数传下去。 */
export function parseExploreQuery(params: { q?: RawParam; sort?: RawParam; page?: RawParam }): ExploreQuery {
  const q = (first(params.q) ?? '').trim().replace(/\s+/g, ' ').slice(0, SEARCH_MAX).trim()
  const sort = EXPLORE_SORTS.find((value) => value === first(params.sort)) ?? 'recent'
  return { q, sort, page: parsePage(params.page) }
}

const ORDER: Record<ExploreSort, string> = {
  // 末尾的 r.id 让同一毫秒更新的仓库次序稳定，翻页时不会重复或漏掉。
  recent: 'r.updated_at DESC, r.id',
  forks: 'r.fork_count DESC, r.updated_at DESC, r.id',
}

/**
 * 全部公开仓库：搜索（名字、描述、主人的 handle）、排序、分页。
 * 「handle/名字」拼在一起匹配，所以直接搜 ada/border-beam 也能找到。
 */
export function explorePublicRepos({ q = '', sort = 'recent', page = 1, pageSize = EXPLORE_PAGE_SIZE }: { q?: string; sort?: ExploreSort; page?: number; pageSize?: number } = {}): Paged<RepoWithOwner> {
  const where = [LISTED]
  const params: string[] = []
  for (const term of searchTerms(q)) {
    const pattern = `%${escapeLike(term)}%`
    where.push(`((p.handle || '/' || r.name) LIKE ? ESCAPE '\\' OR r.description LIKE ? ESCAPE '\\')`)
    params.push(pattern, pattern)
  }
  const condition = where.join(' AND ')
  const total = one<{ n: number }>(`SELECT COUNT(*) AS n FROM ${OWNER_JOIN} WHERE ${condition}`, ...params)?.n ?? 0
  const window = paging(total, page, pageSize)
  const rows =
    total === 0 ? [] : all<RepoWithOwner>(`${WITH_OWNER} WHERE ${condition} ORDER BY ${ORDER[sort] ?? ORDER.recent} LIMIT ? OFFSET ?`, ...params, window.pageSize, window.offset)
  return { rows, total, page: window.page, pages: window.pages, pageSize: window.pageSize }
}

export interface Creator {
  id: string
  handle: string
  name: string
  bio: string
  /** 公开仓库数。 */
  repos: number
  /** 这些仓库一共被 fork 了多少次。 */
  forks: number
  /** 最近一次更新公开仓库的时间（毫秒）。 */
  activeAt: number
  /** 在榜上的名次（跨页连续）。 */
  rank: number
  /** 最受欢迎的几个公开仓库，卡片上直接点得到。 */
  top: { slug: string; name: string }[]
}

type CreatorRow = Omit<Creator, 'rank' | 'top'>

/**
 * 创作者按「被 fork 的次数 → 公开仓库数 → 最近活跃」排：被别人拿去用最能说明做的东西有用，
 * 刚起步、还没人 fork 的站点上就按仓库数排，不会是一张全零的榜。
 */
function creatorRows(limit: number, offset: number): Creator[] {
  const rows = all<CreatorRow>(
    `SELECT u.id AS id, p.handle AS handle, u.name AS name, p.bio AS bio, COUNT(*) AS repos, SUM(r.fork_count) AS forks, MAX(r.updated_at) AS activeAt
     FROM ${OWNER_JOIN} WHERE ${LISTED}
     GROUP BY r.owner_id
     ORDER BY forks DESC, repos DESC, activeAt DESC, p.handle
     LIMIT ? OFFSET ?`,
    limit,
    offset,
  )
  if (rows.length === 0) return []
  // 每人最受欢迎的几个仓库：一条窗口查询取完，不按人循环查。
  const top = new Map<string, { slug: string; name: string }[]>()
  const picked = all<{ owner_id: string; slug: string; name: string }>(
    `SELECT owner_id, slug, name FROM (
       SELECT r.owner_id, r.slug, r.name, ROW_NUMBER() OVER (PARTITION BY r.owner_id ORDER BY r.fork_count DESC, r.updated_at DESC, r.id) AS position
       FROM repo r WHERE ${LISTED} AND r.owner_id IN (${rows.map(() => '?').join(', ')})
     ) WHERE position <= ? ORDER BY owner_id, position`,
    ...rows.map((row) => row.id),
    TOP_REPOS,
  )
  for (const { owner_id, slug, name } of picked) top.set(owner_id, [...(top.get(owner_id) ?? []), { slug, name }])
  return rows.map((row, index) => ({ ...row, repos: Number(row.repos), forks: Number(row.forks), rank: offset + index + 1, top: top.get(row.id) ?? [] }))
}

/** 首页的「活跃创作者」：榜上前几位。 */
export function topCreators(limit = 6): Creator[] {
  return creatorRows(Math.min(Math.max(1, wholeNumber(limit, 6)), MAX_PAGE_SIZE), 0)
}

/** 创作者名录：至少有一个公开仓库的人，分页。 */
export function listCreators({ page = 1, pageSize = CREATORS_PAGE_SIZE }: { page?: number; pageSize?: number } = {}): Paged<Creator> {
  const total = one<{ n: number }>(`SELECT COUNT(DISTINCT r.owner_id) AS n FROM ${OWNER_JOIN} WHERE ${LISTED}`)?.n ?? 0
  const window = paging(total, page, pageSize)
  const rows = total === 0 ? [] : creatorRows(window.pageSize, window.offset)
  return { rows, total, page: window.page, pages: window.pages, pageSize: window.pageSize }
}

export interface CommunityStats {
  /** 至少有一个公开仓库的人。 */
  creators: number
  /** 公开仓库。 */
  repos: number
  /** 公开仓库一共被 fork 的次数。 */
  forks: number
}

export function communityStats(): CommunityStats {
  const row = one<{ creators: number; repos: number; forks: number | null }>(
    `SELECT COUNT(DISTINCT r.owner_id) AS creators, COUNT(*) AS repos, SUM(r.fork_count) AS forks FROM ${OWNER_JOIN} WHERE ${LISTED}`,
  )
  return { creators: Number(row?.creators ?? 0), repos: Number(row?.repos ?? 0), forks: Number(row?.forks ?? 0) }
}

/**
 * 最近 7 天市场条目被用了多少次：复制、拿走、改编加在一起（浏览和收藏不算「用」）。
 * 窗口和排行榜的「本周」一致（含今天往前共 7 个统计日）。放在这里而不是 lib/stats：那边只管按条目排名，没有全站合计。
 */
export function weeklyUses(now = Date.now()): number {
  const from = dayOffset(statDay(now), -6)
  const row = one<{ total: number | null }>(`SELECT SUM(count) AS total FROM item_stat_daily WHERE day >= ? AND event IN ('copy', 'take', 'remix')`, from)
  return Math.max(0, Number(row?.total ?? 0))
}
