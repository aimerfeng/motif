import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'ai-feedback-bar',
  status: 'published',
  title: { 'zh-CN': '回答反馈条', en: 'Answer Feedback Bar' },
  summary: {
    'zh-CN': '挂在回答下面的一条「这个回答有帮助吗？」：点赞会弹一下并道谢，点踩会展开几个原因标签和一个可选的评论框，提交后安静地显示感谢。适合 AI 回答、帮助中心文章和文档页。',
    en: 'An inline "Was this helpful?" bar under an answer: thumbs up pops and says thanks, thumbs down unfolds reason chips and an optional comment, and either path settles into a quiet confirmation. For AI answers, help-center articles and docs pages.',
  },
  kind: 'component',
  category: 'chat',
  tags: ['feedback', 'ai', 'chat', 'thumbs', 'rating', 'helpful', 'docs'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'ai-feedback-bar.tsx', export: 'AiFeedbackBar' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'ai-feedback-bar.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'title', type: 'text', group: 'content', label: { 'zh-CN': '提问文案', en: 'Title' }, default: 'Was this response helpful?', maxLength: 40 },
    { key: 'reasons', type: 'text', group: 'content', label: { 'zh-CN': '原因标签', en: 'Reasons' }, hint: { 'zh-CN': '用英文逗号分隔，最多 6 个', en: 'Comma-separated, up to 6' }, default: 'Inaccurate, Not what I asked, Too long, Outdated', maxLength: 120 },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#a78bfa' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 4, max: 20, step: 1, unit: 'px', safe: [8, 16] },
    { key: 'allowComment', type: 'boolean', group: 'interaction', label: { 'zh-CN': '评论框', en: 'Comment field' }, default: true },
    { key: 'dismissible', type: 'boolean', group: 'interaction', label: { 'zh-CN': '关闭按钮', en: 'Close button' }, default: true },
    { key: 'celebrate', type: 'boolean', group: 'motion', label: { 'zh-CN': '点赞弹跳', en: 'Thumbs-up pop' }, default: true },
  ],
  presets: [
    { id: 'lilac', name: { 'zh-CN': '丁香', en: 'Lilac' }, values: { accent: '#a78bfa', radius: 12 } },
    { id: 'mint', name: { 'zh-CN': '薄荷', en: 'Mint' }, values: { accent: '#34d399', radius: 16, title: 'Did this answer your question?' } },
    { id: 'paper', name: { 'zh-CN': '纸页', en: 'Paper' }, values: { accent: '#f5f5f4', radius: 6, celebrate: false, title: 'Was this page helpful?', reasons: 'Unclear, Missing steps, Wrong example' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'crossfade' },
  capture: { zoom: 1.7, posterTime: 4.8, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'prompt-kit',
      repo: 'ibelick/prompt-kit',
      sha: '5a9496635cc0e1bf7679fe2a9e35d9b36b99c08a',
      paths: ['components/prompt-kit/feedback-bar.tsx', 'app/docs/feedback-bar/feedback-bar-basic.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Julien Thibeaut'],
    },
    modifications: [
      'Kept the upstream bar markup and classes (title, thumbs up / down, bordered close button); lucide icons replaced with inline SVG and cn from @motif/runtime.',
      'Added a reason-chip step with an optional comment and a send button after thumbs down, a thank-you state after either path, and a small thumbs-up pop.',
      'Added accent, radius, title, reasons and toggle params, readable ink on the accent chosen by luminance, focus-visible rings, and reduced-motion fades.',
      'Demo based on the upstream basic example, driven by useFrameLoop autoplay.',
    ],
    assets: [],
  },
})
