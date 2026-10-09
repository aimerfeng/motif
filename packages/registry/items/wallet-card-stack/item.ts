import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'wallet-card-stack',
  status: 'published',
  title: { 'zh-CN': '卡片钱包', en: 'Wallet Card Stack' },
  summary: {
    'zh-CN': '几张银行卡像握在手里一样叠成一摞：选中的向你抬起，其余向后倾斜退去，光泽跟着指针游走，隐藏余额时数字逐个模糊成圆点。适合记账、支付和会员卡类应用的账户切换。',
    en: 'Bank cards stacked as if held in your hand: the selected one lifts toward you, the rest tilt back, a specular sheen follows the pointer and hiding the balance blurs digits into dots one by one. Made for account switchers in finance, payment and membership apps.',
  },
  kind: 'component',
  category: 'data',
  tags: ['wallet', 'card', 'stack', 'finance', 'balance', '3d', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'wallet-card-stack.tsx', export: 'WalletCardStack' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'wallet-card-stack.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'palette', type: 'palette', group: 'look', label: { 'zh-CN': '卡面颜色', en: 'Card colors' }, hint: { 'zh-CN': '按顺序分配给每张卡', en: 'Assigned to the cards in order' }, default: ['#1f4d3a', '#1d2a44', '#b4532a'], minItems: 2, maxItems: 4 },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 16, min: 8, max: 28, step: 1, unit: 'px', safe: [10, 24] },
    { key: 'grain', type: 'number', group: 'look', label: { 'zh-CN': '颗粒感', en: 'Grain' }, hint: { 'zh-CN': '印刷质感的细噪点', en: 'Fine printed-card noise' }, default: 0.14, min: 0, max: 0.3, step: 0.01, safe: [0.05, 0.22] },
    { key: 'stackOffset', type: 'number', group: 'layout', label: { 'zh-CN': '叠放间距', en: 'Stack offset' }, default: 14, min: 8, max: 24, step: 1, unit: 'px', safe: [10, 20] },
    { key: 'tilt', type: 'number', group: 'layout', label: { 'zh-CN': '后倾角度', en: 'Back tilt' }, default: 7, min: 0, max: 12, step: 0.5, unit: 'deg', safe: [3, 10] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '切换弹簧', en: 'Switch spring' }, default: { visualDuration: 0.3, bounce: 0.1 } },
  ],
  presets: [
    { id: 'pine', name: { 'zh-CN': '松针', en: 'Pine' }, values: { palette: ['#1f4d3a', '#1d2a44', '#b4532a'], radius: 16, grain: 0.14, stackOffset: 14, tilt: 7 } },
    { id: 'sorbet', name: { 'zh-CN': '果冻', en: 'Sorbet' }, values: { palette: ['#e86a8a', '#f2a65a', '#6aa6e8', '#7ac9a1'], radius: 24, grain: 0.06, stackOffset: 18, tilt: 4, spring: { visualDuration: 0.4, bounce: 0.3 } } },
    { id: 'graphite', name: { 'zh-CN': '石墨黑卡', en: 'Graphite' }, values: { palette: ['#2a2b30', '#3a3328', '#26303a'], radius: 12, grain: 0.22, stackOffset: 11, tilt: 10, spring: { visualDuration: 0.25, bounce: 0 } } },
    { id: 'lagoon', name: { 'zh-CN': '潟湖', en: 'Lagoon' }, values: { palette: ['#0e7490', '#4f46e5', '#0f766e'], radius: 20, grain: 0.1, stackOffset: 16, tilt: 6, spring: { visualDuration: 0.35, bounce: 0.2 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Pass accounts as { id, label, balance, currency, last4, holder, expiry }; never put full card numbers in props. Card colors come from the palette in order.',
      'The stack is a listbox of options: arrow keys move the selection and focus. The balance toggle is a real button with aria-pressed; hidden state masks digits but keeps the currency symbol.',
      'Controlled: activeId + onActiveChange, hidden + onHiddenChange. No card-network logos are included on purpose; add your own only if you have the rights.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.3, posterTime: 1.2, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/wallet-card/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Removed the lucide-react, SmoothButton and shadcn imports (inline SVG eye icon and a native button) and the members/avatar overflow row.',
      'Removed the Visa / Mastercard / Amex network marks (trademarks) and the contactless glyph; card surfaces are generated from a color palette parameter.',
      'Exposed corner radius, grain, stack offset, back tilt and the switch spring as parameters; sample accounts are built in; hover sheen only reacts to mouse pointers; cn comes from @motif/runtime.',
    ],
    assets: [],
  },
})
