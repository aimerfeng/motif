import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'shape-morph',
  status: 'published',
  title: { 'zh-CN': '形状变幻', en: 'Shape Morph' },
  summary: {
    'zh-CN': '几种形状轮流变身：圆、花瓣、星、圆角方……每一层错开一点跟上，叠成带拖尾的色块。缓动曲线、停留时间都能调，适合做首屏主视觉、品牌动效或加载等待。',
    en: 'Shapes take turns becoming each other: circle, petals, star, squircle… Each layer follows a beat later, stacking into a trailing bloom of colour. Easing and hold time are tunable. For hero visuals, brand motion or a waiting state.',
  },
  kind: 'effect',
  category: 'transition',
  tags: ['morph', 'shape', 'svg', 'stagger', 'brand', 'loader', 'hero'],
  runtime: ['react', 'svg'],
  entry: { file: 'shape-morph.tsx', export: 'ShapeMorph' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'shape-morph.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'set',
      type: 'select',
      group: 'shape',
      label: { 'zh-CN': '形状组', en: 'Shape set' },
      default: 'organic',
      options: [
        { value: 'organic', label: { 'zh-CN': '柔和', en: 'Organic' } },
        { value: 'geometric', label: { 'zh-CN': '几何', en: 'Geometric' } },
        { value: 'playful', label: { 'zh-CN': '俏皮', en: 'Playful' } },
      ],
    },
    { key: 'colors', type: 'palette', group: 'color', label: { 'zh-CN': '颜色', en: 'Colors' }, hint: { 'zh-CN': '从最前一层到最后一层渐变', en: 'Blended from the front layer to the back' }, default: ['#ff5a36', '#ffb23e'], minItems: 2, maxItems: 4 },
    { key: 'background', type: 'color', group: 'color', label: { 'zh-CN': '背景', en: 'Background' }, default: '#f6efe4' },
    { key: 'layers', type: 'number', group: 'shape', label: { 'zh-CN': '层数', en: 'Layers' }, default: 4, min: 1, max: 6, step: 1, safe: [2, 5] },
    { key: 'size', type: 'number', group: 'shape', label: { 'zh-CN': '大小', en: 'Size' }, default: 56, min: 30, max: 80, step: 1, unit: '%', safe: [42, 70] },
    { key: 'morph', type: 'number', group: 'motion', label: { 'zh-CN': '变形用时', en: 'Morph time' }, default: 1.3, min: 0.5, max: 3, step: 0.05, unit: 's', safe: [0.9, 2] },
    { key: 'hold', type: 'number', group: 'motion', label: { 'zh-CN': '停留', en: 'Hold' }, hint: { 'zh-CN': '每个形状停多久再变下一个', en: 'How long each shape rests before the next morph' }, default: 0.9, min: 0, max: 3, step: 0.05, unit: 's', safe: [0.4, 1.6] },
    { key: 'ease', type: 'easing', group: 'motion', label: { 'zh-CN': '缓动', en: 'Easing' }, default: [0.7, 0, 0.2, 1] },
    { key: 'spin', type: 'number', group: 'motion', label: { 'zh-CN': '旋转', en: 'Spin' }, hint: { 'zh-CN': '每秒转多少度，负数反向', en: 'Degrees per second; negative turns the other way' }, default: 8, min: -40, max: 40, step: 1, unit: 'deg', safe: [-20, 20] },
  ],
  presets: [
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { set: 'organic', colors: ['#ff5a36', '#ffb23e'], background: '#f6efe4', layers: 4 } },
    { id: 'lagoon', name: { 'zh-CN': '潟湖', en: 'Lagoon' }, values: { set: 'geometric', colors: ['#2dd4bf', '#38bdf8', '#1e3a8a'], background: '#071a2b', layers: 5, ease: [0.83, 0, 0.17, 1], spin: -10 } },
    { id: 'blossom', name: { 'zh-CN': '花信', en: 'Blossom' }, values: { set: 'playful', colors: ['#f472b6', '#fdba74'], background: '#fff1f2', layers: 3, ease: [0.34, 1.56, 0.64, 1], hold: 0.6 } },
    { id: 'ink', name: { 'zh-CN': '墨', en: 'Ink' }, values: { set: 'geometric', colors: ['#111111', '#a3a3a3'], background: '#fafafa', layers: 6, morph: 1.8, spin: 4 } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    use: ['A hero visual or brand mark that changes shape on a calm rhythm, or a waiting state that feels considered. One per screen.'],
    rules: [
      'Keep the hold long enough to read each shape; constant morphing without rests feels restless.',
      'Back layers should stay lighter than the front layer so the stack reads as one form with a trail.',
      'All shapes are sampled at the same angles, so add new ones as radius functions of the angle to keep morphs smooth.',
    ],
  },
  capture: { posterTime: 2.6, loop: 8 },
  provenance: { kind: 'original', modifications: [], assets: [] },
})
