import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'chat-thread',
  status: 'published',
  title: { 'zh-CN': '聊天会话', en: 'Chat Thread' },
  summary: {
    'zh-CN': '一段完整的聊天记录：同一个人连发的消息归成一组，只有最后一条带小尾巴；表情回应贴在气泡角上，有日期分隔和系统提示、文件附件卡片、正在输入的三个点。往上翻时底部浮出「回到最新」。适合即时通讯、客服和评论串。',
    en: 'A full message thread: consecutive messages group into runs with a tail only on the last bubble, reactions pin to bubble corners, plus day and system markers, file chips and a typing indicator. Scroll up and a "Jump to latest" pill appears. For messaging, support chat and comment threads.',
  },
  kind: 'component',
  category: 'chat',
  tags: ['chat', 'message', 'bubble', 'thread', 'messaging', 'reactions', 'typing'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'chat-thread.tsx', export: 'ChatThread' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'chat-thread.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'bubbleStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '我的气泡', en: 'My bubbles' },
      default: 'default',
      options: [
        { value: 'default', label: { 'zh-CN': '实色', en: 'Solid' } },
        { value: 'tinted', label: { 'zh-CN': '淡彩', en: 'Tinted' } },
        { value: 'secondary', label: { 'zh-CN': '中性', en: 'Secondary' } },
        { value: 'outline', label: { 'zh-CN': '描边', en: 'Outline' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#8b7cf6' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '气泡圆角', en: 'Bubble radius' }, default: 16, min: 6, max: 22, step: 1, unit: 'px', safe: [10, 20] },
    {
      key: 'density',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '密度', en: 'Density' },
      default: 'comfortable',
      options: [
        { value: 'comfortable', label: { 'zh-CN': '舒适', en: 'Comfortable' } },
        { value: 'compact', label: { 'zh-CN': '紧凑', en: 'Compact' } },
      ],
    },
    { key: 'showReactions', type: 'boolean', group: 'layout', label: { 'zh-CN': '表情回应', en: 'Reactions' }, default: true },
    { key: 'showAvatars', type: 'boolean', group: 'layout', label: { 'zh-CN': '头像', en: 'Avatars' }, default: true },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '入场弹簧', en: 'Entrance spring' }, default: { visualDuration: 0.35, bounce: 0.2 } },
    { key: 'autoplay', type: 'boolean', group: 'motion', label: { 'zh-CN': '自动播放', en: 'Autoplay' }, hint: { 'zh-CN': '演示里逐条收到消息', en: 'Messages arrive one by one in the demo' }, default: true },
  ],
  presets: [
    { id: 'violet', name: { 'zh-CN': '暮紫', en: 'Dusk' }, values: { bubbleStyle: 'default', accent: '#8b7cf6', radius: 16, density: 'comfortable' } },
    { id: 'lagoon', name: { 'zh-CN': '泻湖', en: 'Lagoon' }, values: { bubbleStyle: 'tinted', accent: '#22d3ee', radius: 20, density: 'comfortable' } },
    { id: 'ledger', name: { 'zh-CN': '账簿', en: 'Ledger' }, values: { bubbleStyle: 'outline', accent: '#f5f5f4', radius: 8, density: 'compact', showAvatars: false, spring: { visualDuration: 0.25, bounce: 0 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Pass messages as items (message / day / system); consecutive messages from the same author are grouped automatically, so keep author names stable.',
      'The viewport sticks to the bottom only while the reader is at the bottom; do not force-scroll when they have scrolled up.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'crossfade' },
  capture: { posterTime: 7.6, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'shadcn-ui',
      repo: 'shadcn-ui/ui',
      sha: '08ab84f7d1952cc1f36055aa8931213a86b01bbd',
      paths: [
        'apps/v4/registry/new-york-v4/ui/bubble.tsx',
        'apps/v4/registry/new-york-v4/ui/message.tsx',
        'apps/v4/registry/new-york-v4/ui/marker.tsx',
        'apps/v4/registry/new-york-v4/ui/message-scroller.tsx',
        'apps/v4/registry/new-york-v4/ui/attachment.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 shadcn'],
    },
    modifications: [
      'Merged Bubble, Message, Marker, Attachment and MessageScroller into one file, keeping their markup, data-slots and classes; class-variance-authority replaced with lookup maps, radix Slot / asChild removed, cn from @motif/runtime, lucide icons inlined as SVG.',
      'Replaced @shadcn/react message-scroller with a small hand-rolled stick-to-bottom scroller (ResizeObserver + scroll position) and a "Jump to latest" pill; dropped project-specific utilities (scroll-fade, shimmer, scrollbar-*).',
      'Added a ChatThread composition: author runs with a tail on the last bubble, day / system markers, attachment chips, reactions and a motion typing indicator, with spring entrances and reduced-motion fades.',
      'Params for my-bubble style, accent (ink chosen by luminance), bubble radius, density, reactions, avatars and spring; demo driven by useFrameLoop.',
    ],
    assets: [],
  },
})
