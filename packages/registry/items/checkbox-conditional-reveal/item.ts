import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'checkbox-conditional-reveal',
  status: 'published',
  title: { 'zh-CN': '勾选后展开的追加字段', en: 'Reveal-on-Select Field' },
  summary: {
    'zh-CN': '勾选复选框或单选项后，下面平滑展开一个追加输入框，焦点随之移进去；取消后收起并禁用。适合「其他，请注明」、礼品留言和另填账单地址。',
    en: 'Choosing a checkbox or radio option smoothly expands a follow-up field beneath it and moves focus there; deselecting collapses and disables it again. Made for "Other, please specify", gift notes and different billing addresses.',
  },
  kind: 'component',
  category: 'checkbox',
  tags: ['checkbox', 'radio', 'conditional', 'reveal', 'expand', 'form', 'a11y'],
  runtime: ['react', 'css'],
  entry: { file: 'checkbox-conditional-reveal.tsx', export: 'RevealField' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'checkbox-conditional-reveal.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'control',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '控件', en: 'Control' },
      default: 'checkbox',
      options: [
        { value: 'checkbox', label: { 'zh-CN': '复选框', en: 'Checkbox' } },
        { value: 'radio', label: { 'zh-CN': '单选组', en: 'Radio pair' } },
      ],
    },
    {
      key: 'fieldType',
      type: 'select',
      group: 'content',
      label: { 'zh-CN': '追加字段', en: 'Follow-up field' },
      default: 'text',
      options: [
        { value: 'text', label: { 'zh-CN': '单行输入', en: 'Text input' } },
        { value: 'textarea', label: { 'zh-CN': '多行文本', en: 'Textarea' } },
      ],
    },
    { key: 'duration', type: 'number', group: 'motion', label: { 'zh-CN': '展开时长', en: 'Expand duration' }, default: 150, min: 100, max: 500, step: 10, unit: 'ms', safe: [120, 300] },
    { key: 'autoFocus', type: 'boolean', group: 'interaction', label: { 'zh-CN': '展开后聚焦', en: 'Focus on reveal' }, default: true },
    { key: 'showDescription', type: 'boolean', group: 'content', label: { 'zh-CN': '显示说明', en: 'Show description' }, default: true },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '输入框圆角', en: 'Field radius' }, default: 6, min: 0, max: 14, step: 1, unit: 'px' },
    {
      key: 'accent',
      type: 'color',
      group: 'look',
      label: { 'zh-CN': '强调色', en: 'Accent' },
      hint: { 'zh-CN': '勾选填充和焦点环；对勾自动取白色或近黑色', en: 'Checked fill and focus ring; the check mark picks white or near-black by contrast' },
      default: '#e4e4e7',
    },
  ],
  presets: [
    { id: 'origin', name: { 'zh-CN': '素白', en: 'Origin' }, values: { control: 'checkbox', fieldType: 'text', accent: '#e4e4e7', radius: 6 } },
    { id: 'parcel', name: { 'zh-CN': '包裹', en: 'Parcel' }, values: { control: 'radio', fieldType: 'textarea', accent: '#f59e0b', radius: 10, duration: 260 } },
    { id: 'harbor', name: { 'zh-CN': '海港', en: 'Harbor' }, values: { control: 'checkbox', fieldType: 'textarea', accent: '#3b82f6', radius: 4, duration: 200 } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'The follow-up field is disabled while collapsed, so it is skipped by Tab and not submitted; read its value only when checked is true.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.8, posterTime: 2.5, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: [
        'apps/origin/registry/default/components/comp-142.tsx',
        'apps/origin/registry/default/components/comp-156.tsx',
        'apps/origin/registry/default/ui/checkbox.tsx',
        'apps/origin/registry/default/ui/radio-group.tsx',
        'apps/origin/registry/default/ui/input.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'Merged the checkbox (comp-142) and radio (comp-156) examples into one component with a control select; Radix Checkbox / RadioGroup replaced by native inputs with the same classes.',
      'transition-all replaced by a grid-template-rows + opacity transition with a duration parameter; reduced motion removes it.',
      'Added controlled / uncontrolled checked state, a textarea option, an autoFocus toggle, field radius and an accent color whose check-mark ink is chosen by contrast.',
    ],
    assets: [],
  },
})
