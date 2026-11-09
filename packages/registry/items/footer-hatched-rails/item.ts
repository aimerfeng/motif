import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'footer-hatched-rails',
  status: 'published',
  title: { 'zh-CN': '斜纹边栏页脚', en: 'Hatched Rail Footer' },
  summary: {
    'zh-CN': '两侧是虚线竖轨、顶部是一条斜纹带的页脚：左边放标志、社交图标和版权，右边是四列链接。安静、带点技术感，像图纸的页边，适合开发者工具和 SaaS 官网收尾。',
    en: 'A footer framed by dashed vertical rails and a diagonal-hatch band, with a wordmark, social glyphs and copyright on the left and four link columns on the right. Quiet and technical, like the margin of a blueprint.',
  },
  kind: 'section',
  category: 'footer',
  tags: ['footer', 'links', 'hatch', 'columns', 'technical'],
  runtime: ['react', 'svg'],
  entry: { file: 'footer-hatched-rails.tsx', export: 'FooterHatchedRails' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'footer-hatched-rails.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'brand', type: 'text', label: { 'zh-CN': '品牌名', en: 'Brand name' }, default: 'Meridian', maxLength: 16, group: 'content' },
    { key: 'accent', type: 'color', label: { 'zh-CN': '标志色', en: 'Mark color' }, default: '#3b82f6', group: 'look' },
    {
      key: 'tone',
      type: 'select',
      label: { 'zh-CN': '明暗', en: 'Tone' },
      default: 'light',
      options: [
        { value: 'light', label: { 'zh-CN': '浅色', en: 'Light' } },
        { value: 'dark', label: { 'zh-CN': '深色', en: 'Dark' } },
      ],
      group: 'look',
    },
    { key: 'hatchAngle', type: 'number', label: { 'zh-CN': '斜纹角度', en: 'Hatch angle' }, default: 45, min: 15, max: 75, step: 1, group: 'look' },
    { key: 'hatchDensity', type: 'number', label: { 'zh-CN': '斜纹间距', en: 'Hatch spacing' }, default: 6, min: 4, max: 16, step: 1, group: 'look' },
    { key: 'columns', type: 'number', label: { 'zh-CN': '链接栏数', en: 'Link columns' }, default: 4, min: 1, max: 4, step: 1, group: 'layout' },
    { key: 'showSocial', type: 'boolean', label: { 'zh-CN': '显示社交图标', en: 'Show social icons' }, default: true, group: 'layout' },
  ],
  presets: [
    { id: 'blueprint', name: { 'zh-CN': '蓝图', en: 'Blueprint' }, values: {} },
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { tone: 'dark', accent: '#f59e0b', hatchAngle: 60, hatchDensity: 8 } },
    { id: 'margin-note', name: { 'zh-CN': '页边批注', en: 'Margin Note' }, values: { accent: '#e11d48', hatchAngle: 30, hatchDensity: 10, columns: 3 } },
  ],
  dependencies: ['@motif/runtime'],
  fonts: ['Geist Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'tremor-blocks',
      repo: 'tremorlabs/tremor-blocks',
      sha: 'b319e8d3d3678a4f60f4802f7e85bc1abc52d598',
      paths: ['src/content/components/feature-sections/feature-section-12.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Tremor Labs, Inc.'],
    },
    modifications: [
      'Kept the upstream markup, layout and Tailwind classes; next/link anchors became plain anchors.',
      'Replaced the Solar logo with an invented mark plus a brand-name wordmark, and the X/YouTube/GitHub/Slack Remix icons with generic inline SVG glyphs.',
      'The 17-path diagonal pattern became a single rotated line so hatch angle and spacing are params; the pattern id is made unique with useId.',
      'Gray Tailwind colors moved to CSS variables driven by a light/dark tone param; added column count and social toggle params, focus-visible outlines and sr-only labels.',
    ],
    assets: [],
  },
})
