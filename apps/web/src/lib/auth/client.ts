'use client'

import { createAuthClient } from 'better-auth/react'

/** 浏览器里的登录客户端：地址就是当前站点的 /api/auth。 */
export const authClient = createAuthClient({ basePath: '/api/auth' })

/**
 * 登录后跳去哪里：只认站内的相对地址（以单个 / 开头），防止 ?next=https://别的网站 把人带走。
 */
export function safeNext(next: string | null | undefined, fallback = '/account'): string {
  if (!next || !next.startsWith('/') || /[\\]/.test(next) || [...next].some((char) => char.charCodeAt(0) < 0x20 || char.charCodeAt(0) === 0x7f)) return fallback
  // 浏览器解析 URL 时会去掉制表符、换行，「/\t/evil.example」会变成别的站点：按浏览器的规则解析一遍，必须还在本站。
  const base = 'https://motif.invalid'
  try {
    const url = new URL(next, base)
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : fallback
  } catch {
    return fallback
  }
}
