'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
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

/** 指示块的基准宽度：按当前栏目的宽度横向缩放（只动 transform）。 */
const PILL_BASE = 100

/**
 * 桌面端的横排导航，当前栏目高亮。头部跨页面常驻，换栏目时底色从上一个栏目滑到新的栏目（docs/decisions/0010）：
 * 告诉用户「你从哪儿到了哪儿」。不在任何栏目里（首页）时底色淡出。
 */
export function DesktopNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname()
  const nav = useRef<HTMLElement>(null)
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)

  // 字体加载完、窗口变化时链接宽度会变：用 ResizeObserver 跟着量。
  useLayoutEffect(() => {
    const element = nav.current
    if (!element) return
    const measure = () => {
      const current = element.querySelector<HTMLElement>('[aria-current="page"]')
      setPill(current ? { x: current.offsetLeft, w: current.offsetWidth } : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [pathname])

  return (
    <nav ref={nav} className="relative hidden items-center gap-1 text-[14px] text-ink-muted lg:flex">
      <span
        aria-hidden
        className="absolute top-1/2 left-0 h-8 origin-left rounded-md bg-ink/[0.07] transition-[transform,opacity] duration-(--duration-base) ease-(--ease-in-out-soft) motion-reduce:transition-none"
        style={{ width: PILL_BASE, transform: `translate(${pill?.x ?? 0}px, -50%) scaleX(${(pill?.w ?? 0) / PILL_BASE})`, opacity: pill ? 1 : 0 }}
      />
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive(pathname, link.href) ? 'page' : undefined}
          // relative：链接画在滑动的底色上面（定位元素按文档顺序叠放）。
          className="relative flex items-baseline gap-1.5 rounded-md px-2.5 py-1.5 whitespace-nowrap transition-colors duration-150 hover:bg-ink/5 hover:text-ink aria-[current=page]:text-ink aria-[current=page]:hover:bg-transparent xl:px-3"
        >
          {link.label}
          {link.badge && <span className="text-[10.5px] text-ink-faint">{link.badge}</span>}
        </Link>
      ))}
    </nav>
  )
}

/** 窄屏（lg 以下）的导航：右上角一个按钮，展开成全宽的下拉面板。 */
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
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="grid size-8 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-ink/5 hover:text-ink"
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
