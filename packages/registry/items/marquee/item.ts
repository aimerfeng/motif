import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'marquee',
  status: 'published',
  title: { 'zh-CN': '无限跑马灯', en: 'Marquee' },
  summary: {
    'zh-CN': '内容首尾相接无缝滚动，两端可以柔和淡出，支持横向、纵向、反向和悬停暂停。适合评价墙、合作伙伴和标签云。',
    en: 'Endless, seamless scrolling with soft faded edges, horizontal or vertical, reversible, pausing on hover. Made for testimonial walls, partner strips and tag clouds.',
  },
  category: 'layout',
  tags: ['marquee', 'ticker', 'scroll', 'testimonials', 'logos', 'infinite'],
  runtime: ['react', 'css'],
  entry: { file: 'marquee.tsx', export: 'Marquee' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'marquee.tsx', role: 'component' },
    { path: 'marquee.css', role: 'style' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'duration', type: 'number', label: { 'zh-CN': '滚完一轮用时', en: 'Loop duration' }, default: 28, min: 6, max: 90, step: 1, unit: 's', safe: [14, 50], group: 'motion' },
    { key: 'gap', type: 'number', label: { 'zh-CN': '间距', en: 'Gap' }, default: 16, min: 0, max: 64, step: 1, unit: 'px', safe: [8, 32], group: 'layout' },
    { key: 'repeat', type: 'number', label: { 'zh-CN': '重复份数', en: 'Copies' }, hint: { 'zh-CN': '内容较短、容器较宽时调大，保证不出现空白', en: 'Raise it for short content in wide containers so no gap shows' }, default: 4, min: 2, max: 8, step: 1, group: 'layout' },
    { key: 'reverse', type: 'boolean', label: { 'zh-CN': '反向', en: 'Reverse' }, default: false, group: 'motion' },
    { key: 'pauseOnHover', type: 'boolean', label: { 'zh-CN': '悬停暂停', en: 'Pause on hover' }, default: true, group: 'interaction' },
    { key: 'vertical', type: 'boolean', label: { 'zh-CN': '纵向', en: 'Vertical' }, default: false, group: 'layout' },
    { key: 'fade', type: 'boolean', label: { 'zh-CN': '边缘淡出', en: 'Fade edges' }, default: true, group: 'look' },
  ],
  presets: [
    { id: 'steady', name: { 'zh-CN': '平稳', en: 'Steady' }, values: { duration: 28, gap: 16 } },
    { id: 'brisk', name: { 'zh-CN': '疾行', en: 'Brisk' }, values: { duration: 14, gap: 12, reverse: true } },
    { id: 'glacial', name: { 'zh-CN': '冰川', en: 'Glacial' }, values: { duration: 64, gap: 28 } },
    { id: 'ticker-tape', name: { 'zh-CN': '纸带', en: 'Ticker Tape' }, values: { duration: 20, gap: 40, fade: false } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.2, posterTime: 2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'magicui',
      repo: 'magicuidesign/magicui',
      sha: 'd7207e5692d14c00dceafa8488d6d01f197fa0e4',
      paths: ['apps/www/registry/magicui/marquee.tsx', 'apps/www/public/r/marquee.json'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Magic UI'],
    },
    modifications: [
      'Defaults moved into the generated defaults region; duration and gap are props instead of CSS variables set by the caller, and an optional edge fade was added.',
      'The keyframes and animate-* theme tokens from the upstream registry json live in marquee.css.',
      'Motif improvement: with prefers-reduced-motion the animation is disabled, and the duplicated copies are hidden from assistive technology.',
    ],
    assets: [],
  },
})
