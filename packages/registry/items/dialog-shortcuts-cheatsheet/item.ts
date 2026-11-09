import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'dialog-shortcuts-cheatsheet',
  status: 'published',
  title: { 'zh-CN': '快捷键速查面板', en: 'Keyboard Shortcuts Sheet' },
  summary: {
    'zh-CN': '按 ? 弹出的快捷键面板：按区域分组，键帽样式清楚，顶部输入框边打边筛，修饰键按 macOS 或 Windows 显示成 ⌘ 或 Ctrl。适合编辑器、后台和各种重度键盘操作的应用。',
    en: 'A "?" overlay listing shortcuts grouped by area with styled key caps, a filter box that narrows the list as you type, and modifiers shown as ⌘ or Ctrl per platform. For editors, dashboards and keyboard-heavy apps.',
  },
  kind: 'component',
  category: 'dialog',
  tags: ['dialog', 'keyboard', 'shortcuts', 'kbd', 'cheatsheet', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'dialog-shortcuts-cheatsheet.tsx', export: 'DialogShortcutsCheatsheet' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'dialog-shortcuts-cheatsheet.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'layout',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '布局', en: 'Layout' },
      default: 'columns',
      options: [
        { value: 'columns', label: { 'zh-CN': '两栏', en: 'Two columns' } },
        { value: 'list', label: { 'zh-CN': '分隔列表', en: 'Divided list' } },
      ],
    },
    {
      key: 'keycapStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '键帽', en: 'Key caps' },
      default: 'flat',
      options: [
        { value: 'flat', label: { 'zh-CN': '平底', en: 'Flat' } },
        { value: 'raised', label: { 'zh-CN': '凸起', en: 'Raised' } },
        { value: 'outline', label: { 'zh-CN': '描边', en: 'Outline' } },
      ],
    },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#6366f1' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Radius' }, default: 14, min: 4, max: 28, step: 1, unit: 'px', safe: [8, 20] },
    { key: 'showSearch', type: 'boolean', group: 'interaction', label: { 'zh-CN': '筛选框', en: 'Filter box' }, default: true },
    {
      key: 'platform',
      type: 'select',
      group: 'content',
      label: { 'zh-CN': '平台', en: 'Platform' },
      default: 'mac',
      options: [
        { value: 'mac', label: { 'zh-CN': 'macOS（⌘ ⇧ ⌥）', en: 'macOS (⌘ ⇧ ⌥)' } },
        { value: 'windows', label: { 'zh-CN': 'Windows（Ctrl Shift Alt）', en: 'Windows (Ctrl Shift Alt)' } },
      ],
    },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.22, bounce: 0.1 } },
  ],
  presets: [
    { id: 'studio', name: { 'zh-CN': '工作室', en: 'Studio' }, values: { layout: 'columns', keycapStyle: 'flat', accent: '#6366f1', radius: 14, platform: 'mac' } },
    { id: 'terminal', name: { 'zh-CN': '终端', en: 'Terminal' }, values: { layout: 'list', keycapStyle: 'outline', accent: '#22c55e', radius: 6, platform: 'windows' } },
    { id: 'typewriter', name: { 'zh-CN': '打字机', en: 'Typewriter' }, values: { layout: 'columns', keycapStyle: 'raised', accent: '#f59e0b', radius: 20, platform: 'mac', spring: { visualDuration: 0.3, bounce: 0.25 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: ['Detect the platform yourself (e.g. navigator.platform) and pass platform; key tokens "mod", "shift", "alt" and "enter" are mapped to ⌘/Ctrl, ⇧/Shift, ⌥/Alt, ↵/Enter.'],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.3, posterTime: 2.4, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: [
        'registry-reui/bases/base/components/dialog/c-dialog-9.tsx',
        'registry-reui/bases/base/components/kbd/c-kbd-6.tsx',
        'registry/bases/base/ui/kbd.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      'Replaced the base-ui Dialog primitives with a hand-rolled role="dialog" (focus trap, Esc and backdrop close, focus returns on close, "?" hotkey opens it).',
      'Kept the c-dialog-9 header, two-column shortcut grid and footer; the c-kbd-6 divided list is a layout option. Shortcuts are grouped by area.',
      'Added a filter box with match highlighting, platform-aware modifier symbols, and flat / raised / outline key caps; Kbd styles inlined from the ReUI style CSS.',
      'Accent, radius and spring come from params; open/close uses motion instead of tw-animate classes.',
    ],
    assets: [],
  },
})
