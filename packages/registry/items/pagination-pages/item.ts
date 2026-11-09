import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'pagination-pages',
  status: 'published',
  title: { 'zh-CN': '分页器', en: 'Pagination' },
  summary: {
    'zh-CN': '当前页的高亮块会滑到新页码上，省略号随当前页自动收放；带首页、上一页、下一页、末页按钮，「跳转到」输入框，以及每页条数选择和「21–40 / 312」范围提示。适合表格、搜索结果和归档列表。',
    en: 'A highlight glides to the current page while ellipses adapt around it, with first / previous / next / last buttons, a "Go to page" field and a rows-per-page select with a "21–40 of 312" range label. For tables, search results and archives.',
  },
  kind: 'component',
  category: 'navigation',
  tags: ['pagination', 'pages', 'table', 'navigation', 'rows per page'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'pagination-pages.tsx', export: 'PaginationPages' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'pagination-pages.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#6366f1' },
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '当前页样式', en: 'Active style' },
      default: 'outline',
      options: [
        { value: 'outline', label: { 'zh-CN': '描边', en: 'Outline' } },
        { value: 'solid', label: { 'zh-CN': '实心', en: 'Solid' } },
      ],
    },
    { key: 'siblings', type: 'number', group: 'layout', label: { 'zh-CN': '两侧页码数', en: 'Siblings' }, hint: { 'zh-CN': '当前页两侧各显示几个页码', en: 'Pages shown on each side of the current one' }, default: 1, min: 0, max: 2, step: 1 },
    { key: 'showJump', type: 'boolean', group: 'layout', label: { 'zh-CN': '跳转输入框', en: 'Go to page' }, default: true },
    { key: 'showPageSize', type: 'boolean', group: 'layout', label: { 'zh-CN': '每页条数', en: 'Rows per page' }, default: true },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 8, min: 0, max: 18, step: 1, unit: 'px', safe: [4, 18] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.3, bounce: 0.2 } },
  ],
  presets: [
    { id: 'ledger', name: { 'zh-CN': '账本', en: 'Ledger' }, values: { accent: '#6366f1', variant: 'outline', radius: 8 } },
    { id: 'meadow', name: { 'zh-CN': '草地', en: 'Meadow' }, values: { accent: '#22c55e', variant: 'solid', radius: 18, spring: { visualDuration: 0.4, bounce: 0.4 } } },
    { id: 'terminal', name: { 'zh-CN': '终端', en: 'Terminal' }, values: { accent: '#f59e0b', variant: 'solid', radius: 2, siblings: 2, spring: { visualDuration: 0.18, bounce: 0 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.4, posterTime: 2.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: [
        'registry/bases/base/ui/pagination.tsx',
        'registry-reui/bases/base/components/pagination/c-pagination-15.tsx',
        'registry-reui/bases/base/components/pagination/c-pagination-14.tsx',
        'registry-reui/bases/base/components/pagination/c-pagination-12.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      'Merged the three static examples (page summary + select, go-to-page input, rows per page + first/last) into one stateful component with page, pageSize and total.',
      'Page list with ellipses is computed from the current page and a siblings param; the active highlight slides with a motion layoutId spring.',
      'base-ui Button, Input and NativeSelect replaced with native button, input and select elements; IconPlaceholder icons inlined as SVG.',
      'Added accent, active style, radius and spring params; cn comes from @motif/runtime.',
    ],
    assets: [],
  },
})
