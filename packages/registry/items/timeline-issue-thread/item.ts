import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'timeline-issue-thread',
  status: 'published',
  title: { 'zh-CN': '讨论串时间线', en: 'Discussion Thread Timeline' },
  summary: {
    'zh-CN': '像 issue 讨论串一样的时间线：头像节点串在竖线上，「Hannah 新建了 issue」这样的标题下面是带时间的评论气泡；也可以切成紧凑的动态日志，前面是动作图标，后面是相对时间。适合 issue 跟踪、工单和操作记录。',
    en: "An issue-style thread: avatar nodes on a rail, 'Hannah opened a new issue' headers and comment bubbles with timestamps, plus a compact log mode with action icons and relative times. Made for issue trackers, support tickets and audit trails.",
  },
  kind: 'component',
  category: 'data',
  tags: ['timeline', 'thread', 'issue', 'comments', 'activity', 'log', 'audit'],
  runtime: ['react', 'css', 'svg'],
  entry: { file: 'timeline-issue-thread.tsx', export: 'IssueThread' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'timeline-issue-thread.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'mode',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '模式', en: 'Mode' },
      default: 'thread',
      options: [
        { value: 'thread', label: { 'zh-CN': '讨论串', en: 'Thread' } },
        { value: 'log', label: { 'zh-CN': '动态日志', en: 'Log' } },
      ],
    },
    {
      key: 'bubbleStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '气泡样式', en: 'Bubble style' },
      default: 'outline',
      options: [
        { value: 'outline', label: { 'zh-CN': '描边', en: 'Outline' } },
        { value: 'filled', label: { 'zh-CN': '填充', en: 'Filled' } },
        { value: 'plain', label: { 'zh-CN': '无气泡', en: 'Plain' } },
      ],
    },
    { key: 'avatarSize', type: 'number', group: 'look', label: { 'zh-CN': '头像大小', en: 'Avatar size' }, default: 24, min: 20, max: 36, step: 2, unit: 'px', safe: [22, 32] },
    {
      key: 'railStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '竖线样式', en: 'Rail style' },
      default: 'solid',
      options: [
        { value: 'solid', label: { 'zh-CN': '实线', en: 'Solid' } },
        { value: 'dashed', label: { 'zh-CN': '虚线', en: 'Dashed' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '已完成节点的竖线和头像描边', en: 'Rail and avatar ring of completed steps' }, default: '#a1a1aa' },
    { key: 'showTimestamps', type: 'boolean', group: 'content', label: { 'zh-CN': '显示时间', en: 'Show timestamps' }, default: true },
    { key: 'relativeTime', type: 'boolean', group: 'content', label: { 'zh-CN': '相对时间', en: 'Relative time' }, hint: { 'zh-CN': '关闭后显示具体时刻', en: 'Off shows the clock time' }, default: true },
  ],
  presets: [
    { id: 'origin', name: { 'zh-CN': '原版', en: 'Origin' }, values: { mode: 'thread', bubbleStyle: 'outline', railStyle: 'solid', accent: '#a1a1aa', avatarSize: 24 } },
    { id: 'ticket', name: { 'zh-CN': '工单', en: 'Ticket desk' }, values: { mode: 'thread', bubbleStyle: 'filled', railStyle: 'dashed', accent: '#38bdf8', avatarSize: 28 } },
    { id: 'ledger', name: { 'zh-CN': '流水', en: 'Ledger' }, values: { mode: 'log', accent: '#34d399', avatarSize: 24, relativeTime: true } },
  ],
  dependencies: ['@motif/runtime'],
  fonts: [],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 7, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: [
        'apps/origin/registry/default/components/comp-536.tsx',
        'apps/origin/registry/default/components/comp-539.tsx',
        'apps/origin/registry/default/ui/timeline.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'Merged comp-536 (thread) and comp-539 (activity log) into one component with a mode param; inlined a vertical-only subset of ui/timeline (Radix Slot removed, rendered as ol/li).',
      'Photo avatars replaced with gradient initials; lucide icons replaced with inline SVGs.',
      'Added params for bubble style, avatar size, rail style, accent, timestamps and relative/clock time; rail offsets derive from the avatar size.',
      'Relative times are computed from item ages plus an elapsed prop instead of Date.now(); completed steps get an accent ring.',
    ],
    assets: [],
  },
})
