import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'button-delete-undo',
  status: 'published',
  title: { 'zh-CN': '可撤销删除', en: 'Delete with Undo' },
  summary: {
    'zh-CN': '红色删除按钮点下后逐字变形成「撤销 + 倒计时」，留出几秒反悔时间，倒数归零才真正删除。适合删除账号、清空列表、收件箱和文件管理里的危险操作。',
    en: 'A red delete button that morphs letter by letter into an undo pill with a ticking countdown, leaving a few seconds before anything is gone. For destructive actions in account settings, lists, inboxes and file managers.',
  },
  kind: 'component',
  category: 'button',
  tags: ['delete', 'undo', 'countdown', 'destructive', 'button', 'morph'],
  runtime: ['react', 'motion'],
  entry: { file: 'delete-button.tsx', export: 'DeleteButton' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'delete-button.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'deleteText', type: 'text', group: 'content', label: { 'zh-CN': '删除文案', en: 'Delete label' }, default: 'Delete Account', maxLength: 20 },
    { key: 'cancelText', type: 'text', group: 'content', label: { 'zh-CN': '撤销文案', en: 'Undo label' }, default: 'Cancel Deletion', maxLength: 20 },
    { key: 'countdown', type: 'number', group: 'interaction', label: { 'zh-CN': '倒计时', en: 'Countdown' }, default: 10, min: 3, max: 20, step: 1, unit: 's', safe: [5, 12] },
    { key: 'deleteColor', type: 'color', group: 'look', label: { 'zh-CN': '删除色', en: 'Delete color' }, default: '#FE322A' },
    { key: 'softColor', type: 'color', group: 'look', label: { 'zh-CN': '浅底色', en: 'Soft color' }, default: '#FFEDF1' },
    { key: 'duration', type: 'number', group: 'motion', label: { 'zh-CN': '变形时长', en: 'Morph duration' }, default: 0.4, min: 0.2, max: 0.8, step: 0.05, unit: 's', safe: [0.3, 0.6] },
    { key: 'ease', type: 'easing', group: 'motion', label: { 'zh-CN': '变形缓动', en: 'Morph easing' }, default: [0.77, 0, 0.175, 1] },
  ],
  presets: [
    { id: 'alarm', name: { 'zh-CN': '警报', en: 'Alarm' }, values: { deleteColor: '#FE322A', softColor: '#FFEDF1' } },
    { id: 'ink', name: { 'zh-CN': '墨', en: 'Ink' }, values: { deleteColor: '#18181b', softColor: '#e4e4e7', deleteText: 'Remove file', cancelText: 'Undo', countdown: 5 } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { deleteColor: '#f97316', softColor: '#fff1e6', deleteText: 'Clear inbox', cancelText: 'Keep messages', duration: 0.5 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: ['Do the real deletion in onDelete, which fires when the countdown reaches zero; until then the action must stay reversible.'],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 2, posterTime: 3.2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uselayouts',
      repo: 'iurvish/uselayouts',
      sha: '678a478e30272d8101cea97bc6147e0df9dcd652',
      paths: ['registry/default/example/delete-button.tsx', 'registry/default/demo/delete-button-demo.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Urvish Mali'],
    },
    modifications: [
      'dialkit tuning panel replaced by item params (labels, countdown, colors, morph duration and easing); hugeicons undo icon replaced by an inline SVG.',
      'Added controlled deleting/count props for the demo autoplay, onDelete/onCancel callbacks, an aria-live status, focus-visible outlines and luminance-picked ink colors.',
      'Reduced motion collapses the transitions to instant changes.',
    ],
    assets: [],
  },
})
