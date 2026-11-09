import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'filter-chips-builder',
  status: 'published',
  title: { 'zh-CN': '筛选条件构建器', en: 'Filter Builder Chips' },
  summary: {
    'zh-CN': '每个筛选条件是一枚「字段 | 条件 | 值」胶囊，如「Status is any of Todo, Done」。点哪一段就打开哪种编辑器：选项、文本、数字、日期；胶囊带着弹簧增删，多选超出上限时折成一叠色点，行尾一键清除。适合任务列表、CRM 和数据分析。',
    en: 'Each filter is a field | operator | value chip, like "Status is any of Todo, Done". Click any part for the right editor (options, text, number, date); chips spring in and out, long multi-selects fold into a stack of dots, and a Clear button resets the bar. For issue lists, CRMs and analytics.',
  },
  kind: 'component',
  category: 'input',
  tags: ['filter', 'chips', 'query-builder', 'combobox', 'datepicker', 'toolbar', 'a11y'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'filter-chips-builder.tsx', export: 'Filters' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'filter-chips-builder.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'accent', type: 'color', group: 'look', label: { 'zh-CN': '强调色', en: 'Accent' }, hint: { 'zh-CN': '焦点环、高亮行、应用按钮和选中的日期', en: 'Focus ring, highlighted row, Apply button and the picked date' }, default: '#6366f1' },
    {
      key: 'chipStyle',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '胶囊样式', en: 'Chip style' },
      default: 'outline',
      options: [
        { value: 'outline', label: { 'zh-CN': '描边', en: 'Outline' } },
        { value: 'muted', label: { 'zh-CN': '字段段铺底', en: 'Muted field' } },
      ],
    },
    {
      key: 'size',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '尺寸', en: 'Size' },
      default: 'default',
      options: [
        { value: 'sm', label: { 'zh-CN': '紧凑', en: 'Small' } },
        { value: 'default', label: { 'zh-CN': '标准', en: 'Default' } },
      ],
    },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 8, min: 0, max: 14, step: 1, unit: 'px', safe: [4, 12] },
    { key: 'maxVisible', type: 'number', group: 'layout', label: { 'zh-CN': '徽章上限', en: 'Badge limit' }, hint: { 'zh-CN': '多选超过这个数就折成一叠色点加数量', en: 'Past this many picks, badges fold into a stack of dots and a count' }, default: 2, min: 1, max: 4, step: 1 },
    { key: 'spring', type: 'spring', group: 'motion', label: { 'zh-CN': '弹簧', en: 'Spring' }, default: { visualDuration: 0.35, bounce: 0.25 } },
  ],
  presets: [
    { id: 'indigo', name: { 'zh-CN': '靛夜', en: 'Indigo Night' }, values: { accent: '#6366f1', chipStyle: 'outline', size: 'default', radius: 8, maxVisible: 2 } },
    { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, values: { accent: '#e4e4e7', chipStyle: 'muted', size: 'sm', radius: 6, maxVisible: 1, spring: { visualDuration: 0.25, bounce: 0.1 } } },
    { id: 'ember', name: { 'zh-CN': '余烬', en: 'Ember' }, values: { accent: '#f97316', chipStyle: 'outline', size: 'default', radius: 14, maxVisible: 3, spring: { visualDuration: 0.45, bounce: 0.45 } } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Pass fields (id, label, type, options, icon) and either rules + onRulesChange or defaultRules. A rule is { id, field, operator, value }; operator is null while a chip is being built.',
      'Give option fields dot and badge class strings (full Tailwind class names, not composed at runtime) so picks render as tinted badges and fold into a dot stack past maxVisible.',
      'The component only builds the query; filtering the data is up to you. Treat rules without an operator or value as no-ops.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'not-animated' },
  capture: { zoom: 1.5, posterTime: 6.5, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: [
        'registry-reui/bases/base/reui/filters/filters.tsx',
        'registry-reui/bases/base/reui/filters/filters-chip.tsx',
        'registry-reui/bases/base/reui/filters/filters-editors.tsx',
        'registry-reui/bases/base/reui/filters/filters-builder.tsx',
        'registry-reui/bases/base/reui/filters/filters-operators.tsx',
        'registry-reui/bases/base/reui/filters/filters-i18n.tsx',
        'registry-reui/bases/base/components/filters/c-filters-3.tsx',
        'registry-reui/bases/base/components/filters/c-filters-5.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      'Condensed the multi-file filters primitive into one component over a flat rule list: the chip row, Add filter field picker, operator menu, kebab menu (duplicate, negate, remove), Clear and the value editors. The nested query tree, advanced builder, drag-and-drop, async options and draft reducer are not included.',
      'Base UI Popover, DropdownMenu, Cascader and the react-day-picker Calendar replaced by a hand-rolled popover, a listbox / menu with aria-activedescendant and arrow, Home, End and Enter keys, and a single-month date grid; IconPlaceholder icons replaced by inline SVG.',
      'Kept the operator catalog, default labels, value coercion and negation; date operators come from the c-filters-5 example (without date ranges or natural-language parsing). The c-filters-3 badge-or-stack value display moved into the component behind a maxVisible param.',
      'Chips enter, leave and reflow with a motion/react spring; added accent, chip style, size, corner radius, badge limit and spring params. Reduced motion drops the spring and scaling.',
      'Controlled open, highlight and draft props let the demo autoplay drive the bar through useFrameLoop.',
    ],
    assets: [],
  },
})
