import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'drawer-ticket-wizard',
  status: 'published',
  title: { 'zh-CN': '工单向导抽屉', en: 'Ticket Wizard Drawer' },
  summary: {
    'zh-CN': '从侧边滑出的抽屉，分三步创建一张客服工单：先用单选卡片选类型和分类，再填优先级和描述，最后核对汇总后提交。带步骤指示、返回 / 继续按钮，焦点锁在抽屉内，Esc 关闭。适合客服后台和内部工具。',
    en: 'A side drawer that walks through creating a support ticket in three steps: type and category as radio cards, then priority and description, then a review summary before submitting. Step indicator, back / continue buttons, trapped focus and Esc to close. For help desks and internal tools.',
  },
  kind: 'component',
  category: 'stepper',
  tags: ['drawer', 'sheet', 'wizard', 'stepper', 'form', 'radio-cards', 'ticket', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'drawer-ticket-wizard.tsx', export: 'TicketWizardDrawer' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'drawer-ticket-wizard.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#3b82f6' },
    {
      key: 'side',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '滑出方向', en: 'Side' },
      default: 'right',
      options: [
        { value: 'right', label: { 'zh-CN': '右侧', en: 'Right' } },
        { value: 'left', label: { 'zh-CN': '左侧', en: 'Left' } },
      ],
    },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '宽度', en: 'Width' }, hint: { 'zh-CN': '窄屏时抽屉铺满两侧留白', en: 'On narrow screens the drawer fills the width' }, default: 512, min: 380, max: 640, step: 8, unit: 'px', safe: [440, 560] },
    {
      key: 'stepStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '步骤指示', en: 'Step indicator' },
      default: 'bars',
      options: [
        { value: 'bars', label: { 'zh-CN': '进度条', en: 'Bars' } },
        { value: 'numbers', label: { 'zh-CN': '数字', en: 'Numbers' } },
        { value: 'none', label: { 'zh-CN': '不显示', en: 'None' } },
      ],
    },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 6, min: 0, max: 16, step: 1, unit: 'px', safe: [4, 10] },
    {
      key: 'tone',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '选中样式', en: 'Selected card' },
      default: 'solid',
      options: [
        { value: 'solid', label: { 'zh-CN': '实色', en: 'Solid' } },
        { value: 'tinted', label: { 'zh-CN': '浅色描边', en: 'Tinted' } },
      ],
    },
  ],
  presets: [
    { id: 'clear-sky', name: { 'zh-CN': '晴蓝', en: 'Clear Sky' }, values: { accent: '#3b82f6', stepStyle: 'bars', tone: 'solid', radius: 6 } },
    { id: 'moss', name: { 'zh-CN': '苔原', en: 'Tundra' }, values: { accent: '#10b981', stepStyle: 'numbers', tone: 'tinted', radius: 10 } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#f97316', stepStyle: 'bars', tone: 'solid', radius: 2, side: 'left' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1, posterTime: 2.8, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'tremor-blocks',
      repo: 'tremorlabs/tremor-blocks',
      sha: 'b319e8d3d3678a4f60f4802f7e85bc1abc52d598',
      paths: [
        'src/content/components/dialogs/dialog-09.tsx',
        'src/components/Drawer.tsx',
        'src/components/RadioCardGroup.tsx',
        'src/components/Button.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Tremor Labs, Inc.'],
    },
    modifications: [
      'Replaced the Radix Dialog drawer with a hand-rolled side sheet (role=dialog, focus trap, Esc, return focus) animated with motion/react; a contained prop keeps it inside its parent.',
      'Replaced the Radix RadioCardGroup with radio buttons using roving tabindex and arrow keys, and the Radix Select with a styled native select.',
      'Remix close icon replaced with inline SVG; gray palette mapped to Motif theme tokens.',
      'Added accent, side, width, step indicator, radius and selected-card parameters, plus controlled open / step / form data so the demo can autoplay.',
    ],
    assets: [],
  },
})
