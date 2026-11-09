import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'scroll-split-panels',
  status: 'published',
  title: { 'zh-CN': '一图裂三', en: 'Split Panels' },
  summary: {
    'zh-CN': '一张横幅画面随滚动裂成三块，三块向两侧拉开、依次翻面露出背面的文案，最后停成三张卡片。适合三项特性、服务概览和活动页。',
    en: 'One wide picture splits into three panels as you scroll; the panels drift apart, flip to show copy on their backs and settle as three cards. For feature trios, service overviews and campaign pages.',
  },
  kind: 'effect',
  category: 'scroll',
  tags: ['scroll', 'flip', 'cards', '3d', 'split', 'sticky'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'scroll-split-panels.tsx', export: 'ScrollSplitCards' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'scroll-split-panels.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'panelGap', type: 'number', group: 'motion', label: { 'zh-CN': '拉开距离', en: 'Drift apart' }, hint: { 'zh-CN': '左右两块向外移动的峰值', en: 'Peak outward shift of the side panels' }, default: 48, min: 0, max: 96, step: 1, unit: 'px', safe: [24, 72] },
    { key: 'flipStagger', type: 'number', group: 'motion', label: { 'zh-CN': '翻面错开', en: 'Flip stagger' }, hint: { 'zh-CN': '0 表示三块同时翻面', en: '0 flips all three together' }, default: 0, min: 0, max: 0.15, step: 0.01 },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 16, min: 0, max: 32, step: 1, unit: 'px' },
    {
      key: 'artwork',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '画面', en: 'Artwork' },
      default: 'strait',
      options: [
        { value: 'strait', label: { 'zh-CN': '海峡', en: 'Strait' } },
        { value: 'dunes', label: { 'zh-CN': '沙丘', en: 'Dunes' } },
        { value: 'tide', label: { 'zh-CN': '潮汐', en: 'Tide' } },
      ],
    },
    { key: 'backColors', type: 'palette', group: 'look', label: { 'zh-CN': '背面颜色', en: 'Back colors' }, hint: { 'zh-CN': '文字颜色按亮度自动选深浅', en: 'Text ink follows each color’s luminance' }, default: ['#ead9c4', '#c4452d', '#2c3033'], minItems: 3, maxItems: 3 },
    { key: 'titles', type: 'text', group: 'content', label: { 'zh-CN': '卡片标题', en: 'Card titles' }, hint: { 'zh-CN': '用 / 分隔三个标题', en: 'Three titles separated by /' }, default: 'Fort Point / The Span / Marin Head', maxLength: 80 },
  ],
  presets: [
    { id: 'harbor', name: { 'zh-CN': '港湾', en: 'Harbor' }, values: {} },
    { id: 'mirage', name: { 'zh-CN': '蜃景', en: 'Mirage' }, values: { artwork: 'dunes', backColors: ['#f3e3c3', '#b8652f', '#3a2418'], flipStagger: 0.08, panelGap: 36 } },
    { id: 'undertow', name: { 'zh-CN': '暗流', en: 'Undertow' }, values: { artwork: 'tide', backColors: ['#cfe6e3', '#1f6f78', '#0d1f2b'], flipStagger: 0.12, radius: 24, panelGap: 64 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    rules: [
      'The component is a 400vh scroll track with a sticky stage; pass the scrolling ancestor as `containerRef` when it lives inside an overflow-y-auto element.',
    ],
  },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uselayouts',
      repo: 'iurvish/uselayouts',
      sha: '678a478e30272d8101cea97bc6147e0df9dcd652',
      paths: ['registry/default/example/scroll-split-cards.tsx', 'registry/default/demo/scroll-split-cards-demo.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Urvish Mali'],
    },
    modifications: [
      'framer-motion imports became motion/react; cn comes from motif-runtime.',
      'The Unsplash photo was replaced by generated inline SVG artwork with three variants.',
      'Panel drift, corner radius, back colors and titles come from the generated defaults region; added an optional flip stagger.',
      'Back-side text ink is picked from each back color’s luminance instead of a fixed textColor.',
      'With reduced motion the panels hold the settled, flipped state instead of following scroll.',
    ],
    assets: [],
  },
})
