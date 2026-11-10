/*
 * agent 接口（/mcp、/api/agent/…）允许任何网页跨域调用：浏览器里的 agent、MCP 调试工具都要用。
 * 这样做安全的前提是这些接口只认 Authorization 头里的 API 密钥、从不认登录 cookie——
 * 别的网站让浏览器发来的请求不带密钥，拿不到用户的任何权限。
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, accept, mcp-protocol-version, mcp-session-id, last-event-id',
  'Access-Control-Expose-Headers': 'mcp-session-id',
  'Access-Control-Max-Age': '86400',
}

export function cors(response: Response): Response {
  for (const [name, value] of Object.entries(CORS)) response.headers.set(name, value)
  return response
}

export const preflight = (): Response => new Response(null, { status: 204, headers: CORS })
