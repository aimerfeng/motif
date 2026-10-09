import { NO_STORE } from '@/lib/community/http'
import { HASH_PATTERN } from '@/lib/community/shared'
import { findVersionByHash, getCommunity } from '@/lib/community/state'
import { readSource } from '@/lib/community/storage'

/** 已登记版本的源码（ItemSource JSON）：只提供链上作者自己上传的那一份；下架的条目不提供。 */
export async function GET(_request: Request, { params }: RouteContext<'/api/community/sources/[hash]'>) {
  const { hash } = await params
  if (!HASH_PATTERN.test(hash)) return Response.json({ error: 'not found' }, { status: 404 })
  const community = await getCommunity()
  const found = community && findVersionByHash(community.state, hash as `0x${string}`)
  const stored = found ? await readSource(found.version.contentHash, found.version.author) : null
  if (!stored) return Response.json({ error: 'not found' }, { status: 404, headers: NO_STORE })
  return Response.json(stored.item, { headers: { 'Cache-Control': 'public, max-age=300' } })
}
