import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'book-3d',
  status: 'published',
  title: { 'zh-CN': '立体书', en: '3D Book' },
  summary: {
    'zh-CN': '一本 CSS 3D 精装书：指针在书上从右往左移，封面和一叠书页就跟着扇形翻开，移开又合上。适合电子书、课程发布、报告和阅读类应用。',
    en: 'A hardcover book in CSS 3D whose cover and stack of pages fan open as the pointer moves across it, and close again when it leaves. For ebook and course launches, reports and reading apps.',
  },
  kind: 'effect',
  category: '3d',
  tags: ['book', '3d', 'css 3d', 'pages', 'hover', 'ebook'],
  runtime: ['react', 'css'],
  entry: { file: 'book-3d.tsx', export: 'InteractiveBook' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'book-3d.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'title', type: 'text', group: 'content', label: { 'zh-CN': '书名', en: 'Title' }, default: 'Notebook', maxLength: 18 },
    { key: 'coverColor', type: 'color', group: 'look', label: { 'zh-CN': '封面色', en: 'Cover color' }, default: '#bb013a' },
    {
      key: 'coverStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '封面样式', en: 'Cover style' },
      default: 'band',
      options: [
        { value: 'band', label: { 'zh-CN': '色带', en: 'Color band' } },
        { value: 'full', label: { 'zh-CN': '满版', en: 'Full bleed' } },
      ],
    },
    { key: 'pageCount', type: 'number', group: 'layout', label: { 'zh-CN': '书页数', en: 'Pages' }, default: 15, min: 4, max: 15, step: 1 },
    { key: 'maxOpen', type: 'number', group: 'motion', label: { 'zh-CN': '封面最大翻开角度', en: 'Cover max angle' }, default: 165, min: 90, max: 175, step: 1, unit: 'deg' },
    { key: 'perspective', type: 'number', group: 'layout', label: { 'zh-CN': '透视距离', en: 'Perspective' }, default: 1500, min: 600, max: 3000, step: 50, unit: 'px', safe: [1000, 2200] },
  ],
  presets: [
    { id: 'notebook', name: { 'zh-CN': '笔记本', en: 'Notebook' }, values: { title: 'Notebook', coverColor: '#bb013a', coverStyle: 'band', pageCount: 15 } },
    { id: 'field-guide', name: { 'zh-CN': '林间手册', en: 'Field Guide' }, values: { title: 'Field Guide', coverColor: '#1f5f4a', coverStyle: 'full', pageCount: 12 } },
    { id: 'ledger', name: { 'zh-CN': '旧账本', en: 'Ledger' }, values: { title: 'Ledger', coverColor: '#e3b341', coverStyle: 'full', pageCount: 8, maxOpen: 150 } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.6, posterTime: 2.2 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uselayouts',
      repo: 'iurvish/uselayouts',
      sha: '678a478e30272d8101cea97bc6147e0df9dcd652',
      paths: ['registry/default/example/3d-book.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Urvish Mali'],
    },
    modifications: [
      'Title, cover color, page count, cover max angle and perspective became params; added a full-bleed cover style with luminance-picked title ink.',
      'Added an optional controlled progress prop (used by the demo autoplay), an aria-label and an arrow-key/focus fallback for keyboard users.',
      'hsl(var(--x)) theme references switched to Motif tokens.',
    ],
    assets: [],
  },
})
