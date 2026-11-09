import { defineItem } from '@motif/schema'

const BASE = 'registry-reui/bases/base'

export default defineItem({
  schemaVersion: 1,
  slug: 'data-grid-columns',
  status: 'published',
  title: { 'zh-CN': '可配置数据网格', en: 'Configurable Data Grid' },
  summary: {
    'zh-CN': '列可以排序、拖边缘调宽、固定到左右两侧（滚动时投下阴影）、拖表头换位、在列菜单里隐藏；表头吸顶，可选斑马纹和合计行。适合后台列表和数据分析表格。',
    en: 'Columns sort, resize from their edge, pin left or right with a shadow, reorder by dragging the header and hide from a columns menu; sticky header, optional striped rows and a totals footer. Made for admin lists and analytics tables.',
  },
  kind: 'component',
  category: 'table',
  tags: ['table', 'data-grid', 'columns', 'resize', 'pin', 'reorder', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'data-grid-columns.tsx', export: 'DataGrid' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'data-grid-columns.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '调宽指示线、勾选框和焦点框', en: 'Resize line, checkboxes and focus rings' }, default: '#3b82f6' },
    {
      key: 'density',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '密度', en: 'Density' },
      default: 'default',
      options: [
        { value: 'default', label: { 'zh-CN': '标准', en: 'Default' } },
        { value: 'dense', label: { 'zh-CN': '紧凑', en: 'Dense' } },
      ],
    },
    { key: 'striped', type: 'boolean', group: 'look', label: { 'zh-CN': '斑马纹', en: 'Striped rows' }, default: false },
    { key: 'cellBorder', type: 'boolean', group: 'look', label: { 'zh-CN': '单元格竖线', en: 'Cell borders' }, default: false },
    { key: 'headerSticky', type: 'boolean', group: 'layout', label: { 'zh-CN': '表头吸顶', en: 'Sticky header' }, default: true },
    { key: 'pinShadow', type: 'boolean', group: 'look', label: { 'zh-CN': '固定列阴影', en: 'Pinned column shadow' }, hint: { 'zh-CN': '有内容滚到固定列下面时出现', en: 'Appears while content scrolls under a pinned column' }, default: true },
    { key: 'showFooter', type: 'boolean', group: 'layout', label: { 'zh-CN': '合计行', en: 'Totals footer' }, default: true },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 0, max: 20, step: 1, unit: 'px', safe: [6, 14] },
  ],
  presets: [
    { id: 'ledger', name: { 'zh-CN': '账簿', en: 'Ledger' }, values: { accent: '#3b82f6', density: 'default', striped: false, cellBorder: false, pinShadow: true, showFooter: true, radius: 12 } },
    { id: 'spreadsheet', name: { 'zh-CN': '格纸', en: 'Graph Paper' }, values: { accent: '#10b981', density: 'dense', striped: false, cellBorder: true, pinShadow: false, showFooter: true, radius: 6 } },
    { id: 'tide-table', name: { 'zh-CN': '潮汐表', en: 'Tide Table' }, values: { accent: '#f59e0b', density: 'default', striped: true, cellBorder: false, pinShadow: true, showFooter: true, radius: 16 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Build the table with useDataGridTable({ data, columns, initialState }) and compose DataGrid > DataGridScrollArea > DataGridTable; turn features on with tableLayout (columnsPinnable, columnsResizable, columnsMovable, columnsVisibility, columnsDraggable).',
      'Column defs follow the TanStack shape (id, header, cell, footer, accessorFn, size / minSize, enableSorting / enableHiding / enableResizing / enableColumnOrdering, meta.headerTitle). Give every column a meta.headerTitle so the columns menu reads well.',
      'Totals belong in each column def\'s footer, so they move, pin and hide with their column; avoid colSpan footers.',
      'Pinned cells are opaque (bg-background); put the grid on bg-background, not bg-card, or pinned columns will look patched.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1, posterTime: 3, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: [
        `${BASE}/reui/data-grid/data-grid.tsx`,
        `${BASE}/reui/data-grid/data-grid-table.tsx`,
        `${BASE}/reui/data-grid/data-grid-table-dnd.tsx`,
        `${BASE}/reui/data-grid/data-grid-column-header.tsx`,
        `${BASE}/reui/data-grid/data-grid-column-visibility.tsx`,
        `${BASE}/components/data-grid/c-data-grid-13.tsx`,
        `${BASE}/components/data-grid/c-data-grid-15.tsx`,
        `${BASE}/components/data-grid/c-data-grid-16.tsx`,
        `${BASE}/components/data-grid/c-data-grid-20.tsx`,
        `${BASE}/components/data-grid/c-data-grid-24.tsx`,
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      '@tanstack/react-table replaced by a small column model (useDataGridTable) with the same method names for sorting, visibility, order, pinning and sizing; cell selection, editing, virtualization, row pinning, pagination and loading states were left out.',
      'dnd-kit column reordering replaced by pointer capture on the header grip (arrow keys move the column); the resize handle uses pointer events, resizes live and is a focusable separator (arrow keys, Enter or double-click to reset).',
      'base-ui DropdownMenu / Checkbox / ScrollArea and the Button primitive replaced by hand-rolled equivalents: a portaled menu with arrow-key navigation, Escape, outside click and a Columns submenu, menuitemcheckbox rows, and a native overflow scroll area. IconPlaceholder icons replaced by inline SVG; cn comes from @motif/runtime.',
      'Added a per-column footer (totals row), a pinned-column edge shadow that shows only while content scrolls beneath it, and Move left / right that skips pinned and hidden columns.',
      'Params map to tableLayout (density, striped, cell borders, sticky header, footer) plus accent and corner radius tokens; the open menu lives in table state so the demo autoplay can show it. Menus fade and scale with motion and only fade under reduced motion.',
    ],
    assets: [],
  },
})
