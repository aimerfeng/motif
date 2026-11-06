import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { prepareExport, skillFiles, type ExportContext } from '@motif/export'
import { defaultsOf } from '@motif/schema'
import { getCatalog } from '@/lib/catalog'
import { marketSource } from '@/lib/community/market-source'

// skills/ 由 pnpm skills:build 生成并随仓库提交；站点只读。
const SKILLS_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', 'skills')
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function skillDir(name: string): string | null {
  return NAME.test(name) ? path.join(/*turbopackIgnore: true*/ SKILLS_DIR, name) : null
}

export async function readSkillMarkdown(name: string): Promise<string | null> {
  const dir = skillDir(name)
  if (!dir) return null
  try {
    return (await readFile(path.join(/*turbopackIgnore: true*/ dir, 'SKILL.md'), 'utf8')).replaceAll('\r\n', '\n')
  } catch {
    return null
  }
}

/** skill 目录里的全部文件（相对路径 → 文本），用来打 zip。 */
export async function readSkillFiles(name: string): Promise<Record<string, string> | null> {
  const dir = skillDir(name)
  if (!dir) return null
  const files: Record<string, string> = {}
  const walk = async (current: string, prefix: string) => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const relative = `${prefix}${entry.name}`
      if (entry.isDirectory()) await walk(path.join(/*turbopackIgnore: true*/ current, entry.name), `${relative}/`)
      else files[relative] = (await readFile(path.join(/*turbopackIgnore: true*/ current, entry.name), 'utf8')).replaceAll('\r\n', '\n')
    }
  }
  try {
    await walk(dir, '')
  } catch {
    return null
  }
  return files
}

// 通用 skill 的源文件在 packages/skills/library/，每个子目录一个；以目录为准，不另列清单。
const LIBRARY_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', 'packages/skills/library')

/** 通用 skill 的名字，motif-design 排最前（它是总纲），其余按名字。 */
export async function listGeneralSkills(): Promise<string[]> {
  const names = (await readdir(LIBRARY_DIR, { withFileTypes: true })).filter((entry) => entry.isDirectory() && NAME.test(entry.name)).map((entry) => entry.name)
  return names.sort((a, b) => (a === 'motif-design' ? -1 : b === 'motif-design' ? 1 : a.localeCompare(b)))
}

/**
 * 社区作品没有预先生成的 skill 目录（skills/ 只收仓库里的条目），按默认参数现场生成。
 * skill 名是 motif-<slug>；不是这个形式或找不到作品时返回 null。
 */
async function communitySkill(name: string, origin: string): Promise<Record<string, string> | null> {
  if (!name.startsWith('motif-')) return null
  const item = await marketSource(name.slice('motif-'.length))
  if (!item) return null
  const catalog = await getCatalog()
  const context: ExportContext = { origin, vendor: catalog.vendor, runtime: catalog.runtime }
  const values = defaultsOf(item.manifest.params)
  return skillFiles(item, values, context, await prepareExport(item, values))
}

/** 一个 skill 的全部文件：仓库 skills/ 里的，或者社区作品现场生成的。找不到是 null。 */
export async function skillFilesFor(name: string, origin: string): Promise<Record<string, string> | null> {
  return (await readSkillFiles(name)) ?? (await communitySkill(name, origin))
}

export interface SkillSummary {
  name: string
  description: string
  general: boolean
}

/** SKILL.md 开头 frontmatter 里的 description。 */
function descriptionOf(markdown: string): string {
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(markdown)?.[1] ?? ''
  const line = /^description:\s*(.+)$/m.exec(frontmatter)?.[1] ?? ''
  return line.replace(/^["']|["']$/g, '').trim()
}

/** skills/ 里全部 skill 的名字和描述（通用的排前面）。给 MCP 的 list_skills 用；内容不常变，进程内缓存。 */
export async function listAllSkills(): Promise<SkillSummary[]> {
  const holder = globalThis as { __motifSkillList?: Promise<SkillSummary[]> }
  holder.__motifSkillList ??= (async () => {
    const general = new Set(await listGeneralSkills())
    const names = (await readdir(SKILLS_DIR, { withFileTypes: true })).filter((entry) => entry.isDirectory() && NAME.test(entry.name)).map((entry) => entry.name)
    const summaries = await Promise.all(names.map(async (name) => ({ name, description: descriptionOf((await readSkillMarkdown(name)) ?? ''), general: general.has(name) })))
    return summaries.sort((a, b) => Number(b.general) - Number(a.general) || a.name.localeCompare(b.name))
  })().catch((error: unknown) => {
    holder.__motifSkillList = undefined
    throw error
  })
  return holder.__motifSkillList
}
