import { requireUser } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { LIMITS } from '@/lib/repos/files'
import { deleteFile, ownedRepo, putFile } from '@/lib/repos/repos'

/** 新建或保存一个文件：{ path, content }。 */
export async function PUT(request: Request, { params }: RouteContext<'/api/repos/[id]/files'>) {
  try {
    rateLimit(request, 'repo-file', 60)
    const user = await requireUser(request)
    const repo = ownedRepo((await params).id, user.id)
    const body = (await readJson(request, LIMITS.fileBytes * 2)) as { path?: unknown; content?: unknown }
    if (typeof body.path !== 'string' || typeof body.content !== 'string') throw new HttpError(400, 'path and content are required')
    putFile(repo, body.path, body.content)
    return Response.json({ ok: true }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}

/** 删除一个文件：?path=<路径>。 */
export async function DELETE(request: Request, { params }: RouteContext<'/api/repos/[id]/files'>) {
  try {
    const user = await requireUser(request)
    const repo = ownedRepo((await params).id, user.id)
    const path = new URL(request.url).searchParams.get('path')
    if (!path) throw new HttpError(400, 'path is required')
    deleteFile(repo, path)
    return Response.json({ ok: true }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
