import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'dashboard-portfolio-holdings',
  status: 'published',
  title: { 'zh-CN': '投资组合表现', en: 'Portfolio Performance' },
  summary: {
    'zh-CN': '组合总值和 24 小时涨跌，三只基金的折线图带悬停十字线，下方持仓表每行一条与折线同色的色条，收益、已实现和分红按正负着色。适合投资理财类看板。',
    en: 'Total portfolio value with its 24-hour change, a three-fund line chart with a hover crosshair and a holdings table whose color rails match the lines, with gains colored by sign. For investing and wealth dashboards.',
  },
  kind: 'section',
  category: 'dashboard',
  tags: ['dashboard', 'portfolio', 'line chart', 'holdings', 'finance'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'dashboard-portfolio-holdings.tsx', export: 'DashboardPortfolioHoldings' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'dashboard-portfolio-holdings.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'currency',
      type: 'select',
      label: { 'zh-CN': '货币', en: 'Currency' },
      default: 'USD',
      options: [
        { value: 'USD', label: { 'zh-CN': '美元 $', en: 'US dollar $' } },
        { value: 'EUR', label: { 'zh-CN': '欧元 €', en: 'Euro €' } },
        { value: 'GBP', label: { 'zh-CN': '英镑 £', en: 'Pound £' } },
        { value: 'JPY', label: { 'zh-CN': '日元 ¥', en: 'Yen ¥' } },
      ],
      group: 'content',
    },
    { key: 'seriesColors', type: 'palette', label: { 'zh-CN': '基金配色', en: 'Fund colors' }, default: ['#3b82f6', '#8b5cf6', '#d946ef'], minItems: 3, maxItems: 3, group: 'look' },
    {
      key: 'curve',
      type: 'select',
      label: { 'zh-CN': '曲线', en: 'Curve' },
      default: 'linear',
      options: [
        { value: 'linear', label: { 'zh-CN': '折线', en: 'Linear' } },
        { value: 'monotone', label: { 'zh-CN': '平滑', en: 'Smooth' } },
      ],
      group: 'look',
    },
    {
      key: 'range',
      type: 'select',
      label: { 'zh-CN': '时间范围', en: 'Range' },
      default: 'all',
      options: [
        { value: 'all', label: { 'zh-CN': '全部（8 周）', en: 'All (8 weeks)' } },
        { value: '30d', label: { 'zh-CN': '近 30 天', en: 'Last 30 days' } },
      ],
      group: 'content',
    },
    { key: 'linkHover', type: 'boolean', label: { 'zh-CN': '表格联动高亮', en: 'Link table hover' }, hint: { 'zh-CN': '悬停表格行时高亮对应折线', en: 'Hovering a row highlights its line' }, default: true, group: 'interaction' },
    { key: 'showTable', type: 'boolean', label: { 'zh-CN': '显示持仓表', en: 'Show holdings table' }, default: true, group: 'content' },
  ],
  presets: [
    { id: 'tremor', name: { 'zh-CN': '晴空', en: 'Clear Sky' }, values: { seriesColors: ['#3b82f6', '#8b5cf6', '#d946ef'], curve: 'linear' } },
    { id: 'harbor', name: { 'zh-CN': '海港', en: 'Harbor' }, values: { seriesColors: ['#14b8a6', '#38bdf8', '#f59e0b'], curve: 'monotone', currency: 'EUR' } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { seriesColors: ['#f97316', '#facc15', '#f43f5e'], curve: 'monotone', range: '30d', currency: 'GBP' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'tremor-blocks',
      repo: 'tremorlabs/tremor-blocks',
      sha: 'b319e8d3d3678a4f60f4802f7e85bc1abc52d598',
      paths: ['src/content/components/chart-compositions/chart-composition-01.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Tremor Labs, Inc.'],
    },
    modifications: [
      'Replaced the recharts-based LineChart with a hand-drawn SVG line chart (grid, axes, legend, crosshair, tooltip, keyboard inspection) and the Table components with plain table markup; cx is now cn.',
      'Ported gray palette classes to Motif theme tokens; currency, fund colors, curve, range, table visibility and row-to-line hover linking are params.',
      'Renamed the third fund to an invented name, added a motion line draw-in with a reduced-motion path, and controlled hoverIndex/highlight props for the demo autoplay.',
    ],
    assets: [],
  },
})
