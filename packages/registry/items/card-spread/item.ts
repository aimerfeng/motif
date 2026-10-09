import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'card-spread',
  status: 'published',
  title: { 'zh-CN': '卡片扇开', en: 'Card Spread' },
  summary: {
    'zh-CN': '四张便签一样的卡片叠成一摞，点一下按钮，带着弹性依次摊开成一排，再点一下收回。窄屏上自动互相叠压，不会溢出。适合笔记、待办、日程和灵感面板。',
    en: 'Four paper-like cards sit in a loose stack, then fan out into a row with a springy throw and gather back on the next click. On narrow screens the row overlaps instead of overflowing. Made for notes, to-dos, agendas and mood boards.',
  },
  kind: 'effect',
  category: 'card',
  tags: ['card', 'stack', 'deck', 'spread', 'fan', 'spring', 'notes'],
  runtime: ['react', 'motion'],
  entry: { file: 'card-spread.tsx', export: 'CardSpread' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'card-spread.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'tints', type: 'palette', label: { 'zh-CN': '卡片底色', en: 'Card tints' }, hint: { 'zh-CN': '按顺序给每张卡上色，用浅色以保证文字可读', en: 'Applied to the cards in order; keep them light for readable text' }, default: ['#fff0b3', '#cfeedb', '#ffd8c4', '#d6e6ff'], minItems: 1, maxItems: 6, group: 'look' },
    { key: 'cardWidth', type: 'number', label: { 'zh-CN': '卡片宽度', en: 'Card width' }, default: 200, min: 150, max: 260, step: 2, unit: 'px', safe: [170, 230], group: 'layout' },
    { key: 'gap', type: 'number', label: { 'zh-CN': '展开间隙', en: 'Spread gap' }, default: 16, min: 4, max: 40, step: 1, unit: 'px', safe: [8, 28], group: 'layout' },
    { key: 'radius', type: 'number', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 18, min: 4, max: 32, step: 1, unit: 'px', safe: [8, 26], group: 'look' },
    { key: 'tilt', type: 'number', label: { 'zh-CN': '倾斜幅度', en: 'Tilt' }, hint: { 'zh-CN': '展开时每张卡歪几度，收起时取一半', en: 'Rotation of each card when spread; half of it when stacked' }, default: 3, min: 0, max: 8, step: 0.5, unit: 'deg', safe: [1, 6], group: 'motion' },
    { key: 'lift', type: 'number', label: { 'zh-CN': '悬停抬起', en: 'Hover lift' }, default: 14, min: 0, max: 30, step: 1, unit: 'px', safe: [6, 22], group: 'interaction' },
    { key: 'spring', type: 'spring', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.5, bounce: 0.28 }, group: 'motion' },
  ],
  presets: [
    { id: 'stationery', name: { 'zh-CN': '文具铺', en: 'Stationery' }, values: { tints: ['#fff0b3', '#cfeedb', '#ffd8c4', '#d6e6ff'], tilt: 3, radius: 18 } },
    { id: 'celadon', name: { 'zh-CN': '青瓷', en: 'Celadon' }, values: { tints: ['#d8ece6', '#c3e2da', '#e6f1ea', '#cfe4ee'], tilt: 2, radius: 24, gap: 12, spring: { visualDuration: 0.6, bounce: 0.12 } } },
    { id: 'blueprint', name: { 'zh-CN': '蓝图', en: 'Blueprint' }, values: { tints: ['#dbe7ff', '#c7d9ff', '#e8f0ff', '#b9ceff'], tilt: 0, radius: 6, gap: 20, lift: 10, spring: { visualDuration: 0.4, bounce: 0.05 } } },
    { id: 'confetti', name: { 'zh-CN': '糖纸', en: 'Confetti' }, values: { tints: ['#ffc9d9', '#ffe29a', '#b9f0d3', '#c9d8ff'], tilt: 6, radius: 26, gap: 10, lift: 20, spring: { visualDuration: 0.55, bounce: 0.5 } } },
    { id: 'kraft', name: { 'zh-CN': '牛皮纸', en: 'Kraft' }, values: { tints: ['#ead7b9', '#e0c9a4', '#f1e2c8', '#d9bf99'], tilt: 4, radius: 10, gap: 14, spring: { visualDuration: 0.45, bounce: 0.2 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Pass each card as a child; the component draws the tinted paper, radius and shadow, so child content should be transparent and use dark text.',
      'The toggle button is part of the component for keyboard access. For external control pass open + onOpenChange, or set showToggle={false}.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.25, posterTime: 3.4, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'animata',
      repo: 'codse/animata',
      sha: '36674e4e9cfdc0f237693d8b736a2bf41065ca1d',
      paths: ['animata/card/card-spread.tsx', 'animata/card/card-spread.css'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Animata'],
    },
    modifications: [
      'The upstream deck is built from a CSS grid, :has() selectors on a hidden checkbox and per-index transform rules in a stylesheet, with four fixed widget components. This version keeps the idea (a deck that throws out into a row, hover peek, a spread toggle) but takes the cards as children and animates x, y and rotation with a motion spring; the stack/spread offsets are computed instead of hand-written per index.',
      'Added card width, gap, tilt, lift, radius and tint parameters, a controlled open prop, and a layout that tightens the step between cards on narrow containers so the row never overflows.',
      'The demo cards are new content; the animated widgets of the upstream demo are not included.',
      'Motif improvement: with prefers-reduced-motion cards move instantly with no spring or hover lift.',
    ],
    assets: [],
  },
})
