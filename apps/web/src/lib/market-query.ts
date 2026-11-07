import { CATEGORIES_BY_KIND, KINDS, type Category, type Kind } from '@motif/schema/core'

/** 市场的筛选状态，和链接里的 ?kind=&category=&q=&sort= 一一对应，服务端和浏览器共用这一份解析。 */
export const MARKET_SORTS = ['featured', 'hot', 'new'] as const
export type MarketSort = (typeof MARKET_SORTS)[number]

export interface MarketQuery {
  kind: Kind | null
  category: Category | null
  q: string
  /** featured：精选顺序（默认，不写进链接）；hot：本周排行榜的综合分（docs/decisions/0010）；new：最新上架的在前。 */
  sort: MarketSort
}

export const EMPTY_QUERY: MarketQuery = { kind: null, category: null, q: '', sort: 'featured' }

const MAX_QUERY_LENGTH = 80

/** 链接可能被手改：不认识的层级、不属于该层级的分类都当作没选。 */
export function parseMarketQuery(get: (key: string) => string | null | undefined): MarketQuery {
  const kind = get('kind')
  const category = get('category')
  const validKind = (KINDS as readonly string[]).includes(kind ?? '') ? (kind as Kind) : null
  const validCategory = validKind && (CATEGORIES_BY_KIND[validKind] as readonly string[]).includes(category ?? '') ? (category as Category) : null
  return { kind: validKind, category: validCategory, q: (get('q') ?? '').slice(0, MAX_QUERY_LENGTH), sort: (MARKET_SORTS as readonly string[]).includes(get('sort') ?? '') ? (get('sort') as MarketSort) : 'featured' }
}

export function writeMarketQuery(url: URL, query: MarketQuery) {
  const entries = { kind: query.kind, category: query.category, q: query.q.trim() || null, sort: query.sort === 'featured' ? null : query.sort }
  for (const [key, value] of Object.entries(entries)) {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }
}
