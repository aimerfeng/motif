import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'hero-fanned-cards',
  status: 'published',
  title: { 'zh-CN': '扇形卡片首屏', en: 'Fanned Card Hero' },
  summary: {
    'zh-CN': '标题下方三张商品卡从两侧弹入、呈扇形展开；悬停的卡片会带着弹性放大到最前面。适合 DTC 品牌、系列上新和创作者小店。',
    en: 'A shop hero where three product cards spring in from the sides and fan out below the headline; hovering a card lifts it to the front with a springy scale. For DTC brands, collections and creator stores.',
  },
  kind: 'section',
  category: 'hero',
  tags: ['hero', 'shop', 'product', 'cards', 'fan', 'spring'],
  runtime: ['react', 'motion'],
  entry: { file: 'hero-fanned-cards.tsx', export: 'HeroFannedCards' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'hero-fanned-cards.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'angle', type: 'number', label: { 'zh-CN': '展开角度', en: 'Fan angle' }, default: 6, min: 0, max: 14, step: 1, unit: 'deg', safe: [3, 10], group: 'layout' },
    { key: 'offset', type: 'number', label: { 'zh-CN': '侧卡偏移', en: 'Side offset' }, default: 30, min: 0, max: 60, step: 2, unit: 'px', safe: [16, 44], group: 'layout' },
    { key: 'cardWidth', type: 'number', label: { 'zh-CN': '卡片宽度', en: 'Card width' }, default: 192, min: 160, max: 240, step: 8, unit: 'px', group: 'layout' },
    { key: 'spring', type: 'spring', label: { 'zh-CN': '入场弹簧', en: 'Entrance spring' }, default: { visualDuration: 0.5, bounce: 0.25 }, group: 'motion' },
    { key: 'palette', type: 'palette', label: { 'zh-CN': '商品配色', en: 'Product colors' }, default: ['#7dd3fc', '#d6a77a', '#f472b6'], minItems: 3, maxItems: 3, group: 'look' },
    { key: 'headline', type: 'text', label: { 'zh-CN': '标题', en: 'Headline' }, default: 'Pots of Joy: Ceramic Chic!', maxLength: 48, group: 'content' },
    { key: 'ctaLabel', type: 'text', label: { 'zh-CN': '按钮文案', en: 'Button label' }, default: 'Ready to clay', maxLength: 24, group: 'content' },
  ],
  presets: [
    { id: 'kiln', name: { 'zh-CN': '窑火', en: 'Kiln' }, values: { palette: ['#7dd3fc', '#d6a77a', '#f472b6'] } },
    { id: 'celadon', name: { 'zh-CN': '青釉', en: 'Celadon' }, values: { palette: ['#86efac', '#5eead4', '#a5b4fc'], angle: 9, offset: 40 } },
    { id: 'stacked', name: { 'zh-CN': '叠放', en: 'Stacked' }, values: { palette: ['#334155', '#9a3412', '#a16207'], angle: 3, offset: 12 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: [],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { scroll: true, posterTime: 2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'animata',
      repo: 'codse/animata',
      sha: '36674e4e9cfdc0f237693d8b736a2bf41065ca1d',
      paths: ['animata/hero/product-features.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Animata'],
    },
    modifications: [
      'Replaced the remote product photos with hand-drawn SVG still lifes tinted from the palette param.',
      'Exposed angle, offset, card width, entrance spring, headline and button label as params; added an activeIndex prop so the demo can autoplay the hover lift.',
      'Mobile cards animate on mount instead of whileInView; keyboard focus lifts a card like hover; reduced motion skips the entrance; transition-all replaced with listed properties.',
    ],
    assets: [],
  },
})
