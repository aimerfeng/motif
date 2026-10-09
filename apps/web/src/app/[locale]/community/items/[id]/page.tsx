import { defaultsOf } from '@motif/schema'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Address } from 'viem'
import { ItemActions, type ReviewState } from '@/components/community/item-actions'
import { CommunityOffline } from '@/components/community/offline'
import { PersonLink } from '@/components/community/people'
import { Chip, VersionChip } from '@/components/community/status'
import { VersionPreview } from '@/components/community/version-preview'
import { Link } from '@/i18n/navigation'
import { resolveRouteLocale } from '@/i18n/locale'
import { contentOfVersion } from '@/lib/community/items'
import { getCommunity } from '@/lib/community/state'
import { readBlob } from '@/lib/community/storage'
import { formatDate, relativeTime } from '@/lib/community/time'
import { itemRecordView } from '@/lib/community/views'

export async function generateMetadata({ params }: PageProps<'/[locale]/community/items/[id]'>): Promise<Metadata> {
  const { locale: raw, id } = await params
  const locale = resolveRouteLocale(raw)
  const t = await getTranslations({ locale, namespace: 'community.item' })
  return { title: t('metaTitle', { id }) }
}

const PAGE_KINDS = new Set(['template', 'style', 'section'])

export default async function CommunityItemPage({ params, searchParams }: PageProps<'/[locale]/community/items/[id]'>) {
  const { locale: raw, id } = await params
  const locale = resolveRouteLocale(raw)
  const community = await getCommunity()
  if (!community) return <CommunityOffline locale={locale} />
  if (!/^\d+$/.test(id)) notFound()
  const item = community.state.items.get(BigInt(id))
  if (!item) notFound()

  const t = await getTranslations({ locale, namespace: 'community.item' })
  const view = await itemRecordView(community, item, locale)
  const requested = Number((await searchParams).v)
  const selected = view.versions.find((version) => version.version === requested) ?? view.versions.at(-1)!
  const indexed = item.versions.find((version) => version.version === selected.version)!
  // 已下架的条目不再提供源码和预览（下架通常出于版权或合规原因）。
  const content = item.delisted ? null : await contentOfVersion(indexed)
  const manifest = content?.source.manifest
  const review = selected.review
  const notes = new Map(
    await Promise.all(
      (review?.votes ?? []).filter((vote) => vote.noteHash).map(async (vote) => [vote.noteHash!, await readBlob(vote.noteHash!)] as const),
    ),
  )
  const delistReason = view.delistReason ? await readBlob(view.delistReason) : null

  // 被 Remix 版本的作者不能审核这次投稿（合约里也会拒绝）。
  const parentAuthor =
    selected.version === 1 && item.parentId !== 0n
      ? community.state.items.get(item.parentId)?.versions.find((version) => version.version === item.parentVersion)?.author
      : undefined
  const reviewState: ReviewState | null = review
    ? {
        open: review.outcome === 'open',
        overdue: review.overdue,
        submitter: review.submitter.address,
        votes: review.votes.length,
        voters: review.votes.map((vote) => vote.curator.address),
        conflicted: [review.submitter.address, ...(parentAuthor ? [parentAuthor] : [])] as Address[],
      }
    : null
  const latest = view.versions.at(-1)!
  const now = community.now

  return (
    <div>
      <nav aria-label={t('breadcrumb')} className="flex flex-wrap items-center gap-x-2 text-[13px] text-ink-faint">
        <Link href="/community" className="transition-colors duration-150 hover:text-ink">
          {t('back')}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-mono">#{view.id}</span>
      </nav>

      <header className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[36px] leading-[1.1] font-semibold tracking-[-0.03em] sm:text-[44px]">{view.title ?? view.slug}</h1>
          {view.summary && <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-pretty text-ink-muted">{view.summary}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-faint">
            <span className="font-mono">{view.slug}</span>
            {view.listed && <Chip tone="success">{t('listed')}</Chip>}
            {view.delisted && <Chip tone="danger">{t('delisted')}</Chip>}
            {view.abandoned && <Chip tone="muted">{t('abandoned')}</Chip>}
            {!view.listed && !view.delisted && !view.abandoned && <Chip tone="pending">{t('notYetListed')}</Chip>}
            <span>
              {t('maintainer')} <PersonLink person={view.maintainer} className="text-ink-muted" />
            </span>
            {view.parent && (
              <span>
                {t('remixOf')}{' '}
                <Link href={`/community/items/${view.parent.id}?v=${view.parent.version}`} className="text-ink-muted underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  {view.parent.title ?? view.parent.slug} v{view.parent.version}
                </Link>
              </span>
            )}
          </div>
        </div>
        {view.listed && (
          <Link href={view.catalog ? `/market/${view.slug}` : `/community/works/${view.slug}`} className="shrink-0 rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90">
            {t('openInMarket')}
          </Link>
        )}
      </header>

      {view.delisted && (
        <p role="status" className="mt-6 rounded-[var(--radius-card)] border border-danger/30 bg-danger/5 px-5 py-4 text-[13.5px] text-ink-muted">
          {delistReason ? t('delistedReason', { reason: delistReason }) : t('delistedNoReason')}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {content && manifest ? (
            <VersionPreview
              title={manifest.title[locale]}
              module={content.preview.module}
              styles={content.preview.styles}
              exportName={manifest.demo.export}
              theme={manifest.demo.theme}
              defaults={defaultsOf(manifest.params)}
              tall={PAGE_KINDS.has(manifest.kind)}
            />
          ) : (
            <div className="grid aspect-[16/10] place-items-center rounded-[var(--radius-card)] border border-line bg-sunken p-6 text-center text-[13.5px] text-ink-faint">
              {view.delisted ? t('sourceWithheld') : t('sourceMissing')}
            </div>
          )}

          <section className="mt-10">
            <h2 className="text-[15px] font-medium">{t('versions')}</h2>
            <ol className="mt-3 divide-y divide-line border-y border-line text-[13.5px]">
              {[...view.versions].reverse().map((version) => (
                <li key={version.version}>
                  <Link
                    href={`/community/items/${view.id}?v=${version.version}`}
                    aria-current={version.version === selected.version ? 'true' : undefined}
                    className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-1 py-3 transition-colors duration-150 hover:bg-white/[0.02] aria-[current=true]:bg-white/[0.04]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-ink-muted">v{version.version}</span>
                      <VersionChip status={version.status} outcome={version.review?.outcome ?? null} />
                      {version.version === view.currentVersion && <span className="text-[12px] text-ink-faint">{t('current')}</span>}
                    </span>
                    <span className="text-[12.5px] text-ink-faint">
                      {version.submittedAt ? relativeTime(version.submittedAt, now, locale) : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10">
            <h2 className="text-[15px] font-medium">{t('record', { version: selected.version })}</h2>
            <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-8 gap-y-2.5 text-[13.5px]">
              <dt className="text-ink-faint">{t('facts.author')}</dt>
              <dd>
                <PersonLink person={selected.author} avatar />
              </dd>
              {selected.submittedAt && (
                <>
                  <dt className="text-ink-faint">{t('facts.submitted')}</dt>
                  <dd>{formatDate(selected.submittedAt, locale)}</dd>
                </>
              )}
              <dt className="text-ink-faint">{t('facts.license')}</dt>
              <dd>{selected.license}</dd>
              {selected.upstream && (
                <>
                  <dt className="text-ink-faint">{t('facts.upstream')}</dt>
                  <dd>
                    <a href={`https://github.com/${selected.upstream.repo}/tree/${selected.upstream.commit.slice(2)}`} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                      {selected.upstream.repo}
                    </a>{' '}
                    <span className="font-mono text-[12px] text-ink-faint">{selected.upstream.commit.slice(2, 9)}</span>
                  </dd>
                </>
              )}
              <dt className="text-ink-faint">{t('facts.hash')}</dt>
              <dd className="font-mono text-[12px] break-all text-ink-muted">{selected.contentHash}</dd>
              {content && (
                <>
                  <dt className="text-ink-faint">{t('facts.source')}</dt>
                  <dd>
                    <a href={content.origin === 'catalog' ? `/api/items/${view.slug}/source?download` : `/api/community/sources/${selected.contentHash}`} className="underline decoration-line-strong underline-offset-4 hover:decoration-ink" download={`${view.slug}-v${selected.version}.motif.json`}>
                      {t('downloadSource')}
                    </a>
                    <span className="ml-2 text-[12px] text-ink-faint">{t('verifyHint')}</span>
                  </dd>
                </>
              )}
            </dl>
          </section>

          {view.remixes.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[15px] font-medium">{t('remixes')}</h2>
              <ul className="mt-3 flex flex-wrap gap-2 text-[13.5px]">
                {view.remixes.map((remix) => (
                  <li key={remix.id}>
                    <Link href={`/community/items/${remix.id}`} className="block rounded-full border border-line px-3 py-1 text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink">
                      {remix.title ?? remix.slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-[var(--radius-card)] border border-line p-5 text-[13.5px]" data-testid="review-panel">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[15px] font-medium">{t('review.title', { version: selected.version })}</h2>
              <VersionChip status={selected.status} outcome={review?.outcome ?? null} />
            </div>
            {!review ? (
              <p className="mt-3 text-ink-faint">{view.catalog ? t('review.genesis') : t('review.none')}</p>
            ) : (
              <>
                <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2">
                  <dt className="text-ink-faint">{t('review.submitter')}</dt>
                  <dd>
                    <PersonLink person={review.submitter} />
                  </dd>
                  <dt className="text-ink-faint">{t('review.bond')}</dt>
                  <dd className="tabular-nums">{review.bond} MOTIF</dd>
                  {review.outcome === 'open' ? (
                    <>
                      <dt className="text-ink-faint">{t('review.deadline')}</dt>
                      <dd className={review.overdue ? 'text-danger' : ''}>{relativeTime(review.deadline, now, locale)}</dd>
                    </>
                  ) : (
                    review.closedAt !== null && (
                      <>
                        <dt className="text-ink-faint">{t('review.closed')}</dt>
                        <dd>{relativeTime(review.closedAt, now, locale)}</dd>
                      </>
                    )
                  )}
                  <dt className="text-ink-faint">{t('review.progress')}</dt>
                  <dd className="tabular-nums" data-testid="review-progress">
                    {t('review.tally', { approve: review.tally.approve, reject: review.tally.reject + review.tally.violation, quorum: review.quorum })}
                  </dd>
                </dl>
                {review.votes.length > 0 && (
                  <ol className="mt-4 space-y-3 border-t border-line pt-4">
                    {review.votes.map((vote, index) => (
                      <li key={index}>
                        <div className="flex items-center justify-between gap-3">
                          <PersonLink person={vote.curator} avatar />
                          <span className={vote.verdict === 'approve' ? 'text-success' : 'text-danger'}>{t(`review.verdicts.${vote.verdict}`)}</span>
                        </div>
                        {vote.noteHash && <p className="mt-1.5 text-[13px] leading-relaxed whitespace-pre-wrap text-ink-muted">{notes.get(vote.noteHash) ?? t('review.noteMissing')}</p>}
                      </li>
                    ))}
                  </ol>
                )}
                {review.rewards.length > 0 && (
                  <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-[12.5px] text-ink-muted">
                    {review.rewards.map((reward, index) => (
                      <li key={index}>
                        {t('review.reward', { amount: reward.paid })} → <PersonLink person={reward.to} />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <ItemActions
            itemId={view.id}
            slug={view.slug}
            version={selected.version}
            review={reviewState}
            maintainer={view.maintainer.address}
            pendingMaintainer={item.pendingMaintainer}
            delisted={view.delisted}
            canAddVersion={!view.delisted && view.currentVersion !== 0 && latest.status !== 'pending'}
          />
        </aside>
      </div>
    </div>
  )
}
