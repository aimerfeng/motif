import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'shape-mask-morph',
  status: 'published',
  title: { 'zh-CN': '形变遮罩', en: 'Morphing Mask' },
  summary: {
    'zh-CN': '任意内容透过一个 SVG 形状遮罩露出来：圆团、拱门、菱形或波浪，遮罩会自己缓慢变形，也可以跟着滚动或悬停变化。适合首屏配图、作品集封面和有机感的产品图。',
    en: 'Any content shows through an SVG shape mask (blob, arch, diamond or wave) that morphs on its own loop, steps with scroll or swaps on hover. For hero imagery, portfolio covers and organic product shots.',
  },
  kind: 'effect',
  category: 'image',
  tags: ['mask', 'clip-path', 'morph', 'svg', 'blob', 'image', 'scroll'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'shape-mask-morph.tsx', export: 'ShapeMaskMorph' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'shape-mask-morph.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'shape',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '形状', en: 'Shape' },
      default: 'blob',
      options: [
        { value: 'blob', label: { 'zh-CN': '圆团', en: 'Blob' } },
        { value: 'arch', label: { 'zh-CN': '拱门', en: 'Arch' } },
        { value: 'diamond', label: { 'zh-CN': '菱形', en: 'Diamond' } },
        { value: 'wave', label: { 'zh-CN': '波浪', en: 'Wave' } },
      ],
    },
    {
      key: 'animate',
      type: 'select',
      group: 'motion',
      label: { 'zh-CN': '变形方式', en: 'Animation' },
      default: 'morph',
      options: [
        { value: 'morph', label: { 'zh-CN': '自动循环', en: 'Morph loop' } },
        { value: 'scroll', label: { 'zh-CN': '跟随滚动', en: 'On scroll' } },
        { value: 'hover', label: { 'zh-CN': '悬停切换', en: 'On hover' } },
        { value: 'none', label: { 'zh-CN': '静止', en: 'Static' } },
      ],
    },
    { key: 'duration', type: 'number', group: 'motion', label: { 'zh-CN': '循环时长', en: 'Loop duration' }, hint: { 'zh-CN': '自动循环一圈的秒数', en: 'Seconds for one full morph loop' }, default: 4, min: 1.5, max: 12, step: 0.5, unit: 's', safe: [3, 8] },
    { key: 'ease', type: 'easing', group: 'motion', label: { 'zh-CN': '缓动', en: 'Easing' }, default: [0.645, 0.045, 0.355, 1] },
  ],
  presets: [
    { id: 'pebble', name: { 'zh-CN': '卵石', en: 'Pebble' }, values: { shape: 'blob', animate: 'morph', duration: 4 } },
    { id: 'chapel', name: { 'zh-CN': '穹窗', en: 'Chapel' }, values: { shape: 'arch', animate: 'morph', duration: 6 } },
    { id: 'tide', name: { 'zh-CN': '潮线', en: 'Tideline' }, values: { shape: 'wave', animate: 'scroll' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Give the wrapper (or its child) an explicit size; the mask uses objectBoundingBox units and fills whatever box it wraps.',
      'Custom morphPaths must share one command structure (same M/L/C/Z sequence and point count), otherwise the shape snaps instead of morphing.',
      'For animate="scroll" inside a scrolling panel, pass that panel as container and make it position: relative.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { posterTime: 1.6, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/svg-clip-mask/index.tsx', 'apps/docs/examples/svg-clip-mask.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'cn comes from @motif/runtime; renamed to ShapeMaskMorph, accepts style, defaults moved into the generated defaults region and the easing became a parameter.',
      'Each preset shape gets a built-in morph set (blob and wave from the upstream demo, arch and diamond added) so morph, scroll and hover work without passing morphPaths.',
      'The morph loop returns to the first path before repeating, so the loop no longer snaps; the morph loop gets an explicit initial path because initial={false} skipped it on mount.',
      'The demo replaces the remote photos with an inline SVG artwork and drives the scroll mode with a frame-loop autoplay.',
    ],
    assets: [],
  },
})
