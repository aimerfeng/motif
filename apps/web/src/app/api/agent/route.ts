import { z } from 'zod'
import { NO_STORE } from '@/lib/community/http'
import { STORE_INSTRUCTIONS, STORE_TOOLS } from '@/lib/store/tools'

/**
 * 不用 MCP 的 agent 从这里发现工具：每个工具的说明和输入的 JSON Schema（由同一份 zod 定义生成）。
 * 调用：POST /api/agent/<name>，请求体就是输入。
 */
export function GET(request: Request) {
  const origin = new URL(request.url).origin
  return Response.json(
    {
      instructions: STORE_INSTRUCTIONS,
      mcp: `${origin}/mcp`,
      tools: STORE_TOOLS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        endpoint: `${origin}/api/agent/${tool.name}`,
        inputSchema: z.toJSONSchema(z.object(tool.input)),
      })),
    },
    { headers: NO_STORE },
  )
}
