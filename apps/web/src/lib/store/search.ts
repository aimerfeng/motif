import type { ItemManifest } from '@motif/schema'
import { marketOrder } from '../featured'

/** 商店里能买的东西：目录里的开源条目，和审核通过的社区作品（作者可以分成）。 */
export interface Listing {
  manifest: ItemManifest
  source: 'catalog' | 'community'
  /** 社区作品的作者地址；目录条目为 null。 */
  author: `0x${string}` | null
}

export interface SearchQuery {
  query?: string
  kind?: string
  category?: string
  limit: number
}

/**
 * 按需求搜索：每个词都要在某处出现（且），标题和标签里出现的排在前面；分数相同时按市场的精选顺序。
 * agent 多半用英文描述需求，中英文的标题和摘要都参与匹配。
 */
export function searchListings(listings: Listing[], { query = '', kind, category, limit }: SearchQuery): Listing[] {
  const terms = query.toLowerCase().split(/[\s,，]+/).filter(Boolean)
  const scored: { listing: Listing; score: number }[] = []
  for (const listing of listings) {
    const { manifest } = listing
    if (kind && manifest.kind !== kind) continue
    if (category && manifest.category !== category) continue
    const title = `${manifest.title.en} ${manifest.title['zh-CN']} ${manifest.slug}`.toLowerCase()
    const tags = [...manifest.tags, manifest.kind, manifest.category].join(' ').toLowerCase()
    const body = `${manifest.summary.en} ${manifest.summary['zh-CN']} ${manifest.guidance?.use?.join(' ') ?? ''}`.toLowerCase()
    let score = 0
    let matchesAll = true
    for (const term of terms) {
      const weight = (title.includes(term) ? 3 : 0) + (tags.includes(term) ? 2 : 0) + (body.includes(term) ? 1 : 0)
      if (weight === 0) {
        matchesAll = false
        break
      }
      score += weight
    }
    if (matchesAll) scored.push({ listing, score })
  }
  return scored
    .sort((a, b) => b.score - a.score || marketOrder(a.listing.manifest, b.listing.manifest))
    .slice(0, limit)
    .map(({ listing }) => listing)
}
