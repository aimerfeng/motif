import { auth, authReady } from '@/lib/auth/server'

/** Better Auth 的全部接口（登录、注册、验证邮箱、OAuth 回调……），设计见 docs/decisions/0009-accounts-credits-repos.md。 */
async function handle(request: Request): Promise<Response> {
  await authReady()
  return auth().handler(request)
}

export const GET = handle
export const POST = handle
