import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'voice-dictation-button',
  status: 'published',
  title: { 'zh-CN': '语音输入按钮', en: 'Dictation Button' },
  summary: {
    'zh-CN': '一个麦克风按钮，点一下展开成录音胶囊：实时波形和计时、旁边滚出转写预览，还有取消和停止；停下后进入处理状态，最后落成一个对勾或叉号。适合搜索框、笔记和聊天输入框的语音输入。',
    en: 'A mic button that opens into a recording pill: a live waveform and timer, a transcript preview typing in beside it, cancel and stop controls, then a processing state that resolves into a tick or a cross. For voice input in search bars, notes and chat composers.',
  },
  kind: 'component',
  category: 'audio',
  tags: ['voice', 'dictation', 'speech', 'microphone', 'waveform', 'transcript', 'input'],
  runtime: ['react', 'motion', 'canvas2d'],
  entry: { file: 'voice-dictation-button.tsx', export: 'VoiceDictationButton' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'voice-dictation-button.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '波形颜色', en: 'Waveform color' }, default: '#f4f4f5' },
    {
      key: 'size',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '尺寸', en: 'Size' },
      default: 'default',
      options: [
        { value: 'sm', label: { 'zh-CN': '小', en: 'Small' } },
        { value: 'default', label: { 'zh-CN': '中', en: 'Default' } },
        { value: 'lg', label: { 'zh-CN': '大', en: 'Large' } },
      ],
    },
    { key: 'showTranscript', type: 'boolean', group: 'content', label: { 'zh-CN': '转写预览', en: 'Transcript preview' }, default: true },
    { key: 'showTimer', type: 'boolean', group: 'content', label: { 'zh-CN': '录音计时', en: 'Timer' }, default: true },
    { key: 'shortcut', type: 'boolean', group: 'interaction', label: { 'zh-CN': '快捷键 ⌥Space', en: 'Shortcut ⌥Space' }, hint: { 'zh-CN': '显示提示并监听 Alt + Space', en: 'Shows the hint and listens for Alt + Space' }, default: true },
    { key: 'feedbackDuration', type: 'number', group: 'motion', label: { 'zh-CN': '结果停留', en: 'Feedback duration' }, default: 1500, min: 600, max: 4000, step: 100, unit: 'ms', safe: [1000, 2500] },
    {
      key: 'barDensity',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '波形密度', en: 'Bar density' },
      default: 'fine',
      options: [
        { value: 'fine', label: { 'zh-CN': '细密', en: 'Fine' } },
        { value: 'regular', label: { 'zh-CN': '适中', en: 'Regular' } },
        { value: 'bold', label: { 'zh-CN': '粗', en: 'Bold' } },
      ],
    },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 6, min: 0, max: 22, step: 1, unit: 'px', safe: [4, 22] },
  ],
  presets: [
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { accent: '#f4f4f5', size: 'default', barDensity: 'fine', radius: 6 } },
    { id: 'signal', name: { 'zh-CN': '信号蓝', en: 'Signal' }, values: { accent: '#38bdf8', size: 'lg', barDensity: 'regular', radius: 22 } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#fb923c', size: 'sm', barDensity: 'bold', radius: 2 } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'UI only: there is no speech service inside. Drive state (idle / recording / processing / success / error) and transcript from your recognizer; the buttons call onStart, onStop and onCancel.',
      'The waveform is synthesized; pass levels (0..1 per bar, read each frame) to show real microphone data.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.7, posterTime: 3.4, loop: 10 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'elevenlabs-ui',
      repo: 'elevenlabs/ui',
      sha: '23c31bd3088814215a8b5d0bfb56b327cad1a578',
      paths: [
        'apps/www/registry/elevenlabs-ui/ui/speech-input.tsx',
        'apps/www/registry/elevenlabs-ui/ui/voice-button.tsx',
        'apps/www/registry/elevenlabs-ui/ui/live-waveform.tsx',
        'apps/www/registry/elevenlabs-ui/examples/voice-button-demo.tsx',
        'apps/www/registry/elevenlabs-ui/examples/speech-input-demo.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Eleven Labs Inc.'],
    },
    modifications: [
      'Merged SpeechInput (record / preview / cancel pill) and VoiceButton (waveform box, shortcut hint, processing / success / error feedback) into one controlled component; the ElevenLabs Scribe connection and token fetch are replaced by state, transcript and onStart / onStop / onCancel props.',
      'LiveWaveform (static mode) ported to a canvas2d loop on useFrameLoop; microphone analysis replaced by a synthesized voice spectrum or an optional levels callback. Kept its processing wave and bar drawing.',
      'Added a recording timer, an accent color, bar density and corner radius parameters; the Alt + Space shortcut from the upstream demo moved into the component.',
      'shadcn Button / Skeleton, cva and lucide icons replaced by plain buttons and inline SVG; feedback hide timing uses the frame loop instead of setTimeout. Reduced motion draws still bars.',
    ],
    assets: [],
  },
})
