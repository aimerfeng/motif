import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { CommunityNav } from '@/components/community/community-nav'
import { resolveRouteLocale } from '@/i18n/locale'
import type { Locale } from '@/i18n/routing'
import { getCommunity, openReviews } from '@/lib/community/state'

/**
 * 社区栏目的外壳：二级导航（带进行中的审核和投票中的提案数），测试链、版主开关这些状态也放在导航这一行，
 * 不再在每页顶部堆整宽的提示条。只有「投稿已暂停」这种影响操作的状态才单独占一行。
 *
 * 导航上的数字要读链：放进 Suspense，先出一个不带数字的导航，页面主体由 loading.tsx 先给骨架，
 * 点进社区时不会因为等链上同步而整页卡住。
 */
export default async function CommunityLayout({ children, params }: LayoutProps<'/[locale]/community'>) {
  const locale = resolveRouteLocale((await params).locale)
  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-8 pb-24 sm:px-8">
      <Suspense fallback={<CommunityNav counts={{ review: 0, governance: 0 }} local={false} chainName="" paused={false} />}>
        <CommunityStatus locale={locale} />
      </Suspense>
      <div className="pt-10">{children}</div>
    </main>
  )
}

async function CommunityStatus({ locale }: { locale: Locale }) {
  const community = await getCommunity()
  const t = await getTranslations({ locale, namespace: 'community.hub' })
  const now = community?.now ?? 0
  const counts = community
    ? {
        review: openReviews(community.state).length,
        governance: [...community.state.proposals.values()].filter((proposal) => now >= Number(proposal.voteStart) && now <= Number(proposal.voteEnd)).length,
      }
    : { review: 0, governance: 0 }
  return (
    <>
      <CommunityNav counts={counts} local={community?.config.local ?? false} chainName={community?.config.chainName ?? ''} paused={community?.state.paused ?? false} />
      {community?.state.paused && (
        <p role="status" className="mt-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-[13px] text-ink-muted">
          {t('paused')}
        </p>
      )}
    </>
  )
}
