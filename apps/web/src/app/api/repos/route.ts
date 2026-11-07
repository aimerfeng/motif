import { after } from 'next/server'
import { ensureProfile } from '@/lib/accounts/profile'
import { githubToken, requireUser } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { parseRepoInput } from '@/lib/repos/github'
import { createRepo, importFromGitHub, itemToFiles, repoFromItem, type Visibility } from '@/lib/repos/repos'
import { track } from '@/lib/stats/track'
import { loadSession } from '@/lib/studio/store'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * 新建仓库。mode：
 * - empty：空仓库（name 必填，带一个 README）；
 * - github：从 GitHub 导入（github 是 owner/name 或仓库地址）；
 * - item：fork 市场里的条目（item 是 slug）；
 * - studio：把工作台会话里的条目存成仓库（session 是会话 id）。
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser(request)
    ensureProfile(user)
    const body = (await readJson(request)) as { mode?: unknown; name?: unknown; description?: unknown; visibility?: unknown; github?: unknown; item?: unknown; session?: unknown }
    const visibility: Visibility = body.visibility === 'private' ? 'private' : 'public'
    const description = typeof body.description === 'string' ? body.description : ''
    if (body.mode === 'empty') {
      rateLimit(request, 'repo-create', 20)
      if (typeof body.name !== 'string') throw new HttpError(400, 'name is required')
      const readme = `# ${body.name.trim()}\n${description.trim() ? `\n${description.trim()}\n` : ''}`
      const repo = createRepo({ ownerId: user.id, name: body.name, description, visibility, source: 'empty', files: { 'README.md': readme } })
      return Response.json({ repo }, { headers: NO_STORE })
    }
    if (body.mode === 'github') {
      // 每次导入都要从 GitHub 下载整个仓库：限得紧一点。
      rateLimit(request, 'repo-import', 6)
      const fullName = typeof body.github === 'string' ? parseRepoInput(body.github) : null
      if (!fullName) throw new HttpError(400, 'expected a GitHub repository like owner/name or its URL')
      const token = (await githubToken(user.id))?.token ?? null
      const { repo, skipped } = await importFromGitHub(user.id, fullName, token, visibility)
      return Response.json({ repo, skipped }, { headers: NO_STORE })
    }
    if (body.mode === 'item') {
      rateLimit(request, 'repo-create', 20)
      const slug = body.item
      if (typeof slug !== 'string' || !SLUG.test(slug)) throw new HttpError(400, 'item must be a market item slug')
      const repo = await repoFromItem(slug, user.id)
      // fork 成自己的仓库：排行榜的「改编」。
      after(() => track(request, slug, 'remix'))
      return Response.json({ repo }, { headers: NO_STORE })
    }
    if (body.mode === 'studio') {
      rateLimit(request, 'repo-create', 20)
      const session = typeof body.session === 'string' ? await loadSession(body.session) : null
      // 别人的会话当作不存在。
      if (!session || (session.ownerId && session.ownerId !== user.id)) throw new HttpError(404, 'no such studio session')
      const name = typeof body.name === 'string' && body.name.trim() ? body.name : session.item.manifest.slug
      const repo = createRepo({
        ownerId: user.id,
        name,
        description: description || session.item.manifest.summary?.en || '',
        visibility,
        source: 'studio',
        sourceRef: session.id,
        files: itemToFiles(session.item),
        autoRename: true,
      })
      return Response.json({ repo }, { headers: NO_STORE })
    }
    throw new HttpError(400, 'mode must be empty, github, item or studio')
  } catch (error) {
    return errorResponse(error)
  }
}
