import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'table-cohort-retention',
  status: 'published',
  title: { 'zh-CN': '留存同期群表', en: 'Cohort Retention Grid' },
  summary: {
    'zh-CN': '每周新用户一行、之后每周一列，单元格按留存百分比用同一种颜色深浅着色，下方附人数；还没到的周是虚线占位，左侧同期群列横向滚动时固定不动。适合增长和产品分析看板。',
    en: 'Weekly cohorts down the side and weeks across the top, each cell shaded on a single-hue scale by retention with the count beneath; future weeks are dashed placeholders and the cohort column stays put while the grid scrolls sideways. For growth and product analytics.',
  },
  kind: 'component',
  category: 'table',
  tags: ['table', 'cohort', 'retention', 'heatmap', 'analytics', 'sticky-column'],
  runtime: ['react', 'css'],
  entry: { file: 'table-cohort-retention.tsx', export: 'TableCohortRetention' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'table-cohort-retention.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'hue', type: 'color', group: 'look', label: { 'zh-CN': '色相', en: 'Hue' }, hint: { 'zh-CN': '留存越高颜色越深', en: 'Higher retention, stronger color' }, default: '#3b82f6' },
    { key: 'weeks', type: 'number', group: 'layout', label: { 'zh-CN': '周数', en: 'Weeks' }, default: 10, min: 4, max: 10, step: 1, safe: [6, 10] },
    { key: 'cellRadius', type: 'number', group: 'look', label: { 'zh-CN': '单元格圆角', en: 'Cell radius' }, default: 4, min: 0, max: 12, step: 1, unit: 'px', safe: [2, 8] },
    { key: 'cellGap', type: 'number', group: 'layout', label: { 'zh-CN': '单元格间距', en: 'Cell gap' }, default: 2, min: 0, max: 6, step: 1, unit: 'px', safe: [1, 4] },
    { key: 'showCounts', type: 'boolean', group: 'layout', label: { 'zh-CN': '显示人数', en: 'Show counts' }, default: true },
    { key: 'stickyColumn', type: 'boolean', group: 'layout', label: { 'zh-CN': '固定同期群列', en: 'Sticky cohort column' }, default: true },
  ],
  presets: [
    { id: 'tide', name: { 'zh-CN': '潮汐', en: 'Tide' }, values: { hue: '#3b82f6', weeks: 10, cellRadius: 4, cellGap: 2, showCounts: true, stickyColumn: true } },
    { id: 'moss', name: { 'zh-CN': '苔原', en: 'Moss' }, values: { hue: '#10b981', weeks: 8, cellRadius: 8, cellGap: 3, showCounts: true, stickyColumn: true } },
    { id: 'ember-grid', name: { 'zh-CN': '炭格', en: 'Ember Grid' }, values: { hue: '#f59e0b', weeks: 10, cellRadius: 0, cellGap: 1, showCounts: false, stickyColumn: true } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'Pass data as Record<cohortLabel, { size, dates, weeks: ({ percentage, count } | null)[] }>; null weeks render as dashed placeholders for weeks that have not happened yet.',
      'Cell ink is derived from each cell color with CSS relative color syntax (oklch(from …)), so it needs a current Chromium, Safari or Firefox.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1, posterTime: 0.5, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'tremor-blocks',
      repo: 'tremorlabs/tremor-blocks',
      sha: 'b319e8d3d3678a4f60f4802f7e85bc1abc52d598',
      paths: ['src/content/components/tables/table-11.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Tremor Labs, Inc.'],
    },
    modifications: [
      'Tremor Table primitives replaced by plain table markup with th scope headers; Divider replaced by hr; cx replaced by cn from @motif/runtime.',
      'The seven fixed blue Tailwind classes became seven color-mix steps of a hue param over the theme background; cell ink is picked from the cell lightness instead of a fixed threshold.',
      'Gray colors mapped to theme tokens; weeks, cell radius, cell gap, show counts and sticky column params added; data, title and description exposed as props.',
      'The scroll region is focusable with an accessible label; the demo autoplays a slow sideways scroll.',
    ],
    assets: [],
  },
})
