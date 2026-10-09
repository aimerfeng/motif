import { errorResponse, HttpError, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { getRunner } from '@/lib/studio/runner'
import { startRun } from '@/lib/studio/sessions'
import { requireSession } from '@/lib/studio/view'

const MAX_PROMPT = 4000

/** 跑一轮 agent：响应是 NDJSON，每行一个事件，直到这一轮结束。 */
export async function POST(request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/run'>) {
  try {
    rateLimit(request, 'studio-run', 6)
    const session = await requireSession((await params).id)
    const body = (await readJson(request)) as { prompt?: unknown }
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    if (!prompt) throw new HttpError(400, 'prompt is empty')
    if (prompt.length > MAX_PROMPT) throw new HttpError(400, `prompt is limited to ${MAX_PROMPT} characters`)
    const runner = await getRunner()
    if (!runner) throw new HttpError(503, 'no agent is configured on this site; set MOTIF_AGENT_PROVIDER (see apps/web/.env.example)')
    return new Response(startRun(session, prompt, runner), {
      headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' },
    })
  } catch (error) {
    return errorResponse(error)
  }
}
