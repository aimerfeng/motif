import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'ambient-backlight',
  status: 'published',
  title: { 'zh-CN': '环境背光', en: 'Ambient Backlight' },
  summary: {
    'zh-CN': '内容把自己的颜色投到身后：一层模糊、饱和的副本像电视氛围灯一样发光，随内容变化。适合视频播放器、专辑封面和深色页面上的产品图。',
    en: 'Media casts its own colors outward: a blurred, saturated copy glows behind it like a TV ambilight and shifts with the content. For video players, album art and product shots on dark pages.',
  },
  kind: 'effect',
  category: 'image',
  tags: ['backlight', 'glow', 'ambilight', 'svg filter', 'image'],
  runtime: ['react', 'svg', 'css'],
  entry: { file: 'ambient-backlight.tsx', export: 'Backlight' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'ambient-backlight.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'blur', type: 'number', label: { 'zh-CN': '光晕模糊', en: 'Glow blur' }, default: 20, min: 4, max: 48, step: 1, unit: 'px', group: 'look' },
    { key: 'saturation', type: 'number', label: { 'zh-CN': '饱和度', en: 'Saturation' }, default: 4, min: 1, max: 8, step: 0.1, group: 'look' },
    {
      key: 'artwork',
      type: 'select',
      label: { 'zh-CN': '演示画面', en: 'Demo artwork' },
      default: 'aurora',
      options: [
        { value: 'aurora', label: { 'zh-CN': '极光', en: 'Aurora' } },
        { value: 'sunset', label: { 'zh-CN': '晚霞', en: 'Sunset' } },
        { value: 'ocean', label: { 'zh-CN': '深海', en: 'Ocean' } },
      ],
      group: 'demo',
    },
    { key: 'artSpeed', type: 'number', label: { 'zh-CN': '画面流动速度', en: 'Artwork speed' }, default: 1, min: 0, max: 3, step: 0.1, group: 'demo' },
  ],
  presets: [
    { id: 'soft', name: { 'zh-CN': '薄雾', en: 'Soft Haze' }, values: { blur: 32, saturation: 2.5, artwork: 'ocean' } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { blur: 16, saturation: 6, artwork: 'sunset' } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 2 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'magicui',
      repo: 'magicuidesign/magicui',
      sha: 'd7207e5692d14c00dceafa8488d6d01f197fa0e4',
      paths: ['apps/www/registry/magicui/backlight.tsx', 'apps/www/registry/example/backlight-image-demo.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Magic UI'],
    },
    modifications: [
      'Defaults moved into the generated defaults region; the fixed saturate value is exposed as a saturation param.',
      'Accepts any children plus a style prop.',
      'The demo replaces the remote photo with generated, slowly drifting SVG artwork driven by useFrameLoop.',
    ],
    assets: [],
  },
})
