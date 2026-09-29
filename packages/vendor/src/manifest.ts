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
]

export const VENDOR_IDS: readonly string[] = VENDOR_ENTRIES.map((entry) => entry.id)

/** `react/jsx-runtime` → `react__jsx-runtime`，`@paper-design/shaders-react` → `paper-design__shaders-react`。 */
export function vendorFileName(id: string): string {
  return id.replace(/^@/, '').replaceAll('/', '__')
}
