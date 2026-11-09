import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'scroll-kinetic-type',
  status: 'published',
  title: { 'zh-CN': '滚动呼吸字', en: 'Kinetic Scroll Type' },
  summary: {
    'zh-CN': '一句话随滚动「呼吸」：词语依次放大、拉开字距、上浮并加粗，像一道波从句首走到句尾，往回滚就倒着走。适合宣言段落、品牌主张和章节过渡。',
    en: 'A phrase that breathes with scroll: words scale up, open their tracking, lift and gain weight in turn, like a wave running through the line, and run back when you scroll up. For manifesto blocks, brand statements and section breaks.',
  },
  kind: 'effect',
  category: 'scroll',
  tags: ['scroll', 'kinetic', 'typography', 'variable-font', 'stagger', 'editorial'],
  runtime: ['react', 'motion'],
  entry: { file: 'scroll-kinetic-type.tsx', export: 'KineticTypeScroll' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'scroll-kinetic-type.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'words', type: 'text', group: 'content', label: { 'zh-CN': '文案', en: 'Phrase' }, hint: { 'zh-CN': '按空格拆成单词', en: 'Split into words on spaces' }, default: 'Design moves with intent and breathes on scroll', maxLength: 80 },
    { key: 'scaleRange', type: 'vec2', group: 'motion', label: { 'zh-CN': '缩放（静止 / 峰值）', en: 'Scale (rest / peak)' }, default: [0.92, 1.18], min: 0.8, max: 1.3, step: 0.01 },
    { key: 'trackingRange', type: 'vec2', group: 'motion', label: { 'zh-CN': '字距（静止 / 峰值）', en: 'Tracking (rest / peak)' }, hint: { 'zh-CN': '单位 px', en: 'In px' }, default: [-0.5, 2.5], min: -2, max: 5, step: 0.5 },
    { key: 'weightRange', type: 'vec2', group: 'motion', label: { 'zh-CN': '字重（静止 / 峰值）', en: 'Weight (rest / peak)' }, hint: { 'zh-CN': '需要可变字体', en: 'Needs a variable font' }, default: [380, 800], min: 300, max: 900, step: 10 },
    { key: 'liftRange', type: 'vec2', group: 'motion', label: { 'zh-CN': '上浮（静止 / 峰值）', en: 'Lift (rest / peak)' }, hint: { 'zh-CN': '单位 px，负数向上', en: 'In px, negative is up' }, default: [0, -12], min: -24, max: 8, step: 1 },
    { key: 'dimRange', type: 'vec2', group: 'look', label: { 'zh-CN': '不透明度（静止 / 峰值）', en: 'Opacity (rest / peak)' }, default: [0.45, 1], min: 0.3, max: 1, step: 0.05 },
    { key: 'stagger', type: 'number', group: 'motion', label: { 'zh-CN': '错开', en: 'Stagger' }, hint: { 'zh-CN': '相邻两个词峰值之间的滚动进度间隔', en: 'Scroll progress between neighbouring word peaks' }, default: 0.12, min: 0.04, max: 0.2, step: 0.01, safe: [0.06, 0.16] },
    {
      key: 'align',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '对齐', en: 'Align' },
      default: 'center',
      options: [
        { value: 'start', label: { 'zh-CN': '左', en: 'Start' } },
        { value: 'center', label: { 'zh-CN': '居中', en: 'Center' } },
        { value: 'end', label: { 'zh-CN': '右', en: 'End' } },
      ],
    },
    {
      key: 'font',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '字体', en: 'Font' },
      default: 'sans',
      options: [
        { value: 'sans', label: { 'zh-CN': '无衬线', en: 'Sans' } },
        { value: 'grotesk', label: { 'zh-CN': '怪诞体', en: 'Grotesk' } },
        { value: 'serif', label: { 'zh-CN': '衬线', en: 'Serif' } },
      ],
    },
  ],
  presets: [
    { id: 'breath', name: { 'zh-CN': '呼吸', en: 'Breath' }, values: {} },
    { id: 'manifesto', name: { 'zh-CN': '宣言', en: 'Manifesto' }, values: { font: 'grotesk', align: 'start', weightRange: [300, 900], scaleRange: [0.94, 1.22], liftRange: [0, -16] } },
    { id: 'whisper', name: { 'zh-CN': '低语', en: 'Whisper' }, values: { font: 'serif', dimRange: [0.35, 1], scaleRange: [0.97, 1.08], trackingRange: [0, 1.5], liftRange: [0, -6] } },
  ],
  dependencies: ['@motif/runtime', 'motion/react'],
  fonts: ['Inter Tight Variable', 'Bricolage Grotesque Variable', 'Fraunces Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    rules: [
      'Pass the scrolling ancestor as `container` when the phrase lives inside an overflow-y-auto element, and give that element position: relative so Motion measures offsets against it.',
    ],
  },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'smoothui',
      repo: 'educlopez/smoothui',
      sha: 'b6312bce2b6f2ed95d8a6e98a592857884f5ea9e',
      paths: ['packages/smoothui/components/kinetic-type-scroll/index.tsx', 'apps/docs/examples/kinetic-type-scroll.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Eduardo Calvo'],
    },
    modifications: [
      'Props come from the generated defaults region; the words array is a space-separated text param.',
      'Added a font select (Inter Tight, Bricolage Grotesque, Fraunces variable fonts).',
      'cn now comes from motif-runtime; the default export became a named export.',
      'The demo is adapted from the upstream example without the replay button and scroll hint.',
    ],
    assets: [],
  },
})
