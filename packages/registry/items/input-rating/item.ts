import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'input-rating',
  status: 'published',
  title: { 'zh-CN': '评分', en: 'Rating' },
  summary: {
    'zh-CN': '悬停时图标一路亮到指针位置并轻轻鼓起，点击后被选中的图标像波浪一样依次弹起。星星、爱心、闪电三种图标，可选半星。适合评价表单、反馈弹窗和商品页。',
    en: 'Icons light up to the pointer and swell on hover; on click the chosen icons pop one after another like a wave. Star, heart and bolt shapes with optional half steps. Made for review forms, feedback prompts and product pages.',
  },
  kind: 'component',
  category: 'input',
  tags: ['rating', 'stars', 'review', 'feedback', 'slider', 'a11y', 'spring'],
  runtime: ['react', 'motion'],
  entry: { file: 'input-rating.tsx', export: 'InputRating' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'input-rating.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'icon',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '图标', en: 'Icon' },
      default: 'star',
      options: [
        { value: 'star', label: { 'zh-CN': '星星', en: 'Star' } },
        { value: 'heart', label: { 'zh-CN': '爱心', en: 'Heart' } },
        { value: 'bolt', label: { 'zh-CN': '闪电', en: 'Bolt' } },
      ],
    },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '颜色', en: 'Color' }, default: '#fbbf24' },
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '图标尺寸', en: 'Icon size' }, default: 40, min: 24, max: 64, step: 1, unit: 'px', safe: [30, 52] },
    { key: 'count', type: 'number', group: 'layout', label: { 'zh-CN': '数量', en: 'Count' }, default: 5, min: 3, max: 10, step: 1, safe: [3, 7] },
    { key: 'allowHalf', type: 'boolean', group: 'interaction', label: { 'zh-CN': '允许半星', en: 'Allow half steps' }, default: false },
    { key: 'gap', type: 'number', group: 'layout', label: { 'zh-CN': '间距', en: 'Gap' }, default: 6, min: 0, max: 20, step: 1, unit: 'px', safe: [2, 12] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.3, bounce: 0.5 } },
  ],
  presets: [
    { id: 'gold-stars', name: { 'zh-CN': '金星', en: 'Gold Stars' }, values: { icon: 'star', color: '#fbbf24', size: 40, count: 5 } },
    { id: 'rose-hearts', name: { 'zh-CN': '玫瑰心', en: 'Rose Hearts' }, values: { icon: 'heart', color: '#fb7185', size: 42, allowHalf: true, gap: 8, spring: { visualDuration: 0.4, bounce: 0.6 } } },
    { id: 'volt', name: { 'zh-CN': '电光', en: 'Volt' }, values: { icon: 'bolt', color: '#a3e635', size: 36, count: 5, gap: 4, spring: { visualDuration: 0.2, bounce: 0.2 } } },
    { id: 'quiet-ten', name: { 'zh-CN': '十分制', en: 'Quiet Ten' }, values: { icon: 'star', color: '#e4e4e7', size: 28, count: 10, gap: 3, spring: { visualDuration: 0.25, bounce: 0.3 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use for collecting a 1 to N opinion (reviews, feedback, difficulty). For read-only display of an average pass readOnly.'],
    rules: [
      'The component is one role="slider" (not N buttons): arrows step, Home clears, End maxes. Announce the meaning next to it (for example "Loved it") in visible text, not only color.',
      'Clicking the current value clears the rating. Keep count between 3 and 10.',
      'Controlled: value + onValueChange. Uncontrolled: defaultValue.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.8, posterTime: 5.3, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kibo',
      repo: 'shadcnblocks/kibo',
      sha: '3d63cdb15b79d972e3dc38a10997987672f9b263',
      paths: ['packages/rating/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 — Present shadcnblocks'],
    },
    modifications: [
      'Dropped radix use-controllable-state and lucide icons; state is plain React and the star, heart and bolt shapes are inline SVG paths.',
      'Replaced per-icon buttons with one role="slider" element so screen readers announce "3 of 5" and the arrow keys behave like a native slider; pointer position picks the value, with optional half steps.',
      'Added hover preview scaling, a staggered pop wave on selection, a glow on lit icons and parameters for icon, color, size, count, gap and spring. A hoverValue prop lets the demo autoplay show the preview.',
    ],
    assets: [],
  },
})
