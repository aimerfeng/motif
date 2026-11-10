'use client'

import { Link, usePathname } from '@/i18n/navigation'

/** 账号栏目和管理后台的二级导航：一排标签，当前页高亮。 */
export function AccountNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname()
  // 子页面（/admin/users/<id>）也要亮起它所属的那一项，所以按前缀比；
  // 取最长的那个，「概览」（/admin）才不会在每个子栏目里都跟着亮。
  const current = links
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .reduce<string | null>((best, link) => (best === null || link.href.length > best.length ? link.href : best), null)
  return (
    // 标签只有几个，不做横向滚动：滚动容器会把压在底线上的高亮线裁掉，还多出一条滚动条。
    <nav className="-mx-1 flex flex-wrap gap-1 border-b border-line">
      {links.map((link) => {
        const active = link.href === current
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
