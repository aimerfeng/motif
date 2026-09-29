import { bake, paramsHash, type ItemSource, type ParamValues } from '@motif/schema'
import { strToU8, zipSync } from 'fflate'
import type { ExportContext } from './context.ts'
import { itemRegistryItem } from './registry-item.ts'
import { skillFiles, skillName } from './skill.ts'
import { viteStarter } from './starter.ts'

export { itemUrl, npmDependencies, rewriteRuntimeImport, usesRuntime, type ExportContext, type ExportInput } from './context.ts'
export { bundleRuntime } from './runtime-bundle.ts'
export { itemRegistryItem, runtimeRegistryItem, type RegistryItemJson } from './registry-item.ts'
export { skillFiles, skillMarkdown, skillName } from './skill.ts'
export { viteStarter } from './starter.ts'

/** 所有导出形式共用的准备工作：把参数值写进组件的 defaults，并算出参数哈希。 */
export async function prepareExport(item: ItemSource, values: ParamValues): Promise<{ bakedEntry: string; hash: string }> {
  const entry = item.files[item.manifest.entry.file]
  if (entry === undefined) throw new Error(`entry file ${item.manifest.entry.file} is missing`)
  return { bakedEntry: bake(entry, values), hash: await paramsHash(values) }
}

/** 打包成 zip；所有文件放在 root/ 目录下，解压后是一个文件夹。 */
export function zipFiles(files: Record<string, string>, root: string): Uint8Array {
  const entries: Record<string, Uint8Array> = {}
  for (const [path, text] of Object.entries(files)) entries[`${root}/${path}`] = strToU8(text)
  return zipSync(entries, { level: 9, mtime: new Date('2026-01-01T00:00:00Z') })
}

export async function exportStarterZip(item: ItemSource, values: ParamValues, context: ExportContext): Promise<{ name: string; data: Uint8Array }> {
  const prepared = await prepareExport(item, values)
  const name = `motif-${item.manifest.slug}`
  return { name: `${name}.zip`, data: zipFiles(viteStarter(item, values, context, prepared), name) }
}

export async function exportSkillZip(item: ItemSource, values: ParamValues, context: ExportContext): Promise<{ name: string; data: Uint8Array }> {
  const prepared = await prepareExport(item, values)
  const name = skillName(item.manifest.slug)
  return { name: `${name}.zip`, data: zipFiles(skillFiles(item, values, context, prepared), name) }
}

export async function exportRegistryItem(item: ItemSource, values: ParamValues, context: ExportContext) {
  return itemRegistryItem(item, values, context, await prepareExport(item, values))
}
