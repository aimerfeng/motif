'use client'

import { useEffect, useId, useState } from 'react'
import { MenuIcon } from '@/components/icons'
import { Link, usePathname } from '@/i18n/navigation'

export interface NavLink {
  href: string
  label: string
  /** 还没上线的栏目在链接旁标一个小字，点进去之前就知道。 */
  badge?: string
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** 桌面端的横排导航，当前栏目高亮。 */
export function DesktopNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname()
  return (
    <nav className="hidden items-center gap-1 text-[14px] text-ink-muted sm:flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive(pathname, link.href) ? 'page' : undefined}
          className="flex items-baseline gap-1.5 rounded-md px-3 py-1.5 transition-colors duration-150 hover:bg-white/5 hover:text-ink aria-[current=page]:text-ink"
        >
          {link.label}
          {link.badge && <span className="text-[10.5px] text-ink-faint">{link.badge}</span>}
        </Link>
      ))}
    </nav>
  )
}

/** 手机上的导航：右上角一个按钮，展开成全宽的下拉面板。 */
export function MobileNav({ links, label }: { links: NavLink[]; label: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="grid size-8 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink"
      >
        <MenuIcon open={open} className="size-[18px]" />
      </button>
      {open && (
        // 遮罩盖住页面其余部分，点一下就收起菜单。头部有 backdrop-filter，fixed 会相对头部定位，所以用 absolute + 一屏高。
        <button type="button" aria-hidden tabIndex={-1} onClick={() => setOpen(false)} className="absolute inset-x-0 top-full h-dvh cursor-default bg-black/50" />
      )}
      {open && (
        <nav id={panelId} className="absolute inset-x-0 top-full border-b border-line bg-canvas px-5 pt-2 pb-4 shadow-[0_24px_48px_-12px_oklch(0_0_0/0.6)]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(pathname, link.href) ? 'page' : undefined}
              className="flex items-baseline justify-between border-b border-line py-3.5 text-[16px] text-ink-muted last:border-b-0 aria-[current=page]:text-ink"
            >
              {link.label}
              {link.badge && <span className="text-[12px] text-ink-faint">{link.badge}</span>}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
