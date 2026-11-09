import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'whats-new-popover',
  status: 'published',
  title: { 'zh-CN': '更新日志浮层', en: "What's New Popover" },
  summary: {
    'zh-CN': '带呼吸红点的「What’s new?」入口，悬停或点击弹出一张版本卡：版本号、标签、日期和一段说明，左右翻页从最新看起，下方小圆点标出位置。适合应用顶栏和帮助菜单。',
    en: "A dashed “What's new?” trigger with a pulsing dot opens a release card: version, tag, date and a short note, paging left and right from the latest, with page dots below. For app headers and help menus.",
  },
  kind: 'component',
  category: 'popover',
  tags: ['popover', 'hover card', 'changelog', 'release notes', 'pagination', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'whats-new-popover.tsx', export: 'WhatsNewPopover' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'whats-new-popover.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#60a5fa' },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '卡片宽度', en: 'Card width' }, default: 288, min: 248, max: 336, step: 4, unit: 'px', safe: [264, 320] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 10, min: 0, max: 20, step: 1, unit: 'px', safe: [6, 14] },
    {
      key: 'openOn',
      type: 'select',
      group: 'interaction',
      label: { 'zh-CN': '打开方式', en: 'Open on' },
      default: 'hover',
      options: [
        { value: 'hover', label: { 'zh-CN': '悬停', en: 'Hover' } },
        { value: 'click', label: { 'zh-CN': '点击', en: 'Click' } },
      ],
    },
    {
      key: 'pageTransition',
      type: 'select',
      group: 'motion',
      label: { 'zh-CN': '翻页动效', en: 'Page transition' },
      default: 'slide',
      options: [
        { value: 'slide', label: { 'zh-CN': '滑动', en: 'Slide' } },
        { value: 'fade', label: { 'zh-CN': '淡入', en: 'Fade' } },
        { value: 'none', label: { 'zh-CN': '无', en: 'None' } },
      ],
    },
    { key: 'showDot', type: 'boolean', group: 'look', label: { 'zh-CN': '提示红点', en: 'Pulsing dot' }, default: true },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹出弹簧', en: 'Open spring' }, default: { visualDuration: 0.25, bounce: 0.1 } },
  ],
  presets: [
    { id: 'harbor', name: { 'zh-CN': '港湾', en: 'Harbor' }, values: { accent: '#60a5fa', radius: 10, pageTransition: 'slide', spring: { visualDuration: 0.25, bounce: 0.1 } } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#fb923c', radius: 16, pageTransition: 'fade', spring: { visualDuration: 0.35, bounce: 0.25 } } },
    { id: 'ledger', name: { 'zh-CN': '账簿', en: 'Ledger' }, values: { accent: '#a3e635', radius: 2, pageTransition: 'none', spring: { visualDuration: 0.18, bounce: 0 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.8, posterTime: 2.6, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: [
        'registry-reui/bases/base/components/hover-card/c-hover-card-8.tsx',
        'registry/bases/base/ui/hover-card.tsx',
        'registry-reui/bases/base/reui/badge.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      'The base-ui PreviewCard (hover card) was replaced by a small hand-rolled popover: hover with 100/200 ms open/close delays or click, focus opens it, Esc and clicking outside close it; the card is a labelled dialog animated with motion/react.',
      'Badge and Button were inlined as small styled spans and buttons; IconPlaceholder arrows became inline SVG.',
      'Added a pulsing dot on the trigger, an animated page transition (slide/fade/none), arrow-key paging and an optional changelog link; releases, open and page can be passed as props.',
      'Added accent, width, radius, open mode, page transition, dot and spring params; reduced motion disables the pulse and page motion.',
    ],
    assets: [],
  },
})
