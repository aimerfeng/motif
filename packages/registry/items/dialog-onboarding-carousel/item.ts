import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'dialog-onboarding-carousel',
  status: 'published',
  title: { 'zh-CN': '新手引导弹窗', en: 'Onboarding Dialog' },
  summary: {
    'zh-CN': '顶部是随步骤切换的插画，标题和说明跟着滑动，下面是圆点指示、跳过和下一步 / 完成。适合首次使用的引导和新功能介绍。',
    en: 'A welcome dialog with artwork on top that changes per step, a title and text that slide with it, dot indicators, Skip and Next / Okay. Made for first-run onboarding and what’s-new tours.',
  },
  kind: 'component',
  category: 'dialog',
  tags: ['onboarding', 'dialog', 'modal', 'walkthrough', 'steps', 'a11y'],
  runtime: ['react', 'motion', 'svg', 'css'],
  entry: { file: 'dialog-onboarding-carousel.tsx', export: 'DialogOnboardingCarousel' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'dialog-onboarding-carousel.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'steps', type: 'number', group: 'content', label: { 'zh-CN': '步骤数', en: 'Steps' }, default: 4, min: 2, max: 4, step: 1 },
    {
      key: 'artStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '插画风格', en: 'Art style' },
      default: 'glow',
      options: [
        { value: 'glow', label: { 'zh-CN': '柔光', en: 'Glow' } },
        { value: 'grid', label: { 'zh-CN': '网格', en: 'Grid' } },
      ],
    },
    {
      key: 'transition',
      type: 'select',
      group: 'motion',
      label: { 'zh-CN': '文字切换', en: 'Text transition' },
      default: 'slide',
      options: [
        { value: 'slide', label: { 'zh-CN': '滑动', en: 'Slide' } },
        { value: 'fade', label: { 'zh-CN': '淡入淡出', en: 'Fade' } },
      ],
    },
    {
      key: 'indicator',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '指示器', en: 'Indicator' },
      default: 'dots',
      options: [
        { value: 'dots', label: { 'zh-CN': '圆点', en: 'Dots' } },
        { value: 'pill', label: { 'zh-CN': '胶囊', en: 'Pill' } },
      ],
    },
    { key: 'showSkip', type: 'boolean', group: 'content', label: { 'zh-CN': '显示跳过', en: 'Show Skip' }, default: true },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 12, min: 6, max: 28, step: 1, unit: 'px', safe: [10, 20] },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#6366f1' },
    { key: 'finishLabel', type: 'text', group: 'content', label: { 'zh-CN': '完成按钮文案', en: 'Finish label' }, default: 'Okay', maxLength: 16 },
  ],
  presets: [
    { id: 'indigo', name: { 'zh-CN': '靛蓝', en: 'Indigo' }, values: { artStyle: 'glow', transition: 'slide', indicator: 'dots', accent: '#6366f1', radius: 12 } },
    { id: 'blueprint', name: { 'zh-CN': '蓝图', en: 'Blueprint' }, values: { artStyle: 'grid', transition: 'fade', indicator: 'pill', accent: '#0ea5e9', radius: 8 } },
    { id: 'apricot', name: { 'zh-CN': '杏子', en: 'Apricot' }, values: { artStyle: 'glow', transition: 'slide', indicator: 'pill', accent: '#fb923c', radius: 20, finishLabel: 'Get started' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.2, posterTime: 2.2, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: ['apps/origin/registry/default/components/comp-332.tsx', 'apps/origin/registry/default/ui/dialog.tsx', 'apps/origin/registry/default/ui/button.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'Replaced the radix Dialog with a hand-rolled role="dialog" (focus trap, Esc and backdrop close, focus returns on close); Button classes inlined.',
      'The upstream PNG artwork is replaced by generated SVG art that changes per step; lucide icons replaced with inline SVG.',
      'Title and text slide (or fade) between steps with motion; dots became clickable tabs with an optional pill style; arrow keys change steps.',
      'Step count, art style, transition, indicator, Skip, radius, accent and finish label come from params; brand name in the copy is invented.',
    ],
    assets: [],
  },
})
