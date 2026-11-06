import { githubToken, requireUser } from '@/lib/auth/server'
import { errorResponse, NO_STORE } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { ownedRepo, syncFromGitHub } from '@/lib/repos/repos'

/** 从 GitHub 同步：用来源仓库的最新提交替换全部文件。 */
export async function POST(request: Request, { params }: RouteContext<'/api/repos/[id]/sync'>) {
  try {
    rateLimit(request, 'repo-import', 6)
    const user = await requireUser(request)
    const repo = ownedRepo((await params).id, user.id)
    const token = (await githubToken(user.id))?.token ?? null
    return Response.json(await syncFromGitHub(repo, token), { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
