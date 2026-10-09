import { CATEGORIES_BY_KIND, KINDS, type Category, type Kind } from '@motif/schema/core'

/** 市场的筛选状态，和链接里的 ?kind=&category=&q= 一一对应，服务端和浏览器共用这一份解析。 */
export interface MarketQuery {
  kind: Kind | null
  category: Category | null
  q: string
}

export const EMPTY_QUERY: MarketQuery = { kind: null, category: null, q: '' }

const MAX_QUERY_LENGTH = 80

/** 链接可能被手改：不认识的层级、不属于该层级的分类都当作没选。 */
export function parseMarketQuery(get: (key: string) => string | null | undefined): MarketQuery {
  const kind = get('kind')
  const category = get('category')
  const validKind = (KINDS as readonly string[]).includes(kind ?? '') ? (kind as Kind) : null
  const validCategory = validKind && (CATEGORIES_BY_KIND[validKind] as readonly string[]).includes(category ?? '') ? (category as Category) : null
  return { kind: validKind, category: validCategory, q: (get('q') ?? '').slice(0, MAX_QUERY_LENGTH) }
}

export function writeMarketQuery(url: URL, query: MarketQuery) {
  const entries = { kind: query.kind, category: query.category, q: query.q.trim() || null }
  for (const [key, value] of Object.entries(entries)) {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }
}
