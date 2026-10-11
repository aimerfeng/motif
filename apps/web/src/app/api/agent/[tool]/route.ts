import { z } from 'zod'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { findTool } from '@/lib/store/tools'

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
    const result = await tool.run(parsed.data, { request, origin: new URL(request.url).origin })
    return Response.json(result, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
