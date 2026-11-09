import { defineItem } from '@motif/schema'

const BASE = 'src/content/components/table-actions'

export default defineItem({
  schemaVersion: 1,
  slug: 'table-bulk-select',
  status: 'published',
  title: { 'zh-CN': '批量操作表格', en: 'Bulk Action Table' },
  summary: {
    'zh-CN': '每行带复选框，表头全选支持半选状态；勾选后底部浮起一条操作栏，显示已选数量和「批量编辑」「全部删除」，也可以换成带 E / ⌘D 快捷键的命令条。适合工作区、成员、账单这类后台列表。',
    en: 'Row checkboxes with an indeterminate select-all; picking rows lifts a floating bar with the count, Bulk edit and Delete all, or a command bar with E and ⌘D keycaps. Made for admin lists of workspaces, members or invoices.',
  },
  kind: 'component',
  category: 'table',
  tags: ['table', 'selection', 'bulk-actions', 'checkbox', 'toolbar', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'table-bulk-select.tsx', export: 'TableBulkSelect' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'table-bulk-select.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#3b82f6' },
    {
      key: 'barStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '操作栏', en: 'Action bar' },
      default: 'command',
      options: [
        { value: 'command', label: { 'zh-CN': '命令条（快捷键）', en: 'Command bar (shortcuts)' } },
        { value: 'card', label: { 'zh-CN': '浮动卡片', en: 'Floating card' } },
        { value: 'header', label: { 'zh-CN': '表头内嵌', en: 'In the header' } },
      ],
    },
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
    { key: 'zebra', type: 'boolean', group: 'look', label: { 'zh-CN': '斑马纹', en: 'Zebra rows' }, default: false },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '按钮圆角', en: 'Button radius' }, hint: { 'zh-CN': '命令条始终是胶囊形', en: 'The command bar is always a pill' }, default: 6, min: 0, max: 12, step: 1, unit: 'px', safe: [4, 8] },
  ],
  presets: [
    { id: 'console', name: { 'zh-CN': '控制台', en: 'Console' }, values: { accent: '#3b82f6', barStyle: 'command', density: 'default', zebra: false, radius: 6 } },
    { id: 'ledger', name: { 'zh-CN': '账簿', en: 'Ledger' }, values: { accent: '#10b981', barStyle: 'card', density: 'dense', zebra: true, radius: 4 } },
    { id: 'amber-desk', name: { 'zh-CN': '琥珀台', en: 'Amber Desk' }, values: { accent: '#f59e0b', barStyle: 'header', density: 'default', zebra: false, radius: 8 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Selection is by row index: pass selected + onSelectedChange to control it; onBulkEdit / onDelete receive the selected indices.',
      'Shortcuts (E, Cmd/Ctrl+D, Escape to clear) fire only while focus is inside the table, so they never hijack the page.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1, posterTime: 3.2, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'tremor-blocks',
      repo: 'tremorlabs/tremor-blocks',
      sha: 'b319e8d3d3678a4f60f4802f7e85bc1abc52d598',
      paths: [
        `${BASE}/table-action-06.tsx`,
        `${BASE}/table-action-07.tsx`,
        `${BASE}/table-action-10.tsx`,
        'src/components/Table.tsx',
        'src/components/Checkbox.tsx',
        'src/components/Button.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Tremor Labs, Inc.'],
    },
    modifications: [
      'Merged table-action-06 (floating card), -07 (actions in the header) and -10 (command bar with keycaps) into one component with an action bar select.',
      '@tanstack/react-table replaced by hand-rolled index-based selection state; Radix Checkbox replaced by a button with role="checkbox" and aria-checked="mixed"; Table and Button primitives inlined; cx replaced by cn from @motif/runtime.',
      'Gray and blue colors mapped to theme tokens and an accent param with luminance-picked ink; density, zebra rows and button radius params added.',
      'The bar slides up with a motion spring instead of toggling hidden (fade only under reduced motion); E, Cmd/Ctrl+D and Escape shortcuts wired up; transition-all narrowed to the changed properties.',
    ],
    assets: [],
  },
})
