import type { Metadata } from 'next'
import { connection } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { CreatorCard } from '@/components/community/creator-card'
import { Pagination } from '@/components/community/pagination'
import { buttonPrimary, buttonSecondary, EmptyState, HairlineGrid, PageHeader } from '@/components/community/ui'
import { PlusIcon, UsersIcon } from '@/components/icons'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { authReady } from '@/lib/auth/server'
import { listCreators, parsePage } from '@/lib/repos/explore'
import { alternatesFor } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/community/creators'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.creators' })
  return { title: t('title'), description: t('description'), alternates: alternatesFor('/community/creators') }
}

/** 第一页不带参数：同一个视图只有一个地址。 */
function hrefOf(page: number): string {
  return page > 1 ? `/community/creators?page=${page}` : '/community/creators'
}

/**
 * 创作者名录：公开过仓库的人，按被 fork 的次数、公开仓库数排名（排序规则在 lib/repos/explore.ts）。
 * 名次是全站的名次，翻到第二页接着往下数，不是每页从 1 开始。
 */
export default async function CreatorsPage({ params, searchParams }: PageProps<'/[locale]/community/creators'>) {
  // 按请求渲染：要读数据库。放在最前面，构建时不会先去碰数据库。
  await connection()
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.creators' })
  const page = parsePage((await searchParams).page)
  await authReady()
  const result = listCreators({ page })

  return (
    <div className="space-y-10" data-testid="community-creators-page">
      <PageHeader title={t('title')} lead={t('lead')}>
        <Link href="/repos/new" className={buttonPrimary}>
          <PlusIcon className="size-4" />
          {t('new')}
        </Link>
      </PageHeader>

      {result.total === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={t('empty')}
          action={
            <Link href="/repos/new" className={buttonSecondary}>
              {t('new')}
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          <p className="text-[13px] text-ink-muted" data-testid="creators-count">
            {t('count', { count: result.total })}
          </p>
          <HairlineGrid count={result.rows.length}>
            {result.rows.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} showRank titleAs="h2" />
            ))}
          </HairlineGrid>
          <Pagination page={result.page} pages={result.pages} hrefOf={hrefOf} />
        </div>
      )}
    </div>
  )
}
