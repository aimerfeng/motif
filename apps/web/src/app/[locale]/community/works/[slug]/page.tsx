import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CommunityOffline } from '@/components/community/offline'
import { ItemDetail } from '@/components/item/item-detail'
import { resolveRouteLocale } from '@/i18n/locale'
import { listedCommunityItem } from '@/lib/community/items'
import { getCommunity } from '@/lib/community/state'
import { alternatesFor } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/community/works/[slug]'>): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale = resolveRouteLocale(raw)
  const community = await getCommunity()
  const listed = community ? await listedCommunityItem(community, slug) : null
  if (!listed) return {}
  const { manifest } = listed.content.source
  return { title: manifest.title[locale], description: manifest.summary[locale], alternates: alternatesFor(`/community/works/${slug}`) }
}

/**
 * 审核通过的社区作品：和市场条目同样的详情页（预览、调参、代码、安装、Skill），多一个“链上记录”标签。
 * 取决于链上状态，按请求渲染；仓库目录里的条目在 /market/<slug> 静态生成。
 */
export default async function CommunityWorkPage({ params }: PageProps<'/[locale]/community/works/[slug]'>) {
  const { locale: raw, slug } = await params
  const locale = resolveRouteLocale(raw)
  const community = await getCommunity()
  if (!community) return <CommunityOffline locale={locale} />
  const listed = await listedCommunityItem(community, slug)
  if (!listed) notFound()
  const { source, preview } = listed.content
  return <ItemDetail locale={locale} item={{ manifest: source.manifest, files: source.files, preview, community: { community, listed } }} />
}
