import { defineItem } from '@motif/schema'

const option = (value: string, zh: string, en: string) => ({ value, label: { 'zh-CN': zh, en } })

export default defineItem({
  schemaVersion: 1,
  slug: 'style-claymorphism',
  status: 'published',
  title: { 'zh-CN': '黏土拟态', en: 'Claymorphism' },
  summary: {
    'zh-CN': '像捏出来的黏土：卡片和按钮四层阴影叠出「充气」的凸起，输入框和选项卡轨道则向内凹陷，按下按钮就是从凸变凹。石色中性底加一个明亮主色，适合儿童、理财、健康、教育类的亲和界面。',
    en: 'Interfaces that look pressed from clay: four stacked shadows inflate cards and buttons, inputs and tab tracks sink in, and pressing a button flips it from raised to dented. Stone neutrals plus one bright colour, for friendly finance, kids, health and education products.',
  },
  kind: 'style',
  category: 'playful',
  tags: ['claymorphism', 'clay', '3d', 'soft ui', 'puffy', 'friendly'],
  runtime: ['react', 'css'],
  entry: { file: 'style-claymorphism.tsx', export: 'StyleClaymorphism' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'style-claymorphism.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#6366f1' },
    { key: 'radius', type: 'number', group: 'shape', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 22, min: 12, max: 36, step: 1, unit: 'px', safe: [16, 30] },
    { key: 'borderWidth', type: 'number', group: 'shape', label: { 'zh-CN': '边缘高光粗细', en: 'Rim width' }, hint: { 'zh-CN': '表面边缘那圈半透明白线', en: 'The translucent white line along a surface edge' }, default: 1, min: 0, max: 3, step: 0.5, unit: 'px', safe: [0.5, 2] },
    { key: 'puff', type: 'number', group: 'shape', label: { 'zh-CN': '鼓胀程度', en: 'Puffiness' }, hint: { 'zh-CN': '同时缩放所有内外阴影的偏移和模糊', en: 'Scales the offset and blur of every inner and outer shadow' }, default: 0.85, min: 0.3, max: 1.4, step: 0.05, safe: [0.5, 1.15] },
    {
      key: 'fontPairing',
      type: 'select',
      group: 'type',
      label: { 'zh-CN': '字体搭配', en: 'Font pairing' },
      default: 'jakarta',
      options: [option('jakarta', 'Plus Jakarta Sans', 'Plus Jakarta Sans'), option('outfit', 'Outfit', 'Outfit'), option('syne', 'Syne + Manrope', 'Syne + Manrope'), option('dmserif', 'DM Serif Display + Plus Jakarta', 'DM Serif Display + Plus Jakarta')],
    },
    { key: 'dark', type: 'boolean', group: 'look', label: { 'zh-CN': '深色', en: 'Dark' }, default: false },
  ],
  presets: [
    { id: 'stoneware', name: { 'zh-CN': '陶土', en: 'Stoneware' }, values: { accent: '#6366f1', radius: 22, borderWidth: 1, puff: 0.85, fontPairing: 'jakarta', dark: false } },
    { id: 'bubblegum', name: { 'zh-CN': '泡泡糖', en: 'Bubblegum' }, values: { accent: '#ec4899', radius: 30, borderWidth: 1.5, puff: 1.05, fontPairing: 'outfit', dark: false } },
    { id: 'matcha', name: { 'zh-CN': '抹茶', en: 'Matcha' }, values: { accent: '#16a34a', radius: 18, borderWidth: 1, puff: 0.7, fontPairing: 'jakarta', dark: false } },
    { id: 'charcoal', name: { 'zh-CN': '炭烧', en: 'Charcoal' }, values: { accent: '#818cf8', radius: 24, borderWidth: 1, puff: 0.9, fontPairing: 'syne', dark: true } },
  ],
  dependencies: ['@motif/runtime'],
  fonts: ['Plus Jakarta Sans Variable', 'Outfit Variable', 'Syne Variable', 'Manrope Variable', 'DM Serif Display', 'Geist Mono Variable'],
  guidance: {
    use: [
      'Use for approachable consumer products: family finance, kids and education, health and habit apps, playful onboarding, indie tools that want a tactile, toy-like feel.',
      'Avoid for dense data tables, long forms and anything that needs high information density; inflated surfaces waste space.',
    ],
    rules: [
      'Base tokens come from the tweakcn claymorphism preset: warm stone neutrals (background #e7e5e4, card #f5f5f4, border #d6d3d1, foreground #1e293b; dark: #1e1b18, #2c2825, #3a3633, #e2e8f0), indigo primary, radius 1.25rem. Keep the neutrals; only the accent may change.',
      'A raised surface is always four shadows: inner top-left highlight (white), inner bottom-right shade (grey at 16%), a soft outer drop toward the bottom-right in the preset shadow colour (hsl(240 4% 60%) at 50%), and a faint white reflection toward the top-left. Never use just one drop shadow, and never a black shadow in light mode.',
      'A sunken surface (input, tab track, progress track, switch track) inverts the two inner shadows and has no outer shadow. Raised means clickable or important; sunken means editable or containing.',
      'Buttons rise on hover (translateY -2px) and dent on press (inner shadows inverted, 1px down, scale .985). The primary button is the accent colour with white 40% and black 22% inner shadows and a coloured drop shadow.',
      'Radius is large and consistent: cards 22px, controls 75% of that, chips and switches fully round. Corner radius must never drop below 12px.',
      'Colour ratio: 90% stone neutrals, 8% accent, 2% semantic. Decorative clay balls (radial gradient from a lighter highlight at 32% 26%, inner shadows) may use pink, yellow and mint at high saturation, but only as decoration.',
      'Type: a heavy rounded sans; headings 800 weight, -0.035em tracking, body 500 to 600 weight so it stays legible on raised surfaces. Numbers may use a mono.',
      'Puffiness is one number: it scales all offsets and blurs together. Keep it between 0.5 and 1.15; above that surfaces look melted.',
      'Motion is springy and tactile (180 to 340ms with overshoot), used for press, tab thumbs and switch beads. No parallax or long loops. Respect prefers-reduced-motion.',
      'Text on the accent uses white or the dark stone, chosen by contrast. Muted text is #6b7280 in light mode and never lighter.',
      'Forbidden: flat surfaces with a single border, hard-edged shadows, gradients across whole cards, neon colours, pure white or pure black surfaces.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'tweakcn',
      repo: 'jnsahaj/tweakcn',
      sha: 'a3b47b37cba97dd637de517aab52c45ec0f83456',
      paths: ['utils/theme-presets.ts'],
      spdx: 'Apache-2.0',
      copyright: ['tweakcn (https://github.com/jnsahaj/tweakcn)'],
    },
    modifications: [
      'Only the neutral "claymorphism" preset was used: its light and dark neutral colours, indigo primary, 1.25rem radius, Plus Jakarta Sans and shadow colour were kept as the starting tokens.',
      'The preset defines flat shadow offsets only. The layered raised and sunken shadow recipes, buttons, inputs, tabs, switch, alerts, clay balls, parameters and the style sheet are original Motif work; the accent is now a parameter rather than a fixed primary.',
      'Converted from shadcn CSS variables into a scoped component with its own class names and an @layer components style block.',
    ],
    assets: [],
  },
})
