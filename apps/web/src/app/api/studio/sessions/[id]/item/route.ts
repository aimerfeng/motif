import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { parseItemSource } from '@/lib/community/submission'
import { updateItem } from '@/lib/studio/sessions'
import { requireSession, toView } from '@/lib/studio/view'

/** 用户在代码编辑器里改完保存：整份条目换掉，重新检查、编译。 */
export async function PUT(request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/item'>) {
  try {
    rateLimit(request, 'studio-save', 30)
    const session = await requireSession((await params).id)
    const item = parseItemSource((await readJson(request) as { item?: unknown }).item)
    if (typeof item === 'string') throw new HttpError(400, item)
    return Response.json(toView(await updateItem(session, item)), { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
