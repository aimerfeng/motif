import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'input-search-command',
  status: 'published',
  title: { 'zh-CN': '命令面板', en: 'Command Palette' },
  summary: {
    'zh-CN': '输入即模糊过滤，命中的字符高亮，方向键移动时高亮条像磁铁一样滑到下一项，回车执行。分组、快捷键提示、空状态都齐全。适合应用的 ⌘K 全局搜索和快速跳转。',
    en: 'Fuzzy filtering as you type with matched letters highlighted, a selection bar that glides between rows on arrow keys, and Enter to run. Groups, shortcut hints and an empty state included. Made for a global ⌘K search and quick jump.',
  },
  kind: 'component',
  category: 'input',
  tags: ['command-palette', 'cmdk', 'search', 'combobox', 'fuzzy', 'keyboard', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'input-search-command.tsx', export: 'InputSearchCommand' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'input-search-command.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#8b5cf6' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 16, min: 6, max: 28, step: 1, unit: 'px', safe: [10, 22] },
    {
      key: 'size',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '行高', en: 'Density' },
      default: 'md',
      options: [
        { value: 'sm', label: { 'zh-CN': '紧凑', en: 'Compact' } },
        { value: 'md', label: { 'zh-CN': '标准', en: 'Comfortable' } },
        { value: 'lg', label: { 'zh-CN': '宽松', en: 'Roomy' } },
      ],
    },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '高亮条弹簧', en: 'Highlight spring' }, default: { visualDuration: 0.26, bounce: 0.1 } },
    { key: 'maxRows', type: 'number', group: 'layout', label: { 'zh-CN': '最多可见行数', en: 'Visible rows' }, default: 10, min: 3, max: 12, step: 1, safe: [5, 10] },
    { key: 'placeholder', type: 'text', group: 'content', label: { 'zh-CN': '占位文案', en: 'Placeholder' }, default: 'Search or jump to…', maxLength: 36 },
    { key: 'showFooter', type: 'boolean', group: 'layout', label: { 'zh-CN': '显示底部提示', en: 'Footer hints' }, default: true },
  ],
  presets: [
    { id: 'violet-night', name: { 'zh-CN': '紫夜', en: 'Violet Night' }, values: { color: '#8b5cf6', radius: 16, size: 'md' } },
    { id: 'raycast-red', name: { 'zh-CN': '赤焰', en: 'Signal Red' }, values: { color: '#fb5a4e', radius: 20, size: 'lg', spring: { visualDuration: 0.32, bounce: 0.25 } } },
    { id: 'terminal-green', name: { 'zh-CN': '终端绿', en: 'Terminal Green' }, values: { color: '#4ade80', radius: 6, size: 'sm', maxRows: 8, spring: { visualDuration: 0.18, bounce: 0 } } },
    { id: 'sky-quiet', name: { 'zh-CN': '晴空', en: 'Clear Sky' }, values: { color: '#38bdf8', radius: 24, size: 'md', showFooter: false } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use as the body of a global ⌘K palette or an inline search-and-run list. It is a panel, not a modal: wrap it in your own dialog and open it on the shortcut.'],
    rules: [
      'Pass groups as [{ heading, items: [{ id, label, icon?, shortcut?, keywords? }] }] and handle onSelect. Keep labels short verbs or nouns; use keywords for synonyms.',
      'It follows the ARIA combobox + listbox pattern: focus stays in the input and the active row is announced with aria-activedescendant. Do not move DOM focus into the list.',
      'The query can be controlled with query / onQueryChange, for example to load async results by setting groups yourself.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.2, posterTime: 2.5, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'cmdk',
      repo: 'pacocoursey/cmdk',
      sha: 'dd2250ed608443e8f32bafc5fa2d1d07a3746aa3',
      paths: ['cmdk/src/command-score.ts', 'cmdk/src/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2022 Paco Coursey'],
    },
    modifications: [
      'No radix or cmdk runtime dependency: the list, grouping, active-item and keyboard behavior are reimplemented in one component using the ARIA combobox + listbox pattern.',
      'command-score is reduced to a small substring-then-subsequence matcher that also returns the matched indices so letters can be highlighted; results and groups are re-ranked by score.',
      'Added a sliding highlight bar and accent rail (shared layoutId), shortcut keycaps, an empty state, a live result count and controlled query / highlight props (used by the demo autoplay).',
    ],
    assets: [],
  },
})
