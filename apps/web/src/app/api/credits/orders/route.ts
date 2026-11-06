import { requireUser } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { createOrder, ordersOf } from '@/lib/credits/orders'

export async function GET(request: Request) {
  try {
    const user = await requireUser(request)
    return Response.json({ orders: ordersOf(user.id) }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}

/** 买一个积分套餐：生成待付款的订单。 */
export async function POST(request: Request) {
  try {
    rateLimit(request, 'credit-order', 10)
    const user = await requireUser(request)
    const body = (await readJson(request)) as { packageId?: unknown }
    if (typeof body.packageId !== 'string') throw new HttpError(400, 'packageId is required')
    return Response.json({ order: createOrder(user.id, body.packageId) }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
