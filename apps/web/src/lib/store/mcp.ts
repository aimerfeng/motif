import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { HttpError } from '@/lib/community/http'
import { STORE_INSTRUCTIONS, STORE_TOOLS, type ToolContext, type ToolResult } from './tools'

/** 工具结果转成 MCP 的内容：数据是一段 JSON 文本，截图是 image 块。 */
function toContent(result: ToolResult) {
  return [{ type: 'text' as const, text: JSON.stringify(result.data, null, 2) }, ...(result.images ?? []).map((image) => ({ type: 'image' as const, data: image.data, mimeType: image.mediaType }))]
}

/**
 * 商店的 MCP 服务。无状态：每个请求新建一个服务实例（docs/decisions/0008-agent-store.md）。
 * 工具出错时作为工具结果返回（isError），agent 能看到原因并换个做法，而不是整个请求失败。
 */
export function createStoreServer(context: ToolContext): McpServer {
  const server = new McpServer({ name: 'motif', title: 'Motif UI market', version: '1.0.0' }, { instructions: STORE_INSTRUCTIONS })
  for (const tool of STORE_TOOLS) {
    server.registerTool(tool.name, { title: tool.title, description: tool.description, inputSchema: tool.input }, async (input: unknown) => {
      try {
        return { content: toContent(await tool.run(input as never, context)) }
      } catch (error) {
        const message = error instanceof HttpError || error instanceof Error ? error.message : String(error)
        return { content: [{ type: 'text' as const, text: message }], isError: true }
      }
    })
  }
  return server
}
