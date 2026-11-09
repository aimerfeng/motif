import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'upload-avatar-crop',
  status: 'published',
  title: { 'zh-CN': '头像上传裁剪', en: 'Avatar Upload & Crop' },
  summary: {
    'zh-CN': '选一张图片后放进圆形裁剪框，拖动平移、滑块或滚轮缩放，旁边实时显示小尺寸头像的效果，点 Apply 导出裁好的 PNG。适合个人资料设置和团队成员入职。',
    en: 'Pick an image and it opens in a round crop frame you pan by dragging and zoom with a slider or the wheel, with live previews of the avatar at small sizes; Apply exports the cropped PNG. Made for profile settings and team onboarding.',
  },
  kind: 'component',
  category: 'input',
  tags: ['avatar', 'image-crop', 'upload', 'profile', 'form', 'a11y'],
  runtime: ['react', 'css', 'canvas2d'],
  entry: { file: 'upload-avatar-crop.tsx', export: 'UploadAvatarCrop' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'upload-avatar-crop.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'shape',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '裁剪形状', en: 'Crop shape' },
      default: 'circle',
      options: [
        { value: 'circle', label: { 'zh-CN': '圆形', en: 'Circle' } },
        { value: 'square', label: { 'zh-CN': '圆角方形', en: 'Rounded square' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#a78bfa' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '方形圆角', en: 'Square corner radius' }, hint: { 'zh-CN': '仅方形裁剪时生效，按边长百分比', en: 'Square shape only, percent of the side' }, default: 18, min: 0, max: 40, step: 1, unit: '%', safe: [8, 28] },
    { key: 'minZoom', type: 'number', group: 'interaction', label: { 'zh-CN': '最小缩放', en: 'Min zoom' }, default: 1, min: 1, max: 1.5, step: 0.05, safe: [1, 1.2] },
    { key: 'maxZoom', type: 'number', group: 'interaction', label: { 'zh-CN': '最大缩放', en: 'Max zoom' }, default: 3, min: 2, max: 6, step: 0.1, safe: [2.5, 4] },
    { key: 'outputSize', type: 'number', group: 'output', label: { 'zh-CN': '导出尺寸', en: 'Output size' }, default: 512, min: 128, max: 1024, step: 64, unit: 'px', safe: [256, 768] },
    { key: 'showPreviews', type: 'boolean', group: 'layout', label: { 'zh-CN': '显示小尺寸预览', en: 'Show previews' }, default: true },
  ],
  presets: [
    { id: 'lilac', name: { 'zh-CN': '丁香', en: 'Lilac' }, values: { shape: 'circle', accent: '#a78bfa', minZoom: 1, maxZoom: 3, showPreviews: true } },
    { id: 'tile', name: { 'zh-CN': '瓷砖', en: 'Tile' }, values: { shape: 'square', accent: '#34d399', radius: 22, maxZoom: 4, showPreviews: true } },
    { id: 'citrine', name: { 'zh-CN': '黄晶', en: 'Citrine' }, values: { shape: 'circle', accent: '#facc15', minZoom: 1.1, maxZoom: 2.5, showPreviews: false } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'Pass the picked File as file (or a data / object URL as src); onCrop receives a PNG data URL. Upload that yourself; the component never sends anything.',
      'Compose ImageCrop with ImageCropContent, ImageCropZoom, ImageCropPreview, ImageCropReset and ImageCropApply, or use the all-in-one Cropper.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.5, posterTime: 3.2, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kibo',
      repo: 'shadcnblocks/kibo',
      sha: '3d63cdb15b79d972e3dc38a10997987672f9b263',
      paths: ['packages/image-crop/index.tsx', 'apps/docs/examples/image-crop-circular.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 — Present shadcnblocks'],
    },
    modifications: [
      'Replaced react-image-crop with a hand-rolled fixed-frame pan / zoom cropper (pointer drag, wheel, arrow and +/- keys) and a canvas2d export; the fetch-based size check became a data URL length check.',
      'Kept the ImageCrop / ImageCropContent / ImageCropApply / ImageCropReset / Cropper structure and added ImageCropZoom (native range) and ImageCropPreview (live small-size avatar).',
      'radix Slot, the shadcn Button and lucide icons were replaced with plain buttons and inline SVG; cn comes from @motif/runtime.',
      'Shape, accent, radius, zoom range, output size and previews are parameters; a src prop and a controlled view prop were added (the demo autoplay uses them).',
    ],
    assets: [],
  },
})
