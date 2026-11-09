import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'ai-reasoning-trace',
  status: 'published',
  title: { 'zh-CN': '思考过程折叠块', en: 'Reasoning Trace' },
  summary: {
    'zh-CN': '模型思考时，流光的「Thinking」和计时器下面逐字流出推理过程，自动滚到底部，顶部渐隐；开始回答后自己折叠成「Thought for 9s」，也可以点「Answer now」提前结束。适合推理模型对话和研究助手。',
    en: 'While the model reasons, a shimmering "Thinking" label and a live timer sit above reasoning that streams in and auto-scrolls under a fade. When the answer starts it folds into "Thought for 9s"; "Answer now" cuts it short. For reasoning-model chats and research assistants.',
  },
  kind: 'component',
  category: 'chat',
  tags: ['ai', 'reasoning', 'thinking', 'chat', 'collapsible', 'streaming', 'shimmer'],
  runtime: ['react', 'css'],
  entry: { file: 'ai-reasoning-trace.tsx', export: 'ReasoningTrace' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'ai-reasoning-trace.tsx', role: 'component' },
    { path: 'ai-reasoning-trace.css', role: 'style' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '思考中文案', en: 'Thinking label' }, default: 'Thinking', maxLength: 32 },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '左侧竖线', en: 'Rail color' }, default: '#334155' },
    { key: 'shimmerSpeed', type: 'number', group: 'motion', label: { 'zh-CN': '流光一轮用时', en: 'Shimmer cycle' }, default: 4, min: 1.5, max: 8, step: 0.1, unit: 's', safe: [2.5, 6] },
    { key: 'streamSpeed', type: 'number', group: 'motion', label: { 'zh-CN': '演示输出速度', en: 'Demo stream speed' }, hint: { 'zh-CN': '只影响演示：每秒输出多少字符', en: 'Demo only: characters per second' }, default: 33, min: 15, max: 120, step: 1, safe: [25, 70] },
    { key: 'autoCollapse', type: 'boolean', group: 'interaction', label: { 'zh-CN': '结束后自动折叠', en: 'Auto-collapse' }, default: true },
    { key: 'showTimer', type: 'boolean', group: 'content', label: { 'zh-CN': '显示计时', en: 'Show timer' }, default: true },
    { key: 'maxHeight', type: 'number', group: 'layout', label: { 'zh-CN': '内容最大高度', en: 'Max height' }, default: 160, min: 96, max: 320, step: 4, unit: 'px', safe: [120, 240] },
    { key: 'fadeMask', type: 'boolean', group: 'look', label: { 'zh-CN': '顶部渐隐', en: 'Top fade' }, default: true },
  ],
  presets: [
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { accent: '#334155', shimmerSpeed: 4, maxHeight: 160, fadeMask: true } },
    { id: 'violet', name: { 'zh-CN': '暮紫', en: 'Dusk Violet' }, values: { accent: '#8b5cf6', shimmerSpeed: 3, maxHeight: 200, fadeMask: true } },
    { id: 'open-log', name: { 'zh-CN': '摊开的草稿', en: 'Open Notebook' }, values: { accent: '#14b8a6', shimmerSpeed: 5, autoCollapse: false, maxHeight: 128, fadeMask: false } },
  ],
  dependencies: ['@motif/runtime'],
  guidance: {
    rules: [
      'Pass the streamed text as reasoning and toggle isStreaming; the panel opens when streaming starts and folds when it ends (autoCollapse). Pass seconds if you track elapsed time yourself, otherwise it is measured while streaming.',
      'onStop renders the "Answer now" link; hide it once the answer has started.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 7, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'prompt-kit',
      repo: 'ibelick/prompt-kit',
      sha: '5a9496635cc0e1bf7679fe2a9e35d9b36b99c08a',
      paths: [
        'components/prompt-kit/reasoning.tsx',
        'components/prompt-kit/thinking-bar.tsx',
        'components/prompt-kit/text-shimmer.tsx',
        'app/globals.css',
        'app/docs/reasoning/reasoning-basic.tsx',
        'app/docs/thinking-bar/thinking-bar-interactive.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Julien Thibeaut'],
    },
    modifications: [
      'Kept Reasoning / ReasoningTrigger / ReasoningContent, ThinkingBar and TextShimmer in one file and composed them into a ReasoningTrace component with a live timer and a "Thought for Ns" summary.',
      'lucide chevrons became inline SVG; the max-height + scrollHeight transition became a grid-template-rows transition; the markdown body became plain paragraphs.',
      'Added a scroll area with a max height, auto-scroll while streaming, an optional top fade mask, an autoCollapse switch, aria-expanded / aria-controls and a rail color parameter.',
      'The shimmer keyframes moved into the item CSS file and stop under reduced motion. The demo streams text from useFrameLoop time instead of setTimeout.',
    ],
    assets: [],
  },
})
