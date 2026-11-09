import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'navbar-ai-chat',
  status: 'published',
  title: { 'zh-CN': 'AI 对话顶栏', en: 'AI Chat Header' },
  summary: {
    'zh-CN': '对话应用的顶栏：左边是模型选择器，每个虚构模型配一行擅长什么；右边是临时对话按钮和账户菜单。适合 AI 助手和模型试验场。',
    en: 'A chat app top bar with a model picker listing invented models with a one-line strength each, a temporary-chat button and the account menu. Made for assistants and model playgrounds.',
  },
  kind: 'section',
  category: 'navbar',
  tags: ['navbar', 'header', 'ai', 'chat', 'model picker', 'select', 'user menu'],
  runtime: ['react', 'motion', 'css', 'svg'],
  entry: { file: 'navbar-ai-chat.tsx', export: 'NavbarAiChat' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'navbar-ai-chat.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'model',
      type: 'select',
      group: 'content',
      label: { 'zh-CN': '默认模型', en: 'Default model' },
      default: 'orion-alpha-45',
      options: [
        { value: 'orion-alpha-45', label: { 'zh-CN': 'Orion-Alpha 4.5', en: 'Orion-Alpha 4.5' } },
        { value: 'orion-code-4', label: { 'zh-CN': 'Orion-Code 4', en: 'Orion-Code 4' } },
        { value: 'nova-chat-4', label: { 'zh-CN': 'Nova-Chat 4', en: 'Nova-Chat 4' } },
        { value: 'galaxy-max-4', label: { 'zh-CN': 'Galaxy-Max 4', en: 'Galaxy-Max 4' } },
      ],
    },
    { key: 'showDescriptions', type: 'boolean', group: 'content', label: { 'zh-CN': '显示模型说明', en: 'Show descriptions' }, default: true },
    { key: 'showTemporaryChat', type: 'boolean', group: 'content', label: { 'zh-CN': '临时对话按钮', en: 'Temporary chat button' }, default: true },
    { key: 'height', type: 'number', group: 'layout', label: { 'zh-CN': '高度', en: 'Height' }, default: 64, min: 48, max: 80, step: 1, unit: 'px', safe: [56, 72] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 8, min: 0, max: 18, step: 1, unit: 'px', safe: [4, 12] },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '头像色', en: 'Accent' }, default: '#6366f1' },
  ],
  presets: [
    { id: 'origin', name: { 'zh-CN': '原样', en: 'Origin' }, values: {} },
    { id: 'compact', name: { 'zh-CN': '紧凑', en: 'Compact' }, values: { height: 52, radius: 4, showDescriptions: false, accent: '#f59e0b' } },
    { id: 'soft', name: { 'zh-CN': '柔圆', en: 'Soft' }, values: { radius: 16, accent: '#34d399', model: 'nova-chat-4' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.3, posterTime: 1.8, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: [
        'apps/origin/registry/default/components/comp-591.tsx',
        'apps/origin/registry/default/components/navbar-components/user-menu.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'Replaced the Radix Select with a hand-rolled listbox (keyboard, aria-activedescendant) and the Radix DropdownMenu with a small menu; popovers fade/scale in with motion/react.',
      'Replaced lucide icons with inline SVG and the avatar image with initials on an accent color; placeholder menu labels and the email were swapped for generic ones.',
      'Added default model, descriptions, temporary chat, height, radius and accent params, plus controlled open state so the demo can autoplay on the frame clock.',
    ],
    assets: [],
  },
})
