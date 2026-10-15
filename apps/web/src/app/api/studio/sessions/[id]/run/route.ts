import type { PromptImage } from '@motif/agent'
import { errorResponse, HttpError, readJson } from '@/lib/community/http'
import { dailyCap, rateLimit } from '@/lib/community/rate-limit'
import { getRunner, runnerConfig } from '@/lib/studio/runner'
import { startRun } from '@/lib/studio/sessions'
import { requireSession } from '@/lib/studio/view'

const MAX_PROMPT = 4000
const MAX_IMAGES = 2
/** 浏览器已经把参考图缩到长边 1568px 的 JPEG，正常在几百 KB；base64 字符数的上限给足余量。 */
const MAX_IMAGE_CHARS = 2_800_000
const MAX_THUMBNAIL_CHARS = 40_000
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

/** 参考图（交给模型）和缩略图（记进对话），一一对应。格式、数量、大小不对就拒绝。 */
function parseAttachments(images: unknown, thumbnails: unknown): { images: PromptImage[]; thumbnails: string[] } {
  if (images === undefined) return { images: [], thumbnails: [] }
  if (!Array.isArray(images) || images.length > MAX_IMAGES) throw new HttpError(400, `attach at most ${MAX_IMAGES} images`)
  const parsed = images.map((image: unknown) => {
    const { mediaType, data } = (typeof image === 'object' && image !== null ? image : {}) as { mediaType?: unknown; data?: unknown }
    if (typeof mediaType !== 'string' || !IMAGE_TYPES.has(mediaType) || typeof data !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(data) || data.length > MAX_IMAGE_CHARS) {
      throw new HttpError(400, 'images must be JPEG, PNG or WebP, base64-encoded, at most about 2 MB each')
    }
    return { mediaType, data }
  })
  const thumbs = Array.isArray(thumbnails) ? thumbnails.filter((thumb): thumb is string => typeof thumb === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(thumb) && thumb.length <= MAX_THUMBNAIL_CHARS) : []
  return { images: parsed, thumbnails: thumbs.slice(0, parsed.length) }
}
const DAILY_RUNS = Number(process.env.MOTIF_STUDIO_DAILY_RUNS) || 300

/** 跑一轮 agent：响应是 NDJSON，每行一个事件，直到这一轮结束。 */
export async function POST(request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/run'>) {
  try {
    rateLimit(request, 'studio-run', 6)
    const session = await requireSession((await params).id)
    // 每一轮都花模型额度：全站每天的轮数有上限，就算有人轮换来源也烧不穿预算。
    dailyCap('studio-runs', DAILY_RUNS)
    // 带两张参考图时请求体比一般接口大。
    const body = (await readJson(request, 6_000_000)) as { prompt?: unknown; images?: unknown; thumbnails?: unknown }
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    if (!prompt) throw new HttpError(400, 'prompt is empty')
    if (prompt.length > MAX_PROMPT) throw new HttpError(400, `prompt is limited to ${MAX_PROMPT} characters`)
    const runner = await getRunner()
    if (!runner) throw new HttpError(503, 'no agent is configured on this site; set MOTIF_AGENT_PROVIDER (see apps/web/.env.example)')
    const attachments = parseAttachments(body.images, body.thumbnails)
    if (attachments.images.length > 0 && !runnerConfig()?.vision) throw new HttpError(400, 'the model on this site cannot see images; describe what you want in words')
    return new Response(startRun(session, prompt, runner, attachments), {
      headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
