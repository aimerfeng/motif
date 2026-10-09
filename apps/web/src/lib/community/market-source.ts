import type { ItemSource } from '@motif/schema'
import { getItem } from '@/lib/catalog'
import { listedCommunityItem } from './items'
import { getCommunity } from './state'

/** 市场里某个 slug 的源码：先找仓库目录，找不到再找审核通过的社区作品。shadcn registry 和 Skill 下载都用它。 */
export async function marketSource(slug: string): Promise<ItemSource | null> {
  const catalogItem = await getItem(slug)
  if (catalogItem) return { manifest: catalogItem.manifest, files: catalogItem.files }
  const community = await getCommunity()
  return community ? ((await listedCommunityItem(community, slug))?.content.source ?? null) : null
}
