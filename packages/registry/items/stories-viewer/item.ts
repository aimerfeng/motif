import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'stories-viewer',
  status: 'published',
  title: { 'zh-CN': '快拍浏览器', en: 'Stories Viewer' },
  summary: {
    'zh-CN': '一排带彩色圆环的头像，下面是可拖动的竖版快拍卡片；当前卡片画面缓缓推进，顶部细进度条走满就轮到下一位，悬停或聚焦即预览。适合社交动态、产品更新和新手导览。',
    en: 'A row of ringed avatars above a draggable strip of portrait story cards; the playing card slowly pans while a thin progress line fills, then hands over to the next author, and hover or focus previews any card. For social feeds, product updates and onboarding tours.',
  },
  kind: 'component',
  category: 'carousel',
  tags: ['stories', 'carousel', 'avatar', 'social', 'feed', 'progress'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'stories-viewer.tsx', export: 'StoriesViewer' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'stories-viewer.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'duration', type: 'number', group: 'motion', label: { 'zh-CN': '每条时长', en: 'Story duration' }, default: 5, min: 2, max: 12, step: 0.5, unit: 's', safe: [4, 7] },
    { key: 'autoplay', type: 'boolean', group: 'motion', label: { 'zh-CN': '自动播放', en: 'Autoplay' }, default: true },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '圆环主色', en: 'Ring accent' }, default: '#ee2a7b' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 0, max: 28, step: 1, unit: 'px', safe: [8, 20] },
    {
      key: 'aspect',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '卡片比例', en: 'Card aspect' },
      default: 'portrait',
      options: [
        { value: 'portrait', label: { 'zh-CN': '3:4', en: '3:4' } },
        { value: 'tall', label: { 'zh-CN': '9:16', en: '9:16' } },
        { value: 'square', label: { 'zh-CN': '方形', en: 'Square' } },
      ],
    },
    { key: 'showAvatars', type: 'boolean', group: 'layout', label: { 'zh-CN': '头像行', en: 'Avatar row' }, default: true },
  ],
  presets: [
    { id: 'feed', name: { 'zh-CN': '晨间动态', en: 'Morning Feed' }, values: { aspect: 'portrait', accent: '#ee2a7b', radius: 12 } },
    { id: 'reel', name: { 'zh-CN': '竖屏长卷', en: 'Tall Reel' }, values: { aspect: 'tall', accent: '#8b5cf6', radius: 20, duration: 6 } },
    { id: 'tiles', name: { 'zh-CN': '方格相册', en: 'Square Tiles' }, values: { aspect: 'square', accent: '#22d3ee', radius: 6, showAvatars: false } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.2, posterTime: 2.5, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kibo',
      repo: 'shadcnblocks/kibo',
      sha: '3d63cdb15b79d972e3dc38a10997987672f9b263',
      paths: ['packages/stories/index.tsx', 'apps/docs/examples/stories.tsx', 'apps/docs/examples/stories-avatars.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 — Present shadcnblocks'],
    },
    modifications: [
      'Replaced the shadcn/embla Carousel with a motion drag strip constrained to the viewport.',
      'StoryVideo / StoryImage replaced by StoryMedia, a generated CSS gradient slide that slowly pans while playing; avatars are initials only (no remote images).',
      'Added a composed StoriesViewer: ringed avatar row from the avatars example, autoplay through stories on useFrameLoop time with a thin progress line, hover/focus preview, Enter/Space to select.',
      'transition-all narrowed to transform/box-shadow; reduced motion disables the pan and hover scale; cn comes from @motif/runtime; props come from the @motif:defaults region.',
    ],
    assets: [],
  },
})
