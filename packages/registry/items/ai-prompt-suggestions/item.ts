import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'ai-prompt-suggestions',
  status: 'published',
  title: { 'zh-CN': '提示词建议', en: 'Prompt Suggestions' },
  summary: {
    'zh-CN': '聊天输入框下方的空状态：一排分类胶囊（总结、代码、设计、调研），点开后换成整句提示词并高亮分类动词；输入时实时筛选并高亮匹配的字，方向键和回车就能选。适合 AI 助手首页和首次使用引导。',
    en: 'The empty state under a chat composer: category pills (Summary, Code, Design, Research) that swap into full prompts with the category verb highlighted, while typing filters the list and highlights the match; arrow keys and Enter pick one. For assistant home screens and first-run onboarding.',
  },
  kind: 'component',
  category: 'chat',
  tags: ['ai', 'chat', 'prompt', 'suggestions', 'autocomplete', 'empty state', 'composer'],
  runtime: ['react', 'motion'],
  entry: { file: 'ai-prompt-suggestions.tsx', export: 'PromptSuggestions' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'ai-prompt-suggestions.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '高亮文字和发送键', en: 'Highlighted words and the send button' }, default: '#a5b4fc' },
    {
      key: 'highlightStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '高亮样式', en: 'Highlight style' },
      default: 'text',
      options: [
        { value: 'text', label: { 'zh-CN': '文字着色', en: 'Colored text' } },
        { value: 'mark', label: { 'zh-CN': '底色标记', en: 'Marker' } },
        { value: 'underline', label: { 'zh-CN': '下划线', en: 'Underline' } },
      ],
    },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 24, min: 8, max: 28, step: 1, unit: 'px', safe: [14, 26] },
    {
      key: 'layout',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '胶囊排列', en: 'Pill layout' },
      default: 'wrap',
      options: [
        { value: 'wrap', label: { 'zh-CN': '换行', en: 'Wrap' } },
        { value: 'row', label: { 'zh-CN': '单行滚动', en: 'Scrolling row' } },
      ],
    },
    { key: 'maxItems', type: 'number', group: 'layout', label: { 'zh-CN': '最多条数', en: 'Max suggestions' }, default: 4, min: 2, max: 6, step: 1, safe: [3, 5] },
    { key: 'showIcons', type: 'boolean', group: 'layout', label: { 'zh-CN': '胶囊图标', en: 'Pill icons' }, default: true },
    { key: 'stagger', type: 'number', group: 'motion', label: { 'zh-CN': '依次出现间隔', en: 'Stagger' }, default: 0.04, min: 0, max: 0.12, step: 0.01, unit: 's', safe: [0.02, 0.08] },
    { key: 'placeholder', type: 'text', group: 'content', label: { 'zh-CN': '占位文案', en: 'Placeholder' }, default: 'Ask anything...', maxLength: 40 },
  ],
  presets: [
    { id: 'lavender', name: { 'zh-CN': '薰衣草', en: 'Lavender' }, values: { accent: '#a5b4fc', highlightStyle: 'text', radius: 24 } },
    { id: 'highlighter', name: { 'zh-CN': '荧光笔', en: 'Highlighter' }, values: { accent: '#fde047', highlightStyle: 'mark', radius: 16, showIcons: false } },
    { id: 'ink', name: { 'zh-CN': '墨线', en: 'Ink line' }, values: { accent: '#5eead4', highlightStyle: 'underline', radius: 12, layout: 'row' } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Pass your own groups as [{ label, highlight, items }]; highlight is the phrase emphasised in that group\'s prompts. onSubmit receives the final text; picking a suggestion only fills the input.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 3.3, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'prompt-kit',
      repo: 'ibelick/prompt-kit',
      sha: '5a9496635cc0e1bf7679fe2a9e35d9b36b99c08a',
      paths: [
        'components/prompt-kit/prompt-suggestion.tsx',
        'components/blocks/prompt-input-suggestions.tsx',
        'components/blocks/prompt-autocomplete-highlight.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Julien Thibeaut'],
    },
    modifications: [
      'Merged the PromptSuggestion component with the input-with-suggestions and autocomplete-highlight blocks into one component: category pills drill into prompts, and typing filters them with the match highlighted.',
      'shadcn Button / cva and the PromptInput wrapper became plain buttons and an auto-growing textarea; lucide icons became inline SVG.',
      'Added listbox keyboard navigation and aria wiring (combobox textarea, arrow keys, Enter, Escape) that upstream does not have, plus a back chip for the open category.',
      'Added accent, highlight style, radius, pill layout, max items, stagger and icon params, enter animations with motion/react and reduced-motion handling.',
    ],
    assets: [],
  },
})
