import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { MarketGrid } from '@/components/market/market-grid'
import { resolveRouteLocale } from '@/i18n/locale'
import { getPublishedItems, summarize } from '@/lib/catalog'
import { marketOrder } from '@/lib/featured'

export async function generateMetadata({ params }: PageProps<'/[locale]/market'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'market' })
  return { title: t('title') }
}

export default async function MarketPage({ params }: PageProps<'/[locale]/market'>) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'market' })
  const items = (await getPublishedItems()).map((item) => summarize(item, locale)).sort(marketOrder)

  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-14 pb-24 sm:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[56px]">{t('title')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead', { count: items.length })}</p>
      </div>
      <MarketGrid items={items} />
    </main>
  )
}
