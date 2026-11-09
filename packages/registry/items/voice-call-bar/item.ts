import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'voice-call-bar',
  status: 'published',
  title: { 'zh-CN': '语音通话控制条', en: 'Voice Call Bar' },
  summary: {
    'zh-CN': '和语音助手通话用的控制条：左边是实时波形和助手名字，右边是静音、键盘和拨号键；点开键盘会展开一个输入框，拨号键接通后变成挂断，带连接中、已接通和连接失败三种状态。适合客服挂件、语音优先的应用和产品内助手。',
    en: 'A control bar for talking to a voice agent: a live waveform with the agent’s name, then mute, keyboard and call buttons. The keyboard slides open a text box for typed messages and the call button turns into end-call, with connecting, connected and error states. For support widgets, voice-first apps and in-product assistants.',
  },
  kind: 'component',
  category: 'audio',
  tags: ['voice', 'call', 'agent', 'waveform', 'assistant', 'support', 'a11y'],
  runtime: ['react', 'canvas2d'],
  entry: { file: 'voice-call-bar.tsx', export: 'VoiceCallBar' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'voice-call-bar.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'agentName', type: 'text', group: 'content', label: { 'zh-CN': '助手名称', en: 'Agent name' }, hint: { 'zh-CN': '未接通时显示在波形位置', en: 'Shown in the waveform slot while idle' }, default: 'Customer Support', maxLength: 24 },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '发送按钮和焦点环', en: 'Send button and focus ring' }, default: '#fafafa' },
    { key: 'surface', type: 'color', group: 'look', label: { 'zh-CN': '底色', en: 'Surface' }, default: '#0a0a0a' },
    { key: 'waveColor', type: 'color', group: 'look', label: { 'zh-CN': '波形颜色', en: 'Waveform color' }, default: '#d4d4d8' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 14, min: 4, max: 24, step: 1, unit: 'px', safe: [8, 20] },
    { key: 'width', type: 'number', group: 'layout', label: { 'zh-CN': '最大宽度', en: 'Max width' }, default: 448, min: 280, max: 560, step: 8, unit: 'px', safe: [320, 512] },
    { key: 'allowTyping', type: 'boolean', group: 'interaction', label: { 'zh-CN': '允许打字', en: 'Allow typing' }, default: true },
    {
      key: 'position',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '位置', en: 'Position' },
      hint: { 'zh-CN': '悬浮时贴在最近的定位父元素底部', en: 'Floating pins it to the bottom of the nearest positioned parent' },
      default: 'inline',
      options: [
        { value: 'inline', label: { 'zh-CN': '随文档流', en: 'Inline' } },
        { value: 'floating', label: { 'zh-CN': '悬浮底部', en: 'Floating' } },
      ],
    },
  ],
  presets: [
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { accent: '#fafafa', surface: '#0a0a0a', waveColor: '#d4d4d8', radius: 14 } },
    { id: 'paper', name: { 'zh-CN': '白纸', en: 'Paper' }, values: { accent: '#18181b', surface: '#fafafa', waveColor: '#3f3f46', radius: 18, position: 'floating' } },
    { id: 'tide', name: { 'zh-CN': '潮汐', en: 'Tide' }, values: { accent: '#38bdf8', surface: '#0c1a2b', waveColor: '#7dd3fc', radius: 22 } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'Not wired to any voice SDK: pass onStartSession (return a promise to show "connecting"; reject for the error state), onEndSession and onSendMessage, or control status yourself.',
      'Pass an AnalyserNode as analyser to draw the real microphone or agent audio; without it the waveform is simulated.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 6, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'elevenlabs-ui',
      repo: 'elevenlabs/ui',
      sha: '23c31bd3088814215a8b5d0bfb56b327cad1a578',
      paths: [
        'apps/www/registry/elevenlabs-ui/ui/conversation-bar.tsx',
        'apps/www/registry/elevenlabs-ui/ui/live-waveform.tsx',
        'apps/www/registry/elevenlabs-ui/blocks/voice-chat-03/page.tsx',
        'apps/www/registry/elevenlabs-ui/examples/conversation-bar-demo.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Eleven Labs Inc.'],
    },
    modifications: [
      'Replaced the @elevenlabs/react conversation hooks with a local status state machine (optionally controlled) and onStartSession / onEndSession / onSendMessage callbacks.',
      'Inlined the static mode of LiveWaveform, driven by useFrameLoop; microphone capture removed in favour of an optional AnalyserNode prop and a simulated voice spectrum.',
      'Replaced shadcn Card / Button / Textarea / Separator and lucide icons with hand-written markup and inline SVG; added aria labels and an aria-live status.',
      'Added agent name, accent, surface, waveform color, radius, width, typing and position params; ink is picked by surface luminance; an error label replaces the name on failure.',
      'Replaced transition-all with explicit transition properties; reduced motion disables the transitions and freezes the waveform.',
    ],
    assets: [],
  },
})
