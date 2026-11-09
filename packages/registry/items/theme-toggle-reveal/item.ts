import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'theme-toggle-reveal',
  status: 'published',
  title: { 'zh-CN': '主题切换揭幕', en: 'Theme Reveal Toggle' },
  summary: {
    'zh-CN': '一枚太阳 / 月亮按钮，借 View Transitions API 切换深浅色：新主题从按钮（或屏幕中心）以圆形、方形、菱形、六边形、三角或星形展开。适合站点顶栏和设置菜单。',
    en: 'A sun / moon button that switches light and dark through the View Transitions API, the new theme expanding from the button (or the viewport centre) as a circle, square, diamond, hexagon, triangle or star. For site headers and settings menus.',
  },
  kind: 'component',
  category: 'toggle',
  tags: ['theme', 'dark-mode', 'view-transitions', 'clip-path', 'toggle'],
  runtime: ['react', 'css', 'svg'],
  entry: { file: 'theme-toggle-reveal.tsx', export: 'ThemeToggleReveal' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'theme-toggle-reveal.tsx', role: 'component' },
    { path: 'theme-toggle-reveal.css', role: 'style' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '展开形状', en: 'Reveal shape' },
      default: 'circle',
      options: [
        { value: 'circle', label: { 'zh-CN': '圆形', en: 'Circle' } },
        { value: 'square', label: { 'zh-CN': '方形', en: 'Square' } },
        { value: 'rectangle', label: { 'zh-CN': '矩形', en: 'Rectangle' } },
        { value: 'diamond', label: { 'zh-CN': '菱形', en: 'Diamond' } },
        { value: 'hexagon', label: { 'zh-CN': '六边形', en: 'Hexagon' } },
        { value: 'triangle', label: { 'zh-CN': '三角形', en: 'Triangle' } },
        { value: 'star', label: { 'zh-CN': '星形', en: 'Star' } },
      ],
    },
    { key: 'duration', type: 'number', group: 'motion', label: { 'zh-CN': '时长', en: 'Duration' }, default: 400, min: 200, max: 1500, step: 50, unit: 'ms', safe: [300, 900] },
    { key: 'fromCenter', type: 'boolean', group: 'motion', label: { 'zh-CN': '从屏幕中心展开', en: 'From viewport centre' }, default: false },
    { key: 'iconSize', type: 'number', group: 'layout', label: { 'zh-CN': '图标大小', en: 'Icon size' }, default: 24, min: 16, max: 32, step: 1, unit: 'px' },
  ],
  presets: [
    { id: 'eclipse', name: { 'zh-CN': '日食', en: 'Eclipse' }, values: { variant: 'circle', duration: 400, fromCenter: false } },
    { id: 'starfall', name: { 'zh-CN': '流星', en: 'Starfall' }, values: { variant: 'star', duration: 800, fromCenter: false } },
    { id: 'prism', name: { 'zh-CN': '棱镜', en: 'Prism' }, values: { variant: 'hexagon', duration: 600, fromCenter: true } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'The component toggles the "dark" class on <html> inside document.startViewTransition; your theme must key off that class. Include the item CSS so the root view-transition snapshots are not cross-faded.',
      'Uncontrolled it writes "theme" to localStorage; pass theme + onThemeChange (e.g. next-themes) to own persistence yourself.',
      'Without the View Transitions API, or with reduced motion, the theme switches instantly.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.2, posterTime: 0.85, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'magicui',
      repo: 'magicuidesign/magicui',
      sha: 'd7207e5692d14c00dceafa8488d6d01f197fa0e4',
      paths: ['apps/www/registry/magicui/animated-theme-toggler.tsx', 'apps/www/registry/example/animated-theme-toggler-star-demo.tsx', 'apps/www/styles/globals.css'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Magic UI'],
    },
    modifications: [
      'lucide-react Sun / Moon replaced with inline SVG icons; cn comes from @motif/runtime.',
      'Props (variant, duration, fromCenter, iconSize) read from Motif params; data attribute and CSS variables renamed to motif-*.',
      'The view-transition CSS from the upstream globals.css ships as the item stylesheet, scoped to the active transition.',
      'Reduced motion skips the view transition; localStorage writes are wrapped in try/catch; onThemeChange also fires when uncontrolled; focus-visible ring added.',
      'Demo: a mock page whose reveal is replayed inside its frame on a useFrameLoop timer, interpolating the same clip paths.',
    ],
    assets: [],
  },
})
