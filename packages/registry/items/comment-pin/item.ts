import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'comment-pin',
  status: 'published',
  title: { 'zh-CN': '评论气泡钉', en: 'Comment Pin' },
  summary: {
    'zh-CN': '画布上一个小小的头像钉，点开后弹成完整的评论气泡，显示作者、时间和留言；点外面或按 Esc 收起。适合协作编辑器、设计评审和带批注的界面稿。',
    en: 'A small avatar pin on the canvas that springs open into a full bubble with name, time and message, and closes on outside click or Escape. For collaborative editors, review tools and annotated mockups.',
  },
  kind: 'component',
  category: 'chat',
  tags: ['comment', 'annotation', 'pin', 'collaboration', 'design-review', 'spring'],
  runtime: ['react', 'motion'],
  entry: { file: 'comment-pin.tsx', export: 'CommentPin' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'comment-pin.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'author', type: 'text', group: 'content', label: { 'zh-CN': '作者', en: 'Author' }, default: 'Mira Okafor', maxLength: 28 },
    {
      key: 'message',
      type: 'text',
      group: 'content',
      label: { 'zh-CN': '留言', en: 'Message' },
      default: "What happens if we adjust this to handle a light and dark mode? I'm not sure if we're ready to handle...",
      maxLength: 160,
    },
    { key: 'timestamp', type: 'text', group: 'content', label: { 'zh-CN': '时间', en: 'Timestamp' }, default: 'Just now', maxLength: 16 },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '展开宽度', en: 'Open width' }, default: 180, min: 160, max: 280, step: 4, unit: 'px', safe: [172, 240] },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '头像颜色', en: 'Avatar color' }, default: '#8b5cf6' },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.3, bounce: 0.15 } },
    { key: 'openOnHover', type: 'boolean', group: 'interaction', label: { 'zh-CN': '悬停展开', en: 'Open on hover' }, default: false },
  ],
  presets: [
    { id: 'studio', name: { 'zh-CN': '工作室', en: 'Studio' }, values: { accent: '#8b5cf6', width: 180, spring: { visualDuration: 0.3, bounce: 0.15 } } },
    { id: 'citrus', name: { 'zh-CN': '青柠', en: 'Citrus' }, values: { accent: '#facc15', width: 208, spring: { visualDuration: 0.4, bounce: 0.35 } } },
    { id: 'tide', name: { 'zh-CN': '潮汐', en: 'Tide' }, values: { accent: '#0ea5e9', width: 232, spring: { visualDuration: 0.22, bounce: 0 }, openOnHover: true } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.8, posterTime: 2.2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: [
        'packages/smoothui/components/figma-comment/index.tsx',
        'packages/smoothui/components/figma-comment/use-click-outside.tsx',
        'apps/docs/examples/figma-comment.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Replaced the shadcn Avatar and remote avatar image with an initials avatar on an accent gradient; initials ink is picked by luminance.',
      'Inlined the click-outside hook; added Escape to close, role="button", aria-expanded and keyboard toggling.',
      'Content height is measured with ResizeObserver instead of timeouts; the container spring uses visualDuration + bounce from a param.',
      'Added an open-on-hover option and a controlled open prop (used by the demo autoplay); cn comes from @motif/runtime.',
    ],
    assets: [],
  },
})
