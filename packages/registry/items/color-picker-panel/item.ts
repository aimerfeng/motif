import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'color-picker-panel',
  status: 'published',
  title: { 'zh-CN': '取色器', en: 'Color Picker' },
  summary: {
    'zh-CN': '完整的取色面板：饱和度/亮度色板、色相和透明度滑块、吸管（浏览器支持时可用），HEX / RGB / CSS / HSL 格式切换，HEX 可直接输入，底部一排常用色块。适合主题编辑器、设计工具和品牌设置页。',
    en: 'A full color picker: saturation/brightness area, hue and opacity sliders, an eyedropper where the browser supports it, HEX / RGB / CSS / HSL output with an editable hex field, and a row of swatches. For theme editors, design tools and brand settings.',
  },
  kind: 'component',
  category: 'input',
  tags: ['color', 'picker', 'hue', 'alpha', 'eyedropper', 'swatches', 'theme', 'a11y'],
  runtime: ['react', 'css'],
  entry: { file: 'color-picker-panel.tsx', export: 'ColorPickerPanel' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'color-picker-panel.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'defaultColor', type: 'color', group: 'content', label: { 'zh-CN': '初始颜色', en: 'Initial color' }, default: '#2563eb' },
    {
      key: 'format',
      type: 'select',
      group: 'content',
      label: { 'zh-CN': '输出格式', en: 'Output format' },
      default: 'hex',
      options: [
        { value: 'hex', label: { 'zh-CN': 'HEX', en: 'HEX' } },
        { value: 'rgb', label: { 'zh-CN': 'RGB', en: 'RGB' } },
        { value: 'css', label: { 'zh-CN': 'CSS', en: 'CSS' } },
        { value: 'hsl', label: { 'zh-CN': 'HSL', en: 'HSL' } },
      ],
    },
    { key: 'showAlpha', type: 'boolean', group: 'interaction', label: { 'zh-CN': '透明度', en: 'Opacity slider' }, default: true },
    { key: 'showEyedropper', type: 'boolean', group: 'interaction', label: { 'zh-CN': '吸管', en: 'Eyedropper' }, default: true },
    { key: 'swatches', type: 'palette', group: 'look', label: { 'zh-CN': '色块', en: 'Swatches' }, default: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#2563eb', '#8b5cf6', '#ec4899'], minItems: 1, maxItems: 10 },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 6, min: 0, max: 14, step: 1, unit: 'px', safe: [4, 10] },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '宽度', en: 'Width' }, default: 320, min: 260, max: 384, step: 4, unit: 'px', safe: [288, 360] },
  ],
  presets: [
    { id: 'studio', name: { 'zh-CN': '工作室', en: 'Studio' }, values: { defaultColor: '#2563eb', format: 'hex', radius: 6 } },
    { id: 'sharp', name: { 'zh-CN': '直角', en: 'Hard Edge' }, values: { defaultColor: '#f97316', format: 'rgb', radius: 0, showEyedropper: false, swatches: ['#0a0a0a', '#f97316', '#facc15', '#f5f5f4'] } },
    { id: 'soft', name: { 'zh-CN': '糖霜', en: 'Frosting' }, values: { defaultColor: '#ec4899', format: 'hsl', radius: 12, swatches: ['#fda4af', '#f9a8d4', '#c4b5fd', '#93c5fd', '#86efac', '#fde68a'] } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'The parts (ColorPicker, ColorPickerSelection, ColorPickerHue, ColorPickerAlpha, ColorPickerEyeDropper, ColorPickerOutput, ColorPickerFormat, ColorPickerSwatches) are exported for custom layouts; ColorPickerPanel is the assembled default.',
      'The eyedropper uses the EyeDropper API (Chromium only) and is disabled elsewhere.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.5, posterTime: 2, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kibo',
      repo: 'shadcnblocks/kibo',
      sha: '3d63cdb15b79d972e3dc38a10997987672f9b263',
      paths: ['packages/color-picker/index.tsx', 'apps/docs/examples/color-picker.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 — Present shadcnblocks'],
    },
    modifications: [
      'Replaced the color npm package with hand-written hex/RGB/HSL conversions and fixed the controlled value sync (upstream wrote RGB channels into hue/saturation/lightness).',
      'Replaced radix Slider with a hand-rolled role="slider" (pointer capture, arrows, Page, Home/End), shadcn Select with a native select, shadcn Button/Input with plain elements, and the lucide pipette with an inline SVG.',
      'The selection thumb position is derived from the color instead of starting at 0,0, and the area is keyboard-adjustable; the alpha checkerboard is a CSS gradient instead of PNG data URIs.',
      'The hex field is editable; added a swatches row, an assembled ColorPickerPanel with params for initial color, format, opacity, eyedropper, swatches, radius and width; the eyedropper is disabled where unsupported.',
    ],
    assets: [],
  },
})
