import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'input-password-strength',
  status: 'published',
  title: { 'zh-CN': '密码强度输入框', en: 'Password Strength Field' },
  summary: {
    'zh-CN': '带显示 / 隐藏开关的密码框，下方强度条随输入从红到琥珀再到绿色逐步填满，长度、数字、大小写等规则清单实时打勾。适合注册、重置密码和账户安全表单。',
    en: 'A password field with a reveal toggle, a strength meter that fills and shifts from red through amber to green, and a live checklist of rules that tick off as you type. Made for sign-up, password reset and account security forms.',
  },
  kind: 'component',
  category: 'input',
  tags: ['input', 'password', 'strength', 'form', 'checklist', 'a11y'],
  runtime: ['react', 'css', 'svg'],
  entry: { file: 'input-password-strength.tsx', export: 'InputPasswordStrength' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'input-password-strength.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'meterStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '强度条样式', en: 'Meter style' },
      default: 'bar',
      options: [
        { value: 'bar', label: { 'zh-CN': '连续条', en: 'Bar' } },
        { value: 'segments', label: { 'zh-CN': '分段', en: 'Segments' } },
      ],
    },
    { key: 'segments', type: 'number', group: 'look', label: { 'zh-CN': '分段数', en: 'Segments' }, hint: { 'zh-CN': '仅分段样式', en: 'Segmented style only' }, default: 4, min: 3, max: 6, step: 1 },
    { key: 'minLength', type: 'number', group: 'content', label: { 'zh-CN': '最短长度', en: 'Minimum length' }, default: 8, min: 6, max: 16, step: 1 },
    { key: 'requireSymbol', type: 'boolean', group: 'content', label: { 'zh-CN': '要求符号', en: 'Require a symbol' }, default: false },
    { key: 'showChecklist', type: 'boolean', group: 'content', label: { 'zh-CN': '规则清单', en: 'Checklist' }, default: true },
    { key: 'weakColor', type: 'color', group: 'look', label: { 'zh-CN': '弱色', en: 'Weak color' }, default: '#ef4444' },
    { key: 'strongColor', type: 'color', group: 'look', label: { 'zh-CN': '强色', en: 'Strong color' }, default: '#10b981' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 6, min: 0, max: 16, step: 1, unit: 'px' },
  ],
  presets: [
    { id: 'origin', name: { 'zh-CN': '原味', en: 'Origin' }, values: { meterStyle: 'bar', weakColor: '#ef4444', strongColor: '#10b981', radius: 6 } },
    { id: 'vault', name: { 'zh-CN': '金库', en: 'Vault' }, values: { meterStyle: 'segments', segments: 5, requireSymbol: true, minLength: 12, weakColor: '#f97316', strongColor: '#38bdf8', radius: 10 } },
    { id: 'terse', name: { 'zh-CN': '简笔', en: 'Terse' }, values: { meterStyle: 'segments', segments: 4, showChecklist: false, weakColor: '#f43f5e', strongColor: '#a3e635', radius: 0 } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: ['The meter is a hint, not validation: still enforce the same rules on the server.'],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.8, posterTime: 5.5, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: ['apps/origin/registry/default/components/comp-51.tsx', 'apps/origin/registry/default/components/comp-23.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'Replaced ui/input and ui/label with plain elements and lucide icons with inline SVG.',
      'Added params: bar or segmented meter, segment count, minimum length, optional symbol rule, checklist toggle, weak / strong colors (the meter color mixes between them through amber) and corner radius.',
      'The value can be controlled; the meter animates transform and color instead of transition-all and respects reduced motion.',
    ],
    assets: [],
  },
})
