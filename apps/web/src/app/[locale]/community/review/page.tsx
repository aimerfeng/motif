import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { Address } from 'viem'
import { CommunityOffline } from '@/components/community/offline'
import { PersonLink } from '@/components/community/people'
import { ReviewQueue, type QueueEntry } from '@/components/community/review-queue'
import { VersionChip } from '@/components/community/status'
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
    <div>
      <div className="max-w-2xl">
        <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">{t('title')}</h1>
        {state.params && (
          <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">
            {t('lead', { quorum: state.params.quorum, days: Math.round(state.params.reviewPeriod / 86400) })}
          </p>
        )}
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section>
          <h2 className="mb-4 text-[15px] font-medium">{t('open', { count: entries.length })}</h2>
          <ReviewQueue entries={entries} />

          <h2 className="mt-14 mb-4 text-[15px] font-medium">{t('recent')}</h2>
          {closedLinks.length === 0 ? (
            <p className="text-[14px] text-ink-faint">{t('noneClosed')}</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line text-[14px]">
              {closedLinks.map(({ link, version }) => (
                <li key={`${link.id}-${version.version}`} className="flex items-center justify-between gap-4 py-3">
                  <Link href={`/community/items/${link.id}?v=${version.version}`} className="min-w-0 truncate hover:underline hover:decoration-line-strong hover:underline-offset-4">
                    {link.title ?? link.slug}
                    {version.version > 1 && <span className="ml-2 text-ink-faint">v{version.version}</span>}
                  </Link>
                  <VersionChip status={version.status} outcome={version.review!.outcome} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="text-[13.5px]">
          <h2 className="text-[15px] font-medium">{t('curators', { count: curators.length })}</h2>
          <ul className="mt-3 space-y-2">
            {curators.map((person) => (
              <li key={person.address}>
                <PersonLink person={person} avatar />
              </li>
            ))}
          </ul>
          <p className="mt-6 leading-relaxed text-ink-faint">{t('howCurators')}</p>
          <Link href="/community/governance" className="mt-2 inline-block text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink">
            {t('toGovernance')}
          </Link>
        </aside>
      </div>
    </div>
  )
}
