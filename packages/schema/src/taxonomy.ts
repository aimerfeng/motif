/**
 * 市场的层级，从大到小：整站模板、设计风格、页面区块、功能组件、视觉效果。
 * 每个层级有自己的分类；分类名在所有层级里唯一（界面文案按分类名取）。
 */
export const KINDS = ['template', 'style', 'section', 'component', 'effect'] as const
export type Kind = (typeof KINDS)[number]

export const CATEGORIES_BY_KIND = {
  template: ['landing', 'saas', 'portfolio', 'product', 'agency', 'blog', 'event', 'app'],
  style: ['minimal', 'bold', 'retro', 'glass', 'editorial', 'technical', 'playful'],
  section: ['hero', 'navbar', 'features', 'pricing', 'testimonials', 'logos', 'stats', 'faq', 'cta', 'footer', 'team', 'changelog', 'posts', 'contact', 'showcase', 'dashboard'],
  component: ['loader', 'skeleton', 'progress', 'toast', 'button', 'input', 'toggle', 'tabs', 'menu', 'dialog', 'tooltip', 'badge', 'avatar', 'empty-state', 'navigation', 'data', 'layout'],
  effect: ['background', 'shader', 'text', 'card', 'cursor', 'transition', '3d'],
} as const satisfies Record<Kind, readonly string[]>

export type Category = (typeof CATEGORIES_BY_KIND)[Kind][number]
export const CATEGORIES: readonly Category[] = KINDS.flatMap((kind) => CATEGORIES_BY_KIND[kind])

export function kindOfCategory(category: Category): Kind {
  return KINDS.find((kind) => (CATEGORIES_BY_KIND[kind] as readonly string[]).includes(category))!
}

export const RUNTIMES = ['react', 'motion', 'css', 'svg', 'canvas2d', 'webgl', 'webgl2', 'three'] as const
export type Runtime = (typeof RUNTIMES)[number]

/** 允许整合进仓库的上游许可证（A 级）。 */
export const ALLOWED_SPDX = ['MIT', 'Apache-2.0', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Zlib', 'Unlicense', 'CC0-1.0'] as const
export type AllowedSpdx = (typeof ALLOWED_SPDX)[number]
