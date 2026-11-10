import { resolveLogin } from '@/lib/accounts/cli-login'
import { requireUser } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'

/** 确认页上的「同意 / 拒绝」：要登录。限流同时挡住拿确认码乱试。 */
export async function POST(request: Request) {
  try {
    rateLimit(request, 'cli-login-approve', 10)
    const user = await requireUser(request)
    const body = (await readJson(request, 2000)) as { code?: unknown; action?: unknown }
    if (typeof body.code !== 'string' || (body.action !== 'approve' && body.action !== 'deny')) throw new HttpError(400, 'expected { code, action: "approve" | "deny" }')
    resolveLogin(user.id, body.code, body.action)
    return Response.json({ ok: true }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
