import { startLogin } from '@/lib/accounts/cli-login'
import { authReady } from '@/lib/auth/server'
import { errorResponse, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { publicOrigin } from '@/lib/site'

/**
 * CLI 发起登录：交来它在本机生成的密钥的哈希，拿回一个确认码和确认页的地址。
 * 不需要登录——谁都可以发起，但只有登录的用户在确认页上同意之后这个密钥才生效。
 */
export async function POST(request: Request) {
  try {
    rateLimit(request, 'cli-login', 10)
    await authReady()
    const body = (await readJson(request, 2000)) as { keyHash?: unknown; keyPrefix?: unknown; name?: unknown }
    const login = startLogin({ keyHash: body.keyHash, keyPrefix: body.keyPrefix, name: body.name })
    // 确认码写在地址里是为了让用户少输一次；它不是凭证——没有登录的用户同意，它什么也换不到。
    return Response.json({ ...login, verifyUrl: `${publicOrigin(request)}/connect?code=${login.userCode}`, interval: 2 }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
