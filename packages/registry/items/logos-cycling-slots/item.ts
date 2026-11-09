import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'logos-cycling-slots',
  status: 'published',
  title: { 'zh-CN': '轮换标志墙', en: 'Cycling Logo Slots' },
  summary: {
    'zh-CN': '一排标志槽位，每个槽位按自己的节拍轮换虚构品牌字标：旧标志模糊着上移消失，新标志从下方浮现，各列错开。适合放在首屏下面做信任背书。',
    en: 'A row of slots where each one cycles through invented brand wordmarks on its own beat: the outgoing mark blurs up and away as the next rises in, staggered across columns. A compact trust strip under a hero.',
  },
  kind: 'section',
  category: 'logos',
  tags: ['logos', 'logo carousel', 'trusted by', 'wordmarks', 'social proof', 'cycling'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'logos-cycling-slots.tsx', export: 'LogoCarousel' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'logos-cycling-slots.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'heading', type: 'text', label: { 'zh-CN': '引导语', en: 'Lead line' }, default: 'Used by release teams at 900+ companies', maxLength: 80, group: 'content' },
    { key: 'columns', type: 'number', label: { 'zh-CN': '槽位数', en: 'Columns' }, default: 3, min: 2, max: 5, step: 1, group: 'layout' },
    {
      key: 'logoStyle',
      type: 'select',
      label: { 'zh-CN': '标志样式', en: 'Logo style' },
      default: 'wordmark',
      options: [
        { value: 'wordmark', label: { 'zh-CN': '图形 + 字标', en: 'Glyph + wordmark' } },
        { value: 'glyph', label: { 'zh-CN': '仅图形', en: 'Glyph only' } },
      ],
      group: 'look',
    },
    {
      key: 'tone',
      type: 'select',
      label: { 'zh-CN': '明暗', en: 'Tone' },
      default: 'dark',
      options: [
        { value: 'dark', label: { 'zh-CN': '深色', en: 'Dark' } },
        { value: 'light', label: { 'zh-CN': '浅色', en: 'Light' } },
      ],
      group: 'look',
    },
    { key: 'logoSize', type: 'number', label: { 'zh-CN': '标志大小', en: 'Logo size' }, default: 24, min: 18, max: 30, step: 1, unit: 'px', group: 'look' },
    { key: 'interval', type: 'number', label: { 'zh-CN': '轮换间隔', en: 'Interval' }, default: 2, min: 1.2, max: 5, step: 0.1, unit: 's', group: 'motion' },
    { key: 'stagger', type: 'number', label: { 'zh-CN': '列间错开', en: 'Column stagger' }, default: 0.2, min: 0, max: 1, step: 0.05, unit: 's', group: 'motion' },
    { key: 'blur', type: 'number', label: { 'zh-CN': '模糊', en: 'Blur' }, default: 8, min: 0, max: 16, step: 1, unit: 'px', group: 'motion' },
  ],
  presets: [
    { id: 'original', name: { 'zh-CN': '原样', en: 'Original' }, values: {} },
    { id: 'paper', name: { 'zh-CN': '纸面', en: 'Paper' }, values: { tone: 'light', columns: 4, stagger: 0.4 } },
    { id: 'pulse', name: { 'zh-CN': '脉冲', en: 'Pulse' }, values: { logoStyle: 'glyph', columns: 5, interval: 1.6, blur: 12 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable', 'Syne Variable', 'Archivo Black', 'DM Serif Display', 'Fraunces Variable', 'JetBrains Mono Variable', 'Bricolage Grotesque Variable', 'Space Grotesk Variable', 'Instrument Serif'],
  guidance: {
    rules: ['The wordmarks are invented. Replace them only with logos you have permission to display; never ship real trademarks without it.'],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 1.2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'cult-ui',
      repo: 'nolly-studio/cult-ui',
      sha: 'ee98a5dd2e319b63cc2e707dd968d6af04209b7e',
      paths: ['apps/www/registry/default/ui/logo-carousel.tsx', 'apps/www/registry/default/example/logo-carousel-demo.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 Jordan-Gilliam'],
    },
    modifications: [
      'Real company logos replaced with fourteen invented SVG glyph + wordmark marks.',
      'The 100ms setInterval clock is replaced by useFrameLoop time quantised to the same 100ms steps.',
      'Random shuffle replaced with a seeded shuffle so renders are deterministic.',
      'Column count, cycle interval, column stagger, blur, logo size, tone, logo style and a lead line exposed as params.',
      'Reduced motion: clock frozen and swaps become plain fades without blur or movement.',
    ],
    assets: [],
  },
})
