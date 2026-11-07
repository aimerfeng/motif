import { authReady } from '@/lib/auth/server'
import type { StatEvent } from './events'
import { recordStat, visitorOf, visitorOfUser } from './record'
import { marketSlugs } from './slugs'

/**
 * 服务端记一次使用（shadcn 安装、MCP 交付、在工作台打开、fork 成仓库）。
 * 统计永远不能影响正事：出错只打日志。路由里用 after() 调，响应先发出去。
 */
export async function track(source: Request | { userId: string }, slug: string, event: StatEvent): Promise<void> {
  try {
    const visitor = source instanceof Request ? visitorOf(source) : visitorOfUser(source.userId)
    if (!visitor || !(await marketSlugs()).has(slug)) return
    await authReady()
    recordStat({ slug, event, visitor })
  } catch (error) {
    console.error('[stats] failed to record', event, slug, error)
  }
}
