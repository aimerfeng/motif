import { revokeKey } from '@/lib/accounts/api-keys'
import { requireUser } from '@/lib/auth/server'
import { errorResponse, NO_STORE } from '@/lib/community/http'

export async function DELETE(request: Request, { params }: RouteContext<'/api/account/keys/[id]'>) {
  try {
    const user = await requireUser(request)
    revokeKey(user.id, (await params).id)
    return Response.json({ ok: true }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
