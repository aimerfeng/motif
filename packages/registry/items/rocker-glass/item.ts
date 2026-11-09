import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'rocker-glass',
  status: 'published',
  title: { 'zh-CN': '玻璃翘板键', en: 'Glass Rocker' },
  summary: {
    'zh-CN': '一枚液态玻璃按键嵌在凹槽里，按下时像翘板开关一样斜着压进去，高光、阴影和指示灯随之变化。适合首屏主按钮、设备面板和偏拟物的界面。',
    en: 'A liquid-glass cap sitting in a recessed well that tilts in like a rocker switch when pressed, with highlights, shadows and a bead LED following along. Suits hero CTAs, device panels and tactile interfaces.',
  },
  kind: 'component',
  category: 'toggle',
  tags: ['button', 'rocker', 'glass', 'skeuomorphic', 'tactile', 'spring'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'rocker-glass.tsx', export: 'RockerGlass' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'rocker-glass.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '按钮文案', en: 'Label' }, default: 'Get Started', maxLength: 24 },
    {
      key: 'size',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '尺寸', en: 'Size' },
      default: 'default',
      options: [
        { value: 'sm', label: { 'zh-CN': '小', en: 'Small' } },
        { value: 'default', label: { 'zh-CN': '中', en: 'Default' } },
        { value: 'lg', label: { 'zh-CN': '大', en: 'Large' } },
      ],
    },
    {
      key: 'indicatorColor',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '指示灯颜色', en: 'Indicator color' },
      default: 'blue',
      options: [
        { value: 'blue', label: { 'zh-CN': '蓝', en: 'Blue' } },
        { value: 'green', label: { 'zh-CN': '绿', en: 'Green' } },
        { value: 'amber', label: { 'zh-CN': '琥珀', en: 'Amber' } },
        { value: 'red', label: { 'zh-CN': '红', en: 'Red' } },
        { value: 'slate', label: { 'zh-CN': '石板蓝', en: 'Slate' } },
      ],
    },
    { key: 'showIndicator', type: 'boolean', group: 'look', label: { 'zh-CN': '显示指示灯', en: 'Show indicator' }, default: true },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.55, bounce: 0.45 } },
  ],
  presets: [
    { id: 'signal', name: { 'zh-CN': '信号蓝', en: 'Signal' }, values: { label: 'Get Started', size: 'default', indicatorColor: 'blue', showIndicator: true } },
    { id: 'standby', name: { 'zh-CN': '待机绿', en: 'Standby' }, values: { label: 'Power On', size: 'lg', indicatorColor: 'green', showIndicator: true, spring: { visualDuration: 0.45, bounce: 0.3 } } },
    { id: 'alarm', name: { 'zh-CN': '警报', en: 'Alarm' }, values: { label: 'Record', size: 'sm', indicatorColor: 'red', showIndicator: true, spring: { visualDuration: 0.4, bounce: 0.55 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: ['The cap is a fixed light glass; place it on a light or mid-tone surface, not on a dark background.'],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 2.2, posterTime: 1.3, loop: 3 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uselayouts',
      repo: 'iurvish/uselayouts',
      sha: '678a478e30272d8101cea97bc6147e0df9dcd652',
      paths: ['registry/default/example/tactile-button.tsx', 'registry/default/demo/tactile-button-demo.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Urvish Mali'],
    },
    modifications: [
      'framer-motion replaced by motion/react; cn comes from @motif/runtime; forwardRef dropped (React 19).',
      'Props come from the @motif:defaults region (label, size, indicator color, indicator toggle, spring as visualDuration + bounce).',
      'Pointer events replace mouse/touch handlers, Space/Enter keyboard press shows the tilt, and a pressed prop lets the demo autoplay the press.',
      'The LED glow follows the indicator color; reduced motion removes the spring and the tilt.',
    ],
    assets: [],
  },
})
