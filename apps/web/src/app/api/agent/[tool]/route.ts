import { z } from 'zod'
import { userFromApiKey } from '@/lib/accounts/api-keys'
import { authReady } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { cors, preflight } from '@/lib/store/cors'
import { inputFromQuery } from '@/lib/store/query-input'
import { findTool, type StoreTool } from '@/lib/store/tools'
import { publicOrigin } from '@/lib/site'

function requireTool(name: string): StoreTool {
  const tool = findTool(name)
  if (!tool) throw new HttpError(404, `no tool named "${name}"; GET /api/agent lists them`)
  return tool
}

async function call(tool: StoreTool, input: unknown, request: Request): Promise<Response> {
  const parsed = z.object(tool.input).safeParse(input)
  if (!parsed.success) throw new HttpError(400, z.prettifyError(parsed.error))
  // 只认 API 密钥，不认网页的登录 cookie：别的网站诱导浏览器发来的请求不能花用户的积分。
  await authReady()
  const result = await tool.run(parsed.data, { request, origin: publicOrigin(request), userId: userFromApiKey(request) })
  return Response.json(result, { headers: NO_STORE })
}

/**
 * 商店工具的 HTTP 入口：POST /api/agent/<工具名>，请求体是工具的输入（JSON）。
 * 返回 { data, images? }；截图是 base64。和 MCP 服务用的是同一份工具定义。
 */
export async function POST(request: Request, { params }: RouteContext<'/api/agent/[tool]'>) {
  try {
    const tool = requireTool((await params).tool)
    return cors(await call(tool, await readJson(request), request))
  } catch (error) {
    return cors(errorResponse(error))
  }
}

/**
 * 只读工具也能 GET：很多 agent 手里只有一个「打开网址」的工具，发不了 POST。
 * 会花积分、会下单的工具不行——GET 可能被预取、被重试、被写进日志后重放。
 */
export async function GET(request: Request, { params }: RouteContext<'/api/agent/[tool]'>) {
  try {
    const tool = requireTool((await params).tool)
    if (!tool.readOnly) throw new HttpError(405, `"${tool.name}" changes state (it can spend credits): call it with POST and a JSON body`)
    const input = inputFromQuery(new URL(request.url).searchParams, z.toJSONSchema(z.object(tool.input)))
    return cors(await call(tool, input, request))
  } catch (error) {
    return cors(errorResponse(error))
  }
}

export const OPTIONS = preflight
