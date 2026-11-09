import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'carousel-3d-cylinder',
  status: 'published',
  title: { 'zh-CN': '3D 环形轮播', en: '3D Cylinder Carousel' },
  summary: {
    'zh-CN': '卡片围成一个 CSS 3D 圆柱，拖一下就带着惯性转起来，点开任意一张会放大到浮层里。适合作品集、灵感板和合集页。',
    en: 'Cards wrap around a CSS 3D cylinder; drag to spin it with momentum and click any card to lift it into a focused overlay. For galleries, mood boards and collection pages.',
  },
  kind: 'component',
  category: 'carousel',
  tags: ['carousel', '3d', 'cylinder', 'gallery', 'drag', 'momentum'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'carousel-3d-cylinder.tsx', export: 'ThreeDPhotoCarousel' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'carousel-3d-cylinder.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'faces', type: 'number', group: 'layout', label: { 'zh-CN': '卡片数量', en: 'Faces' }, default: 14, min: 8, max: 20, step: 1, safe: [10, 16] },
    { key: 'cylinderWidth', type: 'number', group: 'layout', label: { 'zh-CN': '圆柱周长', en: 'Cylinder width' }, hint: { 'zh-CN': '窄屏（≤640px）自动缩到约 0.6 倍', en: 'Scaled to about 0.6× on screens up to 640px' }, default: 1800, min: 1200, max: 2400, step: 50, unit: 'px', safe: [1500, 2100] },
    { key: 'perspective', type: 'number', group: 'layout', label: { 'zh-CN': '透视距离', en: 'Perspective' }, default: 1000, min: 600, max: 1800, step: 50, unit: 'px', safe: [800, 1400] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '卡片圆角', en: 'Card radius' }, default: 12, min: 0, max: 24, step: 1, unit: 'px', safe: [8, 16] },
    {
      key: 'artwork',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '插画色调', en: 'Artwork' },
      default: 'night',
      options: [
        { value: 'night', label: { 'zh-CN': '夜色', en: 'Night' } },
        { value: 'dusk', label: { 'zh-CN': '黄昏', en: 'Dusk' } },
        { value: 'frost', label: { 'zh-CN': '霜晨', en: 'Frost' } },
      ],
    },
    { key: 'dragSensitivity', type: 'number', group: 'interaction', label: { 'zh-CN': '拖动灵敏度', en: 'Drag sensitivity' }, default: 0.05, min: 0.02, max: 0.1, step: 0.005, safe: [0.03, 0.07] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '惯性弹簧', en: 'Momentum spring' }, default: { visualDuration: 0.4, bounce: 0 } },
    { key: 'autoSpin', type: 'number', group: 'motion', label: { 'zh-CN': '自动旋转', en: 'Auto spin' }, hint: { 'zh-CN': '每秒转过的角度，0 为不转', en: 'Degrees per second; 0 stops it' }, default: 8, min: -30, max: 30, step: 1, unit: 'deg', safe: [-12, 12] },
  ],
  presets: [
    { id: 'after-hours', name: { 'zh-CN': '末班车', en: 'After Hours' }, values: { artwork: 'night', faces: 14, autoSpin: 8, radius: 12 } },
    { id: 'golden', name: { 'zh-CN': '落日', en: 'Golden Hour' }, values: { artwork: 'dusk', faces: 12, cylinderWidth: 1700, perspective: 900, autoSpin: -6, radius: 16 } },
    { id: 'frost', name: { 'zh-CN': '初雪', en: 'First Snow' }, values: { artwork: 'frost', faces: 16, cylinderWidth: 2000, perspective: 1300, autoSpin: 5, radius: 6 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Pass your own cards ({ id, label, content }) to replace the generated artwork; content fills a square face.',
      'The focused overlay is position: fixed; render the carousel where a full-viewport overlay makes sense.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { posterTime: 2, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'cult-ui',
      repo: 'nolly-studio/cult-ui',
      sha: 'ee98a5dd2e319b63cc2e707dd968d6af04209b7e',
      paths: ['apps/www/registry/default/ui/three-d-carousel.tsx', 'apps/www/registry/default/example/three-d-carousel-demo.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 Jordan-Gilliam'],
    },
    modifications: [
      'Replaced the picsum.photos images with generated SVG city artwork (three palettes); custom cards can be passed as nodes.',
      'Exposed faces, cylinder width, perspective, drag sensitivity, card radius and the momentum spring (visualDuration + bounce) as props; added an optional auto spin driven by useFrameLoop.',
      'Added keyboard support (arrow keys spin one face, Enter opens a card, Escape closes), roles and labels, a close button, and reduced-motion handling.',
      'Theme tokens instead of the mauve color; removed the console.log.',
    ],
    assets: [],
  },
})
