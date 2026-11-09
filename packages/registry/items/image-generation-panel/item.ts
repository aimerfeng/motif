import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'image-generation-panel',
  status: 'published',
  title: { 'zh-CN': '文生图控制台', en: 'Image Generation Panel' },
  summary: {
    'zh-CN': '文生图的操作台：提示词输入框配风格标签和画幅切换，下面一组结果图先是模糊的马赛克，在一道扫描光下逐张变清晰，每张有百分比和种子号，出图后可以挑选、下载或再出变体。适合创作类 AI 产品和模型试玩页。',
    en: 'A text-to-image console: a prompt composer with style chips and an aspect-ratio switch, above a batch of tiles that each resolve from a blurred mosaic to sharp under a travelling scan line, with live percentages and seeds, then select, download and variation actions. For creative AI products and model playgrounds.',
  },
  kind: 'component',
  category: 'chat',
  tags: ['ai', 'image generation', 'text to image', 'prompt', 'progress', 'mosaic', 'scan', 'playground'],
  runtime: ['react', 'motion', 'canvas2d'],
  entry: { file: 'image-generation-panel.tsx', export: 'ImageGenerationPanel' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'image-generation-panel.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'count', type: 'number', group: 'layout', label: { 'zh-CN': '每批张数', en: 'Images per batch' }, default: 4, min: 1, max: 4, step: 1, safe: [2, 4] },
    {
      key: 'aspectRatio',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '画幅', en: 'Aspect ratio' },
      hint: { 'zh-CN': '初始画幅，面板里的切换按钮仍可改', en: 'Initial ratio; the switch in the panel can still change it' },
      default: '16 / 9',
      options: [
        { value: '1 / 1', label: { 'zh-CN': '1:1 方图', en: '1:1 square' } },
        { value: '4 / 5', label: { 'zh-CN': '4:5 竖图', en: '4:5 portrait' } },
        { value: '16 / 9', label: { 'zh-CN': '16:9 横图', en: '16:9 wide' } },
      ],
    },
    {
      key: 'composerPlacement',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '输入框位置', en: 'Composer placement' },
      default: 'top',
      options: [
        { value: 'top', label: { 'zh-CN': '结果上方', en: 'Above the tiles' } },
        { value: 'bottom', label: { 'zh-CN': '结果下方', en: 'Below the tiles' } },
      ],
    },
    {
      key: 'chrome',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '外框', en: 'Chrome' },
      hint: { 'zh-CN': '精简模式去掉标题栏、底栏和种子号', en: 'Minimal drops the header, footer and seed readout' },
      default: 'full',
      options: [
        { value: 'full', label: { 'zh-CN': '完整', en: 'Full' } },
        { value: 'minimal', label: { 'zh-CN': '精简', en: 'Minimal' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '扫描光、进度条、状态点和光标', en: 'Scan trail, progress bars, status dot and caret' }, default: '#fe65b0' },
    { key: 'scanDuration', type: 'number', group: 'motion', label: { 'zh-CN': '扫描一遍的时长', en: 'Scan pass duration' }, default: 1.9, min: 1, max: 3.5, step: 0.1, unit: 's', safe: [1.4, 2.6] },
    { key: 'model', type: 'text', group: 'content', label: { 'zh-CN': '模型名', en: 'Model name' }, default: 'atelier-diffusion v2', maxLength: 28 },
  ],
  presets: [
    { id: 'neon-bloom', name: { 'zh-CN': '霓虹花', en: 'Neon Bloom' }, values: { count: 4, aspectRatio: '16 / 9', composerPlacement: 'top', chrome: 'full', accent: '#fe65b0', scanDuration: 1.9 } },
    { id: 'darkroom', name: { 'zh-CN': '暗房', en: 'Darkroom' }, values: { count: 4, aspectRatio: '1 / 1', composerPlacement: 'bottom', chrome: 'minimal', accent: '#f59e0b', scanDuration: 2.4 } },
    { id: 'cyanotype', name: { 'zh-CN': '蓝晒', en: 'Cyanotype' }, values: { count: 2, aspectRatio: '4 / 5', composerPlacement: 'top', chrome: 'full', accent: '#38bdf8', scanDuration: 1.5, model: 'cyan-xl turbo' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'The panel does not generate anything: pass images (src plus an optional tiny preview for the mosaic pass) and a 0-1 progress from your job, and drive status yourself or let onGenerate resolve to run the built-in queued -> generating -> done cycle.',
      'A preview of 16-48 px is what makes the first pass read as a colour mosaic of the real result; without it the full image is pixelated instead.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { posterTime: 4.9, loop: 9 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: [
        'packages/smoothui/components/image-generation-panel/index.tsx',
        'packages/smoothui/components/ai-prompt-input/index.tsx',
        'packages/smoothui/components/ai-loader/index.tsx',
        'packages/smoothui/components/ai-core/index.tsx',
        'apps/docs/examples/image-generation-panel.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Inlined the parts of AIPromptInput (textarea, auto-grow, send/stop button), the AILoader dots variant and the AI state speeds the panel uses; dropped attachments and the character counter.',
      'lucide icons replaced with hand-drawn inline SVG; cn comes from @motif/runtime; the brand colour is an accent parameter and the scan pass duration is a parameter.',
      'aspectRatio is the initial ratio (the ratio switch keeps working and onAspectRatioChange still fires); three tiles sit in one row instead of leaving a gap.',
      'The queued -> generating frame gap uses requestAnimationFrame instead of setTimeout; gradients use Tailwind v4 bg-linear-* names.',
      'Demo: the scripted typing / queue / resolve cycle runs on the useFrameLoop clock, and the result images are procedural colour-field canvases with film grain plus tiny previews for the mosaic pass; pressing or focusing the panel stops the script.',
    ],
    assets: [],
  },
})
