import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'menubar-app',
  status: 'published',
  title: { 'zh-CN': '应用菜单栏', en: 'Application Menubar' },
  summary: {
    'zh-CN': '桌面应用式的菜单栏（File、Edit、View、Help）：点开一个菜单后，悬停即可切换到其他菜单，左右方向键在菜单间移动。菜单项带快捷键、勾选项、单选组和子菜单。适合网页 IDE、编辑器和设计工具。',
    en: 'A desktop-style menubar (File, Edit, View, Help): open one menu and hovering switches to the others, arrow keys move across menus. Items carry shortcuts, checkmarks, a radio group and submenus. For web IDEs, editors and design tools.',
  },
  kind: 'component',
  category: 'menu',
  tags: ['menubar', 'menu', 'submenu', 'shortcuts', 'keyboard', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'menubar-app.tsx', export: 'MenubarApp' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'menubar-app.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '高亮色', en: 'Highlight' }, hint: { 'zh-CN': '边框、分隔线和高亮底色；文字颜色按亮度自动取黑或白', en: 'Border, separators and highlight; text ink flips by luminance' }, default: '#ffffff' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 0, min: 0, max: 10, step: 1, unit: 'px', safe: [0, 8] },
    {
      key: 'density',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '密度', en: 'Density' },
      default: 'comfortable',
      options: [
        { value: 'comfortable', label: { 'zh-CN': '宽松', en: 'Comfortable' } },
        { value: 'compact', label: { 'zh-CN': '紧凑', en: 'Compact' } },
      ],
    },
    { key: 'showShortcuts', type: 'boolean', group: 'content', label: { 'zh-CN': '显示快捷键', en: 'Show shortcuts' }, default: true },
    { key: 'openOnHover', type: 'boolean', group: 'interaction', label: { 'zh-CN': '悬停打开', en: 'Open on hover' }, hint: { 'zh-CN': '关闭时需先点开一个菜单，之后悬停切换', en: 'When off, click one menu first; hovering then switches menus' }, default: false },
  ],
  presets: [
    { id: 'mono', name: { 'zh-CN': '黑白', en: 'Mono' }, values: { accent: '#ffffff', radius: 0, density: 'comfortable' } },
    { id: 'citrus', name: { 'zh-CN': '柑橘', en: 'Citrus' }, values: { accent: '#facc15', radius: 4, density: 'comfortable' } },
    { id: 'iris', name: { 'zh-CN': '鸢尾', en: 'Iris' }, values: { accent: '#6366f1', radius: 6, density: 'compact' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.6, posterTime: 6, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'base-ui',
      repo: 'mui/base-ui',
      sha: '6a29b4b3b414251bf0ed23aa36e145d55e947c37',
      paths: [
        'docs/src/app/(docs)/react/components/menubar/demos/hero/css-modules/index.tsx',
        'docs/src/app/(docs)/react/components/menubar/demos/hero/css-modules/index.module.css',
        'docs/src/app/(docs)/react/components/menu/demos/radio-items/css-modules/index.tsx',
        'docs/src/app/(docs)/react/components/menu/demos/checkbox-items/css-modules/index.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2019 Material-UI SAS'],
    },
    modifications: [
      'Replaced @base-ui/react Menubar and Menu with a small hand-written menubar: menubar/menu/menuitemcheckbox/menuitemradio roles, roving focus on triggers, arrow keys across and within menus, hover switching once a menu is open, Esc and outside-click closing.',
      'Kept the hero demo menus, items, CSS-module styles (as Tailwind classes, dark variant) and the 100 ms scale/opacity transition (via motion/react); merged the checkbox and radio item demos into the View menu.',
      'Added keyboard shortcut hints, edge-aware popup/submenu placement, params for accent, corner radius, density, shortcuts and open-on-hover, and a controlled state prop used by the demo autoplay.',
    ],
    assets: [],
  },
})
