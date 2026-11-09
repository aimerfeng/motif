import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'contact-routing-form',
  status: 'published',
  title: { 'zh-CN': '按需分流的联系表单', en: 'Routed Contact Form' },
  summary: {
    'zh-CN': '先分流再提问的「需要什么帮助」：选销售、支持、媒体或合作，下方表单随之换成那个团队真正要问的字段，字段平滑展开收起，同时写明谁来接、多久回复，以及另一条更快的联系方式。适合要给来信分诊的公司联系页。',
    en: 'A “How can we help?” block that routes before it asks: pick Sales, Support, Press or Partnerships and the form below reshapes into the fields that team needs, easing in and out, with who picks it up, how fast they reply and a faster alternative channel. For company contact pages that triage inbound requests.',
  },
  kind: 'section',
  category: 'contact',
  tags: ['contact', 'form', 'routing', 'triage', 'support', 'sales', 'conditional fields', 'radio cards'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'contact-routing-form.tsx', export: 'ContactRoutingForm' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'contact-routing-form.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'heading', type: 'text', label: { 'zh-CN': '标题', en: 'Heading' }, default: 'How can we help?', maxLength: 48, group: 'content' },
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent' }, hint: { 'zh-CN': '按钮文字按亮度自动取深浅；太暗或太亮的主色会被推到可读范围', en: 'Button ink follows the accent’s luminance; accents that are too dark or too light are nudged until they read' }, default: '#ff8a4c', group: 'look' },
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
      default: 'serif',
      options: [
        { value: 'serif', label: { 'zh-CN': '展示衬线（Instrument Serif）', en: 'Display serif (Instrument Serif)' } },
        { value: 'sans', label: { 'zh-CN': '紧凑无衬线（Inter Tight）', en: 'Tight sans (Inter Tight)' } },
        { value: 'grotesk', label: { 'zh-CN': '怪诞体（Bricolage）', en: 'Grotesque (Bricolage)' } },
      ],
      group: 'look',
    },
    {
      key: 'layout',
      type: 'select',
      label: { 'zh-CN': '版式', en: 'Layout' },
      hint: { 'zh-CN': '左右分栏在窄容器里自动叠成一列', en: 'The split layout stacks into one column in narrow containers' },
      default: 'split',
      options: [
        { value: 'split', label: { 'zh-CN': '左右分栏', en: 'Two columns' } },
        { value: 'stacked', label: { 'zh-CN': '居中单栏', en: 'Centered, one column' } },
      ],
      group: 'layout',
    },
    {
      key: 'topicStyle',
      type: 'select',
      label: { 'zh-CN': '话题选择', en: 'Topic picker' },
      default: 'cards',
      options: [
        { value: 'cards', label: { 'zh-CN': '图标卡片', en: 'Icon cards' } },
        { value: 'list', label: { 'zh-CN': '列表', en: 'List rows' } },
        { value: 'tabs', label: { 'zh-CN': '分段控件', en: 'Segmented tabs' } },
      ],
      group: 'layout',
    },
    { key: 'showResponseTime', type: 'boolean', label: { 'zh-CN': '显示回复时效', en: 'Show response time' }, default: true, group: 'content' },
    { key: 'radius', type: 'number', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 14, min: 0, max: 24, step: 1, unit: 'px', safe: [4, 20], group: 'look' },
  ],
  presets: [
    { id: 'dispatch', name: { 'zh-CN': '调度台', en: 'Dispatch' }, values: {} },
    {
      id: 'letterhead',
      name: { 'zh-CN': '信笺', en: 'Letterhead' },
      values: { tone: 'light', accent: '#3155e0', font: 'sans', layout: 'stacked', topicStyle: 'tabs', radius: 10 },
    },
    {
      id: 'night-shift',
      name: { 'zh-CN': '夜班', en: 'Night Shift' },
      values: { tone: 'dark', accent: '#5ee0b8', font: 'grotesk', layout: 'split', topicStyle: 'list', radius: 20 },
    },
    {
      id: 'terracotta',
      name: { 'zh-CN': '陶土', en: 'Terracotta' },
      values: { tone: 'light', accent: '#c4532c', font: 'serif', layout: 'split', topicStyle: 'cards', radius: 4 },
    },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable', 'Geist Mono Variable', 'Instrument Serif', 'Inter Tight Variable', 'Bricolage Grotesque Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    use: [
      'The main block of a company contact page where inbound mail splits across teams (sales, support, press, partnerships). Swap the TOPICS table for your own teams, people, response times and fallback channels (alt.href holds placeholder #anchors; point them at your booking page, status page, press kit and partner guide).',
      'Wire delivery with onSubmit(topic, formData): it runs after native validation passes, and formData carries every field by name plus a hidden topic field. Return a promise to show a sending state; the confirmation appears when it resolves, and a rejection keeps the form filled with an inline error. Without onSubmit nothing leaves the page and the confirmation shows locally.',
    ],
    rules: [
      'Route first, ask second: each topic lists only the rows its team needs in TOPICS[i].rows, and the row() switch renders each row key. Rows shared between topics (identity, message) keep their key so typed text survives a topic switch; only the rows that differ ease in and out.',
      'Every topic states who picks it up, how fast they reply and one faster alternative (call, status page, press kit, partner guide). Keep response times honest and specific; for support, the selected severity changes the promise.',
      'The topic picker is a radiogroup with a roving tab stop (arrow keys, Home, End). Chip and severity choices are native radio inputs, so keep them as inputs if you restyle.',
      'Pass topic and onTopicChange to control the picker from outside, for example to preselect Support from a ?topic= link.',
      'Accent colours only move along OKLCH lightness (hue and as much chroma as fits are kept): fills reach 3:1 against the page, card and footer surfaces, the button ink is white or near-black and reaches 4.5:1 on the fill, and accent text reaches 4.6:1 on every surface it sits on, including the tinted selected row. Any accent reads in both tones and still looks like the colour that was picked.',
      'Focus is handled for keyboard and screen-reader users: buttons show a focus-visible outline, a successful send moves focus to the confirmation heading (described by its body text), and Send another returns focus to the first field. Keep these if you restyle the confirmation.',
    ],
  },
  capture: { scroll: true, zoom: 1.1, posterTime: 1.6, loop: 8 },
  provenance: { kind: 'original', modifications: [], assets: [] },
})
