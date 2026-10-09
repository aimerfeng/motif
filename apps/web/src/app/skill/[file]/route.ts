import { prepareExport, skillFiles, zipFiles, type ExportContext } from '@motif/export'
import { defaultsOf } from '@motif/schema'
import { getCatalog } from '@/lib/catalog'
import { marketSource } from '@/lib/community/market-source'
import { readSkillFiles, readSkillMarkdown } from '@/lib/skills'

const HEADERS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' }

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

/**
 * 仓库 skills/ 里的 skill：`/skill/<name>.md` 返回 SKILL.md 文本（卡片上的「复制 Skill」用），
 * `/skill/<name>.zip` 返回整个目录（含 assets/ 和 references/）。社区作品的 skill 现场生成。
 */
export async function GET(request: Request, { params }: RouteContext<'/skill/[file]'>) {
  const { file } = await params
  const origin = new URL(request.url).origin
  if (file.endsWith('.md')) {
    const name = file.slice(0, -'.md'.length)
    const markdown = (await readSkillMarkdown(name)) ?? (await communitySkill(name, origin))?.['SKILL.md'] ?? null
    if (markdown === null) return new Response('not found', { status: 404 })
    return new Response(markdown, { headers: { ...HEADERS, 'Content-Type': 'text/markdown; charset=utf-8' } })
  }
  if (file.endsWith('.zip')) {
    const name = file.slice(0, -'.zip'.length)
    const files = (await readSkillFiles(name)) ?? (await communitySkill(name, origin))
    if (files === null) return new Response('not found', { status: 404 })
    return new Response(zipFiles(files, name) as BodyInit, {
      headers: { ...HEADERS, 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${name}.zip"` },
    })
  }
  return new Response('not found', { status: 404 })
}
