import { getPublishedItems } from '@/lib/catalog'
import { listedCommunityItems } from '@/lib/community/items'
import { getCommunity } from '@/lib/community/state'

/*
 * 市场里现有的条目（目录 + 审核通过的社区作品）。统计上报只认这些 slug，随便编的不进表。
 * catalog.json 有好几 MB，路由处理里 React 的 cache 不生效，所以自己缓存一分钟。
 */

const TTL_MS = 60_000
let cached: { at: number; slugs: Promise<Set<string>> } | null = null

async function load(): Promise<Set<string>> {
  const slugs = new Set((await getPublishedItems()).map((item) => item.manifest.slug))
  try {
    const community = await getCommunity()
    if (community) for (const entry of await listedCommunityItems(community)) slugs.add(entry.content.source.manifest.slug)
  } catch {
    // 社区链暂时连不上时只认目录条目。
  }
  return slugs
}

export function marketSlugs(): Promise<Set<string>> {
  if (!cached || Date.now() - cached.at > TTL_MS) {
    const slugs = load()
    cached = { at: Date.now(), slugs }
    slugs.catch(() => {
      cached = null
    })
  }
  return cached.slugs
}
