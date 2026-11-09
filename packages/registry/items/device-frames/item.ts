import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'device-frames',
  status: 'published',
  title: { 'zh-CN': '设备外框', en: 'Device Frames' },
  summary: {
    'zh-CN': '矢量绘制的手机、安卓手机和浏览器窗口外框，里面放的是真正的 React 界面而不是截图，可加 3D 倾斜和地面投影。适合产品首屏、应用展示和更新日志配图。',
    en: 'Vector phone, Android-style phone and browser-window frames that wrap live React screens instead of screenshots, with optional 3D tilt and a soft floor shadow. Made for product heroes, app showcases and changelog visuals.',
  },
  kind: 'component',
  category: 'layout',
  tags: ['mockup', 'device', 'phone', 'browser', 'frame', 'showcase'],
  runtime: ['react', 'svg', 'css'],
  entry: { file: 'device-frames.tsx', export: 'DeviceFrame' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'device-frames.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'device',
      type: 'select',
      label: { 'zh-CN': '设备', en: 'Device' },
      default: 'phone',
      options: [
        { value: 'phone', label: { 'zh-CN': '手机', en: 'Phone' } },
        { value: 'android', label: { 'zh-CN': '安卓手机', en: 'Android phone' } },
        { value: 'browser', label: { 'zh-CN': '浏览器窗口', en: 'Browser window' } },
      ],
      group: 'look',
    },
    {
      key: 'tone',
      type: 'select',
      label: { 'zh-CN': '外框色调', en: 'Frame tone' },
      default: 'dark',
      options: [
        { value: 'light', label: { 'zh-CN': '浅色', en: 'Light' } },
        { value: 'dark', label: { 'zh-CN': '深色', en: 'Dark' } },
      ],
      group: 'look',
    },
    { key: 'url', type: 'text', label: { 'zh-CN': '地址栏文字', en: 'Address bar' }, hint: { 'zh-CN': '仅浏览器窗口', en: 'Browser window only' }, default: 'tidepool.app', maxLength: 40, group: 'content' },
    {
      key: 'mode',
      type: 'select',
      label: { 'zh-CN': '工具栏', en: 'Toolbar' },
      hint: { 'zh-CN': '仅浏览器窗口', en: 'Browser window only' },
      default: 'default',
      options: [
        { value: 'default', label: { 'zh-CN': '完整', en: 'Full' } },
        { value: 'simple', label: { 'zh-CN': '简洁', en: 'Simple' } },
      ],
      group: 'content',
    },
    { key: 'tilt', type: 'number', label: { 'zh-CN': '3D 倾斜', en: '3D tilt' }, default: 0, min: 0, max: 24, step: 1, unit: 'deg', safe: [0, 16], group: 'layout' },
    { key: 'shadow', type: 'boolean', label: { 'zh-CN': '地面投影', en: 'Floor shadow' }, default: true, group: 'layout' },
  ],
  presets: [
    { id: 'nightstand', name: { 'zh-CN': '夜灯', en: 'Nightstand' }, values: { device: 'phone', tone: 'dark', tilt: 12, shadow: true } },
    { id: 'paper', name: { 'zh-CN': '素笺', en: 'Paper' }, values: { device: 'android', tone: 'light', tilt: 0, shadow: true } },
    { id: 'desk', name: { 'zh-CN': '案头', en: 'Desk' }, values: { device: 'browser', tone: 'dark', mode: 'default', tilt: 8, shadow: true } },
  ],
  dependencies: ['@motif/runtime'],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { posterTime: 2.4 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'magicui',
      repo: 'magicuidesign/magicui',
      sha: 'd7207e5692d14c00dceafa8488d6d01f197fa0e4',
      paths: ['apps/www/registry/magicui/iphone.tsx', 'apps/www/registry/magicui/android.tsx', 'apps/www/registry/magicui/safari.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) Magic UI'],
    },
    modifications: [
      'The Iphone, Android and Safari frames are kept as PhoneFrame, AndroidFrame and BrowserFrame and selected by a device prop; brand naming dropped.',
      'src/imageSrc/videoSrc props replaced by a children slot rendered in the screen cut-out; the Android frame uses a tight 380x830 viewBox and an HTML overlay instead of foreignObject.',
      'Tailwind dark: variants replaced by a tone prop; SVG mask/clip ids made unique with useId; address-bar gray darkened slightly for contrast.',
      'Added optional 3D tilt and floor shadow; defaults moved into the generated defaults region; cn now comes from motif-runtime.',
    ],
    assets: [],
  },
})
