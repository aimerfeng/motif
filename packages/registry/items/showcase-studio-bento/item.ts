import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'showcase-studio-bento',
  status: 'published',
  title: { 'zh-CN': '工作室案例便当格', en: 'Studio Case Study Bento' },
  summary: {
    'zh-CN': '给设计工作室用的便当格：一张主推案例、三项成果数据、带进度条的流程、生成的作品画廊、带播放徽标的作品集短片和一排首字母头像，一屏讲完工作室的故事。',
    en: 'A bento for studios and agencies: a featured case study, three outcome metrics, process steps with progress bars, a gallery of generated frames, a reel tile with a play badge and a strip of initial avatars. Tells a studio story in one screen.',
  },
  kind: 'section',
  category: 'showcase',
  tags: ['bento', 'case study', 'agency', 'studio', 'portfolio', 'metrics'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'showcase-studio-bento.tsx', export: 'ShowcaseStudioBento' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'showcase-studio-bento.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#8b7cf6', group: 'look' },
    {
      key: 'tone',
      type: 'select',
      label: { 'zh-CN': '深浅', en: 'Tone' },
      default: 'dark',
      options: [
        { value: 'dark', label: { 'zh-CN': '深色', en: 'Dark' } },
        { value: 'light', label: { 'zh-CN': '浅色', en: 'Light' } },
      ],
      group: 'look',
    },
    {
      key: 'galleryStyle',
      type: 'select',
      label: { 'zh-CN': '配图风格', en: 'Frame style' },
      default: 'gradient',
      options: [
        { value: 'gradient', label: { 'zh-CN': '柔光渐变', en: 'Soft gradient' } },
        { value: 'shapes', label: { 'zh-CN': '几何色块', en: 'Geometric' } },
        { value: 'lines', label: { 'zh-CN': '等高线', en: 'Contour lines' } },
      ],
      group: 'look',
    },
    { key: 'radius', type: 'number', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 16, min: 4, max: 28, step: 1, unit: 'px', safe: [10, 24], group: 'look' },
    {
      key: 'density',
      type: 'select',
      label: { 'zh-CN': '密度', en: 'Density' },
      default: 'comfortable',
      options: [
        { value: 'comfortable', label: { 'zh-CN': '宽松', en: 'Comfortable' } },
        { value: 'compact', label: { 'zh-CN': '紧凑', en: 'Compact' } },
      ],
      group: 'layout',
    },
    { key: 'showReel', type: 'boolean', label: { 'zh-CN': '显示短片卡', en: 'Show reel tile' }, default: true, group: 'layout' },
  ],
  presets: [
    { id: 'nocturne', name: { 'zh-CN': '夜曲', en: 'Nocturne' }, values: { accent: '#8b7cf6', tone: 'dark', galleryStyle: 'gradient' } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#f97316', tone: 'dark', galleryStyle: 'shapes', radius: 10 } },
    { id: 'gallery', name: { 'zh-CN': '白墙', en: 'White Cube' }, values: { accent: '#0f766e', tone: 'light', galleryStyle: 'lines', radius: 22, density: 'compact' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uitripled',
      repo: 'moumen-soliman/uitripled',
      sha: '05d18376db775072ed61d0cab8ea184f8f527429',
      paths: ['packages/components/react-shadcn/src/components/sections/bento-grid-block.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2026 uitripled'],
    },
    modifications: [
      'framer-motion imports switched to motion/react; shadcn Badge and Button inlined as plain elements; lucide icons replaced by inline SVG.',
      'Unsplash photos replaced by generated SVG frames (soft gradient, geometric or contour styles) tinted from the accent; photo avatars replaced by initials on gradients; the UI TripleD badge renamed to an invented studio.',
      'Entrance plays on mount instead of whileInView; progress bars fill with scaleX instead of width; transition-all narrowed to border and shadow; reduced motion disables entrance, hover lift and looping badges.',
      'Added accent, light/dark tone, radius, density, frame style and reel visibility params; accent text is adjusted for contrast against either tone.',
    ],
    assets: [],
  },
})
