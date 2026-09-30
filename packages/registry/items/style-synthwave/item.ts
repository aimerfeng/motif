import { defineItem } from '@motif/schema'

const option = (value: string, zh: string, en: string) => ({ value, label: { 'zh-CN': zh, en } })

export default defineItem({
  schemaVersion: 1,
  slug: 'style-synthwave',
  status: 'published',
  title: { 'zh-CN': '合成波', en: 'Synthwave' },
  summary: {
    'zh-CN': '深靛蓝夜空、霓虹描边与辉光、大写的显示字体，配一个条纹夕阳加透视网格的地平线场景。一键切换到 cyberpunk（黄底黑字、直角、黑色硬阴影）。适合音乐、游戏、活动和开发者工具的大胆落地页。',
    en: 'A deep indigo night, neon outlines and glow, uppercase display type, and a striped-sun horizon with a perspective grid. Switch to cyberpunk for yellow paper, ink-black type, square corners and hard shadows. For music, games, events and bold developer-tool landing pages.',
  },
  kind: 'style',
  category: 'bold',
  tags: ['synthwave', 'outrun', 'cyberpunk', 'neon', 'retro futurism', '80s', 'glow'],
  runtime: ['react', 'css'],
  entry: { file: 'style-synthwave.tsx', export: 'StyleSynthwave' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'style-synthwave.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'theme',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '主题', en: 'Theme' },
      hint: { 'zh-CN': 'synthwave 是深色霓虹，cyberpunk 是黄色硬边风格', en: 'Synthwave is dark neon; cyberpunk is yellow with hard edges' },
      default: 'synthwave',
      options: [option('synthwave', 'Synthwave（深色霓虹）', 'Synthwave (dark neon)'), option('cyberpunk', 'Cyberpunk（黄底黑字）', 'Cyberpunk (yellow and ink)')],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '主色', en: 'Primary' }, hint: { 'zh-CN': '霓虹主色；青色和橙色由主题决定', en: 'The neon primary; cyan and orange come from the theme' }, default: '#f861b4' },
    { key: 'radius', type: 'number', group: 'shape', label: { 'zh-CN': '圆角', en: 'Radius' }, hint: { 'zh-CN': 'cyberpunk 下最多 4px', en: 'Capped at 4px in cyberpunk' }, default: 14, min: 0, max: 24, step: 1, unit: 'px', safe: [4, 18] },
    { key: 'borderWidth', type: 'number', group: 'shape', label: { 'zh-CN': '描边粗细', en: 'Border width' }, default: 2, min: 1, max: 4, step: 0.5, unit: 'px', safe: [1.5, 3] },
    { key: 'glow', type: 'number', group: 'shape', label: { 'zh-CN': '辉光强度', en: 'Glow' }, hint: { 'zh-CN': '同时缩放卡片、按钮、文字和夕阳的光晕', en: 'Scales the halo on cards, buttons, text and the sun' }, default: 0.7, min: 0, max: 1.2, step: 0.05, safe: [0.4, 1] },
    {
      key: 'fontPairing',
      type: 'select',
      group: 'type',
      label: { 'zh-CN': '字体搭配', en: 'Font pairing' },
      default: 'space',
      options: [option('space', 'Space Grotesk + JetBrains Mono', 'Space Grotesk + JetBrains Mono'), option('syne', 'Syne + Manrope', 'Syne + Manrope'), option('archivo', 'Archivo Black + Inter Tight', 'Archivo Black + Inter Tight'), option('mono', 'JetBrains Mono（全等宽）', 'JetBrains Mono (all mono)')],
    },
  ],
  presets: [
    { id: 'outrun', name: { 'zh-CN': '夜驰', en: 'Outrun' }, values: { theme: 'synthwave', accent: '#f861b4', radius: 14, borderWidth: 2, glow: 0.7, fontPairing: 'space' } },
    { id: 'ultraviolet', name: { 'zh-CN': '紫外线', en: 'Ultraviolet' }, values: { theme: 'synthwave', accent: '#a78bfa', radius: 4, borderWidth: 2, glow: 1, fontPairing: 'archivo' } },
    { id: 'miami', name: { 'zh-CN': '迈阿密', en: 'Miami' }, values: { theme: 'synthwave', accent: '#2ee6d6', radius: 10, borderWidth: 1.5, glow: 0.6, fontPairing: 'syne' } },
    { id: 'neon-yellow', name: { 'zh-CN': '荧黄', en: 'Neon yellow' }, values: { theme: 'cyberpunk', accent: '#ff6596', radius: 0, borderWidth: 2, glow: 0.7, fontPairing: 'space' } },
  ],
  dependencies: ['@motif/runtime'],
  fonts: ['Space Grotesk Variable', 'JetBrains Mono Variable', 'Syne Variable', 'Manrope Variable', 'Archivo Black', 'Inter Tight Variable', 'Geist Mono Variable'],
  guidance: {
    use: [
      'Use for music, gaming, nightlife and event sites, creative tools, developer products with a strong personality, and hero-driven landing pages.',
      'Avoid for content-heavy reading, finance or health; the glow and all-caps type are tiring over long pages.',
    ],
    rules: [
      'Palette is daisyUI synthwave: base-100 oklch(15% .09 281) to base-300 oklch(25% .09 281) for surfaces, periwinkle content text oklch(78% .115 275), hot pink primary, cyan secondary oklch(82% .111 230), orange tertiary oklch(75% .183 56). Cyberpunk swaps to yellow paper oklch(94.5% .179 104), black content, pink primary, cyan secondary, violet tertiary and navy neutral. Do not mix the two.',
      'Colour ratio in synthwave: 80% indigo surfaces and periwinkle text, 12% pink, 6% cyan, 2% orange or yellow. Pink is for the one primary action, headings glow and the horizon; cyan is for labels, focus, inputs and HUD corner brackets.',
      'Glow is the shadow. Every neon element gets a coloured halo (box-shadow or text-shadow) of the same hue at 20 to 70% alpha, scaled by one glow number. Never use black or grey drop shadows on synthwave.',
      'Outline first: buttons are neon outlines with an inner glow; fill only the one primary action. Cards are a dark gradient with a 2px pink-tinted border and cyan L-shaped brackets on the top-left and bottom-right corners.',
      'Type: display in a geometric grotesk or heavy black face, UPPERCASE, tight tracking (-0.02em) and line height 0.98; labels in mono at 0.14 to 0.2em tracking. Hero headlines use the chrome gradient (white to cyan, then pink to orange) with a pink drop-shadow halo.',
      'Every hero gets the horizon: a striped sun (gap bands widen toward the bottom), a perspective grid floor scrolling slowly and a glowing horizon line. Use it once per page, behind the hero only.',
      'Cyberpunk mode drops all glow. Corners are square (radius at most 4px), borders are 2px navy, shadows are hard offsets (4 to 6px, no blur) in navy, and buttons translate up-left on hover and down-right on press.',
      'Motion: the only ambient motion is the floor scroll (2.4s linear). Interaction is snappy (160 to 320ms). No parallax. Respect prefers-reduced-motion.',
      'Text contrast: on synthwave keep body at content colour (78% lightness), never dimmer than 70% opacity; on the primary fill use dark indigo text.',
      'Forbidden: pastel colours, rounded pill buttons in cyberpunk, more than three neon hues per screen, gradients on body text, lowercase headings.',
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
      paths: ['packages/daisyui/src/themes/synthwave.css', 'packages/daisyui/src/themes/cyberpunk.css'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2020 Pouya Saadeghi'],
    },
    modifications: [
      'The oklch colour tokens of the synthwave and cyberpunk themes are used unchanged; the primary colour is exposed as the accent parameter.',
      'Everything else is original Motif design on top of those tokens: neon outline and glow recipes, HUD corner brackets, the striped-sun horizon and grid floor, hard-shadow cyberpunk variant, primitives and style sheet.',
    ],
    assets: [],
  },
})
