import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { createSession } from '@/lib/studio/sessions'
import { isSessionId, loadSession } from '@/lib/studio/store'

/** 新建会话：{ base: 条目 slug, values } 是改一个市场条目（带上详情页调好的参数），不给 base 就从起点模板开始。 */
export async function POST(request: Request) {
  try {
    rateLimit(request, 'studio-create', 10)
    const body = (await readJson(request)) as { base?: unknown; values?: unknown }
    const base = typeof body.base === 'string' && body.base ? body.base : null
    if (base && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(base)) throw new HttpError(400, 'invalid item slug')
    const session = await createSession(base, body.values)
    return Response.json({ id: session.id }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}

/** 浏览器记得自己开过哪些会话（localStorage），按 id 取摘要；没有列出全部会话的接口。 */
export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get('ids') ?? '').split(',').filter(isSessionId).slice(0, 20)
  const sessions = await Promise.all(ids.map((id) => loadSession(id)))
  const summaries = sessions
    .filter((session) => session !== null)
    .map((session) => ({ id: session.id, base: session.base, title: session.item.manifest.title ?? null, updatedAt: session.updatedAt, turns: session.transcript.filter((entry) => entry.role === 'user').length }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  return Response.json({ sessions: summaries }, { headers: NO_STORE })
}
