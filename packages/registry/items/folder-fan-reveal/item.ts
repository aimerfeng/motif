import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'folder-fan-reveal',
  status: 'published',
  title: { 'zh-CN': '文件夹展开', en: 'Folder Reveal' },
  summary: {
    'zh-CN': '照着真文件夹画的轮廓：凸起的标签、带明暗的前盖和内槽。悬停或点击时前盖向后倾，里面的文件依次扇形弹出。适合项目选择、文件投放和作品集分类。',
    en: 'A folder drawn from a real silhouette — raised tab, shaded front flap, inner well — whose flap tips back as the papers inside fan out on hover or click. For project pickers, file drops and portfolio categories.',
  },
  kind: 'effect',
  category: 'card',
  tags: ['folder', 'files', 'fan', 'reveal', 'hover', 'spring'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'folder-fan-reveal.tsx', export: 'FolderReveal' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'folder-fan-reveal.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'color',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '文件夹颜色', en: 'Folder stock' },
      default: 'manila',
      options: [
        { value: 'manila', label: { 'zh-CN': '牛皮纸', en: 'Manila' } },
        { value: 'brand', label: { 'zh-CN': '玫红', en: 'Rose' } },
        { value: 'blue', label: { 'zh-CN': '蓝', en: 'Blue' } },
        { value: 'green', label: { 'zh-CN': '绿', en: 'Green' } },
        { value: 'slate', label: { 'zh-CN': '石板灰', en: 'Slate' } },
      ],
    },
    { key: 'spread', type: 'number', group: 'layout', label: { 'zh-CN': '展开间距', en: 'Spread' }, hint: { 'zh-CN': '相邻文件之间的水平距离', en: 'Horizontal distance between fanned cards' }, default: 62, min: 30, max: 80, step: 1, unit: 'px', safe: [44, 72] },
    { key: 'rotation', type: 'number', group: 'layout', label: { 'zh-CN': '扇形角度', en: 'Rotation' }, hint: { 'zh-CN': '每张文件的旋转角度', en: 'Degrees of rotation per card' }, default: 7, min: 0, max: 14, step: 0.5, unit: 'deg', safe: [3, 10] },
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '文件夹宽度', en: 'Folder width' }, default: 260, min: 180, max: 320, step: 2, unit: 'px', safe: [200, 300] },
    {
      key: 'trigger',
      type: 'select',
      group: 'interaction',
      label: { 'zh-CN': '触发方式', en: 'Trigger' },
      default: 'hover',
      options: [
        { value: 'hover', label: { 'zh-CN': '悬停', en: 'Hover' } },
        { value: 'click', label: { 'zh-CN': '点击', en: 'Click' } },
      ],
    },
    { key: 'itemCount', type: 'number', group: 'content', label: { 'zh-CN': '文件数量', en: 'Item count' }, hint: { 'zh-CN': '最多显示几张文件', en: 'Maximum number of cards shown' }, default: 3, min: 1, max: 5, step: 1, safe: [2, 4] },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '标签文字', en: 'Label' }, default: 'Folder', maxLength: 16 },
  ],
  presets: [
    { id: 'archive', name: { 'zh-CN': '档案柜', en: 'Archive' }, values: { color: 'manila', spread: 62, rotation: 7, size: 260, itemCount: 3, label: 'Invoices' } },
    { id: 'darkroom', name: { 'zh-CN': '暗房', en: 'Darkroom' }, values: { color: 'blue', spread: 58, rotation: 9, size: 260, itemCount: 4, label: 'Photos' } },
    { id: 'moodboard', name: { 'zh-CN': '灵感板', en: 'Moodboard' }, values: { color: 'brand', spread: 70, rotation: 5, size: 280, itemCount: 3, label: 'Brand' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Pass items as { id, content, color? }; cards are sized from the folder width, so keep their content small (a title line and a size).',
      'Hover only opens on hover-capable pointers; keyboard focus opens it too. Use trigger="click" for touch-first layouts, or control it with open + onOpenChange.',
      'The fanned cards extend past the folder; leave about one card height of room above it.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.6, posterTime: 2.2, loop: 5 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/folder-reveal/index.tsx', 'apps/docs/examples/folder-reveal.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Props come from the @motif:defaults region (color, spread, rotation, size, trigger, itemCount, label); itemCount caps how many items are rendered.',
      'cn is imported from @motif/runtime; named export instead of default; a style prop is merged onto the root.',
      'Demo adapted from the upstream example with a frame-loop autoplay that opens and closes the folder until the user interacts.',
    ],
    assets: [],
  },
})
