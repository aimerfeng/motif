import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'dialog-drawer',
  status: 'published',
  title: { 'zh-CN': '底部抽屉', en: 'Bottom Drawer' },
  summary: {
    'zh-CN': '从底部升起的抽屉，背后的页面缩小后退。拖动手柄可以停在半高或全高，用力一甩就关闭。焦点被困在抽屉内，Esc 关闭。适合移动端的添加、筛选和确认流程。',
    en: 'A sheet that rises from the bottom while the page behind it scales back. Drag the handle to rest at half or full height, or fling it away to close. Focus is trapped and Esc closes. Made for add, filter and confirm flows.',
  },
  kind: 'component',
  category: 'dialog',
  tags: ['drawer', 'bottom-sheet', 'modal', 'drag', 'snap-points', 'vaul', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'dialog-drawer.tsx', export: 'DialogDrawer' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'dialog-drawer.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#8b5cf6' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '顶部圆角', en: 'Top radius' }, default: 26, min: 8, max: 40, step: 1, unit: 'px', safe: [16, 32] },
    {
      key: 'snapMode',
      type: 'select',
      group: 'interaction',
      label: { 'zh-CN': '停靠方式', en: 'Snap points' },
      default: 'two',
      options: [
        { value: 'two', label: { 'zh-CN': '半高 + 全高', en: 'Half + full' } },
        { value: 'single', label: { 'zh-CN': '单一高度', en: 'Single height' } },
      ],
    },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.5, bounce: 0.12 } },
    { key: 'dim', type: 'number', group: 'look', label: { 'zh-CN': '遮罩深度', en: 'Backdrop dim' }, default: 0.55, min: 0, max: 0.85, step: 0.05, safe: [0.35, 0.7] },
    { key: 'scaleBackground', type: 'boolean', group: 'look', label: { 'zh-CN': '背景缩放后退', en: 'Scale page back' }, default: true },
    { key: 'maxWidth', type: 'number', group: 'layout', label: { 'zh-CN': '最大宽度', en: 'Max width' }, default: 460, min: 320, max: 720, step: 10, unit: 'px', safe: [380, 560] },
  ],
  presets: [
    { id: 'violet-sheet', name: { 'zh-CN': '紫罗兰', en: 'Violet Sheet' }, values: { color: '#8b5cf6', radius: 26, snapMode: 'two' } },
    { id: 'soft-glide', name: { 'zh-CN': '缓行', en: 'Soft Glide' }, values: { color: '#38bdf8', radius: 32, snapMode: 'two', spring: { visualDuration: 0.65, bounce: 0 }, dim: 0.4 } },
    { id: 'snappy', name: { 'zh-CN': '利落', en: 'Snappy' }, values: { color: '#f472b6', radius: 16, snapMode: 'single', spring: { visualDuration: 0.34, bounce: 0.2 }, dim: 0.7 } },
    { id: 'flat-page', name: { 'zh-CN': '平铺', en: 'Flat Page' }, values: { color: '#a3e635', radius: 12, snapMode: 'single', scaleBackground: false, dim: 0.6, maxWidth: 560 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use for secondary tasks that should keep page context visible: adding an item, choosing filters, confirming an action, mobile navigation. Use a centered dialog on desktop for blocking decisions.'],
    rules: [
      'Control it with open + onOpenChange (and snap + onSnapChange if you care about the stop). Give it a title (required, it names the dialog) and optionally a description.',
      'Pass the page as the page prop to get the scale-back effect and automatic inert on the page; use contained inside previews or embedded frames, leave it off for a viewport-wide sheet.',
      'Only the handle and title bar start a drag, so the content can scroll and hold forms. Keep the first snap tall enough to show the primary action.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1, posterTime: 5.6, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'vaul',
      repo: 'emilkowalski/vaul',
      sha: '3e97aac6a38e4481bade71d7233ed6002e80f9b0',
      paths: ['src/index.tsx', 'src/use-snap-points.ts', 'src/use-scale-background.ts', 'src/constants.ts'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 Emil Kowalski'],
    },
    modifications: [
      'Reimplemented without radix dialog or vaul: dragging uses motion drag controls on a single motion value, release projects the velocity onto the nearest snap point (or closes), and the background scale is derived from the same value.',
      'Focus handling was written for this component: focus moves into the dialog, Tab is trapped, Esc closes, focus returns to the previous element and the page behind becomes inert; body scrolling is locked when the sheet is not contained.',
      'Snap points are two presets (half + full, or one height) sized from the frame, not a free list; spring is described by visualDuration + bounce. Reduced motion replaces the spring with a short ease and disables the page scale-back easing effect on drag.',
    ],
    assets: [],
  },
})
