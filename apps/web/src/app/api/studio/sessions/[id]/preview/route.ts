import type { PreviewReport } from '@motif/agent'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { reportPreview, touchViewer } from '@/lib/studio/preview-reports'
import { isSessionId } from '@/lib/studio/store'

function parseReport(raw: unknown): PreviewReport | null {
  if (typeof raw !== 'object' || raw === null) return null
  const report = raw as Record<string, unknown>
  if (report.state === 'mounted' && typeof report.ms === 'number') return { state: 'mounted', ms: report.ms }
  if (report.state === 'error' && typeof report.message === 'string') return { state: 'error', phase: typeof report.phase === 'string' ? report.phase : 'runtime', message: report.message.slice(0, 2000) }
  if (report.state === 'hung') return { state: 'hung' }
  return null
}

/**
 * 浏览器回报预览状态：{ version, report }。不带 report 时只是心跳，表示还有人开着这个会话的页面。
 * agent 的 check_preview 在服务端等这个回报。
 */
export async function POST(request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/preview'>) {
  try {
    const { id } = await params
    if (!isSessionId(id)) throw new HttpError(404, 'no such studio session')
    const body = (await readJson(request)) as { version?: unknown; report?: unknown }
    const report = parseReport(body.report)
    if (report && typeof body.version === 'number') reportPreview(id, body.version, report)
    else touchViewer(id)
    return Response.json({ ok: true }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
