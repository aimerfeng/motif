import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'input-dropzone',
  status: 'published',
  title: { 'zh-CN': '拖放上传区', en: 'File Dropzone' },
  summary: {
    'zh-CN': '文件拖进来时虚线边框开始流动、图标轻轻弹起，松手后文件带着进度条依次排进列表。点击和键盘同样可以选文件。适合工单附件、资料上传和媒体库。',
    en: 'When a file is dragged in, the dashed border starts to flow and the icon bobs; on drop each file slides into a list with its own progress bar. Click or keyboard opens the picker too. Made for ticket attachments, profile uploads and media libraries.',
  },
  kind: 'component',
  category: 'input',
  tags: ['dropzone', 'file-upload', 'drag-and-drop', 'progress', 'form', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'input-dropzone.tsx', export: 'InputDropzone' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'input-dropzone.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '样式', en: 'Variant' },
      default: 'dashed',
      options: [
        { value: 'dashed', label: { 'zh-CN': '流动虚线', en: 'Marching dashes' } },
        { value: 'soft', label: { 'zh-CN': '柔和底色', en: 'Soft surface' } },
      ],
    },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#38bdf8' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 18, min: 6, max: 32, step: 1, unit: 'px', safe: [10, 24] },
    { key: 'height', type: 'number', group: 'layout', label: { 'zh-CN': '区域高度', en: 'Zone height' }, default: 156, min: 110, max: 240, step: 2, unit: 'px', safe: [130, 200] },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.34, bounce: 0.25 } },
    { key: 'title', type: 'text', group: 'content', label: { 'zh-CN': '标题文案', en: 'Title' }, hint: { 'zh-CN': '末尾会接一个「browse」链接', en: 'A "browse" link follows it' }, default: 'Drop files here or', maxLength: 32 },
    { key: 'hint', type: 'text', group: 'content', label: { 'zh-CN': '格式提示', en: 'Hint' }, default: 'PNG, JPG or PDF up to 10 MB', maxLength: 48 },
  ],
  presets: [
    { id: 'sky-line', name: { 'zh-CN': '晴空虚线', en: 'Sky Line' }, values: { variant: 'dashed', color: '#38bdf8', radius: 18, height: 156 } },
    { id: 'peach-soft', name: { 'zh-CN': '蜜桃', en: 'Peach' }, values: { variant: 'soft', color: '#fb923c', radius: 24, height: 170, spring: { visualDuration: 0.42, bounce: 0.4 } } },
    { id: 'mint-tight', name: { 'zh-CN': '薄荷', en: 'Mint' }, values: { variant: 'dashed', color: '#34d399', radius: 10, height: 128, title: 'Drag your export here or', hint: 'CSV or JSON up to 25 MB' } },
    { id: 'violet-wide', name: { 'zh-CN': '紫罗兰', en: 'Violet' }, values: { variant: 'soft', color: '#a78bfa', radius: 14, height: 190, spring: { visualDuration: 0.3, bounce: 0.15 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use for attaching or importing files in forms. It handles drag, click and keyboard selection; you own the actual upload.'],
    rules: [
      'onDrop receives the raw File objects; start real uploads there and mirror progress by passing files={[{ id, name, size, progress }]} (progress 0 to 1). Without a files prop the component simulates progress so it looks alive in previews only.',
      'Set accept and maxFiles to match the server rules and say them in the hint text. Never rely on the hint alone for validation.',
      'The zone is a role="button" with a hidden file input; do not wrap it in another label or button.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.6, posterTime: 4.8, loop: 11 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kibo',
      repo: 'shadcnblocks/kibo',
      sha: '3d63cdb15b79d972e3dc38a10997987672f9b263',
      paths: ['packages/dropzone/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 — Present shadcnblocks'],
    },
    modifications: [
      'Removed the react-dropzone dependency: drag enter / leave / drop, click and Enter / Space selection are handled with native events and a hidden file input, with accept and maxFiles checks.',
      'Added the marching-dash border, bobbing icon, spring-in file list with progress bars and remove buttons, and a soft variant; radius, height, spring and copy are parameters.',
      'dragActive, files and onFilesChange props make it controllable (the demo autoplay uses them); uncontrolled use simulates upload progress.',
    ],
    assets: [],
  },
})
