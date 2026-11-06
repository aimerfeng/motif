'use client'

import { Link, usePathname } from '@/i18n/navigation'

/** 账号栏目和管理后台的二级导航：一排标签，当前页高亮。 */
export function AccountNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname()
  return (
    // 标签只有几个，不做横向滚动：滚动容器会把压在底线上的高亮线裁掉，还多出一条滚动条。
    <nav className="-mx-1 flex flex-wrap gap-1 border-b border-line">
      {links.map((link) => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`-mb-px border-b px-3 pt-1 pb-3 text-[14px] whitespace-nowrap transition-colors duration-150 ${active ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink'}`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
