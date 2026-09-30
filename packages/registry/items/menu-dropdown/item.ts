import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'menu-dropdown',
  status: 'published',
  title: { 'zh-CN': '弹簧下拉菜单', en: 'Spring Dropdown Menu' },
  summary: {
    'zh-CN': '菜单从触发按钮处带着轻微模糊弹开，菜单项依次浮现，高亮条在选项之间滑动。带勾选项、危险操作和快捷键提示，方向键、首字母跳转、Esc 全键盘可用。适合工具栏、项目菜单和行内操作。',
    en: 'The menu springs open from its trigger with a touch of blur, items settle in one by one and a highlight bar glides between rows. Checkbox items, destructive actions and shortcut hints; arrows, type-ahead and Esc all work. Made for toolbars, project menus and row actions.',
  },
  kind: 'component',
  category: 'menu',
  tags: ['dropdown', 'menu', 'context', 'keyboard', 'typeahead', 'spring', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'menu-dropdown.tsx', export: 'MenuDropdown' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'menu-dropdown.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#8b5cf6' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 14, min: 6, max: 24, step: 1, unit: 'px', safe: [8, 20] },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '菜单宽度', en: 'Menu width' }, default: 248, min: 200, max: 340, step: 2, unit: 'px', safe: [220, 300] },
    {
      key: 'align',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '对齐', en: 'Align' },
      default: 'start',
      options: [
        { value: 'start', label: { 'zh-CN': '左对齐', en: 'Start' } },
        { value: 'end', label: { 'zh-CN': '右对齐', en: 'End' } },
      ],
    },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.34, bounce: 0.16 } },
    { key: 'showShortcuts', type: 'boolean', group: 'look', label: { 'zh-CN': '显示快捷键', en: 'Show shortcuts' }, default: true },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '触发按钮文案', en: 'Trigger label' }, default: 'Project', maxLength: 20 },
  ],
  presets: [
    { id: 'violet-glass', name: { 'zh-CN': '紫罗兰玻璃', en: 'Violet Glass' }, values: { color: '#8b5cf6', radius: 14, width: 248 } },
    { id: 'lime-tight', name: { 'zh-CN': '青柠', en: 'Lime' }, values: { color: '#a3e635', radius: 8, width: 224, spring: { visualDuration: 0.24, bounce: 0.05 } } },
    { id: 'coral-soft', name: { 'zh-CN': '珊瑚', en: 'Coral' }, values: { color: '#fb7185', radius: 22, width: 272, spring: { visualDuration: 0.44, bounce: 0.32 } } },
    { id: 'plain-cyan', name: { 'zh-CN': '素净', en: 'Plain' }, values: { color: '#22d3ee', radius: 10, width: 240, showShortcuts: false } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use for a short list (3 to 10) of commands on an object: rename, duplicate, share, delete. For choosing a value use a select; for navigation use links.'],
    rules: [
      'Pass items as MenuEntry[]: { id, label, icon?, shortcut?, danger? }, { type: "checkbox", id, label, checked? }, { type: "separator" }, { type: "label", label }. Handle onSelect(id, checked?).',
      'Follows the WAI-ARIA menu button pattern (role="menu", menuitem, menuitemcheckbox). Focus moves into the menu on open and returns to the trigger on Esc or after a choice. Do not put inputs or links inside items.',
      'Put destructive actions last, behind a separator, with danger: true. Checkbox items keep the menu open.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.5, posterTime: 4.9, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uselayouts',
      repo: 'iurvish/uselayouts',
      sha: '678a478e30272d8101cea97bc6147e0df9dcd652',
      paths: ['registry/default/example/smooth-dropdown.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Urvish Mali'],
    },
    modifications: [
      'Rewrote around the WAI-ARIA menu button pattern: roving focus with Arrow / Home / End, type-ahead, Esc returning focus to the trigger, Tab and outside click closing.',
      'Kept the spring reveal and added a blur-in, staggered items, a sliding highlight bar (shared layoutId), animated checkbox items, a danger style, shortcut hints and controlled open / highlight / checked props used by the demo autoplay.',
      'Spring is described by visualDuration + bounce; cn comes from @motif/runtime; reduced motion shortens everything to a plain fade.',
    ],
    assets: [],
  },
})
