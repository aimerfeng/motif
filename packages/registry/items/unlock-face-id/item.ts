import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'unlock-face-id',
  status: 'published',
  title: { 'zh-CN': '刷脸解锁', en: 'Face Unlock' },
  summary: {
    'zh-CN': '四个圆角括号和一张简笔人脸逐笔画出，扫描线上下游走；认不出来时整体左右抖动，成功后化作对勾，被遮住的内容从模糊里清晰起来。适合账户金库、隐私相册和敏感数据的解锁入口。',
    en: 'Four rounded brackets and a minimal face draw themselves stroke by stroke while a scan line sweeps. A failed scan shakes, success resolves into a check and the gated content sharpens out of its blur. Made for vaults, private albums and sensitive data.',
  },
  kind: 'component',
  category: 'button',
  tags: ['face-id', 'unlock', 'biometric', 'scan', 'security', 'svg', 'a11y'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'unlock-face-id.tsx', export: 'UnlockFaceId' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'unlock-face-id.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '扫描色', en: 'Scan color' }, default: '#0d9488' },
    { key: 'successColor', type: 'color', group: 'look', label: { 'zh-CN': '成功色', en: 'Success color' }, default: '#16a34a' },
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '图标大小', en: 'Glyph size' }, default: 132, min: 80, max: 200, step: 2, unit: 'px', safe: [100, 168] },
    { key: 'strokeWidth', type: 'number', group: 'look', label: { 'zh-CN': '线条粗细', en: 'Stroke width' }, default: 4, min: 2.5, max: 6, step: 0.25, safe: [3, 5] },
    { key: 'scanDuration', type: 'number', group: 'motion', label: { 'zh-CN': '扫描时长', en: 'Scan time' }, default: 1.8, min: 0.8, max: 3, step: 0.1, unit: 's', safe: [1.2, 2.6] },
    { key: 'idleMessage', type: 'text', group: 'content', label: { 'zh-CN': '待机提示', en: 'Idle message' }, default: 'Look at your device to unlock', maxLength: 40 },
    { key: 'successMessage', type: 'text', group: 'content', label: { 'zh-CN': '成功提示', en: 'Success message' }, default: 'Identity confirmed. Unlocked.', maxLength: 40 },
  ],
  presets: [
    { id: 'jade', name: { 'zh-CN': '青玉', en: 'Jade' }, values: { color: '#0d9488', successColor: '#16a34a', size: 132, strokeWidth: 4 } },
    { id: 'ink', name: { 'zh-CN': '墨线', en: 'Ink' }, values: { color: '#1d4ed8', successColor: '#0f172a', size: 116, strokeWidth: 3, scanDuration: 1.4 } },
    { id: 'persimmon', name: { 'zh-CN': '柿子', en: 'Persimmon' }, values: { color: '#ea580c', successColor: '#65a30d', size: 156, strokeWidth: 5, scanDuration: 2.2 } },
    { id: 'orchid', name: { 'zh-CN': '兰雾', en: 'Orchid Mist' }, values: { color: '#c026d3', successColor: '#0891b2', size: 140, strokeWidth: 3.5, scanDuration: 1.6 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'The glyph is a real button (aria-label from the label prop) and the message below is an aria-live status; keep both when restyling.',
      'Drive it with status ("idle" | "scanning" | "success" | "error") when the real check happens elsewhere; leave status out for a self-contained demo scan.',
      'Pass the protected content as children: it stays blurred and non-interactive until status is "success".',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.5, posterTime: 10, loop: 11 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/unlock-face-id/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Replaced the site theme tokens (brand, green, destructive) with scan color and success color parameters.',
      'Added stroke width, glyph size, scan duration and message text as parameters; drawing paths are merged into one stagger loop.',
      'Gated children are marked aria-hidden until unlocked; cn comes from @motif/runtime.',
    ],
    assets: [],
  },
})
