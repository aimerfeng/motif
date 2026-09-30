import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'toggle-spring',
  status: 'published',
  title: { 'zh-CN': '弹簧开关', en: 'Spring Switch' },
  summary: {
    'zh-CN': '按下时滑块被压长，松开后带着一点回弹滑到另一端，颜色同步过渡。可以带对勾图标或 ON / OFF 文字。适合设置页里的通知、隐私、功能开关。',
    en: 'The thumb stretches under your finger and springs across on release while the track color follows. Optional check glyphs or ON / OFF text. Made for notification, privacy and feature settings.',
  },
  kind: 'component',
  category: 'toggle',
  tags: ['switch', 'toggle', 'spring', 'settings', 'form', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'toggle-spring.tsx', export: 'ToggleSpring' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'toggle-spring.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '样式', en: 'Variant' },
      default: 'icons',
      options: [
        { value: 'icons', label: { 'zh-CN': '对勾图标', en: 'Check icons' } },
        { value: 'plain', label: { 'zh-CN': '纯滑块', en: 'Plain' } },
        { value: 'labels', label: { 'zh-CN': 'ON / OFF 文字', en: 'ON / OFF text' } },
      ],
    },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '开启颜色', en: 'On color' }, default: '#8b5cf6' },
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '高度', en: 'Height' }, default: 32, min: 22, max: 48, step: 1, unit: 'px', safe: [26, 40] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, hint: { 'zh-CN': '大于半高即为完整胶囊', en: 'Anything above half the height is a full pill' }, default: 22, min: 4, max: 24, step: 1, unit: 'px', safe: [8, 24] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.32, bounce: 0.3 } },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '标签文案', en: 'Label' }, default: 'Push notifications', maxLength: 32 },
  ],
  presets: [
    { id: 'orchid', name: { 'zh-CN': '兰紫', en: 'Orchid' }, values: { variant: 'icons', color: '#8b5cf6', size: 32, radius: 22 } },
    { id: 'garden', name: { 'zh-CN': '草木', en: 'Garden' }, values: { variant: 'plain', color: '#22c55e', size: 30, radius: 22, spring: { visualDuration: 0.4, bounce: 0.45 } } },
    { id: 'console', name: { 'zh-CN': '控制台', en: 'Console' }, values: { variant: 'labels', color: '#0ea5e9', size: 30, radius: 8, spring: { visualDuration: 0.22, bounce: 0.1 } } },
    { id: 'tangerine', name: { 'zh-CN': '橘子汽水', en: 'Tangerine' }, values: { variant: 'icons', color: '#fb923c', size: 40, radius: 24, spring: { visualDuration: 0.45, bounce: 0.5 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use for settings that take effect immediately (on/off). For choices that need a Save button, prefer a checkbox.'],
    rules: [
      'Always give the switch a visible label (the label prop) or an aria-label; the component renders a native button with role="switch" and aria-checked.',
      'Controlled: pass checked + onCheckedChange. Uncontrolled: defaultChecked. The whole label row is clickable.',
      'Keep the on color a single accent; do not use red for the on state.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.9, posterTime: 4.9, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/animated-toggle/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Rebuilt around a native button with role="switch"; the whole label row toggles it.',
      'Added the press-to-stretch thumb, an accent color, height and corner radius parameters, and three variants (check icons, plain, ON / OFF text).',
      'Spring is described by visualDuration + bounce; cn comes from @motif/runtime. Reduced motion removes the spring and the icon rotation.',
      'A pressed prop lets a parent force the pressed shape (used by the demo autoplay).',
    ],
    assets: [],
  },
})
