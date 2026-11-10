import { loginStatus } from '@/lib/accounts/cli-login'
import { authReady } from '@/lib/auth/server'
import { errorResponse, NO_STORE } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'

/** CLI 轮询登录请求的状态：pending、approved、denied、expired。 */
export async function GET(request: Request, { params }: RouteContext<'/api/cli/login/[id]'>) {
  try {
    rateLimit(request, 'cli-login-poll', 120)
    await authReady()
    return Response.json({ status: loginStatus((await params).id) }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
