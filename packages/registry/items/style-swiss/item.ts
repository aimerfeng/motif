import { defineItem } from '@motif/schema'

const option = (value: string, zh: string, en: string) => ({ value, label: { 'zh-CN': zh, en } })

export default defineItem({
  schemaVersion: 1,
  slug: 'style-swiss',
  status: 'published',
  title: { 'zh-CN': '瑞士国际主义', en: 'Swiss' },
  summary: {
    'zh-CN': '12 栏严格网格、Radix 十二级灰阶加一个强调色、左对齐的紧凑无衬线大标题，用线而不是色块分区，没有阴影和渐变。可以叠加栏线。适合设计工作室、研究机构、出版物、文档和任何想要清晰和秩序的产品。',
    en: 'A strict twelve-column grid, the Radix twelve-step grey scale and one accent, flush-left tight grotesk headlines, sections divided by rules instead of colour blocks, no shadows and no gradients. Optional column overlay. For studios, institutions, publications, documentation and anything that wants clarity and order.',
  },
  kind: 'style',
  category: 'minimal',
  tags: ['swiss', 'international style', 'grid', 'grotesk', 'minimal', 'typographic', 'radix colors'],
  runtime: ['react', 'css'],
  entry: { file: 'style-swiss.tsx', export: 'StyleSwiss' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'style-swiss.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '整个页面只有这一种颜色', en: 'The only colour on the page' }, default: '#e5484d' },
    { key: 'radius', type: 'number', group: 'shape', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 0, min: 0, max: 6, step: 1, unit: 'px', safe: [0, 4] },
    { key: 'borderWidth', type: 'number', group: 'shape', label: { 'zh-CN': '线条粗细', en: 'Rule weight' }, hint: { 'zh-CN': '粗线是它的 3 倍', en: 'Thick rules are three times this' }, default: 1, min: 1, max: 2, step: 0.5, unit: 'px', safe: [1, 2] },
    { key: 'showGrid', type: 'boolean', group: 'layout', label: { 'zh-CN': '显示栏线', en: 'Show column overlay' }, hint: { 'zh-CN': '叠加 12 栏参考线，用来对齐内容', en: 'Overlay the 12 columns to check alignment' }, default: true },
    {
      key: 'fontPairing',
      type: 'select',
      group: 'type',
      label: { 'zh-CN': '字体搭配', en: 'Font pairing' },
      default: 'grotesk',
      options: [option('grotesk', 'Space Grotesk + Inter Tight', 'Space Grotesk + Inter Tight'), option('neutral', 'Inter Tight（单一字族）', 'Inter Tight (one family)'), option('geist', 'Geist + Geist Mono', 'Geist + Geist Mono'), option('plex', 'IBM Plex Sans + Mono', 'IBM Plex Sans + Mono')],
    },
    { key: 'dark', type: 'boolean', group: 'look', label: { 'zh-CN': '深色', en: 'Dark' }, default: false },
  ],
  presets: [
    { id: 'zurich', name: { 'zh-CN': '苏黎世', en: 'Zürich' }, values: { accent: '#e5484d', radius: 0, borderWidth: 1, showGrid: true, fontPairing: 'grotesk', dark: false } },
    { id: 'basel', name: { 'zh-CN': '巴塞尔', en: 'Basel' }, values: { accent: '#0090ff', radius: 0, borderWidth: 1.5, showGrid: false, fontPairing: 'neutral', dark: false } },
    { id: 'signal', name: { 'zh-CN': '信号橙', en: 'Signal' }, values: { accent: '#ff6a1a', radius: 0, borderWidth: 1, showGrid: true, fontPairing: 'geist', dark: true } },
    { id: 'archive', name: { 'zh-CN': '档案', en: 'Archive' }, values: { accent: '#30a46c', radius: 2, borderWidth: 1, showGrid: false, fontPairing: 'plex', dark: false } },
  ],
  dependencies: ['@motif/runtime'],
  fonts: ['Space Grotesk Variable', 'Inter Tight Variable', 'Geist Variable', 'Geist Mono Variable', 'IBM Plex Sans Variable', 'IBM Plex Mono'],
  guidance: {
    use: [
      'Use for design studios and portfolios, research and cultural institutions, publications, documentation, dashboards that value density and order, and any brand that wants to feel rigorous.',
      'Avoid for playful or emotional products; the style is deliberately impersonal.',
    ],
    rules: [
      'Everything sits on a twelve-column grid inside a 1200px container with 24px gutters and margins (12px and 16px under 640px). Every block spans whole columns; use the column overlay to check. Text starts on a column edge, never floats between columns.',
      'Palette is the Radix gray scale (steps 1 to 12, light or dark) plus exactly one accent colour. Step 1 is the page, 3 is a filled panel, 6 is a soft rule, 11 is muted text, 12 is text, rules and the primary button. The accent appears at most once or twice per screen: a link, a primary action, one shape.',
      'Structure comes from rules, not boxes. Every section opens with a thick rule (3x the rule weight) in step 12, with a numbered mono label "(02) Colour" in columns 1 to 3 and the title in columns 4 to 12. Rows inside a section are separated by 1px soft rules.',
      'Type: one grotesk family. Display at 600 weight, -0.045em tracking, line height 0.92, flush left, ragged right, sized big (hero 96 to 134px). Headings 600, -0.035em. Body 15 to 18px at line height 1.4 to 1.5, muted step 11 for secondary copy. Labels in mono, 11px, uppercase, +6% tracking. Sizes follow a scale (11, 15, 18, 28, 48, 96) and skip nothing arbitrary.',
      'Asymmetry is the composition: text in the right nine columns, labels in the left three; a large flat geometric shape (a circle or a square) in accent colour is the only illustration. No photography effects, no icons beyond arrows.',
      'No shadows, no gradients, no blur, no rounded pills. Radius is 0 (up to 4px at most). Depth is expressed with fills of gray step 3 or a solid step 12 panel.',
      'Buttons are rectangles: step 12 fill with step 1 text, the label left and an arrow right; hover switches the fill to the accent. The single most important button per view uses the accent fill and turns black on hover. Text links are underlined by a 1px rule and turn accent on hover.',
      'Inputs are step 3 fills with only a bottom rule; on focus the rule turns accent and doubles in weight. Tabs are plain text with a thick accent underline that slides.',
      'Motion is minimal and mechanical: 160 to 220ms with ease-in-out, only colour, background and the tab underline move. No bounce, no fades on scroll. Respect prefers-reduced-motion.',
      'Forbidden: more than one accent colour, coloured status backgrounds (use solid, outline or accent badges), box shadows, gradients, centred body text, decorative icons, emoji.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'radix-colors',
      repo: 'radix-ui/colors',
      sha: 'dbdb85470547c7d34b9001f48fddb08ded335979',
      paths: ['src/light.ts', 'src/dark.ts'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2021-2022 Modulz', 'Copyright (c) 2022-Present WorkOS'],
    },
    modifications: [
      'The twelve-step gray scale (light "gray" and dark "grayDark") is used unchanged; the default red accent is the Radix red 9 value.',
      'The grid system, column overlay, typographic scale, rules, primitives and style sheet are original Motif work; no upstream component code is included.',
    ],
    assets: [],
  },
})
