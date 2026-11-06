import { errorResponse, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { applyValuesAsDefaults } from '@/lib/studio/sessions'
import { requireEditableSession } from '@/lib/studio/access'
import { toView } from '@/lib/studio/view'

/** 「应用为默认值」：把预览里调好的参数写成条目的默认值。 */
export async function POST(request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/defaults'>) {
  try {
    rateLimit(request, 'studio-save', 30)
    const { id } = await params
    await requireEditableSession(request, id)
    const { values } = (await readJson(request)) as { values?: unknown }
    return Response.json(toView(await applyValuesAsDefaults(id, values)), { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
