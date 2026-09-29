import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildSkillsTree, SKILLS_OUT, validateSkill } from '../src/index.ts'

async function readCommitted(): Promise<Record<string, string>> {
  const files: Record<string, string> = {}
  const walk = async (dir: string, prefix: string) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const relative = `${prefix}${entry.name}`
      if (entry.isDirectory()) await walk(path.join(dir, entry.name), `${relative}/`)
      else files[relative] = (await readFile(path.join(dir, entry.name), 'utf8')).replaceAll('\r\n', '\n')
    }
  }
  await walk(SKILLS_OUT, '')
  return files
}

describe('skills', () => {
  it('every skill follows the agentskills.io format', async () => {
    const tree = await buildSkillsTree()
    expect(Object.keys(tree)).toContain('motif-design')
    const problems = Object.entries(tree).flatMap(([name, files]) => validateSkill(name, files))
    expect(problems).toEqual([])
  }, 60_000)

  it('the committed skills/ folder matches the generated output (run pnpm skills:build)', async () => {
    const tree = await buildSkillsTree()
    const expected: Record<string, string> = {}
    for (const [name, files] of Object.entries(tree)) for (const [file, text] of Object.entries(files)) expected[`${name}/${file}`] = text
    const committed = await readCommitted()
    expect(Object.keys(committed).sort()).toEqual(Object.keys(expected).sort())
    for (const [file, text] of Object.entries(expected)) expect(committed[file], file).toBe(text)
  }, 60_000)
})

describe('validateSkill', () => {
  it('reports name, description and missing references', () => {
    const problems = validateSkill('my-skill', {
      'SKILL.md': '---\nname: Other_Name\ndescription: ""\n---\n\nSee `references/missing.md`.\n',
    })
    expect(problems.map((p) => p.message)).toEqual([
      'name "Other_Name" must be 1–64 lowercase letters, digits and single hyphens',
      'name "Other_Name" must match the folder name "my-skill"',
      'description must be 1–1024 characters (has 0)',
      'references a missing file: references/missing.md',
    ])
  })
})
