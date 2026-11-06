import { ensureProfile } from '@/lib/accounts/profile'
import { isAdmin, sessionUser } from '@/lib/auth/server'
import { errorResponse, NO_STORE } from '@/lib/community/http'
import { balanceOf } from '@/lib/credits/ledger'

/** 当前登录的用户（头部的账号按钮用）：资料、积分余额、是不是管理员。没登录是 { user: null }。 */
export async function GET(request: Request) {
  try {
    const user = await sessionUser(request.headers)
    if (!user) return Response.json({ user: null }, { headers: NO_STORE })
    // 钩子出过错没建成资料的老账号，在这里补上。
    const profile = ensureProfile(user)
    return Response.json(
      { user: { id: user.id, name: user.name, email: user.email, image: user.image, emailVerified: user.emailVerified, githubLogin: user.githubLogin, handle: profile.handle, balance: balanceOf(user.id), admin: isAdmin(user) } },
      { headers: NO_STORE },
    )
  } catch (error) {
    return errorResponse(error)
  }
}
