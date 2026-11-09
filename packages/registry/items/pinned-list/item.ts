import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'pinned-list',
  status: 'published',
  title: { 'zh-CN': '置顶列表', en: 'Pinned List' },
  summary: {
    'zh-CN': '点一下就把这一行置顶：它带着回弹飞进顶部的置顶区，图钉转 45°、左侧亮起一道色条，下面的行依次补上空位；可以限制置顶数量，支持键盘操作。适合会话、项目和收藏的搜索。',
    en: 'Click a row and it launches into the pinned group on an overshooting spring: the pin snaps 45°, an accent rail grows on its edge and the rows below close the gap one after another. A max-pinned limit, a divider and full keyboard support. For chats, projects and saved searches.',
  },
  kind: 'component',
  category: 'data',
  tags: ['list', 'pin', 'favorites', 'reorder', 'layout animation', 'keyboard', 'inbox'],
  runtime: ['react', 'motion'],
  entry: { file: 'pinned-list.tsx', export: 'PinnedList' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'pinned-list.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'maxPinned', type: 'number', group: 'interaction', label: { 'zh-CN': '最多置顶', en: 'Max pinned' }, hint: { 'zh-CN': '达到上限后其余行变灰、不能再置顶', en: 'At the limit the other rows dim and cannot be pinned' }, default: 5, min: 1, max: 8, step: 1, safe: [3, 6] },
    { key: 'showDivider', type: 'boolean', group: 'look', label: { 'zh-CN': '分隔线', en: 'Divider' }, default: true },
    {
      key: 'density',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '密度', en: 'Density' },
      default: 'comfortable',
      options: [
        { value: 'comfortable', label: { 'zh-CN': '舒适', en: 'Comfortable' } },
        { value: 'compact', label: { 'zh-CN': '紧凑', en: 'Compact' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '置顶行的色条和图钉', en: 'The rail and pin of pinned rows' }, default: '#fe65b0' },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '飞入弹簧', en: 'Launch spring' }, default: { visualDuration: 0.3, bounce: 0.3 } },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '列表名称', en: 'List name' }, hint: { 'zh-CN': '给读屏软件的列表名，演示里也作标题', en: 'Names the list for assistive technology; the demo also shows it as the heading' }, default: 'Inbox', maxLength: 32 },
  ],
  presets: [
    { id: 'blossom', name: { 'zh-CN': '樱粉', en: 'Blossom' }, values: { maxPinned: 5, showDivider: true, density: 'comfortable', accent: '#fe65b0', spring: { visualDuration: 0.3, bounce: 0.3 } } },
    { id: 'harbor', name: { 'zh-CN': '港湾', en: 'Harbor' }, values: { maxPinned: 4, showDivider: true, density: 'compact', accent: '#38bdf8', spring: { visualDuration: 0.25, bounce: 0.15 } } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { maxPinned: 5, showDivider: false, density: 'comfortable', accent: '#fb923c', spring: { visualDuration: 0.4, bounce: 0.45 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Controlled: pinnedIds + onPinnedChange. Uncontrolled: mark items with pinned: true. Pinned rows keep the order of the items array.',
      'Each row is a role="button" with aria-pressed and a roving tabindex: arrows, Home and End move between rows; P, Enter or Space toggles. Give every item a distinct title, it becomes the accessible name.',
      'Put the list in a scroller with a fixed height when there are many rows; the rows keep 4px of padding so the spring overshoot and focus ring are not clipped.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 3.8, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/pinned-list/index.tsx', 'apps/docs/examples/pinned-list.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'cn comes from @motif/runtime; the lucide Pin icon became a hand-drawn inline SVG; the brand color is an accent parameter.',
      'Pinned and unpinned rows are rendered from one keyed array so a row that changes group is moved instead of remounted, which keeps its layout animation.',
      'The landing pop resets when its animation completes instead of on a setTimeout.',
      'maxPinned, showDivider, label, the launch spring (visualDuration + bounce) and a compact density are parameters.',
      'The demo is adapted from the upstream example with invented content and icons, plain buttons, and an autoplay that pins and unpins rows.',
    ],
    assets: [],
  },
})
