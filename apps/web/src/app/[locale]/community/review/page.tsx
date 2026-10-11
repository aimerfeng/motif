import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { Address } from 'viem'
import { CommunityOffline } from '@/components/community/offline'
import { PersonLink } from '@/components/community/people'
import { ReviewQueue, type QueueEntry } from '@/components/community/review-queue'
import { VersionChip } from '@/components/community/status'
import { EmptyState, linkMuted, PageHeader, SectionHeader } from '@/components/community/ui'
import { CheckIcon, ClockIcon } from '@/components/icons'
import { Link } from '@/i18n/navigation'
import { resolveRouteLocale } from '@/i18n/locale'
import { getCommunity, openReviews } from '@/lib/community/state'
import { relativeTime } from '@/lib/community/time'
import { itemLink, personOf } from '@/lib/community/views'
import { alternatesFor } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/community/review'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.review' })
  return { title: t('title'), alternates: alternatesFor('/community/review') }
}

export default async function ReviewPage({ params }: PageProps<'/[locale]/community/review'>) {
  const locale = resolveRouteLocale((await params).locale)
  const community = await getCommunity()
  if (!community) return <CommunityOffline locale={locale} />
  const t = await getTranslations({ locale, namespace: 'community.review' })
  const ts = await getTranslations({ locale, namespace: 'community.submit' })
  const { state, now } = community

  const entries: QueueEntry[] = await Promise.all(
    openReviews(state).map(async ({ item, version }) => {
      const review = version.review!
      const link = await itemLink(item, locale)
      const parentAuthor =
        version.version === 1 && item.parentId !== 0n
          ? state.items.get(item.parentId)?.versions.find((entry) => entry.version === item.parentVersion)?.author
          : undefined
      return {
        itemId: link.id,
        slug: link.slug,
        title: link.title,
        version: version.version,
        submitter: personOf(state, review.submitter),
        deadline: relativeTime(Number(review.deadline), now, locale),
        overdue: now > Number(review.deadline),
        votes: review.votes.length,
        quorum: review.quorum,
        voters: review.votes.map((vote) => vote.curator),
        conflicted: [review.submitter, ...(parentAuthor ? [parentAuthor] : [])] as Address[],
      }
    }),
  )

  const closed = [...state.items.values()]
    .flatMap((item) => item.versions.filter((version) => version.review && version.review.outcome !== 'open').map((version) => ({ item, version })))
    .sort((a, b) => Number((b.version.review!.closedBlock ?? 0n) - (a.version.review!.closedBlock ?? 0n)))
    .slice(0, 12)
  const closedLinks = await Promise.all(closed.map(async ({ item, version }) => ({ link: await itemLink(item, locale), version })))
  const curators = [...state.curators].map((address) => personOf(state, address))

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} lead={state.params ? t('lead', { quorum: state.params.quorum, days: Math.round(state.params.reviewPeriod / 86400) }) : undefined} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-12">
          <section className="space-y-4">
            <SectionHeader title={t('open')} count={entries.length} />
            <ReviewQueue entries={entries} />
          </section>

          <section className="space-y-4">
            <SectionHeader title={t('recent')} count={closedLinks.length} />
            {closedLinks.length === 0 ? (
              <EmptyState compact icon={ClockIcon} title={t('noneClosed')} />
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line text-[14px]">
                {closedLinks.map(({ link, version }) => (
                  <li key={`${link.id}-${version.version}`}>
                    <Link
                      href={`/community/items/${link.id}?v=${version.version}`}
                      className="flex items-center justify-between gap-4 px-5 py-3 transition-colors duration-150 hover:bg-raised"
                    >
                      <span className="min-w-0 truncate">
                        {link.title ?? link.slug}
                        {version.version > 1 && <span className="ml-2 text-ink-faint">v{version.version}</span>}
                      </span>
                      <VersionChip status={version.status} outcome={version.review!.outcome} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6 text-[13.5px] lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-[var(--radius-card)] border border-line p-5">
            <SectionHeader title={t('criteria')} />
            <ul className="mt-4 space-y-3">
              {(['quality', 'license', 'motion', 'network'] as const).map((key) => (
                <li key={key} className="flex gap-2.5 leading-relaxed text-ink-muted">
                  <CheckIcon className="mt-[3px] size-3.5 shrink-0 text-success" />
                  {ts(`criteria.${key}`)}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[var(--radius-card)] border border-line p-5">
            <SectionHeader title={t('curators')} count={curators.length} />
            <ul className="mt-4 space-y-2.5">
              {curators.map((person) => (
                <li key={person.address}>
                  <PersonLink person={person} avatar />
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-line pt-4 leading-relaxed text-ink-faint">{t('howCurators')}</p>
            <Link href="/community/governance" className={`mt-2 inline-block ${linkMuted}`}>
              {t('toGovernance')} →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
