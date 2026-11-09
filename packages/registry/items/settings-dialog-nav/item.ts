import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'settings-dialog-nav',
  status: 'published',
  title: { 'zh-CN': '设置弹窗', en: 'Settings Dialog' },
  summary: {
    'zh-CN': '带左侧导航和面包屑标题的大号设置弹窗：切换分区时右侧面板滑入，手机上导航变成可返回的两级页面。适合从头像菜单打开的全局偏好设置。',
    en: 'A large settings modal with its own left navigation and a breadcrumb header; switching sections slides the right pane, and on phones the nav becomes a back-stack. For app-wide preferences opened from an avatar menu.',
  },
  kind: 'section',
  category: 'settings',
  tags: ['settings', 'dialog', 'modal', 'sidebar', 'preferences', 'shadcn'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'settings-dialog-nav.tsx', export: 'SettingsDialog' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'settings-dialog-nav.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#7c8cff' },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '最大宽度', en: 'Max width' }, default: 800, min: 640, max: 960, step: 20, unit: 'px', safe: [700, 880] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 10, min: 0, max: 24, step: 1, unit: 'px', safe: [6, 16] },
    {
      key: 'navStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '导航选中样式', en: 'Active nav style' },
      default: 'muted',
      options: [
        { value: 'muted', label: { 'zh-CN': '浅底', en: 'Muted' } },
        { value: 'accent', label: { 'zh-CN': '主色底', en: 'Accent fill' } },
        { value: 'bar', label: { 'zh-CN': '侧边竖条', en: 'Side bar' } },
      ],
    },
    {
      key: 'panelTransition',
      type: 'select',
      group: 'motion',
      label: { 'zh-CN': '面板切换', en: 'Pane transition' },
      default: 'slide',
      options: [
        { value: 'slide', label: { 'zh-CN': '滑动', en: 'Slide' } },
        { value: 'fade', label: { 'zh-CN': '淡入', en: 'Fade' } },
        { value: 'none', label: { 'zh-CN': '无', en: 'None' } },
      ],
    },
    { key: 'dim', type: 'number', group: 'look', label: { 'zh-CN': '遮罩深度', en: 'Backdrop dim' }, default: 0.5, min: 0.1, max: 0.85, step: 0.05, safe: [0.3, 0.7] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.35, bounce: 0.1 } },
  ],
  presets: [
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { accent: '#7c8cff', navStyle: 'muted', panelTransition: 'slide', radius: 10 } },
    { id: 'citrus', name: { 'zh-CN': '青柠', en: 'Citrus' }, values: { accent: '#d9f99d', navStyle: 'accent', panelTransition: 'fade', radius: 16 } },
    { id: 'signal', name: { 'zh-CN': '信号', en: 'Signal' }, values: { accent: '#f97316', navStyle: 'bar', panelTransition: 'slide', radius: 4, dim: 0.7 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'shadcn-ui',
      repo: 'shadcn-ui/ui',
      sha: '08ab84f7d1952cc1f36055aa8931213a86b01bbd',
      paths: [
        'apps/v4/registry/new-york-v4/blocks/sidebar-13/page.tsx',
        'apps/v4/registry/new-york-v4/blocks/sidebar-13/components/settings-dialog.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 shadcn'],
    },
    modifications: [
      'Replaced Radix Dialog, Sidebar and Breadcrumb primitives with hand-rolled markup (focus trap, Esc to close, inert trigger, focus restore).',
      'lucide-react icons are inline SVG; placeholder panes are replaced by real settings rows with switches.',
      'Nav items are buttons that switch the active section, with a slide/fade pane transition; below md the nav becomes a back-stack.',
      'Accent, width, radius, nav style, transition, backdrop dim and spring come from params.',
    ],
    assets: [],
  },
})
