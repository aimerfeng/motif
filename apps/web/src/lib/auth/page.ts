import { headers } from 'next/headers'
import { redirect } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { all } from '@/lib/db'
import { sessionUser, type SessionUser } from './server'

/** 页面（服务端组件）里的当前用户；没登录是 null。读了请求头，页面按请求渲染。 */
export async function pageUser(): Promise<SessionUser | null> {
  return sessionUser(await headers())
}

/** 要登录才能看的页面：没登录就去登录页，登录完回到 next。 */
export async function requirePageUser(locale: Locale, next: string): Promise<SessionUser> {
  const user = await pageUser()
  if (!user) redirect({ href: { pathname: '/login', query: { next } }, locale })
  return user!
}

export interface LinkedAccount {
  /** Better Auth 的账号行 id（解除关联时用）。 */
  id: string
  providerId: string
  scopes: string[]
}

/** 用户有哪些登录方式（credential 是邮箱密码），以及 GitHub 授权了哪些范围。 */
export function linkedAccounts(userId: string): LinkedAccount[] {
  return all<{ id: string; providerId: string; scope: string | null }>('SELECT id, providerId, scope FROM account WHERE userId = ?', userId).map((row) => ({
    id: row.id,
    providerId: row.providerId,
    scopes: (row.scope ?? '').split(/[,\s]+/).filter(Boolean),
  }))
}
