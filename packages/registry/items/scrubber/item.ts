import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'scrubber',
  status: 'published',
  title: { 'zh-CN': '拖拽滑块', en: 'Scrubber' },
  summary: {
    'zh-CN': '整条轨道都是把手：按下哪里数值就到哪里，色块跟着铺开，细小的刻度和等宽数字让调节很有手感。适合图片调色、参数面板和播放进度。',
    en: 'The whole bar is the handle: press anywhere and the value follows while a tinted fill spreads behind fine tick marks and tabular digits. Made for photo adjustments, parameter panels and playback progress.',
  },
  kind: 'component',
  category: 'input',
  tags: ['slider', 'scrubber', 'range', 'value', 'a11y', 'inspector'],
  runtime: ['react', 'motion'],
  entry: { file: 'scrubber.tsx', export: 'Scrubber' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'scrubber.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#f97316' },
    { key: 'height', type: 'number', group: 'layout', label: { 'zh-CN': '高度', en: 'Height' }, default: 44, min: 32, max: 64, step: 1, unit: 'px', safe: [36, 56] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 4, max: 32, step: 1, unit: 'px', safe: [6, 20] },
    { key: 'ticks', type: 'number', group: 'look', label: { 'zh-CN': '刻度数量', en: 'Tick marks' }, hint: { 'zh-CN': '0 为隐藏刻度', en: '0 hides the ticks' }, default: 11, min: 0, max: 24, step: 1, safe: [0, 19] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '把手弹簧', en: 'Handle spring' }, default: { visualDuration: 0.25, bounce: 0.1 } },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '标签', en: 'Label' }, default: 'Exposure', maxLength: 24 },
  ],
  presets: [
    { id: 'amber', name: { 'zh-CN': '琥珀', en: 'Amber' }, values: { color: '#f97316', height: 44, radius: 12, ticks: 11 } },
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { color: '#27272a', height: 36, radius: 6, ticks: 19, spring: { visualDuration: 0.2, bounce: 0 } } },
    { id: 'moss', name: { 'zh-CN': '苔原', en: 'Moss' }, values: { color: '#16a34a', height: 52, radius: 26, ticks: 0, spring: { visualDuration: 0.35, bounce: 0.3 } } },
    { id: 'tide', name: { 'zh-CN': '潮汐', en: 'Tide' }, values: { color: '#0284c7', height: 48, radius: 16, ticks: 7, spring: { visualDuration: 0.3, bounce: 0.2 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'The bar renders role="slider" with arrow keys, Shift+arrow for 10 steps, Home and End. Always pass a meaningful label; it doubles as the accessible name.',
      'Controlled: value + onValueChange. Uncontrolled: defaultValue. min, max, step and decimals describe the scale; the visible digits are tabular.',
      'Stack several scrubbers with an 8–12px gap in one panel; keep a single accent color across the group.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.7, posterTime: 3.4, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/scrubber/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Replaced left/width transitions with transform-only motion (scaleX fill, translateX handle measured through ResizeObserver).',
      'Added an accent color, height, corner radius and tick count as parameters, a gradient tint fill, and keyboard Shift+arrow steps.',
      'Handle spring is described by visualDuration + bounce; cn comes from @motif/runtime. A forced active prop lets the demo autoplay show the dragging state.',
    ],
    assets: [],
  },
})
