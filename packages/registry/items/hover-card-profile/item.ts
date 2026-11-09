import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'hover-card-profile',
  status: 'published',
  title: { 'zh-CN': '用户悬停名片', en: 'Profile Hover Card' },
  summary: {
    'zh-CN': '悬停或聚焦一个名字，稍等片刻弹出名片：渐变头像、用户名、简介、共同好友和关注按钮，指针移进卡片时保持打开；另附一个文章预览卡变体。适合评论区的 @ 提及、团队页和信息流。',
    en: 'Hovering or focusing a name opens a card after a short delay with a gradient avatar, handle, bio, mutual friends and a Follow button, and it stays open while the pointer is inside; an article-preview variant is included. Made for mentions in comments, team pages and feeds.',
  },
  kind: 'component',
  category: 'popover',
  tags: ['hover card', 'popover', 'profile', 'mention', 'avatar', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'hover-card-profile.tsx', export: 'ProfileHoverCard' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'hover-card-profile.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '卡片类型', en: 'Card' },
      default: 'profile',
      options: [
        { value: 'profile', label: { 'zh-CN': '用户名片', en: 'Profile' } },
        { value: 'preview', label: { 'zh-CN': '文章预览', en: 'Article preview' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#e4e4e7' },
    { key: 'showMutuals', type: 'boolean', group: 'look', label: { 'zh-CN': '共同好友', en: 'Mutual friends' }, default: true },
    { key: 'showFollow', type: 'boolean', group: 'look', label: { 'zh-CN': '关注按钮', en: 'Follow button' }, default: true },
    { key: 'cardWidth', type: 'number', group: 'layout', label: { 'zh-CN': '卡片宽度', en: 'Card width' }, default: 256, min: 240, max: 340, step: 4, unit: 'px', safe: [256, 320] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 6, min: 0, max: 16, step: 1, unit: 'px', safe: [4, 12] },
    {
      key: 'side',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '弹出方向', en: 'Side' },
      default: 'bottom',
      options: [
        { value: 'bottom', label: { 'zh-CN': '下方', en: 'Bottom' } },
        { value: 'top', label: { 'zh-CN': '上方', en: 'Top' } },
      ],
    },
    { key: 'openDelay', type: 'number', group: 'interaction', label: { 'zh-CN': '打开延迟', en: 'Open delay' }, default: 700, min: 0, max: 1200, step: 50, unit: 'ms', safe: [300, 800] },
    { key: 'closeDelay', type: 'number', group: 'interaction', label: { 'zh-CN': '关闭延迟', en: 'Close delay' }, default: 300, min: 0, max: 800, step: 50, unit: 'ms', safe: [150, 400] },
  ],
  presets: [
    { id: 'origin', name: { 'zh-CN': '素描', en: 'Graphite' }, values: { variant: 'profile', accent: '#e4e4e7', radius: 6, cardWidth: 256 } },
    { id: 'lagoon', name: { 'zh-CN': '潟湖', en: 'Lagoon' }, values: { variant: 'profile', accent: '#2dd4bf', radius: 12, cardWidth: 300, openDelay: 400 } },
    { id: 'reader', name: { 'zh-CN': '书页', en: 'Margin Read' }, values: { variant: 'preview', accent: '#fbbf24', radius: 8, cardWidth: 320 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.6, posterTime: 3, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: [
        'apps/origin/registry/default/components/comp-364.tsx',
        'apps/origin/registry/default/components/comp-365.tsx',
        'apps/origin/registry/default/ui/hover-card.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'The radix HoverCard was replaced by a small hand-rolled one: open/close delays (radix defaults 700/300 ms), the card is a child of the hover area so it stays open while the pointer is inside, focus opens it, Esc closes it; enter/exit fade-zoom-slide is done with motion/react.',
      'Photo avatars and the content thumbnail became gradient initials and a gradient tile; names, handles and the company mention are invented.',
      'Merged the profile card (comp-364) and the article preview card with arrow (comp-365) behind a variant param; added a Follow button with luminance-picked text, and params for side, delays, width, radius and accent. The card aligns to the trigger start instead of center so it fits narrow screens.',
      'The demo opens and closes the card on the motif-runtime frame clock until the pointer takes over.',
    ],
    assets: [],
  },
})
