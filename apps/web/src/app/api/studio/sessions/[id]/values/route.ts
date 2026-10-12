import { errorResponse, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { saveValues } from '@/lib/studio/sessions'
import { requireSession } from '@/lib/studio/view'

/** 记住预览里调的参数，刷新页面后还在。agent 正在运行时由它负责写，这里不覆盖。 */
export async function PUT(request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/values'>) {
  try {
    rateLimit(request, 'studio-values', 120)
    const { id } = await params
    await requireSession(id)
    const { values } = (await readJson(request)) as { values?: unknown }
    return Response.json({ saved: await saveValues(id, values) }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
