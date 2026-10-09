import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'switchboard-card',
  status: 'published',
  title: { 'zh-CN': '点阵灯牌卡片', en: 'Switchboard Card' },
  summary: {
    'zh-CN': '卡片上方是一块 LED 点阵面板：文字用 3×5 点阵一格一格点亮，停留片刻后依次熄灭，周围零星的灯随机闪烁。适合直播状态、系统在线提示或带个性的功能入口卡。',
    en: 'A card with an LED matrix on top: text lights up cell by cell in a 3×5 dot font, holds, then switches off in sequence while stray lamps twinkle around it. Made for live status, system-online notices or a feature card with some character.',
  },
  kind: 'effect',
  category: 'card',
  tags: ['led', 'dot-matrix', 'canvas', 'card', 'status', 'lights', 'glow'],
  runtime: ['react', 'canvas2d'],
  entry: { file: 'switchboard-card.tsx', export: 'SwitchboardCard' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'switchboard-card.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'text', type: 'text', group: 'content', label: { 'zh-CN': '灯牌文字', en: 'Panel text' }, hint: { 'zh-CN': '字母、数字和 - ! . 空格', en: 'Letters, digits and - ! . space' }, default: 'LIVE', maxLength: 10 },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '灯光颜色', en: 'Lamp color' }, default: '#ffb224' },
    {
      key: 'shape',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '灯珠形状', en: 'Lamp shape' },
      default: 'round',
      options: [
        { value: 'round', label: { 'zh-CN': '圆形', en: 'Round' } },
        { value: 'square', label: { 'zh-CN': '方形', en: 'Square' } },
      ],
    },
    { key: 'cell', type: 'number', group: 'layout', label: { 'zh-CN': '灯距', en: 'Lamp pitch' }, default: 9, min: 7, max: 20, step: 1, unit: 'px', safe: [8, 16] },
    { key: 'glow', type: 'number', group: 'look', label: { 'zh-CN': '辉光', en: 'Glow' }, default: 1, min: 0.3, max: 1.6, step: 0.05, safe: [0.6, 1.4] },
    { key: 'ambient', type: 'number', group: 'motion', label: { 'zh-CN': '环境闪烁', en: 'Ambient twinkle' }, hint: { 'zh-CN': '文字以外闪烁的灯所占比例', en: 'Share of the other lamps that twinkle' }, default: 0.12, min: 0, max: 0.3, step: 0.01, safe: [0.04, 0.22] },
    { key: 'speed', type: 'number', group: 'motion', label: { 'zh-CN': '速度', en: 'Speed' }, default: 1, min: 0.5, max: 2, step: 0.05, unit: 'x', safe: [0.7, 1.6] },
  ],
  presets: [
    { id: 'broadcast', name: { 'zh-CN': '直播间', en: 'Broadcast' }, values: { text: 'LIVE', color: '#ffb224', shape: 'round', cell: 9, glow: 1, ambient: 0.12, speed: 1 } },
    { id: 'signal', name: { 'zh-CN': '信号绿', en: 'Signal' }, values: { text: 'OK', color: '#4ade80', shape: 'square', cell: 12, glow: 0.8, ambient: 0.08, speed: 1.2 } },
    { id: 'cold-room', name: { 'zh-CN': '冷库', en: 'Cold Room' }, values: { text: 'OPEN', color: '#7dd3fc', shape: 'round', cell: 8, glow: 1.2, ambient: 0.2, speed: 0.8 } },
    { id: 'night-market', name: { 'zh-CN': '夜市', en: 'Night Market' }, values: { text: 'HI!', color: '#ff4d8d', shape: 'round', cell: 12, glow: 1.4, ambient: 0.16, speed: 1.1 } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'The panel is decorative (a canvas with role="img"); put the real status in the title and subtitle so it is readable without the animation.',
      'Keep the text to a few short, uppercase words; the dot font scales up in whole lamp steps until it fills the panel, long text stays at 1 lamp per dot.',
      'The card uses its own dark surface on purpose; place it on a dark or neutral page rather than restyling its colors.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.2, posterTime: 4.2, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/switchboard-card/index.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Re-drew the light grid on a 2D canvas with a pre-rendered glow sprite instead of one DOM node per lamp; the grid fills the panel using a lamp pitch parameter.',
      'Replaced the randomized setInterval state machine with a deterministic, time-driven animation (left-to-right switch-on, hold, switch-off, plus seeded ambient twinkle) so it pauses off-screen and renders a stable still under reduced motion.',
      'Added a built-in 3×5 dot font so the panel can spell text; removed the link/button wrappers and the gridPattern API; colors are parameters instead of a site theme token.',
    ],
    assets: [],
  },
})
