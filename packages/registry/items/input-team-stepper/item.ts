import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'input-team-stepper',
  status: 'published',
  title: { 'zh-CN': '人数步进器', en: 'Team Size Stepper' },
  summary: {
    'zh-CN': '加减按钮控制人数：每加一位，头像就弹进重叠的头像组，数字跟着上下翻动；到了上限或下限，整排控件轻轻一抖。适合团队套餐、预订人数和按席位计价。',
    en: 'A plus / minus stepper: each added seat pops an avatar into the overlapping stack while the number rolls, and hitting a limit gives the control a small shake. For team plans, party size and seat-based pricing.',
  },
  kind: 'component',
  category: 'input',
  tags: ['stepper', 'counter', 'avatar', 'team', 'seats', 'form'],
  runtime: ['react', 'motion'],
  entry: { file: 'input-team-stepper.tsx', export: 'TeamSelector' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'input-team-stepper.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'min', type: 'number', group: 'layout', label: { 'zh-CN': '最少人数', en: 'Minimum' }, default: 1, min: 1, max: 3, step: 1 },
    { key: 'max', type: 'number', group: 'layout', label: { 'zh-CN': '最多人数', en: 'Maximum' }, default: 4, min: 3, max: 6, step: 1 },
    { key: 'overlap', type: 'number', group: 'layout', label: { 'zh-CN': '头像重叠', en: 'Avatar overlap' }, default: 12, min: 0, max: 20, step: 1, unit: 'px', safe: [6, 16] },
    {
      key: 'avatarStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '头像样式', en: 'Avatar style' },
      default: 'neutral',
      options: [
        { value: 'neutral', label: { 'zh-CN': '中性灰', en: 'Neutral' } },
        { value: 'gradient', label: { 'zh-CN': '渐变色', en: 'Gradient' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '渐变头像和焦点环的颜色', en: 'Used by gradient avatars and the focus ring' }, default: '#a1a1aa' },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹出弹簧', en: 'Pop spring' }, default: { visualDuration: 0.3, bounce: 0.25 } },
    { key: 'shake', type: 'boolean', group: 'motion', label: { 'zh-CN': '到达上下限时抖动', en: 'Shake at limits' }, default: true },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '标题', en: 'Label' }, default: 'Team Size', maxLength: 24 },
  ],
  presets: [
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { avatarStyle: 'neutral', accent: '#a1a1aa', overlap: 12 } },
    { id: 'lagoon', name: { 'zh-CN': '泻湖', en: 'Lagoon' }, values: { avatarStyle: 'gradient', accent: '#14b8a6', overlap: 14, max: 5 } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { avatarStyle: 'gradient', accent: '#f97316', overlap: 8, spring: { visualDuration: 0.35, bounce: 0.45 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.8, posterTime: 2.6, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kokonutui',
      repo: 'kokonut-labs/kokonutui',
      sha: '83eec6d982d400a18438001a8efdbac1f159dd43',
      paths: ['components/kokonutui/team-selector.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 kokonutUI'],
    },
    modifications: [
      'DiceBear avatar URLs and next/image replaced by initials on generated circles (neutral or accent gradient, ink picked by luminance); lucide icons replaced by inline SVG.',
      'Exposed min, max, overlap, avatar style, accent, pop spring, shake and label as parameters; zinc colors mapped to theme tokens.',
      'Limit buttons use aria-disabled instead of disabled so pressing at a limit can trigger the shake; the shake runs through motion animate() instead of setTimeout.',
      'Added controlled value and a shakeSignal prop (used by the demo autoplay); the shell is a role="group" with arrow-key support.',
    ],
    assets: [],
  },
})
