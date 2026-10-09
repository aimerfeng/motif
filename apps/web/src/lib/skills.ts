import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

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
