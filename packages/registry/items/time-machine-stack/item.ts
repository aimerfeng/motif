import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'time-machine-stack',
  status: 'published',
  title: { 'zh-CN': '时光机卡堆', en: 'Time Machine Stack' },
  summary: {
    'zh-CN': '一叠面板沿着纵深向远处退去，滚轮、拖动或方向键把最前面的一张推过镜头，翻回去时又从眼前落下。适合版本历史、备份快照和文档修订记录。',
    en: 'A pile of panels recedes into depth; scroll, drag or press an arrow key to fly the front one past the camera, and travel back to see it drop in again. Made for version history, backup snapshots and revision timelines.',
  },
  kind: 'component',
  category: 'layout',
  tags: ['stack', 'history', 'timeline', 'depth', '3d', 'carousel', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'time-machine-stack.tsx', export: 'TimeMachineStack' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'time-machine-stack.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'height', type: 'number', group: 'layout', label: { 'zh-CN': '堆叠高度', en: 'Stack height' }, default: 340, min: 280, max: 460, step: 4, unit: 'px', safe: [300, 420] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '面板圆角', en: 'Panel radius' }, default: 18, min: 6, max: 32, step: 1, unit: 'px', safe: [10, 26] },
    { key: 'visibleCount', type: 'number', group: 'layout', label: { 'zh-CN': '可见层数', en: 'Visible layers' }, default: 5, min: 3, max: 6, step: 1 },
    { key: 'offsetY', type: 'number', group: 'layout', label: { 'zh-CN': '层间错位', en: 'Layer offset' }, hint: { 'zh-CN': '每退一层向上露出多少', en: 'How much each receding layer peeks out above' }, default: 34, min: 24, max: 48, step: 1, unit: 'px', safe: [28, 42] },
    { key: 'depth', type: 'number', group: 'layout', label: { 'zh-CN': '纵深', en: 'Depth' }, default: 56, min: 30, max: 90, step: 2, unit: 'px', safe: [40, 80] },
    { key: 'scaleStep', type: 'number', group: 'layout', label: { 'zh-CN': '逐层缩小', en: 'Scale step' }, default: 0.05, min: 0.03, max: 0.08, step: 0.005, safe: [0.035, 0.07] },
    { key: 'perspective', type: 'number', group: 'look', label: { 'zh-CN': '透视距离', en: 'Perspective' }, hint: { 'zh-CN': '越小透视越夸张', en: 'Smaller means a more dramatic perspective' }, default: 1400, min: 900, max: 2200, step: 50, unit: 'px', safe: [1000, 2000] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '翻页弹簧', en: 'Travel spring' }, default: { visualDuration: 0.3, bounce: 0.1 } },
  ],
  presets: [
    { id: 'archive', name: { 'zh-CN': '档案柜', en: 'Archive' }, values: { height: 340, radius: 18, visibleCount: 5, offsetY: 34, depth: 56, scaleStep: 0.05, perspective: 1400 } },
    { id: 'deep-freeze', name: { 'zh-CN': '深潜', en: 'Deep Dive' }, values: { height: 400, radius: 22, visibleCount: 6, offsetY: 28, depth: 84, scaleStep: 0.065, perspective: 1000, spring: { visualDuration: 0.4, bounce: 0.15 } } },
    { id: 'flat-deck', name: { 'zh-CN': '薄牌叠', en: 'Flat Deck' }, values: { height: 300, radius: 10, visibleCount: 4, offsetY: 44, depth: 34, scaleStep: 0.04, perspective: 2000, spring: { visualDuration: 0.22, bounce: 0 } } },
    { id: 'rolodex', name: { 'zh-CN': '转盘卡片', en: 'Rolodex' }, values: { height: 380, radius: 28, visibleCount: 5, offsetY: 38, depth: 70, scaleStep: 0.06, perspective: 1200, spring: { visualDuration: 0.45, bounce: 0.3 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use to browse an ordered history (snapshots, revisions, past orders) where recency matters and each entry is a self-contained panel. For comparing many items at once prefer a grid.'],
    rules: [
      'Pass items as { id, content }; every panel gets the same width and the stack height, so design the content to fill its box (header, list, footer) and keep it under ~200px tall at the default height.',
      'Keyboard: ArrowUp/Down (or Left/Right), Home, End. The wheel is only captured while there is a next or previous panel, so the page can still scroll at both ends.',
      'Controlled: index + onIndexChange. Panels carry role="option"; keep a live caption such as "Snapshot 3 of 8" in the content for screen readers.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.5, posterTime: 3.2, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/time-machine-stack/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Exposed stack height, panel radius, visible layers, layer offset, depth, scale step, perspective and the travel spring as parameters.',
      'Panels use the theme card color; arrow Left/Right also travel; cn comes from @motif/runtime and the default values live in the item defaults region.',
    ],
    assets: [],
  },
})
