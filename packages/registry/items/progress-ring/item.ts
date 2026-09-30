import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'progress-ring',
  status: 'published',
  title: { 'zh-CN': '环形进度', en: 'Progress Ring' },
  summary: {
    'zh-CN': '渐变描边的环形进度：圆环和中间的数字由同一根弹簧驱动，有整圆、270° 仪表和刻度盘三种形态，可选发光。适合目标完成度、存储用量和评分。',
    en: 'A gradient-stroked ring whose arc and center number ride one spring. Full ring, 270-degree gauge or tick dial, with optional glow. For goals, storage usage and scores.',
  },
  kind: 'component',
  category: 'progress',
  tags: ['progress', 'ring', 'gauge', 'radial', 'dial', 'svg', 'accessible'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'progress-ring.tsx', export: 'ProgressRing' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'progress-ring.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '形态', en: 'Shape' },
      default: 'ring',
      options: [
        { value: 'ring', label: { 'zh-CN': '整圆', en: 'Full ring' } },
        { value: 'gauge', label: { 'zh-CN': '270° 仪表', en: '270° gauge' } },
        { value: 'dial', label: { 'zh-CN': '刻度盘', en: 'Tick dial' } },
      ],
    },
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '尺寸', en: 'Size' }, default: 168, min: 80, max: 260, step: 2, unit: 'px', safe: [110, 220] },
    { key: 'thickness', type: 'number', group: 'look', label: { 'zh-CN': '粗细', en: 'Thickness' }, default: 12, min: 4, max: 28, step: 1, unit: 'px', safe: [8, 18] },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '起点色', en: 'Start color' }, default: '#8b5cf6' },
    { key: 'colorEnd', type: 'color', group: 'look', label: { 'zh-CN': '终点色', en: 'End color' }, default: '#ec4899' },
    {
      key: 'cap',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '端点', en: 'Line cap' },
      default: 'round',
      options: [
        { value: 'round', label: { 'zh-CN': '圆头', en: 'Round' } },
        { value: 'butt', label: { 'zh-CN': '平头', en: 'Flat' } },
      ],
    },
    { key: 'glow', type: 'boolean', group: 'look', label: { 'zh-CN': '发光', en: 'Glow' }, default: true },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '推进弹簧', en: 'Fill spring' }, default: { visualDuration: 0.9, bounce: 0 } },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '标签 / 读屏文案', en: 'Label' }, default: 'Daily goal', maxLength: 24 },
    { key: 'showValue', type: 'boolean', group: 'content', label: { 'zh-CN': '显示中心数字', en: 'Show center value' }, default: true },
  ],
  presets: [
    { id: 'orchid', name: { 'zh-CN': '兰花', en: 'Orchid' }, values: { variant: 'ring', color: '#8b5cf6', colorEnd: '#ec4899', thickness: 12 } },
    { id: 'speedometer', name: { 'zh-CN': '时速表', en: 'Speedometer' }, values: { variant: 'gauge', color: '#22d3ee', colorEnd: '#6366f1', thickness: 14, label: 'CPU load' } },
    { id: 'chrono', name: { 'zh-CN': '计时盘', en: 'Chrono' }, values: { variant: 'dial', color: '#fbbf24', colorEnd: '#f97316', thickness: 14, label: 'Focus time' } },
    { id: 'moss', name: { 'zh-CN': '苔藓', en: 'Moss' }, values: { variant: 'ring', color: '#4ade80', colorEnd: '#2dd4bf', thickness: 8, cap: 'butt', glow: false, label: 'Storage' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'crossfade' },
  guidance: {
    use: ['Use for a single known percentage: goals, quotas, scores. For a linear flow such as uploads use progress-bar.'],
    rules: [
      'Pass value as 0-100; the arc and the number animate together from one spring, so do not animate the value yourself.',
      'The graphic is aria-hidden; the wrapper carries role="progressbar" with the label as its accessible name.',
      'Keep the gradient endpoints close in lightness so the arc does not look striped.',
    ],
  },
  capture: { zoom: 2, posterTime: 4, loop: 9 },
  provenance: {
    kind: 'original',
    modifications: [],
    assets: [],
  },
})
