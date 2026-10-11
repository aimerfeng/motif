import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // 跳过 API、给 agent 的 MCP 服务（/mcp）、Next 内部路径和带扩展名的文件（registry 的 /r/*.json、/llms.txt 也因为带扩展名被跳过）。
  matcher: '/((?!api|mcp|_next|_vercel|.*\\..*).*)',
}
