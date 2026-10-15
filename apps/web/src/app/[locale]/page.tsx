import { defaultsOf, KINDS } from '@motif/schema'
import { getTranslations } from 'next-intl/server'
import { CopyCommand } from '@/components/copy-command'
import { HeroStage } from '@/components/home/hero-stage'
import { ArrowIcon, ChevronIcon, SparklesIcon, UsersIcon } from '@/components/icons'
import { ItemCard } from '@/components/market/item-card'
import { Link } from '@/i18n/navigation'
import { resolveRouteLocale } from '@/i18n/locale'
import { getPublishedItems, summarize } from '@/lib/catalog'
import { FEATURED, HERO } from '@/lib/featured'
import { mediaFor } from '@/lib/media'
import { SITE_URL } from '@/lib/site'

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'home' })
  const tm = await getTranslations({ locale, namespace: 'market' })
  const items = await getPublishedItems()
  const hero = items.find((item) => item.manifest.slug === HERO.slug)
  const featured = FEATURED.map((slug) => items.find((item) => item.manifest.slug === slug))
    .filter((item) => item !== undefined)
    .slice(0, 6)
    .map((item) => summarize(item, locale))
  const sources = [...new Map(items.flatMap((item) => (item.manifest.provenance.upstream ? [[item.manifest.provenance.upstream.repo, item.manifest.provenance.upstream.spdx] as const] : []))).entries()].sort(([a], [b]) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' }),
  )
  // 按层级浏览：每个有内容的层级一张卡，封面取该层级里第一个精选条目（没有就取第一个）。
  const levels = KINDS.flatMap((kind) => {
    const inKind = items.filter((item) => item.manifest.kind === kind)
    if (inKind.length === 0) return []
    const cover = FEATURED.map((slug) => inKind.find((item) => item.manifest.slug === slug)).find((item) => item !== undefined) ?? inKind[0]!
    // 层级卡片只有五分之一屏宽，用小海报。
    const media = mediaFor(cover.manifest.slug)
    return [{ kind, count: inKind.length, poster: media.posterSmall ?? media.poster }]
  })

  const exampleShot = mediaFor('border-beam').posterSmall ?? mediaFor('border-beam').poster
  const heroValues = hero ? { ...defaultsOf(hero.manifest.params), ...(hero.manifest.presets.find((preset) => preset.id === HERO.preset)?.values ?? {}) } : {}

  return (
    <main>
      {/* 首屏是一张正在运行的「海报」：在浅色主题里也保持暗色，标题压在暗色的效果上才看得清。 */}
      <section data-theme="dark" className="relative isolate flex h-[calc(100dvh-56px)] min-h-[560px] items-end bg-canvas text-ink">
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
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_0%_100%,color-mix(in_oklab,var(--color-canvas)_85%,transparent),transparent_60%)]" />
        <div className="pointer-events-none mx-auto w-full max-w-[1400px] px-5 pb-16 sm:px-8 sm:pb-20">
          <h1 className="max-w-4xl font-display text-[clamp(44px,7.2vw,104px)] leading-[0.96] font-semibold tracking-[-0.04em] text-balance">{t('headline')}</h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-pretty text-ink/80 sm:text-[17px]">{t('lead')}</p>
          <div className="pointer-events-auto mt-9 flex flex-wrap items-center gap-3">
            <Link href="/market" className="rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90">
              {t('browse', { count: items.length })}
            </Link>
            <Link href="/studio" className="rounded-full border border-ink/25 px-5 py-2.5 text-[14px] text-ink backdrop-blur-md transition-colors duration-150 hover:border-ink/50">
              {t('studio')}
            </Link>
          </div>
          {hero && (
            <p className="pointer-events-auto mt-10 text-[12.5px] text-ink/55">
              {t('heroCaption')}{' '}
              <Link href={`/market/${hero.manifest.slug}`} className="text-ink/80 underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60">
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

      <section className="mx-auto mt-24 max-w-[1400px] px-5 sm:px-8">
        <h2 className="font-display text-[32px] leading-tight font-semibold tracking-[-0.03em]">{t('levelsTitle')}</h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-pretty text-ink-muted">{t('levelsLead')}</p>
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {levels.map((level) => (
            <li key={level.kind}>
              <Link href={`/market?kind=${level.kind}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken transition-[border-color] duration-200 group-hover:border-line-strong">
                  {level.poster && (
                    // 海报是预先生成的 webp。
                    <img src={level.poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-(--ease-out-soft) group-hover:scale-[1.03]" />
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3 px-0.5">
                  <span className="text-[15px] font-medium">{tm(`kinds.${level.kind}`)}</span>
                  <span className="font-mono text-[12px] text-ink-faint tabular-nums">{level.count}</span>
                </div>
              </Link>
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

      <section className="mx-auto mt-28 grid max-w-[1400px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="font-display text-[32px] leading-tight font-semibold tracking-[-0.03em] text-balance">{t('agents.title')}</h2>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-pretty text-ink-muted">{t('agents.lead')}</p>
          <div className="mt-6 max-w-xl">
            <CopyCommand text={`claude mcp add --transport http motif ${SITE_URL}/mcp`} />
          </div>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px]">
            <Link href="/docs#mcp" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              {t('agents.docs')} →
            </Link>
            <a href="/llms.txt" className="text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink">
              llms.txt
            </a>
          </p>
        </div>

        {/* 示意一次真实的工具调用顺序（search_ui → preview_ui → place_order），标明是示例。 */}
        <figure className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-raised">
          <figcaption className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-[12px] text-ink-faint">
            <span aria-hidden className="flex gap-1">
              <span className="size-2 rounded-full bg-line-strong" />
              <span className="size-2 rounded-full bg-line-strong" />
              <span className="size-2 rounded-full bg-line-strong" />
            </span>
            {t('agents.example')}
          </figcaption>
          <ol className="space-y-4 p-5 font-mono text-[12.5px] leading-relaxed">
            <li>
              <p>
                <span className="text-ink-faint">→ </span>search_ui <span className="text-ink-muted">&quot;{t('agents.query')}&quot;</span>
              </p>
              <p className="mt-1 pl-4 text-ink-faint">
                {t('agents.found')}: <span className="text-ink-muted">border-beam</span>, pricing-three-tier, magic-card
              </p>
            </li>
            <li>
              <p>
                <span className="text-ink-faint">→ </span>preview_ui <span className="text-ink-muted">border-beam {'{'} colorFrom: &quot;#22d3ee&quot; {'}'}</span>
              </p>
              <div className="mt-2 flex items-center gap-3 pl-4">
                {exampleShot && (
                  // 海报是预先生成的 webp，不需要 next/image 再处理。
                  <img src={exampleShot} alt="" loading="lazy" decoding="async" className="aspect-[16/10] w-36 rounded-md border border-line object-cover" />
                )}
                <span className="text-ink-faint">{t('agents.shots')}</span>
              </div>
            </li>
            <li>
              <p>
                <span className="text-ink-faint">→ </span>place_order <span className="text-ink-muted">border-beam</span>
              </p>
              <p className="mt-1 pl-4">
                <span className="text-success">{t('agents.delivered')}</span>
                <span className="text-ink-faint"> · npx shadcn add …/r/border-beam.json</span>
              </p>
            </li>
          </ol>
        </figure>
      </section>

      <section className="mx-auto mt-20 grid max-w-[1400px] gap-4 px-5 sm:grid-cols-2 sm:px-8">
        {(
          [
            ['studio', '/studio', SparklesIcon],
            ['community', '/community', UsersIcon],
          ] as const
        ).map(([key, href, Glyph]) => (
          <Link key={key} href={href} className="group flex items-start gap-4 rounded-[var(--radius-card)] border border-line p-5 transition-colors duration-150 hover:border-line-strong hover:bg-raised">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-raised text-ink-muted transition-colors duration-150 group-hover:text-ink">
              <Glyph className="size-[18px]" />
            </span>
            <span>
              <span className="flex items-center gap-1.5 text-[16px] font-medium">
                {t(`more.${key}.title`)}
                <ArrowIcon className="size-3.5 text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1 block text-[13.5px] text-ink-muted">{t(`more.${key}.body`)}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="mx-auto mt-28 mb-24 max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-8 border-t border-line pt-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-[15px] font-medium">{t('sourcesTitle')}</h2>
            <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-pretty text-ink-muted">{t('sourcesBody')}</p>
          </div>
          <div>
            <SourceList sources={sources.slice(0, 12)} />
            {sources.length > 12 && (
              <details className="group mt-2">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 hover:text-ink [&::-webkit-details-marker]:hidden">
                  <ChevronIcon className="size-3.5 transition-transform duration-150 group-open:rotate-90" />
                  {t('sourcesMore', { count: sources.length - 12 })}
                </summary>
                <SourceList sources={sources.slice(12)} />
              </details>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function SourceList({ sources }: { sources: (readonly [string, string])[] }) {
  return (
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
  )
}
