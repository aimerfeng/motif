import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'features-isometric-cards',
  status: 'published',
  title: { 'zh-CN': '等距线框特性卡', en: 'Isometric Feature Cards' },
  summary: {
    'zh-CN': '三张特性卡，每张顶部是一幅缓缓运动的等距线稿：呼吸的叠层、浮动的节点立方体、起伏的网格曲面，下面是打字机标题和逐词浮现的说明。适合基础设施、API 和开发者平台的特性区块。',
    en: 'Three feature cards, each topped by a slowly moving isometric line drawing (breathing layers, floating node cubes, a rippling mesh) above a typewriter title and a word-by-word description. For infrastructure, API and developer-platform feature sections.',
  },
  kind: 'section',
  category: 'features',
  tags: ['features', 'isometric', 'wireframe', 'canvas', 'infrastructure', 'developer', 'cards'],
  runtime: ['react', 'canvas2d', 'motion'],
  entry: { file: 'features-isometric-cards.tsx', export: 'FeaturesIsometricCards' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'features-isometric-cards.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#34d399', group: 'look' },
    { key: 'speed', type: 'number', label: { 'zh-CN': '速度', en: 'Speed' }, default: 1, min: 0.3, max: 2, step: 0.05, unit: 'x', safe: [0.6, 1.5], group: 'motion' },
    {
      key: 'cardStyle',
      type: 'select',
      label: { 'zh-CN': '卡片边框', en: 'Card border' },
      default: 'gradient',
      options: [
        { value: 'gradient', label: { 'zh-CN': '渐隐描边', en: 'Fading gradient' } },
        { value: 'plain', label: { 'zh-CN': '无描边', en: 'Plain' } },
      ],
      group: 'look',
    },
    { key: 'background', type: 'boolean', label: { 'zh-CN': '背景网格波', en: 'Background wave grid' }, default: true, group: 'look' },
    { key: 'typewriter', type: 'boolean', label: { 'zh-CN': '打字机标题', en: 'Typewriter titles' }, default: true, group: 'motion' },
  ],
  presets: [
    { id: 'diagnostics', name: { 'zh-CN': '诊断台', en: 'Diagnostics' }, values: {} },
    { id: 'coldlink', name: { 'zh-CN': '冷链', en: 'Cold Link' }, values: { accent: '#7dd3fc', speed: 0.7 } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#fb923c', cardStyle: 'plain', background: false } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Inter Tight Variable', 'JetBrains Mono Variable'],
  perf: { webgl: false, maxDpr: 1.5 },
  a11y: { reducedMotion: 'static' },
  capture: { scroll: true, posterTime: 2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'threeui',
      repo: 'MengTo/threeui',
      sha: '68802d5428071ada5c20db8094b1649e6bb770ed',
      paths: ['src/shaders/neuform-isolated/sources/diagnostics-panel.html'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2026 Meng To'],
      origin: 'Neuform export',
    },
    modifications: [
      'Ported the standalone HTML page to a React component; markup and Tailwind classes kept, Tailwind CDN replaced by Tailwind v4.',
      'All requestAnimationFrame loops (background wave grid, three isometric canvases, shooting lines) and the setTimeout typewriter run on one motif-runtime frame loop; reduced motion renders a static frame.',
      'GSAP ScrollTrigger word reveal replaced by a motion mount animation; iconify icons replaced by inline SVG; remote background image and Google Fonts removed.',
      'The accent colour, speed, border style, background grid and typewriter are params; small horizontal padding added on mobile.',
    ],
    assets: [],
  },
})
