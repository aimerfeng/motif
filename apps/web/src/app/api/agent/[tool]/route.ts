import { z } from 'zod'
import { userFromApiKey } from '@/lib/accounts/api-keys'
import { authReady } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { findTool } from '@/lib/store/tools'
import { publicOrigin } from '@/lib/site'

/**
 * 商店工具的 HTTP 入口：POST /api/agent/<工具名>，请求体是工具的输入（JSON）。
 * 返回 { data, images? }；截图是 base64。和 MCP 服务用的是同一份工具定义。
 */
export async function POST(request: Request, { params }: RouteContext<'/api/agent/[tool]'>) {
  try {
    const { tool: name } = await params
    const tool = findTool(name)
    if (!tool) throw new HttpError(404, `no tool named "${name}"; GET /api/agent lists them`)
    const parsed = z.object(tool.input).safeParse(await readJson(request))
    if (!parsed.success) throw new HttpError(400, z.prettifyError(parsed.error))
    // 只认 API 密钥，不认网页的登录 cookie：别的网站诱导浏览器发来的请求不能花用户的积分。
    await authReady()
    const result = await tool.run(parsed.data, { request, origin: publicOrigin(request), userId: userFromApiKey(request) })
    return Response.json(result, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
