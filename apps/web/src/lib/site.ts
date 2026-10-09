import type { Metadata } from 'next'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/** 站点的公开地址：社交卡片和多语言链接要用绝对地址。部署前默认本地。 */
export const SITE_URL = process.env.MOTIF_SITE_URL ?? 'http://localhost:3000'

/** 同一个页面在各语言下的地址，写进 <link rel="alternate" hreflang>。 */
export function alternatesFor(href: string): Metadata['alternates'] {
  return { languages: Object.fromEntries(routing.locales.map((locale) => [locale, getPathname({ href, locale })])) }
}
