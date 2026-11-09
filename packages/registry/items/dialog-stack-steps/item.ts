import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'dialog-stack-steps',
  status: 'published',
  title: { 'zh-CN': '层叠步骤弹窗', en: 'Stacked Step Dialog' },
  summary: {
    'zh-CN': '多步骤弹窗：完成的步骤向上退后、略微缩小，叠在当前卡片后面露出一道边，点一下就能回到那一步。适合新建流程、数据导入和引导式设置。',
    en: 'A multi-step dialog where finished steps slide up and shrink behind the current card, peeking out as a stack you can click to go back. Made for create flows, imports and guided setup.',
  },
  kind: 'component',
  category: 'stepper',
  tags: ['dialog', 'modal', 'stepper', 'wizard', 'stack', 'onboarding', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'dialog-stack-steps.tsx', export: 'DialogStack' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'dialog-stack-steps.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'offset', type: 'number', group: 'layout', label: { 'zh-CN': '层叠位移', en: 'Stack offset' }, hint: { 'zh-CN': '每退后一层向上露出的距离', en: 'How far each earlier card peeks out above' }, default: 10, min: 4, max: 24, step: 1, unit: 'px', safe: [6, 16] },
    { key: 'scaleStep', type: 'number', group: 'layout', label: { 'zh-CN': '每层缩小', en: 'Shrink per level' }, default: 0.02, min: 0, max: 0.08, step: 0.005, safe: [0.01, 0.05] },
    { key: 'maxVisible', type: 'number', group: 'layout', label: { 'zh-CN': '可见层数', en: 'Visible levels' }, default: 3, min: 1, max: 6, step: 1, safe: [2, 4] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 8, min: 0, max: 24, step: 1, unit: 'px', safe: [4, 18] },
    { key: 'dim', type: 'number', group: 'look', label: { 'zh-CN': '遮罩浓度', en: 'Overlay dim' }, default: 0.8, min: 0.3, max: 0.9, step: 0.05, safe: [0.5, 0.85] },
    { key: 'clickable', type: 'boolean', group: 'interaction', label: { 'zh-CN': '点击回到前一步', en: 'Click to go back' }, default: true },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.3, bounce: 0.15 } },
  ],
  presets: [
    { id: 'paper-stack', name: { 'zh-CN': '纸叠', en: 'Paper Stack' }, values: { offset: 10, scaleStep: 0.02, maxVisible: 3, radius: 8, dim: 0.8 } },
    { id: 'deep-deck', name: { 'zh-CN': '深牌堆', en: 'Deep Deck' }, values: { offset: 16, scaleStep: 0.045, maxVisible: 4, radius: 16, dim: 0.7, spring: { visualDuration: 0.4, bounce: 0.3 } } },
    { id: 'flush', name: { 'zh-CN': '贴合', en: 'Flush' }, values: { offset: 6, scaleStep: 0.01, maxVisible: 2, radius: 4, dim: 0.85, spring: { visualDuration: 0.2, bounce: 0 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Compose DialogStack > DialogStackTrigger + DialogStackOverlay + DialogStackBody > DialogStackContent (one per step), with DialogStackNext / DialogStackPrevious in each footer. Put a DialogStackTitle in every step: the dialog is labelled by the active step title.',
      'Body traps Tab focus and closes on Escape; pass portal={false} to render in place inside a relative container.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 5.6, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kibo',
      repo: 'shadcnblocks/kibo',
      sha: '3d63cdb15b79d972e3dc38a10997987672f9b263',
      paths: ['packages/dialog-stack/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 — Present shadcnblocks'],
    },
    modifications: [
      'Replaced radix Portal and use-controllable-state with react-dom createPortal and local state; open and activeIndex can both be controlled.',
      'Added role="dialog", aria-modal, a Tab focus trap, Escape to close and keyboard-reachable earlier cards; inactive step content is inert.',
      'Stack motion uses motion/react springs on transform and opacity (translateY + scale) instead of transition-all on top/width; added offset, scale step, visible levels, radius, overlay dim, clickable and spring parameters.',
      'Added portal={false} to render in place; reduced motion makes step changes instant.',
    ],
    assets: [],
  },
})
