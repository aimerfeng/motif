import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'navbar-floating-menu',
  status: 'published',
  title: { 'zh-CN': '悬浮导航与大菜单', en: 'Floating Navbar with Mega Menu' },
  summary: {
    'zh-CN': '毛玻璃药丸形悬浮导航，悬停项之间用弹簧滑动的高亮底，「产品」展开带图标的三项菜单和一张渐变推荐卡。也可以切成贴顶的整宽导航栏，手机上收成汉堡菜单。',
    en: 'A frosted pill navbar whose hover highlight glides between links on a spring, with a Products mega menu of three icon rows and a gradient feature card. Also a full-width bar variant, collapsing to a hamburger on phones.',
  },
  kind: 'section',
  category: 'navbar',
  tags: ['navbar', 'header', 'mega menu', 'floating', 'glass', 'dropdown'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'navbar-floating-menu.tsx', export: 'NavbarFloatingMenu' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'navbar-floating-menu.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'brand', type: 'text', label: { 'zh-CN': '品牌名', en: 'Brand name' }, default: 'Halcyon', maxLength: 18, group: 'content' },
    { key: 'cta', type: 'text', label: { 'zh-CN': '按钮文案', en: 'Button label' }, default: 'Get started', maxLength: 20, group: 'content' },
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent color' }, default: '#7c8cff', group: 'look' },
    {
      key: 'tone',
      type: 'select',
      label: { 'zh-CN': '明暗', en: 'Tone' },
      default: 'dark',
      options: [
        { value: 'dark', label: { 'zh-CN': '深色', en: 'Dark' } },
        { value: 'light', label: { 'zh-CN': '浅色', en: 'Light' } },
      ],
      group: 'look',
    },
    { key: 'radius', type: 'number', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 999, min: 0, max: 999, step: 1, unit: 'px', safe: [12, 999], group: 'look' },
    { key: 'blur', type: 'number', label: { 'zh-CN': '毛玻璃模糊', en: 'Glass blur' }, default: 16, min: 0, max: 32, step: 1, unit: 'px', safe: [8, 24], group: 'look' },
    {
      key: 'layout',
      type: 'select',
      label: { 'zh-CN': '形态', en: 'Style' },
      default: 'floating',
      options: [
        { value: 'floating', label: { 'zh-CN': '悬浮药丸', en: 'Floating pill' } },
        { value: 'bar', label: { 'zh-CN': '贴顶整宽', en: 'Full-width bar' } },
      ],
      group: 'layout',
    },
  ],
  presets: [
    { id: 'periwinkle', name: { 'zh-CN': '长春花', en: 'Periwinkle' }, values: {} },
    { id: 'citrus-bar', name: { 'zh-CN': '柑橘', en: 'Citrus' }, values: { accent: '#f59e0b', layout: 'bar', brand: 'Kiln' } },
    { id: 'frost', name: { 'zh-CN': '霜', en: 'Frost' }, values: { tone: 'light', accent: '#0ea5e9', radius: 20, blur: 22 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable'],
  guidance: {
    rules: [
      'Four to five top-level links at most; only one of them opens a mega menu, and it lists three items plus one feature card.',
      'The navbar sits on top of page content, so keep the glass background translucent and let the blur do the separation; do not add a solid fill.',
      'One filled accent button on the right (the primary action); Sign in stays a quiet text link.',
      'Navigation is a real nav with buttons and aria-expanded; keep keyboard focus opening the menu.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.35, posterTime: 0.8, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'launch-ui',
      repo: 'launch-ui/launch-ui',
      sha: 'b0d4d5bce91d13523450416ce1797109076b2787',
      paths: ['components/sections/navbar/default.tsx', 'components/ui/navbar.tsx', 'components/ui/navigation-menu.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Mikolaj Dobrucki'],
    },
    modifications: [
      'Rebuilt the navbar without Radix navigation-menu, Sheet and lucide: a nav of buttons with a motion layoutId highlight, an AnimatePresence mega menu and a small hamburger list.',
      'Added the floating pill / full-width bar variants, glass blur, tone and accent params; the Launch UI logo and links were replaced by an invented mark and generic items.',
      'The active link can be controlled (active / onActiveChange) so a demo can drive it without a pointer.',
    ],
    assets: [],
  },
})
