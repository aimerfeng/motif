/**
 * 预览沙箱里可以 import 的第三方模块（import map 的全部条目）。
 * 这份清单同时决定：预打包哪些模块、条目代码和 agent 生成代码可以用哪些依赖、导出项目的 package.json 写哪些版本。
 */
export interface VendorEntry {
  /** import map 里的裸模块名，例如 `motion/react`。 */
  id: string
  /** 提供这个模块的 npm 包名，用来查版本。 */
  pkg: string
  /** CommonJS 包没有静态的具名导出，需要在构建时枚举。 */
  format: 'cjs' | 'esm'
}

export const VENDOR_ENTRIES: readonly VendorEntry[] = [
  { id: 'react', pkg: 'react', format: 'cjs' },
  { id: 'react/jsx-runtime', pkg: 'react', format: 'cjs' },
  { id: 'react-dom', pkg: 'react-dom', format: 'cjs' },
  { id: 'react-dom/client', pkg: 'react-dom', format: 'cjs' },
  { id: 'motion', pkg: 'motion', format: 'esm' },
  { id: 'motion/react', pkg: 'motion', format: 'esm' },
  { id: 'three', pkg: 'three', format: 'esm' },
  { id: '@paper-design/shaders-react', pkg: '@paper-design/shaders-react', format: 'esm' },
  { id: 'cobe', pkg: 'cobe', format: 'esm' },
  // 条目共用的 hooks（cn、useFrameLoop …）；导出项目时会换成本地文件。
  { id: '@motif/runtime', pkg: '@motif/runtime', format: 'esm' },
]

export const VENDOR_IDS: readonly string[] = VENDOR_ENTRIES.map((entry) => entry.id)

/**
 * 条目可以使用的字体（全部 OFL-1.1，经 Fontsource 自托管）。沙箱加载全部 @font-face（只有用到的字重才会下载），
 * 导出时按条目清单里的 fonts 安装对应的 npm 包并引入 CSS。
 */
export interface FontEntry {
  /** CSS 里的 font-family 名。 */
  family: string
  pkg: string
  /** 需要引入的 CSS 文件（相对包根目录）。 */
  css: string[]
  kind: 'sans' | 'serif' | 'mono' | 'display' | 'pixel'
}

export const FONTS: readonly FontEntry[] = [
  { family: 'Geist Variable', pkg: '@fontsource-variable/geist', css: ['index.css'], kind: 'sans' },
  { family: 'Inter Tight Variable', pkg: '@fontsource-variable/inter-tight', css: ['index.css'], kind: 'sans' },
  { family: 'Manrope Variable', pkg: '@fontsource-variable/manrope', css: ['index.css'], kind: 'sans' },
  { family: 'Plus Jakarta Sans Variable', pkg: '@fontsource-variable/plus-jakarta-sans', css: ['index.css'], kind: 'sans' },
  { family: 'Outfit Variable', pkg: '@fontsource-variable/outfit', css: ['index.css'], kind: 'sans' },
  { family: 'IBM Plex Sans Variable', pkg: '@fontsource-variable/ibm-plex-sans', css: ['index.css'], kind: 'sans' },
  { family: 'Space Grotesk Variable', pkg: '@fontsource-variable/space-grotesk', css: ['index.css'], kind: 'display' },
  { family: 'Bricolage Grotesque Variable', pkg: '@fontsource-variable/bricolage-grotesque', css: ['index.css'], kind: 'display' },
  { family: 'Syne Variable', pkg: '@fontsource-variable/syne', css: ['index.css'], kind: 'display' },
  { family: 'Archivo Black', pkg: '@fontsource/archivo-black', css: ['400.css'], kind: 'display' },
  { family: 'Instrument Serif', pkg: '@fontsource/instrument-serif', css: ['400.css', '400-italic.css'], kind: 'serif' },
  { family: 'Playfair Display Variable', pkg: '@fontsource-variable/playfair-display', css: ['index.css', 'wght-italic.css'], kind: 'serif' },
  { family: 'DM Serif Display', pkg: '@fontsource/dm-serif-display', css: ['400.css', '400-italic.css'], kind: 'serif' },
  { family: 'Fraunces Variable', pkg: '@fontsource-variable/fraunces', css: ['index.css', 'wght-italic.css'], kind: 'serif' },
  { family: 'Newsreader Variable', pkg: '@fontsource-variable/newsreader', css: ['index.css', 'wght-italic.css'], kind: 'serif' },
  { family: 'Geist Mono Variable', pkg: '@fontsource-variable/geist-mono', css: ['index.css'], kind: 'mono' },
  { family: 'JetBrains Mono Variable', pkg: '@fontsource-variable/jetbrains-mono', css: ['index.css'], kind: 'mono' },
  { family: 'IBM Plex Mono', pkg: '@fontsource/ibm-plex-mono', css: ['400.css', '500.css', '700.css'], kind: 'mono' },
  { family: 'Press Start 2P', pkg: '@fontsource/press-start-2p', css: ['400.css'], kind: 'pixel' },
  { family: 'VT323', pkg: '@fontsource/vt323', css: ['400.css'], kind: 'pixel' },
]

export const FONT_FAMILIES: readonly string[] = FONTS.map((font) => font.family)

/** `react/jsx-runtime` → `react__jsx-runtime`，`@paper-design/shaders-react` → `paper-design__shaders-react`。 */
export function vendorFileName(id: string): string {
  return id.replace(/^@/, '').replaceAll('/', '__')
}
