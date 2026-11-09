import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'issue-property-picker',
  status: 'published',
  title: { 'zh-CN': '任务属性选择器', en: 'Issue Property Picker' },
  summary: {
    'zh-CN': '像 Linear 那样给任务设状态、优先级和负责人：进度圆圈、信号格和首字母头像，点开是可搜索的列表，数字键直接选，选中后触发按钮里的图标随之变形。适合任务管理和 CRM。',
    en: 'Linear-style property menus for a task: status circles, priority bars and initials avatars. Each opens a searchable list with number-key shortcuts, and the trigger icon morphs to the new value. For issue trackers and CRMs.',
  },
  kind: 'component',
  category: 'select',
  tags: ['combobox', 'select', 'status', 'priority', 'assignee', 'issue', 'a11y'],
  runtime: ['react', 'motion', 'css', 'svg'],
  entry: { file: 'issue-property-picker.tsx', export: 'IssuePropertyPicker' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'issue-property-picker.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'property',
      type: 'select',
      group: 'content',
      label: { 'zh-CN': '属性', en: 'Property' },
      default: 'status',
      options: [
        { value: 'status', label: { 'zh-CN': '状态', en: 'Status' } },
        { value: 'priority', label: { 'zh-CN': '优先级', en: 'Priority' } },
        { value: 'assignee', label: { 'zh-CN': '负责人', en: 'Assignee' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#6366f1' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 8, min: 2, max: 16, step: 1, unit: 'px', safe: [4, 12] },
    {
      key: 'triggerStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '按钮样式', en: 'Trigger style' },
      default: 'outline',
      options: [
        { value: 'outline', label: { 'zh-CN': '描边', en: 'Outline' } },
        { value: 'ghost', label: { 'zh-CN': '透明', en: 'Ghost' } },
      ],
    },
    { key: 'showShortcuts', type: 'boolean', group: 'interaction', label: { 'zh-CN': '显示数字快捷键', en: 'Show number shortcuts' }, default: true },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.3, bounce: 0.35 } },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '宽度', en: 'Width' }, default: 240, min: 180, max: 320, step: 4, unit: 'px', safe: [200, 280] },
  ],
  presets: [
    { id: 'linear', name: { 'zh-CN': '靛夜', en: 'Indigo Night' }, values: { property: 'status', accent: '#6366f1', radius: 8, triggerStyle: 'outline' } },
    { id: 'signal', name: { 'zh-CN': '信号', en: 'Signal' }, values: { property: 'priority', accent: '#f59e0b', radius: 6, triggerStyle: 'ghost', spring: { visualDuration: 0.25, bounce: 0.2 } } },
    { id: 'roster', name: { 'zh-CN': '花名册', en: 'Roster' }, values: { property: 'assignee', accent: '#10b981', radius: 12, triggerStyle: 'outline', spring: { visualDuration: 0.4, bounce: 0.5 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.6, posterTime: 2.2, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: [
        'registry-reui/bases/base/components/combobox/c-combobox-21.tsx',
        'registry-reui/bases/base/components/combobox/c-combobox-22.tsx',
        'registry-reui/bases/base/components/combobox/c-combobox-28.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      'Merged the status, priority and assignee combobox patterns into one component selected by a property param, keeping their options, labels and glyph colors.',
      'Replaced the Base UI combobox, button, field and avatar with a hand-rolled trigger, search input and listbox (aria-activedescendant, arrow keys, Enter, Escape).',
      'Icon-library placeholders replaced by inline SVG glyphs; avatar photos replaced by initials avatars.',
      'Added number-key shortcuts, an accent-tinted moving highlight, a morphing trigger icon (motion/react spring), and accent, radius, trigger style and width params.',
      'Demo autoplay drives the picker through useFrameLoop.',
    ],
    assets: [],
  },
})
