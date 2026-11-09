import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'settings-api-keys',
  status: 'published',
  title: { 'zh-CN': 'API 密钥管理', en: 'API Keys Manager' },
  summary: {
    'zh-CN': '一张 API 密钥表：密钥默认打码、点一下显示，复制有对勾反馈，带权限标签、最近使用时间、到期状态和吊销；新建的密钥高亮显示完整内容，只给看这一次。适合 SaaS 和开发者平台的设置页。',
    en: 'A table of API keys with masked secrets that reveal on click, copy feedback, permission badges, last-used time, expiry status and revoke. A newly created key shows its full secret once in a highlighted row. For developer settings in SaaS and platforms.',
  },
  kind: 'section',
  category: 'settings',
  tags: ['api keys', 'tokens', 'developer', 'table', 'secrets', 'settings'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'settings-api-keys.tsx', export: 'SettingsApiKeys' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'settings-api-keys.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#6366f1' },
    {
      key: 'maskStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '打码方式', en: 'Mask style' },
      default: 'dots',
      options: [
        { value: 'dots', label: { 'zh-CN': '圆点', en: 'Dots' } },
        { value: 'stars', label: { 'zh-CN': '星号', en: 'Asterisks' } },
        { value: 'blur', label: { 'zh-CN': '模糊', en: 'Blur' } },
      ],
    },
    {
      key: 'density',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '密度', en: 'Density' },
      default: 'comfortable',
      options: [
        { value: 'comfortable', label: { 'zh-CN': '舒适', en: 'Comfortable' } },
        { value: 'compact', label: { 'zh-CN': '紧凑', en: 'Compact' } },
      ],
    },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 12, min: 0, max: 24, step: 1, unit: 'px', safe: [8, 16] },
    { key: 'showScopes', type: 'boolean', group: 'layout', label: { 'zh-CN': '显示权限', en: 'Show permissions' }, default: true },
    { key: 'rows', type: 'number', group: 'content', label: { 'zh-CN': '密钥数量', en: 'Keys' }, default: 4, min: 1, max: 4, step: 1 },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.35, bounce: 0.15 } },
  ],
  presets: [
    { id: 'console', name: { 'zh-CN': '控制台', en: 'Console' }, values: { accent: '#6366f1', maskStyle: 'dots', density: 'comfortable', radius: 12 } },
    { id: 'terminal', name: { 'zh-CN': '终端', en: 'Terminal' }, values: { accent: '#22c55e', maskStyle: 'stars', density: 'compact', radius: 4 } },
    { id: 'frosted', name: { 'zh-CN': '雾面', en: 'Frosted' }, values: { accent: '#f59e0b', maskStyle: 'blur', radius: 18, showScopes: false } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: ['Never ship real secrets to the client: the table should receive masked values and fetch the full secret only on explicit reveal, and a newly created key is shown once.'],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: ['registry-reui/bases/base/components/table/c-table-12.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      'Replaced the base-ui Card, Table, Badge and Button primitives with plain elements carrying the same Tailwind classes; IconPlaceholder replaced with inline SVG.',
      'Added click-to-reveal secrets with three mask styles, copy feedback, revoke, expiry text and a Create key flow that shows the new secret once in an accent-tinted row.',
      'Accent, mask style, density, radius, permission column, row count and spring come from params; row enter/exit animated with motion; responsive columns for narrow screens.',
    ],
    assets: [],
  },
})
