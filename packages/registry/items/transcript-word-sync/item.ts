import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'transcript-word-sync',
  status: 'published',
  title: { 'zh-CN': '逐词同步文字稿', en: 'Synced Transcript' },
  summary: {
    'zh-CN': '跟着音频一个词一个词往下走的文字稿：读过的词变亮，当前的词落在高亮小块里，没读到的保持暗淡；点任意一个词就跳过去，下面是带已播和剩余时间的进度条。适合播客页、会议回顾和语言学习播放器。',
    en: 'A transcript that follows the audio word by word: spoken words brighten, the current word sits in a highlight pill and upcoming words stay muted; click any word to seek, with a scrub bar and elapsed / remaining time underneath. For podcast pages, meeting recaps and language-learning players.',
  },
  kind: 'component',
  category: 'audio',
  tags: ['audio', 'transcript', 'captions', 'podcast', 'karaoke', 'a11y'],
  runtime: ['react', 'css'],
  entry: { file: 'transcript-word-sync.tsx', export: 'TranscriptWordSync' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'transcript-word-sync.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'highlight', type: 'color', group: 'look', label: { 'zh-CN': '当前词底色', en: 'Current word' }, default: '#fafafa' },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '进度颜色', en: 'Progress color' }, default: '#fafafa' },
    { key: 'fontSize', type: 'number', group: 'look', label: { 'zh-CN': '字号', en: 'Font size' }, default: 20, min: 14, max: 28, step: 1, unit: 'px', safe: [16, 24] },
    { key: 'unspokenOpacity', type: 'number', group: 'look', label: { 'zh-CN': '未读词透明度', en: 'Upcoming opacity' }, default: 0.5, min: 0.35, max: 0.75, step: 0.05, safe: [0.4, 0.6] },
    { key: 'rate', type: 'number', group: 'motion', label: { 'zh-CN': '播放速度', en: 'Playback rate' }, default: 1, min: 0.5, max: 2, step: 0.25, unit: 'x', safe: [0.75, 1.5] },
    { key: 'clickToSeek', type: 'boolean', group: 'interaction', label: { 'zh-CN': '点词跳转', en: 'Click word to seek' }, default: true },
    { key: 'autoScroll', type: 'boolean', group: 'interaction', label: { 'zh-CN': '自动滚动', en: 'Auto-scroll' }, hint: { 'zh-CN': '文字稿限高，跟着当前词滚动', en: 'Cap the height and keep the current word in view' }, default: true },
    { key: 'showScrubBar', type: 'boolean', group: 'layout', label: { 'zh-CN': '显示进度条', en: 'Show scrub bar' }, default: true },
  ],
  presets: [
    { id: 'chalk', name: { 'zh-CN': '粉笔', en: 'Chalk' }, values: { highlight: '#fafafa', accent: '#fafafa', fontSize: 20, unspokenOpacity: 0.5, rate: 1 } },
    { id: 'marigold', name: { 'zh-CN': '金盏', en: 'Marigold' }, values: { highlight: '#fbbf24', accent: '#fbbf24', fontSize: 22, unspokenOpacity: 0.45, rate: 1 } },
    { id: 'lagoon', name: { 'zh-CN': '潟湖', en: 'Lagoon' }, values: { highlight: '#0e7490', accent: '#22d3ee', fontSize: 18, unspokenOpacity: 0.55, rate: 1.25 } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'Pass word timings as `words` ({ text, startTime, endTime } in seconds) or an ElevenLabs-style character `alignment`; with `audioSrc` the clock follows the <audio> element, without it a silent simulated clock runs (for previews).',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.3, posterTime: 4, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'elevenlabs-ui',
      repo: 'elevenlabs/ui',
      sha: '23c31bd3088814215a8b5d0bfb56b327cad1a578',
      paths: [
        'apps/www/registry/elevenlabs-ui/ui/transcript-viewer.tsx',
        'apps/www/registry/elevenlabs-ui/hooks/use-transcript-viewer.ts',
        'apps/www/registry/elevenlabs-ui/ui/scrub-bar.tsx',
        'apps/www/registry/elevenlabs-ui/examples/transcript-viewer-demo.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Eleven Labs Inc.'],
    },
    modifications: [
      'Merged the transcript-viewer primitives, the use-transcript-viewer hook and the scrub bar into one file with a single TranscriptWordSync component.',
      'Kept composeSegments for character alignments and added a plain `words` timing array; the ElevenLabs SDK type is replaced by a local one.',
      'Replaced the rAF polling loop with useFrameLoop, which also drives a silent simulated clock when no audioSrc is given (plus loop and autoPlay options).',
      'Replaced the Radix progress and shadcn Button with plain elements and lucide icons with inline SVG; the scrub bar is a focusable role="slider" with arrow/Home/End keys.',
      'Added click-to-seek on words, eased auto-scroll, and highlight, accent, font-size, upcoming-opacity and rate params; the highlight pill picks light or dark ink by luminance.',
    ],
    assets: [],
  },
})
