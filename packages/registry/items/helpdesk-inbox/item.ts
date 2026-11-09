import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'helpdesk-inbox',
  status: 'published',
  title: { 'zh-CN': '客服工单收件箱', en: 'Help Desk Inbox' },
  summary: {
    'zh-CN': '客服工具的工作台：左侧队列栏带计数和标签色点，工单表格带状态、优先级徽章和状态筛选；点开工单是对话时间线、内部备注标记，以及能在「回复」和「内部备注」之间切换的输入框。适合帮助台和共享收件箱。',
    en: 'A support tool screen: a queue rail with counts and tag dots, a ticket table with status and priority badges and status filter pills, and a ticket view with the conversation, an internal-note marker and a composer that switches between Reply and Internal note. For help desks and shared inboxes.',
  },
  kind: 'section',
  category: 'dashboard',
  tags: ['help desk', 'support', 'inbox', 'tickets', 'table', 'composer', 'app shell'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'helpdesk-inbox.tsx', export: 'HelpdeskInbox' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'helpdesk-inbox.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'brand', type: 'text', label: { 'zh-CN': '品牌名', en: 'Brand' }, default: 'Orbitly', maxLength: 18, group: 'content' },
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#4f46e5', group: 'look' },
    {
      key: 'view',
      type: 'select',
      label: { 'zh-CN': '初始界面', en: 'Start on' },
      default: 'queue',
      options: [
        { value: 'queue', label: { 'zh-CN': '工单队列', en: 'Ticket queue' } },
        { value: 'ticket', label: { 'zh-CN': '工单详情', en: 'Ticket view' } },
      ],
      group: 'layout',
    },
    {
      key: 'density',
      type: 'select',
      label: { 'zh-CN': '密度', en: 'Density' },
      default: 'comfortable',
      options: [
        { value: 'compact', label: { 'zh-CN': '紧凑', en: 'Compact' } },
        { value: 'comfortable', label: { 'zh-CN': '舒适', en: 'Comfortable' } },
        { value: 'spacious', label: { 'zh-CN': '宽松', en: 'Spacious' } },
      ],
      group: 'layout',
    },
    {
      key: 'showRail',
      type: 'boolean',
      label: { 'zh-CN': '固定队列栏', en: 'Pinned queue rail' },
      hint: { 'zh-CN': '关闭后队列栏只从左上角的菜单按钮打开', en: 'When off, the queues open from the menu button' },
      default: true,
      group: 'layout',
    },
    {
      key: 'tone',
      type: 'select',
      label: { 'zh-CN': '明暗', en: 'Surface' },
      default: 'light',
      options: [
        { value: 'light', label: { 'zh-CN': '浅色', en: 'Light' } },
        { value: 'dark', label: { 'zh-CN': '深色', en: 'Dark' } },
      ],
      group: 'look',
    },
  ],
  presets: [
    { id: 'day-shift', name: { 'zh-CN': '白班', en: 'Day shift' }, values: { accent: '#4f46e5', view: 'queue', density: 'comfortable', showRail: true, tone: 'light' } },
    { id: 'night-shift', name: { 'zh-CN': '夜班', en: 'Night shift' }, values: { accent: '#818cf8', view: 'ticket', density: 'comfortable', showRail: true, tone: 'dark' } },
    { id: 'triage', name: { 'zh-CN': '分诊台', en: 'Triage' }, values: { accent: '#0d9488', view: 'queue', density: 'compact', showRail: false, tone: 'light' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    rules: [
      'The inbox fills its parent (h-full): give it a fixed-height container such as h-dvh or a sized panel. Below lg the queue rail, and below xl the ticket details, become drawers.',
    ],
  },
  capture: { zoom: 1.1, posterTime: 1, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'hyperui',
      repo: 'markmead/hyperui',
      sha: '2b5aebbc50d2c9ac89650f51b554f53895b4803c',
      paths: ['public/examples/templates/support-inbox/1.html', 'public/examples/templates/support-inbox/2.html'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Mark Mead'],
    },
    modifications: [
      'Merged the two HTML pages (ticket queue and ticket view) into one React component; clicking a row opens the ticket and the back link returns to the queue.',
      'Checkbox-driven drawers, filter pills, composer tabs and selects became React state; the inline script for the composer is now props and state. Search, queues, tags and filters actually filter the invented tickets.',
      'Fixed positioning became absolute so the shell fits any container; gray and indigo classes became light/dark tone variables and an accent color with luminance-picked ink.',
      'Unsplash avatars replaced by initials; forms-plugin input styles written out; rows fade in on filter changes, disabled under reduced motion.',
    ],
    assets: [],
  },
})
