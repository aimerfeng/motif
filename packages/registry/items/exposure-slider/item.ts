import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'exposure-slider',
  status: 'published',
  title: { 'zh-CN': '曝光刻度尺', en: 'Exposure Dial' },
  summary: {
    'zh-CN': '相机式的曝光调节：拖动一排刻度线，越靠近中线的刻度越长越亮，上方的小圆环随正负值向两侧填充。适合修图工具、相机应用和需要细调的设置项。',
    en: 'A camera-style exposure control: drag a ticker of notches that grow and brighten near the centre line, while a small ring above fills left or right with the value. For photo editors, camera apps and fine-grained settings.',
  },
  kind: 'component',
  category: 'slider',
  tags: ['slider', 'ruler', 'exposure', 'camera', 'photo', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'exposure-slider.tsx', export: 'ExposureSlider' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'exposure-slider.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'min', type: 'number', group: 'interaction', label: { 'zh-CN': '最小值', en: 'Minimum' }, default: -20, min: -50, max: -5, step: 1, safe: [-30, -10] },
    { key: 'max', type: 'number', group: 'interaction', label: { 'zh-CN': '最大值', en: 'Maximum' }, default: 20, min: 5, max: 50, step: 1, safe: [10, 30] },
    { key: 'step', type: 'number', group: 'interaction', label: { 'zh-CN': '步长', en: 'Step' }, default: 1, min: 1, max: 5, step: 1, safe: [1, 2] },
    { key: 'accentColor', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent color' }, default: '#f43f5e' },
    { key: 'showIndicator', type: 'boolean', group: 'look', label: { 'zh-CN': '数值圆环', en: 'Value ring' }, default: true },
    { key: 'tickSpacing', type: 'number', group: 'layout', label: { 'zh-CN': '刻度间距', en: 'Notch spacing' }, default: 13, min: 9, max: 21, step: 1, unit: 'px', safe: [11, 17] },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '标签', en: 'Label' }, default: 'Exposure', maxLength: 24 },
  ],
  presets: [
    { id: 'darkroom', name: { 'zh-CN': '暗房', en: 'Darkroom' }, values: { accentColor: '#f43f5e', tickSpacing: 13, showIndicator: true } },
    { id: 'viewfinder', name: { 'zh-CN': '取景器', en: 'Viewfinder' }, values: { accentColor: '#facc15', tickSpacing: 11, showIndicator: true, min: -30, max: 30 } },
    { id: 'glacier', name: { 'zh-CN': '冰川', en: 'Glacier' }, values: { accentColor: '#38bdf8', tickSpacing: 17, showIndicator: false, min: -10, max: 10 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.6, posterTime: 2.2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/exposure-slider/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'cn comes from @motif/runtime; useSpring is always called so hooks run in a stable order.',
      'The notch width is a tickSpacing parameter; a label parameter names the control.',
      'Added role="slider" with aria-value* attributes, arrow / Page / Home / End keys and a focus-visible ring.',
      'Added an optional controlled value prop (used by the demo autoplay); the centre number stays in the foreground color for contrast while the ring and notch use the accent.',
    ],
    assets: [],
  },
})
