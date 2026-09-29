import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // 跳过 API、Next 内部路径和带扩展名的文件（registry 的 /r/*.json 也因为带扩展名被跳过）。
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
