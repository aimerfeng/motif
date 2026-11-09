import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'input-exploding',
  status: 'published',
  title: { 'zh-CN': '爆字输入框', en: 'Exploding Input' },
  summary: {
    'zh-CN': '每敲一个字，光标处就迸出几颗小粒子——图形、火花或刚打下的字符，带着重力、旋转飞出去再淡掉。适合轻松一点的注册框、搜索框和聊天输入框。',
    en: 'Every keystroke throws a small burst of particles — shapes, sparks or the glyph you just typed — out of the caret with gravity and spin before they fade. For playful sign-ups, search boxes and chat composers.',
  },
  kind: 'component',
  category: 'input',
  tags: ['input', 'particles', 'typing', 'playful', 'form'],
  runtime: ['react', 'css'],
  entry: { file: 'input-exploding.tsx', export: 'ExplodingInput' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'input-exploding.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'particleSet',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '粒子', en: 'Particles' },
      default: 'shapes',
      options: [
        { value: 'shapes', label: { 'zh-CN': '几何图形', en: 'Shapes' } },
        { value: 'sparks', label: { 'zh-CN': '火花', en: 'Sparks' } },
        { value: 'glyphs', label: { 'zh-CN': '敲下的字符', en: 'Typed glyphs' } },
      ],
    },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '颜色', en: 'Color' }, default: '#6366f1' },
    { key: 'count', type: 'number', group: 'motion', label: { 'zh-CN': '每次数量', en: 'Per keystroke' }, default: 3, min: 1, max: 5, step: 1, safe: [2, 4] },
    { key: 'gravity', type: 'number', group: 'motion', label: { 'zh-CN': '重力', en: 'Gravity' }, hint: { 'zh-CN': '负值向上飘', en: 'Negative floats upward' }, default: 0.5, min: -1, max: 1, step: 0.05, safe: [0.2, 0.8] },
    {
      key: 'horizontal',
      type: 'select',
      group: 'motion',
      label: { 'zh-CN': '水平方向', en: 'Horizontal' },
      default: 'left',
      options: [
        { value: 'left', label: { 'zh-CN': '向左', en: 'Left' } },
        { value: 'center', label: { 'zh-CN': '居中', en: 'Center' } },
        { value: 'right', label: { 'zh-CN': '向右', en: 'Right' } },
      ],
    },
    {
      key: 'vertical',
      type: 'select',
      group: 'motion',
      label: { 'zh-CN': '垂直方向', en: 'Vertical' },
      default: 'top',
      options: [
        { value: 'top', label: { 'zh-CN': '向上', en: 'Up' } },
        { value: 'center', label: { 'zh-CN': '水平', en: 'Level' } },
        { value: 'bottom', label: { 'zh-CN': '向下', en: 'Down' } },
      ],
    },
    { key: 'duration', type: 'number', group: 'motion', label: { 'zh-CN': '持续时间', en: 'Duration' }, default: 3, min: 0.6, max: 5, step: 0.1, unit: 's', safe: [1.5, 3.5] },
    { key: 'scale', type: 'number', group: 'look', label: { 'zh-CN': '大小', en: 'Scale' }, default: 1, min: 0.5, max: 2.5, step: 0.05, safe: [0.8, 1.6] },
    { key: 'scaleVariation', type: 'number', group: 'look', label: { 'zh-CN': '大小随机', en: 'Scale variation' }, default: 30, min: 0, max: 80, step: 5, unit: '%' },
    { key: 'rotate', type: 'boolean', group: 'motion', label: { 'zh-CN': '旋转', en: 'Spin' }, default: true },
  ],
  presets: [
    { id: 'confetti', name: { 'zh-CN': '彩纸', en: 'Confetti' }, values: { particleSet: 'shapes', color: '#6366f1', count: 3, gravity: 0.5, horizontal: 'left', vertical: 'top', rotate: true } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { particleSet: 'sparks', color: '#fb923c', count: 4, gravity: -0.3, horizontal: 'center', vertical: 'top', duration: 2, scale: 0.9 } },
    { id: 'typewriter', name: { 'zh-CN': '散字', en: 'Loose Type' }, values: { particleSet: 'glyphs', color: '#e2e8f0', count: 1, gravity: 0.7, horizontal: 'right', vertical: 'top', scale: 1.4, scaleVariation: 0 } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'Place <ExplodingInput /> inside the same <label> as the input (after it); it finds the input and spawns from the caret on each input event.',
      'Purely decorative: particles are aria-hidden and nothing spawns when reduced motion is on.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.6, posterTime: 2.2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'spell-ui',
      repo: 'xxtomm/spell-ui',
      sha: 'fffe96db7b67b44243bf35815916fdfc58fe5014',
      paths: ['registry/spell-ui/exploding-input.tsx', 'docs/exploding-input/demo.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Spell UI'],
    },
    modifications: [
      'The physics loop runs on the Motif frame loop (useFrameLoop); particle age uses its clock and particles are removed in the loop instead of with setTimeout.',
      'The React-node content array (emoji in the upstream demo) is replaced by built-in sets: inline SVG shapes, sparks, or the typed character, tinted by a color parameter.',
      'Props are flattened into params (direction split into horizontal / vertical, scale variation, spin); no particles spawn under reduced motion; particles are aria-hidden.',
    ],
    assets: [],
  },
})
