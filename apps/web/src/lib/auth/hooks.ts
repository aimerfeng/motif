import { ensureProfile, setGitHubLogin } from '@/lib/accounts/profile'
import { grantSignupBonus } from '@/lib/credits/ledger'

/*
 * Better Auth 的数据库钩子。这里出错不能让登录失败（账号已经建好了），记日志，之后用到资料时会再补建。
 */

export interface HookUser {
  id: string
  email: string
  name: string
  emailVerified?: boolean
  githubLogin?: string | null
}

export async function onUserCreated(user: HookUser): Promise<void> {
  try {
    ensureProfile(user)
    // GitHub 登录的新用户邮箱已经验证过，当场送；邮箱注册的等点了验证链接（onUserUpdated）。
    if (user.emailVerified) grantSignupBonus(user.id, user.email)
  } catch (error) {
    console.error('[auth] could not set up the new user', error)
  }
}

/** 邮箱验证通过（Better Auth 把 emailVerified 改成 true）时送注册积分。每个用户、每个邮箱只送一次。 */
export async function onUserUpdated(user: HookUser): Promise<void> {
  if (!user.emailVerified) return
  try {
    grantSignupBonus(user.id, user.email)
  } catch (error) {
    console.error('[auth] could not grant the signup bonus', error)
  }
}

/** 关联 GitHub（GitHub 登录，或者邮箱账号后来绑了 GitHub）：记下 GitHub 用户名，导入仓库、推送都要用。 */
export async function onGitHubLinked(account: { providerId: string; userId: string; accessToken?: string | null }): Promise<void> {
  if (account.providerId !== 'github' || !account.accessToken) return
  try {
    const response = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${account.accessToken}`, Accept: 'application/vnd.github+json', 'User-Agent': 'motif' } })
    if (!response.ok) return
    const { login } = (await response.json()) as { login?: unknown }
    if (typeof login === 'string' && login) setGitHubLogin(account.userId, login)
  } catch (error) {
    console.error('[auth] could not read the GitHub login', error)
  }
}
