import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'swipe-deck',
  status: 'published',
  title: { 'zh-CN': '滑动卡片堆', en: 'Swipe Card Deck' },
  summary: {
    'zh-CN': '一叠卡片，最上面那张跟着手指走，越拖越歪，盖上「喜欢 / 不要」的印章，拖过阈值就飞出去露出下一张；按钮和左右方向键也能做同样的选择，翻完显示空状态。适合匹配、筛选和快速审阅。',
    en: 'A stack of cards where the top one follows your drag, tilts with distance, shows a like / nope stamp and flies off past a threshold to reveal the next. Buttons and arrow keys do the same, and an empty state appears at the end. For matching, triage and quick review flows.',
  },
  kind: 'component',
  category: 'carousel',
  tags: ['deck', 'swipe', 'cards', 'drag', 'tinder', 'stack', 'triage'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'swipe-deck.tsx', export: 'SwipeDeck' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'swipe-deck.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'threshold', type: 'number', group: 'interaction', label: { 'zh-CN': '飞出阈值', en: 'Swipe threshold' }, hint: { 'zh-CN': '拖过这么远松手，卡片就会飞出', en: 'Release past this distance to send the card away' }, default: 150, min: 60, max: 180, step: 5, unit: 'px', safe: [100, 170] },
    { key: 'maxRotate', type: 'number', group: 'motion', label: { 'zh-CN': '最大倾斜', en: 'Max tilt' }, default: 25, min: 0, max: 35, step: 1, unit: 'deg', safe: [10, 30] },
    { key: 'stackDepth', type: 'number', group: 'layout', label: { 'zh-CN': '叠放层数', en: 'Stack depth' }, default: 3, min: 1, max: 5, step: 1, safe: [2, 4] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 16, min: 0, max: 32, step: 1, unit: 'px', safe: [8, 24] },
    { key: 'showStamps', type: 'boolean', group: 'look', label: { 'zh-CN': '显示印章', en: 'Show stamps' }, default: true },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.3, bounce: 0 } },
    {
      key: 'cardAspect',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '卡片比例', en: 'Card aspect' },
      default: '3 / 4',
      options: [
        { value: '3 / 4', label: { 'zh-CN': '3:4', en: '3:4' } },
        { value: '4 / 5', label: { 'zh-CN': '4:5', en: '4:5' } },
        { value: '2 / 3', label: { 'zh-CN': '2:3', en: '2:3' } },
        { value: '1 / 1', label: { 'zh-CN': '正方形', en: 'Square' } },
      ],
    },
  ],
  presets: [
    { id: 'playful', name: { 'zh-CN': '心动', en: 'Spark' }, values: { maxRotate: 25, radius: 16, showStamps: true, spring: { visualDuration: 0.3, bounce: 0 } } },
    { id: 'ledger', name: { 'zh-CN': '账本', en: 'Ledger' }, values: { maxRotate: 8, radius: 6, stackDepth: 4, showStamps: false, cardAspect: '4 / 5', spring: { visualDuration: 0.25, bounce: 0 } } },
    { id: 'bouncy', name: { 'zh-CN': '弹珠', en: 'Pinball' }, values: { maxRotate: 30, radius: 28, stackDepth: 2, cardAspect: '1 / 1', spring: { visualDuration: 0.4, bounce: 0.35 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Always pair the drag gesture with the built-in Like / Nope buttons or arrow keys; never make swiping the only way to decide.',
      'Give each card a stable key; pass index + onIndexChange to control the deck (e.g. to undo or start over).',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.3, posterTime: 1.2, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kibo',
      repo: 'shadcnblocks/kibo',
      sha: '3d63cdb15b79d972e3dc38a10997987672f9b263',
      paths: ['packages/deck/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 — Present shadcnblocks'],
    },
    modifications: [
      'Replaced @radix-ui/react-use-controllable-state with a small local hook; cn comes from @motif/runtime.',
      'Replaced the 300 ms setTimeout after a swipe with the exit animation’s completion callback; the exit x and the stack advance use a configurable spring.',
      'Added Like / Nope stamps, a maxRotate parameter, a corner radius, and a SwipeDeck wrapper with Like / Nope buttons, arrow-key control, a live region and an empty state.',
      'Added a previewOffset prop so the demo autoplay can tilt the top card; reduced motion removes tilt, drag scale and the fly-off animation.',
    ],
    assets: [],
  },
})
