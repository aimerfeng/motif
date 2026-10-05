import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { prepareExport, REPO_URL, skillFiles, skillName, type ExportContext } from '@motif/export'
import { ITEMS_DIR, loadItemSource, loadRuntime, REPO_ROOT } from '@motif/registry'
import { defaultsOf } from '@motif/schema'
import { VENDOR_ENTRIES } from '@motif/vendor/manifest'

export const LIBRARY_DIR = fileURLToPath(new URL('../library/', import.meta.url))
export const SKILLS_OUT = path.join(REPO_ROOT, 'skills')
export { REPO_URL }

/** skill 目录名 → （相对路径 → 文本）。 */
export type SkillTree = Record<string, Record<string, string>>

async function readTree(dir: string, prefix = ''): Promise<Record<string, string>> {
  const files: Record<string, string> = {}
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) Object.assign(files, await readTree(path.join(dir, entry.name), relative))
    else files[relative] = (await readFile(path.join(dir, entry.name), 'utf8')).replaceAll('\r\n', '\n')
  }
  return files
}

async function vendorVersions(): Promise<Record<string, string>> {
  const versions: Record<string, string> = {}
  for (const pkg of new Set(VENDOR_ENTRIES.map((entry) => entry.pkg))) {
    if (pkg.startsWith('@motif/')) continue
    const json = JSON.parse(await readFile(path.join(REPO_ROOT, 'packages/vendor/node_modules', pkg, 'package.json'), 'utf8')) as { version: string }
    versions[pkg] = json.version
  }
  return versions
}

/**
 * 仓库根目录 skills/ 的全部内容：手写的通用 skill（library/）+ 每个市场条目一个 skill（默认参数）。
 * 这样 `npx skills add aimerfeng/motif --skill <name>` 可以直接安装任何一个。
 */
export async function buildSkillsTree(): Promise<SkillTree> {
  const tree: SkillTree = {}
  for (const entry of await readdir(LIBRARY_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) tree[entry.name] = await readTree(path.join(LIBRARY_DIR, entry.name))
  }

  const context: ExportContext = {
    origin: REPO_URL,
    itemUrl: (slug) => `${REPO_URL}/tree/main/packages/registry/items/${slug}`,
    vendor: await vendorVersions(),
    runtime: await loadRuntime(),
  }
  const slugs = (await readdir(ITEMS_DIR, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  for (const slug of slugs) {
    const item = await loadItemSource(path.join(ITEMS_DIR, slug))
    if (item.manifest.status !== 'published') continue
    const values = defaultsOf(item.manifest.params)
    tree[skillName(slug)] = skillFiles(item, values, context, await prepareExport(item, values))
  }
  return tree
}
