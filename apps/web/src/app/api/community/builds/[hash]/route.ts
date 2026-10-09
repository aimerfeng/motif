import { NO_STORE } from '@/lib/community/http'
import { HASH_PATTERN } from '@/lib/community/shared'
import { findVersionByHash, getCommunity } from '@/lib/community/state'
import { readBuild, readSource } from '@/lib/community/storage'

/** 已登记版本的预览产物（编译好的 ESM 和 CSS），提供条件和源码相同。 */
export async function GET(_request: Request, { params }: RouteContext<'/api/community/builds/[hash]'>) {
  const { hash } = await params
  if (!HASH_PATTERN.test(hash)) return Response.json({ error: 'not found' }, { status: 404 })
  const community = await getCommunity()
  const found = community && findVersionByHash(community.state, hash as `0x${string}`)
  const authored = found ? await readSource(found.version.contentHash, found.version.author) : null
  const build = authored ? await readBuild(found!.version.contentHash) : null
  if (!build) return Response.json({ error: 'not found' }, { status: 404, headers: NO_STORE })
  return Response.json(build, { headers: { 'Cache-Control': 'public, max-age=300' } })
}
