import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { createStoreServer } from '@/lib/store/mcp'

/**
 * 商店的 MCP 服务（Streamable HTTP，无状态）：`claude mcp add --transport http motif <站点>/mcp`。
 * 每个请求新建服务和传输；工具定义见 lib/store/tools.ts。
 */
async function handle(request: Request): Promise<Response> {
  const server = createStoreServer({ request, origin: new URL(request.url).origin })
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
  await server.connect(transport)
  try {
    return await transport.handleRequest(request)
  } finally {
    void server.close()
  }
}

export const POST = handle
export const GET = handle
export const DELETE = handle
