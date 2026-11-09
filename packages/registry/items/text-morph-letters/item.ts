import { defineItem } from '@motif/schema'

const FONT_OPTIONS = [
  { value: 'Geist Variable', label: { 'zh-CN': 'Geist', en: 'Geist' } },
  { value: 'Inter Tight Variable', label: { 'zh-CN': 'Inter Tight', en: 'Inter Tight' } },
  { value: 'Space Grotesk Variable', label: { 'zh-CN': 'Space Grotesk', en: 'Space Grotesk' } },
  { value: 'Fraunces Variable', label: { 'zh-CN': 'Fraunces（衬线）', en: 'Fraunces (serif)' } },
  { value: 'JetBrains Mono Variable', label: { 'zh-CN': 'JetBrains Mono（等宽）', en: 'JetBrains Mono (mono)' } },
]

export default defineItem({
  schemaVersion: 1,
  slug: 'text-morph-letters',
  status: 'published',
  title: { 'zh-CN': '字母重组', en: 'Letter Morph' },
  summary: {
    'zh-CN': '换词时，两个词共有的字母滑到新位置，其余字母淡出淡入，「Monthly」变成「Yearly」读起来是一个连贯的动作。适合按钮文案、开关和价格切换。',
    en: 'When the text changes, letters shared by both words glide to their new positions while the rest fade out and in, so Monthly to Yearly reads as one fluid motion. For button labels, toggles and price switches.',
  },
  kind: 'effect',
  category: 'text',
  tags: ['text', 'morph', 'layout animation', 'letters', 'button label', 'motion'],
  runtime: ['react', 'motion'],
  entry: { file: 'text-morph-letters.tsx', export: 'TextMorph' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'text-morph-letters.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'words',
      type: 'text',
      group: 'content',
      label: { 'zh-CN': '词组', en: 'Words' },
      hint: { 'zh-CN': '用逗号分隔，按顺序循环；没有传 children 时使用', en: 'Comma-separated and looped in order; used when no children are passed' },
      default: 'Monthly, Yearly, Lifetime',
      maxLength: 80,
    },
    { key: 'interval', type: 'number', group: 'motion', label: { 'zh-CN': '换词间隔', en: 'Interval' }, default: 1.8, min: 0.8, max: 5, step: 0.1, unit: 's', safe: [1.2, 3] },
    { key: 'stiffness', type: 'number', group: 'motion', label: { 'zh-CN': '弹簧刚度', en: 'Stiffness' }, default: 280, min: 100, max: 600, step: 10, safe: [180, 420] },
    { key: 'damping', type: 'number', group: 'motion', label: { 'zh-CN': '弹簧阻尼', en: 'Damping' }, default: 18, min: 8, max: 40, step: 1, safe: [12, 28] },
    {
      key: 'enter',
      type: 'select',
      group: 'motion',
      label: { 'zh-CN': '进出方式', en: 'Enter / exit' },
      default: 'fade',
      options: [
        { value: 'fade', label: { 'zh-CN': '淡入淡出', en: 'Fade' } },
        { value: 'blur', label: { 'zh-CN': '模糊', en: 'Blur' } },
        { value: 'rise', label: { 'zh-CN': '上浮', en: 'Rise' } },
      ],
    },
    { key: 'font', type: 'select', group: 'look', label: { 'zh-CN': '字体', en: 'Font' }, default: 'Geist Variable', options: FONT_OPTIONS },
    { key: 'size', type: 'number', group: 'look', label: { 'zh-CN': '字号', en: 'Size' }, default: 56, min: 16, max: 72, step: 1, unit: 'px', safe: [24, 64] },
    { key: 'weight', type: 'number', group: 'look', label: { 'zh-CN': '字重', en: 'Weight' }, default: 500, min: 300, max: 800, step: 50, safe: [400, 700] },
  ],
  presets: [
    { id: 'original', name: { 'zh-CN': '原样', en: 'Original' }, values: { enter: 'fade', stiffness: 280, damping: 18, font: 'Geist Variable', weight: 500 } },
    { id: 'mist', name: { 'zh-CN': '晨雾', en: 'Mist' }, values: { enter: 'blur', stiffness: 200, damping: 24, font: 'Fraunces Variable', weight: 400 } },
    { id: 'terminal', name: { 'zh-CN': '终端', en: 'Terminal' }, values: { enter: 'rise', stiffness: 420, damping: 26, font: 'JetBrains Mono Variable', weight: 500 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable', 'Inter Tight Variable', 'Space Grotesk Variable', 'Fraunces Variable', 'JetBrains Mono Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 2.3, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'motion-primitives',
      repo: 'ibelick/motion-primitives',
      sha: '120f64f6ca60348e251f929e9c81f11ccbe45eda',
      paths: ['components/core/text-morph.tsx', 'app/docs/text-morph/text-morph-button.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 ibelick'],
    },
    modifications: [
      'cn now comes from @motif/runtime; the upstream spring (stiffness, damping) and the enter/exit variant are parameters, with fade as the upstream default and blur / rise added.',
      'When no children are passed the component cycles through a comma-separated words list on the motif-runtime frame loop; font, size and weight are parameters.',
      'Added reduced-motion handling: transitions become instant and the word list holds on the first word.',
      'The demo adapts the upstream Continue/Confirm button, which also toggles on frame-loop time until it is clicked.',
      'Defaults moved into the generated defaults region.',
    ],
    assets: [],
  },
})
