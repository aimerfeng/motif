import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'radio-theme-preview',
  status: 'published',
  title: { 'zh-CN': '主题预览选择', en: 'Theme Preview Picker' },
  summary: {
    'zh-CN': '浅色、深色和跟随系统三个选项，各画成一个迷你应用窗口（侧栏、顶栏和卡片），选中的那个下方显示对勾；「系统」沿对角线一半浅一半深。适合外观设置页和新手引导。',
    en: 'Light, dark and system options drawn as miniature app windows (sidebar, header and cards) with a check under the chosen one; System is split diagonally between both. Made for appearance settings and onboarding.',
  },
  kind: 'component',
  category: 'checkbox',
  tags: ['theme', 'appearance', 'radio', 'dark mode', 'settings', 'form', 'a11y'],
  runtime: ['react', 'css', 'svg'],
  entry: { file: 'radio-theme-preview.tsx', export: 'ThemePreviewPicker' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'radio-theme-preview.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'options',
      type: 'select',
      group: 'content',
      label: { 'zh-CN': '选项', en: 'Options' },
      default: 'all',
      options: [
        { value: 'all', label: { 'zh-CN': '浅色 / 深色 / 系统', en: 'Light / Dark / System' } },
        { value: 'pair', label: { 'zh-CN': '浅色 / 深色', en: 'Light / Dark' } },
      ],
    },
    {
      key: 'previewStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '预览样式', en: 'Preview style' },
      default: 'app',
      options: [
        { value: 'app', label: { 'zh-CN': '侧栏应用', en: 'Sidebar app' } },
        { value: 'page', label: { 'zh-CN': '文档页面', en: 'Document page' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '迷你窗口里的高亮块', en: 'Highlights inside the mini windows' }, default: '#6366f1' },
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '宽度', en: 'Width' }, default: 88, min: 72, max: 108, step: 2, unit: 'px' },
    { key: 'radius', type: 'number', group: 'layout', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 6, min: 0, max: 14, step: 1, unit: 'px' },
    {
      key: 'labelPosition',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '标签位置', en: 'Label position' },
      default: 'start',
      options: [
        { value: 'start', label: { 'zh-CN': '左对齐', en: 'Start' } },
        { value: 'center', label: { 'zh-CN': '居中', en: 'Center' } },
      ],
    },
  ],
  presets: [
    { id: 'origin', name: { 'zh-CN': '原样', en: 'Origin' }, values: { options: 'all', previewStyle: 'app', accent: '#6366f1', size: 88, radius: 6, labelPosition: 'start' } },
    { id: 'paper', name: { 'zh-CN': '纸页', en: 'Paper' }, values: { options: 'pair', previewStyle: 'page', accent: '#f59e0b', size: 104, radius: 10, labelPosition: 'center' } },
    { id: 'console', name: { 'zh-CN': '控制台', en: 'Console' }, values: { options: 'all', previewStyle: 'app', accent: '#10b981', size: 80, radius: 2, labelPosition: 'start' } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 2, posterTime: 0.5, loop: 7.5 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: ['apps/origin/registry/default/components/comp-169.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'The upstream PNG screenshots are replaced by mini app windows drawn in CSS (light, dark, and a diagonally clipped system variant), plus a document-page variant.',
      'Replaced the Radix RadioGroup with native radio inputs sharing one name inside a role="radiogroup"; lucide Check / Minus icons became inline SVG.',
      'Added controlled / uncontrolled value, a two-option mode, and accent, width, radius and label alignment parameters.',
    ],
    assets: [],
  },
})
