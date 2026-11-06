import { requireUser } from '@/lib/auth/server'
import { errorResponse, NO_STORE } from '@/lib/community/http'
import { cancelOrder } from '@/lib/credits/orders'

/** 取消自己的一张待付款订单。 */
export async function DELETE(request: Request, { params }: RouteContext<'/api/credits/orders/[id]'>) {
  try {
    const user = await requireUser(request)
    return Response.json({ order: cancelOrder((await params).id, user.id) }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
