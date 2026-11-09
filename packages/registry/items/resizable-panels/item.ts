import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'resizable-panels',
  status: 'published',
  title: { 'zh-CN': '可调整分栏', en: 'Resizable Panels' },
  summary: {
    'zh-CN': '分栏之间的分隔线上有一枚胶囊把手，悬停时变长、拖动时拉伸并染上强调色；面板有最小宽度，双击可折叠，支持横竖嵌套和方向键。适合编辑器、邮件客户端和 IDE 式布局。',
    en: 'A split layout whose dividers carry a pill handle that grows on hover and stretches in the accent color while dragging. Panels keep a min size, collapse on double-click, nest horizontally and vertically and follow arrow keys. For editors, mail clients and IDE-like layouts.',
  },
  kind: 'component',
  category: 'layout',
  tags: ['resizable', 'split pane', 'panels', 'layout', 'separator', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'resizable-panels.tsx', export: 'ResizablePanelGroup' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'resizable-panels.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'handleStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '把手样式', en: 'Handle style' },
      default: 'pill',
      options: [
        { value: 'pill', label: { 'zh-CN': '胶囊', en: 'Pill' } },
        { value: 'grow', label: { 'zh-CN': '伸展', en: 'Grow' } },
        { value: 'stretch', label: { 'zh-CN': '拉长 + 高亮线', en: 'Stretch + tint' } },
      ],
    },
    {
      key: 'layout',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '演示布局', en: 'Demo layout' },
      default: 'nested',
      options: [
        { value: 'nested', label: { 'zh-CN': '横竖嵌套', en: 'Nested' } },
        { value: 'three', label: { 'zh-CN': '三栏', en: 'Three columns' } },
        { value: 'two', label: { 'zh-CN': '两栏', en: 'Two columns' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '拖动颜色', en: 'Drag accent' }, default: '#fafafa' },
    { key: 'minSize', type: 'number', group: 'layout', label: { 'zh-CN': '最小尺寸', en: 'Min size' }, default: 15, min: 5, max: 30, step: 1, unit: '%', safe: [10, 25] },
    { key: 'collapsible', type: 'boolean', group: 'interaction', label: { 'zh-CN': '双击折叠', en: 'Double-click to collapse' }, default: true },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 16, min: 0, max: 28, step: 1, unit: 'px' },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '折叠弹簧', en: 'Collapse spring' }, default: { visualDuration: 0.35, bounce: 0.15 } },
  ],
  presets: [
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { handleStyle: 'pill', accent: '#fafafa', radius: 16 } },
    { id: 'tide', name: { 'zh-CN': '潮汐', en: 'Tide' }, values: { handleStyle: 'stretch', accent: '#38bdf8', radius: 20, layout: 'three' } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { handleStyle: 'grow', accent: '#fb923c', radius: 8, layout: 'two', spring: { visualDuration: 0.45, bounce: 0.35 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Compose ResizablePanelGroup > ResizablePanel / ResizableHandle as direct children; nest a group inside a panel for the other axis (nested groups inherit the look).',
      'Give the group an explicit height; handles are role="separator" and resize with arrow keys (Home / End jump to min / max, Enter collapses when collapsible).',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.3, posterTime: 2.6, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: [
        'registry/bases/base/ui/resizable.tsx',
        'registry-reui/bases/base/components/resizable/c-resizable-6.tsx',
        'registry-reui/bases/base/components/resizable/c-resizable-7.tsx',
        'registry-reui/bases/base/components/resizable/c-resizable-8.tsx',
        'registry-reui/bases/base/components/resizable/c-resizable-9.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      'Replaced react-resizable-panels with hand-rolled pointer sizing, min sizes, keyboard resizing and role="separator" with aria-value*.',
      'The pill classes of c-resizable-6/7/8/9 became a handleStyle select; hover/active variants are driven by a data-state attribute, transition-all lists real properties and the active color is an accent param.',
      'Added double-click / Enter collapse animated with a motion spring, a controlled sizes prop and a forced handle state (used by the demo autoplay); cn comes from @motif/runtime.',
      'The demo combines the upstream layouts with mail / editor placeholder content.',
    ],
    assets: [],
  },
})
