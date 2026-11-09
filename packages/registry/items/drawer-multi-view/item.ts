import { defineItem } from '@motif/schema'

export default defineItem({
  schemaVersion: 1,
  slug: 'drawer-multi-view',
  status: 'published',
  title: { 'zh-CN': '多视图抽屉', en: 'Multi-View Drawer' },
  summary: {
    'zh-CN': '浮在底部的圆角抽屉，在选项、确认步骤和完成状态之间切换：高度随内容平滑伸缩，新旧视图交叉淡入。可以下拉关闭，焦点锁在抽屉内，Esc 关闭。适合账号操作、安全设置和结账确认。',
    en: 'A rounded floating bottom sheet that moves between views (options, a confirm step, a success state) while its height eases to fit and the content cross-fades. Drag down to dismiss, focus stays inside, Esc closes. For account actions, security settings and checkout confirmations.',
  },
  kind: 'component',
  category: 'dialog',
  tags: ['drawer', 'bottom-sheet', 'multi-step', 'views', 'height-animation', 'confirmation', 'a11y'],
  runtime: ['react', 'motion'],
  entry: { file: 'drawer-multi-view.tsx', export: 'FamilyDrawerRoot' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'drawer-multi-view.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'radius', type: 'number', group: 'look', label: { 'zh-CN': '圆角', en: 'Corner radius' }, default: 36, min: 16, max: 44, step: 1, unit: 'px', safe: [24, 40] },
    { key: 'maxWidth', type: 'number', group: 'layout', label: { 'zh-CN': '最大宽度', en: 'Max width' }, hint: { 'zh-CN': '窄屏时两侧各留 16px', en: 'On narrow screens it keeps a 16px gutter' }, default: 361, min: 320, max: 480, step: 1, unit: 'px', safe: [340, 420] },
    { key: 'backdrop', type: 'number', group: 'look', label: { 'zh-CN': '遮罩深度', en: 'Backdrop dim' }, default: 0.3, min: 0, max: 0.8, step: 0.05, safe: [0.2, 0.6] },
    { key: 'duration', type: 'number', group: 'motion', label: { 'zh-CN': '高度过渡时长', en: 'Height duration' }, default: 0.27, min: 0.12, max: 0.8, step: 0.01, unit: 's', safe: [0.2, 0.45] },
    { key: 'ease', type: 'easing', group: 'motion', label: { 'zh-CN': '高度缓动', en: 'Height easing' }, default: [0.25, 1, 0.5, 1] },
    { key: 'viewScale', type: 'number', group: 'motion', label: { 'zh-CN': '视图切换缩放', en: 'View scale' }, hint: { 'zh-CN': '新旧视图从这个比例缩放进出，1 为纯淡入', en: 'Views scale in and out from this value; 1 is a plain cross-fade' }, default: 0.96, min: 0.85, max: 1, step: 0.01, safe: [0.92, 1] },
    { key: 'dragDismiss', type: 'boolean', group: 'interaction', label: { 'zh-CN': '下拉关闭', en: 'Drag to dismiss' }, default: true },
  ],
  presets: [
    { id: 'pebble', name: { 'zh-CN': '卵石', en: 'Pebble' }, values: { radius: 36, maxWidth: 361, backdrop: 0.3, duration: 0.27, ease: [0.25, 1, 0.5, 1], viewScale: 0.96 } },
    { id: 'drift', name: { 'zh-CN': '慢流', en: 'Drift' }, values: { radius: 28, maxWidth: 400, backdrop: 0.5, duration: 0.42, ease: [0.32, 0.72, 0, 1], viewScale: 0.92 } },
    { id: 'snap', name: { 'zh-CN': '利落', en: 'Snap' }, values: { radius: 20, maxWidth: 380, backdrop: 0.55, duration: 0.2, ease: [0.2, 0, 0, 1], viewScale: 1 } },
  ],
  dependencies: ['motion/react', '@motif/runtime'],
  guidance: {
    rules: [
      'Compose FamilyDrawerRoot > Trigger + Portal > Overlay + Content > Close + AnimatedWrapper > AnimatedContent > ViewContent, and register views by name; views switch with setView from useFamilyDrawer().',
      'The sheet height follows the measured AnimatedWrapper, so keep each view short enough for a phone screen and do not give views fixed heights or their own scroll areas.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { zoom: 1.4, posterTime: 3, loop: 12 },
  provenance: {
    kind: 'upstream',
    upstream: {
      source: 'cult-ui',
      repo: 'nolly-studio/cult-ui',
      sha: 'ee98a5dd2e319b63cc2e707dd968d6af04209b7e',
      paths: ['apps/www/registry/default/ui/family-drawer.tsx', 'apps/www/registry/default/example/family-drawer-demo.tsx'],
      spdx: 'MIT',
      copyright: ['Copyright (c) 2023 Jordan-Gilliam'],
    },
    modifications: [
      'Replaced vaul with a hand-written sheet: portal + AnimatePresence with vaul\'s 0.5s slide curve, drag-to-dismiss on motion drag (25% of the height or 400 px/s), Esc and overlay click to close, a Tab focus trap, focus return and body scroll lock.',
      'react-use-measure became a ResizeObserver on offsetHeight; the cross-fade duration is derived from the height change as state instead of a ref mutated inside useMemo.',
      'Removed radix Slot (asChild on the trigger clones its child; the other parts always render their button) and clsx (cn from @motif/runtime); the undefined shadow-focus-ring-button class became a focus-visible outline.',
      'Added a controlled view prop and setIsOpen on the context; onOpenChange no longer blocks uncontrolled use. FamilyDrawerSecondaryButton takes disabled (aria-disabled).',
      'Corner radius, max width, backdrop opacity, height duration and easing, view scale and drag-to-dismiss come from params. Reduced motion fades the sheet in place, snaps the height and cross-fades views without scaling.',
      'Demo: the confirmation flow example with inline icons, without the final-warning step; the processing delay runs on the frame loop instead of setTimeout, and an autoplay drives the flow until the viewer interacts.',
    ],
    assets: [],
  },
})
