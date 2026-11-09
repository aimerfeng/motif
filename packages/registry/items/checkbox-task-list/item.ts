import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'checkbox-task-list',
  status: 'published',
  title: { 'zh-CN': '待办清单', en: 'Task Checklist' },
  summary: {
    'zh-CN': '圆形勾选框打上对勾，任务文字被一道从左往右扫过的删除线划掉并变淡，标题旁计数「3 of 5」。适合引导清单、待办和发布清单。',
    en: 'Round checkboxes fill with a check while the task text gets a strike-through that sweeps across and fades; a header counts progress such as 3 of 5. Made for onboarding checklists, to-dos and release checklists.',
  },
  kind: 'component',
  category: 'checkbox',
  tags: ['checkbox', 'todo', 'checklist', 'strikethrough', 'progress', 'form'],
  runtime: ['react', 'css', 'svg'],
  entry: { file: 'checkbox-task-list.tsx', export: 'TaskChecklist' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'checkbox-task-list.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'checkShape',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '勾选框形状', en: 'Checkbox shape' },
      default: 'round',
      options: [
        { value: 'round', label: { 'zh-CN': '圆形', en: 'Round' } },
        { value: 'square', label: { 'zh-CN': '方形', en: 'Square' } },
      ],
    },
    {
      key: 'strikeStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '删除线', en: 'Strike-through' },
      default: 'sweep',
      options: [
        { value: 'sweep', label: { 'zh-CN': '扫过并变淡', en: 'Sweep and fade' } },
        { value: 'line', label: { 'zh-CN': '直接划线', en: 'Plain line' } },
      ],
    },
    { key: 'showProgress', type: 'boolean', group: 'content', label: { 'zh-CN': '显示进度', en: 'Show progress' }, default: true },
    { key: 'duration', type: 'number', group: 'motion', label: { 'zh-CN': '动画时长', en: 'Duration' }, default: 150, min: 100, max: 600, step: 10, unit: 'ms', safe: [120, 400] },
    {
      key: 'accent',
      type: 'color',
      group: 'look',
      label: { 'zh-CN': '强调色', en: 'Accent' },
      hint: { 'zh-CN': '对勾自动取白色或近黑色里对比度高的那个', en: 'The check uses white or near-black, whichever contrasts more' },
      default: '#10b981',
    },
  ],
  presets: [
    { id: 'emerald', name: { 'zh-CN': '翡翠', en: 'Emerald' }, values: { checkShape: 'round', strikeStyle: 'sweep', duration: 150, accent: '#10b981' } },
    { id: 'slow-sweep', name: { 'zh-CN': '慢扫', en: 'Slow sweep' }, values: { checkShape: 'round', strikeStyle: 'sweep', duration: 400, accent: '#7b52f7' } },
    { id: 'classic', name: { 'zh-CN': '经典', en: 'Classic' }, values: { checkShape: 'square', strikeStyle: 'line', duration: 150, accent: '#2b68ef' } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.8, posterTime: 4.0, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: [
        'apps/origin/registry/default/components/comp-136.tsx',
        'apps/origin/registry/default/components/comp-137.tsx',
        'apps/origin/registry/default/ui/checkbox.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'Replaced the Radix checkbox and Label with a native checkbox (peer) and labels; the indicator reuses the upstream check path.',
      'Combined comp-136 (plain line-through) and comp-137 (round box, sweeping strike-through) into one list with a strikeStyle and checkShape choice.',
      'Added a task list API (controlled / uncontrolled), an optional "3 of 5" progress count, accent and duration params; the check ink picks white or near-black by contrast.',
      'Reduced motion drops the transitions; the demo autoplays through useFrameLoop.',
    ],
    assets: [],
  },
})
