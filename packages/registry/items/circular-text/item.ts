import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'circular-text',
  status: 'published',
  title: { 'zh-CN': '环形文字徽章', en: 'Circular Text Badge' },
  summary: {
    'zh-CN': '一圈文字沿着墨色圆盘缓缓旋转，中央是一个固定的箭头，指针经过时转得更快。文案会均匀铺满整圈。适合做作品集的「接单中」徽章、滚动提示和回到顶部按钮。',
    en: 'A ring of text turns slowly around an ink disc with a fixed arrow in the middle, and spins up when the pointer passes over. Copy is spread evenly around the full circle. A natural fit for availability stamps, scroll hints and back-to-top buttons.',
  },
  kind: 'effect',
  category: 'text',
  tags: ['text', 'circular', 'badge', 'rotate', 'stamp', 'svg', 'portfolio'],
  runtime: ['react', 'svg'],
  entry: { file: 'circular-text.tsx', export: 'CircularText' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'circular-text.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'text', type: 'text', label: { 'zh-CN': '文案', en: 'Text' }, hint: { 'zh-CN': '首尾用 • 之类的分隔符衔接，文字会均匀铺满一圈', en: 'End with a separator such as a bullet; the text is spread evenly around the ring' }, default: 'AVAILABLE FOR WORK • BOOKING SPRING 2027 • ', maxLength: 64, group: 'content' },
    { key: 'center', type: 'select', label: { 'zh-CN': '中心图案', en: 'Center mark' }, default: 'arrow', options: [{ value: 'arrow', label: { 'zh-CN': '箭头', en: 'Arrow' } }, { value: 'dot', label: { 'zh-CN': '圆点', en: 'Dot' } }, { value: 'ring', label: { 'zh-CN': '圆环', en: 'Ring' } }, { value: 'none', label: { 'zh-CN': '无', en: 'None' } }], group: 'content' },
    { key: 'discColor', type: 'color', label: { 'zh-CN': '圆盘颜色', en: 'Disc color' }, default: '#1c1917', group: 'color' },
    { key: 'textColor', type: 'color', label: { 'zh-CN': '文字与图案颜色', en: 'Text and mark color' }, default: '#d9f26b', group: 'color' },
    { key: 'size', type: 'number', label: { 'zh-CN': '直径', en: 'Diameter' }, default: 200, min: 120, max: 320, step: 2, unit: 'px', safe: [140, 260], group: 'layout' },
    { key: 'fontSize', type: 'number', label: { 'zh-CN': '字号', en: 'Font size' }, default: 13, min: 9, max: 18, step: 0.5, safe: [11, 16], group: 'layout' },
    { key: 'direction', type: 'select', label: { 'zh-CN': '旋转方向', en: 'Direction' }, default: 'clockwise', options: [{ value: 'clockwise', label: { 'zh-CN': '顺时针', en: 'Clockwise' } }, { value: 'counter', label: { 'zh-CN': '逆时针', en: 'Counterclockwise' } }], group: 'motion' },
    { key: 'spinDuration', type: 'number', label: { 'zh-CN': '转一圈用时', en: 'Seconds per turn' }, default: 22, min: 6, max: 60, step: 1, unit: 's', safe: [10, 40], group: 'motion' },
    { key: 'hoverBoost', type: 'number', label: { 'zh-CN': '悬停加速', en: 'Hover boost' }, hint: { 'zh-CN': '指针经过时的速度倍数，1 为不加速', en: 'Speed multiplier under the pointer; 1 disables it' }, default: 3, min: 1, max: 6, step: 0.5, unit: 'x', safe: [1, 4], group: 'interaction' },
  ],
  presets: [
    { id: 'ink-lime', name: { 'zh-CN': '墨绿', en: 'Ink and Lime' }, values: { text: 'AVAILABLE FOR WORK • BOOKING SPRING 2027 • ', discColor: '#1c1917', textColor: '#d9f26b', center: 'arrow' } },
    { id: 'tomato', name: { 'zh-CN': '番茄', en: 'Tomato' }, values: { text: 'FRESH ARRIVALS • SEASON ONE • MADE IN SMALL BATCHES • ', discColor: '#e5432d', textColor: '#fff4e6', center: 'dot', fontSize: 11.5, spinDuration: 28 } },
    { id: 'cobalt', name: { 'zh-CN': '钴蓝', en: 'Cobalt' }, values: { text: 'SCROLL DOWN • SCROLL DOWN • ', discColor: '#1d3fd8', textColor: '#ffffff', center: 'arrow', fontSize: 15, spinDuration: 16, direction: 'counter' } },
    { id: 'paper-stamp', name: { 'zh-CN': '纸章', en: 'Paper Stamp' }, values: { text: '现在接单 · 欢迎来信 · ', discColor: '#f0cf9e', textColor: '#7a2a1a', center: 'ring', fontSize: 15, spinDuration: 30, hoverBoost: 2 } },
    { id: 'night-shift', name: { 'zh-CN': '夜班', en: 'Night Shift' }, values: { text: 'OPEN LATE • OPEN LATE • OPEN LATE • ', discColor: '#0b1020', textColor: '#8fb4ff', center: 'dot', fontSize: 12, spinDuration: 18, hoverBoost: 5 } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'The text is spread evenly around the ring with textLength, so keep the copy to one phrase repeated or two short phrases separated by a bullet; very long copy gets cramped.',
      'Pass onClick to render the badge as a button (it then gets an accessible name from the text); otherwise it is a decorative div.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 2, posterTime: 0, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'animata',
      repo: 'codse/animata',
      sha: '36674e4e9cfdc0f237693d8b736a2bf41065ca1d',
      paths: ['animata/text/circular-text.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Animata'],
    },
    modifications: [
      'The upstream component positions one absolutely placed span per character with rotate + translateY and spins the whole div with an infinite motion animation. This version lays the text on an SVG textPath with textLength so the copy fills the ring evenly, and spins it from the frame-loop time.',
      'Added a disc, a center mark, colors, size, font size, direction and a hover boost that eases in and out, plus an optional onClick that renders a button with an accessible name.',
      'Motif improvement: with prefers-reduced-motion the ring stays still (frame loop frozen) and the hover boost has no effect.',
    ],
    assets: [],
  },
})
