import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'card-disclosure',
  status: 'published',
  title: { 'zh-CN': '揭示卡片', en: 'Disclosure Card' },
  summary: {
    'zh-CN': '封面卡片底部有一条标题栏，点一下它就弹起成完整的详情面板，背后的画面同时放大并轻轻虚化；再点一下收回去。适合作品集、活动卡片和商品卡。',
    en: 'A cover card whose caption bar springs up into a full details panel when tapped, while the artwork behind it scales up and softly blurs; tap again to tuck it away. For gallery items, event cards and product tiles.',
  },
  kind: 'effect',
  category: 'card',
  tags: ['card', 'disclosure', 'reveal', 'spring', 'blur', 'expand'],
  runtime: ['react', 'motion'],
  entry: { file: 'card-disclosure.tsx', export: 'DisclosureCard' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'card-disclosure.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'trigger',
      type: 'select',
      group: 'interaction',
      label: { 'zh-CN': '展开方式', en: 'Open on' },
      hint: { 'zh-CN': '标题栏在任何方式下都可以点击或用键盘展开', en: 'The caption bar always works with click and keyboard' },
      default: 'click',
      options: [
        { value: 'click', label: { 'zh-CN': '点击', en: 'Click' } },
        { value: 'hover', label: { 'zh-CN': '悬停', en: 'Hover' } },
      ],
    },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.5, bounce: 0.12 } },
    { key: 'coverZoom', type: 'number', group: 'motion', label: { 'zh-CN': '封面放大', en: 'Cover zoom' }, default: 1.1, min: 1, max: 1.3, step: 0.01, safe: [1.04, 1.2] },
    { key: 'coverBlur', type: 'number', group: 'motion', label: { 'zh-CN': '封面虚化', en: 'Cover blur' }, default: 3, min: 0, max: 10, step: 0.5, unit: 'px', safe: [1, 6] },
    { key: 'panelColor', type: 'color', group: 'look', label: { 'zh-CN': '面板颜色', en: 'Panel color' }, hint: { 'zh-CN': '文字颜色按面板亮度自动选深浅', en: 'Text switches between light and dark ink by luminance' }, default: '#18181b' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 0, max: 28, step: 1, unit: 'px', safe: [8, 20] },
    { key: 'lineClamp', type: 'number', group: 'layout', label: { 'zh-CN': '正文行数', en: 'Body lines' }, default: 3, min: 1, max: 6, step: 1, safe: [2, 4] },
  ],
  presets: [
    { id: 'summit', name: { 'zh-CN': '山巅', en: 'Summit' }, values: { panelColor: '#18181b', coverZoom: 1.1, coverBlur: 3, radius: 12 } },
    { id: 'snowfield', name: { 'zh-CN': '雪原', en: 'Snowfield' }, values: { panelColor: '#fafafa', coverZoom: 1.15, coverBlur: 5, radius: 18, spring: { visualDuration: 0.6, bounce: 0.2 } } },
    { id: 'pine', name: { 'zh-CN': '松林', en: 'Pine' }, values: { panelColor: '#14532d', coverZoom: 1.06, coverBlur: 1.5, radius: 6, lineClamp: 4, spring: { visualDuration: 0.4, bounce: 0.05 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.6, posterTime: 3, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'motion-primitives',
      repo: 'ibelick/motion-primitives',
      sha: '120f64f6ca60348e251f929e9c81f11ccbe45eda',
      paths: ['components/core/disclosure.tsx', 'app/docs/disclosure/disclosure-card.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 ibelick'],
    },
    modifications: [
      'Merged the Disclosure primitive and the disclosure-card example into one file; the primitive keeps its structure and exports, cn comes from motif-runtime.',
      'Replaced the remote photo with an inline SVG mountain artwork and the brand copy with invented text.',
      'Spring, cover zoom and blur, panel color (ink picked by luminance), radius and line clamp are parameters; added an optional hover trigger and controlled open/onOpenChange.',
      'The content panel gets an id wired to aria-controls; with reduced motion the panel and cover change without animation.',
    ],
    assets: [],
  },
})
