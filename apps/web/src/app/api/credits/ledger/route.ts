import { requireUser } from '@/lib/auth/server'
import { errorResponse, NO_STORE } from '@/lib/community/http'
import { balanceOf, ledgerOf } from '@/lib/credits/ledger'

/** 积分流水，按时间倒序分页：?before=<上一页最后一条的 id>。 */
export async function GET(request: Request) {
  try {
    const user = await requireUser(request)
    const before = Number(new URL(request.url).searchParams.get('before'))
    const entries = ledgerOf(user.id, 50, Number.isInteger(before) && before > 0 ? before : undefined)
    return Response.json({ balance: balanceOf(user.id), entries }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
