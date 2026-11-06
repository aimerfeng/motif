import { ensureProfile } from '@/lib/accounts/profile'
import { requireUser } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { forkRepo, repoById } from '@/lib/repos/repos'

/** Fork 站内的一个仓库到自己名下。 */
export async function POST(request: Request, { params }: RouteContext<'/api/repos/[id]/fork'>) {
  try {
    rateLimit(request, 'repo-create', 20)
    const user = await requireUser(request)
    ensureProfile(user)
    const source = repoById((await params).id)
    if (!source || (source.visibility === 'private' && source.owner_id !== user.id)) throw new HttpError(404, 'no such repository')
    return Response.json({ repo: forkRepo(source, user.id) }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
