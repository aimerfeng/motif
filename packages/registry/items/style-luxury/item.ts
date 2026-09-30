import { defineItem } from '@motif/schema'

const option = (value: string, zh: string, en: string) => ({ value, label: { 'zh-CN': zh, en } })

export default defineItem({
  schemaVersion: 1,
  slug: 'style-luxury',
  status: 'published',
  title: { 'zh-CN': '奢华杂志', en: 'Luxury Editorial' },
  summary: {
    'zh-CN': '近黑底、金色发丝线、高反差衬线标题、加宽字距的大写小标签、双线分隔和带内缩框的卡片。按钮直角，输入框只有一条底线。也有象牙纸的浅色版本。适合钟表、珠宝、酒店、高端品牌与杂志类站点。',
    en: 'Near-black pages, gold hairlines, high-contrast serif headlines, wide-tracked small caps, double rules and cards with an inset frame. Square buttons and single-line inputs, with an ivory-paper light mode. For watches, jewellery, hospitality, high-end brands and magazines.',
  },
  kind: 'style',
  category: 'editorial',
  tags: ['luxury', 'editorial', 'gold', 'serif', 'magazine', 'premium', 'daisyui luxury'],
  runtime: ['react', 'css'],
  entry: { file: 'style-luxury.tsx', export: 'StyleLuxury' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'style-luxury.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '金属色', en: 'Metal' }, hint: { 'zh-CN': '金色发丝线、强调字和主按钮；也可以换成玫瑰金、香槟银', en: 'Hairlines, accent words and the primary button; try rose gold or champagne silver' }, default: '#dca54d' },
    { key: 'radius', type: 'number', group: 'shape', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 2, min: 0, max: 8, step: 1, unit: 'px', safe: [0, 4] },
    { key: 'borderWidth', type: 'number', group: 'shape', label: { 'zh-CN': '发丝线粗细', en: 'Hairline weight' }, default: 1, min: 0.5, max: 2, step: 0.5, unit: 'px', safe: [0.5, 1.5] },
    { key: 'depth', type: 'number', group: 'shape', label: { 'zh-CN': '卡片阴影', en: 'Card shadow' }, default: 0.5, min: 0, max: 1, step: 0.05, safe: [0.2, 0.8] },
    {
      key: 'fontPairing',
      type: 'select',
      group: 'type',
      label: { 'zh-CN': '字体搭配', en: 'Font pairing' },
      default: 'playfair',
      options: [option('playfair', 'Playfair Display + Inter Tight', 'Playfair Display + Inter Tight'), option('fraunces', 'Fraunces + Manrope', 'Fraunces + Manrope'), option('dmserif', 'DM Serif Display + Inter Tight', 'DM Serif Display + Inter Tight'), option('instrument', 'Instrument Serif + Geist', 'Instrument Serif + Geist')],
    },
    { key: 'dark', type: 'boolean', group: 'look', label: { 'zh-CN': '深色', en: 'Dark' }, default: true },
  ],
  presets: [
    { id: 'maison', name: { 'zh-CN': '夜色金', en: 'Maison noir' }, values: { accent: '#dca54d', radius: 2, borderWidth: 1, depth: 0.5, fontPairing: 'playfair', dark: true } },
    { id: 'rose-gold', name: { 'zh-CN': '玫瑰金', en: 'Rose gold' }, values: { accent: '#d9a08f', radius: 0, borderWidth: 1, depth: 0.6, fontPairing: 'fraunces', dark: true } },
    { id: 'ivory', name: { 'zh-CN': '象牙纸', en: 'Ivory paper' }, values: { accent: '#b8862f', radius: 2, borderWidth: 1, depth: 0.3, fontPairing: 'playfair', dark: false } },
    { id: 'champagne-silver', name: { 'zh-CN': '香槟银', en: 'Champagne silver' }, values: { accent: '#c9ccd4', radius: 0, borderWidth: 0.5, depth: 0.4, fontPairing: 'instrument', dark: true } },
  ],
  dependencies: ['@motif/runtime'],
  fonts: ['Playfair Display Variable', 'Fraunces Variable', 'DM Serif Display', 'Instrument Serif', 'Inter Tight Variable', 'Manrope Variable', 'Geist Variable'],
  guidance: {
    use: [
      'Use for premium and heritage brands: watches, jewellery, fashion, fragrance, hotels and restaurants, galleries, magazines, annual reports and long-form editorial features.',
      'Avoid for utilitarian software UI or playful consumer products; the ceremony gets in the way of speed.',
    ],
    rules: [
      'Palette is daisyUI luxury: near-black base-100 oklch(14% .004 286), base-200 oklch(20.2% .004 308), base-300 oklch(23.2% .004 308), champagne text derived from neutral-content oklch(93% .089 91), gold oklch(75.7% .123 77) as the only accent, midnight blue oklch(27.6% .064 261) and plum oklch(36.7% .051 339) as the two dark feature-panel colours. Light mode is warm ivory paper (#f6f1e7) with near-black ink and a darker gold for text.',
      'Colour ratio: 92% near-black or ivory and champagne text, 6% gold (hairlines, small caps labels, one italic word, one filled button), 2% semantic colours desaturated (sage, amber, brick). Never a bright or saturated colour; never a gradient across a button.',
      'Gold is a line colour. Use it for 1px hairlines, borders, ornaments and small-caps labels. Do not use it for large fills except the single primary button per page. Text on gold is near-black.',
      'Lines and frames: cards have a 1px gold hairline at 38% alpha and, when featured, an inset second frame 7px inside at 18% alpha. Section breaks use a double rule (two 1px lines 3px apart) under mastheads and a centred diamond ornament between sections.',
      'Type: a high-contrast serif for all headings at regular weight (never bold), -0.015em tracking and line-height 1.04, with exactly one italic gold word or phrase in the hero headline; a quiet sans for body at 15px / 1.65; labels are 10 to 11px sans, UPPERCASE, 0.22 to 0.3em tracking, gold. Numerals use lining tabular figures in the serif.',
      'Layout is symmetrical and airy: centred mastheads and section titles, 64px+ vertical rhythm, narrow measures (max 34rem), a drop cap on the first paragraph of long copy.',
      'Shape: radius is 0 to 4px. No pills, no soft shadows except a deep, tight, black shadow under floating cards (offset 34px, blur 70px, spread -26px). Arch-topped frames are allowed for hero imagery.',
      'Buttons are rectangles: uppercase 11px, 0.22em tracking, 1px gold outline that fills with gold on hover while the tracking widens slightly. Inputs are a single 1px underline with italic serif placeholder text; focus thickens the line to gold.',
      'Motion is slow and dignified: 250 to 450ms ease-out for colour and tracking changes, tabs glide on a diamond marker. No bounce, no glow, no parallax. Respect prefers-reduced-motion.',
      'Forbidden: bold serif headings, gradients on buttons, drop shadows with colour, neon or pastel colours, emoji, more than one gold-filled element per screen, sans-serif headings.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'daisyui',
      repo: 'saadeghi/daisyui',
      sha: 'c51f50130ffefb293179e6fce8de7ad3f307e45f',
      paths: ['packages/daisyui/src/themes/luxury.css'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2020 Pouya Saadeghi'],
    },
    modifications: [
      'The dark palette (three near-black bases, champagne from neutral-content, gold from base-content, midnight blue and plum panels) uses the luxury theme oklch tokens unchanged; gold is exposed as the accent parameter.',
      'The ivory light mode, editorial layout rules, double rules, ornaments, framed cards, underline inputs, primitives and style sheet are original Motif work.',
    ],
    assets: [],
  },
})
