'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { MoonIcon, SunIcon } from '@/components/icons'
import { applyTheme, currentTheme, type Theme } from '@/lib/theme'

/** <html data-theme> 的当前值：用 MutationObserver 订阅，别处改了这里也跟着变。服务端渲染时按暗色。 */
function useTheme(): Theme {
  const subscribe = useCallback((notify: () => void) => {
    const observer = new MutationObserver(notify)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  return useSyncExternalStore(subscribe, currentTheme, () => 'dark')
}

/** 头部的明暗切换，选择记在这个浏览器里。 */
export function ThemeToggle({ labels }: { labels: { light: string; dark: string } }) {
  const theme = useTheme()
  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  const label = next === 'light' ? labels.light : labels.dark
  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-ink/5 hover:text-ink"
      data-testid="theme-toggle"
    >
      {theme === 'dark' ? <SunIcon className="size-[18px]" /> : <MoonIcon className="size-[18px]" />}
    </button>
  )
}
