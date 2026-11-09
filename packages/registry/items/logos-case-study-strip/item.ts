import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'logos-case-study-strip',
  status: 'published',
  title: { 'zh-CN': '带案例摘要的客户标识', en: 'Logo Strip with Case Snippets' },
  summary: {
    'zh-CN': '一排虚构客户字标，悬停、聚焦或点按其中一个，下方面板就滑出这家客户的核心成果、一句原话和完整案例链接；当前字标点亮、其余变暗，没人操作时慢慢轮播，旁边有暂停按钮，用户一选就停。窄屏下字标排成一行横向滑动。比 Logo 墙多一层可信度的社会证明。',
    en: 'A row of invented customer wordmarks. Hover, focus or tap one and a panel beneath slides to that customer’s headline result, a one-line quote and a link to the full story; the active mark brightens, the rest dim, and the strip cycles slowly when idle, with a pause button, stopping as soon as someone picks a customer. On narrow screens the marks stay in one swipeable row. Social proof that goes past a logo wall.',
  },
  kind: 'section',
  category: 'logos',
  tags: ['logos', 'customers', 'case study', 'social proof', 'testimonial', 'tabs', 'results'],
  runtime: ['react', 'motion', 'css', 'svg'],
  entry: { file: 'logos-case-study-strip.tsx', export: 'LogosCaseStudyStrip' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'logos-case-study-strip.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'heading', type: 'text', label: { 'zh-CN': '标题', en: 'Heading' }, default: 'Five teams, in their own numbers', maxLength: 64, group: 'content' },
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent' }, hint: { 'zh-CN': '成果数字、进度条和色块的颜色，文字深浅会自动适配', en: 'Colors the result, progress line and fills; ink adapts automatically' }, default: '#b8f25c', group: 'look' },
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
      key: 'panelStyle',
      type: 'select',
      label: { 'zh-CN': '案例面板', en: 'Panel style' },
      default: 'card',
      options: [
        { value: 'card', label: { 'zh-CN': '卡片', en: 'Card' } },
        { value: 'split', label: { 'zh-CN': '色块分栏', en: 'Split' } },
        { value: 'minimal', label: { 'zh-CN': '极简', en: 'Minimal' } },
      ],
      group: 'look',
    },
    {
      key: 'logoTone',
      type: 'select',
      label: { 'zh-CN': '当前字标', en: 'Active mark' },
      default: 'mono',
      options: [
        { value: 'mono', label: { 'zh-CN': '单色点亮', en: 'Brighten' } },
        { value: 'accent', label: { 'zh-CN': '主色点亮', en: 'Accent' } },
        { value: 'chip', label: { 'zh-CN': '底块', en: 'Chip' } },
      ],
      group: 'look',
    },
    { key: 'radius', type: 'number', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 18, min: 0, max: 28, step: 1, unit: 'px', safe: [8, 24], group: 'look' },
    { key: 'autoplay', type: 'boolean', label: { 'zh-CN': '空闲时轮播', en: 'Cycle when idle' }, hint: { 'zh-CN': '悬停时暂停；点选某家或键盘聚焦后停下，可用旁边的播放按钮恢复', en: 'Pauses on hover; stops after a pick or keyboard focus, resume with the play button' }, default: true, group: 'motion' },
    { key: 'interval', type: 'number', label: { 'zh-CN': '每家停留', en: 'Time per customer' }, default: 5, min: 4, max: 10, step: 0.5, unit: 's', safe: [4, 8], group: 'motion' },
  ],
  presets: [
    { id: 'night-desk', name: { 'zh-CN': '夜班', en: 'Night Desk' }, values: {} },
    { id: 'broadsheet', name: { 'zh-CN': '晨报', en: 'Broadsheet' }, values: { tone: 'light', accent: '#d9481f', panelStyle: 'minimal', logoTone: 'accent', radius: 4 } },
    { id: 'flare', name: { 'zh-CN': '信号弹', en: 'Flare' }, values: { accent: '#ff7a3d', panelStyle: 'split', logoTone: 'chip', radius: 24, interval: 4 } },
    { id: 'tidewater', name: { 'zh-CN': '潮汐', en: 'Tidewater' }, values: { tone: 'light', accent: '#2f5bea', panelStyle: 'split', logoTone: 'chip', radius: 14, interval: 6 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable', 'Geist Mono Variable', 'Instrument Serif', 'Syne Variable', 'DM Serif Display', 'Archivo Black', 'Fraunces Variable'],
  guidance: {
    use: ['Use below the hero or before pricing when a plain logo wall is not persuasive enough: each mark carries one measured result, one quote and a link to the full case study. Replace CASES with your own customers.'],
    rules: [
      'Never use real company logos or trademarks. The wordmarks are invented; swap in logos you have written permission to show, kept monochrome.',
      'One number per customer, stated with its unit and time frame ("−38% voluntary churn within two quarters"). Do not round up or mix metric types inside one card.',
      'Quotes are one or two sentences in the customer’s own words, attributed to a named person and role. No adjectives like "game-changing".',
      'Keep four to six customers. The strip is a tablist: arrow keys move between marks. Hover pauses the idle cycle; a click, tap, arrow key or keyboard focus stops it until the play button is pressed, so nobody loses the story they are reading.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.15, posterTime: 2.2, loop: 10 },
  provenance: {
    kind: 'original',
    modifications: [],
    assets: [],
  },
})
