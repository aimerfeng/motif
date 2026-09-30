import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'input-otp',
  status: 'published',
  title: { 'zh-CN': '验证码输入', en: 'OTP Input' },
  summary: {
    'zh-CN': '一排格子里逐位弹入数字，光标闪烁，填错会抖动变红，通过后数字依次跳起变绿。粘贴和短信自动填充都是原生行为。适合登录二次验证和邮箱确认。',
    en: 'Digits pop into a row of slots with a blinking caret; wrong codes shake red and correct ones hop green in sequence. Paste and SMS autofill just work. Made for two-step sign-in and email confirmation.',
  },
  kind: 'component',
  category: 'input',
  tags: ['otp', 'verification', 'code', 'sign-in', 'input', 'a11y', 'autofill'],
  runtime: ['react', 'motion'],
  entry: { file: 'input-otp.tsx', export: 'InputOtp' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'input-otp.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'length', type: 'number', group: 'layout', label: { 'zh-CN': '位数', en: 'Length' }, default: 6, min: 4, max: 8, step: 1, safe: [4, 6] },
    {
      key: 'variant',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '样式', en: 'Variant' },
      default: 'boxes',
      options: [
        { value: 'boxes', label: { 'zh-CN': '方格', en: 'Boxes' } },
        { value: 'underline', label: { 'zh-CN': '下划线', en: 'Underline' } },
      ],
    },
    { key: 'color', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#818cf8' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 0, max: 26, step: 1, unit: 'px', safe: [6, 20] },
    { key: 'size', type: 'number', group: 'layout', label: { 'zh-CN': '格子尺寸', en: 'Slot size' }, default: 52, min: 36, max: 64, step: 1, unit: 'px', safe: [42, 60] },
    { key: 'separator', type: 'boolean', group: 'layout', label: { 'zh-CN': '中间分隔线', en: 'Middle separator' }, hint: { 'zh-CN': '仅偶数位、方格样式', en: 'Even lengths, boxes only' }, default: true },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹入弹簧', en: 'Pop-in spring' }, default: { visualDuration: 0.28, bounce: 0.35 } },
  ],
  presets: [
    { id: 'indigo-six', name: { 'zh-CN': '靛蓝', en: 'Indigo' }, values: { length: 6, variant: 'boxes', color: '#818cf8', radius: 12, size: 52 } },
    { id: 'pin-four', name: { 'zh-CN': '四位 PIN', en: 'Four-digit PIN' }, values: { length: 4, variant: 'boxes', color: '#f472b6', radius: 20, size: 60, separator: false, spring: { visualDuration: 0.4, bounce: 0.5 } } },
    { id: 'terminal', name: { 'zh-CN': '终端', en: 'Terminal' }, values: { length: 6, variant: 'boxes', color: '#4ade80', radius: 2, size: 48, spring: { visualDuration: 0.2, bounce: 0.05 } } },
    { id: 'underline-eight', name: { 'zh-CN': '细线八位', en: 'Hairline Eight' }, values: { length: 8, variant: 'underline', color: '#fbbf24', size: 44, spring: { visualDuration: 0.3, bounce: 0.2 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use for one-time codes: 2FA, email or SMS confirmation, PIN entry.'],
    rules: [
      'Drive feedback through the status prop (idle, error, success); the component only animates it. Validate in onComplete and set the status yourself.',
      'One real input sits under the slots, so keep autoComplete="one-time-code" and do not replace it with separate inputs. Set charset="alphanumeric" for letter codes.',
      'Always provide a visible heading and a label prop for screen readers ("Verification code").',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.6, posterTime: 9.6, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'input-otp',
      repo: 'guilhermerodz/input-otp',
      sha: 'cf81845e59ff43c5885c66b4755085a36f071cc1',
      paths: ['packages/input-otp/src/input.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2024 Guilherme Rodz'],
    },
    modifications: [
      'Kept the idea of one transparent native input laid over display-only slots (paste, autofill and backspace stay native); the selection tracking, password-manager badge and timeout helpers were replaced by an append-only caret pinned to the end.',
      'Slots are rendered by the component with motion: digits pop in on a spring, a caret blinks in the active slot, errors shake the row and success makes the digits hop in sequence.',
      'Added boxes / underline variants, an accent color, radius, size, separator and a status prop; a focused prop lets the demo autoplay show the focus state.',
    ],
    assets: [],
  },
})
