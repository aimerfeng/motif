import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'poll-results',
  status: 'published',
  title: { 'zh-CN': '投票结果', en: 'Poll' },
  summary: {
    'zh-CN': '一个问题加几个选项；投票后每个选项身后的进度条填到对应比例，百分比同步计数，你的选择会被标出来。适合社区帖子、功能调研和产品内问卷。',
    en: 'A question with options; once you vote, bars fill behind each label to their share while the percentages count up and your choice stays marked. For community posts, feature research and in-app surveys.',
  },
  kind: 'component',
  category: 'data',
  tags: ['poll', 'vote', 'survey', 'results', 'percentage', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'poll-results.tsx', export: 'PollResults' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'poll-results.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, default: '#6366f1' },
    {
      key: 'barStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '结果条', en: 'Result bar' },
      default: 'fill',
      options: [
        { value: 'fill', label: { 'zh-CN': '铺满选项', en: 'Fill behind' } },
        { value: 'track', label: { 'zh-CN': '行内细条', en: 'Inline track' } },
      ],
    },
    {
      key: 'indicator',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '选择标记', en: 'Indicator' },
      hint: { 'zh-CN': '复选框表示可多选', en: 'Checkbox allows several choices' },
      default: 'radio',
      options: [
        { value: 'radio', label: { 'zh-CN': '单选圆点', en: 'Radio' } },
        { value: 'checkbox', label: { 'zh-CN': '复选框', en: 'Checkbox' } },
        { value: 'none', label: { 'zh-CN': '不显示', en: 'None' } },
      ],
    },
    { key: 'radius', type: 'number', group: 'layout', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 0, max: 24, step: 1, unit: 'px', safe: [6, 18] },
    { key: 'revealDuration', type: 'number', group: 'motion', label: { 'zh-CN': '揭晓时长', en: 'Reveal duration' }, default: 0.5, min: 0.2, max: 2, step: 0.05, unit: 's', safe: [0.4, 1.2] },
    { key: 'showVotes', type: 'boolean', group: 'content', label: { 'zh-CN': '显示票数', en: 'Show vote count' }, default: true },
  ],
  presets: [
    { id: 'indigo', name: { 'zh-CN': '靛夜', en: 'Indigo Night' }, values: { accent: '#6366f1', barStyle: 'fill', indicator: 'radio', radius: 12, revealDuration: 0.5 } },
    { id: 'meadow', name: { 'zh-CN': '青野', en: 'Meadow' }, values: { accent: '#34d399', barStyle: 'track', indicator: 'checkbox', radius: 8, revealDuration: 0.9 } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#f97316', barStyle: 'fill', indicator: 'none', radius: 18, revealDuration: 1.2 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Results only appear once hasVoted is true: keep value + hasVoted in your state and flip hasVoted from a submit button (pass it as action).',
      'The compound ChoicePoll parts are exported too, for custom layouts.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.6, posterTime: 4.2, loop: 8 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'cult-ui',
      repo: 'nolly-studio/cult-ui',
      sha: 'ee98a5dd2e319b63cc2e707dd968d6af04209b7e',
      paths: ['apps/www/registry/default/ui/choice-poll.tsx', 'apps/www/registry/default/example/choice-poll-demo.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 Jordan-Gilliam'],
    },
    modifications: [
      'Replaced @radix-ui/react-use-controllable-state with a small local hook, class-variance-authority with plain class maps and the lucide Check icon with inline SVG.',
      'Result bars animate with motion scaleX instead of a CSS width transition; percentages count up with motion animate; reduced motion shows final values.',
      'Theme primary replaced by an accent color (check ink picked by luminance), plus corner radius and reveal duration props on Root.',
      'Voted options stay fully opaque; added aria-multiselectable on the listbox.',
      'Added a PollResults wrapper assembling the parts with Motif params (bar style, indicator, vote count).',
    ],
    assets: [],
  },
})
