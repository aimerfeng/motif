import { defaultsOf, type ItemManifest } from '@motif/schema'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { CodeFiles } from '@/components/item/code-files'
import { ItemTabs } from '@/components/item/item-tabs'
import { ItemWorkbench } from '@/components/item/item-workbench'
import { Link } from '@/i18n/navigation'
import { resolveRouteLocale } from '@/i18n/locale'
import { routing, type Locale } from '@/i18n/routing'
import { getItem, getPublishedItems } from '@/lib/catalog'
import { highlight } from '@/lib/highlight'
import { RUNTIME_LABELS } from '@/lib/labels'

export async function generateStaticParams() {
  const items = await getPublishedItems()
  return routing.locales.flatMap((locale) => items.map((item) => ({ locale, slug: item.manifest.slug })))
}

export async function generateMetadata({ params }: PageProps<'/[locale]/market/[slug]'>): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale = resolveRouteLocale(raw)
  const item = await getItem(slug)
  if (!item) return {}
  return { title: item.manifest.title[locale], description: item.manifest.summary[locale] }
}

export default async function ItemPage({ params }: PageProps<'/[locale]/market/[slug]'>) {
  const { locale: raw, slug } = await params
  const locale = resolveRouteLocale(raw)
  const item = await getItem(slug)
  if (!item?.build) notFound()

  const { manifest } = item
  const t = await getTranslations({ locale, namespace: 'item' })
  const tm = await getTranslations({ locale, namespace: 'market' })

  // 源码：组件与着色器在前，演示文件放最后。
  const order = { component: 0, lib: 1, shader: 2, style: 3, demo: 4, asset: 5 } as const
  const codeFiles = await Promise.all(
    [...manifest.files]
      .filter((file) => file.role !== 'asset')
      .sort((a, b) => order[a.role] - order[b.role])
      .map(async (file) => {
        const source = item.files[file.path] ?? ''
        return { path: file.path, source, html: await highlight(source, file.path) }
      }),
  )

  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-8 pb-24 sm:px-8">
      <nav className="text-[13px] text-ink-faint">
        <Link href="/market" className="transition-colors duration-150 hover:text-ink">
          {t('back')}
        </Link>
        <span className="mx-2">/</span>
        <span>{tm(`categories.${manifest.category}`)}</span>
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <h1 className="font-display text-[36px] leading-[1.1] font-semibold tracking-[-0.03em] sm:text-[44px]">{manifest.title[locale]}</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-pretty text-ink-muted">{manifest.summary[locale]}</p>

          <div className="mt-8">
            <ItemWorkbench
              slug={manifest.slug}
              title={manifest.title[locale]}
              build={{ js: item.build.js, css: item.build.css }}
              exportName={manifest.demo.export}
              theme={manifest.demo.theme}
              defaults={defaultsOf(manifest.params)}
              presets={manifest.presets.map((preset) => ({ id: preset.id, name: preset.name[locale], values: preset.values }))}
            />
          </div>

          <div className="mt-14">
            <ItemTabs
              tabs={[
                { id: 'code', label: t('tabs.code'), content: <CodeFiles files={codeFiles} copyLabel={t('copy')} copiedLabel={t('copied')} /> },
                { id: 'license', label: t('tabs.license'), content: <ProvenancePanel manifest={manifest} locale={locale} /> },
              ]}
            />
          </div>
        </div>

        <aside className="lg:pt-2">
          <Facts manifest={manifest} locale={locale} />
        </aside>
      </div>
    </main>
  )
}

async function Facts({ manifest, locale }: { manifest: ItemManifest; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'item' })
  const tm = await getTranslations({ locale, namespace: 'market' })
  const upstream = manifest.provenance.upstream
  const deps = manifest.dependencies.filter((dep) => dep !== '@motif/runtime')
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t('facts.category'), value: tm(`categories.${manifest.category}`) },
    { label: t('facts.runtime'), value: manifest.runtime.map((r) => RUNTIME_LABELS[r] ?? r).join(' · ') },
    {
      label: t('facts.dependencies'),
      value: deps.length > 0 ? <span className="font-mono text-[12.5px]">{deps.join(', ')}</span> : t('noDependencies'),
    },
    { label: t('facts.license'), value: upstream?.spdx ?? 'MIT' },
    {
      label: t('facts.source'),
      value: upstream ? (
        <a href={`https://github.com/${upstream.repo}`} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          {upstream.repo}
        </a>
      ) : (
        t(`provenance.${manifest.provenance.kind}`)
      ),
    },
    { label: t('facts.reducedMotion'), value: t(`reducedMotion.${manifest.a11y.reducedMotion}`) },
  ]

  return (
    <dl className="divide-y divide-line border-y border-line text-[13.5px]">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-6 py-3">
          <dt className="shrink-0 text-ink-faint">{row.label}</dt>
          <dd className="text-right">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

async function ProvenancePanel({ manifest, locale }: { manifest: ItemManifest; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'item.provenance' })
  const upstream = manifest.provenance.upstream
  return (
    <div className="max-w-3xl text-[14px] leading-relaxed">
      <p className="text-ink-muted">{t(manifest.provenance.kind)}</p>
      {upstream && (
        <dl className="mt-5 grid grid-cols-[max-content_1fr] gap-x-8 gap-y-3">
          <dt className="text-ink-faint">{t('repo')}</dt>
          <dd>
            <a href={`https://github.com/${upstream.repo}`} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              {upstream.repo}
            </a>
            <span className="ml-2 rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">{upstream.spdx}</span>
          </dd>
          <dt className="text-ink-faint">{t('commit')}</dt>
          <dd className="font-mono text-[12.5px]">{upstream.sha.slice(0, 7)}</dd>
          <dt className="text-ink-faint">{t('files')}</dt>
          <dd className="flex flex-col gap-1">
            {upstream.paths.map((file) => (
              <a
                key={file}
                href={`https://github.com/${upstream.repo}/blob/${upstream.sha}/${file}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[12.5px] text-ink-muted hover:text-ink"
              >
                {file}
              </a>
            ))}
          </dd>
          <dt className="text-ink-faint">{t('copyright')}</dt>
          <dd>{upstream.copyright.join('; ')}</dd>
          {upstream.origin && (
            <>
              <dt className="text-ink-faint">{t('origin')}</dt>
              <dd className="text-ink-muted">{upstream.origin}</dd>
            </>
          )}
        </dl>
      )}
      {manifest.provenance.modifications.length > 0 && (
        <>
          <h3 className="mt-8 text-[13px] font-medium text-ink-faint">{t('modifications')}</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-muted marker:text-ink-faint">
            {manifest.provenance.modifications.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-8 border-t border-line pt-5 text-[13px] text-ink-faint">{t('note')}</p>
    </div>
  )
}
