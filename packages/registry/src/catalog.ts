import { readFile } from 'node:fs/promises'
import type { Finding } from '@motif/checker'
import type { ItemManifest } from '@motif/schema'

/** 构建产物里的一个条目：清单、源码、预览用的编译产物，以及检查结果。 */
export interface CatalogItem {
  manifest: ItemManifest
  files: Record<string, string>
  build: {
    /** 预览沙箱里的模块 URL（相对沙箱根路径）。 */
    js: string
    css: string
    jsBytes: number
    cssBytes: number
  } | null
  findings: Finding[]
}

export interface CatalogRuntime {
  /** packages/runtime/src 下的 .ts 源码，导出时合成一个 motif-runtime.ts。 */
  files: Record<string, string>
  /** motif-runtime 的 npm 依赖及版本范围。 */
  dependencies: Record<string, string>
  themeCss: string
}

export interface Catalog {
  generatedAt: string
  /** vendor 包名 → 版本，导出项目时写进 package.json。 */
  vendor: Record<string, string>
  runtime: CatalogRuntime
  items: CatalogItem[]
}

/** 相对仓库根目录的位置；站点等消费方自己拼出绝对路径。 */
export const CATALOG_PATH = 'packages/registry/generated/catalog.json'

export async function readCatalog(file: string): Promise<Catalog> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as Catalog
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { generatedAt: '', vendor: {}, runtime: { files: {}, dependencies: {}, themeCss: '' }, items: [] }
    throw error
  }
}
