import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'link-preview-card',
  status: 'published',
  title: { 'zh-CN': '链接预览卡片', en: 'Link Preview Card' },
  summary: {
    'zh-CN': '悬停或聚焦正文里的链接，稍等片刻弹出预览卡：配图加一段摘要，箭头指向链接；在几个链接之间移动时卡片不关闭，而是滑到新位置、换上新内容。适合文章、文档和聊天消息。',
    en: 'Hovering or focusing an inline link opens a preview card after a short delay, with a picture and a short summary and an arrow pointing at the link; moving between links keeps it open while it glides over and swaps in the new content. Made for articles, docs and chat messages.',
  },
  kind: 'component',
  category: 'popover',
  tags: ['preview card', 'hover card', 'popover', 'link', 'wiki', 'a11y'],
  runtime: ['react', 'motion', 'css', 'svg'],
  entry: { file: 'link-preview-card.tsx', export: 'LinkPreviewCard' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'link-preview-card.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'openDelay', type: 'number', group: 'interaction', label: { 'zh-CN': '打开延迟', en: 'Open delay' }, default: 600, min: 0, max: 1200, step: 50, unit: 'ms', safe: [300, 800] },
    { key: 'closeDelay', type: 'number', group: 'interaction', label: { 'zh-CN': '关闭延迟', en: 'Close delay' }, default: 300, min: 0, max: 800, step: 50, unit: 'ms', safe: [150, 400] },
    {
      key: 'side',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '弹出方向', en: 'Side' },
      default: 'bottom',
      options: [
        { value: 'bottom', label: { 'zh-CN': '下方', en: 'Bottom' } },
        { value: 'top', label: { 'zh-CN': '上方', en: 'Top' } },
      ],
    },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '内容宽度', en: 'Content width' }, default: 224, min: 192, max: 300, step: 4, unit: 'px', safe: [208, 272] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 0, min: 0, max: 16, step: 1, unit: 'px', safe: [0, 12] },
    { key: 'showArrow', type: 'boolean', group: 'look', label: { 'zh-CN': '箭头', en: 'Arrow' }, default: true },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '移动弹簧', en: 'Move spring' }, default: { visualDuration: 0.35, bounce: 0 } },
  ],
  presets: [
    { id: 'plain', name: { 'zh-CN': '铅字', en: 'Letterpress' }, values: { width: 224, radius: 0, showArrow: true, spring: { visualDuration: 0.35, bounce: 0 } } },
    { id: 'soft', name: { 'zh-CN': '软卡', en: 'Pillow' }, values: { width: 256, radius: 12, showArrow: true, openDelay: 400, spring: { visualDuration: 0.45, bounce: 0.25 } } },
    { id: 'margin', name: { 'zh-CN': '页眉注', en: 'Marginalia' }, values: { width: 208, radius: 4, showArrow: false, side: 'top', spring: { visualDuration: 0.25, bounce: 0.1 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Wrap the text in <LinkPreviewCard contents={{ key: <PreviewContent … /> }}> and mark links with <PreviewLink name="key" href=…>; one card is shared by all links inside the root.',
      'The card is supplementary: everything in it must also be reachable by following the link. Touch pointers do not open it.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 2.6, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'base-ui',
      repo: 'mui/base-ui',
      sha: '6a29b4b3b414251bf0ed23aa36e145d55e947c37',
      paths: [
        'docs/src/app/(docs)/react/components/preview-card/demos/hero/css-modules/index.tsx',
        'docs/src/app/(docs)/react/components/preview-card/demos/index.module.css',
        'docs/src/app/(docs)/react/components/preview-card/demos/detached-triggers-full/css-modules/index.tsx',
        'docs/src/app/(docs)/react/components/preview-card/demos/detached-triggers-full/css-modules/index.module.css',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2019 Material-UI SAS'],
    },
    modifications: [
      '@base-ui/react PreviewCard (Root, Trigger, Positioner, Popup, Arrow, Viewport) replaced by a small hand-rolled version: open/close delays (600/300 ms), focus opens, Esc closes, the pointer can move into the card, one shared card for several links.',
      'CSS modules converted to Tailwind classes with theme tokens; the position, size and content-slide transitions of the detached-triggers demo are done with motion/react springs.',
      'Unsplash and Wikimedia photos replaced by generated SVG thumbnails; the art summary is shortened.',
      'Params for delays, side (top / bottom), content width, radius, arrow and spring; the demo opens the links on the motif-runtime frame clock until the pointer takes over.',
    ],
    assets: [],
  },
})
