import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'changelog-timeline',
  status: 'published',
  title: { 'zh-CN': '更新日志时间线', en: 'Changelog Timeline' },
  summary: {
    'zh-CN': '版本号与日期、标签、要点清单和自绘线框插图，可切换为带节点的竖轴。适合产品官网的「更新日志」页。',
    en: 'Release notes with version and date, tags, a checklist of changes and hand-drawn wireframe art. Switch to a node rail for a more timeline feel. Made for a product changelog page.',
  },
  kind: 'section',
  category: 'changelog',
  tags: ['changelog', 'timeline', 'release notes', 'product updates'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'changelog-timeline.tsx', export: 'ChangelogTimeline' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'changelog-timeline.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#7c8cff', group: 'look' },
    {
      key: 'font',
      type: 'select',
      label: { 'zh-CN': '标题字体', en: 'Heading font' },
      default: 'serif',
      options: [
        { value: 'serif', label: { 'zh-CN': '衬线（Instrument Serif）', en: 'Serif (Instrument Serif)' } },
        { value: 'sans', label: { 'zh-CN': '无衬线（Geist）', en: 'Sans (Geist)' } },
        { value: 'grotesk', label: { 'zh-CN': '几何（Space Grotesk）', en: 'Grotesk (Space Grotesk)' } },
      ],
      group: 'look',
    },
    {
      key: 'layout',
      type: 'select',
      label: { 'zh-CN': '版式', en: 'Layout' },
      default: 'split',
      options: [
        { value: 'split', label: { 'zh-CN': '左右分栏', en: 'Split' } },
        { value: 'rail', label: { 'zh-CN': '竖轴节点', en: 'Rail' } },
      ],
      group: 'layout',
    },
    { key: 'entries', type: 'number', label: { 'zh-CN': '条目数', en: 'Entries' }, default: 4, min: 2, max: 5, step: 1, group: 'content' },
    { key: 'heading', type: 'text', label: { 'zh-CN': '标题', en: 'Heading' }, default: 'What’s new in Halcyon', maxLength: 36, group: 'content' },
    { key: 'subheading', type: 'text', label: { 'zh-CN': '副标题', en: 'Subheading' }, default: 'Release notes for every shipped change, newest first.', maxLength: 90, group: 'content' },
    { key: 'showVisuals', type: 'boolean', label: { 'zh-CN': '显示插图', en: 'Show illustrations' }, default: true, group: 'layout' },
    { key: 'animate', type: 'boolean', label: { 'zh-CN': '入场动画', en: 'Entrance animation' }, default: true, group: 'motion' },
  ],
  presets: [
    { id: 'nocturne', name: { 'zh-CN': '夜曲', en: 'Nocturne' }, values: { accent: '#7c8cff', font: 'serif', layout: 'split' } },
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { accent: '#34d399', font: 'grotesk', layout: 'rail', showVisuals: false, entries: 5 } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#fb923c', font: 'sans', layout: 'rail', entries: 3 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable', 'Geist Mono Variable', 'Instrument Serif', 'Space Grotesk Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    use: ['Use for a product changelog or release-notes page. Entries are plain data (version, date, tags, notes); replace the ENTRIES array with real releases.'],
    rules: ['Keep the illustrations abstract wireframes. Never ship screenshots or real product logos inside a changelog entry template.'],
  },
  capture: { scroll: true, posterTime: 1.6, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uitripled',
      repo: 'moumen-soliman/uitripled',
      sha: '05d18376db775072ed61d0cab8ea184f8f527429',
      paths: ['packages/components/react-shadcn/src/components/sections/glassmorphism-product-update-block.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2026 uitripled'],
    },
    modifications: [
      'Re-composed the product-update card into a full changelog page with invented release notes, tags and a sticky version column.',
      'Added a rail layout, a heading-font select and five hand-drawn SVG wireframe illustrations.',
      'framer-motion replaced by motion/react; icons are inline SVG; reduced motion disables the entrance.',
    ],
    assets: [],
  },
})
