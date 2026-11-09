import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'features-chart-stack',
  status: 'published',
  title: { 'zh-CN': '散开的图表卡片堆', en: 'Fanning Chart Cards' },
  summary: {
    'zh-CN': '标题下叠着三张仪表盘卡片：组合图、带标记的分段条和面积图，四角有螺丝钉圆点；鼠标移上去卡片带着弹性旋转散开。适合在落地页里俏皮地展示分析类产品。',
    en: 'A headline over three stacked dashboard cards with screw-dot corners — a combo chart, a segmented bar with a marker and an area chart. Hovering fans them apart with a springy rotate. A playful way to show an analytics product on a landing page.',
  },
  kind: 'section',
  category: 'features',
  tags: ['features', 'analytics', 'charts', 'cards', 'hover', 'tremor'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'features-chart-stack.tsx', export: 'FeaturesChartStack' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'features-chart-stack.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'eyebrow', type: 'text', label: { 'zh-CN': '眉标', en: 'Eyebrow' }, default: 'Analytics', maxLength: 24, group: 'content' },
    { key: 'headline', type: 'text', label: { 'zh-CN': '标题', en: 'Headline' }, default: 'Insights made for everyone', maxLength: 48, group: 'content' },
    { key: 'accent', type: 'color', label: { 'zh-CN': '主数据色', en: 'Primary series' }, default: '#3b82f6', group: 'look' },
    { key: 'secondary', type: 'color', label: { 'zh-CN': '次数据色', en: 'Secondary series' }, default: '#f59e0b', group: 'look' },
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
    { key: 'fanAngle', type: 'number', label: { 'zh-CN': '散开角度', en: 'Fan angle' }, hint: { 'zh-CN': '最后一张卡片的旋转角度，其余两张为一半', en: 'Rotation of the back card; the other two turn half as far' }, default: 6, min: 0, max: 12, step: 0.5, unit: 'deg', safe: [4, 9], group: 'motion' },
    { key: 'spread', type: 'number', label: { 'zh-CN': '散开距离', en: 'Spread' }, default: 1, min: 0.5, max: 1.5, step: 0.05, unit: 'x', group: 'motion' },
    { key: 'spring', type: 'spring', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.35, bounce: 0.35 }, group: 'motion' },
  ],
  presets: [
    { id: 'night-shift', name: { 'zh-CN': '夜班', en: 'Night shift' }, values: { tone: 'dark', accent: '#3b82f6', secondary: '#f59e0b' } },
    { id: 'ledger', name: { 'zh-CN': '账簿', en: 'Ledger' }, values: { tone: 'light', accent: '#10b981', secondary: '#6366f1', fanAngle: 4, spring: { visualDuration: 0.4, bounce: 0.15 } } },
    { id: 'confetti', name: { 'zh-CN': '撒花', en: 'Confetti' }, values: { tone: 'dark', accent: '#ec4899', secondary: '#22d3ee', fanAngle: 9, spread: 1.25, spring: { visualDuration: 0.45, bounce: 0.5 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { posterTime: 2.4, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'tremor-blocks',
      repo: 'tremorlabs/tremor-blocks',
      sha: 'b319e8d3d3678a4f60f4802f7e85bc1abc52d598',
      paths: ['src/content/components/feature-sections/feature-section-05.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Tremor Labs, Inc.'],
    },
    modifications: [
      'Recharts-based AreaChart and ComboChart and the CategoryBar replaced with small hand-written SVG charts using the same data, axes and legends.',
      'CSS group-hover transitions on top/rotate/scale replaced with motion springs on transform; the stack can also be fanned through a controlled prop.',
      'Added eyebrow, headline, primary/secondary series colors, tone, fan angle, spread and spring params; the area chart second series uses the secondary color.',
      'Reduced motion jumps between states without animating.',
    ],
    assets: [],
  },
})
