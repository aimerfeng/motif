'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

const LINKS = [
  { href: '/community', key: 'overview', exact: true },
  { href: '/community/submit', key: 'submit' },
  { href: '/community/review', key: 'review' },
  { href: '/community/governance', key: 'governance' },
] as const

/** 社区栏目里的二级导航。 */
export function CommunityNav() {
  const t = useTranslations('community.nav')
  const pathname = usePathname()
  return (
    <nav aria-label={t('label')} className="-mx-5 flex gap-6 overflow-x-auto border-b border-line px-5 text-[14px] [scrollbar-width:none] sm:mx-0 sm:px-0">
      {LINKS.map((link) => {
        const active = 'exact' in link ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className="-mb-px shrink-0 border-b border-transparent pb-3 text-ink-muted transition-colors duration-150 hover:text-ink aria-[current=page]:border-ink aria-[current=page]:text-ink"
          >
            {t(link.key)}
          </Link>
        )
      })}
    </nav>
  )
}
