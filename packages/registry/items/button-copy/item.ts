import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'button-copy',
  status: 'published',
  title: { 'zh-CN': '复制按钮', en: 'Copy Button' },
  summary: {
    'zh-CN': '点一下复制到剪贴板：图标变形成一笔描出的对勾，扩散一圈光环，文案上滑替换，还弹出「已复制」提示。命令行片段、带文字的按钮、纯图标三种样式。适合文档里的安装命令、邀请链接和 API 密钥。',
    en: 'One click copies to the clipboard: the icon morphs into a check drawn in one stroke, a halo ripples out, the label rolls over and a small confirmation pops up. Snippet, labeled button and icon-only styles. Made for install commands, invite links and API keys.',
  },
  kind: 'component',
  category: 'button',
  tags: ['copy', 'clipboard', 'snippet', 'feedback', 'docs', 'button', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'button-copy.tsx', export: 'ButtonCopy' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'button-copy.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '样式', en: 'Variant' },
      default: 'snippet',
      options: [
        { value: 'snippet', label: { 'zh-CN': '命令行片段', en: 'Command snippet' } },
        { value: 'button', label: { 'zh-CN': '带文字按钮', en: 'Labeled button' } },
        { value: 'icon', label: { 'zh-CN': '纯图标', en: 'Icon only' } },
      ],
    },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '成功色', en: 'Success color' }, default: '#34d399' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 4, max: 24, step: 1, unit: 'px', safe: [6, 18] },
    {
      key: 'size',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '尺寸', en: 'Size' },
      default: 'md',
      options: [
        { value: 'sm', label: { 'zh-CN': '小', en: 'Small' } },
        { value: 'md', label: { 'zh-CN': '中', en: 'Medium' } },
        { value: 'lg', label: { 'zh-CN': '大', en: 'Large' } },
      ],
    },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.34, bounce: 0.3 } },
    { key: 'value', type: 'text', group: 'content', label: { 'zh-CN': '复制的内容', en: 'Text to copy' }, default: 'npx motif add tabs-animated', maxLength: 64 },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '按钮文案', en: 'Button label' }, hint: { 'zh-CN': '仅带文字按钮样式使用', en: 'Used by the labeled button variant' }, default: 'Copy', maxLength: 14 },
    { key: 'feedback', type: 'number', group: 'interaction', label: { 'zh-CN': '反馈时长', en: 'Feedback time' }, default: 2, min: 1, max: 4, step: 0.5, unit: 's', safe: [1.5, 3] },
  ],
  presets: [
    { id: 'mint-snippet', name: { 'zh-CN': '薄荷命令行', en: 'Mint Snippet' }, values: { variant: 'snippet', color: '#34d399', radius: 12, size: 'md' } },
    { id: 'violet-button', name: { 'zh-CN': '紫罗兰按钮', en: 'Violet Button' }, values: { variant: 'button', color: '#a78bfa', radius: 24, size: 'md', label: 'Copy link', value: 'https://motif.design/invite/x7Kq2' } },
    { id: 'sky-icon', name: { 'zh-CN': '天空图标', en: 'Sky Icon' }, values: { variant: 'icon', color: '#38bdf8', radius: 10, size: 'lg', spring: { visualDuration: 0.42, bounce: 0.45 } } },
    { id: 'amber-compact', name: { 'zh-CN': '琥珀紧凑', en: 'Amber Compact' }, values: { variant: 'snippet', color: '#fbbf24', radius: 8, size: 'sm', value: 'pnpm add motion', spring: { visualDuration: 0.24, bounce: 0.1 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use next to text the user is likely to paste elsewhere: commands, tokens, links, IDs. It writes the value prop to the clipboard.'],
    rules: [
      'Pass the exact string to copy as value; the snippet variant also renders it. Never copy secrets that the user cannot see.',
      'Success and failure are announced through an aria-live region and a visible confirmation; do not add a second toast. If the Clipboard API is blocked it falls back to execCommand and finally shows "Press ⌘C".',
      'The icon and snippet variants get an aria-label of "Copy: <value>"; the button variant uses its visible label.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 2, posterTime: 2.6, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'spell-ui',
      repo: 'xxtomm/spell-ui',
      sha: 'fffe96db7b67b44243bf35815916fdfc58fe5014',
      paths: ['registry/spell-ui/copy-button.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Spell UI'],
    },
    modifications: [
      'Rebuilt as a motion component with three variants (command snippet, labeled button, icon only) and success color, radius, size and spring parameters.',
      'Added the stroke-drawn check morph, ripple ring, label roll-over, a floating confirmation, an aria-live announcement, a failure state and an execCommand fallback when the Clipboard API is unavailable.',
      'A copied prop lets the demo autoplay show the success state; cn comes from @motif/runtime; reduced motion removes the morph, ripple and slides.',
    ],
    assets: [],
  },
})
