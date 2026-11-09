import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'kanban-board',
  status: 'published',
  title: { 'zh-CN': '看板', en: 'Kanban Board' },
  summary: {
    'zh-CN': '按状态分列的任务看板：卡片可以在列内排序，也能拖到别的列，拿起时带阴影微微倾斜，其他卡片弹性让位，列头计数实时更新；也能用空格加方向键移动。适合任务管理和产品路线图。',
    en: 'A task board with one column per status. Cards reorder within a column or move to another; the picked card lifts with a shadow and a slight tilt, the rest make room on a spring and the column counts follow. Space and the arrow keys move cards too. For task trackers and roadmaps.',
  },
  kind: 'section',
  category: 'dashboard',
  tags: ['kanban', 'board', 'drag and drop', 'tasks', 'roadmap', 'sortable'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'kanban-board.tsx', export: 'Kanban' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'kanban-board.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '拖动中的卡片描边、目标列和焦点框', en: 'Ring on the dragged card, the target column and focus' }, default: '#7c8cff', group: 'look' },
    {
      key: 'density',
      type: 'select',
      label: { 'zh-CN': '密度', en: 'Density' },
      default: 'comfortable',
      options: [
        { value: 'comfortable', label: { 'zh-CN': '舒适', en: 'Comfortable' } },
        { value: 'compact', label: { 'zh-CN': '紧凑', en: 'Compact' } },
      ],
      group: 'layout',
    },
    { key: 'radius', type: 'number', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 8, min: 0, max: 16, step: 1, unit: 'px', safe: [4, 12], group: 'look' },
    { key: 'showAvatars', type: 'boolean', label: { 'zh-CN': '显示负责人', en: 'Owner avatars' }, default: true, group: 'content' },
    { key: 'spring', type: 'spring', label: { 'zh-CN': '让位弹簧', en: 'Reorder spring' }, hint: { 'zh-CN': '卡片让位、拿起和落下的弹簧', en: 'Used when cards make room, lift and land' }, default: { visualDuration: 0.3, bounce: 0.2 }, group: 'motion' },
    { key: 'tilt', type: 'number', label: { 'zh-CN': '拿起时倾斜', en: 'Lift tilt' }, default: 2, min: 0, max: 6, step: 0.5, unit: 'deg', safe: [0, 4], group: 'motion' },
  ],
  presets: [
    { id: 'studio', name: { 'zh-CN': '工作室', en: 'Studio' }, values: { accent: '#7c8cff', density: 'comfortable', radius: 8, tilt: 2 } },
    { id: 'ledger', name: { 'zh-CN': '账簿', en: 'Ledger' }, values: { accent: '#34d399', density: 'compact', radius: 4, tilt: 0, showAvatars: false, spring: { visualDuration: 0.22, bounce: 0.05 } } },
    { id: 'sticky', name: { 'zh-CN': '便利贴', en: 'Sticky Notes' }, values: { accent: '#fbbf24', density: 'comfortable', radius: 12, tilt: 4, spring: { visualDuration: 0.36, bounce: 0.35 } } },
  ],
  dependencies: ['@motif/runtime', 'motion/react'],
  fonts: ['Geist Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    rules: [
      'The board is controlled: keep data in state and pass onDataChange; cards are reordered live while dragging, so onDragEnd only needs to persist. Give the board a fixed height (columns scroll on their own).',
    ],
  },
  capture: { zoom: 1.1, posterTime: 1.7, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kibo',
      repo: 'shadcnblocks/kibo',
      sha: '3d63cdb15b79d972e3dc38a10997987672f9b263',
      paths: ['packages/kanban/index.tsx', 'apps/docs/examples/kanban.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 — Present shadcnblocks'],
    },
    modifications: [
      'Replaced @dnd-kit/core and @dnd-kit/sortable with hand-written pointer dragging (5px activation, nearest-column and card-midline hit testing) and motion layout animations for the cards that make room; the keyboard sensor became space/enter to pick up and drop, arrow keys to move and escape to cancel, with the upstream announcements in a live region.',
      'Replaced tunnel-rat and DragOverlay with a portal into a fixed overlay that follows the pointer, lifts with a spring scale and tilt, and springs back onto the placeholder on drop.',
      'Cards are reordered live while dragging (upstream reorders across columns on drag over and within a column on drag end) and data is copied instead of mutated; the target column gets the ring instead of only an empty column.',
      'Replaced the shadcn Card, ScrollArea and Avatar with plain elements (initials instead of images); cn comes from @motif/runtime; transition-all became transition-shadow.',
      'Accent, corner radius, density, spring and tilt come from params; added a Kanban convenience component composed like the upstream example, with column counts and a horizontally scrolling layout on narrow screens.',
    ],
    assets: [],
  },
})
