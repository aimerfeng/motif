import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'swipe-button',
  status: 'published',
  title: { 'zh-CN': '推扫按钮', en: 'Swipe Button' },
  summary: {
    'zh-CN': '森林绿的按钮，悬停时琥珀色的第二层带着新文案从下方把它整块推走，还多出一个箭头。键盘聚焦时同样触发，换字时按钮不会抖动。适合注册、预约和下载这类主行动按钮。',
    en: 'A forest-green button that, on hover, is pushed out by an amber second layer with new copy and an arrow sliding in from below. Keyboard focus triggers it too, and the width never jumps when the text changes. Made for sign-up, booking and download calls to action.',
  },
  kind: 'component',
  category: 'button',
  tags: ['button', 'cta', 'hover', 'swipe', 'slide', 'text-swap'],
  runtime: ['react', 'css'],
  entry: { file: 'swipe-button.tsx', export: 'SwipeButton' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'swipe-button.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'label', type: 'text', label: { 'zh-CN': '默认文案', en: 'Label' }, default: 'Get early access', maxLength: 32, group: 'content' },
    { key: 'hoverLabel', type: 'text', label: { 'zh-CN': '悬停文案', en: 'Hover label' }, default: 'Join the waitlist', maxLength: 32, group: 'content' },
    { key: 'arrow', type: 'boolean', label: { 'zh-CN': '悬停时显示箭头', en: 'Arrow on hover' }, default: true, group: 'content' },
    { key: 'direction', type: 'select', label: { 'zh-CN': '推入方向', en: 'Direction' }, hint: { 'zh-CN': '第二层从哪一侧滑进来', en: 'Which side the second layer enters from' }, default: 'up', options: [{ value: 'up', label: { 'zh-CN': '自下而上', en: 'From below' } }, { value: 'down', label: { 'zh-CN': '自上而下', en: 'From above' } }, { value: 'left', label: { 'zh-CN': '自右向左', en: 'From the right' } }, { value: 'right', label: { 'zh-CN': '自左向右', en: 'From the left' } }], group: 'motion' },
    { key: 'duration', type: 'number', label: { 'zh-CN': '时长', en: 'Duration' }, default: 380, min: 180, max: 800, step: 10, unit: 'ms', safe: [240, 560], group: 'motion' },
    { key: 'radius', type: 'number', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 14, min: 0, max: 32, step: 1, unit: 'px', safe: [0, 32], group: 'look' },
    { key: 'firstColor', type: 'color', label: { 'zh-CN': '默认底色', en: 'Base color' }, default: '#0f3d2e', group: 'color' },
    { key: 'firstInk', type: 'color', label: { 'zh-CN': '默认文字色', en: 'Base text' }, default: '#f2efe6', group: 'color' },
    { key: 'secondColor', type: 'color', label: { 'zh-CN': '悬停底色', en: 'Hover color' }, default: '#f4b942', group: 'color' },
    { key: 'secondInk', type: 'color', label: { 'zh-CN': '悬停文字色', en: 'Hover text' }, default: '#0f3d2e', group: 'color' },
  ],
  presets: [
    { id: 'forest-amber', name: { 'zh-CN': '林间琥珀', en: 'Forest and Amber' }, values: { label: 'Get early access', hoverLabel: 'Join the waitlist', firstColor: '#0f3d2e', firstInk: '#f2efe6', secondColor: '#f4b942', secondInk: '#0f3d2e', radius: 14 } },
    { id: 'ink-paper', name: { 'zh-CN': '墨与纸', en: 'Ink and Paper' }, values: { label: 'View the portfolio', hoverLabel: 'See selected work', firstColor: '#171717', firstInk: '#fafaf7', secondColor: '#fafaf7', secondInk: '#171717', radius: 0, direction: 'right', duration: 320 } },
    { id: 'tide', name: { 'zh-CN': '潮汐', en: 'Tide' }, values: { label: 'Book a demo', hoverLabel: 'Pick a time', firstColor: '#1d4ed8', firstInk: '#ffffff', secondColor: '#bfe3ff', secondInk: '#10306e', radius: 32, direction: 'left', duration: 460 } },
    { id: 'ember', name: { 'zh-CN': '炭火', en: 'Ember' }, values: { label: 'Download for Mac', hoverLabel: 'v2.4 · 38 MB', firstColor: '#2a1710', firstInk: '#ffe9d6', secondColor: '#ff6a3d', secondInk: '#2a1710', radius: 10, direction: 'down', arrow: false } },
    { id: 'blush', name: { 'zh-CN': '胭脂', en: 'Blush' }, values: { label: '预约体验', hoverLabel: '立即预约', firstColor: '#7a1f3d', firstInk: '#ffe9ef', secondColor: '#ffc2d1', secondInk: '#7a1f3d', radius: 24, duration: 520 } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'The first layer carries the accessible name; the second layer is aria-hidden decoration, so keep both texts conveying the same action.',
      'Keep both labels short (under about 24 characters) and let the button size itself; it is as wide as the longer label.',
      'Keep contrast of both layers above 4.5:1 for their text.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 2.4, posterTime: 1.8, loop: 4 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'animata',
      repo: 'codse/animata',
      sha: '36674e4e9cfdc0f237693d8b736a2bf41065ca1d',
      paths: ['animata/button/swipe-button.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Animata'],
    },
    modifications: [
      'Kept the two-layer swipe: the upstream button uses group-hover utility classes to slide an absolutely positioned second span over the first. This version drives the transforms from hover and focus state, supports four directions, lets the two layers share one grid cell so the button is as wide as the longer label, and animates transform with a configurable duration instead of a bare duration utility.',
      'Added an optional arrow on the second layer, colors for both layers, radius, duration and an optional controlled active prop (used by the demo to autoplay). The upstream color classes (bg-orange-500, bg-black) and fixed text-2xl size are replaced by color parameters and a smaller type size.',
      'Keyboard focus (focus-visible only) triggers the swipe; the second layer is aria-hidden so the accessible name is the first label. With prefers-reduced-motion the layers swap without movement.',
    ],
    assets: [],
  },
})
