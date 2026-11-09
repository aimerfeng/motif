import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'input-search-generate',
  status: 'published',
  title: { 'zh-CN': '搜索生成切换框', en: 'Search / Generate Field' },
  summary: {
    'zh-CN': '胶囊形输入框，左侧图标按钮在「搜索」与「生成图片」两种模式间切换，占位文字逐字模糊浮现，生成模式下外圈带一圈强调色。适合 AI 搜索栏和素材库。',
    en: 'A pill field whose icon button flips it between search and image-generate modes; the placeholder letters blur in one by one and generate mode gets a tinted ring. For AI search bars and asset libraries.',
  },
  kind: 'component',
  category: 'input',
  tags: ['search', 'ai', 'generate', 'input', 'placeholder', 'morph'],
  runtime: ['react', 'motion'],
  entry: { file: 'input-search-generate.tsx', export: 'InputSearchGenerate' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'input-search-generate.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'mode',
      type: 'select',
      group: 'content',
      label: { 'zh-CN': '初始模式', en: 'Initial mode' },
      default: 'search',
      options: [
        { value: 'search', label: { 'zh-CN': '搜索', en: 'Search' } },
        { value: 'generate', label: { 'zh-CN': '生成', en: 'Generate' } },
      ],
    },
    { key: 'searchPlaceholder', type: 'text', group: 'content', label: { 'zh-CN': '搜索提示', en: 'Search placeholder' }, default: 'Search anything...', maxLength: 32 },
    { key: 'generatePlaceholder', type: 'text', group: 'content', label: { 'zh-CN': '生成提示', en: 'Generate placeholder' }, default: 'Generate Image', maxLength: 32 },
    { key: 'flipStagger', type: 'number', group: 'motion', label: { 'zh-CN': '逐字间隔', en: 'Letter stagger' }, default: 0.02, min: 0, max: 0.06, step: 0.005, unit: 's', safe: [0.01, 0.04] },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '生成模式强调色', en: 'Generate accent' }, default: '#a855f7' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 999, min: 8, max: 999, step: 1, unit: 'px', safe: [12, 999] },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '最大宽度', en: 'Max width' }, default: 384, min: 280, max: 560, step: 4, unit: 'px' },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '图标弹簧', en: 'Icon spring' }, default: { visualDuration: 0.25, bounce: 0 } },
  ],
  presets: [
    { id: 'original', name: { 'zh-CN': '原味', en: 'Original' }, values: { mode: 'search', accent: '#a855f7', radius: 999 } },
    { id: 'studio', name: { 'zh-CN': '画室', en: 'Studio' }, values: { mode: 'generate', accent: '#f97316', radius: 16, flipStagger: 0.03 } },
    { id: 'tide', name: { 'zh-CN': '潮汐', en: 'Tide' }, values: { accent: '#06b6d4', radius: 999, spring: { visualDuration: 0.35, bounce: 0.3 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.9, posterTime: 2.2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uselayouts',
      repo: 'iurvish/uselayouts',
      sha: '678a478e30272d8101cea97bc6147e0df9dcd652',
      paths: ['registry/default/example/morphing-input.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Urvish Mali'],
    },
    modifications: [
      'Hugeicons replaced with inline SVG icons; the shadcn Input replaced with a native input.',
      'Placeholders, initial mode, letter stagger, radius, width and icon spring exposed as props; controlled mode / value props and onSubmit added.',
      'Added a tinted accent ring in generate mode, aria-labels on the buttons and focus-visible rings; reduced motion drops the letter and icon animation.',
    ],
    assets: [],
  },
})
