import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'card-folded-corner',
  status: 'published',
  title: { 'zh-CN': '折角卡片', en: 'Folded Corner Cards' },
  summary: {
    'zh-CN': '右上角折起一只“狗耳朵”的功能卡片，标题旁有一小段强调色竖条；悬停时折角像纸一样掀起，阴影随之加深。适合功能列表和资源链接。',
    en: 'Feature cards with a dog-eared top-right corner and a short accent rail beside the title; on hover the fold lifts and its shadow deepens like paper. For feature lists and resource links.',
  },
  kind: 'effect',
  category: 'card',
  tags: ['card', 'fold', 'paper', 'hover', 'features', 'sticker'],
  runtime: ['react', 'css'],
  entry: { file: 'card-folded-corner.tsx', export: 'FoldedCornerCards' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'card-folded-corner.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'foldSize', type: 'number', group: 'look', label: { 'zh-CN': '折角大小', en: 'Fold size' }, default: 30, min: 20, max: 44, step: 1, unit: 'px', safe: [24, 38] },
    { key: 'lift', type: 'number', group: 'interaction', label: { 'zh-CN': '掀起幅度', en: 'Lift' }, hint: { 'zh-CN': '悬停时折角放大的倍数', en: 'How much the fold grows on hover' }, default: 1.67, min: 1.2, max: 2, step: 0.01, safe: [1.4, 1.8] },
    { key: 'shadow', type: 'number', group: 'interaction', label: { 'zh-CN': '掀起阴影', en: 'Lift shadow' }, default: 0.05, min: 0, max: 0.3, step: 0.01, safe: [0.04, 0.18] },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#3b82f6' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 8, min: 0, max: 20, step: 1, unit: 'px', safe: [4, 14] },
    {
      key: 'tone',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '深浅', en: 'Tone' },
      default: 'light',
      options: [
        { value: 'light', label: { 'zh-CN': '浅色', en: 'Light' } },
        { value: 'dark', label: { 'zh-CN': '深色', en: 'Dark' } },
      ],
    },
    { key: 'columns', type: 'number', group: 'layout', label: { 'zh-CN': '列数', en: 'Columns' }, hint: { 'zh-CN': '窄容器里始终一列', en: 'Always one column in narrow containers' }, default: 3, min: 1, max: 3, step: 1 },
  ],
  presets: [
    { id: 'notebook', name: { 'zh-CN': '笔记本', en: 'Notebook' }, values: { accent: '#3b82f6', tone: 'light', foldSize: 30, lift: 1.67, shadow: 0.05, radius: 8 } },
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { accent: '#34d399', tone: 'dark', foldSize: 34, lift: 1.6, shadow: 0.2, radius: 10 } },
    { id: 'postit', name: { 'zh-CN': '便签', en: 'Post-it' }, values: { accent: '#f59e0b', tone: 'light', foldSize: 38, lift: 1.5, shadow: 0.12, radius: 4 } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.2, posterTime: 0.5, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'tremor-blocks',
      repo: 'tremorlabs/tremor-blocks',
      sha: 'b319e8d3d3678a4f60f4802f7e85bc1abc52d598',
      paths: ['src/content/components/feature-sections/feature-section-08.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Tremor Labs, Inc.'],
    },
    modifications: [
      'Remix icons replaced with inline SVG; cx replaced with cn from motif-runtime.',
      'Fold size, lift, shadow, radius, accent, tone and column count are parameters driving CSS variables; the light/dark gray palette follows the upstream classes.',
      'transition-all narrowed to the changing properties; reduced motion disables the transitions; keyboard focus and a lifted prop show the hover fold (used by the demo autoplay).',
    ],
    assets: [],
  },
})
