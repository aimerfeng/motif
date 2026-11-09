import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'avatar-generative',
  status: 'published',
  title: { 'zh-CN': '生成式头像', en: 'Generative Avatar' },
  summary: {
    'zh-CN': '由任意名字或 ID 确定生成的 6×6 像素头像，像素各自脉动、呼吸，斜向波纹扫过，偶尔闪一下；同一个种子到哪里都是同一张脸。适合 AI 助手、机器人、新用户和没有照片的工作区。',
    en: 'A deterministic 6×6 pixel avatar generated from any name or ID: cells pulse and breathe, a diagonal wave sweeps across and the odd pixel sparkles. Same seed, same face everywhere. For agents, bots, new users and workspaces without a photo.',
  },
  kind: 'component',
  category: 'avatar',
  tags: ['avatar', 'identicon', 'generative', 'pixel', 'agent', 'canvas', 'fallback'],
  runtime: ['react', 'canvas2d'],
  entry: { file: 'avatar-generative.tsx', export: 'AvatarGenerative' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'avatar-generative.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'seed',
      type: 'text',
      group: 'content',
      label: { 'zh-CN': '种子', en: 'Seed' },
      hint: { 'zh-CN': '名字、邮箱或 ID，同一个种子总是同一张脸', en: 'A name, email or ID; the same seed always gives the same face' },
      default: 'atlas-agent',
      maxLength: 48,
    },
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '直径', en: 'Diameter' }, default: 64, min: 24, max: 160, step: 1, unit: 'px', safe: [32, 128] },
    { key: 'animated', type: 'boolean', group: 'motion', label: { 'zh-CN': '像素动画', en: 'Pixel animation' }, default: true },
    { key: 'speed', type: 'number', group: 'motion', label: { 'zh-CN': '速度', en: 'Speed' }, default: 1, min: 0.2, max: 3, step: 0.05, unit: 'x', safe: [0.5, 2] },
  ],
  presets: [
    { id: 'agent', name: { 'zh-CN': '助手', en: 'Agent' }, values: { seed: 'atlas-agent', size: 64, speed: 1 } },
    { id: 'beacon', name: { 'zh-CN': '信标', en: 'Beacon' }, values: { seed: 'beacon@orbitfield.io', size: 96, speed: 1.6 } },
    { id: 'still', name: { 'zh-CN': '静帧', en: 'Still' }, values: { seed: 'workspace-ledger', size: 48, animated: false } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.6, posterTime: 2, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/agent-avatar/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'The own requestAnimationFrame loop and matchMedia listener are replaced by motif-runtime useFrameLoop and usePrefersReducedMotion (pauses offscreen, static frame under reduced motion); added a speed parameter.',
      'cn comes from @motif/runtime; DPR is capped at 2; defaults moved into the generated defaults region; the style prop is merged.',
    ],
    assets: [],
  },
})
