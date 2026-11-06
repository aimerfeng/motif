import { errorResponse, NO_STORE } from '@/lib/community/http'
import { abortRun } from '@/lib/studio/sessions'
import { requireEditableSession } from '@/lib/studio/access'

export async function POST(request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/abort'>) {
  try {
    const session = await requireEditableSession(request, (await params).id)
    return Response.json({ aborted: abortRun(session.id) }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
