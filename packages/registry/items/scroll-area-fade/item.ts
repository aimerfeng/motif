import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'scroll-area-fade',
  status: 'published',
  title: { 'zh-CN': '渐隐滚动区域', en: 'Scroll Area with Fades' },
  summary: {
    'zh-CN': '原生滚动加一条细细的自定义滚动条，悬停或滚动时才出现；哪一侧还有被遮住的内容，哪一侧边缘就渐隐。支持纵向、横向或双向。适合侧边栏、聊天列表、代码面板和内容溢出的卡片。',
    en: 'Native scrolling with a slim custom scrollbar that appears on hover or scroll, and edges that fade only on the side where more content is hidden. Vertical, horizontal or both. For sidebars, chat lists, code panels and overflowing cards.',
  },
  kind: 'component',
  category: 'layout',
  tags: ['scroll-area', 'scrollbar', 'fade', 'mask', 'overflow', 'a11y'],
  runtime: ['react', 'css'],
  entry: { file: 'scroll-area-fade.tsx', export: 'ScrollAreaFade' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'scroll-area-fade.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'axis',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '滚动方向', en: 'Axis' },
      default: 'vertical',
      options: [
        { value: 'vertical', label: { 'zh-CN': '纵向', en: 'Vertical' } },
        { value: 'horizontal', label: { 'zh-CN': '横向', en: 'Horizontal' } },
        { value: 'both', label: { 'zh-CN': '双向', en: 'Both' } },
      ],
    },
    { key: 'fadeSize', type: 'number', group: 'look', label: { 'zh-CN': '渐隐长度', en: 'Fade size' }, default: 40, min: 0, max: 80, step: 1, unit: 'px', safe: [24, 56] },
    { key: 'thumbWidth', type: 'number', group: 'look', label: { 'zh-CN': '滚动条粗细', en: 'Scrollbar width' }, default: 16, min: 4, max: 16, step: 1, unit: 'px', safe: [6, 16] },
    { key: 'thumbColor', type: 'color', group: 'look', label: { 'zh-CN': '滑块颜色', en: 'Thumb color' }, default: '#ffffff' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 0, min: 0, max: 16, step: 1, unit: 'px', safe: [0, 12] },
    { key: 'autoHide', type: 'boolean', group: 'interaction', label: { 'zh-CN': '自动隐藏滚动条', en: 'Auto-hide scrollbar' }, hint: { 'zh-CN': '只在悬停或滚动时显示', en: 'Show only on hover or while scrolling' }, default: true },
    { key: 'trackVisible', type: 'boolean', group: 'look', label: { 'zh-CN': '显示轨道', en: 'Show track' }, default: true },
  ],
  presets: [
    { id: 'base', name: { 'zh-CN': '原版', en: 'Base' }, values: { axis: 'vertical', fadeSize: 40, thumbWidth: 16, thumbColor: '#ffffff', radius: 0, autoHide: true, trackVisible: true } },
    { id: 'slim', name: { 'zh-CN': '细线', en: 'Hairline' }, values: { axis: 'vertical', fadeSize: 48, thumbWidth: 6, thumbColor: '#a3a3a3', radius: 12, autoHide: true, trackVisible: false } },
    { id: 'grid', name: { 'zh-CN': '座位表', en: 'Seat map' }, values: { axis: 'both', fadeSize: 32, thumbWidth: 8, thumbColor: '#38bdf8', radius: 8, autoHide: false, trackVisible: true } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 2.6, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'base-ui',
      repo: 'mui/base-ui',
      sha: '6a29b4b3b414251bf0ed23aa36e145d55e947c37',
      paths: [
        'docs/src/app/(docs)/react/components/scroll-area/demos/scroll-fade/css-modules/index.tsx',
        'docs/src/app/(docs)/react/components/scroll-area/demos/scroll-fade/css-modules/index.module.css',
        'docs/src/app/(docs)/react/components/scroll-area/demos/both/css-modules/index.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2019 Material-UI SAS'],
    },
    modifications: [
      'Replaced @base-ui/react ScrollArea with a native overflow viewport (hidden native scrollbar), a hand-written thumb that is sized and positioned from scroll metrics, thumb dragging and track click.',
      'The --scroll-area-overflow-*-start/end variables Base UI provides are set from scroll position; the upstream mask gradient is kept and extended to the horizontal axis and both axes.',
      'CSS modules converted to Tailwind classes and theme tokens; axis, fade size, scrollbar width, thumb color, radius, auto-hide and track visibility exposed as params.',
      'Scroll-end detection uses requestAnimationFrame timestamps; the demo content is original and autoscrolls via useFrameLoop.',
    ],
    assets: [],
  },
})
