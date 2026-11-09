import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'about-journey-timeline',
  status: 'published',
  title: { 'zh-CN': '公司历程时间线', en: 'Company Journey Timeline' },
  summary: {
    'zh-CN': '按年份排列的里程碑沿中轴左右交错，竖轴从上往下画出，经过的节点依次点亮；也可切换成带「已完成 / 进行中 / 下一步」状态的路线图。适合关于我们和公司故事页。',
    en: 'Milestones by year alternating either side of a center rail that draws downward, lighting each node as it passes. A roadmap variant shows phases as done, in progress or up next. Made for about pages and company stories.',
  },
  kind: 'section',
  category: 'about',
  tags: ['timeline', 'about', 'milestones', 'company story', 'roadmap'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'about-journey-timeline.tsx', export: 'AboutJourneyTimeline' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'about-journey-timeline.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#a78bfa', group: 'look' },
    {
      key: 'variant',
      type: 'select',
      label: { 'zh-CN': '内容', en: 'Variant' },
      default: 'journey',
      options: [
        { value: 'journey', label: { 'zh-CN': '公司历程', en: 'Journey' } },
        { value: 'roadmap', label: { 'zh-CN': '路线图', en: 'Roadmap' } },
      ],
      group: 'content',
    },
    {
      key: 'layout',
      type: 'select',
      label: { 'zh-CN': '版式', en: 'Layout' },
      default: 'alternate',
      options: [
        { value: 'alternate', label: { 'zh-CN': '左右交错', en: 'Alternating' } },
        { value: 'left', label: { 'zh-CN': '左侧竖轴', en: 'Left rail' } },
      ],
      group: 'layout',
    },
    {
      key: 'cardStyle',
      type: 'select',
      label: { 'zh-CN': '卡片', en: 'Card style' },
      default: 'solid',
      options: [
        { value: 'solid', label: { 'zh-CN': '实心', en: 'Solid' } },
        { value: 'glass', label: { 'zh-CN': '玻璃', en: 'Glass' } },
      ],
      group: 'look',
    },
    { key: 'drawRail', type: 'boolean', label: { 'zh-CN': '画出竖轴', en: 'Draw rail' }, default: true, group: 'motion' },
    { key: 'badge', type: 'text', label: { 'zh-CN': '标签', en: 'Badge' }, default: 'Our Journey', maxLength: 24, group: 'content' },
    { key: 'heading', type: 'text', label: { 'zh-CN': '标题', en: 'Heading' }, default: 'The Story of Our Growth', maxLength: 56, group: 'content' },
    { key: 'subheading', type: 'text', label: { 'zh-CN': '副标题', en: 'Subheading' }, default: 'From a small startup to a global platform trusted by thousands', maxLength: 100, group: 'content' },
  ],
  presets: [
    { id: 'origin', name: { 'zh-CN': '起点', en: 'Origin' }, values: { accent: '#a78bfa', variant: 'journey', layout: 'alternate', cardStyle: 'solid' } },
    {
      id: 'launchpad',
      name: { 'zh-CN': '发射台', en: 'Launchpad' },
      values: { accent: '#5eead4', variant: 'roadmap', layout: 'left', cardStyle: 'glass', badge: 'Launch timeline', heading: 'Launch faster with a frictionless roadmap', subheading: 'An intentionally minimal planning flow that surfaces the important moments and keeps teams aligned.' },
    },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#fb923c', variant: 'journey', layout: 'alternate', cardStyle: 'glass' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: [],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    rules: ['Edit the JOURNEY and ROADMAP arrays for your own milestones; in the roadmap exactly one phase should be "now", since the rail stops at it.'],
  },
  capture: { scroll: true, posterTime: 2.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uitripled',
      repo: 'moumen-soliman/uitripled',
      sha: '05d18376db775072ed61d0cab8ea184f8f527429',
      paths: [
        'packages/components/react-shadcn/src/components/sections/timeline-block.tsx',
        'packages/components/react-shadcn/src/components/sections/glassmorphism-launch-timeline-block.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2026 uitripled'],
    },
    modifications: [
      'framer-motion to motion/react; lucide icons replaced with inline SVG; shadcn Badge and Card replaced with plain elements using the same classes.',
      'The rail draw is driven by the runtime frame loop instead of useInView, and nodes light up as the rail passes them.',
      'Added params for accent (with luminance-picked ink), layout, card style and copy, plus a roadmap variant using the steps from the glassmorphism launch timeline with done / now / next states.',
      'Reduced motion shows the finished state with no pulses or hover lift.',
    ],
    assets: [],
  },
})
