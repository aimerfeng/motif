import { requireUser } from '@/lib/auth/server'
import { marketSource } from '@/lib/community/market-source'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { balanceOf, isUnlocked, unlock, type UnlockKind } from '@/lib/credits/ledger'
import { creditCosts } from '@/lib/credits/pricing'
import { skillFilesFor } from '@/lib/skills'
import { publicOrigin } from '@/lib/site'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function parse(kind: unknown, target: unknown): { kind: UnlockKind; target: string } {
  if (kind !== 'item' && kind !== 'skill') throw new HttpError(400, 'kind must be "item" or "skill"')
  if (typeof target !== 'string' || !SLUG.test(target) || target.length > 80) throw new HttpError(400, 'invalid target')
  return { kind, target }
}

const costOf = (kind: UnlockKind) => (kind === 'item' ? creditCosts().unlockItem : creditCosts().unlockSkill)

/** 解锁状态：?kind=item&target=<slug>。没登录也能问（价格是公开的），unlocked 为 false。 */
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams
    const { kind, target } = parse(params.get('kind'), params.get('target'))
    const user = await requireUser(request).catch(() => null)
    return Response.json({ cost: costOf(kind), unlocked: user ? isUnlocked(user.id, kind, target) : false, balance: user ? balanceOf(user.id) : null }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}

/** 解锁一个条目或 Skill（网页上的下载按钮先调它）。解锁过的不再扣。 */
export async function POST(request: Request) {
  try {
    rateLimit(request, 'credit-unlock', 30)
    const user = await requireUser(request)
    const body = (await readJson(request)) as { kind?: unknown; target?: unknown }
    const { kind, target } = parse(body.kind, body.target)
    const exists = kind === 'item' ? await marketSource(target) : await skillFilesFor(target, publicOrigin(request))
    if (!exists) throw new HttpError(404, `no ${kind} named "${target}"`)
    const result = unlock(user.id, kind, target, costOf(kind))
    return Response.json({ unlocked: true, ...result }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
