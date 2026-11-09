import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'audio-playlist-player',
  status: 'published',
  title: { 'zh-CN': '播放列表播放器', en: 'Playlist Player' },
  summary: {
    'zh-CN': '左边是曲目列表，右边是播放器：悬停时序号变成播放键，正在播放的曲目显示跳动的小均衡器，带可拖动的进度条、时间和倍速菜单。适合播客站、音效库和产品音频试听。',
    en: 'A track list beside the player: row numbers turn into play icons on hover and a tiny equaliser marks the playing track, with a seekable progress bar, times and a playback-speed menu. For podcast sites, sound libraries and product audio samples.',
  },
  kind: 'component',
  category: 'audio',
  tags: ['audio', 'player', 'playlist', 'podcast', 'music', 'a11y'],
  runtime: ['react', 'svg'],
  entry: { file: 'audio-playlist-player.tsx', export: 'AudioPlaylistPlayer' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'audio-playlist-player.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'layout',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '布局', en: 'Layout' },
      default: 'playlist',
      options: [
        { value: 'playlist', label: { 'zh-CN': '列表 + 播放器', en: 'Playlist + player' } },
        { value: 'single', label: { 'zh-CN': '单曲卡片', en: 'Single track card' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '进度颜色', en: 'Progress color' }, default: '#fafafa' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 14, min: 0, max: 24, step: 1, unit: 'px', safe: [8, 20] },
    {
      key: 'speedControl',
      type: 'select',
      group: 'interaction',
      label: { 'zh-CN': '倍速控件', en: 'Speed control' },
      default: 'menu',
      options: [
        { value: 'menu', label: { 'zh-CN': '下拉菜单', en: 'Menu' } },
        { value: 'buttons', label: { 'zh-CN': '按钮组', en: 'Button group' } },
        { value: 'none', label: { 'zh-CN': '不显示', en: 'Hidden' } },
      ],
    },
    { key: 'listWidth', type: 'number', group: 'layout', label: { 'zh-CN': '列表宽度', en: 'List width' }, hint: { 'zh-CN': '宽屏下曲目列表的宽度', en: 'Track list width on wide containers' }, default: 256, min: 200, max: 320, step: 4, unit: 'px', safe: [220, 300] },
  ],
  presets: [
    { id: 'monochrome', name: { 'zh-CN': '黑白片', en: 'Monochrome' }, values: { layout: 'playlist', accent: '#fafafa', radius: 14, speedControl: 'menu' } },
    { id: 'citrus', name: { 'zh-CN': '青柠', en: 'Citrus' }, values: { layout: 'playlist', accent: '#a3e635', radius: 20, speedControl: 'buttons' } },
    { id: 'pocket', name: { 'zh-CN': '口袋单曲', en: 'Pocket' }, values: { layout: 'single', accent: '#38bdf8', radius: 10, speedControl: 'menu' } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'Tracks without a src play on a silent simulated clock (for previews); pass src on each track for real audio.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 3, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'elevenlabs-ui',
      repo: 'elevenlabs/ui',
      sha: '23c31bd3088814215a8b5d0bfb56b327cad1a578',
      paths: [
        'apps/www/registry/elevenlabs-ui/ui/audio-player.tsx',
        'apps/www/registry/elevenlabs-ui/blocks/music-player-01/page.tsx',
        'apps/www/registry/elevenlabs-ui/blocks/music-player-02/page.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Eleven Labs Inc.'],
    },
    modifications: [
      'Merged the audio-player primitives and the music-player-01 / -02 blocks into one file with a layout param.',
      'Replaced the Radix slider and dropdown menu with a hand-rolled role="slider" and role="menu" (keyboard support kept), and lucide icons with inline SVG.',
      'Removed the remote example mp3s: tracks without src play on a silent simulated clock driven by useFrameLoop, which also replaces the rAF polling loop.',
      'Added a small equaliser for the playing row, auto-advance to the next track, and accent, radius, speed-control and list-width params.',
    ],
    assets: [],
  },
})
