import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'ai-approval-card',
  status: 'published',
  title: { 'zh-CN': '审批确认卡', en: 'Approval Card' },
  summary: {
    'zh-CN': '智能体动手之前先来问你：选中的那一项展开铺满卡片，其余选项随之收起消失；危险操作带着自己的警示色。适合编程助手、自动化流程和后台管理的 Copilot。',
    en: 'A human-in-the-loop card an agent shows before it acts: the option you pick expands to fill the card while the alternatives collapse away, and destructive choices carry their own tone. For coding agents, workflow automation and admin copilots.',
  },
  kind: 'component',
  category: 'chat',
  tags: ['ai', 'agent', 'approval', 'human-in-the-loop', 'confirm', 'chat'],
  runtime: ['react', 'motion'],
  entry: { file: 'ai-approval-card.tsx', export: 'AiApprovalCard' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'ai-approval-card.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'question', type: 'text', group: 'content', label: { 'zh-CN': '问题', en: 'Question' }, default: 'How many flavours should we launch?', maxLength: 80 },
    {
      key: 'options',
      type: 'text',
      group: 'content',
      label: { 'zh-CN': '选项', en: 'Options' },
      hint: { 'zh-CN': '用分号分隔，「|」后是说明，开头加「!」表示危险操作，最多 5 个', en: 'Separated by ";", text after "|" is the detail, a leading "!" marks it destructive; up to 5' },
      default: 'Three flavours | core line; Five flavours | full case; Just one hero',
      maxLength: 200,
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '选中底色', en: 'Chosen color' }, default: '#fafafa' },
    { key: 'destructiveTone', type: 'color', group: 'look', label: { 'zh-CN': '危险色', en: 'Destructive tone' }, default: '#f0524f' },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.25, bounce: 0.1 } },
  ],
  presets: [
    { id: 'ledger', name: { 'zh-CN': '账本', en: 'Ledger' }, values: { accent: '#fafafa', destructiveTone: '#f0524f' } },
    { id: 'deploy', name: { 'zh-CN': '发布闸门', en: 'Release Gate' }, values: { question: 'Deploy build 2.14 to production?', options: 'Deploy now | 3 services; Wait for review; !Force-push over main | no rollback', accent: '#34d399', destructiveTone: '#fb923c', spring: { visualDuration: 0.35, bounce: 0.3 } } },
    { id: 'violet', name: { 'zh-CN': '暮紫', en: 'Dusk' }, values: { accent: '#8b5cf6', destructiveTone: '#f43f5e' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: ['Pass `value` to control the decision (null = undecided) or let the card keep its own state; `onDecide` fires once with the chosen option.'],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.6, posterTime: 5, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/ai-approval/index.tsx', 'apps/docs/examples/ai-approval.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Kept the upstream markup, classes, AnimatePresence collapse and stagger; lucide Check replaced with an inline SVG and cn from @motif/runtime.',
      'Question, options (parsed from text), chosen color with luminance-picked ink, destructive tone and spring are params; added a controlled value prop and an items prop.',
      'Added role="group", aria-live on the result and focus-visible rings.',
      'Demo based on the upstream example, driven by a useFrameLoop autoplay.',
    ],
    assets: [],
  },
})
