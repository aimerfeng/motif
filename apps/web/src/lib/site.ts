import type { Metadata } from 'next'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/** 站点的公开地址：社交卡片和多语言链接要用绝对地址。部署前默认本地。 */
export const SITE_URL = process.env.MOTIF_SITE_URL ?? 'http://localhost:3000'

/**
 * 写进安装命令、交付物和 llms.txt 的站点地址。配置了 MOTIF_SITE_URL（生产环境）就只用它：
 * 请求里的 Host 头是客户端能改的，拿它拼地址，伪造的域名会进到别人的安装命令和 CDN 缓存里。
 * 没配置时（本地开发、e2e 用不同端口）才用请求本身的地址。
 */
export function publicOrigin(request: Request): string {
  return process.env.MOTIF_SITE_URL ? new URL(process.env.MOTIF_SITE_URL).origin : new URL(request.url).origin
}

/** 同一个页面在各语言下的地址，写进 <link rel="alternate" hreflang>。 */
export function alternatesFor(href: string): Metadata['alternates'] {
  return { languages: Object.fromEntries(routing.locales.map((locale) => [locale, getPathname({ href, locale })])) }
}
