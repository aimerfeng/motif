import { NO_STORE } from '@/lib/community/http'
import { currentVersion, getCommunity, latestVersion } from '@/lib/community/state'

/** slug 当前登记的条目：市场详情页的链上徽标、投稿页判断“新条目 / 新版本 / Remix 来源”都用它。 */
export async function GET(_request: Request, { params }: RouteContext<'/api/community/registry/[slug]'>) {
  const { slug } = await params
  const community = await getCommunity()
  const itemId = community?.state.slugs.get(slug)
  const item = itemId === undefined ? undefined : community!.state.items.get(itemId)
  if (!item) return Response.json({ registered: false }, { headers: NO_STORE })
  const current = currentVersion(item)
  const latest = latestVersion(item)
  return Response.json(
    {
      registered: true,
      itemId: item.id.toString(),
      maintainer: item.maintainer,
      delisted: item.delisted,
      version: current?.version ?? null,
      contentHash: current?.contentHash ?? null,
      license: current?.license ?? null,
      author: current?.author ?? null,
      /** 最新版本还在审核中：不能再提交新版本。 */
      pending: latest?.status === 'pending',
      nextVersion: item.versions.length + 1,
    },
    { headers: NO_STORE },
  )
}
