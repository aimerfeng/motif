import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'toggle-segmented',
  status: 'published',
  title: { 'zh-CN': '分段控件', en: 'Segmented Control' },
  summary: {
    'zh-CN': '一枚滑块在几个互斥选项间弹着移动，可只显示图标、文字或两者都要。适合切换视图（列表 / 网格 / 看板）、时间范围和主题。',
    en: 'One thumb springs between mutually exclusive options, with icons, text or both. Made for view switchers (list / grid / board), time ranges and theme pickers.',
  },
  kind: 'component',
  category: 'toggle',
  tags: ['segmented', 'radio', 'switcher', 'view-toggle', 'spring', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'toggle-segmented.tsx', export: 'ToggleSegmented' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'toggle-segmented.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'content',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '内容', en: 'Content' },
      default: 'both',
      options: [
        { value: 'both', label: { 'zh-CN': '图标 + 文字', en: 'Icon + text' } },
        { value: 'text', label: { 'zh-CN': '仅文字', en: 'Text only' } },
        { value: 'icons', label: { 'zh-CN': '仅图标', en: 'Icons only' } },
      ],
    },
    {
      key: 'thumb',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '滑块', en: 'Thumb' },
      default: 'raised',
      options: [
        { value: 'raised', label: { 'zh-CN': '浮起的卡片', en: 'Raised card' } },
        { value: 'solid', label: { 'zh-CN': '强调色实心', en: 'Solid accent' } },
      ],
    },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#8b5cf6' },
    {
      key: 'size',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '尺寸', en: 'Size' },
      default: 'md',
      options: [
        { value: 'sm', label: { 'zh-CN': '小', en: 'Small' } },
        { value: 'md', label: { 'zh-CN': '中', en: 'Medium' } },
        { value: 'lg', label: { 'zh-CN': '大', en: 'Large' } },
      ],
    },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 4, max: 24, step: 1, unit: 'px', safe: [6, 20] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.32, bounce: 0.18 } },
  ],
  presets: [
    { id: 'paper', name: { 'zh-CN': '纸面', en: 'Paper' }, values: { content: 'both', thumb: 'raised', size: 'md', radius: 12 } },
    { id: 'ink-cap', name: { 'zh-CN': '墨色胶囊', en: 'Ink Capsule' }, values: { content: 'text', thumb: 'solid', color: '#6366f1', size: 'md', radius: 20, spring: { visualDuration: 0.4, bounce: 0.35 } } },
    { id: 'icon-rail', name: { 'zh-CN': '图标导轨', en: 'Icon Rail' }, values: { content: 'icons', thumb: 'raised', size: 'lg', radius: 14 } },
    { id: 'lime-tab', name: { 'zh-CN': '青柠', en: 'Lime' }, values: { content: 'both', thumb: 'solid', color: '#84cc16', size: 'sm', radius: 8, spring: { visualDuration: 0.24, bounce: 0.1 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use to pick exactly one of 2 to 5 short options where the change applies immediately (view mode, range, theme). For navigating between content sections use tabs-animated.'],
    rules: [
      'Options are { value, label, icon? }. With content="icons" the label becomes the aria-label, so always set it.',
      'Do not exceed five options; labels stay one word.',
      'Arrow keys select immediately; Tab enters and leaves the group as a single stop.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.7, posterTime: 4.1, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uselayouts',
      repo: 'iurvish/uselayouts',
      sha: '678a478e30272d8101cea97bc6147e0df9dcd652',
      paths: ['registry/default/example/discrete-tabs.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Urvish Mali'],
    },
    modifications: [
      'Reduced to the shared-layoutId sliding thumb and rebuilt it as an ARIA radiogroup with roving tabindex and Arrow / Home / End keys.',
      'Added content modes (icons, text, both), a raised or solid accent thumb, size and radius parameters.',
      'Spring is described by visualDuration + bounce; cn comes from @motif/runtime. Reduced motion makes the thumb jump.',
    ],
    assets: [],
  },
})
