import { contentHash } from '@motif/contracts'
import { getAddress, isAddress, isHex } from 'viem'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { uploadMessage } from '@/lib/community/shared'
import { getCommunity } from '@/lib/community/state'
import { saveBuild, saveSource } from '@/lib/community/storage'
import { inspectSubmission, parseItemSource } from '@/lib/community/submission'

/**
 * 上传投稿源码：先验证上传者对内容哈希的签名，再重新检查和编译（不信任浏览器的预检结果），然后保存源码和预览产物。
 * 签名验证便宜、编译昂贵，所以先验签名，没签名的请求不会让服务器编译。
 * 上传本身不公开任何东西：只有链上作者等于上传者时，源码才会被提供出去。
 */
export async function POST(request: Request) {
  try {
    rateLimit(request, 'sources', 10)
    const community = await getCommunity()
    if (!community) throw new HttpError(503, 'the community chain is not available')
    const body = (await readJson(request)) as { item?: unknown; uploader?: unknown; signature?: unknown }
    if (typeof body.uploader !== 'string' || !isAddress(body.uploader)) throw new HttpError(400, '"uploader" must be an address')
    if (typeof body.signature !== 'string' || !isHex(body.signature)) throw new HttpError(400, '"signature" must be hex')
    const item = parseItemSource(body.item)
    if (typeof item === 'string') throw new HttpError(400, item)

    const uploader = getAddress(body.uploader)
    const hash = await contentHash(item)
    const valid = await community.client.verifyMessage({ address: uploader, message: uploadMessage(hash, uploader), signature: body.signature })
    if (!valid) throw new HttpError(401, 'the signature does not match the uploader')

    const report = await inspectSubmission(item)
    if (!report.ok || report.contentHash !== hash || !report.build) throw new HttpError(422, 'the item does not pass the checks; run the pre-check first')

    await saveSource(report.contentHash, { item, uploader, signature: body.signature, uploadedAt: new Date().toISOString() })
    await saveBuild(report.contentHash, report.build)
    return Response.json({ contentHash: report.contentHash }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
