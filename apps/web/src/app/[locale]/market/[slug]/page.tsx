import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ItemDetail } from '@/components/item/item-detail'
import { resolveRouteLocale } from '@/i18n/locale'
import { routing } from '@/i18n/routing'
import { getItem, getPublishedItems } from '@/lib/catalog'
import { mediaFor } from '@/lib/media'
import { alternatesFor } from '@/lib/site'

export async function generateStaticParams() {
  const items = await getPublishedItems()
  return routing.locales.flatMap((locale) => items.map((item) => ({ locale, slug: item.manifest.slug })))
}

export async function generateMetadata({ params }: PageProps<'/[locale]/market/[slug]'>): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale = resolveRouteLocale(raw)
  const item = await getItem(slug)
  if (!item) return {}
  const title = item.manifest.title[locale]
  const description = item.manifest.summary[locale]
  // 分享到社交平台时用条目的海报做预览图。
  const poster = mediaFor(slug).poster
  return {
    title,
    description,
    alternates: alternatesFor(`/market/${slug}`),
    openGraph: { title, description, ...(poster ? { images: [{ url: poster, width: 960, height: 600 }] } : {}) },
    twitter: { card: poster ? 'summary_large_image' : 'summary' },
  }
}

/** 仓库目录里的条目，构建时静态生成。审核通过的社区作品在 /community/works/<slug>。 */
export default async function ItemPage({ params }: PageProps<'/[locale]/market/[slug]'>) {
  const { locale: raw, slug } = await params
  const locale = resolveRouteLocale(raw)
  const item = await getItem(slug)
  if (!item?.build) notFound()
  return (
    <ItemDetail
      locale={locale}
      item={{
        manifest: item.manifest,
        files: item.files,
        preview: { module: { kind: 'url', url: item.build.js }, styles: { kind: 'url', url: item.build.css } },
        community: null,
      }}
    />
  )
}
