import type { Category, Kind } from '@motif/schema'

/**
 * 通用 skill：按层级给主 skill，按分类可以再给一个更具体的。
 * 市场的筛选栏据此显示「复制通用 Skill」按钮。
 */
const BY_KIND: Record<Kind, string[]> = {
  template: ['motif-design', 'motif-scroll'],
  style: ['motif-design', 'motif-typography'],
  section: ['motif-design', 'motif-scroll'],
  component: ['motif-micro-interactions', 'motif-motion'],
  effect: ['motif-motion'],
}
const BY_CATEGORY: Partial<Record<Category, string>> = {
  background: 'motif-backgrounds',
  shader: 'motif-shaders',
  '3d': 'motif-3d',
  text: 'motif-typography',
  transition: 'motif-motion',
  card: 'motif-motion',
  cursor: 'motif-micro-interactions',
  loader: 'motif-micro-interactions',
  skeleton: 'motif-micro-interactions',
  progress: 'motif-micro-interactions',
  toast: 'motif-micro-interactions',
  button: 'motif-micro-interactions',
  toggle: 'motif-micro-interactions',
  input: 'motif-micro-interactions',
  dialog: 'motif-motion',
  navigation: 'motif-motion',
  hero: 'motif-design',
  showcase: 'motif-scroll',
}

export function generalSkills(kind: Kind | null, category: Category | null): string[] {
  const list = [...(category && BY_CATEGORY[category] ? [BY_CATEGORY[category]] : []), ...(kind ? BY_KIND[kind] : ['motif-design'])]
  return list.filter((name, index) => list.indexOf(name) === index).slice(0, 2)
}
