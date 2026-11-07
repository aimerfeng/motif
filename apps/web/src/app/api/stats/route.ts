import { authReady } from '@/lib/auth/server'
import { CLIENT_ACTIONS, type ClientAction } from '@/lib/stats/events'
import { recordStat, visitorOf } from '@/lib/stats/record'
import { marketSlugs } from '@/lib/stats/slugs'

const MAX_BODY = 512

const isAction = (value: unknown): value is ClientAction => typeof value === 'string' && (CLIENT_ACTIONS as readonly string[]).includes(value)

/**
 * 浏览器上报的使用（lib/stats/report.ts）：{ slug, action }。
 * 不认识的条目、爬虫一律静默忽略（204），不告诉调用方哪些算数。
 */
export async function POST(request: Request) {
  const text = await request.text()
  if (text.length > MAX_BODY) return new Response(null, { status: 413 })
  let body: { slug?: unknown; action?: unknown }
  try {
    body = JSON.parse(text) as typeof body
  } catch {
    return new Response(null, { status: 400 })
  }
  const { slug, action } = body
  if (typeof slug !== 'string' || slug.length > 80 || !isAction(action)) return new Response(null, { status: 400 })

  const visitor = visitorOf(request)
  if (visitor && (await marketSlugs()).has(slug)) {
    await authReady()
    if (action === 'unfavorite') recordStat({ slug, event: 'favorite', visitor, delta: -1 })
    else recordStat({ slug, event: action, visitor })
  }
  return new Response(null, { status: 204 })
}
