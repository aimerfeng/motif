/**
 * 市场的排序：精选条目按这里的顺序排在最前，其余按分类、再按名字。
 * 这是人工挑选的结果（看过海报和实时效果后决定），首页首屏用 HERO。
 */
export const HERO = { slug: 'mesh-gradient', preset: 'nocturne' }

export const FEATURED: readonly string[] = [
  'fluid-simulation',
  'globe',
  'liquid-form',
  'mesh-gradient',
  'god-rays',
  'typography-vortex',
  'dock',
  'laser',
  'image-transitions',
  'neuro-noise',
  'dynamic-island',
  'border-beam',
]

const CATEGORY_ORDER = ['background', 'shader', '3d', 'text', 'card', 'button', 'navigation', 'cursor', 'data', 'layout', 'transition']

export function marketOrder(a: { slug: string; category: string }, b: { slug: string; category: string }): number {
  const fa = FEATURED.indexOf(a.slug)
  const fb = FEATURED.indexOf(b.slug)
  if (fa !== -1 || fb !== -1) return (fa === -1 ? Infinity : fa) - (fb === -1 ? Infinity : fb)
  const ca = CATEGORY_ORDER.indexOf(a.category)
  const cb = CATEGORY_ORDER.indexOf(b.category)
  return ca !== cb ? ca - cb : a.slug.localeCompare(b.slug)
}
