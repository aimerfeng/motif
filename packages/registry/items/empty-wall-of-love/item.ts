import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'empty-wall-of-love',
  status: 'published',
  title: { 'zh-CN': '空白好评墙', en: 'Empty Wall of Love' },
  summary: {
    'zh-CN': '还没有好评时的空状态：点一下文件夹，三张空白便签弹出来，等着第一条评价，下面是收集评价的按钮。适合评价组件、社区页和首次使用的仪表盘。',
    en: 'An empty testimonials state: click the folder and three blank notes spring out, ready for the first quote, with a call to action to collect it. For review widgets, community pages and first-run dashboards.',
  },
  kind: 'component',
  category: 'empty-state',
  tags: ['empty state', 'testimonials', 'folder', 'spring', 'reviews'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'empty-wall-of-love.tsx', export: 'EmptyWallOfLove' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'empty-wall-of-love.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'folderColor', type: 'color', group: 'look', label: { 'zh-CN': '文件夹颜色', en: 'Folder color' }, default: '#EBEBEB' },
    { key: 'noteColors', type: 'palette', group: 'look', label: { 'zh-CN': '便签颜色', en: 'Note colors' }, default: ['#FFFFFF', '#FFFFFF', '#FFFFFF'], minItems: 3, maxItems: 3 },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.5, bounce: 0.2 } },
    { key: 'title', type: 'text', group: 'content', label: { 'zh-CN': '标题', en: 'Title' }, default: 'Wall of', maxLength: 24 },
    { key: 'ctaLabel', type: 'text', group: 'content', label: { 'zh-CN': '按钮文案', en: 'Button label' }, default: 'Add Testimonial', maxLength: 24 },
    { key: 'autoplay', type: 'boolean', group: 'interaction', label: { 'zh-CN': '自动播放', en: 'Autoplay' }, hint: { 'zh-CN': '演示里定时开合文件夹', en: 'Opens and closes the folder on a loop in the demo' }, default: true },
  ],
  presets: [
    { id: 'paper', name: { 'zh-CN': '素纸', en: 'Paper' }, values: { folderColor: '#EBEBEB', noteColors: ['#FFFFFF', '#FFFFFF', '#FFFFFF'] } },
    { id: 'manila', name: { 'zh-CN': '牛皮纸', en: 'Manila' }, values: { folderColor: '#E8C987', noteColors: ['#FFF7D6', '#FFFFFF', '#FDE2E4'], spring: { visualDuration: 0.55, bounce: 0.3 } } },
    { id: 'midnight', name: { 'zh-CN': '午夜', en: 'Midnight' }, values: { folderColor: '#3B4252', noteColors: ['#E5E9F0', '#ECEFF4', '#D8DEE9'], spring: { visualDuration: 0.4, bounce: 0.1 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.2, posterTime: 2.2, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uselayouts',
      repo: 'iurvish/uselayouts',
      sha: '678a478e30272d8101cea97bc6147e0df9dcd652',
      paths: ['registry/default/example/empty-testimonial.tsx', 'registry/default/demo/empty-testimonial-demo.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Urvish Mali'],
    },
    modifications: [
      'Hugeicons plus icon and the heart emoji replaced with inline SVG; the social share intent link became a button with an onAction callback.',
      'Folder, note colors, spring, title and button text exposed as props; dot and line ink picked by luminance.',
      'The folder is a keyboard-accessible button with aria-expanded; open / onOpenChange allow controlled use (the demo autoplays it with useFrameLoop).',
      'Reduced motion swaps springs for instant changes and stops the heart pulse.',
    ],
    assets: [],
  },
})
