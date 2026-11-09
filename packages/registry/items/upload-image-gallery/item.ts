import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'upload-image-gallery',
  status: 'published',
  title: { 'zh-CN': '图片上传网格', en: 'Image Upload Grid' },
  summary: {
    'zh-CN': '空的时候是一块虚线拖放区，图片一放进来就变成缩略图网格，每张都有删除按钮，右上角可以继续添加；有数量上限和大小校验。也可以切到单图模式，预览铺满整块区域。适合商品图、房源照片和作品集上传。',
    en: 'An empty dashed dropzone that turns into a thumbnail grid as images arrive, each with a remove button and an Add more action, plus a file limit and size errors. A single-image mode fills the zone with the preview. Made for product photos, listings and portfolios.',
  },
  kind: 'component',
  category: 'input',
  tags: ['upload', 'image', 'dropzone', 'gallery', 'file-upload', 'form', 'a11y'],
  runtime: ['react', 'canvas2d', 'css'],
  entry: { file: 'upload-image-gallery.tsx', export: 'UploadImageGallery' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'upload-image-gallery.tsx', role: 'component' },
    { path: 'use-file-upload.ts', role: 'lib' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'mode',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '模式', en: 'Mode' },
      default: 'grid',
      options: [
        { value: 'grid', label: { 'zh-CN': '多图网格', en: 'Image grid' } },
        { value: 'single', label: { 'zh-CN': '单张图片', en: 'Single image' } },
      ],
    },
    { key: 'columns', type: 'number', group: 'layout', label: { 'zh-CN': '列数', en: 'Columns' }, hint: { 'zh-CN': '窄容器里固定两列', en: 'Narrow containers always use two' }, default: 3, min: 2, max: 4, step: 1, safe: [2, 4] },
    {
      key: 'aspect',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '缩略图比例', en: 'Thumbnail aspect' },
      default: 'square',
      options: [
        { value: 'square', label: { 'zh-CN': '正方形', en: 'Square' } },
        { value: 'landscape', label: { 'zh-CN': '横向 4:3', en: 'Landscape 4:3' } },
        { value: 'portrait', label: { 'zh-CN': '竖向 3:4', en: 'Portrait 3:4' } },
      ],
    },
    { key: 'thumbRadius', type: 'number', group: 'look', label: { 'zh-CN': '缩略图圆角', en: 'Thumbnail radius' }, default: 6, min: 0, max: 16, step: 1, unit: 'px', safe: [4, 12] },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '删除按钮和焦点环', en: 'Remove buttons and focus ring' }, default: '#fafafa' },
    { key: 'maxFiles', type: 'number', group: 'rules', label: { 'zh-CN': '最多张数', en: 'Max files' }, default: 6, min: 2, max: 12, step: 1, safe: [3, 9] },
    { key: 'maxSizeMB', type: 'number', group: 'rules', label: { 'zh-CN': '单张上限（MB）', en: 'Max size (MB)' }, default: 5, min: 1, max: 20, step: 1, safe: [2, 10] },
  ],
  presets: [
    { id: 'contact-sheet', name: { 'zh-CN': '印样', en: 'Contact Sheet' }, values: { mode: 'grid', columns: 3, aspect: 'square', thumbRadius: 6, accent: '#fafafa' } },
    { id: 'listing', name: { 'zh-CN': '看房', en: 'Open House' }, values: { mode: 'grid', columns: 2, aspect: 'landscape', thumbRadius: 10, accent: '#38bdf8', maxFiles: 8 } },
    { id: 'cover', name: { 'zh-CN': '封面', en: 'Cover Shot' }, values: { mode: 'single', thumbRadius: 12, accent: '#f97316', maxSizeMB: 2 } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'The component validates count, size and type in the browser only; repeat the same checks on the server. onFilesChange receives { file, id, preview } entries; upload the File objects yourself.',
      'Previews are object URLs; the hook revokes them on remove and unmount, so copy the File if you need it after removal.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.5, posterTime: 5.6, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'coss-origin',
      repo: 'origin-space/originui',
      sha: 'fe6ffa81f434a4afe1c01564c13bb237564c42e2',
      paths: ['apps/origin/registry/default/components/comp-544.tsx', 'apps/origin/registry/default/components/comp-546.tsx', 'apps/origin/registry/default/hooks/use-file-upload.ts'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 coss.com', 'Originally Copyright (c) 2025 Origin UI'],
    },
    modifications: [
      'Merged the single-image uploader (comp-544) and the image grid uploader (comp-546) into one component with a mode switch.',
      'useFileUpload trimmed to what these two need (no metadata callbacks or clearErrors); ids come from a counter; previews are revoked on unmount.',
      'lucide icons replaced with inline SVG and the shadcn Button with plain buttons; the footer API link was removed.',
      'Columns, thumbnail aspect and radius, accent color (with contrast-picked ink), max files and max size are parameters; previewFiles / dragging / error props drive the demo autoplay.',
    ],
    assets: [],
  },
})
