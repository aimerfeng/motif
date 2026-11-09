import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'slider-parameter-panel',
  status: 'published',
  title: { 'zh-CN': '参数调节面板', en: 'Parameter Slider Panel' },
  summary: {
    'zh-CN': '一行一个参数：标签、滑块和数字框互相同步，输入数字按回车会自动夹到范围内；改过的行旁边出现重置按钮，底部一键全部复位。适合变换面板、模型温度和检查器侧栏。',
    en: 'Rows of label, slider and numeric field kept in sync: type a value and press Enter and it clamps into range, a reset appears only on rows that differ from their default, and Reset puts them all back. Made for transform panels, model temperature and inspector sidebars.',
  },
  kind: 'component',
  category: 'slider',
  tags: ['slider', 'input', 'inspector', 'reset', 'parameters', 'form', 'a11y'],
  runtime: ['react', 'css', 'svg'],
  entry: { file: 'slider-parameter-panel.tsx', export: 'SliderParameterPanel' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'slider-parameter-panel.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'rows',
      type: 'select',
      group: 'content',
      label: { 'zh-CN': '行', en: 'Rows' },
      default: 'transform',
      options: [
        { value: 'transform', label: { 'zh-CN': '位置（X / Y / Z）', en: 'Position (X / Y / Z)' } },
        { value: 'model', label: { 'zh-CN': '模型参数', en: 'Model settings' } },
      ],
    },
    { key: 'precision', type: 'number', group: 'content', label: { 'zh-CN': '小数位', en: 'Decimals' }, hint: { 'zh-CN': '数字框显示和取整的小数位数', en: 'Decimal places shown and rounded to' }, default: 0, min: 0, max: 2, step: 1 },
    { key: 'showReset', type: 'boolean', group: 'content', label: { 'zh-CN': '每行重置按钮', en: 'Per-row reset' }, default: true },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#f4f4f5' },
    { key: 'trackHeight', type: 'number', group: 'look', label: { 'zh-CN': '轨道粗细', en: 'Track height' }, default: 6, min: 4, max: 8, step: 1, unit: 'px' },
    {
      key: 'labelStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '标签样式', en: 'Label style' },
      default: 'muted',
      options: [
        { value: 'muted', label: { 'zh-CN': '淡色小字', en: 'Muted' } },
        { value: 'strong', label: { 'zh-CN': '正文', en: 'Strong' } },
      ],
    },
    { key: 'inputWidth', type: 'number', group: 'layout', label: { 'zh-CN': '数字框宽度', en: 'Field width' }, default: 48, min: 40, max: 72, step: 1, unit: 'px' },
    {
      key: 'density',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '密度', en: 'Density' },
      default: 'comfortable',
      options: [
        { value: 'comfortable', label: { 'zh-CN': '宽松', en: 'Comfortable' } },
        { value: 'compact', label: { 'zh-CN': '紧凑', en: 'Compact' } },
      ],
    },
  ],
  presets: [
    { id: 'origin', name: { 'zh-CN': '原版', en: 'Origin' }, values: { rows: 'transform', precision: 0, accent: '#f4f4f5', trackHeight: 6, density: 'comfortable' } },
    { id: 'sampler', name: { 'zh-CN': '采样器', en: 'Sampler' }, values: { rows: 'model', precision: 2, accent: '#8b7cf6', labelStyle: 'strong', inputWidth: 56 } },
    { id: 'inspector', name: { 'zh-CN': '检查器', en: 'Inspector' }, values: { rows: 'transform', precision: 1, accent: '#38bdf8', trackHeight: 4, density: 'compact', inputWidth: 52 } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.8, posterTime: 2.2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: [
        'apps/origin/registry/default/components/comp-254.tsx',
        'apps/origin/registry/default/components/comp-264.tsx',
        'apps/origin/registry/default/hooks/use-slider-with-input.ts',
        'apps/origin/registry/default/ui/slider.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'Combined the multi-row reset panel (comp-264) with the per-row reset of comp-254 and inlined a single-value, optionally controlled version of use-slider-with-input.',
      'Replaced the Radix slider with a hand-written role="slider" (pointer drag, arrow / Shift / Page / Home / End keys) and a transform-scaled range; Radix tooltip replaced by a native title.',
      'Replaced lucide RotateCcw with an inline SVG and the Button / Input / Label primitives with plain elements using the same classes; Reset all uses a reset signal instead of registered ref callbacks.',
      'Added parameters for row set, decimals, per-row reset, accent, track height, label style, field width and density.',
    ],
    assets: [],
  },
})
