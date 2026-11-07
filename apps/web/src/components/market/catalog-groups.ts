import { CATEGORIES_BY_KIND, KINDS, type Category, type Kind } from '@motif/schema/core'
import type { ItemSummary } from '@/lib/catalog'

/*
 * 市场的分组目录（docs/decisions/0010）：层级 → 分类，全部时最前面加一组「精选」或「本周热门」。
 * 组内保持传进来的次序（精选顺序或热门顺序）。纯函数，服务端和浏览器都能用。
 */

export interface CatalogGroup {
  /** DOM 锚点也用它：catalog-<id>。 */
  id: string
  /** 最前面那一组（精选 / 本周热门）没有层级。 */
  kind: Kind | null
  category: Category | null
  /** 只有最前面那一组有：它是精选还是本周热门。 */
  shelf?: 'featured' | 'hot'
  items: ItemSummary[]
}

/** 最前面一组放几个：两行（宽屏三列）。 */
export const SHELF_SIZE = 6

export function buildCatalog(
  items: ItemSummary[],
  { kind, shelf }: { kind: Kind | null; shelf: { type: 'featured' | 'hot'; items: ItemSummary[] } | null },
): CatalogGroup[] {
  const groups: CatalogGroup[] = []
  if (kind === null && shelf && shelf.items.length > 0) groups.push({ id: shelf.type, kind: null, category: null, shelf: shelf.type, items: shelf.items.slice(0, SHELF_SIZE) })
  for (const k of KINDS) {
    if (kind !== null && k !== kind) continue
    const inKind: CatalogGroup[] = []
    for (const category of CATEGORIES_BY_KIND[k] as readonly Category[]) {
      const inGroup = items.filter((item) => item.kind === k && item.category === category)
      if (inGroup.length > 0) inKind.push({ id: `${k}-${category}`, kind: k, category, items: inGroup })
    }
    groups.push(...packRows(inKind))
  }
  return groups
}

/** 宽屏一行几列（市场网格 xl:grid-cols-3）。 */
export const COLUMNS = 3

/**
 * 分类块按条目数占一到三列（见 catalog.tsx）。按分类表的顺序排，遇到一行剩下的格子放不下下一块时，
 * 先从后面找一块放得下的补上，少留空格。返回的就是展示顺序，目录也按它排，两边永远一致。
 */
export function packRows(groups: CatalogGroup[], columns = COLUMNS): CatalogGroup[] {
  const span = (group: CatalogGroup) => Math.min(group.items.length, columns)
  const remaining = [...groups]
  const ordered: CatalogGroup[] = []
  let room = columns
  while (remaining.length > 0) {
    const index = remaining.findIndex((group) => span(group) <= room)
    if (index === -1) {
      room = columns
      continue
    }
    const [group] = remaining.splice(index, 1)
    ordered.push(group!)
    room -= span(group!)
    if (room === 0) room = columns
  }
  return ordered
}

/** 目录按层级分段（侧栏的层级行、正文的层级标题）。最前面那一组单独一段，kind 为 null。 */
export function sectionsOf(groups: CatalogGroup[]): { kind: Kind | null; groups: CatalogGroup[]; count: number }[] {
  const sections: { kind: Kind | null; groups: CatalogGroup[]; count: number }[] = []
  for (const group of groups) {
    const last = sections.at(-1)
    if (last && last.kind === group.kind) {
      last.groups.push(group)
      last.count += group.items.length
    } else sections.push({ kind: group.kind, groups: [group], count: group.items.length })
  }
  return sections
}

/** 首屏直接渲染真卡片的组：从头数到够 12 张为止（大约首屏两行加下一组的开头）。 */
export function initiallyRendered(groups: CatalogGroup[], cards = 12): Set<string> {
  const ids = new Set<string>()
  let total = 0
  for (const group of groups) {
    if (total >= cards) break
    ids.add(group.id)
    total += group.items.length
  }
  return ids
}
