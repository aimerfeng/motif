/**
 * 市场的排序：精选条目按这里的顺序排在最前，其余按分类、再按名字。
 * 这是人工挑选的结果（看过海报和实时效果后决定），首页首屏用 HERO。
 */
export const HERO = { slug: 'mesh-gradient', preset: 'nocturne' }

export const FEATURED: readonly string[] = [
  'fluid-simulation',
  'mobile-app-landing',
  'style-synthwave',
  'globe',
  'scroll-story',
  'ferrant-product-site',
  'style-8bit',
  'hero-glowy-waves',
  'liquid-form',
  'flip-grid',
  'toast-gooey',
  'saas-dashboard-landing',
  'style-swiss',
  'split-reveal',
  'dock',
  'showcase-integrations',
  'style-claymorphism',
  'typography-vortex',
  'shape-morph',
  'input-search-command',
  'god-rays',
  'dynamic-island',
]

const KIND_ORDER = ['template', 'style', 'section', 'component', 'effect']

export function marketOrder(a: { slug: string; kind: string; category: string }, b: { slug: string; kind: string; category: string }): number {
  const fa = FEATURED.indexOf(a.slug)
  const fb = FEATURED.indexOf(b.slug)
  if (fa !== -1 || fb !== -1) return (fa === -1 ? Infinity : fa) - (fb === -1 ? Infinity : fb)
  const ka = KIND_ORDER.indexOf(a.kind)
  const kb = KIND_ORDER.indexOf(b.kind)
  if (ka !== kb) return ka - kb
  return a.category !== b.category ? a.category.localeCompare(b.category) : a.slug.localeCompare(b.slug)
}
