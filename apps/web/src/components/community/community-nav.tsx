'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { FaucetButton } from './faucet'
import { PauseControl } from './pause-control'

/** 不依赖链的部分：公开仓库和创作者，数据在站点自己的数据库里，任何时候都在。 */
const SITE_LINKS = [
  { href: '/community', key: 'overview', exact: true },
  { href: '/community/explore', key: 'explore' },
  { href: '/community/creators', key: 'creators' },
] as const

/** 链上的部分：只有连上社区链才有内容。 */
const CHAIN_LINKS = [
  { href: '/community/submit', key: 'submit' },
  { href: '/community/review', key: 'review' },
  { href: '/community/governance', key: 'governance' },
] as const

const linkClass = '-mb-px flex shrink-0 items-center gap-1.5 border-b border-transparent pb-3 text-ink-muted transition-colors duration-150 hover:text-ink aria-[current=page]:border-ink aria-[current=page]:text-ink'

/**
 * 社区栏目里的二级导航。审核和治理带上进行中的数量，有事可做一眼就能看到。
 * 右侧是这一行的状态：本地测试链（可以领测试币）和版主的暂停开关（只有版主看得到）。
 *
 * chain：社区链连上了没有。没连上时只有站内的三项——投稿、审核、治理点进去只有一句「还没连接」，不摆出来占位置。
 * 连上后链上的三项接在后面（中间一道细线分开）：站内三项的位置不变，
 * 导航先出（这时还不知道链的状态）、链的状态后到，后到的只是在末尾多出几项，已经在的不会挪位置。
 */
export function CommunityNav({ counts, local, chainName, paused, chain }: { counts: { review: number; governance: number }; local: boolean; chainName: string; paused: boolean; chain: boolean }) {
  const t = useTranslations('community.nav')
  const pathname = usePathname()
  const isActive = (link: { href: string; exact?: boolean }) => (link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`))
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line">
      <nav aria-label={t('label')} className="-mx-5 flex gap-6 overflow-x-auto px-5 text-[14px] [scrollbar-width:none] sm:mx-0 sm:px-0">
        {SITE_LINKS.map((link) => (
          <Link key={link.href} href={link.href} aria-current={isActive(link) ? 'page' : undefined} className={linkClass}>
            {t(link.key)}
          </Link>
        ))}
        {chain && (
          <>
            <span aria-hidden className="mt-0.5 mb-3.5 w-px shrink-0 self-stretch bg-line" />
            {CHAIN_LINKS.map((link) => {
              const count = link.key === 'review' ? counts.review : link.key === 'governance' ? counts.governance : 0
              return (
                <Link key={link.href} href={link.href} aria-current={isActive(link) ? 'page' : undefined} className={linkClass}>
                  {t(link.key)}
                  {count > 0 && <span className="min-w-[18px] rounded-full bg-pending/15 px-1.5 text-center font-mono text-[11px] leading-[18px] text-pending tabular-nums">{count}</span>}
                </Link>
              )
            })}
          </>
        )}
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
