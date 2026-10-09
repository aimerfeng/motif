import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'speed-dial',
  status: 'published',
  title: { 'zh-CN': '快捷拨号按钮', en: 'Speed Dial' },
  summary: {
    'zh-CN': '一个朱红色的悬浮按钮，点开后一排白色圆形动作带着弹性依次弹出，旁边带文字标签，主按钮的加号同时转成叉。支持键盘和点外面收起。适合笔记、邮箱、相册这类应用的快捷创建入口。',
    en: 'A vermilion floating button that springs open into a stack of white round actions with text labels while its plus turns into a cross. Keyboard friendly and closes on outside click. A quick-create entry for notes, mail and gallery apps.',
  },
  kind: 'component',
  category: 'menu',
  tags: ['fab', 'speed-dial', 'floating', 'menu', 'actions', 'spring', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'speed-dial.tsx', export: 'SpeedDial' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'speed-dial.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'direction', type: 'select', label: { 'zh-CN': '展开方向', en: 'Direction' }, default: 'up', options: [{ value: 'up', label: { 'zh-CN': '向上', en: 'Up' } }, { value: 'down', label: { 'zh-CN': '向下', en: 'Down' } }, { value: 'left', label: { 'zh-CN': '向左', en: 'Left' } }, { value: 'right', label: { 'zh-CN': '向右', en: 'Right' } }], group: 'layout' },
    { key: 'size', type: 'number', label: { 'zh-CN': '主按钮大小', en: 'Button size' }, default: 56, min: 44, max: 80, step: 2, unit: 'px', safe: [48, 72], group: 'layout' },
    { key: 'radius', type: 'number', label: { 'zh-CN': '圆角', en: 'Corner radius' }, hint: { 'zh-CN': '大于半径即为正圆', en: 'Anything above half the size is a full circle' }, default: 28, min: 8, max: 40, step: 1, unit: 'px', safe: [14, 40], group: 'look' },
    { key: 'color', type: 'color', label: { 'zh-CN': '主按钮颜色', en: 'Button color' }, default: '#f2542d', group: 'color' },
    { key: 'surface', type: 'color', label: { 'zh-CN': '动作按钮底色', en: 'Action surface' }, default: '#ffffff', group: 'color' },
    { key: 'ink', type: 'color', label: { 'zh-CN': '图标与标签颜色', en: 'Icon and label ink' }, default: '#1f2430', group: 'color' },
    { key: 'showLabels', type: 'boolean', label: { 'zh-CN': '显示文字标签', en: 'Show labels' }, hint: { 'zh-CN': '只在向上、向下展开时显示', en: 'Only shown when opening up or down' }, default: true, group: 'look' },
    { key: 'spring', type: 'spring', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.38, bounce: 0.3 }, group: 'motion' },
  ],
  presets: [
    { id: 'vermilion', name: { 'zh-CN': '朱砂', en: 'Vermilion' }, values: { color: '#f2542d', surface: '#ffffff', ink: '#1f2430', radius: 28 } },
    { id: 'pine', name: { 'zh-CN': '松针', en: 'Pine' }, values: { color: '#14532d', surface: '#ecfdf3', ink: '#14532d', radius: 18, spring: { visualDuration: 0.34, bounce: 0.15 } } },
    { id: 'ink-square', name: { 'zh-CN': '墨方', en: 'Ink Square' }, values: { color: '#111827', surface: '#ffffff', ink: '#111827', radius: 12, size: 52, spring: { visualDuration: 0.28, bounce: 0.05 } } },
    { id: 'bubblegum', name: { 'zh-CN': '泡泡糖', en: 'Bubblegum' }, values: { color: '#ec4899', surface: '#fff1f8', ink: '#9d174d', radius: 40, size: 64, spring: { visualDuration: 0.45, bounce: 0.5 } } },
    { id: 'row', name: { 'zh-CN': '横排', en: 'Row' }, values: { direction: 'right', color: '#2563eb', surface: '#eff6ff', ink: '#1d4ed8', radius: 16, showLabels: false } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    use: ['Use for a primary create action that fans out into two to five related creations (new note, photo, link). A single action should be a plain button.'],
    rules: [
      'Pass your own actions as { key, label, icon, onSelect }; every action needs a label because it is the accessible name. Keep it to five or fewer.',
      'Place the root with absolute or fixed positioning in a corner, and pick a direction that opens toward free space.',
      'Keyboard: the trigger opens the menu and moves focus to the first action; arrow keys step along the direction, Home / End jump, Escape closes and returns focus.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 2, posterTime: 3, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'animata',
      repo: 'codse/animata',
      sha: '36674e4e9cfdc0f237693d8b736a2bf41065ca1d',
      paths: ['animata/fabs/speed-dial.tsx', 'animata/fabs/speed-dial.css'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Animata'],
    },
    modifications: [
      'Kept the interaction model (a toggle button with an expanding menu, four directions, outside-click close, arrow keys / Home / End / Escape, menu roles). Items are now always mounted and animated with a motion spring (staggered open, reverse-staggered close) instead of CSS keyframes on conditionally rendered list items, which allows a closing animation.',
      'lucide-react icons were replaced with inline SVGs; the action list defaults to four sample actions and can be replaced; added text labels for vertical directions and size, radius, color, surface, ink and spring parameters.',
      'Added a controlled open prop; focus moves into the menu only when the user opens it. Motif improvement: with prefers-reduced-motion items appear and disappear without motion.',
    ],
    assets: [],
  },
})
