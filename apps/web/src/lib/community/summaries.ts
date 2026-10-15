import { skillName } from '@motif/export'
import type { Locale } from '@/i18n/routing'
import type { ItemSummary } from '@/lib/catalog'
import { listedCommunityItems, type ListedCommunityItem } from './items'
import type { Community } from './state'

/** 社区作品的市场卡片数据。社区作品没有预先录制的海报和视频，卡片用标题占位图。 */
export function summarizeCommunityItem({ content }: ListedCommunityItem, locale: Locale, addedAt: string | null = null): ItemSummary {
  const { manifest } = content.source
  return {
    slug: manifest.slug,
    title: manifest.title[locale],
    summary: manifest.summary[locale],
    kind: manifest.kind,
    category: manifest.category,
    tags: manifest.tags,
    runtime: manifest.runtime,
    source: manifest.provenance.upstream?.repo ?? null,
    skill: skillName(manifest.slug),
    media: { poster: null, posterSmall: null, loopWebm: null, loopMp4: null },
    community: true,
    addedAt,
  }
}

/** 市场里展示的社区作品，最新通过的在前。 */
export async function communitySummaries(community: Community | null, locale: Locale): Promise<ItemSummary[]> {
  if (!community) return []
  const listed = await listedCommunityItems(community)
  return listed
    .sort((a, b) => Number(b.version.submittedBlock - a.version.submittedBlock))
    .map((entry) => {
      const at = community.timeOf(entry.version.submittedBlock)
      return summarizeCommunityItem(entry, locale, at === null ? null : new Date(at * 1000).toISOString())
    })
}
