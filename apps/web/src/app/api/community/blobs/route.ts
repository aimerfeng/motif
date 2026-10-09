import { sha256Hex, validateBlob } from '@/lib/community/blobs'
import { errorResponse, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { saveBlob } from '@/lib/community/storage'

/** 托管一段审核意见或创作者资料，返回它的 sha256（写进链上交易）。被链上引用之前不会对外提供。 */
export async function POST(request: Request) {
  try {
    rateLimit(request, 'blobs', 30)
    const body = (await readJson(request)) as { kind?: unknown; text?: unknown }
    const text = validateBlob(body.kind, body.text)
    const hash = sha256Hex(text)
    await saveBlob(hash, text)
    return Response.json({ hash }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
