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

/** agent 写需求时常带的虚词，不参与匹配。 */
const STOPWORDS = new Set(['a', 'an', 'the', 'for', 'with', 'and', 'or', 'of', 'to', 'in', 'on', 'my', 'our', 'me', 'i', 'we', 'need', 'want', 'some', 'that', 'which', 'like', 'something', 'ui', 'component', 'effect', 'nice', 'cool', 'simple', 'modern'])

/** 同一个东西的不同叫法，统一成目录里用的词。 */
const SYNONYMS: Record<string, string> = {
  spinner: 'loader',
  loading: 'loader',
  notification: 'toast',
  snackbar: 'toast',
  modal: 'dialog',
  popup: 'dialog',
  switch: 'toggle',
  bg: 'background',
  landing: 'template',
  homepage: 'hero',
  glowing: 'glow',
  animated: 'animation',
  animate: 'animation',
}

const CJK = /[㐀-鿿]/

/**
 * 需求 → 检索概念，每个概念是一组可以命中的片段。英文一个词一个概念：去掉虚词、复数还原、统一同义词。
 * 中文没有空格，整句当一个词几乎匹配不到：一段中文是一个概念，切成相邻两字（「发光边框卡片」→ 发光、光边、边框、框卡、卡片），
 * 命中任意片段就算命中这个概念，命中的片段越多分数越高。
 */
export function searchTerms(query: string, { stopwords = true }: { stopwords?: boolean } = {}): string[][] {
  const concepts = new Map<string, string[]>()
  for (const raw of query.toLowerCase().split(/[\s,，。、;；:：!?！？/|()（）"'“”]+/)) {
    if (!raw) continue
    if (CJK.test(raw)) {
      const chars = [...raw]
      const pieces = chars.length <= 2 ? [raw] : chars.slice(0, -1).map((char, index) => char + chars[index + 1]!)
      concepts.set(raw, [...new Set(pieces)])
      continue
    }
    // 市场页的搜索框里，人输入的 effect、component 是想按层级筛，不当虚词丢掉。
    if (stopwords && STOPWORDS.has(raw)) continue
    const singular = raw.length > 4 && raw.endsWith('es') && !raw.endsWith('ses') ? raw.slice(0, -2) : raw.length > 3 && raw.endsWith('s') && !raw.endsWith('ss') ? raw.slice(0, -1) : raw
    const term = SYNONYMS[singular] ?? singular
    concepts.set(term, [term])
  }
  return [...concepts.values()]
}

/**
 * 筛选用的匹配（市场页的搜索框）：每个概念都要命中；一段中文至少命中一半的两字片段（「发光卡片」→ 发光、卡片 就够，光卡 不必）。
 * haystack 是已经转成小写的文本。
 */
export function matchesAll(haystack: string, concepts: string[][]): boolean {
  return concepts.every((pieces) => pieces.filter((piece) => haystack.includes(piece)).length >= Math.ceil(pieces.length / 2))
}

/**
 * 按需求搜索：命中的词越多越靠前，标题里的命中比标签、摘要更重；至少要命中一半的词，免得一个虚词带出整个目录。
 * 分数相同时按市场的精选顺序。中英文的标题和摘要都参与匹配。
 */
export function searchListings(listings: Listing[], { query = '', kind, category, limit }: SearchQuery): Listing[] {
  const concepts = searchTerms(query)
  const needed = Math.max(1, Math.ceil(concepts.length / 2))
  const scored: { listing: Listing; matched: number; score: number }[] = []
  for (const listing of listings) {
    const { manifest } = listing
    if (kind && manifest.kind !== kind) continue
    if (category && manifest.category !== category) continue
    if (concepts.length === 0) {
      scored.push({ listing, matched: 0, score: 0 })
      continue
    }
    const title = `${manifest.title.en} ${manifest.title['zh-CN']} ${manifest.slug}`.toLowerCase()
    const tags = [...manifest.tags, manifest.kind, manifest.category].join(' ').toLowerCase()
    const body = `${manifest.summary.en} ${manifest.summary['zh-CN']} ${manifest.guidance?.use?.join(' ') ?? ''}`.toLowerCase()
    let matched = 0
    let score = 0
    for (const pieces of concepts) {
      let weight = 0
      for (const piece of pieces) weight += (title.includes(piece) ? 3 : 0) + (tags.includes(piece) ? 2 : 0) + (body.includes(piece) ? 1 : 0)
      if (weight > 0) {
        matched += 1
        score += weight
      }
    }
    if (matched >= needed) scored.push({ listing, matched, score })
  }
  return scored
    .sort((a, b) => b.matched - a.matched || b.score - a.score || marketOrder(a.listing.manifest, b.listing.manifest))
    .slice(0, limit)
    .map(({ listing }) => listing)
}

/** 搜不到时告诉 agent 目录里有哪些分类，让它换个说法或直接按分类找。 */
export function categoryOverview(listings: Listing[], kind?: string): { kind: string; category: string; count: number }[] {
  const counts = new Map<string, { kind: string; category: string; count: number }>()
  for (const { manifest } of listings) {
    if (kind && manifest.kind !== kind) continue
    const key = `${manifest.kind}/${manifest.category}`
    const entry = counts.get(key) ?? { kind: manifest.kind, category: manifest.category, count: 0 }
    entry.count += 1
    counts.set(key, entry)
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)
}
