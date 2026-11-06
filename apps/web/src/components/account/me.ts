'use client'

import { useEffect, useSyncExternalStore } from 'react'

/*
 * 当前登录的用户（/api/me）：头部按钮、下载按钮、工作台都要知道「是谁、还剩多少积分」。
 * 整页共用一份，第一次有组件要用时才请求；买了东西、扣了积分之后调用 refreshMe() 让所有地方一起更新。
 * 页面本身保持静态渲染，登录状态只在浏览器里取（docs/decisions/0009）。
 */

export interface Me {
  id: string
  name: string
  email: string
  image: string | null
  emailVerified: boolean
  githubLogin: string | null
  handle: string
  balance: number
  admin: boolean
}

/** undefined：还在问；null：没登录。 */
type State = Me | null | undefined

let state: State = undefined
let inflight: Promise<void> | null = null
const listeners = new Set<() => void>()

function emit(next: State) {
  state = next
  for (const listener of listeners) listener()
}

export function refreshMe(): Promise<void> {
  inflight ??= fetch('/api/me', { cache: 'no-store' })
    .then((response) => (response.ok ? (response.json() as Promise<{ user: Me | null }>) : { user: null }))
    .then((json) => emit(json.user))
    .catch(() => emit(null))
    .finally(() => {
      inflight = null
    })
  return inflight
}

/** 本地先把余额改掉（扣费接口返回了新余额），不必再请求一次。 */
export function setBalance(balance: number) {
  if (state) emit({ ...state, balance })
}

export function useMe(): State {
  const value = useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state,
    () => undefined,
  )
  useEffect(() => {
    if (state === undefined && !inflight) void refreshMe()
  }, [])
  return value
}
