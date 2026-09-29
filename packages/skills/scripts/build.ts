// 生成仓库根目录的 skills/：先校验，再整体重写（删除不再存在的 skill）。
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildSkillsTree, SKILLS_OUT, validateSkill } from '../src/index.ts'

const tree = await buildSkillsTree()
const problems = Object.entries(tree).flatMap(([name, files]) => validateSkill(name, files))
if (problems.length > 0) {
  for (const problem of problems) console.error(`✖ ${problem.skill}: ${problem.message}`)
  process.exit(1)
}
await rm(SKILLS_OUT, { recursive: true, force: true })
for (const [name, files] of Object.entries(tree)) {
  for (const [file, text] of Object.entries(files)) {
    const target = path.join(SKILLS_OUT, name, file)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, text)
  }
}
console.log(`wrote ${Object.keys(tree).length} skills to ${SKILLS_OUT}`)
