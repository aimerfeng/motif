import { errorResponse, NO_STORE, readJson } from '@/lib/community/http'
import { applyValuesAsDefaults } from '@/lib/studio/sessions'
import { requireSession, toView } from '@/lib/studio/view'

/** 「应用为默认值」：把预览里调好的参数写成条目的默认值。 */
export async function POST(request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/defaults'>) {
  try {
    const session = await requireSession((await params).id)
    const { values } = (await readJson(request)) as { values?: unknown }
    return Response.json(toView(await applyValuesAsDefaults(session, (values ?? {}) as Record<string, never>)), { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
