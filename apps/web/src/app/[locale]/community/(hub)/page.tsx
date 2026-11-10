import { motifCurationAbi } from '@motif/contracts'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { ActiveCreators, LatestRepos, TakePart, Trending } from '@/components/community/hub-sections'
import { Avatar, PersonLink } from '@/components/community/people'
import { buttonPrimary, buttonSecondary, EmptyState, linkMuted, PageHeader, SectionHeader, Stat, StatGrid, StatLink, VoteMeter } from '@/components/community/ui'
import { CoinsIcon, LayersIcon, PlusIcon, ReviewIcon, UploadIcon, UsersIcon } from '@/components/icons'
import { ItemCard } from '@/components/market/item-card'
import { Link } from '@/i18n/navigation'
import { resolveRouteLocale } from '@/i18n/locale'
import type { Locale } from '@/i18n/routing'
import { profileOf } from '@/lib/accounts/profile'
import { pageUser } from '@/lib/auth/page'
import { authReady } from '@/lib/auth/server'
import { getPublishedItems } from '@/lib/catalog'
import { formatMotif, formatMotifCompact } from '@/lib/community/shared'
import { getCommunity, openReviews, type Community } from '@/lib/community/state'
import { communitySummaries } from '@/lib/community/summaries'
import { relativeTime } from '@/lib/community/time'
import { itemLink, personOf } from '@/lib/community/views'
import { communityStats, topCreators, weeklyUses } from '@/lib/repos/explore'
import { recentPublicRepos } from '@/lib/repos/repos'
import { alternatesFor } from '@/lib/site'
import { leaderboard } from '@/lib/stats/board'

export async function generateMetadata({ params }: PageProps<'/[locale]/community'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.home' })
  return { title: t('title'), description: t('description'), alternates: alternatesFor('/community') }
}

/** 概览页上各放几张卡：三列排两行。 */
const LATEST_REPOS = 6
const TOP_CREATORS = 6

/**
 * 社区概览。栏目有两部分，这一页两种情况都要像一张完整的页面：
 * - 没连社区链：公开仓库、创作者、本周热门和「怎么参与」就是全部内容，数据都在站点自己的数据库里。
 * - 连了链：链上的概览（投稿、审核、贡献者）和原来一样排在前面，站内的几个分区接在后面。
 *
 * 放在路由组 (hub) 里只是为了给这一页单独配骨架（loading.tsx），不影响地址，也不影响其他社区子页面的骨架。
 */
export default async function CommunityPage({ params }: PageProps<'/[locale]/community'>) {
  // 按请求渲染：下面要读数据库和链。放在最前面，构建时不会先去碰它们。
  await connection()
  const locale = resolveRouteLocale((await params).locale)
  const community = await getCommunity()
  if (!community) return <SiteHub locale={locale} />
  return (
    <div className="space-y-16">
      <ChainOverview community={community} locale={locale} />
      {/* 站内的分区单独流式输出：链上内容和原来一样快地出来，不用等数据库和排行榜。 */}
      <Suspense fallback={null}>
        <SiteSections locale={locale} />
      </Suspense>
    </div>
  )
}

/** 站内分区要的数据：公开仓库的几个合计、最新的仓库、榜上前几位创作者、本周综合榜。 */
async function siteData(locale: Locale) {
  await authReady()
  const stats = communityStats()
  // 一个公开仓库都没有时，列表和创作者榜必然是空的，不用再查。
  const repos = stats.repos > 0 ? recentPublicRepos(LATEST_REPOS) : []
  const creators = stats.repos > 0 ? topCreators(TOP_CREATORS) : []
  const board = await leaderboard({ period: '7d', board: 'score', kind: null, locale, limit: 6 })
  return { stats, repos, creators, board }
}

/** 没连社区链时的概览：整页都是站内的内容。 */
async function SiteHub({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'community.home' })
  const [{ stats, repos, creators, board }, items, user] = await Promise.all([siteData(locale), getPublishedItems(), pageUser()])
  const uses = weeklyUses()
  // 只读，不在这里补建资料：没有资料的账号由「怎么参与」里的链接带去账号页处理。
  const viewer = user ? { handle: profileOf(user.id)?.handle ?? null } : null
  const number = new Intl.NumberFormat(locale)
  const fresh = stats.repos === 0
  const takePart = <TakePart viewer={viewer} />

  return (
    <div className="space-y-16" data-testid="community-home">
      <PageHeader title={t('title')} lead={t('lead')}>
        <Link href="/community/explore" className={buttonSecondary}>
          {t('cta.explore')}
        </Link>
        <Link href="/repos/new" className={buttonPrimary}>
          <PlusIcon className="size-4" />
          {t('cta.new')}
        </Link>
      </PageHeader>

      {/* 每个数字都能点进它背后的那张列表。 */}
      <StatGrid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatLink label={t('stats.creators')} value={number.format(stats.creators)} href="/community/creators" />
        <StatLink label={t('stats.repos')} value={number.format(stats.repos)} href="/community/explore" />
        <StatLink label={t('stats.forks')} value={number.format(stats.forks)} href="/community/explore?sort=forks" />
        <StatLink label={t('stats.items')} value={number.format(items.length)} href="/market" />
        <StatLink label={t('stats.uses')} value={number.format(uses)} href="/rank" hint={t('stats.usesHint')} className="col-span-2 sm:col-span-1" />
      </StatGrid>

      {/* 还没有人公开仓库时，「怎么参与」提到最前面：这时候页面最该回答的是「我能做什么」，而不是「大家做了什么」。 */}
      {fresh && takePart}
      <LatestRepos repos={repos} total={stats.repos} />
      <ActiveCreators creators={creators} total={stats.creators} />
      <Trending entries={board.entries} picks={board.picks} />
      {!fresh && takePart}

      {/* 只在本地开发时出现：链上的投稿、审核、治理要另外起一条本地链才有。 */}
      {process.env.NODE_ENV === 'development' && (
        <p className="max-w-2xl rounded-[var(--radius-card)] border border-line bg-sunken p-4 text-[13.5px] leading-relaxed text-ink-muted">
          {t.rich('dev', { code: (chunks) => <code className="font-mono text-[12.5px] text-ink">{chunks}</code> })}
        </p>
      )}
    </div>
  )
}

/**
 * 连了链时接在链上概览后面的站内分区。
 * 这里出错（数据库、排行榜）只是少这几个分区，不能把链上的概览也带成错误页，所以接住、记日志、什么都不渲染。
 */
async function SiteSections({ locale }: { locale: Locale }) {
  let data: Awaited<ReturnType<typeof siteData>>
  try {
    data = await siteData(locale)
  } catch (error) {
    console.error('[community] site sections unavailable', error)
    return null
  }
  const { stats, repos, creators, board } = data
  return (
    <>
      <LatestRepos repos={repos} total={stats.repos} />
      <ActiveCreators creators={creators} total={stats.creators} />
      {/* 上面的「社区作品」里可能已经有同一个条目的卡片：这里的不参与变形过渡（过渡用的名字一页只能有一个）。 */}
      <Trending entries={board.entries} picks={board.picks} morph={false} />
    </>
  )
}

/** 链上的概览：投稿入口、链上的数字和规则、社区作品、进行中的审核、贡献者。 */
async function ChainOverview({ community, locale }: { community: Community; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'community.hub' })
  const tm = await getTranslations({ locale, namespace: 'market' })
  const { state, client, config, now } = community
  const params_ = state.params
  const [works, rewardPool] = await Promise.all([
    communitySummaries(community, locale),
    client.readContract({ address: config.contracts.curation, abi: motifCurationAbi, functionName: 'rewardPool' }),
  ])
  const reviews = openReviews(state)
  const reviewLinks = await Promise.all(reviews.slice(0, 5).map(async ({ item, version }) => ({ link: await itemLink(item, locale), version })))
  const registered = [...state.items.values()].filter((item) => !item.abandoned).length
  const contributors = [...state.profiles.values()]
    .filter((profile) => profile.reputation > 0n)
    .sort((a, b) => (b.reputation > a.reputation ? 1 : b.reputation < a.reputation ? -1 : 0))
    .slice(0, 8)

  // 规则用数字说话：押金、票数、奖励都直接来自链上参数，改了参数这里跟着变。
  const steps = params_
    ? [
        { key: 'submit', icon: UploadIcon, title: t('how.submit.title'), body: t('how.submit.body'), chip: t('how.submit.chip', { bond: formatMotif(params_.bond) }) },
        {
          key: 'review',
          icon: ReviewIcon,
          title: t('how.review.title'),
          body: t('how.review.body', { quorum: params_.quorum }),
          chip: t('how.review.chip', { days: Math.round(params_.reviewPeriod / 86400) }),
        },
        {
          key: 'reward',
          icon: CoinsIcon,
          title: t('how.reward.title'),
          body: t('how.reward.body'),
          chip: t('how.reward.chip', { publish: formatMotif(params_.publishReward), remix: formatMotif(params_.remixReward) }),
        },
      ]
    : []

  return (
    <>
      <PageHeader title={t('title')} lead={t('lead')}>
        <Link href="/community/submit" className={buttonPrimary}>
          <UploadIcon className="size-4" />
          {t('cta.submit')}
        </Link>
      </PageHeader>

      <div className="space-y-4">
        <StatGrid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label={t('stats.registered')} value={registered.toLocaleString()} />
          <Stat label={t('stats.works')} value={works.length.toLocaleString()} />
          <Stat label={t('stats.reviews')} value={reviews.length.toLocaleString()} />
          <Stat label={t('stats.curators')} value={state.curators.size.toLocaleString()} />
          <Stat label={t('stats.rewardPool')} value={`${formatMotifCompact(rewardPool, locale)} MOTIF`} hint={`${formatMotif(rewardPool)} MOTIF`} className="col-span-2 sm:col-span-1" />
        </StatGrid>

        {steps.length > 0 && (
          <ol aria-label={t('how.title')} className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line md:grid-cols-3">
            {steps.map(({ key, icon: Glyph, title, body, chip }, index) => (
              <li key={key} className="flex flex-col gap-3 bg-canvas p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full border border-line bg-raised text-ink-muted">
                    <Glyph className="size-4" />
                  </span>
                  <h2 className="text-[15px] font-medium">{title}</h2>
                  <span className="ml-auto font-mono text-[11.5px] text-ink-faint">0{index + 1}</span>
                </div>
                <p className="text-[13.5px] leading-relaxed text-pretty text-ink-muted">{body}</p>
                <span className="mt-auto self-start rounded-full bg-sunken px-2.5 py-1 font-mono text-[11.5px] text-ink-muted tabular-nums">{chip}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <section className="space-y-5">
        <SectionHeader
          title={t('works.title')}
          count={works.length}
          action={
            works.length > 0 && (
              <Link href="/market" className={linkMuted}>
                {t('works.inMarket')} →
              </Link>
            )
          }
        />
        {works.length === 0 ? (
          <EmptyState
            icon={LayersIcon}
            title={t('works.empty')}
            action={
              <Link href="/community/submit" className={buttonSecondary}>
                {t('works.first')}
              </Link>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {works.slice(0, 6).map((work) => (
              <li key={work.slug}>
                <ItemCard item={work} categoryLabel={tm(`categories.${work.category}`)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        <section className="space-y-4">
          <SectionHeader
            title={t('reviews.title')}
            count={reviews.length}
            action={
              <Link href="/community/review" className={linkMuted}>
                {t('reviews.all')} →
              </Link>
            }
          />
          {reviewLinks.length === 0 ? (
            <EmptyState compact icon={ReviewIcon} title={t('reviews.empty')} />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line text-[14px]">
              {reviewLinks.map(({ link, version }) => (
                <li key={`${link.id}-${version.version}`}>
                  <Link
                    href={`/community/items/${link.id}?v=${version.version}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors duration-150 hover:bg-raised"
                  >
                    <span className="min-w-0 truncate">
                      {link.title ?? link.slug}
                      {version.version > 1 && <span className="ml-2 text-ink-faint">v{version.version}</span>}
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-[12px] text-ink-faint tabular-nums">
                      <span className="hidden sm:inline">{relativeTime(Number(version.review!.deadline), now, locale)}</span>
                      <VoteMeter votes={version.review!.votes.length} quorum={version.review!.quorum} />
                      <span>{t('reviews.votes', { votes: version.review!.votes.length, quorum: version.review!.quorum })}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <SectionHeader title={t('contributors.title')} />
          {contributors.length === 0 ? (
            <EmptyState compact icon={UsersIcon} title={t('contributors.empty')} />
          ) : (
            <ol className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line text-[14px]">
              {contributors.map((profile, index) => (
                <li key={profile.account} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="w-4 text-right font-mono text-[12px] text-ink-faint">{index + 1}</span>
                    <Avatar address={profile.account} className="size-6" />
                    <PersonLink person={personOf(state, profile.account)} />
                  </span>
                  <span className="shrink-0 text-[12.5px] text-ink-faint tabular-nums">{t('contributors.reputation', { value: profile.reputation.toString() })}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  )
}
