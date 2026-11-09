import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'showcase-now-playing',
  status: 'published',
  title: { 'zh-CN': '正在播放展示区', en: 'Now Playing Showcase' },
  summary: {
    'zh-CN': '音乐应用的首屏：左边标题和按钮，右边一张磨砂玻璃的播放卡，生成的封面、走动的进度条、播放控制和律动条，下方歌单点哪首就切到哪首。适合音频、播客和流媒体产品。',
    en: 'A music-app hero: headline and buttons beside a frosted now-playing card with generated cover art, a moving progress bar, transport controls and a live equalizer, plus a playlist that swaps the card. For audio, podcast and streaming products.',
  },
  kind: 'section',
  category: 'showcase',
  tags: ['music', 'player', 'now playing', 'glassmorphism', 'audio', 'streaming'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'showcase-now-playing.tsx', export: 'ShowcaseNowPlaying' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'showcase-now-playing.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', label: { 'zh-CN': '主色', en: 'Accent' }, default: '#a78bfa', group: 'look' },
    {
      key: 'coverStyle',
      type: 'select',
      label: { 'zh-CN': '封面风格', en: 'Cover style' },
      default: 'aurora',
      options: [
        { value: 'aurora', label: { 'zh-CN': '极光', en: 'Aurora' } },
        { value: 'sunset', label: { 'zh-CN': '日落', en: 'Sunset' } },
        { value: 'glass', label: { 'zh-CN': '素玻璃', en: 'Plain glass' } },
      ],
      group: 'look',
    },
    { key: 'glassBlur', type: 'number', label: { 'zh-CN': '玻璃模糊', en: 'Glass blur' }, default: 40, min: 8, max: 64, step: 1, unit: 'px', safe: [16, 48], group: 'look' },
    {
      key: 'tone',
      type: 'select',
      label: { 'zh-CN': '深浅', en: 'Tone' },
      default: 'dark',
      options: [
        { value: 'dark', label: { 'zh-CN': '深色', en: 'Dark' } },
        { value: 'light', label: { 'zh-CN': '浅色', en: 'Light' } },
      ],
      group: 'look',
    },
    { key: 'playing', type: 'boolean', label: { 'zh-CN': '初始播放中', en: 'Start playing' }, default: true, group: 'motion' },
    { key: 'showEqualizer', type: 'boolean', label: { 'zh-CN': '显示律动条', en: 'Show equalizer' }, default: true, group: 'layout' },
  ],
  presets: [
    { id: 'nocturne', name: { 'zh-CN': '夜曲', en: 'Nocturne' }, values: { accent: '#a78bfa', coverStyle: 'aurora', tone: 'dark' } },
    { id: 'golden-hour', name: { 'zh-CN': '黄昏', en: 'Golden Hour' }, values: { accent: '#fb923c', coverStyle: 'sunset', tone: 'dark', glassBlur: 28 } },
    { id: 'gallery', name: { 'zh-CN': '白昼', en: 'Daylight' }, values: { accent: '#0ea5e9', coverStyle: 'glass', tone: 'light' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    rules: ['The player is a visual mock with no audio: wire the transport buttons and the playlist array to your real player state. Cover art is generated from the accent; never use real album art or streaming-service logos.'],
  },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'uitripled',
      repo: 'moumen-soliman/uitripled',
      sha: '05d18376db775072ed61d0cab8ea184f8f527429',
      paths: ['packages/components/react-shadcn/src/components/sections/glassmorphism-listen-app-block.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2026 uitripled'],
    },
    modifications: [
      'shadcn Button/Card/Badge inlined as plain elements; lucide icons replaced by inline SVG.',
      'Real tracks, artists and the Spotify link and embed replaced by invented tracks, a generic "Add to queue" button and an animated equalizer panel.',
      'Cover art is generated from the accent color (aurora, sunset or the original plain glass); progress advances from the runtime frame loop and the next track starts at the end.',
      'Play/pause, like, shuffle, repeat, previous and next are wired up with aria labels; added accent, glass blur and light/dark tone params; tightened padding for 360px screens.',
    ],
    assets: [],
  },
})
