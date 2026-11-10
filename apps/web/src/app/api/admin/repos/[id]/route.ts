import { z } from 'zod'
import { hideRepo, restoreRepo } from '@/lib/accounts/admin'
import { requireAdmin } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'

const Body = z.object({ action: z.enum(['hide', 'restore']) })

/**
 * 管理员处理用户仓库（内容巡查用）：{ action: 'hide' } 下架一个公开仓库，{ action: 'restore' } 撤销下架。
 * 文件不动、仓库不删，作者自己一直看得到；已经是目标状态的算成功（changed 为 false），重复点不报错。
 */
export async function POST(request: Request, { params }: RouteContext<'/api/admin/repos/[id]'>) {
  try {
    const admin = await requireAdmin(request)
    const { id } = await params
    const body = Body.safeParse(await readJson(request))
    if (!body.success) throw new HttpError(400, 'action must be "hide" or "restore"')
    const { action } = body.data
    const result = action === 'hide' ? hideRepo(id) : restoreRepo(id)
    if (!result) throw new HttpError(404, 'no such repository')
    // 没有审计表，先在日志里留一笔：谁（用户 id，不写邮箱）对哪个仓库做了什么。
    if (result.changed) console.info(`[admin] repo ${result.id}: ${action} by ${admin.id}`)
    return Response.json({ repo: { id: result.id }, action, changed: result.changed }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
