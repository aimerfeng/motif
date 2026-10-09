import { errorResponse, NO_STORE, readJson } from '@/lib/community/http'
import { isRunning, sanitizeValues } from '@/lib/studio/sessions'
import { saveSession } from '@/lib/studio/store'
import { requireSession } from '@/lib/studio/view'

/** 记住预览里调的参数，刷新页面后还在。agent 正在运行时由它负责写，这里不覆盖。 */
export async function PUT(request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/values'>) {
  try {
    const session = await requireSession((await params).id)
    if (isRunning(session.id)) return Response.json({ saved: false }, { headers: NO_STORE })
    const { values } = (await readJson(request)) as { values?: unknown }
    await saveSession({ ...session, values: sanitizeValues(session.item, values) })
    return Response.json({ saved: true }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
