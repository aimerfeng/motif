import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { userFromApiKey } from '@/lib/accounts/api-keys'
import { authReady } from '@/lib/auth/server'
import { errorResponse } from '@/lib/community/http'
import { cors, preflight } from '@/lib/store/cors'
import { createStoreServer } from '@/lib/store/mcp'
import { publicOrigin } from '@/lib/site'

/**
 * 商店的 MCP 服务（Streamable HTTP，无状态）：`claude mcp add --transport http motif <站点>/mcp`。
 * 每个请求新建服务和传输；工具定义见 lib/store/tools.ts。
 * 带 API 密钥（--header "Authorization: Bearer mk_…"）才能拿代码和 Skill（花积分，docs/decisions/0009）；密钥不对整个请求 401。
 */
async function handle(request: Request): Promise<Response> {
  let userId: string | null
  try {
    await authReady()
    userId = userFromApiKey(request)
  } catch (error) {
    return cors(errorResponse(error))
  }
  const server = createStoreServer({ request, origin: publicOrigin(request), userId })
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
  await server.connect(transport)
  try {
    return cors(await transport.handleRequest(request))
  } finally {
    void server.close()
  }
}

export const POST = handle
export const GET = handle
export const DELETE = handle
export const OPTIONS = preflight
