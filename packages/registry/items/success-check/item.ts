import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'success-check',
  status: 'published',
  title: { 'zh-CN': '成功对勾', en: 'Success Check' },
  summary: {
    'zh-CN': '一笔一笔画出来的对勾：圆环描边、对勾落笔、轻轻回弹，再迸出一圈涟漪和粒子。四种形态：圆环、迸发、实心章、十二瓣印章。适合支付完成、保存成功和任务完成的确认页。',
    en: 'A checkmark that draws itself: the ring strokes in, the tick lands with a small pop, then a ripple and sparks burst out. Four forms: ring, burst, solid stamp and twelve-lobe seal. For completed payments, saved changes and finished tasks.',
  },
  kind: 'component',
  category: 'toast',
  tags: ['success', 'check', 'checkmark', 'confirmation', 'svg', 'draw', 'feedback'],
  runtime: ['react', 'svg'],
  entry: { file: 'success-check.tsx', export: 'SuccessCheck' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'success-check.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '形态', en: 'Form' },
      default: 'burst',
      options: [
        { value: 'burst', label: { 'zh-CN': '迸发', en: 'Burst' } },
        { value: 'circle', label: { 'zh-CN': '圆环', en: 'Ring' } },
        { value: 'stamp', label: { 'zh-CN': '实心章', en: 'Stamp' } },
        { value: 'seal', label: { 'zh-CN': '十二瓣印章', en: 'Seal' } },
      ],
    },
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '尺寸', en: 'Size' }, default: 96, min: 48, max: 200, step: 2, unit: 'px', safe: [64, 140] },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '颜色', en: 'Color' }, default: '#22c55e' },
    { key: 'thickness', type: 'number', group: 'look', label: { 'zh-CN': '线条粗细', en: 'Stroke' }, default: 5, min: 3, max: 9, step: 0.5, safe: [4, 7] },
    { key: 'duration', type: 'number', group: 'motion', label: { 'zh-CN': '绘制用时', en: 'Draw time' }, default: 1.2, min: 0.6, max: 2.4, step: 0.05, unit: 's', safe: [0.9, 1.6] },
    { key: 'loop', type: 'boolean', group: 'motion', label: { 'zh-CN': '循环播放', en: 'Loop' }, hint: { 'zh-CN': '关闭后只画一次并停在完成状态', en: 'When off, it draws once and stays complete' }, default: true },
    { key: 'hold', type: 'number', group: 'motion', label: { 'zh-CN': '循环间隔', en: 'Loop pause' }, hint: { 'zh-CN': '画完后停多久再重新开始', en: 'How long it rests before drawing again' }, default: 2.8, min: 0.5, max: 6, step: 0.1, unit: 's', safe: [1.5, 4] },
    { key: 'label', type: 'text', group: 'content', label: { 'zh-CN': '读屏文案', en: 'Screen reader label' }, default: 'Success', maxLength: 32 },
  ],
  presets: [
    { id: 'mint', name: { 'zh-CN': '薄荷', en: 'Mint' }, values: { variant: 'burst', color: '#22c55e', thickness: 5 } },
    { id: 'wax', name: { 'zh-CN': '蜡封', en: 'Wax' }, values: { variant: 'seal', color: '#8b5cf6', thickness: 5.5, duration: 1.3 } },
    { id: 'sun', name: { 'zh-CN': '暖阳', en: 'Sun' }, values: { variant: 'stamp', color: '#f59e0b', thickness: 6, duration: 1 } },
    { id: 'ink', name: { 'zh-CN': '墨线', en: 'Ink' }, values: { variant: 'circle', color: '#e4e4e7', thickness: 3.5, duration: 1.4 } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    use: ['Use once, at the moment a task is confirmed complete: payment done, changes saved, upload finished. Turn loop off in production so it draws once and rests.'],
    rules: [
      'Set label to what succeeded (for example "Payment successful"); the graphic is otherwise decorative.',
      'Pair it with a visible sentence; never rely on the check alone to convey the result.',
      'With reduced motion enabled it renders the finished mark immediately.',
    ],
  },
  capture: { zoom: 1.6, posterTime: 0.72, loop: 8 },
  provenance: {
    kind: 'original',
    modifications: [],
    assets: [],
  },
})
