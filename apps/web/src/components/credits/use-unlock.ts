'use client'

import { useEffect, useState } from 'react'
import { setBalance, useMe } from '@/components/account/me'
import { usePathname, useRouter } from '@/i18n/navigation'
import { api, ApiError } from '@/lib/api-client'

/**
 * 网页上的下载先解锁（docs/decisions/0009 第 5 节）：第一次花积分，之后免费。
 * 没登录就去登录页；积分不够抛出带说明的错误，按钮旁边显示并给出购买链接。
 * enabled 为假（工作台里下载自己正在做的条目）时不收费，ensure 直接放行。
 */
export function useUnlock(kind: 'item' | 'skill', target: string, enabled = true) {
  const me = useMe()
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<{ cost: number; unlocked: boolean } | null>(null)
  const [error, setError] = useState<{ text: string; buy: boolean } | null>(null)

  useEffect(() => {
    if (!enabled || me === undefined) return
    let cancelled = false
    api<{ cost: number; unlocked: boolean }>(`/api/credits/unlock?kind=${kind}&target=${encodeURIComponent(target)}`)
      .then((result) => !cancelled && setStatus(result))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [kind, target, me, enabled])

  /** 解锁成功（或早就解锁了）返回 true；要去登录、积分不够返回 false。 */
  const ensure = async (): Promise<boolean> => {
    setError(null)
    if (!enabled) return true
    if (me === null) {
      router.push({ pathname: '/login', query: { next: pathname } })
      return false
    }
    if (status?.unlocked || status?.cost === 0) return true
    try {
      const result = await api<{ balance: number }>('/api/credits/unlock', { body: { kind, target } })
      setBalance(result.balance)
      setStatus((current) => (current ? { ...current, unlocked: true } : current))
      return true
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'insufficient_credits') setError({ text: cause.message, buy: true })
      else if (cause instanceof ApiError && cause.status === 401) router.push({ pathname: '/login', query: { next: pathname } })
      else setError({ text: cause instanceof Error ? cause.message : String(cause), buy: false })
      return false
    }
  }

  return { status, error, ensure, signedIn: me !== null && me !== undefined }
}
