import { useCallback, useMemo, useSyncExternalStore } from 'react'

/*
 * 只存在这个浏览器里的小数据（收藏、最近看过、看过的提示）。
 * 用 useSyncExternalStore 读：服务端渲染时拿不到 localStorage，返回 SERVER；水合后换成真实的值，不会报水合不一致。
 * 同一页面里的多个组件、以及别的标签页（storage 事件）都会跟着更新。
 */

export const SERVER = Symbol('server')
const EVENT = 'motif-local-store'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    // 隐私模式或存储被禁用：当作没有。
    return null
  }
}

export function useLocalString(key: string): [string | null | typeof SERVER, (value: string | null) => void] {
  const subscribe = useCallback(
    (notify: () => void) => {
      const onChange = (event: Event) => {
        if (!(event instanceof StorageEvent) || event.key === key) notify()
      }
      window.addEventListener('storage', onChange)
      window.addEventListener(EVENT, onChange)
      return () => {
        window.removeEventListener('storage', onChange)
        window.removeEventListener(EVENT, onChange)
      }
    },
    [key],
  )
  const raw = useSyncExternalStore<string | null | typeof SERVER>(
    subscribe,
    () => read(key),
    () => SERVER,
  )
  const write = useCallback(
    (value: string | null) => {
      try {
        if (value === null) localStorage.removeItem(key)
        else localStorage.setItem(key, value)
      } catch {
        // 写不进去就算了，只影响这一个小功能。
      }
      window.dispatchEvent(new Event(EVENT))
    },
    [key],
  )
  return [raw, write]
}

/** 一串字符串（收藏的条目、最近看过的条目）。服务端渲染时为 null。 */
export function useLocalList(key: string, max: number): [string[] | null, (next: string[]) => void] {
  const [raw, write] = useLocalString(key)
  const list = useMemo(() => {
    if (raw === SERVER) return null
    try {
      const parsed = JSON.parse(raw ?? '[]') as unknown
      return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string').slice(0, max) : []
    } catch {
      return []
    }
  }, [raw, max])
  const set = useCallback((next: string[]) => write(JSON.stringify(next.slice(0, max))), [write, max])
  return [list, set]
}

/** 一次性的标记（提示看过了、条已经收起）。服务端渲染时为 null，避免提示在水合前闪一下。 */
export function useLocalFlag(key: string): [boolean | null, (value: boolean) => void] {
  const [raw, write] = useLocalString(key)
  const set = useCallback((value: boolean) => write(value ? '1' : null), [write])
  return [raw === SERVER ? null : raw === '1', set]
}

/** 不在组件里时往列表最前面放一项（例如打开条目页时记进「最近看过」），重复的挪到最前。 */
export function pushLocal(key: string, value: string, max: number): void {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown
    const list = Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string' && entry !== value) : []
    localStorage.setItem(key, JSON.stringify([value, ...list].slice(0, max)))
  } catch {
    return
  }
  window.dispatchEvent(new Event(EVENT))
}

/** 收藏的条目和最近看过的条目在哪个键、最多几个。 */
export const FAVORITES = { key: 'motif-favorites', max: 300 } as const
export const RECENT_ITEMS = { key: 'motif-recent-items', max: 12 } as const
