import { githubToken, requireUser } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { assertCanWrite, forkSourceOnGitHub, repoById } from '@/lib/repos/repos'

/** 在 GitHub 上 fork 这个仓库的来源（导入自 GitHub 的仓库）。看得到这个仓库的人都可以 fork 它的来源。 */
export async function POST(request: Request, { params }: RouteContext<'/api/repos/[id]/github-fork'>) {
  try {
    rateLimit(request, 'repo-push', 6)
    const user = await requireUser(request)
    const repo = repoById((await params).id)
    if (!repo || (repo.visibility === 'private' && repo.owner_id !== user.id)) throw new HttpError(404, 'no such repository')
    const github = await githubToken(user.id)
    if (!github) throw new HttpError(403, 'connect your GitHub account first', { code: 'github_connect' })
    assertCanWrite(github.scopes)
    return Response.json(await forkSourceOnGitHub(repo, github.token), { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
