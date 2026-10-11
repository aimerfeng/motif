'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { FaucetButton } from './faucet'
import { PauseControl } from './pause-control'

const LINKS = [
  { href: '/community', key: 'overview', exact: true },
  { href: '/community/submit', key: 'submit' },
  { href: '/community/review', key: 'review' },
  { href: '/community/governance', key: 'governance' },
] as const

/**
 * 社区栏目里的二级导航。审核和治理带上进行中的数量，有事可做一眼就能看到。
 * 右侧是这一行的状态：本地测试链（可以领测试币）和版主的暂停开关（只有版主看得到）。
 */
export function CommunityNav({ counts, local, chainName, paused }: { counts: { review: number; governance: number }; local: boolean; chainName: string; paused: boolean }) {
  const t = useTranslations('community.nav')
  const pathname = usePathname()
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line">
      <nav aria-label={t('label')} className="-mx-5 flex gap-6 overflow-x-auto px-5 text-[14px] [scrollbar-width:none] sm:mx-0 sm:px-0">
        {LINKS.map((link) => {
          const active = 'exact' in link ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`)
          const count = link.key === 'review' ? counts.review : link.key === 'governance' ? counts.governance : 0
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className="-mb-px flex shrink-0 items-center gap-1.5 border-b border-transparent pb-3 text-ink-muted transition-colors duration-150 hover:text-ink aria-[current=page]:border-ink aria-[current=page]:text-ink"
            >
              {t(link.key)}
              {count > 0 && <span className="min-w-[18px] rounded-full bg-pending/15 px-1.5 text-center font-mono text-[11px] leading-[18px] text-pending tabular-nums">{count}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {local && (
          <span title={t('testnetTitle', { chain: chainName })} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-pending/30 bg-pending/5 px-2.5 text-[12px] text-pending">
            <span aria-hidden className="size-1.5 rounded-full bg-pending" />
            {t('testnet')}
          </span>
        )}
        {local && <FaucetButton compact />}
        <PauseControl paused={paused} />
      </div>
    </div>
  )
}
