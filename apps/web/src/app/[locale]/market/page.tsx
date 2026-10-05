import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { MarketGrid } from '@/components/market/market-grid'
import { resolveRouteLocale } from '@/i18n/locale'
import { getPublishedItems, summarize } from '@/lib/catalog'
import { marketOrder } from '@/lib/featured'
import { parseMarketQuery } from '@/lib/market-query'

export async function generateMetadata({ params }: PageProps<'/[locale]/market'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'market' })
  return { title: t('title') }
}

export default async function MarketPage({ params, searchParams }: PageProps<'/[locale]/market'>) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'market' })
  const items = (await getPublishedItems()).map((item) => summarize(item, locale)).sort(marketOrder)
  // 在服务端解析筛选，首屏就是筛好的结果（放在浏览器里解析会先闪一下全部条目）。
  const search = await searchParams
  const initial = parseMarketQuery((key) => {
    const value = search[key]
    return Array.isArray(value) ? value[0] : value
  })

  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-12 pb-24 sm:px-8 sm:pt-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[56px]">{t('title')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead', { count: items.length })}</p>
      </div>
      {/* 从别处带着新筛选点回市场时整个重建，不沿用上一次的状态。 */}
      <MarketGrid key={`${initial.kind}/${initial.category}/${initial.q}`} items={items} initial={initial} />
    </main>
  )
}
