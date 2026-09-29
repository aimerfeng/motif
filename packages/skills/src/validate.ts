/**
 * 按 agentskills.io 规范校验一个 skill 目录：
 * name 为 1–64 个小写字母、数字、连字符且与目录名相同；description 1–1024 字符；正文少于 500 行；
 * 正文里引用的相对文件（references/…、assets/…）必须存在。
 */
export interface SkillProblem {
  skill: string
  message: string
}

const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export interface ParsedSkill {
  frontmatter: Record<string, string>
  body: string
}

/** 只解析我们用到的 YAML 子集：顶层 `key: value`，值可以是 JSON 字符串；嵌套的 metadata 等忽略。 */
export function parseSkill(markdown: string): ParsedSkill | null {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(markdown.replaceAll('\r\n', '\n'))
  if (!match) return null
  const frontmatter: Record<string, string> = {}
  for (const line of match[1]!.split('\n')) {
    const field = /^([a-z][\w-]*):\s*(.*)$/.exec(line)
    if (!field) continue
    let value = field[2]!.trim()
    if (value.startsWith('"')) {
      try {
        value = JSON.parse(value) as string
      } catch {
        // 保留原样，交给后面的规则报错。
      }
    }
    frontmatter[field[1]!] = value
  }
  return { frontmatter, body: match[2]! }
}

export function validateSkill(folder: string, files: Record<string, string>): SkillProblem[] {
  const problems: SkillProblem[] = []
  const add = (message: string) => problems.push({ skill: folder, message })
  const markdown = files['SKILL.md']
  if (markdown === undefined) {
    add('missing SKILL.md')
    return problems
  }
  const parsed = parseSkill(markdown)
  if (!parsed) {
    add('SKILL.md must start with a YAML frontmatter block')
    return problems
  }
  const { frontmatter, body } = parsed
  const name = frontmatter.name ?? ''
  if (!NAME.test(name) || name.length > 64) add(`name "${name}" must be 1–64 lowercase letters, digits and single hyphens`)
  if (name !== folder) add(`name "${name}" must match the folder name "${folder}"`)
  const description = frontmatter.description ?? ''
  if (description.length === 0 || description.length > 1024) add(`description must be 1–1024 characters (has ${description.length})`)
  const lines = body.split('\n').length
  if (lines >= 500) add(`body has ${lines} lines; keep SKILL.md under 500 and move detail into references/`)
  for (const reference of body.matchAll(/`((?:references|assets|scripts)\/[^`\s]+)`/g)) {
    if (!(reference[1]! in files)) add(`references a missing file: ${reference[1]}`)
  }
  return problems
}
