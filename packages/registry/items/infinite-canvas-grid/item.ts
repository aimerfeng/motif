import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'infinite-canvas-grid',
  status: 'published',
  title: { 'zh-CN': '无限画布', en: 'Infinite Canvas' },
  summary: {
    'zh-CN': '一张可以往任意方向拖、滚、甩的白色画布，商品卡片无限平铺，松手后带惯性滑行，速度快时整片网格微微倾斜，背后可以叠几团缓慢流动的柔光。卡片插画按调色板现画。适合情绪板、藏品浏览和作品索引。',
    en: 'A white canvas you can drag, scroll or flick in any direction while product cards tile forever. It coasts on release, leans slightly with speed and can float over slow liquid blobs. Card art is drawn from a palette. For moodboards, collection browsers and portfolio indexes.',
  },
  kind: 'component',
  category: 'layout',
  tags: ['infinite canvas', 'pan', 'drag', 'momentum', 'grid', 'gallery', 'catalog', 'moodboard'],
  runtime: ['react', 'css'],
  entry: { file: 'infinite-canvas-grid.tsx', export: 'InfiniteGrid' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'infinite-canvas-grid.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'columns', type: 'number', group: 'layout', label: { 'zh-CN': '列数', en: 'Columns' }, hint: { 'zh-CN': '每个平铺块的列数', en: 'Columns in each repeating block' }, default: 4, min: 2, max: 6, step: 1, safe: [3, 5] },
    { key: 'gap', type: 'number', group: 'layout', label: { 'zh-CN': '间距', en: 'Gap' }, hint: { 'zh-CN': '单位是视口宽度的百分比（vw）', en: 'In viewport width units (vw)' }, default: 2.5, min: 1, max: 6, step: 0.5, safe: [1.5, 4] },
    { key: 'cardWidth', type: 'number', group: 'layout', label: { 'zh-CN': '卡片宽度', en: 'Card width' }, hint: { 'zh-CN': '单位是 vw，窄屏上最小 120px', en: 'In vw, never narrower than 120px' }, default: 24, min: 14, max: 36, step: 1, safe: [18, 30] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '插画圆角', en: 'Art radius' }, default: 0, min: 0, max: 32, step: 1, unit: 'px', safe: [0, 20] },
    { key: 'palette', type: 'palette', group: 'look', label: { 'zh-CN': '插画配色', en: 'Art palette' }, hint: { 'zh-CN': '卡片依次取色，底色是同色的浅调', en: 'Cards cycle through these; each tile uses a pale tint of its color' }, default: ['#c69c72', '#7f9583', '#c0583f', '#55708f'], minItems: 1, maxItems: 6 },
    { key: 'liquidBlobs', type: 'boolean', group: 'look', label: { 'zh-CN': '流动柔光', en: 'Liquid blobs' }, default: true },
    { key: 'momentum', type: 'number', group: 'motion', label: { 'zh-CN': '惯性', en: 'Momentum' }, hint: { 'zh-CN': '每帧保留的速度，越大甩得越远', en: 'Velocity kept per frame; higher coasts further' }, default: 0.95, min: 0.85, max: 0.98, step: 0.01, safe: [0.9, 0.97] },
  ],
  presets: [
    { id: 'studio', name: { 'zh-CN': '影棚', en: 'Studio' }, values: {} },
    { id: 'gallery-wall', name: { 'zh-CN': '画廊墙', en: 'Gallery Wall' }, values: { columns: 3, gap: 4, cardWidth: 30, radius: 14, palette: ['#d9a5b3', '#9bb7d4', '#e3c27a', '#a8c3a0', '#b9a6d6'], momentum: 0.96 } },
    { id: 'contact-sheet', name: { 'zh-CN': '印样', en: 'Contact Sheet' }, values: { columns: 6, gap: 1.5, cardWidth: 16, radius: 2, palette: ['#3f3f46', '#71717a', '#a1a1aa'], liquidBlobs: false, momentum: 0.92 } },
  ],
  dependencies: ['@motif/runtime'],
  fonts: ['Geist Mono Variable'],
  guidance: {
    rules: [
      'Give it a full-viewport (or at least very tall) container; it wheels and drags on its own, so do not put it inside a scrolling page section that also needs the wheel.',
      'Pass items with your own imageUrl (object-contain on white, like product shots) or keep the generated art; only the center block is exposed to assistive tech, the other eight copies are aria-hidden.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { posterTime: 1.6, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uselayouts',
      repo: 'iurvish/uselayouts',
      sha: '678a478e30272d8101cea97bc6147e0df9dcd652',
      paths: ['registry/default/example/infinite-grid.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Urvish Mali'],
    },
    modifications: [
      'clsx + tailwind-merge replaced by cn from @motif/runtime.',
      'Unsplash product photos replaced by generated SVG object art tinted from a palette parameter; item names and prices are invented.',
      'columns, gap, cardWidth, momentum (the 0.95 velocity decay), liquidBlobs, palette and art radius are parameters; cards never get narrower than 120px.',
      'The repeating block is filled to whole rows when the column count does not divide the item count, and it is measured with offsetWidth and observed directly so parameter changes re-measure.',
      'Added arrow-key panning, a focus-visible ring, an aria-label and list semantics on the visible block; clickable cards become keyboard buttons.',
      'Reduced motion: the blobs stop and panning follows the pointer directly without easing, coasting or skew.',
      'A controlRef (panBy / fling) lets the demo autoplay drive the canvas from useFrameLoop time.',
    ],
    assets: [],
  },
})
