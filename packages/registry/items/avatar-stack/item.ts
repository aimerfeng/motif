import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'avatar-stack',
  status: 'published',
  title: { 'zh-CN': '头像堆叠', en: 'Avatar Stack' },
  summary: {
    'zh-CN': '一排重叠的渐变头像，指针经过时那一个抬起、邻居被推开，头顶弹出姓名和角色；带在线状态点，多出来的人折叠成 +N。适合协作文档的在场用户、项目成员和评审人。',
    en: 'A row of overlapping gradient avatars: the one under the pointer lifts, its neighbors part and a name card pops above. Presence dots included, extra people fold into +N. Made for collaborators on a document, project members and reviewers.',
  },
  kind: 'component',
  category: 'avatar',
  tags: ['avatar', 'stack', 'presence', 'collaborators', 'team', 'hover', 'spring'],
  runtime: ['react', 'motion'],
  entry: { file: 'avatar-stack.tsx', export: 'AvatarStack' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'avatar-stack.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '头像尺寸', en: 'Avatar size' }, default: 48, min: 28, max: 72, step: 1, unit: 'px', safe: [36, 60] },
    { key: 'overlap', type: 'number', group: 'layout', label: { 'zh-CN': '重叠量', en: 'Overlap' }, default: 14, min: 0, max: 28, step: 1, unit: 'px', safe: [6, 20] },
    { key: 'maxVisible', type: 'number', group: 'layout', label: { 'zh-CN': '最多显示', en: 'Max visible' }, default: 5, min: 2, max: 8, step: 1, safe: [3, 6] },
    {
      key: 'shape',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '形状', en: 'Shape' },
      default: 'circle',
      options: [
        { value: 'circle', label: { 'zh-CN': '圆形', en: 'Circle' } },
        { value: 'squircle', label: { 'zh-CN': '圆角方形', en: 'Squircle' } },
      ],
    },
    { key: 'spread', type: 'number', group: 'interaction', label: { 'zh-CN': '推开距离', en: 'Neighbor spread' }, default: 10, min: 0, max: 20, step: 1, unit: 'px', safe: [4, 14] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.3, bounce: 0.3 } },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '焦点色', en: 'Focus color' }, default: '#8b5cf6' },
    { key: 'showStatus', type: 'boolean', group: 'look', label: { 'zh-CN': '显示在线状态', en: 'Presence dots' }, default: true },
  ],
  presets: [
    { id: 'team-circle', name: { 'zh-CN': '团队', en: 'Team' }, values: { size: 48, overlap: 14, maxVisible: 5, shape: 'circle' } },
    { id: 'tight-mini', name: { 'zh-CN': '紧凑', en: 'Tight Mini' }, values: { size: 32, overlap: 10, maxVisible: 4, spread: 6, spring: { visualDuration: 0.22, bounce: 0.15 } } },
    { id: 'squircle-wide', name: { 'zh-CN': '方圆', en: 'Squircle' }, values: { size: 56, overlap: 8, maxVisible: 4, shape: 'squircle', spread: 14, spring: { visualDuration: 0.4, bounce: 0.45 } } },
    { id: 'quiet-row', name: { 'zh-CN': '安静', en: 'Quiet Row' }, values: { size: 40, overlap: 12, maxVisible: 6, showStatus: false, spread: 4 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use to show who is present or involved (collaborators, reviewers, members) in a header or list row, where the count matters more than each face.'],
    rules: [
      'Pass people as [{ name, role?, hue?, status? }]; there are no photos, avatars are initials on generated gradients. Order the most relevant people first: only maxVisible are shown and the rest fold into +N.',
      'Set ring to the color of the surface behind the stack (for example var(--card)) so the separating outline blends in.',
      'Each avatar is focusable with a full aria-label (name, role, status), and focus shows the same name card as hover.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.9, posterTime: 3.6, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kibo',
      repo: 'shadcnblocks/kibo',
      sha: '3d63cdb15b79d972e3dc38a10997987672f9b263',
      paths: ['packages/avatar-stack/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 — Present shadcnblocks'],
    },
    modifications: [
      'Replaced the shadcn Avatar children and CSS mask cut-outs with self-contained initials-on-gradient avatars separated by a ring, a +N overflow chip and optional presence dots.',
      'Added the hover / focus lift with neighbors pushed away by distance falloff, an animated name card, and parameters for size, overlap, visible count, shape, spread and spring. An activeIndex prop lets the demo autoplay drive the hover.',
      'cn comes from @motif/runtime; reduced motion disables the lift and push, keeping only the name card fade.',
    ],
    assets: [],
  },
})
