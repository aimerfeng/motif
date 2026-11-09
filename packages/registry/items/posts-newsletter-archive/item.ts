import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'posts-newsletter-archive',
  status: 'published',
  title: { 'zh-CN': '电子报往期目录', en: 'Newsletter Archive' },
  summary: {
    'zh-CN': '电子报的往期目录：每期按期号和日期排开，附一句导语和话题标签；顶部可搜索、按年份筛选，旁边的预览窗显示选中那期的开头和本期目录，订阅框一直固定在列表旁。适合独立作者、公司通讯和周报月报类产品。',
    en: 'A newsletter’s back catalogue: issues listed by number and date with a one-line teaser and topic tags, a search field and year filter on top, a preview pane with the selected issue’s opening lines and contents, and a subscribe box pinned beside the list. For independent writers, company newsletters and digest products.',
  },
  kind: 'section',
  category: 'posts',
  tags: ['newsletter', 'archive', 'issues', 'subscribe', 'search', 'filter', 'preview', 'email'],
  runtime: ['react', 'motion', 'css'],
  entry: { file: 'posts-newsletter-archive.tsx', export: 'NewsletterArchive' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'posts-newsletter-archive.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'accent',
      type: 'color',
      group: 'look',
      label: { 'zh-CN': '主色', en: 'Accent' },
      hint: { 'zh-CN': '选中的期号、首字下沉、标签和订阅按钮', en: 'The selected issue, the drop cap, tags and the subscribe button' },
      default: '#f2a65a',
    },
    {
      key: 'font',
      type: 'select',
      group: 'look',
      label: { 'zh-CN': '标题字体', en: 'Heading font' },
      default: 'newsreader',
      options: [
        { value: 'newsreader', label: { 'zh-CN': '报刊衬线（Newsreader）', en: 'Newsprint serif (Newsreader)' } },
        { value: 'fraunces', label: { 'zh-CN': '复古衬线（Fraunces）', en: 'Old-style serif (Fraunces)' } },
        { value: 'geist', label: { 'zh-CN': '无衬线（Geist）', en: 'Sans (Geist)' } },
        { value: 'grotesk', label: { 'zh-CN': '几何（Space Grotesk）', en: 'Grotesk (Space Grotesk)' } },
      ],
    },
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 12, min: 0, max: 20, step: 1, unit: 'px', safe: [6, 16] },
    {
      key: 'layout',
      type: 'select',
      group: 'layout',
      label: { 'zh-CN': '版式', en: 'Layout' },
      hint: { 'zh-CN': '手机宽度下，预览始终在选中的那期下方展开', en: 'On phones the preview always opens under the selected issue' },
      default: 'split',
      options: [
        { value: 'split', label: { 'zh-CN': '列表 + 侧栏预览', en: 'List with side preview' } },
        { value: 'ledger', label: { 'zh-CN': '紧凑目录表', en: 'Compact ledger' } },
        { value: 'inline', label: { 'zh-CN': '行内展开', en: 'Expand in place' } },
      ],
    },
    { key: 'showPreview', type: 'boolean', group: 'layout', label: { 'zh-CN': '显示预览', en: 'Show preview' }, hint: { 'zh-CN': '选中一期时显示开头几行和本期目录', en: 'Opening lines and contents of the selected issue' }, default: true },
    { key: 'showTags', type: 'boolean', group: 'layout', label: { 'zh-CN': '显示话题标签', en: 'Show topic tags' }, default: true },
    { key: 'name', type: 'text', group: 'content', label: { 'zh-CN': '电子报名称', en: 'Newsletter name' }, default: 'Ledgerline', maxLength: 18 },
    { key: 'heading', type: 'text', group: 'content', label: { 'zh-CN': '标题', en: 'Heading' }, default: 'Every letter, since the first one', maxLength: 48 },
  ],
  presets: [
    { id: 'inkwell', name: { 'zh-CN': '墨池', en: 'Inkwell' }, values: { accent: '#f2a65a', font: 'newsreader', radius: 12, layout: 'split', showPreview: true, showTags: true } },
    {
      id: 'broadsheet',
      name: { 'zh-CN': '大报', en: 'Broadsheet' },
      values: { accent: '#ff6b57', font: 'fraunces', radius: 2, layout: 'ledger', showPreview: true, showTags: true, heading: 'The complete archive, filed by date' },
    },
    {
      id: 'postcard',
      name: { 'zh-CN': '明信片', en: 'Postcard' },
      values: { accent: '#8fb4ff', font: 'geist', radius: 18, layout: 'inline', showPreview: true, showTags: true, heading: 'Letters from a small software company' },
    },
    {
      id: 'greenhouse',
      name: { 'zh-CN': '温室', en: 'Greenhouse' },
      values: { accent: '#b5e655', font: 'grotesk', radius: 8, layout: 'split', showPreview: true, showTags: false, heading: 'Back issues, all of them' },
    },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable', 'Geist Mono Variable', 'Newsreader Variable', 'Fraunces Variable', 'Space Grotesk Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  guidance: {
    use: [
      'Use as the archive page of a newsletter, a company letter or a digest product. Pass your own issues through the issues prop (number, ISO date, title, teaser, tags, minutes, opening, contents, optional href); they are shown newest first by number, and the year and topic filters are built from them.',
      'Replace the sample masthead copy with description, author, since (YYYY-MM), nextIssueDate (ISO), cadence and readers; point indexHref at the full index of older issues and rssHref at the feed (an empty string hides either).',
      'Selection, search, year and topic can be controlled with selected / onSelectedChange, query / onQueryChange, year / onYearChange and tag / onTagChange, for example to sync them with the URL. Wire onSubscribe to your email provider.',
      'With showPreview off, every row is a plain link to the issue instead of a selectable entry.',
    ],
    rules: [
      'Teasers are one sentence about what the reader gets, not a summary of the whole issue. Keep them under about 110 characters.',
      'Use at most three topic tags per issue from a short fixed vocabulary; tags are for scanning, not SEO.',
      'Keep the subscribe box beside the list (sticky) on desktop; do not add a second signup form inside the list.',
    ],
  },
  capture: { scroll: true, posterTime: 1.5, loop: 12 },
  provenance: {
    kind: 'original',
    modifications: [],
    assets: [],
  },
})
