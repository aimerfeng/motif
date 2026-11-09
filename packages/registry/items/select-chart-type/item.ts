import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'select-chart-type',
  status: 'published',
  title: { 'zh-CN': '图表类型选择器', en: 'Chart Type Picker' },
  summary: {
    'zh-CN': '选择可视化类型的下拉框：每个选项带小图标，不可用的变淡；悬停或用方向键经过时，旁边浮出一张带图表缩略图和一句说明的预览卡。适合报表编辑器和仪表盘配置。',
    en: 'A select for picking a visualization: each option has a small icon, unavailable ones are dimmed, and hovering or arrowing through shows a side card with a chart thumbnail and a one-line description. For report builders and dashboard editors.',
  },
  kind: 'component',
  category: 'select',
  tags: ['select', 'listbox', 'chart', 'preview', 'dashboard', 'a11y'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'select-chart-type.tsx', export: 'SelectChartType' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'select-chart-type.tsx', role: 'component' },
    { path: 'thumbnails.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#3b82f6' },
    {
      key: 'thumbStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '缩略图填充', en: 'Thumbnail fill' },
      default: 'gradient',
      options: [
        { value: 'gradient', label: { 'zh-CN': '渐变', en: 'Gradient' } },
        { value: 'flat', label: { 'zh-CN': '纯色', en: 'Flat' } },
      ],
    },
    {
      key: 'previewSide',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '预览位置', en: 'Preview side' },
      hint: { 'zh-CN': '窄屏时预览卡统一放在列表下方', en: 'On narrow screens the card sits below the list' },
      default: 'left',
      options: [
        { value: 'left', label: { 'zh-CN': '左侧', en: 'Left' } },
        { value: 'right', label: { 'zh-CN': '右侧', en: 'Right' } },
      ],
    },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '宽度', en: 'Width' }, default: 192, min: 160, max: 280, step: 4, unit: 'px', safe: [176, 240] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 6, min: 0, max: 14, step: 1, unit: 'px', safe: [4, 10] },
    { key: 'showDisabled', type: 'boolean', group: 'content', label: { 'zh-CN': '显示不可用项', en: 'Show unavailable' }, default: true },
  ],
  presets: [
    { id: 'tremor', name: { 'zh-CN': '晴蓝', en: 'Clear Sky' }, values: { accent: '#3b82f6', thumbStyle: 'gradient', radius: 6 } },
    { id: 'moss', name: { 'zh-CN': '苔原', en: 'Tundra' }, values: { accent: '#10b981', thumbStyle: 'flat', radius: 10 } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#f97316', thumbStyle: 'gradient', radius: 2, previewSide: 'right' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.6, posterTime: 3.0, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'tremor-blocks',
      repo: 'tremorlabs/tremor-blocks',
      sha: 'b319e8d3d3678a4f60f4802f7e85bc1abc52d598',
      paths: ['src/content/components/filterbar/filterbar-03.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Tremor Labs, Inc.'],
    },
    modifications: [
      'Replaced the Radix Select with a hand-rolled combobox + listbox (aria-activedescendant, arrow/Home/End/Enter/Escape) and the Radix Tooltip with a preview card that follows the active option.',
      'Remix icons replaced with inline SVG; thumbnail SVGs kept, with the blue fills driven by an accent color and drop-shadow filters removed.',
      'Added accent, thumbnail fill, preview side, width, radius and show-unavailable parameters; on narrow screens the card sits below the list.',
      'motion/react fade for the panel and card, reduced when prefers-reduced-motion is on; open/highlighted props let the demo autoplay.',
    ],
    assets: [],
  },
})
