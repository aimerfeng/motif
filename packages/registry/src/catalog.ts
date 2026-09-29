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

export interface Catalog {
  generatedAt: string
  /** vendor 包名 → 版本，导出项目时写进 package.json。 */
  vendor: Record<string, string>
  items: CatalogItem[]
}

/** 相对仓库根目录的位置；站点等消费方自己拼出绝对路径。 */
export const CATALOG_PATH = 'packages/registry/generated/catalog.json'

export async function readCatalog(file: string): Promise<Catalog> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as Catalog
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { generatedAt: '', vendor: {}, items: [] }
    throw error
  }
}
