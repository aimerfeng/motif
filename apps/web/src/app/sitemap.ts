import type { MetadataRoute } from 'next'
import { getPathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getPublishedItems } from '@/lib/catalog'
import { SITE_URL } from '@/lib/site'

/** 站点地图：市场页的卡片是滚动时分批渲染的，所有条目页从这里交给爬虫。每个地址带上各语言版本。 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await getPublishedItems()
  const pages = ['/', '/market', '/docs', '/community', ...items.map((item) => `/market/${item.manifest.slug}`)]
  const url = (href: string, locale: Locale) => SITE_URL + getPathname({ href, locale })
  return pages.map((href) => ({
    url: url(href, routing.defaultLocale),
    alternates: { languages: Object.fromEntries(routing.locales.map((locale) => [locale, url(href, locale)])) },
  }))
}
