import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'sidebar-docs-tree',
  status: 'published',
  title: { 'zh-CN': '文档导航树侧栏', en: 'Docs Navigation Sidebar' },
  summary: {
    'zh-CN': '文档站的侧栏导航：分组展开成多级链接，当前页面高亮、所在分支自动展开，顶部可选一个过滤框。适合文档站、员工手册和知识库。',
    en: 'A documentation sidebar where sections expand into nested links, the current page is highlighted and its branch opens automatically, with an optional filter box on top. Made for docs sites, handbooks and knowledge bases.',
  },
  kind: 'section',
  category: 'sidebar',
  tags: ['sidebar', 'docs', 'tree', 'navigation', 'knowledge base', 'filter'],
  runtime: ['react', 'css', 'svg'],
  entry: { file: 'sidebar-docs-tree.tsx', export: 'DocsTreeSidebar' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'sidebar-docs-tree.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'brandName', type: 'text', group: 'content', label: { 'zh-CN': '品牌名', en: 'Brand name' }, default: 'Lumen Docs', maxLength: 24 },
    { key: 'showFilter', type: 'boolean', group: 'content', label: { 'zh-CN': '显示过滤框', en: 'Show filter' }, default: true },
    {
      key: 'activeStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '当前页样式', en: 'Current page style' },
      default: 'soft',
      options: [
        { value: 'soft', label: { 'zh-CN': '浅底（上游）', en: 'Soft (upstream)' } },
        { value: 'solid', label: { 'zh-CN': '主色实底', en: 'Solid accent' } },
        { value: 'bar', label: { 'zh-CN': '左侧竖条', en: 'Side bar' } },
      ],
    },
    { key: 'guides', type: 'boolean', group: 'look', label: { 'zh-CN': '层级引导线', en: 'Indent guides' }, default: false },
    {
      key: 'accent',
      type: 'color',
      group: 'look',
      label: { 'zh-CN': '强调色', en: 'Accent' },
      hint: { 'zh-CN': '实底样式的文字自动取白色或近黑色', en: 'Solid style text picks white or near-black by contrast' },
      default: '#6366f1',
    },
    { key: 'indent', type: 'number', group: 'layout', label: { 'zh-CN': '缩进', en: 'Indent' }, default: 20, min: 12, max: 28, step: 1, unit: 'px', safe: [16, 24] },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '侧栏宽度', en: 'Sidebar width' }, default: 272, min: 220, max: 340, step: 4, unit: 'px', safe: [240, 300] },
  ],
  presets: [
    { id: 'origin', name: { 'zh-CN': '原样', en: 'Origin' }, values: { activeStyle: 'soft', guides: false, accent: '#6366f1', indent: 20 } },
    { id: 'signal', name: { 'zh-CN': '信号灯', en: 'Signal' }, values: { activeStyle: 'solid', guides: true, accent: '#f59e0b', indent: 18 } },
    { id: 'ledger', name: { 'zh-CN': '账簿', en: 'Ledger' }, values: { activeStyle: 'bar', guides: true, accent: '#10b981', indent: 22, showFilter: false } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    rules: ['Pass your own items record (id → name, href, children) and rootId; mark the current page with `current` so its branch opens on load.'],
  },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: ['apps/origin/registry/default/components/comp-576.tsx', 'apps/origin/registry/default/ui/tree.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'Replaced @headless-tree with a hand-rolled flat tree (role="tree", treeitem, aria-level, aria-expanded, aria-current) with roving focus and arrow-key navigation.',
      'Kept the upstream items record, findPathToCurrent logic, Tree/TreeItem/TreeItemLabel class names and --tree-indent / --tree-padding variables; lucide ChevronDown is inline SVG; Radix Slot dropped.',
      'Added a brand header, an optional filter box that highlights matches and opens their branches, indent guides, active-style and accent params; the current branch reopens when the current page changes.',
      'The demo cycles the current page through useFrameLoop next to a small docs page; reduced motion drops the transitions.',
    ],
    assets: [],
  },
})
