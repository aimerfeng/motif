import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'relative-time-zones',
  status: 'published',
  title: { 'zh-CN': '多时区时间戳', en: 'Timestamp with Time Zones' },
  summary: {
    'zh-CN': '「3 小时前」这样的相对时间，悬停或聚焦时弹出同一时刻在 UTC 和几个城市的日期与时间，带昼夜标记；也能直接当世界时钟列表用。适合日志、部署记录和跨时区团队。',
    en: 'A relative timestamp like "3 hours ago" that, on hover or focus, shows the same moment in UTC and a few cities with day/night marks; also works as an always-on world clock list. For logs, deploys and distributed teams.',
  },
  kind: 'component',
  category: 'popover',
  tags: ['time', 'timezone', 'timestamp', 'clock', 'popover', 'relative-time'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'relative-time-zones.tsx', export: 'RelativeTimeZones' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'relative-time-zones.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'variant',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '形式', en: 'Variant' },
      default: 'popover',
      options: [
        { value: 'popover', label: { 'zh-CN': '相对时间 + 弹层', en: 'Relative + popover' } },
        { value: 'list', label: { 'zh-CN': '世界时钟列表', en: 'World clock list' } },
      ],
    },
    {
      key: 'zones',
      type: 'select',
      group: 'content',
      label: { 'zh-CN': '时区组', en: 'Zones' },
      default: 'team',
      options: [
        { value: 'team', label: { 'zh-CN': 'UTC / 纽约 / 伦敦 / 东京', en: 'UTC / New York / London / Tokyo' } },
        { value: 'americas', label: { 'zh-CN': '美洲', en: 'Americas' } },
        { value: 'apac', label: { 'zh-CN': '亚太', en: 'Asia-Pacific' } },
      ],
    },
    { key: 'hour12', type: 'boolean', group: 'content', label: { 'zh-CN': '12 小时制', en: '12-hour clock' }, default: false },
    { key: 'showSeconds', type: 'boolean', group: 'content', label: { 'zh-CN': '显示秒', en: 'Show seconds' }, default: true },
    { key: 'showDayNight', type: 'boolean', group: 'look', label: { 'zh-CN': '昼夜标记', en: 'Day/night marks' }, default: true },
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '用于下划线和太阳图标', en: 'Used for the underline and the sun icon' }, default: '#38bdf8' },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 10, min: 0, max: 20, step: 1, unit: 'px', safe: [6, 16] },
  ],
  presets: [
    { id: 'harbor', name: { 'zh-CN': '港湾', en: 'Harbor' }, values: { variant: 'popover', zones: 'team', accent: '#38bdf8', radius: 10 } },
    { id: 'night-shift', name: { 'zh-CN': '夜班', en: 'Night Shift' }, values: { variant: 'list', zones: 'apac', hour12: true, showSeconds: false, accent: '#fbbf24', radius: 14 } },
    { id: 'relay', name: { 'zh-CN': '接力', en: 'Relay' }, values: { variant: 'popover', zones: 'americas', hour12: true, accent: '#34d399', radius: 6 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Pass `date` (the event moment) for the popover variant; pass `time` to control "now", or omit it to tick live once per second.',
      'Use `zoneList` for custom zones (IANA names). The compound parts (RelativeTime, RelativeTimeZone, RelativeTimeZoneLabel/Date/Display) are exported for custom layouts.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.6, posterTime: 1.2, loop: 9.6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'kibo',
      repo: 'shadcnblocks/kibo',
      sha: '3d63cdb15b79d972e3dc38a10997987672f9b263',
      paths: ['packages/relative-time/index.tsx', 'apps/docs/examples/relative-time.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 — Present shadcnblocks'],
    },
    modifications: [
      'Replaced @radix-ui/react-use-controllable-state with local state and the setInterval clock with a useFrameLoop-driven once-per-second tick; cn comes from @motif/runtime.',
      'Added a RelativeTimeZones preset component: a relative timestamp that opens the zone list in a popover on hover/focus (motion fade), or the plain world clock list from the upstream example.',
      'Added a day/night icon per zone, zone sets, 12-hour and seconds options, accent and corner radius parameters.',
    ],
    assets: [],
  },
})
