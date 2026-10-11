import { getPublishedItems } from '@/lib/catalog'
import { listedCommunityItems } from '@/lib/community/items'
import { getCommunity } from '@/lib/community/state'
import type { Listing } from './search'

/** 商店里能买的东西：目录条目，加上审核通过的社区作品。 */
export async function storeListings(): Promise<Listing[]> {
  const catalog: Listing[] = (await getPublishedItems()).map((item) => ({ manifest: item.manifest, source: 'catalog', author: null }))
  const community = await getCommunity()
  const listed = community ? await listedCommunityItems(community) : []
  return [...catalog, ...listed.map((entry): Listing => ({ manifest: entry.content.source.manifest, source: 'community', author: entry.version.author }))]
}
