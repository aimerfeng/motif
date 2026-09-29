import { defaultsOf } from '@motif/schema'
import { getTranslations } from 'next-intl/server'
import { HeroStage } from '@/components/home/hero-stage'
import { ItemCard } from '@/components/market/item-card'
import { Link } from '@/i18n/navigation'
import { resolveRouteLocale } from '@/i18n/locale'
import { getCatalog, getPublishedItems, summarize } from '@/lib/catalog'
import { FEATURED, HERO } from '@/lib/featured'
import { mediaFor } from '@/lib/media'

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'home' })
  const tm = await getTranslations({ locale, namespace: 'market' })
  const [items, catalog] = await Promise.all([getPublishedItems(), getCatalog()])
  const hero = items.find((item) => item.manifest.slug === HERO.slug)
  const featured = FEATURED.map((slug) => items.find((item) => item.manifest.slug === slug))
    .filter((item) => item !== undefined)
    .slice(0, 6)
    .map((item) => summarize(item, locale))
  const sources = [...new Map(items.flatMap((item) => (item.manifest.provenance.upstream ? [[item.manifest.provenance.upstream.repo, item.manifest.provenance.upstream.spdx] as const] : []))).entries()]

  const heroValues = hero ? { ...defaultsOf(hero.manifest.params), ...(hero.manifest.presets.find((preset) => preset.id === HERO.preset)?.values ?? {}) } : {}

  return (
    <main>
      <section className="relative isolate flex h-[calc(100dvh-56px)] min-h-[560px] items-end">
        {hero?.build && (
          <HeroStage
            build={{ js: hero.build.js, css: hero.build.css }}
            exportName={hero.manifest.demo.export}
            theme={hero.manifest.demo.theme}
            props={heroValues}
            poster={mediaFor(hero.manifest.slug).poster}
            title={hero.manifest.title[locale]}
          />
        )}
        {/* 左下角的压暗层只为标题可读，不盖住整个效果。 */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_0%_100%,oklch(0.12_0.01_275/0.85),transparent_60%)]" />
        <div className="pointer-events-none mx-auto w-full max-w-[1400px] px-5 pb-16 sm:px-8 sm:pb-20">
          <h1 className="max-w-4xl font-display text-[clamp(44px,7.2vw,104px)] leading-[0.96] font-semibold tracking-[-0.04em] text-balance">{t('headline')}</h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-pretty text-ink/80 sm:text-[17px]">{t('lead')}</p>
          <div className="pointer-events-auto mt-9 flex flex-wrap items-center gap-3">
            <Link href="/market" className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90">
              {t('browse', { count: items.length })}
            </Link>
            <Link href="/skills" className="rounded-full border border-white/25 px-5 py-2.5 text-[14px] text-ink backdrop-blur-md transition-colors duration-150 hover:border-white/50">
              {t('skills')}
            </Link>
          </div>
          {hero && (
            <p className="pointer-events-auto mt-10 text-[12.5px] text-ink/55">
              {t('heroCaption')}{' '}
              <Link href={`/market/${hero.manifest.slug}`} className="text-ink/80 underline decoration-white/25 underline-offset-4 hover:decoration-white/60">
                {hero.manifest.title[locale]}
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-display text-[32px] leading-tight font-semibold tracking-[-0.03em]">{t('featured')}</h2>
          <Link href="/market" className="shrink-0 text-[14px] text-ink-muted transition-colors duration-150 hover:text-ink">
            {t('allEffects', { count: items.length })} →
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((item) => (
            <li key={item.slug}>
              <ItemCard item={item} categoryLabel={tm(`categories.${item.category}`)} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-28 grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_2fr]">
        <h2 className="font-display text-[32px] leading-tight font-semibold tracking-[-0.03em] text-balance">{t('howTitle')}</h2>
        <div className="grid gap-10 sm:grid-cols-3">
          {(['pick', 'tune', 'take'] as const).map((step) => (
            <div key={step}>
              <h3 className="text-[15px] font-medium">{t(`how.${step}.title`)}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-pretty text-ink-muted">{t(`how.${step}.body`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 mb-24 max-w-[1400px] border-t border-line px-5 pt-10 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-[15px] font-medium">{t('sourcesTitle')}</h2>
            <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-pretty text-ink-muted">{t('sourcesBody')}</p>
          </div>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-2 text-[13.5px] sm:grid-cols-2 lg:grid-cols-3">
            {sources.map(([repo, spdx]) => (
              <li key={repo} className="flex items-baseline justify-between gap-3 border-b border-line py-2">
                <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer" className="truncate text-ink-muted transition-colors duration-150 hover:text-ink">
                  {repo}
                </a>
                <span className="shrink-0 font-mono text-[11px] text-ink-faint">{spdx}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-10 text-[12.5px] text-ink-faint">{t('footer', { date: catalog.generatedAt.slice(0, 10) })}</p>
      </section>
    </main>
  )
}
