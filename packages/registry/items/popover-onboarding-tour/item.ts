import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'popover-onboarding-tour',
  status: 'published',
  title: { 'zh-CN': '产品导览提示', en: 'Product Tour Tips' },
  summary: {
    'zh-CN': '一个带小箭头的浮层依次停在页面上的几个锚点旁：标题、说明、「2/4」计数和上一步 / 下一步，跳到下一个目标时自动换边。适合功能导览、首次使用提示和更新亮点。',
    en: 'A small popover with an arrow walks through anchors on the page: title, text, a 2/4 counter and prev/next, hopping to the next target and flipping sides as needed. For feature tours, first-run hints and changelog highlights.',
  },
  kind: 'component',
  category: 'popover',
  tags: ['popover', 'tour', 'onboarding', 'walkthrough', 'steps', 'a11y'],
  runtime: ['react', 'motion', 'css', 'svg'],
  entry: { file: 'popover-onboarding-tour.tsx', export: 'PopoverOnboardingTour' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'popover-onboarding-tour.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'steps', type: 'number', group: 'layout', label: { 'zh-CN': '步骤数', en: 'Steps' }, default: 4, min: 2, max: 4, step: 1 },
    { key: 'showArrow', type: 'boolean', group: 'look', label: { 'zh-CN': '箭头', en: 'Arrow' }, default: true },
    { key: 'showCounter', type: 'boolean', group: 'look', label: { 'zh-CN': '步骤计数', en: 'Step counter' }, default: true },
    {
      key: 'navStyle',
      type: 'select',
      group: 'interaction',
      label: { 'zh-CN': '翻页按钮', en: 'Navigation' },
      default: 'text',
      options: [
        { value: 'text', label: { 'zh-CN': '文字「下一步」', en: 'Next link' } },
        { value: 'arrows', label: { 'zh-CN': '左右箭头', en: 'Prev / next arrows' } },
      ],
    },
    { key: 'highlightTarget', type: 'boolean', group: 'look', label: { 'zh-CN': '高亮目标', en: 'Highlight target' }, default: true },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '浮层宽度', en: 'Popover width' }, default: 280, min: 220, max: 320, step: 4, unit: 'px', safe: [248, 300] },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 6, min: 0, max: 16, step: 1, unit: 'px', safe: [4, 10] },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '高亮色', en: 'Highlight' }, hint: { 'zh-CN': '目标描边的颜色', en: 'Ring around the current target' }, default: '#a1a1aa' },
  ],
  presets: [
    { id: 'origin', name: { 'zh-CN': '素描', en: 'Sketch' }, values: { navStyle: 'text', highlightTarget: true, radius: 6, accent: '#a1a1aa' } },
    { id: 'signal', name: { 'zh-CN': '信号灯', en: 'Signal' }, values: { navStyle: 'arrows', highlightTarget: true, radius: 10, accent: '#34d399' } },
    { id: 'quiet', name: { 'zh-CN': '静默', en: 'Hush' }, values: { navStyle: 'arrows', highlightTarget: false, showArrow: false, radius: 2, accent: '#a1a1aa' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.3, posterTime: 3.2, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: [
        'apps/origin/registry/default/components/comp-389.tsx',
        'apps/origin/registry/default/components/comp-386.tsx',
        'apps/origin/registry/default/components/comp-385.tsx',
        'apps/origin/registry/default/ui/popover.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'Radix Popover / PopoverAnchor were replaced by a hand-rolled anchored popover: it measures the active card, prefers left/right as upstream (alternating by step), flips to the other side or below when there is no room, and clamps to the viewport.',
      'The popover glides between targets with motion/react; the Radix arrow became an inline SVG that follows the chosen side.',
      'comp-386 prev/next arrow buttons are offered as a navStyle option next to the comp-389 "Next / Start over" link; lucide icons became inline SVG.',
      'Added Escape / outside-click to close, arrow-key navigation, focus handling, controlled open/step props, and params for steps, arrow, counter, target highlight, width, radius and highlight color.',
    ],
    assets: [],
  },
})
