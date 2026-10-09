import { NO_STORE } from '@/lib/community/http'
import { HASH_PATTERN } from '@/lib/community/shared'
import { getCommunity, isReferencedBlob } from '@/lib/community/state'
import { readBlob } from '@/lib/community/storage'

export async function GET(_request: Request, { params }: RouteContext<'/api/community/blobs/[hash]'>) {
  const { hash } = await params
  if (!HASH_PATTERN.test(hash)) return new Response('not found', { status: 404 })
  const community = await getCommunity()
  const text = community && isReferencedBlob(community.state, hash as `0x${string}`) ? await readBlob(hash as `0x${string}`) : null
  if (text === null) return new Response('not found', { status: 404, headers: NO_STORE })
  // 内容按哈希寻址，永远不会变。
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=31536000, immutable' } })
}
