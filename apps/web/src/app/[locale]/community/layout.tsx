import { getTranslations } from 'next-intl/server'
import { CommunityNav } from '@/components/community/community-nav'
import { resolveRouteLocale } from '@/i18n/locale'
import { getCommunity, openReviews } from '@/lib/community/state'

/**
 * 社区栏目的外壳：二级导航（带进行中的审核和投票中的提案数），测试链、版主开关这些状态也放在导航这一行，
 * 不再在每页顶部堆整宽的提示条。只有「投稿已暂停」这种影响操作的状态才单独占一行。
 */
export default async function CommunityLayout({ children, params }: LayoutProps<'/[locale]/community'>) {
  const locale = resolveRouteLocale((await params).locale)
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
    <main className="mx-auto max-w-[1400px] px-5 pt-8 pb-24 sm:px-8">
      <CommunityNav counts={counts} local={community?.config.local ?? false} chainName={community?.config.chainName ?? ''} paused={community?.state.paused ?? false} />
      {community?.state.paused && (
        <p role="status" className="mt-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-[13px] text-ink-muted">
          {t('paused')}
        </p>
      )}
      <div className="pt-10">{children}</div>
    </main>
  )
}
