import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'share-access-dialog',
  status: 'published',
  title: { 'zh-CN': '共享权限弹窗', en: 'Share & Access Dialog' },
  summary: {
    'zh-CN': '一个共享面板：输入邮箱变成标签并选好角色，下面是成员列表和各自的权限，再往下是链接可见范围和带反馈的复制按钮。适合文档、项目和设计文件的共享。',
    en: 'A share panel: emails turn into chips with a role picker, members are listed with their access, and the link row has a visibility menu and a copy button with feedback. For documents, projects and design files.',
  },
  kind: 'component',
  category: 'dialog',
  tags: ['share', 'invite', 'permissions', 'dialog', 'dropdown', 'input-group', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'share-access-dialog.tsx', export: 'ShareAccessDialog' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'share-access-dialog.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#6366f1' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 4, max: 20, step: 1, unit: 'px', safe: [8, 16] },
    {
      key: 'presentation',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '呈现方式', en: 'Presentation' },
      default: 'dialog',
      options: [
        { value: 'dialog', label: { 'zh-CN': '弹窗', en: 'Dialog' } },
        { value: 'inline', label: { 'zh-CN': '内嵌面板', en: 'Inline panel' } },
      ],
    },
    { key: 'showLinkAccess', type: 'boolean', group: 'content', label: { 'zh-CN': '显示链接权限', en: 'Show link access' }, default: true },
    { key: 'members', type: 'number', group: 'content', label: { 'zh-CN': '成员数', en: 'Members shown' }, default: 3, min: 1, max: 5, step: 1 },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.35, bounce: 0.15 } },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '宽度', en: 'Width' }, default: 420, min: 340, max: 520, step: 10, unit: 'px', safe: [380, 480] },
  ],
  presets: [
    { id: 'indigo', name: { 'zh-CN': '靛青', en: 'Indigo' }, values: { accent: '#6366f1', radius: 12, presentation: 'dialog' } },
    { id: 'citrine', name: { 'zh-CN': '柠檬黄', en: 'Citrine' }, values: { accent: '#facc15', radius: 6, presentation: 'dialog', spring: { visualDuration: 0.25, bounce: 0.05 } } },
    { id: 'flat-panel', name: { 'zh-CN': '平铺面板', en: 'Flat Panel' }, values: { accent: '#10b981', radius: 16, presentation: 'inline', members: 4 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.2, posterTime: 4.5, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: [
        'registry-reui/bases/base/components/input-group/c-input-group-40.tsx',
        'registry-reui/bases/base/components/input-group/c-input-group-32.tsx',
        'registry-reui/bases/base/components/dropdown-menu/c-dropdown-menu-13.tsx',
        'registry/bases/base/ui/input-group.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      'Combined three ReUI patterns into one share panel: the link input group with visibility menu and copy button (input-group-40), the input group with a role menu (input-group-32) used for email invites and members, and the outline Share trigger (dropdown-menu-13).',
      'Replaced base-ui InputGroup, DropdownMenu, Avatar and Button with hand-written markup and a small accessible menu (menu / menuitemradio roles, arrow keys, Esc); IconPlaceholder icons are inline SVG; avatars are initials.',
      'Added the dialog shell (backdrop, focus trap, Esc, focus return) with a motion spring, email chips, copy feedback timed with motion animate, and accent / radius / width / member-count parameters with luminance-based ink.',
    ],
    assets: [],
  },
})
