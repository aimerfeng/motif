import { zipFiles } from '@motif/export'
import { readSkillFiles, readSkillMarkdown } from '@/lib/skills'

const HEADERS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' }

/**
 * 仓库 skills/ 里的 skill：`/skill/<name>.md` 返回 SKILL.md 文本（卡片上的「复制 Skill」用），
 * `/skill/<name>.zip` 返回整个目录（含 assets/ 和 references/）。
 */
export async function GET(_request: Request, { params }: RouteContext<'/skill/[file]'>) {
  const { file } = await params
  if (file.endsWith('.md')) {
    const markdown = await readSkillMarkdown(file.slice(0, -'.md'.length))
    if (markdown === null) return new Response('not found', { status: 404 })
    return new Response(markdown, { headers: { ...HEADERS, 'Content-Type': 'text/markdown; charset=utf-8' } })
  }
  if (file.endsWith('.zip')) {
    const name = file.slice(0, -'.zip'.length)
    const files = await readSkillFiles(name)
    if (files === null) return new Response('not found', { status: 404 })
    return new Response(zipFiles(files, name) as BodyInit, {
      headers: { ...HEADERS, 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${name}.zip"` },
    })
  }
  return new Response('not found', { status: 404 })
}
