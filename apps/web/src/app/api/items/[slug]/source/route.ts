import { getItem } from '@/lib/catalog'
import { listedCommunityItem } from '@/lib/community/items'
import { getCommunity } from '@/lib/community/state'

/**
 * 条目的源文件（ItemSource JSON，即 .motif.json）：Remix 的起点。
 * `pnpm item:unpack` 把它还原成条目目录，改完再用 `pnpm item:pack` 打包投稿。
 */
export async function GET(request: Request, { params }: RouteContext<'/api/items/[slug]/source'>) {
  const { slug } = await params
  const catalogItem = await getItem(slug)
  let source = catalogItem ? { manifest: catalogItem.manifest, files: catalogItem.files } : null
  if (!source) {
    const community = await getCommunity()
    source = community ? ((await listedCommunityItem(community, slug))?.content.source ?? null) : null
  }
  if (!source) return Response.json({ error: `no item named "${slug}"` }, { status: 404 })
  const download = new URL(request.url).searchParams.has('download')
  return new Response(JSON.stringify(source, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      ...(download ? { 'Content-Disposition': `attachment; filename="${slug}.motif.json"` } : {}),
    },
  })
}
