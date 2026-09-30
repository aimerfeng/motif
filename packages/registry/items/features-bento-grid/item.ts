import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'features-bento-grid',
  status: 'published',
  title: { 'zh-CN': '便当格功能区', en: 'Bento Feature Grid' },
  summary: {
    'zh-CN': '五张大小不一的功能卡拼成便当格，每张卡里都是用 JSX 画的迷你产品界面：多人光标、命令面板、差异对比、集成图标、柱状图。',
    en: 'Five feature cards of different sizes in a bento layout, each holding a miniature product UI drawn in JSX: live cursors, a command palette, a diff, integration tiles and a bar chart.',
  },
  kind: 'section',
  category: 'features',
  tags: ['features', 'bento', 'grid', 'cards', 'product ui', 'saas'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'features-bento-grid.tsx', export: 'FeaturesBentoGrid' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'features-bento-grid.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'eyebrow', type: 'text', label: { 'zh-CN': '小标签', en: 'Eyebrow' }, default: 'Why teams switch', maxLength: 28, group: 'content' },
    { key: 'heading', type: 'text', label: { 'zh-CN': '标题', en: 'Heading' }, default: 'One workspace for the whole decision trail', maxLength: 64, group: 'content' },
    {
      key: 'subline',
      type: 'text',
      label: { 'zh-CN': '副标题', en: 'Subline' },
      default: 'Docs, comments and history live together, so nobody has to ask where that call was made.',
      maxLength: 140,
      group: 'content',
    },
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent color' }, default: '#8b7bff', group: 'look' },
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
      label: { 'zh-CN': '标题字体', en: 'Heading font' },
      default: 'geist',
      options: [
        { value: 'geist', label: { 'zh-CN': 'Geist 无衬线', en: 'Geist sans' } },
        { value: 'grotesk', label: { 'zh-CN': 'Space Grotesk', en: 'Space Grotesk' } },
        { value: 'serif', label: { 'zh-CN': 'Instrument 衬线', en: 'Instrument serif' } },
      ],
      group: 'look',
    },
    { key: 'radius', type: 'number', label: { 'zh-CN': '卡片圆角', en: 'Card radius' }, default: 22, min: 0, max: 36, step: 1, unit: 'px', safe: [8, 30], group: 'look' },
    {
      key: 'layout',
      type: 'select',
      label: { 'zh-CN': '排布', en: 'Arrangement' },
      default: 'bento',
      options: [
        { value: 'bento', label: { 'zh-CN': '大卡在左', en: 'Wide card first' } },
        { value: 'mirrored', label: { 'zh-CN': '大卡在右', en: 'Wide card second' } },
      ],
      group: 'layout',
    },
  ],
  presets: [
    { id: 'lilac', name: { 'zh-CN': '丁香', en: 'Lilac' }, values: {} },
    { id: 'lime-press', name: { 'zh-CN': '青柠印刷', en: 'Lime Press' }, values: { accent: '#b6f03c', font: 'grotesk', radius: 12, layout: 'mirrored' } },
    { id: 'paperwork', name: { 'zh-CN': '文书', en: 'Paperwork' }, values: { tone: 'light', accent: '#2563eb', font: 'serif', radius: 28 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable', 'Space Grotesk Variable', 'Instrument Serif'],
  guidance: {
    rules: [
      'Each card is one idea: a short title, one sentence, and a small live-looking UI. Do not add screenshots or stock photos.',
      'Keep one wide card per row of the bento; the rest span two columns so the grid stays balanced.',
      'Card visuals use the accent color for the single thing to look at; everything else stays neutral.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { scroll: true, posterTime: 1.4, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'eldoraui',
      repo: 'karthikmudunuri/eldoraui',
      sha: '6bb8fd211ecbdfa983f5780bead27d9f3890f20a',
      paths: ['apps/www/registry/blocks/bento-01/page.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Mudunuri Bhaskara Karthikeya Varma'],
    },
    modifications: [
      'Kept the bento layout idea (mixed-span cards, each with a small live visual); all card content, visuals and copy are new and drawn in JSX/SVG.',
      'Replaced lucide icons and any images with inline SVG and gradient-initial avatars; the integration tiles are invented glyphs, not real brand logos.',
      'Added tone, accent, heading font, card radius and mirrored arrangement params; entrance and cursor animations are dropped when reduced motion is preferred.',
    ],
    assets: [],
  },
})
