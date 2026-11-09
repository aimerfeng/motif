import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'emoji-picker-grid',
  status: 'published',
  title: { 'zh-CN': '表情选择器', en: 'Emoji Picker' },
  summary: {
    'zh-CN': '消息输入框旁的表情按钮，弹出带搜索框的分组表情网格，方向键上下左右地在格子间移动，选中后插入到光标处并把焦点交还输入框。可加分类标签和常用一行。适合聊天输入框、评论和表情回应。',
    en: 'An emoji button beside the message input opens a searchable, grouped emoji grid you move through with all four arrow keys; picking inserts at the caret and hands focus back. Optional category tabs and a frequently-used row. For chat composers, comments and reactions.',
  },
  kind: 'component',
  category: 'popover',
  tags: ['emoji', 'picker', 'popover', 'grid', 'autocomplete', 'chat', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'emoji-picker-grid.tsx', export: 'EmojiPickerGrid' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'emoji-picker-grid.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'columns', type: 'number', group: 'layout', label: { 'zh-CN': '列数', en: 'Columns' }, default: 5, min: 4, max: 8, step: 1, safe: [5, 7] },
    { key: 'cellSize', type: 'number', group: 'layout', label: { 'zh-CN': '格子宽度', en: 'Cell width' }, hint: { 'zh-CN': '弹层宽度 = 列数 × 格宽，超出容器时自动收窄', en: 'Popup width is columns × cell width, narrowed to fit its container' }, default: 48, min: 36, max: 52, step: 1, unit: 'px', safe: [40, 48] },
    {
      key: 'accent',
      type: 'color',
      group: 'look',
      label: { 'zh-CN': '高亮色', en: 'Highlight' },
      hint: { 'zh-CN': '高亮格和当前分类的底色', en: 'Background of the highlighted cell and the current category' },
      default: '#262626',
    },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 0, min: 0, max: 14, step: 1, unit: 'px', safe: [0, 10] },
    { key: 'showCategories', type: 'boolean', group: 'layout', label: { 'zh-CN': '分类标签', en: 'Category tabs' }, default: false },
    { key: 'recentRow', type: 'boolean', group: 'layout', label: { 'zh-CN': '常用一行', en: 'Frequently used row' }, default: false },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹出弹簧', en: 'Open spring' }, default: { visualDuration: 0.15, bounce: 0 } },
  ],
  presets: [
    { id: 'plain', name: { 'zh-CN': '素格', en: 'Plain Grid' }, values: { columns: 5, cellSize: 48, accent: '#262626', radius: 0, showCategories: false, recentRow: false } },
    {
      id: 'composer',
      name: { 'zh-CN': '晚风', en: 'Evening Chat' },
      values: { columns: 6, cellSize: 44, accent: '#3b82f6', radius: 10, showCategories: true, recentRow: true, spring: { visualDuration: 0.25, bounce: 0.2 } },
    },
    {
      id: 'reactions',
      name: { 'zh-CN': '柠檬汽水', en: 'Lemon Soda' },
      values: { columns: 7, cellSize: 40, accent: '#facc15', radius: 6, showCategories: true, recentRow: false, spring: { visualDuration: 0.2, bounce: 0.1 } },
    },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Focus stays in the search field (role="combobox" with aria-activedescendant); arrow keys move the highlight in two dimensions across the grid, Enter inserts, Escape closes and returns focus to the trigger.',
      'The popup is absolutely positioned below the input, aligned to its right edge: leave room under the composer or move the popup with className if the composer sits at the bottom of the screen.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.5, posterTime: 3.4, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'base-ui',
      repo: 'mui/base-ui',
      sha: '6a29b4b3b414251bf0ed23aa36e145d55e947c37',
      paths: [
        'docs/src/app/(docs)/react/components/autocomplete/demos/grid/css-modules/index.tsx',
        'docs/src/app/(docs)/react/components/autocomplete/demos/grid/css-modules/index.module.css',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2019 Material-UI SAS'],
    },
    modifications: [
      'Replaced @base-ui/react Autocomplete (grid mode) with a hand-rolled popover: search combobox with aria-activedescendant, grid/rowgroup/row/gridcell roles, two-dimensional arrow keys plus Home/End/Enter/Escape, outside-click close.',
      'CSS module rewritten as Tailwind classes on Motif theme tokens; the highlighted cell uses an accent color.',
      'Kept the emoji data, chunked rows, contains-filter and caret insertion logic; added optional category tabs and a frequently-used row.',
      'Added columns, cell width, accent, radius, category tabs, recent row and spring params; the popup scale/fade uses a motion/react spring, instant under reduced motion; open/highlighted/query props let the demo autoplay.',
    ],
    assets: [],
  },
})
