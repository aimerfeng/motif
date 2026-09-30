import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'tooltip-spring',
  status: 'published',
  title: { 'zh-CN': '弹簧提示', en: 'Spring Tooltip' },
  summary: {
    'zh-CN': '提示气泡带着轻微模糊弹出；放进一个组里，指针在工具栏图标间移动时，同一个气泡会滑过去、内容淡入淡出，不再关了又开。键盘聚焦同样触发，Esc 关闭。适合图标工具栏和缩略操作。',
    en: 'Tooltips spring in with a touch of blur; inside a group, one bubble glides between the icons as the pointer moves instead of closing and reopening. Keyboard focus shows it too and Esc dismisses. Made for icon toolbars and compact actions.',
  },
  kind: 'component',
  category: 'tooltip',
  tags: ['tooltip', 'hint', 'toolbar', 'spring', 'shared-layout', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'tooltip-spring.tsx', export: 'TooltipSpring' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'tooltip-spring.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '样式', en: 'Variant' },
      default: 'glass',
      options: [
        { value: 'glass', label: { 'zh-CN': '毛玻璃', en: 'Glass' } },
        { value: 'dark', label: { 'zh-CN': '反色', en: 'Inverse' } },
        { value: 'accent', label: { 'zh-CN': '强调色', en: 'Accent' } },
      ],
    },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '强调色样式下使用', en: 'Used by the accent variant' }, default: '#8b5cf6' },
    {
      key: 'side',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '方向', en: 'Side' },
      default: 'top',
      options: [
        { value: 'top', label: { 'zh-CN': '上方', en: 'Top' } },
        { value: 'bottom', label: { 'zh-CN': '下方', en: 'Bottom' } },
      ],
    },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 10, min: 2, max: 18, step: 1, unit: 'px', safe: [6, 14] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.3, bounce: 0.22 } },
    { key: 'arrow', type: 'boolean', group: 'look', label: { 'zh-CN': '显示箭头', en: 'Arrow' }, default: true },
    { key: 'delay', type: 'number', group: 'interaction', label: { 'zh-CN': '出现延迟', en: 'Open delay' }, hint: { 'zh-CN': '刚看过一个提示后，切换到下一个不再延迟', en: 'Skipped when moving between tooltips' }, default: 0.35, min: 0, max: 1.2, step: 0.05, unit: 's', safe: [0.15, 0.6] },
  ],
  presets: [
    { id: 'frost', name: { 'zh-CN': '霜', en: 'Frost' }, values: { variant: 'glass', radius: 10, arrow: true } },
    { id: 'chalk', name: { 'zh-CN': '粉笔', en: 'Chalk' }, values: { variant: 'dark', radius: 7, arrow: true, spring: { visualDuration: 0.22, bounce: 0.1 } } },
    { id: 'violet-pop', name: { 'zh-CN': '紫色气泡', en: 'Violet Pop' }, values: { variant: 'accent', color: '#8b5cf6', radius: 14, arrow: true, spring: { visualDuration: 0.4, bounce: 0.4 } } },
    { id: 'below-mint', name: { 'zh-CN': '薄荷（下方）', en: 'Mint Below' }, values: { variant: 'accent', color: '#10b981', side: 'bottom', radius: 8, arrow: false, delay: 0.2 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use for short labels on icon-only controls and for shortcut hints. Never for essential information or interactive content: tooltips are hidden on touch.'],
    rules: [
      'Wrap a whole toolbar in <TooltipGroup> and each control in <TooltipSpring content="Bold"> (single focusable child). The group renders one shared bubble; the trigger must not sit inside another positioned element.',
      'A tooltip supplements an accessible name, it does not replace it: icon buttons still need aria-label. The bubble is role="tooltip" and is linked with aria-describedby while open.',
      'Keep content to a few words plus an optional keyboard shortcut. Use side="bottom" when the control is near the top edge.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 2, posterTime: 4.4, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/animated-tooltip/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Restructured around a TooltipGroup that owns one bubble positioned from the active trigger (offsetLeft / offsetTop, animated with a spring), so moving between triggers slides the bubble; a standalone TooltipSpring creates its own group.',
      'Added skip-delay after a recent tooltip, keyboard focus (focus-visible only), Esc to dismiss, aria-describedby linking, glass / inverse / accent variants, an arrow and a blur-in.',
      'Spring is described by visualDuration + bounce; cn comes from @motif/runtime; reduced motion uses a short fade only.',
    ],
    assets: [],
  },
})
