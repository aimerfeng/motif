import { sessionUser } from '@/lib/auth/server'
import { HttpError } from '@/lib/community/http'
import type { StudioSession } from './store'
import { requireSession } from './view'

/**
 * 改动工作台会话（保存代码、调参数、回退、应用默认值、中止）的人：会话有主人时只能是主人（docs/decisions/0009）。
 * 主人是花积分跑 agent 的人，别人拿到链接也不能改他的条目。没有主人的会话（匿名开的、商店定制单的）照旧凭链接就能改。
 */
export async function requireEditableSession(request: Request, id: string): Promise<StudioSession> {
  const session = await requireSession(id)
  if (session.ownerId) {
    const user = await sessionUser(request.headers)
    if (user?.id !== session.ownerId) throw new HttpError(403, 'only the owner of this studio session can change it; remix the item to start your own', { code: 'not_owner' })
  }
  return session
}
