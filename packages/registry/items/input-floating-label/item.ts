import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'input-floating-label',
  status: 'published',
  title: { 'zh-CN': '浮动标签输入框', en: 'Floating Label Input' },
  summary: {
    'zh-CN': '标签在空输入框里当占位符，聚焦或写入内容时缩小飘到左上角，边框亮起强调色光环。密码框自带显示开关，错误提示会展开并轻轻抖动。适合登录、注册和资料表单。',
    en: 'The label sits inside the empty field and lifts to the corner on focus or input while the border lights up with an accent halo. Password fields get a reveal toggle and errors unfold with a small shake. Made for sign-in, sign-up and profile forms.',
  },
  kind: 'component',
  category: 'input',
  tags: ['input', 'floating-label', 'form', 'text-field', 'password', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'input-floating-label.tsx', export: 'InputFloatingLabel' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'input-floating-label.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '样式', en: 'Variant' },
      default: 'outline',
      options: [
        { value: 'outline', label: { 'zh-CN': '描边', en: 'Outline' } },
        { value: 'filled', label: { 'zh-CN': '填充', en: 'Filled' } },
        { value: 'underline', label: { 'zh-CN': '下划线', en: 'Underline' } },
      ],
    },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#a78bfa' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 0, max: 24, step: 1, unit: 'px', safe: [6, 18] },
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
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.3, bounce: 0.15 } },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '标签文案', en: 'Label' }, default: 'Email address', maxLength: 28 },
    { key: 'placeholder', type: 'text', group: 'content', label: { 'zh-CN': '占位文案', en: 'Placeholder' }, hint: { 'zh-CN': '标签飘起后才出现', en: 'Appears once the label has floated' }, default: 'you@company.com', maxLength: 28 },
  ],
  presets: [
    { id: 'lilac', name: { 'zh-CN': '丁香', en: 'Lilac' }, values: { variant: 'outline', color: '#a78bfa', radius: 12, size: 'md' } },
    { id: 'slate-fill', name: { 'zh-CN': '石板', en: 'Slate' }, values: { variant: 'filled', color: '#38bdf8', radius: 10, size: 'md', spring: { visualDuration: 0.24, bounce: 0.05 } } },
    { id: 'ledger', name: { 'zh-CN': '账本', en: 'Ledger' }, values: { variant: 'underline', color: '#34d399', size: 'lg', spring: { visualDuration: 0.36, bounce: 0.2 } } },
    { id: 'pebble', name: { 'zh-CN': '卵石', en: 'Pebble' }, values: { variant: 'outline', color: '#fb7185', radius: 24, size: 'lg', spring: { visualDuration: 0.42, bounce: 0.35 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use for text fields in forms where vertical space is tight and the label must stay visible after the user types.'],
    rules: [
      'The label prop is the visible label and the accessible name (a real <label htmlFor>). Never use the placeholder as the only label.',
      'Pass error to show a red state with role="alert" text; pass hint for neutral helper text. Standard input props (type, name, autoComplete, required) go straight through.',
      'type="password" gets a built-in show/hide button; do not add a second one.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.7, posterTime: 4.4, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/animated-input/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Rebuilt the floating label with a spring on transform only (translate + scale) instead of a fixed-duration tween, and made it depend on focus or content so controlled and uncontrolled values both work.',
      'Added outline / filled / underline variants, an accent color with a focus halo, three sizes, a leading icon slot, a password reveal toggle and animated error / hint text.',
      'A focused prop lets the demo autoplay show the focus state. Reduced motion removes springs and the error shake.',
    ],
    assets: [],
  },
})
