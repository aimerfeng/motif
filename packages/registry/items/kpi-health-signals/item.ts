import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'kpi-health-signals',
  status: 'published',
  title: { 'zh-CN': '信号格健康指标', en: 'Signal-Bar Health Metrics' },
  summary: {
    'zh-CN': '一组指标，每项前面是三格信号条，按阈值亮红、橙或绿，后面跟百分比和分数；也可切换成「范围内 / 需观察 / 告急」标签卡或目标完成卡。适合漏斗、数据质量和 SLO 的健康概览。',
    en: 'A cluster of metrics, each led by a three-bar signal that fills red, orange or green by threshold, followed by a percentage and fraction; switch to cards tagged within range, observe or critical, or to goal cards. A quiet health strip for funnels, data quality or SLOs.',
  },
  kind: 'section',
  category: 'dashboard',
  tags: ['dashboard', 'kpi', 'health', 'signal bars', 'status', 'metrics'],
  runtime: ['react', 'css'],
  entry: { file: 'kpi-health-signals.tsx', export: 'KpiHealthSignals' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'kpi-health-signals.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'layout',
      type: 'select',
      label: { 'zh-CN': '布局', en: 'Layout' },
      default: 'signals',
      options: [
        { value: 'signals', label: { 'zh-CN': '信号格', en: 'Signal bars' } },
        { value: 'badges', label: { 'zh-CN': '状态标签卡', en: 'Status badges' } },
        { value: 'goals', label: { 'zh-CN': '目标卡', en: 'Goal cards' } },
      ],
      group: 'layout',
    },
    { key: 'bars', type: 'number', label: { 'zh-CN': '信号格数', en: 'Bars' }, default: 3, min: 3, max: 5, step: 1, group: 'look' },
    { key: 'redThreshold', type: 'number', label: { 'zh-CN': '红色阈值', en: 'Red below' }, hint: { 'zh-CN': '低于它亮红', en: 'Values below this show red' }, default: 0.3, min: 0.1, max: 0.45, step: 0.05, group: 'thresholds' },
    { key: 'orangeThreshold', type: 'number', label: { 'zh-CN': '橙色阈值', en: 'Orange below' }, hint: { 'zh-CN': '低于它亮橙，否则亮绿', en: 'Values below this show orange, otherwise green' }, default: 0.7, min: 0.5, max: 0.9, step: 0.05, group: 'thresholds' },
    { key: 'showFraction', type: 'boolean', label: { 'zh-CN': '显示分数', en: 'Show fraction' }, default: true, group: 'content' },
    { key: 'heading', type: 'text', label: { 'zh-CN': '标题', en: 'Heading' }, default: 'Overview', maxLength: 28, group: 'content' },
  ],
  presets: [
    { id: 'pulse', name: { 'zh-CN': '脉搏', en: 'Pulse' }, values: { layout: 'signals', bars: 3, showFraction: true } },
    { id: 'strict-gate', name: { 'zh-CN': '严关', en: 'Strict Gate' }, values: { layout: 'signals', bars: 5, redThreshold: 0.45, orangeThreshold: 0.85 } },
    { id: 'watchtower', name: { 'zh-CN': '瞭望塔', en: 'Watchtower' }, values: { layout: 'badges' } },
  ],
  dependencies: ['@motif/runtime'],
  fonts: ['Geist Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'tremor-blocks',
      repo: 'tremorlabs/tremor-blocks',
      sha: 'b319e8d3d3678a4f60f4802f7e85bc1abc52d598',
      paths: [
        'src/content/components/kpi-cards/kpi-card-29.tsx',
        'src/content/components/kpi-cards/kpi-card-10.tsx',
        'src/content/components/kpi-cards/kpi-card-11.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Tremor Labs, Inc.'],
    },
    modifications: [
      'Combined KPI cards 29 (signal bars), 10 (status badges) and 11 (goal cards) into one component with a layout select.',
      'Made the bar count and the red / orange thresholds params; orange fills half the bars (two of three, as upstream).',
      'Replaced @remixicon/react with inline SVG, cx with cn from @motif/runtime and the Tremor Card with plain markup on theme tokens.',
      'Added a screen-reader status word and focus ring; the demo drifts the ratios via useFrameLoop so the bars change color.',
    ],
    assets: [],
  },
})
