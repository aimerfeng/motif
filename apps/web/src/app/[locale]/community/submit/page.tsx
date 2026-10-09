import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CommunityOffline } from '@/components/community/offline'
import { SubmitFlow } from '@/components/community/submit-flow'
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
  const code = (chunks: React.ReactNode) => <code className="font-mono text-[12.5px] text-ink">{chunks}</code>

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
    <div>
      <div className="max-w-2xl">
        <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">{t('title')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead')}</p>
      </div>

      {slug && remixTitle && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-sunken px-5 py-4 text-[13.5px]">
          <p className="text-ink-muted">{t.rich('remix.lead', { title: remixTitle, code, slug })}</p>
          <a href={`/api/items/${slug}/source?download`} className="rounded-full border border-line-strong px-4 py-1.5 text-ink transition-colors duration-150 hover:border-ink" download>
            {t('remix.download')}
          </a>
        </div>
      )}

      <div className="mt-10">
        <SubmitFlow locale={locale} paused={community.state.paused} initial={studioItem} />
      </div>

      <section className="mt-20 grid gap-10 border-t border-line pt-10 text-[14px] leading-relaxed md:grid-cols-2">
        <div>
          <h2 className="text-[16px] font-medium">{t('prepare.title')}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-muted marker:text-ink-faint">
            <li>{t.rich('prepare.scratch', { code })}</li>
            <li>{t.rich('prepare.remix', { code })}</li>
            <li>{t.rich('prepare.community', { code })}</li>
          </ul>
        </div>
        <div>
          <h2 className="text-[16px] font-medium">{t('criteria.title')}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-muted marker:text-ink-faint">
            <li>{t('criteria.quality')}</li>
            <li>{t('criteria.license')}</li>
            <li>{t('criteria.motion')}</li>
            <li>{t('criteria.network')}</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
