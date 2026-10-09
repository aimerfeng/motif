import { motifCurationAbi } from '@motif/contracts'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { FaucetButton } from '@/components/community/faucet'
import { CommunityOffline } from '@/components/community/offline'
import { PauseControl } from '@/components/community/pause-control'
import { Avatar, PersonLink } from '@/components/community/people'
import { ItemCard } from '@/components/market/item-card'
import { Link } from '@/i18n/navigation'
import { resolveRouteLocale } from '@/i18n/locale'
import { formatMotif } from '@/lib/community/shared'
import { getCommunity, openReviews } from '@/lib/community/state'
import { communitySummaries } from '@/lib/community/summaries'
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
  const { state, client, config } = community
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

  const stats = [
    { label: t('stats.registered'), value: registered.toLocaleString() },
    { label: t('stats.works'), value: works.length.toLocaleString() },
    { label: t('stats.reviews'), value: reviews.length.toLocaleString() },
    { label: t('stats.curators'), value: state.curators.size.toLocaleString() },
    { label: t('stats.rewardPool'), value: `${formatMotif(rewardPool)} MOTIF` },
  ]
  const steps = params_
    ? [
        { title: t('how.submit.title'), body: t('how.submit.body', { bond: formatMotif(params_.bond) }) },
        { title: t('how.review.title'), body: t('how.review.body', { quorum: params_.quorum, days: Math.round(params_.reviewPeriod / 86400) }) },
        {
          title: t('how.reward.title'),
          body: t('how.reward.body', { publish: formatMotif(params_.publishReward), remix: formatMotif(params_.remixReward) }),
        },
      ]
    : []

  return (
    <div>
      {config.local && (
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-pending/30 bg-pending/5 px-5 py-4 text-[13.5px]">
          <p className="text-ink-muted">{t('localChain', { chain: config.chainName })}</p>
          <FaucetButton />
        </div>
      )}
      <PauseControl paused={state.paused} />
      {state.paused && (
        <p role="status" className="mb-10 rounded-[var(--radius-card)] border border-danger/30 bg-danger/5 px-5 py-4 text-[13.5px] text-ink-muted">
          {t('paused')}
        </p>
      )}

      <div className="max-w-2xl">
        <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[56px]">{t('title')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead')}</p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Link href="/community/submit" className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90">
            {t('cta.submit')}
          </Link>
          <Link href="/community/review" className="rounded-full border border-line px-4 py-2 text-[14px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink">
            {t('cta.review')}
          </Link>
          <Link href="/community/governance" className="rounded-full border border-line px-4 py-2 text-[14px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink">
            {t('cta.governance')}
          </Link>
        </div>
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-canvas px-5 py-4 last:col-span-2 lg:last:col-span-1">
            <dt className="text-[12.5px] text-ink-faint">{stat.label}</dt>
            <dd className="mt-1 font-display text-[24px] font-semibold tracking-[-0.02em] tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {steps.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-[24px] leading-tight font-semibold tracking-[-0.02em]">{t('how.title')}</h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t border-line pt-5">
                <p className="font-mono text-[12px] text-ink-faint">0{index + 1}</p>
                <h3 className="mt-2 text-[16px] font-medium">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-pretty text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-16">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-display text-[24px] leading-tight font-semibold tracking-[-0.02em]">{t('works.title')}</h2>
          {works.length > 0 && (
            <Link href="/market" className="shrink-0 text-[14px] text-ink-muted transition-colors duration-150 hover:text-ink">
              {t('works.inMarket')} →
            </Link>
          )}
        </div>
        {works.length === 0 ? (
          <p className="mt-6 text-[14px] text-ink-faint">{t('works.empty')}</p>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {works.slice(0, 6).map((work) => (
              <li key={work.slug}>
                <ItemCard item={work} categoryLabel={tm(`categories.${work.category}`)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-16 grid gap-16 lg:grid-cols-2">
        <section>
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-[24px] leading-tight font-semibold tracking-[-0.02em]">{t('reviews.title')}</h2>
            <Link href="/community/review" className="shrink-0 text-[14px] text-ink-muted transition-colors duration-150 hover:text-ink">
              {t('reviews.all')} →
            </Link>
          </div>
          {reviewLinks.length === 0 ? (
            <p className="mt-6 text-[14px] text-ink-faint">{t('reviews.empty')}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line text-[14px]">
              {reviewLinks.map(({ link, version }) => (
                <li key={`${link.id}-${version.version}`} className="flex items-center justify-between gap-4 py-3">
                  <Link href={`/community/items/${link.id}?v=${version.version}`} className="min-w-0 truncate hover:underline hover:decoration-line-strong hover:underline-offset-4">
                    {link.title ?? link.slug}
                    {version.version > 1 && <span className="ml-2 text-ink-faint">v{version.version}</span>}
                  </Link>
                  <span className="shrink-0 text-[12.5px] text-ink-faint tabular-nums">
                    {t('reviews.votes', { votes: version.review!.votes.length, quorum: version.review!.quorum })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-[24px] leading-tight font-semibold tracking-[-0.02em]">{t('contributors.title')}</h2>
          {contributors.length === 0 ? (
            <p className="mt-6 text-[14px] text-ink-faint">{t('contributors.empty')}</p>
          ) : (
            <ol className="mt-4 divide-y divide-line border-y border-line text-[14px]">
              {contributors.map((profile) => (
                <li key={profile.account} className="flex items-center justify-between gap-4 py-3">
                  <span className="flex min-w-0 items-center gap-3">
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
