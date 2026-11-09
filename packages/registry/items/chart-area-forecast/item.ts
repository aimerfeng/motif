import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'chart-area-forecast',
  status: 'published',
  title: { 'zh-CN': '预测面积图', en: 'Forecast Area Chart' },
  summary: {
    'zh-CN': '实际值是实心面积，到「今天」分界线后换成虚线预测和斜纹置信带，悬停时数据点发光并出提示。适合营收预测、容量规划和销售目标。',
    en: 'Actuals as a solid area that hands off at a today divider to a dashed forecast over a hatched confidence band, with glowing hover markers. For revenue projections, capacity planning and sales targets.',
  },
  kind: 'component',
  category: 'chart',
  tags: ['chart', 'area chart', 'forecast', 'confidence band', 'svg chart'],
  runtime: ['react', 'motion', 'svg'],
  entry: { file: 'chart-area-forecast.tsx', export: 'ChartAreaForecast' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'chart-area-forecast.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'color', type: 'color', label: { 'zh-CN': '实际值颜色', en: 'Actual color' }, default: '#60a5fa', group: 'look' },
    { key: 'forecastColor', type: 'color', label: { 'zh-CN': '预测颜色', en: 'Forecast color' }, default: '#a78bfa', group: 'look' },
    {
      key: 'pattern',
      type: 'select',
      label: { 'zh-CN': '置信带纹理', en: 'Band pattern' },
      default: 'stripes',
      options: [
        { value: 'stripes', label: { 'zh-CN': '斜纹', en: 'Stripes' } },
        { value: 'dots', label: { 'zh-CN': '圆点', en: 'Dots' } },
        { value: 'solid', label: { 'zh-CN': '纯色', en: 'Solid' } },
      ],
      group: 'look',
    },
    { key: 'bandWidth', type: 'number', label: { 'zh-CN': '置信带宽度', en: 'Band width' }, hint: { 'zh-CN': '每月扩大的不确定比例', en: 'Uncertainty added per forecast month' }, default: 0.08, min: 0, max: 0.2, step: 0.01, group: 'look' },
    {
      key: 'curve',
      type: 'select',
      label: { 'zh-CN': '曲线', en: 'Curve' },
      default: 'natural',
      options: [
        { value: 'natural', label: { 'zh-CN': '平滑', en: 'Natural' } },
        { value: 'linear', label: { 'zh-CN': '折线', en: 'Linear' } },
      ],
      group: 'look',
    },
    { key: 'showMarkers', type: 'boolean', label: { 'zh-CN': '显示数据点', en: 'Show markers' }, default: true, group: 'look' },
    { key: 'todayIndex', type: 'number', label: { 'zh-CN': '今天所在月', en: 'Today index' }, default: 5, min: 2, max: 7, step: 1, group: 'content' },
    { key: 'animate', type: 'boolean', label: { 'zh-CN': '入场动画', en: 'Entrance animation' }, default: true, group: 'motion' },
  ],
  presets: [
    { id: 'dusk', name: { 'zh-CN': '暮色', en: 'Dusk' }, values: { color: '#60a5fa', forecastColor: '#a78bfa', pattern: 'stripes' } },
    { id: 'meadow', name: { 'zh-CN': '草甸', en: 'Meadow' }, values: { color: '#34d399', forecastColor: '#fbbf24', pattern: 'dots', bandWidth: 0.12 } },
    { id: 'ledger', name: { 'zh-CN': '账本', en: 'Ledger' }, values: { color: '#e4e4e7', forecastColor: '#f97316', pattern: 'solid', curve: 'linear', todayIndex: 4 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  fonts: ['Geist Variable'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 3, loop: 6 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'reui',
      repo: 'keenthemes/reui',
      sha: '6e433ddaba3a4be38182c8c8883b6cc335183c42',
      paths: [
        'registry-reui/bases/base/components/chart/c-chart-17.tsx',
        'registry-reui/bases/base/components/chart/c-chart-16.tsx',
      ],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2025 Keenthemes Inc'],
    },
    modifications: [
      'Replaced recharts ComposedChart with hand-written SVG paths, gridlines, axis labels and tooltip.',
      'Split the series into actuals and a dashed forecast at a today divider; the hatched pattern now fills a widening confidence band.',
      'Added glowing hover markers (from c-chart-16), pattern/curve/color params, a clip-path reveal and a reduced-motion path.',
    ],
    assets: [],
  },
})
