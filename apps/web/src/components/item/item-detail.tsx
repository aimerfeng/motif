import type { ModuleRef, StyleRef } from '@motif/preview/protocol'
import { defaultsOf, type ItemManifest } from '@motif/schema'
import { getTranslations } from 'next-intl/server'
import { PersonLink } from '@/components/community/people'
import { VersionChip } from '@/components/community/status'
import { ItemWorkbench } from '@/components/item/item-workbench'
import { ItemCard } from '@/components/market/item-card'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getCatalog, getPublishedItems, summarize } from '@/lib/catalog'
import { highlightFiles } from '@/lib/code-tokens'
import type { ListedCommunityItem } from '@/lib/community/items'
import type { Community } from '@/lib/community/state'
import { versionView } from '@/lib/community/views'
import { marketOrder } from '@/lib/featured'
import { RUNTIME_LABELS } from '@/lib/labels'

export interface DetailItem {
  manifest: ItemManifest
  files: Record<string, string>
  preview: { module: ModuleRef; styles: StyleRef }
  /** 社区作品：链上记录和它所在的社区状态。仓库目录里的条目为 null。 */
  community: { community: Community; listed: ListedCommunityItem } | null
}

/**
 * 条目详情页的正文：仓库目录里的条目（/market/<slug>，构建时静态生成）和审核通过的社区作品
 * （/community/works/<slug>，按请求读链渲染）共用。两者分成两个路由，是因为静态生成的路由运行时不能再变成动态的。
 */
export async function ItemDetail({ item, locale }: { item: DetailItem; locale: Locale }) {
  const slug = item.manifest.slug
  const catalog = await getCatalog()
  const { manifest } = item
  const t = await getTranslations({ locale, namespace: 'item' })
  const tm = await getTranslations({ locale, namespace: 'market' })

  // 源码：组件与着色器在前，演示文件放最后。
  const order = { component: 0, lib: 1, shader: 2, style: 3, demo: 4, asset: 5 } as const
  const code = await highlightFiles(
    [...manifest.files]
      .filter((file) => file.role !== 'asset')
      .sort((a, b) => order[a.role] - order[b.role])
      .map((file) => ({ path: file.path, source: item.files[file.path] ?? '', isEntry: file.path === manifest.entry.file })),
  )
  const upstream = manifest.provenance.upstream
  const summary = { category: manifest.category, kind: manifest.kind }
  // 同类条目：同分类优先，再补同层级的，按市场的顺序取前三个。
  const others = (await getPublishedItems()).filter((other) => other.manifest.slug !== slug).map((other) => summarize(other, locale))
  const related = [
    ...others.filter((other) => other.category === summary.category).sort(marketOrder),
    ...others.filter((other) => other.category !== summary.category && other.kind === summary.kind).sort(marketOrder),
  ].slice(0, 3)
  const categoryHref = `/market?kind=${manifest.kind}&category=${manifest.category}`
  const categoryLabel = tm(`categories.${manifest.category}`)

  const header = (
    <div>
      <nav aria-label={t('breadcrumb')} className="flex flex-wrap items-center gap-x-2 text-[13px] text-ink-faint">
        <Link href="/market" className="transition-colors duration-150 hover:text-ink">
          {t('back')}
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/market?kind=${manifest.kind}`} className="transition-colors duration-150 hover:text-ink">
          {tm(`kinds.${manifest.kind}`)}
        </Link>
        <span aria-hidden>/</span>
        <Link href={categoryHref} className="transition-colors duration-150 hover:text-ink">
          {categoryLabel}
        </Link>
      </nav>
      <h1 className="mt-4 font-display text-[36px] leading-[1.1] font-semibold tracking-[-0.03em] sm:text-[44px]">{manifest.title[locale]}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-pretty text-ink-muted">{manifest.summary[locale]}</p>
      <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-faint">
        <li>{manifest.runtime.map((r) => RUNTIME_LABELS[r] ?? r).join(' · ')}</li>
        <li>{upstream?.spdx ?? 'MIT'}</li>
        {upstream && (
          <li>
            <a href={`https://github.com/${upstream.repo}`} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 transition-colors duration-150 hover:text-ink hover:decoration-ink">
              {upstream.repo}
            </a>
          </li>
        )}
        {item.community && (
          <li>
            {t('communityBy')} <PersonLink person={{ address: item.community.listed.version.author, handle: item.community.community.state.profiles.get(item.community.listed.version.author)?.handle ?? null }} className="text-ink-muted" />
          </li>
        )}
        <li>
          <Link href={`/community/submit?remix=${slug}`} className="underline decoration-line-strong underline-offset-4 transition-colors duration-150 hover:text-ink hover:decoration-ink">
            {t('remix')}
          </Link>
        </li>
      </ul>
    </div>
  )

  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-8 pb-24 sm:px-8">
      <ItemWorkbench
        item={{ manifest, files: item.files }}
        title={manifest.title[locale]}
        preview={item.preview}
        theme={manifest.demo.theme}
        defaults={defaultsOf(manifest.params)}
        presets={manifest.presets.map((preset) => ({ id: preset.id, name: preset.name[locale], values: preset.values }))}
        code={code}
        exportData={{ vendor: catalog.vendor, runtime: catalog.runtime }}
        header={header}
        license={<ProvenancePanel manifest={manifest} locale={locale} />}
        extraTabs={item.community ? [{ id: 'chain', label: t('tabs.chain'), content: <ChainRecord {...item.community} locale={locale} /> }] : []}
      />

      {related.length > 0 && (
        <section className="mt-24 border-t border-line pt-10">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-[24px] leading-tight font-semibold tracking-[-0.02em]">{t('related')}</h2>
            <Link href={categoryHref} className="shrink-0 text-[14px] text-ink-muted transition-colors duration-150 hover:text-ink">
              {t('moreIn', { category: categoryLabel })} →
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((other) => (
              <li key={other.slug}>
                <ItemCard item={other} categoryLabel={tm(`categories.${other.category}`)} />
              </li>
            ))}
          </ul>
        </section>
      )}
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

/** 社区作品的链上记录：作者、通过的版本、审核结果。完整记录在社区的条目页。 */
async function ChainRecord({ community, listed, locale }: { community: Community; listed: ListedCommunityItem; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'community.item' })
  const version = versionView(community, listed.version)
  return (
    <div className="max-w-3xl text-[14px] leading-relaxed">
      <dl className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-3">
        <dt className="text-ink-faint">{t('facts.author')}</dt>
        <dd>
          <PersonLink person={version.author} avatar />
        </dd>
        <dt className="text-ink-faint">{t('facts.version')}</dt>
        <dd className="flex items-center gap-3">
          v{version.version} <VersionChip status={version.status} outcome={version.review?.outcome ?? null} />
        </dd>
        {version.review && (
          <>
            <dt className="text-ink-faint">{t('facts.curators')}</dt>
            <dd className="flex flex-wrap gap-x-3 gap-y-1">
              {version.review.votes.map((vote, index) => (
                <PersonLink key={index} person={vote.curator} />
              ))}
            </dd>
          </>
        )}
        <dt className="text-ink-faint">{t('facts.license')}</dt>
        <dd>{version.license}</dd>
        <dt className="text-ink-faint">{t('facts.hash')}</dt>
        <dd className="font-mono text-[12px] break-all text-ink-muted">{version.contentHash}</dd>
      </dl>
      <Link href={`/community/items/${listed.item.id.toString()}`} className="mt-6 inline-block text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink">
        {t('fullRecord')} →
      </Link>
    </div>
  )
}
