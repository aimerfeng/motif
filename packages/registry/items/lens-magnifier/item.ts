import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'lens-magnifier',
  status: 'published',
  title: { 'zh-CN': '放大镜', en: 'Lens Magnifier' },
  summary: {
    'zh-CN': '一枚圆形镜片跟着指针在图片或卡片上移动，把下方区域放大显示，进出时轻轻缩放；也可以固定在某个位置。适合商品图、地图和细节丰富的插画。',
    en: 'A round lens follows the pointer over an image or card and magnifies what is beneath it, scaling in and out at the edges; it can also be pinned in place. Made for product shots, maps and detailed illustrations.',
  },
  kind: 'effect',
  category: 'image',
  tags: ['lens', 'zoom', 'magnifier', 'image', 'hover'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'lens-magnifier.tsx', export: 'Lens' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'lens-magnifier.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'zoomFactor', type: 'number', label: { 'zh-CN': '放大倍数', en: 'Zoom factor' }, default: 1.3, min: 1, max: 4, step: 0.1, unit: 'x', safe: [1.3, 2.5] },
    { key: 'lensSize', type: 'number', label: { 'zh-CN': '镜片直径', en: 'Lens size' }, default: 170, min: 60, max: 300, step: 1, unit: 'px', safe: [120, 220] },
    { key: 'duration', type: 'number', label: { 'zh-CN': '出现用时', en: 'Appear duration' }, default: 0.1, min: 0, max: 1, step: 0.05, unit: 's' },
    {
      key: 'isStatic',
      type: 'boolean',
      label: { 'zh-CN': '固定位置', en: 'Pinned' },
      hint: { 'zh-CN': '镜片停在 position 指定的位置', en: 'The lens stays at the given position' },
      default: false,
    },
    {
      key: 'lensColor',
      type: 'color',
      label: { 'zh-CN': '遮罩颜色', en: 'Mask color' },
      hint: { 'zh-CN': '只用于遮罩，保持不透明', en: 'Mask only; keep it opaque' },
      default: '#000000',
    },
    { key: 'ariaLabel', type: 'text', label: { 'zh-CN': '无障碍标签', en: 'Aria label' }, default: 'Zoom Area', maxLength: 40 },
  ],
  presets: [
    { id: 'loupe', name: { 'zh-CN': '寸镜', en: 'Loupe' }, values: { zoomFactor: 2.5, lensSize: 120 } },
    { id: 'porthole', name: { 'zh-CN': '舷窗', en: 'Porthole' }, values: { zoomFactor: 1.6, lensSize: 240, duration: 0.3 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 1.4 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'magicui',
      repo: 'magicuidesign/magicui',
      sha: 'd7207e5692d14c00dceafa8488d6d01f197fa0e4',
      paths: ['apps/www/registry/magicui/lens.tsx', 'apps/www/registry/example/lens-demo.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Magic UI'],
    },
    modifications: [
      'Defaults moved into the generated defaults region; out-of-range zoomFactor and lensSize are clamped instead of throwing.',
      'Adds className, style and a focus-visible ring; the scale-in becomes a fade when the user prefers reduced motion.',
      'The demo uses a generated SVG illustration instead of a photo and drives the lens with a frame-loop autoplay until the pointer enters.',
    ],
    assets: [],
  },
})
