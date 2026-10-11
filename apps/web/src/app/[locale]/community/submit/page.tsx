import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CommunityOffline } from '@/components/community/offline'
import { SubmitFlow } from '@/components/community/submit-flow'
import { buttonSecondary, PageHeader } from '@/components/community/ui'
import { CheckIcon, DownloadIcon, ReviewIcon, TerminalIcon } from '@/components/icons'
import { resolveRouteLocale } from '@/i18n/locale'
import { getItem } from '@/lib/catalog'
import { listedCommunityItem } from '@/lib/community/items'
import { getCommunity } from '@/lib/community/state'
import { loadSession } from '@/lib/studio/store'
import { alternatesFor } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/community/submit'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.submit' })
  return { title: t('title'), alternates: alternatesFor('/community/submit') }
}

export default async function SubmitPage({ params, searchParams }: PageProps<'/[locale]/community/submit'>) {
  const locale = resolveRouteLocale((await params).locale)
  const community = await getCommunity()
  if (!community) return <CommunityOffline locale={locale} />
  const t = await getTranslations({ locale, namespace: 'community.submit' })
  const code = (chunks: React.ReactNode) => <code className="rounded bg-sunken px-1 py-px font-mono text-[12.5px] text-ink">{chunks}</code>

  const search = await searchParams
  // 从工作台进来：直接载入那个会话里的条目。
  const studioId = typeof search.studio === 'string' ? search.studio : null
  const studioItem = studioId ? ((await loadSession(studioId))?.item ?? null) : null

  // 从条目页点“Remix”进来：先给出这个条目的源文件。
  const remixSlug = search.remix
  const slug = typeof remixSlug === 'string' ? remixSlug : null
  const remixTitle = slug
    ? ((await getItem(slug))?.manifest.title[locale] ?? (await listedCommunityItem(community, slug))?.content.source.manifest.title[locale] ?? null)
    : null

  return (
    <div className="space-y-10">
      <PageHeader title={t('title')} lead={t('lead')} />

      {slug && remixTitle && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-raised px-5 py-4 text-[13.5px]">
          <p className="max-w-2xl leading-relaxed text-ink-muted">{t.rich('remix.lead', { title: remixTitle, code, slug })}</p>
          <a href={`/api/items/${slug}/source?download`} className={buttonSecondary} download>
            <DownloadIcon className="size-4" />
            {t('remix.download')}
          </a>
        </div>
      )}

      <SubmitFlow locale={locale} paused={community.state.paused} initial={studioItem} />

      <div className="grid gap-6 pt-6 md:grid-cols-2">
        <section className="rounded-[var(--radius-card)] border border-line p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-medium">
            <TerminalIcon className="size-4 text-ink-faint" />
            {t('prepare.title')}
          </h2>
          <ul className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-ink-muted">
            <li>{t.rich('prepare.scratch', { code })}</li>
            <li>{t.rich('prepare.remix', { code })}</li>
            <li>{t.rich('prepare.community', { code })}</li>
          </ul>
        </section>
        <section className="rounded-[var(--radius-card)] border border-line p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-medium">
            <ReviewIcon className="size-4 text-ink-faint" />
            {t('criteria.title')}
          </h2>
          <ul className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-ink-muted">
            {(['quality', 'license', 'motion', 'network'] as const).map((key) => (
              <li key={key} className="flex gap-2.5">
                <CheckIcon className="mt-[3px] size-3.5 shrink-0 text-success" />
                {t(`criteria.${key}`)}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
