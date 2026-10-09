import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { inspectSubmission, parseItemSource } from '@/lib/community/submission'

/** 投稿预检：检查器 + 编译 + 内容哈希，返回预览用的编译产物。不保存任何东西。 */
export async function POST(request: Request) {
  try {
    rateLimit(request, 'check', 20)
    const item = parseItemSource(await readJson(request))
    if (typeof item === 'string') throw new HttpError(400, item)
    return Response.json(await inspectSubmission(item), { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
