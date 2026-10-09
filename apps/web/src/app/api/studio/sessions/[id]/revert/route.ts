import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { revertTo } from '@/lib/studio/sessions'
import { requireSession, toView } from '@/lib/studio/view'

/** 回到某个快照：{ snapshot: 编号, label: 记在对话里的说明 }。 */
export async function POST(request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/revert'>) {
  try {
    const session = await requireSession((await params).id)
    const body = (await readJson(request)) as { snapshot?: unknown; label?: unknown }
    if (typeof body.snapshot !== 'number') throw new HttpError(400, 'snapshot must be a number')
    const label = typeof body.label === 'string' ? body.label.slice(0, 200) : ''
    return Response.json(toView(await revertTo(session, body.snapshot, label)), { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
