import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'testimonials-rotating-quote',
  status: 'published',
  title: { 'zh-CN': '轮播好评', en: 'Rotating Quote' },
  summary: {
    'zh-CN': '每次只放一条大号引言，定时上浮切换；下方一排圆点里，当前那一个拉长成胶囊进度条，填满就换下一条。适合想让一个声音说话的落地页。',
    en: 'One large quote at a time rises in and out on a timer, above a row of dots where the active one stretches into a pill that fills until the next quote. For landing pages that want one strong voice at a time.',
  },
  kind: 'section',
  category: 'testimonials',
  tags: ['testimonials', 'quote', 'rotating', 'progress', 'social proof'],
  runtime: ['react', 'motion'],
  entry: { file: 'testimonials-rotating-quote.tsx', export: 'TestimonialsRotatingQuote' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'testimonials-rotating-quote.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'interval', type: 'number', label: { 'zh-CN': '每条停留', en: 'Quote duration' }, default: 5, min: 3, max: 10, step: 0.5, unit: 's', safe: [4, 7], group: 'motion' },
    { key: 'easing', type: 'easing', label: { 'zh-CN': '切换缓动', en: 'Quote easing' }, default: [0.22, 1, 0.36, 1], group: 'motion' },
    { key: 'accent', type: 'color', label: { 'zh-CN': '进度条颜色', en: 'Progress color' }, default: '#7c8cff', group: 'look' },
    { key: 'quoteSize', type: 'number', label: { 'zh-CN': '引言字号', en: 'Quote size' }, hint: { 'zh-CN': '窄屏上自动缩小', en: 'Shrinks on narrow screens' }, default: 36, min: 24, max: 48, step: 1, unit: 'px', group: 'look' },
    { key: 'avatarSize', type: 'number', label: { 'zh-CN': '头像大小', en: 'Avatar size' }, default: 48, min: 36, max: 64, step: 2, unit: 'px', group: 'look' },
    { key: 'barWidth', type: 'number', label: { 'zh-CN': '进度条长度', en: 'Bar width' }, default: 50, min: 32, max: 96, step: 2, unit: 'px', group: 'look' },
  ],
  presets: [
    { id: 'nocturne', name: { 'zh-CN': '夜曲', en: 'Nocturne' }, values: { accent: '#7c8cff', quoteSize: 36, barWidth: 50, interval: 5 } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#fb923c', quoteSize: 42, barWidth: 72, avatarSize: 56, interval: 6 } },
    { id: 'mint', name: { 'zh-CN': '薄荷', en: 'Mint' }, values: { accent: '#34d399', quoteSize: 28, barWidth: 40, avatarSize: 40, interval: 4 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { scroll: true, posterTime: 1.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/blocks/testimonials/testimonials-1/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Testimonials from @smoothui/data replaced by four invented quotes; avatar images replaced by gradient initials.',
      'The setTimeout rotation (which only advanced once upstream) is driven by the runtime frame loop and loops; the progress fill follows frame time instead of a linear motion tween.',
      'Duration, bar width, quote size, avatar size, accent and quote easing are params; the quote transition uses a cubic-bezier instead of the spring.',
      'Dots are buttons that jump to a quote; added aria-live on the quote and a min-height so the layout does not jump.',
    ],
    assets: [],
  },
})
