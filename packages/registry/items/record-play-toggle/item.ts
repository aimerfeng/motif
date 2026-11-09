import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'record-play-toggle',
  status: 'published',
  title: { 'zh-CN': '唱片播放键', en: 'Record Toggle' },
  summary: {
    'zh-CN': '播放键做成一张转动的黑胶唱片，外圈是可用方向键调节的进度环，旁边一排跳动的波形条；播放和暂停图标切换时带一下旋转。适合播客、音乐和语音消息播放器。',
    en: 'A play/pause control shaped like a spinning vinyl record, with a keyboard-seekable progress ring and a live bar waveform; the play and pause glyphs swap with a twist. For podcast, music and voice-note players.',
  },
  kind: 'component',
  category: 'audio',
  tags: ['audio', 'music', 'player', 'vinyl', 'toggle', 'waveform'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'record-play-toggle.tsx', export: 'RecordPlayToggle' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'record-play-toggle.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'playing', type: 'boolean', group: 'interaction', label: { 'zh-CN': '播放中', en: 'Playing' }, default: true },
    { key: 'progress', type: 'number', group: 'interaction', label: { 'zh-CN': '进度', en: 'Progress' }, default: 0.35, min: 0, max: 1, step: 0.01 },
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '唱片直径', en: 'Record size' }, default: 96, min: 64, max: 140, step: 2, unit: 'px', safe: [72, 120] },
    { key: 'bars', type: 'number', group: 'layout', label: { 'zh-CN': '波形条数', en: 'Waveform bars' }, default: 24, min: 8, max: 40, step: 1, safe: [12, 32] },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '进度颜色', en: 'Progress color' }, default: '#ec4899' },
    { key: 'labelColor', type: 'color', group: 'look', label: { 'zh-CN': '唱片标签色', en: 'Label color' }, default: '#ec4899' },
    { key: 'spinSpeed', type: 'number', group: 'motion', label: { 'zh-CN': '转速', en: 'Spin speed' }, hint: { 'zh-CN': '1 = 15 秒一圈', en: '1 = one turn every 15 s' }, default: 1, min: 0.25, max: 4, step: 0.05, safe: [0.5, 2] },
  ],
  presets: [
    { id: 'neon', name: { 'zh-CN': '霓虹夜', en: 'Neon Night' }, values: { accent: '#ec4899', labelColor: '#ec4899', size: 96, bars: 24, spinSpeed: 1 } },
    { id: 'lagoon', name: { 'zh-CN': '潟湖', en: 'Lagoon' }, values: { accent: '#22d3ee', labelColor: '#6366f1', size: 88, bars: 20, spinSpeed: 0.7 } },
    { id: 'amber-45', name: { 'zh-CN': '琥珀 45 转', en: 'Amber 45' }, values: { accent: '#f59e0b', labelColor: '#ef4444', size: 112, bars: 28, spinSpeed: 2 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Visual only: there is no <audio> element. Drive playing / progress from your player and listen to onPlayingChange / onSeek; the progress ring is a role="slider" that becomes keyboard-focusable only when onSeek is passed.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.8, posterTime: 2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/music-toggle/index.tsx', 'apps/docs/examples/music-toggle.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Renamed to RecordPlayToggle; cn comes from @motif/runtime and the lucide Play / Pause icons are inline SVG.',
      'Removed the src / <audio> element and the cover image; the record label is a generated gradient with grooves.',
      'Exposed size, bars, playing, progress, label color, progress color and spin speed as params (text-brand replaced by the accent color).',
      'The playing prop seeds the internal state and re-syncs when it changes, replacing the playing / defaultPlaying pair.',
    ],
    assets: [],
  },
})
