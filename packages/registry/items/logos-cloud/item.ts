import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'logos-cloud',
  status: 'published',
  title: { 'zh-CN': '客户 Logo 墙', en: 'Logo Cloud' },
  summary: {
    'zh-CN': '八个虚构品牌的 SVG 字标，每个用不同的字体和几何图形，做成无缝滚动的横条，或者带细分隔线的四列网格。放在首屏下面做信任背书。',
    en: 'Eight invented brand wordmarks, each set in its own typeface with a simple geometric glyph, as a seamless scrolling strip or a hairline-divided grid. A trust strip for under the hero.',
  },
  kind: 'section',
  category: 'logos',
  tags: ['logos', 'logo cloud', 'trusted by', 'wordmarks', 'marquee', 'social proof'],
  runtime: ['react', 'css', 'svg'],
  entry: { file: 'logos-cloud.tsx', export: 'LogosCloud' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'logos-cloud.tsx', role: 'component' },
    { path: 'logos-cloud.css', role: 'style' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'heading', type: 'text', label: { 'zh-CN': '引导语', en: 'Lead line' }, default: 'Trusted by product teams who ship every week', maxLength: 80, group: 'content' },
    { key: 'count', type: 'text', label: { 'zh-CN': '数字', en: 'Count' }, default: '1,200+', maxLength: 10, group: 'content' },
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent color' }, default: '#8b7bff', group: 'look' },
    { key: 'colorGlyphs', type: 'boolean', label: { 'zh-CN': '图形用主色', en: 'Accent-colored glyphs' }, default: false, group: 'look' },
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
      key: 'layout',
      type: 'select',
      label: { 'zh-CN': '排布', en: 'Layout' },
      default: 'marquee',
      options: [
        { value: 'marquee', label: { 'zh-CN': '滚动横条', en: 'Scrolling strip' } },
        { value: 'grid', label: { 'zh-CN': '四列网格', en: 'Grid' } },
      ],
      group: 'layout',
    },
    { key: 'duration', type: 'number', label: { 'zh-CN': '滚动一轮用时', en: 'Loop duration' }, default: 36, min: 12, max: 90, step: 2, unit: 's', safe: [20, 60], group: 'motion' },
    { key: 'pauseOnHover', type: 'boolean', label: { 'zh-CN': '悬停暂停', en: 'Pause on hover' }, default: true, group: 'motion' },
  ],
  presets: [
    { id: 'quiet', name: { 'zh-CN': '静默', en: 'Quiet' }, values: {} },
    { id: 'ledger', name: { 'zh-CN': '账本', en: 'Ledger' }, values: { layout: 'grid', tone: 'light', accent: '#111111', colorGlyphs: true } },
    { id: 'signal', name: { 'zh-CN': '信号', en: 'Signal' }, values: { accent: '#22d3ee', colorGlyphs: true, duration: 24 } },
  ],
  dependencies: ['@motif/runtime'],
  fonts: ['Geist Variable', 'Syne Variable', 'Archivo Black', 'DM Serif Display', 'Fraunces Variable', 'JetBrains Mono Variable', 'Bricolage Grotesque Variable', 'Space Grotesk Variable', 'Instrument Serif'],
  guidance: {
    rules: [
      'Never use real company logos or trademarks. The wordmarks here are invented; to show real customers, replace them with logos you have written permission to display.',
      'Keep logos monochrome (current text color) so no single brand dominates; use the accent glyph option sparingly.',
      'Use six to ten marks at similar visual weight and keep the section quiet: it supports the hero, it does not compete with it.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.8, posterTime: 2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'eldoraui',
      repo: 'karthikmudunuri/eldoraui',
      sha: '6bb8fd211ecbdfa983f5780bead27d9f3890f20a',
      paths: ['apps/www/registry/blocks/logo-cloud-02/page.tsx', 'apps/www/registry/blocks/logo-cloud-01/page.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Mudunuri Bhaskara Karthikeya Varma'],
    },
    modifications: [
      'Kept the two arrangements (scrolling strip and grid) of the upstream logo clouds; the code is rewritten around a shared wordmark list.',
      'All brand logos were replaced by invented wordmarks: an inline SVG glyph plus text in a distinct OFL typeface per mark.',
      'Strip animation is CSS (two copies translated by -50%), paused on hover and stopped under prefers-reduced-motion.',
    ],
    assets: [],
  },
})
