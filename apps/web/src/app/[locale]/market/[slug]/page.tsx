import { defaultsOf, type ItemManifest } from '@motif/schema'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ItemWorkbench } from '@/components/item/item-workbench'
import { Link } from '@/i18n/navigation'
import { resolveRouteLocale } from '@/i18n/locale'
import { routing, type Locale } from '@/i18n/routing'
import { getCatalog, getItem, getPublishedItems } from '@/lib/catalog'
import { highlightFile } from '@/lib/code-tokens'
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
  const [item, catalog] = await Promise.all([getItem(slug), getCatalog()])
  if (!item?.build) notFound()

  const { manifest } = item
  const t = await getTranslations({ locale, namespace: 'item' })
  const tm = await getTranslations({ locale, namespace: 'market' })

  // 源码：组件与着色器在前，演示文件放最后。
  const order = { component: 0, lib: 1, shader: 2, style: 3, demo: 4, asset: 5 } as const
  const files = await Promise.all(
    [...manifest.files]
      .filter((file) => file.role !== 'asset')
      .sort((a, b) => order[a.role] - order[b.role])
      .map((file) => highlightFile(file.path, item.files[file.path] ?? '', file.path === manifest.entry.file)),
  )
  const upstream = manifest.provenance.upstream

  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-8 pb-24 sm:px-8">
      <nav className="text-[13px] text-ink-faint">
        <Link href="/market" className="transition-colors duration-150 hover:text-ink">
          {t('back')}
        </Link>
        <span className="mx-2">/</span>
        <span>{tm(`categories.${manifest.category}`)}</span>
      </nav>

      <header className="mt-5 mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-display text-[36px] leading-[1.1] font-semibold tracking-[-0.03em] sm:text-[44px]">{manifest.title[locale]}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-pretty text-ink-muted">{manifest.summary[locale]}</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-ink-faint lg:justify-end">
          <li>{manifest.runtime.map((r) => RUNTIME_LABELS[r] ?? r).join(' · ')}</li>
          <li>{upstream?.spdx ?? 'MIT'}</li>
          {upstream && (
            <li>
              <a href={`https://github.com/${upstream.repo}`} target="_blank" rel="noreferrer" className="hover:text-ink">
                {upstream.repo}
              </a>
            </li>
          )}
        </ul>
      </header>

      <ItemWorkbench
        item={{ manifest, files: item.files }}
        title={manifest.title[locale]}
        build={{ js: item.build.js, css: item.build.css }}
        theme={manifest.demo.theme}
        defaults={defaultsOf(manifest.params)}
        presets={manifest.presets.map((preset) => ({ id: preset.id, name: preset.name[locale], values: preset.values }))}
        files={files}
        exportData={{ vendor: catalog.vendor, runtime: catalog.runtime }}
        license={<ProvenancePanel manifest={manifest} locale={locale} />}
      />
    </main>
  )
}

async function ProvenancePanel({ manifest, locale }: { manifest: ItemManifest; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'item' })
  const tm = await getTranslations({ locale, namespace: 'market' })
  const upstream = manifest.provenance.upstream
  const deps = manifest.dependencies.filter((dep) => dep !== '@motif/runtime')
  const facts: { label: string; value: React.ReactNode }[] = [
    { label: t('facts.category'), value: tm(`categories.${manifest.category}`) },
    { label: t('facts.runtime'), value: manifest.runtime.map((r) => RUNTIME_LABELS[r] ?? r).join(' · ') },
    { label: t('facts.dependencies'), value: deps.length > 0 ? <span className="font-mono text-[12.5px]">{deps.join(', ')}</span> : t('noDependencies') },
    { label: t('facts.license'), value: upstream?.spdx ?? 'MIT' },
    { label: t('facts.reducedMotion'), value: t(`reducedMotion.${manifest.a11y.reducedMotion}`) },
  ]

  return (
    <div className="grid max-w-5xl gap-10 text-[14px] leading-relaxed lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <p className="text-ink-muted">{t(`provenance.${manifest.provenance.kind}`)}</p>
        {upstream && (
          <dl className="mt-5 grid grid-cols-[max-content_1fr] gap-x-8 gap-y-3">
            <dt className="text-ink-faint">{t('provenance.repo')}</dt>
            <dd>
              <a href={`https://github.com/${upstream.repo}`} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                {upstream.repo}
              </a>
              <span className="ml-2 rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">{upstream.spdx}</span>
            </dd>
            <dt className="text-ink-faint">{t('provenance.commit')}</dt>
            <dd className="font-mono text-[12.5px]">{upstream.sha.slice(0, 7)}</dd>
            <dt className="text-ink-faint">{t('provenance.files')}</dt>
            <dd className="flex flex-col gap-1">
              {upstream.paths.map((file) => (
                <a key={file} href={`https://github.com/${upstream.repo}/blob/${upstream.sha}/${file}`} target="_blank" rel="noreferrer" className="font-mono text-[12.5px] text-ink-muted hover:text-ink">
                  {file}
                </a>
              ))}
            </dd>
            <dt className="text-ink-faint">{t('provenance.copyright')}</dt>
            <dd>{upstream.copyright.join('; ')}</dd>
            {upstream.origin && (
              <>
                <dt className="text-ink-faint">{t('provenance.origin')}</dt>
                <dd className="text-ink-muted">{upstream.origin}</dd>
              </>
            )}
          </dl>
        )}
        {manifest.provenance.modifications.length > 0 && (
          <>
            <h3 className="mt-8 text-[13px] font-medium text-ink-faint">{t('provenance.modifications')}</h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-muted marker:text-ink-faint">
              {manifest.provenance.modifications.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-8 border-t border-line pt-5 text-[13px] text-ink-faint">{t('provenance.note')}</p>
      </div>
      <dl className="divide-y divide-line self-start border-y border-line text-[13.5px]">
        {facts.map((row) => (
          <div key={row.label} className="flex justify-between gap-6 py-3">
            <dt className="shrink-0 text-ink-faint">{row.label}</dt>
            <dd className="text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
