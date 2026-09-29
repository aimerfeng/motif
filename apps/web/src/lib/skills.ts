import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import { parseSkill } from '@motif/skills/validate'

// skills/ 由 pnpm skills:build 生成并随仓库提交；站点只读。
const SKILLS_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', 'skills')

/** 手写的通用 skill，按推荐阅读顺序。其余 motif-<slug> 是每个市场条目自动生成的。 */
export const LIBRARY_SKILLS = [
  'motif-design',
  'motif-motion',
  'motif-micro-interactions',
  'motif-typography',
  'motif-backgrounds',
  'motif-shaders',
  'motif-scroll',
  'motif-3d',
] as const
export type LibrarySkill = (typeof LIBRARY_SKILLS)[number]

export interface SkillEntry {
  name: string
  description: string
  markdown: string
  files: string[]
}

async function listFiles(dir: string, prefix = ''): Promise<string[]> {
  const out: string[] = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relative = `${prefix}${entry.name}`
    if (entry.isDirectory()) out.push(...(await listFiles(path.join(/*turbopackIgnore: true*/ dir, entry.name), `${relative}/`)))
    else out.push(relative)
  }
  return out.sort()
}

export const getLibrarySkills = cache(async (): Promise<SkillEntry[]> => {
  const skills: SkillEntry[] = []
  for (const name of LIBRARY_SKILLS) {
    const dir = path.join(/*turbopackIgnore: true*/ SKILLS_DIR, name)
    try {
      const markdown = (await readFile(path.join(/*turbopackIgnore: true*/ dir, 'SKILL.md'), 'utf8')).replaceAll('\r\n', '\n')
      const parsed = parseSkill(markdown)
      skills.push({ name, description: parsed?.frontmatter.description ?? '', markdown, files: await listFiles(dir) })
    } catch {
      // 还没有生成 skills/ 时页面照常渲染，只是少了这一项。
    }
  }
  return skills
})

export const countItemSkills = cache(async (): Promise<number> => {
  try {
    const entries = await readdir(SKILLS_DIR, { withFileTypes: true })
    return entries.filter((entry) => entry.isDirectory() && !(LIBRARY_SKILLS as readonly string[]).includes(entry.name)).length
  } catch {
    return 0
  }
})
