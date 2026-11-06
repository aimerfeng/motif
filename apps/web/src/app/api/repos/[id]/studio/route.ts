import { requireUser } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { itemFromRepo, repoById } from '@/lib/repos/repos'
import { createSessionFromItem } from '@/lib/studio/sessions'

/** 在工作台打开：仓库是一个条目（有 motif.manifest.json）时，用它开一个新的工作台会话。 */
export async function POST(request: Request, { params }: RouteContext<'/api/repos/[id]/studio'>) {
  try {
    rateLimit(request, 'studio-create', 10)
    const user = await requireUser(request)
    const repo = repoById((await params).id)
    if (!repo || (repo.visibility === 'private' && repo.owner_id !== user.id)) throw new HttpError(404, 'no such repository')
    const item = itemFromRepo(repo.id)
    if (!item) throw new HttpError(422, 'this repository is not a Motif item (it needs a valid motif.manifest.json)')
    const session = await createSessionFromItem(item, user.id)
    return Response.json({ id: session.id }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
