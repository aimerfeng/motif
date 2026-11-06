import { zipFiles } from '@motif/export'
import { readSkillMarkdown, skillFilesFor } from '@/lib/skills'
import { publicOrigin } from '@/lib/site'

const HEADERS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' }

/**
 * 仓库 skills/ 里的 skill：`/skill/<name>.md` 返回 SKILL.md 文本（卡片上的「复制 Skill」用），
 * `/skill/<name>.zip` 返回整个目录（含 assets/ 和 references/）。社区作品的 skill 现场生成。
 */
export async function GET(request: Request, { params }: RouteContext<'/skill/[file]'>) {
  const { file } = await params
  const origin = publicOrigin(request)
  if (file.endsWith('.md')) {
    const name = file.slice(0, -'.md'.length)
    const markdown = (await readSkillMarkdown(name)) ?? (await skillFilesFor(name, origin))?.['SKILL.md'] ?? null
    if (markdown === null) return new Response('not found', { status: 404 })
    return new Response(markdown, { headers: { ...HEADERS, 'Content-Type': 'text/markdown; charset=utf-8' } })
  }
  if (file.endsWith('.zip')) {
    const name = file.slice(0, -'.zip'.length)
    const files = await skillFilesFor(name, origin)
    if (files === null) return new Response('not found', { status: 404 })
    return new Response(zipFiles(files, name) as BodyInit, {
      headers: { ...HEADERS, 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${name}.zip"` },
    })
  }
  return new Response('not found', { status: 404 })
}
