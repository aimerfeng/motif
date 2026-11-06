import { requireAdmin } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { cancelOrder, markPaid } from '@/lib/credits/orders'

/** 管理员处理积分订单：{ action: 'paid', note? } 确认收款（积分到账），{ action: 'cancel' } 取消。 */
export async function POST(request: Request, { params }: RouteContext<'/api/admin/orders/[id]'>) {
  try {
    const admin = await requireAdmin(request)
    const { id } = await params
    const body = (await readJson(request)) as { action?: unknown; note?: unknown }
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 200) : ''
    if (body.action === 'paid') return Response.json({ order: markPaid(id, { provider: 'manual', ref: admin.email, note: note || null }) }, { headers: NO_STORE })
    if (body.action === 'cancel') return Response.json({ order: cancelOrder(id) }, { headers: NO_STORE })
    throw new HttpError(400, 'action must be "paid" or "cancel"')
  } catch (error) {
    return errorResponse(error)
  }
}
