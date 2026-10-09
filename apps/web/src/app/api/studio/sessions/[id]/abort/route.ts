import { errorResponse, NO_STORE } from '@/lib/community/http'
import { abortRun } from '@/lib/studio/sessions'
import { requireSession } from '@/lib/studio/view'

export async function POST(_request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/abort'>) {
  try {
    const session = await requireSession((await params).id)
    return Response.json({ aborted: abortRun(session.id) }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
