import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'isometric-layer-explode',
  status: 'published',
  title: { 'zh-CN': '等轴分层爆炸图', en: 'Isometric Layer Explode' },
  summary: {
    'zh-CN': '一个真实可输入的验证码字段倾斜成等轴视角，拆成容器、格子、真正的输入框三层平面，可以拖动间距、点选某一层单独查看。适合「工作原理」区块、架构讲解和文档。',
    en: 'A live one-time-code field tilts into an isometric view and separates into container, slot and real-input planes, with a separation slider and labels that isolate one layer. For how-it-works sections, architecture explainers and docs.',
  },
  kind: 'effect',
  category: '3d',
  tags: ['isometric', 'exploded view', 'layers', 'anatomy', 'docs', 'css 3d'],
  runtime: ['react', 'css'],
  entry: { file: 'isometric-layer-explode.tsx', export: 'IsometricLayerExplode' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'isometric-layer-explode.tsx', role: 'component' },
    { path: 'isometric-layer-explode.css', role: 'style' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'separation', type: 'number', group: 'layout', label: { 'zh-CN': '层间距', en: 'Separation' }, default: 72, min: 0, max: 140, step: 4, unit: 'px', safe: [40, 110] },
    { key: 'tilt', type: 'boolean', group: 'layout', label: { 'zh-CN': '等轴视角', en: 'Isometric view' }, default: true },
    { key: 'reveal', type: 'boolean', group: 'look', label: { 'zh-CN': '显出真正的输入框', en: 'Reveal the input' }, default: true },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '输入层颜色', en: 'Input layer color' }, default: '#f39c4a' },
    { key: 'plate', type: 'color', group: 'look', label: { 'zh-CN': '容器层颜色', en: 'Container color' }, default: '#3dd2f5' },
    { key: 'showLabels', type: 'boolean', group: 'content', label: { 'zh-CN': '显示图层标签', en: 'Show layer labels' }, default: true },
  ],
  presets: [
    { id: 'blueprint', name: { 'zh-CN': '蓝图', en: 'Blueprint' }, values: { accent: '#f39c4a', plate: '#3dd2f5', separation: 72 } },
    { id: 'orchid', name: { 'zh-CN': '兰紫', en: 'Orchid' }, values: { accent: '#c084fc', plate: '#34d399', separation: 96 } },
    { id: 'tight', name: { 'zh-CN': '贴合', en: 'Close stack' }, values: { accent: '#fb7185', plate: '#60a5fa', separation: 40 } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { posterTime: 3.4, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'input-otp',
      repo: 'guilhermerodz/input-otp',
      sha: 'cf81845e59ff43c5885c66b4755085a36f071cc1',
      paths: [
        'apps/website/src/app/(docs)/_components/anatomy/isometric.tsx',
        'apps/website/src/app/(docs)/_components/anatomy/shared.tsx',
        'apps/website/src/app/(docs)/anatomy.css',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Guilherme Rodz'],
    },
    modifications: [
      'Replaced the input-otp OTPInput with a minimal hand-written field of the same structure (container, slot row, transparent input overlay with the same inline hiding styles).',
      'Inlined StageSlot, LayerChip, Toggle and usePeelPitch from shared.tsx; dropped the unused peel list and segmented control.',
      'Amber / cyan HSL variables became hex params (accent, plate) mixed with color-mix; Tailwind amber/sky classes became var-based classes; bg-dot-grid and the caret-blink animation are defined in the item CSS.',
      'Separation, isometric view, reveal and layer labels are params; a forced prop lets the demo autoplay drive tilt, isolated layer and value.',
      'transition-all replaced with explicit properties; added focus-visible styles.',
    ],
    assets: [],
  },
})
