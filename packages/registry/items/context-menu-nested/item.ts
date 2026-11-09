import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'context-menu-nested',
  status: 'published',
  title: { 'zh-CN': '右键菜单', en: 'Context Menu with Submenus' },
  summary: {
    'zh-CN': '在指针处打开的右键菜单，贴边时自动翻转，子菜单悬停稍候展开。方向键、Enter、Esc、Shift+F10 和触屏长按都能用。适合文件列表、画布和编辑器。',
    en: 'A right-click menu that opens at the pointer, flips near the edges and opens submenus on hover after a short delay. Arrow keys, Enter, Esc, Shift+F10 and touch long-press all work. For file lists, canvases and editors.',
  },
  kind: 'component',
  category: 'menu',
  tags: ['context-menu', 'right-click', 'submenu', 'keyboard', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'context-menu-nested.tsx', export: 'ContextMenuNested' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'context-menu-nested.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '高亮色', en: 'Highlight' }, hint: { 'zh-CN': '边框、分隔线和高亮底色；文字颜色按亮度自动取黑或白', en: 'Border, separators and highlight; text ink flips by luminance' }, default: '#ffffff' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 0, min: 0, max: 10, step: 1, unit: 'px', safe: [0, 8] },
    { key: 'submenuDelay', type: 'number', group: 'interaction', label: { 'zh-CN': '子菜单延时', en: 'Submenu delay' }, default: 100, min: 0, max: 400, step: 10, unit: 'ms', safe: [50, 250] },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '触发区文案', en: 'Trigger label' }, default: 'Right click here', maxLength: 28 },
  ],
  presets: [
    { id: 'mono', name: { 'zh-CN': '黑白', en: 'Mono' }, values: { accent: '#ffffff', radius: 0 } },
    { id: 'citrus', name: { 'zh-CN': '柑橘', en: 'Citrus' }, values: { accent: '#facc15', radius: 4 } },
    { id: 'iris', name: { 'zh-CN': '鸢尾', en: 'Iris' }, values: { accent: '#6366f1', radius: 6, submenuDelay: 160 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.6, posterTime: 4.2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'base-ui',
      repo: 'mui/base-ui',
      sha: '6a29b4b3b414251bf0ed23aa36e145d55e947c37',
      paths: [
        'docs/src/app/(docs)/react/components/context-menu/demos/submenu/tailwind/index.tsx',
        'docs/src/app/(docs)/react/components/context-menu/demos/submenu/css-modules/index.module.css',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2019 Material-UI SAS'],
    },
    modifications: [
      'Replaced @base-ui/react ContextMenu with a small hand-written menu: pointer positioning with edge flipping, hover-delay submenus, roving highlight with arrow keys, Esc, Shift+F10 and touch long-press.',
      'Kept the demo markup, items, class names and the 100 ms scale/opacity transition (via motion/react); styled the dark variant only, with the white accent, corner radius and submenu delay exposed as params.',
      'Added a controlled state prop used by the demo autoplay.',
    ],
    assets: [],
  },
})
