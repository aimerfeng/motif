import { requireAdmin } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { one } from '@/lib/db'
import { applyCredit } from '@/lib/credits/ledger'

/** 管理员给用户加减积分：{ user: handle 或邮箱, delta, note }。原因必填，记进流水。 */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request)
    const body = (await readJson(request)) as { user?: unknown; delta?: unknown; note?: unknown }
    if (typeof body.user !== 'string' || !body.user.trim()) throw new HttpError(400, 'user (handle or email) is required')
    if (typeof body.delta !== 'number' || !Number.isInteger(body.delta) || body.delta === 0 || Math.abs(body.delta) > 10_000_000) throw new HttpError(400, 'delta must be a non-zero integer')
    if (typeof body.note !== 'string' || !body.note.trim()) throw new HttpError(400, 'a reason is required')
    const key = body.user.trim().replace(/^@/, '').toLowerCase()
    const target = one<{ id: string }>('SELECT u.id FROM "user" u LEFT JOIN profile p ON p.user_id = u.id WHERE lower(u.email) = ? OR p.handle = ?', key, key)
    if (!target) throw new HttpError(404, 'no such user')
    const { balance } = applyCredit({ userId: target.id, delta: body.delta, kind: 'admin', note: `${body.note.trim().slice(0, 200)} (by ${admin.email})`, allowNegative: true })
    return Response.json({ balance }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
