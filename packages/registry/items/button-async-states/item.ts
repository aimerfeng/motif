import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'button-async-states',
  status: 'published',
  title: { 'zh-CN': '异步状态按钮', en: 'Async Action Button' },
  summary: {
    'zh-CN': '保存、提交一键搞定：点击后文字逐字模糊切换成「保存中」，角上弹出转圈或跳动圆点，完成后换成对勾和成功色，过一会儿自动复位。适合表单、设置页和加入购物车。',
    en: 'One button for save and submit flows: the label morphs letter by letter into a loading word, a corner badge pops in with a spinner or bouncing dots, then a check in the success tone before it resets. For forms, settings pages and add-to-cart actions.',
  },
  kind: 'component',
  category: 'button',
  tags: ['button', 'async', 'loading', 'save', 'submit', 'feedback'],
  runtime: ['react', 'motion'],
  entry: { file: 'button-async-states.tsx', export: 'SaveButton' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'button-async-states.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'idleLabel', type: 'text', group: 'content', label: { 'zh-CN': '默认文案', en: 'Idle label' }, default: 'Save', maxLength: 14 },
    { key: 'loadingLabel', type: 'text', group: 'content', label: { 'zh-CN': '加载文案', en: 'Loading label' }, default: 'Saving', maxLength: 14 },
    { key: 'successLabel', type: 'text', group: 'content', label: { 'zh-CN': '成功文案', en: 'Success label' }, default: 'Saved', maxLength: 14 },
    {
      key: 'loadingStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '加载样式', en: 'Loading style' },
      default: 'spinner',
      options: [
        { value: 'spinner', label: { 'zh-CN': '转圈', en: 'Spinner' } },
        { value: 'dots', label: { 'zh-CN': '跳动圆点', en: 'Dots' } },
      ],
    },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '按钮颜色', en: 'Button color' }, default: '#fafafa' },
    { key: 'successColor', type: 'color', group: 'look', label: { 'zh-CN': '成功色', en: 'Success color' }, default: '#fafafa' },
    { key: 'duration', type: 'number', group: 'interaction', label: { 'zh-CN': '加载时长', en: 'Loading time' }, hint: { 'zh-CN': '未传 onAction 时模拟的加载时间', en: 'Simulated wait when no onAction is passed' }, default: 2.5, min: 0.5, max: 5, step: 0.5, unit: 's', safe: [1, 3] },
    { key: 'resetDelay', type: 'number', group: 'interaction', label: { 'zh-CN': '复位延迟', en: 'Reset delay' }, default: 2, min: 1, max: 5, step: 0.5, unit: 's', safe: [1.5, 3] },
  ],
  presets: [
    { id: 'chalk', name: { 'zh-CN': '粉笔', en: 'Chalk' }, values: { color: '#fafafa', successColor: '#fafafa', loadingStyle: 'spinner' } },
    { id: 'meadow', name: { 'zh-CN': '草甸', en: 'Meadow' }, values: { color: '#4f46e5', successColor: '#22c55e', loadingStyle: 'dots', idleLabel: 'Submit', loadingLabel: 'Sending', successLabel: 'Sent' } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { color: '#f97316', successColor: '#facc15', loadingStyle: 'spinner', idleLabel: 'Add to cart', loadingLabel: 'Adding', successLabel: 'Added' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: ['Pass onAction returning a promise to drive the real loading state; without it the button simulates a wait of duration seconds. A status prop forces a state (used by demos).'],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 2.2, posterTime: 2.2, loop: 7 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uselayouts',
      repo: 'iurvish/uselayouts',
      sha: '678a478e30272d8101cea97bc6147e0df9dcd652',
      paths: ['registry/default/example/save-button.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Urvish Mali'],
    },
    modifications: [
      'Replaced the shadcn Button with a plain button and the Hugeicons tick with an inline SVG; cn comes from @motif/runtime.',
      'Labels, button and success colors (with luminance-based ink), loading and reset timings are props; added a dots loading style, an optional onAction promise, a controlled status prop and an aria-live status.',
      'Listed transitioned properties instead of transition-all; the SMIL spinner rotation is a motion rotate; reduced motion swaps the letter springs and blur for short fades.',
    ],
    assets: [],
  },
})
