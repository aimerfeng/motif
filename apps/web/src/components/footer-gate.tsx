'use client'

import type { ReactNode } from 'react'
import { usePathname } from '@/i18n/navigation'

/**
 * 工作台会话页是占满一屏的应用（左边对话、右边预览各自滚动），页脚放在下面只会多出一截要滚的空白。
 * 页脚本身是服务端组件，这里只决定渲不渲染它。
 */
export function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (/^\/studio\/[^/]+$/.test(pathname)) return null
  return children
}
