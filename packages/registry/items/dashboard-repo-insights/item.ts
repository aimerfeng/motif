import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'dashboard-repo-insights',
  status: 'published',
  title: { 'zh-CN': '代码仓库洞察', en: 'Repository Insights' },
  summary: {
    'zh-CN': '一周仓库概览：时间范围选择、PR 与 Issue 的分段条、四格计数、提交与增删行摘要和贡献者柱图。适合开发者平台与内部工程看板。',
    en: 'A weekly repository summary: a range select, segmented bars for pull requests and issues, four counters, a commit and diff summary and a top-contributors chart. For developer platforms and internal engineering dashboards.',
  },
  kind: 'section',
  category: 'dashboard',
  tags: ['dashboard', 'github', 'repository', 'pull requests', 'contributors'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'dashboard-repo-insights.tsx', export: 'DashboardRepoInsights' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'dashboard-repo-insights.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'repoName', type: 'text', label: { 'zh-CN': '仓库名', en: 'Repository name' }, default: 'northwind/ledger', maxLength: 28, group: 'content' },
    { key: 'accent', type: 'color', label: { 'zh-CN': '进行中颜色', en: 'Open color' }, default: '#6366f1', group: 'look' },
    { key: 'tone', type: 'color', label: { 'zh-CN': '已完成颜色', en: 'Done color' }, default: '#10b981', group: 'look' },
    {
      key: 'range',
      type: 'select',
      label: { 'zh-CN': '时间范围', en: 'Range' },
      default: 'week',
      options: [
        { value: 'week', label: { 'zh-CN': '上周', en: 'Last week' } },
        { value: 'month', label: { 'zh-CN': '上月', en: 'Last month' } },
        { value: 'year', label: { 'zh-CN': '去年', en: 'Last year' } },
      ],
      group: 'content',
    },
    { key: 'contributors', type: 'number', label: { 'zh-CN': '贡献者数', en: 'Contributors' }, default: 5, min: 3, max: 5, step: 1, group: 'content' },
    {
      key: 'barStyle',
      type: 'select',
      label: { 'zh-CN': '贡献者图样式', en: 'Contributor chart' },
      default: 'bars',
      options: [
        { value: 'bars', label: { 'zh-CN': '横向柱图', en: 'Bar chart' } },
        { value: 'share', label: { 'zh-CN': '占比条', en: 'Share bar' } },
      ],
      group: 'look',
    },
    { key: 'showSummary', type: 'boolean', label: { 'zh-CN': '显示仓库摘要', en: 'Show summary' }, default: true, group: 'content' },
  ],
  presets: [
    { id: 'tremor', name: { 'zh-CN': '靛青', en: 'Indigo Mint' }, values: { accent: '#6366f1', tone: '#10b981', barStyle: 'bars' } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#f59e0b', tone: '#38bdf8', range: 'month', barStyle: 'share' } },
    { id: 'rose', name: { 'zh-CN': '蔷薇', en: 'Rosewater' }, values: { accent: '#f472b6', tone: '#a3e635', range: 'year', contributors: 4 } },
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
      paths: ['src/content/components/chart-compositions/chart-composition-02.tsx', 'src/components/CategoryBar.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Tremor Labs, Inc.'],
    },
    modifications: [
      'Replaced the recharts BarChart with a hand-drawn bar list, CategoryBar with a small segmented bar, the radix Select with a native select and Remix icons with inline SVG.',
      'Ported gray palette classes to Motif theme tokens; open/done colors, repository name, range, contributor count and chart style are params.',
      'Added an optional share bar with initial avatars, motion bar growth and a reduced-motion path; contributor names are invented.',
    ],
    assets: [],
  },
})
