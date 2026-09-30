import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'tabs-animated',
  status: 'published',
  title: { 'zh-CN': '滑动指示选项卡', en: 'Animated Tabs' },
  summary: {
    'zh-CN': '选中的指示器像弹簧一样滑到新标签，下方面板按切换方向滑入。下划线、胶囊、分段三种样式，方向键、Home、End 全键盘可用。适合设置页、详情页和仪表盘的分区导航。',
    en: 'A spring-driven indicator glides to the next tab while the panel slides in from the direction you moved. Underline, pill and segment styles, fully keyboard-driven. Made for settings pages, detail views and dashboards.',
  },
  kind: 'component',
  category: 'tabs',
  tags: ['tabs', 'indicator', 'layout', 'spring', 'a11y', 'keyboard'],
  runtime: ['react', 'motion'],
  entry: { file: 'tabs-animated.tsx', export: 'TabsAnimated' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'tabs-animated.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '样式', en: 'Variant' },
      default: 'underline',
      options: [
        { value: 'underline', label: { 'zh-CN': '下划线', en: 'Underline' } },
        { value: 'pill', label: { 'zh-CN': '胶囊', en: 'Pill' } },
        { value: 'segment', label: { 'zh-CN': '分段', en: 'Segment' } },
      ],
    },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#8b5cf6' },
    {
      key: 'size',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '尺寸', en: 'Size' },
      default: 'md',
      options: [
        { value: 'sm', label: { 'zh-CN': '小', en: 'Small' } },
        { value: 'md', label: { 'zh-CN': '中', en: 'Medium' } },
        { value: 'lg', label: { 'zh-CN': '大', en: 'Large' } },
      ],
    },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, hint: { 'zh-CN': '胶囊和分段样式的圆角', en: 'For pill and segment styles' }, default: 10, min: 4, max: 20, step: 1, unit: 'px', safe: [6, 14] },
    { key: 'stretch', type: 'boolean', group: 'layout', label: { 'zh-CN': '撑满宽度', en: 'Stretch to width' }, default: false },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.3, bounce: 0.12 } },
  ],
  presets: [
    { id: 'violet-line', name: { 'zh-CN': '紫罗兰', en: 'Violet Line' }, values: { variant: 'underline', color: '#8b5cf6', size: 'md' } },
    { id: 'mint-pill', name: { 'zh-CN': '薄荷气泡', en: 'Mint Pill' }, values: { variant: 'pill', color: '#34d399', size: 'md', radius: 12, spring: { visualDuration: 0.4, bounce: 0.3 } } },
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { variant: 'segment', color: '#a1a1aa', size: 'md', radius: 8, stretch: true, spring: { visualDuration: 0.25, bounce: 0.05 } } },
    { id: 'ember-large', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { variant: 'pill', color: '#fb923c', size: 'lg', radius: 20, spring: { visualDuration: 0.45, bounce: 0.35 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use for switching between sibling views of the same object (settings sections, a record\'s detail views). For page navigation prefer real links.'],
    rules: [
      'Pass items as { value, label, icon?, badge?, content? }. Give every item content to get the animated tabpanel, or omit content and render your own panels keyed by the onValueChange value.',
      'Keep it controlled or uncontrolled, not both. The tablist is keyboard-navigable (Arrow keys, Home, End) with automatic activation; do not add extra tabIndex handling.',
      'Labels stay short (one or two words). Do not nest a second tablist inside a panel with the same accent.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.7, posterTime: 3.6, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/animated-tabs/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Kept the shared-layoutId indicator idea and tablist keyboard model; rewrote the styling with an accent color, three sizes and a corner radius parameter.',
      'Added an optional tabpanel with direction-aware slide + blur transitions, item badges, icons, disabled tabs and a stretch layout.',
      'Spring is described by visualDuration + bounce; cn comes from @motif/runtime. With reduced motion the indicator jumps and panels only cross-fade.',
      'Underline indicator gets a soft accent glow; pill and segment use tinted / raised surfaces built on the theme tokens.',
    ],
    assets: [],
  },
})
