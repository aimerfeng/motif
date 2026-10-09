import { errorResponse, NO_STORE } from '@/lib/community/http'
import { requireSession, toView } from '@/lib/studio/view'

export async function GET(_request: Request, { params }: RouteContext<'/api/studio/sessions/[id]'>) {
  try {
    const session = await requireSession((await params).id)
    return Response.json(toView(session), { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
