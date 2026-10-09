import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'flip-grid',
  status: 'published',
  title: { 'zh-CN': '翻转布局', en: 'Flip Grid' },
  summary: {
    'zh-CN': '可筛选、排序、在网格和列表之间切换的作品墙。每次变化时卡片从旧位置平滑飞到新位置，缩略图在两种视图之间变形，被筛掉的卡片原地淡出、其余的立刻补位，带可调的弹簧和错开。缩略图全部是 CSS 渐变。',
    en: 'A work grid you can filter, sort and switch between grid and list. On every change the cards fly from their old spots to the new ones, thumbnails morph between the two views, and filtered-out cards fade in place while the rest close the gap, with an adjustable spring and stagger. Thumbnails are pure CSS gradients.',
  },
  kind: 'component',
  category: 'layout',
  tags: ['flip', 'layout animation', 'filter', 'sort', 'grid', 'list', 'gallery', 'portfolio'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'flip-grid.tsx', export: 'FlipGrid' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'flip-grid.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'heading', type: 'text', group: 'content', label: { 'zh-CN': '标题', en: 'Heading' }, default: 'Selected work', maxLength: 32 },
    {
      key: 'view',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '默认视图', en: 'Default view' },
      default: 'grid',
      options: [
        { value: 'grid', label: { 'zh-CN': '网格', en: 'Grid' } },
        { value: 'list', label: { 'zh-CN': '列表', en: 'List' } },
      ],
    },
    { key: 'columns', type: 'number', group: 'layout', label: { 'zh-CN': '列数', en: 'Columns' }, hint: { 'zh-CN': '宽屏下的网格列数，窄屏固定两列', en: 'Grid columns on wide screens; narrow screens use two' }, default: 4, min: 2, max: 5, step: 1, safe: [3, 4] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 18, min: 0, max: 32, step: 1, unit: 'px', safe: [8, 24] },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#2b59ff' },
    {
      key: 'tone',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '明暗', en: 'Tone' },
      default: 'light',
      options: [
        { value: 'light', label: { 'zh-CN': '浅色', en: 'Light' } },
        { value: 'dark', label: { 'zh-CN': '深色', en: 'Dark' } },
      ],
    },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.5, bounce: 0.18 } },
    { key: 'stagger', type: 'number', group: 'motion', label: { 'zh-CN': '错开', en: 'Stagger' }, hint: { 'zh-CN': '相邻两张卡片晚多久出发', en: 'Delay between neighbouring cards' }, default: 0.025, min: 0, max: 0.08, step: 0.005, unit: 's', safe: [0, 0.05] },
  ],
  presets: [
    { id: 'gallery', name: { 'zh-CN': '画廊', en: 'Gallery' }, values: {} },
    { id: 'studio-night', name: { 'zh-CN': '夜间工作室', en: 'Studio Night' }, values: { tone: 'dark', accent: '#d8ff5c', radius: 10 } },
    { id: 'bouncy', name: { 'zh-CN': '弹跳', en: 'Bouncy' }, values: { spring: { visualDuration: 0.6, bounce: 0.38 }, stagger: 0.045, accent: '#ff5b2e', radius: 26 } },
    { id: 'index', name: { 'zh-CN': '索引', en: 'Index' }, values: { view: 'list', columns: 3, radius: 6, accent: '#111111' } },
  ],
  dependencies: ['@motif/runtime', 'motion/react'],
  fonts: ['Inter Tight Variable', 'Instrument Serif'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    use: ['A portfolio, case-study index, template gallery or any set of 6 to 20 cards that people filter or re-order. The motion is there to show where each card went, not as decoration.'],
    rules: [
      'Keep a stable key per card (project id), never the array index, or the layout animation cannot tell which card moved where.',
      'Filters, sort and view are real buttons with aria-pressed; the component is uncontrolled by default and can be controlled with state and onStateChange.',
      'Removed cards leave with AnimatePresence in popLayout mode, so the remaining cards start moving immediately instead of waiting for the exit.',
      'Elements that change size use layout and set border-radius inline (motion corrects it during the scale); text uses layout="position" so it never stretches.',
      'Under reduced motion every change is instant.',
    ],
  },
  capture: { posterTime: 1.2, loop: 11.2, zoom: 1.2 },
  provenance: { kind: 'original', modifications: [], assets: [] },
})
