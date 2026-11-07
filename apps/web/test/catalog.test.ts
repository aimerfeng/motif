import { describe, expect, it } from 'vitest'
import { buildCatalog, initiallyRendered, packRows, sectionsOf, type CatalogGroup } from '../src/components/market/catalog-groups'
import type { ItemSummary } from '../src/lib/catalog'

/* 市场的分组目录（docs/decisions/0010）：分组、排列和首屏渲染哪些组。 */

function item(slug: string, kind: ItemSummary['kind'], category: ItemSummary['category']): ItemSummary {
  return { slug, title: slug, summary: '', kind, category, tags: [], runtime: [], source: null, skill: `motif-${slug}`, media: { poster: null, posterSmall: null, loopWebm: null, loopMp4: null }, addedAt: null }
}

const group = (id: string, count: number): CatalogGroup => ({ id, kind: 'section', category: 'hero', items: Array.from({ length: count }, (_, i) => item(`${id}-${i}`, 'section', 'hero')) })

describe('market catalog', () => {
  const items = [
    item('globe', 'effect', 'background'),
    item('hero-a', 'section', 'hero'),
    item('waves', 'effect', 'background'),
    item('neo', 'style', 'bold'),
    item('typo', 'effect', 'text'),
  ]

  it('groups by kind then category and keeps the incoming order inside a group', () => {
    const groups = buildCatalog(items, { kind: null, shelf: null })
    expect(groups.map((g) => g.id)).toEqual(['style-bold', 'section-hero', 'effect-background', 'effect-text'])
    expect(groups.find((g) => g.id === 'effect-background')!.items.map((i) => i.slug)).toEqual(['globe', 'waves'])
  })

  it('puts the shelf first only when no kind is chosen', () => {
    const shelf = { type: 'featured' as const, items: [items[0]!, items[3]!] }
    expect(buildCatalog(items, { kind: null, shelf })[0]).toMatchObject({ id: 'featured', kind: null, shelf: 'featured' })
    expect(buildCatalog(items, { kind: 'effect', shelf }).map((g) => g.id)).toEqual(['effect-background', 'effect-text'])
  })

  it('splits groups into kind sections', () => {
    const sections = sectionsOf(buildCatalog(items, { kind: null, shelf: { type: 'featured', items: [items[0]!] } }))
    expect(sections.map((s) => [s.kind, s.count])).toEqual([
      [null, 1],
      ['style', 1],
      ['section', 1],
      ['effect', 3],
    ])
  })

  it('fills the gap at the end of a row with a later block that fits', () => {
    // 1 + 1 之后剩一格：2 放不下，把后面的 1 提前；然后 2 和 3 各自成行。
    expect(packRows([group('a', 1), group('b', 1), group('c', 2), group('d', 1), group('e', 5)]).map((g) => g.id)).toEqual(['a', 'b', 'd', 'c', 'e'])
    // 没有放得下的就换行，顺序不变。
    expect(packRows([group('a', 2), group('b', 2), group('c', 3)]).map((g) => g.id)).toEqual(['a', 'b', 'c'])
  })

  it('renders the first groups up to about two rows of cards', () => {
    const groups = [group('a', 6), group('b', 4), group('c', 3), group('d', 2)]
    expect([...initiallyRendered(groups)]).toEqual(['a', 'b', 'c'])
    expect([...initiallyRendered([])]).toEqual([])
  })
})
