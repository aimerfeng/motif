import { apiKeyOf, revokeKey, type ApiKeyIdentity } from '@/lib/accounts/api-keys'
import { profileOf } from '@/lib/accounts/profile'
import { authReady } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE } from '@/lib/community/http'
import { balanceOf } from '@/lib/credits/ledger'
import { one } from '@/lib/db'

function requireKey(request: Request): ApiKeyIdentity {
  const key = apiKeyOf(request)
  if (!key) throw new HttpError(401, 'send your API key: Authorization: Bearer mk_…')
  return key
}

/** CLI 的 whoami：这个密钥是谁的、叫什么、还剩多少积分。只认 API 密钥。 */
export async function GET(request: Request) {
  try {
    await authReady()
    const key = requireKey(request)
    const user = one<{ name: string }>('SELECT name FROM "user" WHERE id = ?', key.userId)
    return Response.json(
      { user: { name: user?.name ?? '', handle: profileOf(key.userId)?.handle ?? null }, key: { name: key.name, prefix: key.prefix }, balance: balanceOf(key.userId) },
      { headers: NO_STORE },
    )
  } catch (error) {
    return errorResponse(error)
  }
}

/** CLI 的 logout：吊销请求自己带的这个密钥——本机删掉的密钥不该在服务器上继续有效。 */
export async function DELETE(request: Request) {
  try {
    await authReady()
    const key = requireKey(request)
    revokeKey(key.userId, key.id)
    return Response.json({ ok: true }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
