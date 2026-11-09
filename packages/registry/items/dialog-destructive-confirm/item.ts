import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'dialog-destructive-confirm',
  status: 'published',
  title: { 'zh-CN': '危险操作确认弹窗', en: 'Destructive Confirm Dialog' },
  summary: {
    'zh-CN': '用于不可撤销操作的警告弹窗：警示图标、列出后果，删除按钮在输入资源名之前保持禁用，输对后填满红色。Esc 和取消是默认的安全选项。适合删除项目、账号和数据。',
    en: 'An alert dialog for irreversible actions: a warning icon, the consequences listed, and a delete button that stays disabled until you type the resource name, then fills red. Esc and Cancel are the safe defaults. For deleting projects, accounts and data.',
  },
  kind: 'component',
  category: 'dialog',
  tags: ['alert-dialog', 'confirm', 'destructive', 'delete', 'modal', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'dialog-destructive-confirm.tsx', export: 'DialogDestructiveConfirm' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'dialog-destructive-confirm.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'confirmMode',
      type: 'select',
      group: 'interaction',
      label: { 'zh-CN': '确认方式', en: 'Confirm mode' },
      default: 'type',
      options: [
        { value: 'type', label: { 'zh-CN': '输入名称确认', en: 'Type to confirm' } },
        { value: 'simple', label: { 'zh-CN': '直接确认', en: 'Simple' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '危险色', en: 'Destructive color' }, default: '#ef4444' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 24, min: 8, max: 32, step: 1, unit: 'px', safe: [16, 28] },
    { key: 'dim', type: 'number', group: 'look', label: { 'zh-CN': '遮罩深度', en: 'Backdrop dim' }, default: 0.4, min: 0.1, max: 0.8, step: 0.05, safe: [0.3, 0.6] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.22, bounce: 0.1 } },
    { key: 'resourceName', type: 'text', group: 'content', label: { 'zh-CN': '资源名', en: 'Resource name' }, default: 'atlas-web', maxLength: 32 },
    { key: 'showConsequences', type: 'boolean', group: 'content', label: { 'zh-CN': '列出后果', en: 'List consequences' }, default: true },
  ],
  presets: [
    { id: 'guarded', name: { 'zh-CN': '层层把关', en: 'Guarded' }, values: { confirmMode: 'type', accent: '#ef4444', radius: 24, showConsequences: true } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { confirmMode: 'type', accent: '#f97316', radius: 14, dim: 0.55, showConsequences: false } },
    { id: 'quick', name: { 'zh-CN': '轻确认', en: 'Quick Check' }, values: { confirmMode: 'simple', accent: '#e11d48', radius: 30, showConsequences: false, spring: { visualDuration: 0.3, bounce: 0.2 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: ['Use type-to-confirm only for truly irreversible deletes; keep Cancel focused by default and never make the destructive button the Enter default unless the name is typed.'],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.3, posterTime: 5.2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: [
        'registry-reui/bases/base/components/alert-dialog/c-alert-dialog-5.tsx',
        'registry-reui/bases/base/components/alert-dialog/c-alert-dialog-8.tsx',
        'registry/bases/base/ui/alert-dialog.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      'Replaced the base-ui AlertDialog primitives with a hand-rolled role="alertdialog" (focus starts on Cancel, Tab is trapped, Esc and the backdrop cancel, focus returns on close).',
      'Kept the c-alert-dialog-8 layout (icon circle, title, description, footer); added a consequences list and a type-to-confirm input that arms the action, whose fill animates in with motion.',
      'IconPlaceholder replaced with inline SVG; colors, radius, backdrop dim and spring come from params; open/close uses motion instead of tw-animate classes.',
    ],
    assets: [],
  },
})
