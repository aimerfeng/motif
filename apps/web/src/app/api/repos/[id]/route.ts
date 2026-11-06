import { requireUser } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { deleteRepo, ownedRepo, updateRepo, type Visibility } from '@/lib/repos/repos'

/** 改仓库的名字、描述、公开与否。 */
export async function PATCH(request: Request, { params }: RouteContext<'/api/repos/[id]'>) {
  try {
    const user = await requireUser(request)
    const repo = ownedRepo((await params).id, user.id)
    const body = (await readJson(request)) as { name?: unknown; description?: unknown; visibility?: unknown }
    if (body.name !== undefined && typeof body.name !== 'string') throw new HttpError(400, 'name must be a string')
    if (body.description !== undefined && typeof body.description !== 'string') throw new HttpError(400, 'description must be a string')
    if (body.visibility !== undefined && body.visibility !== 'public' && body.visibility !== 'private') throw new HttpError(400, 'visibility must be public or private')
    const updated = updateRepo(repo, { name: body.name as string | undefined, description: body.description as string | undefined, visibility: body.visibility as Visibility | undefined })
    return Response.json({ repo: updated }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: RouteContext<'/api/repos/[id]'>) {
  try {
    const user = await requireUser(request)
    deleteRepo(ownedRepo((await params).id, user.id))
    return Response.json({ ok: true }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
