import { z } from 'zod'
import { cliCommand } from '@/lib/cli'
import { NO_STORE } from '@/lib/community/http'
import { cors, preflight } from '@/lib/store/cors'
import { STORE_INSTRUCTIONS, STORE_TOOLS } from '@/lib/store/tools'
import { publicOrigin } from '@/lib/site'

/**
 * 不用 MCP 的 agent 从这里发现工具：每个工具的说明和输入的 JSON Schema（由同一份 zod 定义生成）。
 * 调用：POST /api/agent/<name>，请求体就是输入；只读的工具也可以 GET，参数写在查询串里。
 */
export function GET(request: Request) {
  const origin = publicOrigin(request)
  return cors(
    Response.json(
      {
        instructions: STORE_INSTRUCTIONS,
        mcp: `${origin}/mcp`,
        cli: cliCommand(origin, 'help'),
        tools: STORE_TOOLS.map((tool) => ({
          name: tool.name,
          description: tool.description,
          endpoint: `${origin}/api/agent/${tool.name}`,
          methods: tool.readOnly ? ['GET', 'POST'] : ['POST'],
          readOnly: tool.readOnly,
          inputSchema: z.toJSONSchema(z.object(tool.input)),
        })),
      },
      { headers: NO_STORE },
    ),
  )
}

export const OPTIONS = preflight
