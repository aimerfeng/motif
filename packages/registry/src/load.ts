import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { SourceRecord } from '@motif/checker'
import type { ItemManifest, ItemSource } from '@motif/schema'

export const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url))
export const ITEMS_DIR = fileURLToPath(new URL('../items/', import.meta.url))

export interface LoadFailure {
  dir: string
  message: string
}

/** 读取一个条目目录：item.ts 的默认导出是清单，其余文件按清单里列出的读取（统一成 LF 换行）。 */
export async function loadItemSource(dir: string, options: { fresh?: boolean } = {}): Promise<ItemSource> {
  const url = pathToFileURL(path.join(dir, 'item.ts')).href
  // watch 模式下 item.ts 会被改写，加查询参数绕过 ESM 模块缓存。
  const mod = (await import(options.fresh ? `${url}?t=${Date.now()}` : url)) as { default: ItemManifest }
  const manifest = mod.default
  const files: Record<string, string> = {}
  for (const file of manifest.files ?? []) {
    try {
      files[file.path] = (await readFile(path.join(dir, file.path), 'utf8')).replaceAll('\r\n', '\n')
    } catch {
      // 缺失的文件由检查器报告（files/missing），这里不抛错。
    }
  }
  return { manifest, files }
}

/** 读取 items/ 下的全部条目，按 slug 排序。单个条目加载失败不影响其他条目。 */
export async function loadAllItems(options: { fresh?: boolean } = {}): Promise<{ items: ItemSource[]; failures: LoadFailure[] }> {
  const entries = await readdir(ITEMS_DIR, { withFileTypes: true })
  const items: ItemSource[] = []
  const failures: LoadFailure[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const dir = path.join(ITEMS_DIR, entry.name)
    try {
      const item = await loadItemSource(dir, options)
      if (item.manifest.slug !== entry.name) failures.push({ dir, message: `slug "${item.manifest.slug}" must match the folder name` })
      else items.push(item)
    } catch (error) {
      failures.push({ dir, message: error instanceof Error ? error.message : String(error) })
    }
  }
  items.sort((a, b) => a.manifest.slug.localeCompare(b.manifest.slug))
  return { items, failures }
}

/** sources/sources.json 里登记的上游仓库。 */
export async function loadSourceRecords(): Promise<SourceRecord[]> {
  const json = JSON.parse(await readFile(path.join(REPO_ROOT, 'sources/sources.json'), 'utf8')) as { sources: SourceRecord[] }
  return json.sources
}
