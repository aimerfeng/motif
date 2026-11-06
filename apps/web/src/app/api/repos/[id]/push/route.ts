import { githubToken, requireUser } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { assertCanWrite, ownedRepo, pushToGitHub } from '@/lib/repos/repos'

/** 推到用户的 GitHub：{ name? } 是第一次推送时 GitHub 上的仓库名（默认同名）。 */
export async function POST(request: Request, { params }: RouteContext<'/api/repos/[id]/push'>) {
  try {
    rateLimit(request, 'repo-push', 6)
    const user = await requireUser(request)
    const repo = ownedRepo((await params).id, user.id)
    const github = await githubToken(user.id)
    if (!github) throw new HttpError(403, 'connect your GitHub account first', { code: 'github_connect' })
    assertCanWrite(github.scopes)
    const body = (await readJson(request)) as { name?: unknown }
    return Response.json(await pushToGitHub(repo, github.token, typeof body.name === 'string' && body.name.trim() ? body.name : undefined), { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
