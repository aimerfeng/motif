import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'loader-gooey-blobs',
  status: 'published',
  title: { 'zh-CN': '黏液融合加载器', en: 'Gooey Loaders' },
  summary: {
    'zh-CN': '三种 SVG 黏液滤镜加载器：两团圆点分开又融合、水滴在三角形三个角之间流动、一串珠子边流过边融合。适合俏皮的品牌、创意工具和启动画面。',
    en: 'Three SVG goo-filter loaders: two blobs that split and re-merge, a droplet flowing between the corners of a triangle, and a stream of beads fusing as they pass. For playful brands, creative tools and splash screens.',
  },
  kind: 'component',
  category: 'loader',
  tags: ['loader', 'gooey', 'blob', 'metaball', 'svg-filter', 'loading'],
  runtime: ['react', 'css', 'svg'],
  entry: { file: 'loader-gooey-blobs.tsx', export: 'LoaderGooeyBlobs' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'loader-gooey-blobs.tsx', role: 'component' },
    { path: 'loader-gooey-blobs.css', role: 'style' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '样式', en: 'Variant' },
      default: 'jelly',
      options: [
        { value: 'jelly', label: { 'zh-CN': '果冻', en: 'Jelly' } },
        { value: 'jellyTriangle', label: { 'zh-CN': '三角果冻', en: 'Jelly triangle' } },
        { value: 'mirage', label: { 'zh-CN': '蜃景', en: 'Mirage' } },
      ],
    },
    { key: 'size', type: 'number', group: 'look', label: { 'zh-CN': '尺寸', en: 'Size' }, default: 48, min: 24, max: 120, step: 1, unit: 'px', safe: [32, 80] },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '颜色', en: 'Color' }, default: '#a78bfa' },
    { key: 'speed', type: 'number', group: 'motion', label: { 'zh-CN': '速度', en: 'Speed' }, default: 1, min: 0.4, max: 2, step: 0.05, unit: 'x', safe: [0.7, 1.4] },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '读屏文案', en: 'Screen reader label' }, default: 'Loading', maxLength: 32 },
  ],
  presets: [
    { id: 'lavender', name: { 'zh-CN': '薰衣草', en: 'Lavender' }, values: { variant: 'jelly', color: '#a78bfa', size: 48 } },
    { id: 'lime', name: { 'zh-CN': '青柠', en: 'Lime' }, values: { variant: 'jellyTriangle', color: '#a3e635', size: 44 } },
    { id: 'lagoon', name: { 'zh-CN': '泻湖', en: 'Lagoon' }, values: { variant: 'mirage', color: '#38bdf8', size: 72 } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 2.2, posterTime: 0.4, loop: 3 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'ldrs',
      repo: 'GriffinJohnston/ldrs',
      sha: 'f759f65beb8ab4f4a1f010438072180693ca01ec',
      paths: [
        'src/elements/jelly.scss',
        'src/elements/jelly.ts',
        'src/elements/jellyTriangle.scss',
        'src/elements/jellyTriangle.ts',
        'src/elements/mirage.scss',
        'src/elements/mirage.ts',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2022 Griffin Johnston'],
    },
    modifications: [
      'Merged the jelly, jelly-triangle and mirage Web Components into one React component with a variant select; markup, goo filter values, keyframes and durations are kept.',
      'Global filter ids replaced with per-instance useId ids; CSS cx/cy/r geometry moved to SVG attributes.',
      'One shared size parameter and a speed multiplier over the upstream durations; added role="status" with an sr-only label and a paused pose under reduced motion.',
    ],
    assets: [],
  },
})
