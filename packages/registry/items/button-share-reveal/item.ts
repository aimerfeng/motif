import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'button-share-reveal',
  status: 'published',
  title: { 'zh-CN': '分享展开按钮', en: 'Share Reveal Button' },
  summary: {
    'zh-CN': '悬停或聚焦时，「分享」按钮淡出，一排分享目标从左侧依次滑出；点选时图标轻轻一缩。适合文章结尾、商品页和邀请流程。',
    en: 'On hover or focus the Share button fades out and a row of share targets slides in with a stagger; the chosen icon gives a small press pulse. For article footers, product pages and invite flows.',
  },
  kind: 'component',
  category: 'button',
  tags: ['share', 'button', 'reveal', 'stagger', 'social'],
  runtime: ['react', 'motion'],
  entry: { file: 'button-share-reveal.tsx', export: 'ShareRevealButton' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'button-share-reveal.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '按钮文案', en: 'Label' }, default: 'Share', maxLength: 14 },
    { key: 'targets', type: 'number', group: 'content', label: { 'zh-CN': '分享目标数', en: 'Targets' }, default: 4, min: 2, max: 5, step: 1, safe: [3, 5] },
    {
      key: 'tone',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '色调', en: 'Tone' },
      default: 'mono',
      options: [
        { value: 'mono', label: { 'zh-CN': '黑白反色', en: 'Mono' } },
        { value: 'primary', label: { 'zh-CN': '主题色', en: 'Primary' } },
      ],
    },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 6, min: 0, max: 20, step: 1, unit: 'px', safe: [4, 12] },
    { key: 'iconSize', type: 'number', group: 'look', label: { 'zh-CN': '图标大小', en: 'Icon size' }, default: 16, min: 14, max: 20, step: 1, unit: 'px' },
    { key: 'duration', type: 'number', group: 'motion', label: { 'zh-CN': '展开时长', en: 'Duration' }, default: 0.3, min: 0.15, max: 0.6, step: 0.05, unit: 's' },
    { key: 'stagger', type: 'number', group: 'motion', label: { 'zh-CN': '错开间隔', en: 'Stagger' }, default: 0.05, min: 0, max: 0.12, step: 0.01, unit: 's' },
  ],
  presets: [
    { id: 'ink', name: { 'zh-CN': '墨', en: 'Ink' }, values: { tone: 'mono', radius: 6, stagger: 0.05 } },
    { id: 'pill-cascade', name: { 'zh-CN': '瀑落胶囊', en: 'Pill Cascade' }, values: { tone: 'primary', radius: 20, stagger: 0.08, duration: 0.4, targets: 5 } },
    { id: 'snap', name: { 'zh-CN': '利落', en: 'Snap' }, values: { tone: 'mono', radius: 0, stagger: 0.02, duration: 0.2, targets: 3 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.8, posterTime: 2, loop: 4 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kokonutui',
      repo: 'kokonut-labs/kokonutui',
      sha: '83eec6d982d400a18438001a8efdbac1f159dd43',
      paths: ['components/kokonutui/social-button.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 kokonutUI'],
    },
    modifications: [
      'Replaced lucide brand icons (Twitter, Instagram, LinkedIn) with generic inline SVG share targets (send, email, message, QR, copy link) and the shadcn Button with a native button.',
      'Exposed label, target count, tone, radius, icon size, duration and stagger as parameters; colors use theme tokens.',
      'The click pulse is keyed on a counter instead of a setTimeout reset; the row also opens on keyboard focus, with aria-expanded, a labelled group and focus-visible rings.',
      'An optional open prop lets the demo autoplay drive the reveal; reduced motion removes the slide and stagger.',
      'cn now comes from motif-runtime.',
    ],
    assets: [],
  },
})
