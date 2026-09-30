import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'footer-giant-wordmark',
  status: 'published',
  title: { 'zh-CN': '巨型字标页脚', en: 'Giant Wordmark Footer' },
  summary: {
    'zh-CN': '四列链接加订阅框，底部是撑满整行的巨型品牌字标：描边字上有一束渐变高光自己来回扫过，指针经过时会跟着指针。也有不带巨字的紧凑版。',
    en: 'Four link columns and a subscribe box above a brand wordmark that fills the whole row: an outlined word with a gradient highlight sweeping across on its own and following the pointer when it passes. A compact variant drops the giant word.',
  },
  kind: 'section',
  category: 'footer',
  tags: ['footer', 'wordmark', 'giant text', 'text hover', 'newsletter', 'links'],
  runtime: ['react', 'css'],
  entry: { file: 'footer-giant-wordmark.tsx', export: 'FooterGiantWordmark' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'footer-giant-wordmark.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'brand', type: 'text', label: { 'zh-CN': '品牌名', en: 'Brand name' }, hint: { 'zh-CN': '也是底部巨字，短一点更好看', en: 'Also the giant word; shorter looks better' }, default: 'halcyon', maxLength: 14, group: 'content' },
    { key: 'tagline', type: 'text', label: { 'zh-CN': '一句话介绍', en: 'Tagline' }, default: 'Deploy tracing for teams that would rather sleep. Built in Rotterdam, used everywhere.', maxLength: 110, group: 'content' },
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent color' }, default: '#22d3ee', group: 'look' },
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
    {
      key: 'font',
      type: 'select',
      label: { 'zh-CN': '巨字字体', en: 'Giant word font' },
      default: 'geist',
      options: [
        { value: 'geist', label: { 'zh-CN': 'Geist 无衬线', en: 'Geist sans' } },
        { value: 'grotesk', label: { 'zh-CN': 'Space Grotesk', en: 'Space Grotesk' } },
        { value: 'serif', label: { 'zh-CN': 'Instrument 衬线', en: 'Instrument serif' } },
      ],
      group: 'look',
    },
    {
      key: 'layout',
      type: 'select',
      label: { 'zh-CN': '版式', en: 'Layout' },
      default: 'giant',
      options: [
        { value: 'giant', label: { 'zh-CN': '带巨型字标', en: 'With giant word' } },
        { value: 'compact', label: { 'zh-CN': '紧凑', en: 'Compact' } },
      ],
      group: 'layout',
    },
    { key: 'showStatus', type: 'boolean', label: { 'zh-CN': '显示系统状态', en: 'Show status pill' }, default: true, group: 'layout' },
    { key: 'sweep', type: 'number', label: { 'zh-CN': '高光扫动速度', en: 'Sweep speed' }, default: 0.8, min: 0.2, max: 2.5, step: 0.1, safe: [0.4, 1.6], group: 'motion' },
  ],
  presets: [
    { id: 'tidewater', name: { 'zh-CN': '潮汐', en: 'Tidewater' }, values: {} },
    { id: 'magma', name: { 'zh-CN': '岩浆', en: 'Magma' }, values: { accent: '#ff5d3a', font: 'grotesk', brand: 'kiln' } },
    { id: 'gazette', name: { 'zh-CN': '公报', en: 'Gazette' }, values: { tone: 'light', accent: '#1d4ed8', font: 'serif', brand: 'Halcyon', sweep: 0.5 } },
  ],
  dependencies: ['@motif/runtime'],
  fonts: ['Geist Variable', 'Space Grotesk Variable', 'Instrument Serif'],
  guidance: {
    rules: [
      'The giant wordmark is decoration: keep it aria-hidden and use the brand name only, never a slogan.',
      'Four link columns at most, five links each, headed by muted uppercase labels; the legal column always stays.',
      'Only the highlight uses the accent color; the outline stays neutral so the footer does not outshine the page.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { posterTime: 1.2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'eldoraui',
      repo: 'karthikmudunuri/eldoraui',
      sha: '6bb8fd211ecbdfa983f5780bead27d9f3890f20a',
      paths: ['apps/www/registry/blocks/footer-01/components/text-hover-effect.tsx', 'apps/www/registry/blocks/footer-01/components/footer.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Mudunuri Bhaskara Karthikeya Varma'],
    },
    modifications: [
      'Kept the outlined giant text with a masked gradient reveal; it is now HTML text with a CSS radial mask instead of an SVG mask, sized to fill the row with a measured font size.',
      'The reveal sweeps on its own using the Motif frame loop (paused offscreen, single frame under reduced motion) and hands over to the pointer while it hovers.',
      'Footer columns, subscribe box, status pill and copy are new; the theme toggler was removed and generic inline icons replace lucide.',
    ],
    assets: [],
  },
})
