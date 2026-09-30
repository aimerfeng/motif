import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'empty-state-illustrated',
  status: 'published',
  title: { 'zh-CN': '插画空状态', en: 'Illustrated Empty State' },
  summary: {
    'zh-CN': '四幅内联 SVG 插画：搜索无结果、收件箱清空、还没有文件、离线。配上标题、说明和主次两个操作，插画轻轻漂浮，全部跟着主题色。适合列表、搜索页和首次使用的引导。',
    en: 'Four inline SVG illustrations: no results, empty inbox, no files yet and offline, with a title, description and primary and secondary actions. The art floats gently and follows your accent. For lists, search pages and first-run guidance.',
  },
  kind: 'component',
  category: 'empty-state',
  tags: ['empty state', 'illustration', 'svg', 'no results', 'inbox', 'offline', 'onboarding'],
  runtime: ['react', 'svg', 'css'],
  entry: { file: 'empty-state-illustrated.tsx', export: 'EmptyStateIllustrated' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'empty-state-illustrated.tsx', role: 'component' },
    { path: 'empty-state-illustrated.css', role: 'style' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '场景', en: 'Scenario' },
      default: 'no-results',
      options: [
        { value: 'no-results', label: { 'zh-CN': '搜索无结果', en: 'No results' } },
        { value: 'inbox', label: { 'zh-CN': '收件箱清空', en: 'Empty inbox' } },
        { value: 'no-files', label: { 'zh-CN': '还没有文件', en: 'No files' } },
        { value: 'offline', label: { 'zh-CN': '离线', en: 'Offline' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '插画高亮和主按钮的颜色', en: 'Colors the illustration highlights and the primary button' }, default: '#8b5cf6' },
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '插画宽度', en: 'Illustration width' }, default: 220, min: 120, max: 320, step: 4, unit: 'px', safe: [160, 260] },
    { key: 'float', type: 'boolean', group: 'motion', label: { 'zh-CN': '插画动效', en: 'Animate' }, default: true },
    { key: 'title', type: 'text', group: 'content', label: { 'zh-CN': '标题', en: 'Title' }, hint: { 'zh-CN': '留空则使用该场景的默认文案', en: 'Leave empty to use the scenario’s default copy' }, default: '', maxLength: 48 },
    { key: 'description', type: 'text', group: 'content', label: { 'zh-CN': '说明', en: 'Description' }, default: '', maxLength: 140 },
    { key: 'actionLabel', type: 'text', group: 'content', label: { 'zh-CN': '主按钮', en: 'Primary action' }, default: '', maxLength: 24 },
    { key: 'secondaryLabel', type: 'text', group: 'content', label: { 'zh-CN': '次按钮', en: 'Secondary action' }, default: '', maxLength: 24 },
  ],
  presets: [
    { id: 'orchid', name: { 'zh-CN': '兰花', en: 'Orchid' }, values: { variant: 'no-results', accent: '#8b5cf6' } },
    { id: 'quiet-inbox', name: { 'zh-CN': '安静', en: 'Quiet' }, values: { variant: 'inbox', accent: '#14b8a6', size: 200 } },
    { id: 'first-upload', name: { 'zh-CN': '第一份文件', en: 'First upload' }, values: { variant: 'no-files', accent: '#f59e0b', size: 230 } },
    { id: 'signal-lost', name: { 'zh-CN': '失联', en: 'Signal lost' }, values: { variant: 'offline', accent: '#ef4444', size: 210 } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    use: ['Use where a list, search or page can legitimately be empty. Pick the scenario that matches the reason: no results (search), caught up (inbox), first use (files), offline (connectivity).'],
    rules: [
      'Say why it is empty and what to do next; the primary action should be the most likely next step.',
      'The illustration is decorative and aria-hidden; the heading is labelled by aria-labelledby, so keep the title text meaningful.',
      'Do not stack several empty states on one screen; show one per empty region.',
    ],
  },
  capture: { zoom: 1.5, posterTime: 1.3, loop: 5 },
  provenance: {
    kind: 'original',
    modifications: [],
    assets: [],
  },
})
