import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/site'

/** 工作台会话的地址本身就是凭证（docs/decisions/0006），不能被收录；接口也不需要。 */
export default function robots(): MetadataRoute.Robots {
  const studioSessions = routing.locales.map((locale) => (locale === routing.defaultLocale ? '/studio/' : `/${locale}/studio/`))
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/r/s/', ...studioSessions] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
