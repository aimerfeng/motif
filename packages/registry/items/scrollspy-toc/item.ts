import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'scrollspy-toc',
  status: 'published',
  title: { 'zh-CN': '滚动高亮目录', en: 'Scrollspy Outline' },
  summary: {
    'zh-CN': '「本页目录」：滚到哪一节，对应的条目就高亮，高亮块会滑到新位置；点击条目平滑滚动到那一节。适合文档、长文和条款页。',
    en: 'An on-this-page outline that highlights the section in view, with an indicator that glides between entries; clicking scrolls smoothly to the section. For docs, long articles and legal pages.',
  },
  kind: 'component',
  category: 'navigation',
  tags: ['scrollspy', 'toc', 'outline', 'navigation', 'docs', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'scrollspy-toc.tsx', export: 'ScrollspyToc' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'scrollspy-toc.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'indicator',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '高亮方式', en: 'Indicator' },
      default: 'glide',
      options: [
        { value: 'glide', label: { 'zh-CN': '滑动', en: 'Glide' } },
        { value: 'instant', label: { 'zh-CN': '直接切换', en: 'Instant' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '高亮颜色', en: 'Accent' }, default: '#8b5cf6' },
    { key: 'offset', type: 'number', group: 'interaction', label: { 'zh-CN': '顶部偏移', en: 'Top offset' }, hint: { 'zh-CN': '有吸顶导航栏时设为它的高度', en: 'Set to your sticky header height' }, default: 50, min: 0, max: 160, step: 2, unit: 'px', safe: [20, 100] },
    { key: 'smooth', type: 'boolean', group: 'interaction', label: { 'zh-CN': '平滑滚动', en: 'Smooth scroll' }, default: true },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.35, bounce: 0.15 } },
  ],
  presets: [
    { id: 'violet', name: { 'zh-CN': '紫藤', en: 'Wisteria' }, values: { indicator: 'glide', accent: '#8b5cf6' } },
    { id: 'lime', name: { 'zh-CN': '青柠', en: 'Lime' }, values: { indicator: 'glide', accent: '#a3e635', spring: { visualDuration: 0.45, bounce: 0.35 } } },
    { id: 'paper', name: { 'zh-CN': '素纸', en: 'Paper' }, values: { indicator: 'instant', accent: '#e4e4e7' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Pass targetRef pointing at the scrolling element (or document); section ids must match item ids and be unique on the page. offsetTop is measured against the offset parent, so make the scroll container position: relative.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.2, posterTime: 3.2, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: ['registry-reui/bases/base/reui/scrollspy.tsx', 'registry-reui/bases/base/components/scrollspy/c-scrollspy-1.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      'Scrollspy kept as upstream; the base-ui ScrollArea viewport lookup is dropped in favour of a native scroll container.',
      'Click listeners are now removed correctly on cleanup, onUpdate is held in a ref, and the initial setTimeout became a requestAnimationFrame.',
      'Added ScrollspyToc: the c-scrollspy-1 outline-button list with an accent color (ink chosen by luminance), aria-current, and an optional motion layoutId indicator that glides between entries.',
      'Hash syncing (history) defaults to off in ScrollspyToc; the demo autoplays a scroll through the article via useFrameLoop.',
    ],
    assets: [],
  },
})
