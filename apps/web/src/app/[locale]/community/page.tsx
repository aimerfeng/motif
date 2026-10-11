import { motifCurationAbi } from '@motif/contracts'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CommunityOffline } from '@/components/community/offline'
import { Avatar, PersonLink } from '@/components/community/people'
import { buttonPrimary, buttonSecondary, EmptyState, linkMuted, PageHeader, SectionHeader, Stat, StatGrid, VoteMeter } from '@/components/community/ui'
import { CoinsIcon, LayersIcon, ReviewIcon, UploadIcon, UsersIcon } from '@/components/icons'
import { ItemCard } from '@/components/market/item-card'
import { Link } from '@/i18n/navigation'
import { resolveRouteLocale } from '@/i18n/locale'
import { formatMotif, formatMotifCompact } from '@/lib/community/shared'
import { getCommunity, openReviews } from '@/lib/community/state'
import { communitySummaries } from '@/lib/community/summaries'
import { relativeTime } from '@/lib/community/time'
import { itemLink, personOf } from '@/lib/community/views'
import { alternatesFor } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/community'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.hub' })
  return { title: t('title'), alternates: alternatesFor('/community') }
}

export default async function CommunityPage({ params }: PageProps<'/[locale]/community'>) {
  const locale = resolveRouteLocale((await params).locale)
  const community = await getCommunity()
  if (!community) return <CommunityOffline locale={locale} />

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
    <div className="space-y-16">
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
    </div>
  )
}
