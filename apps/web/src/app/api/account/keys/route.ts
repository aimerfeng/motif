import { createKey, listKeys } from '@/lib/accounts/api-keys'
import { requireUser } from '@/lib/auth/server'
import { errorResponse, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'

export async function GET(request: Request) {
  try {
    const user = await requireUser(request)
    return Response.json({ keys: listKeys(user.id) }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}

/** 新建密钥：明文只在这个响应里出现一次。 */
export async function POST(request: Request) {
  try {
    rateLimit(request, 'account-keys', 10)
    const user = await requireUser(request)
    const body = (await readJson(request)) as { name?: unknown }
    const { key, view } = createKey(user.id, typeof body.name === 'string' ? body.name : '')
    return Response.json({ key, view }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
