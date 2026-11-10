import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { resolveRouteLocale } from '@/i18n/locale'
import type { Locale } from '@/i18n/routing'
import { requirePageUser } from '@/lib/auth/page'
import { isAdmin, type SessionUser } from '@/lib/auth/server'
import { marketSummaries } from '@/lib/stats/board'

/**
 * 管理后台的门：没登录去登录页（登录完回到 next），不是管理员一律 404（不透露这个地址存在）。
 *
 * layout 和每一个页面都要调用，不能只放在 layout 里：Next 的 layout 在客户端导航时不会重新渲染，
 * 也决定不了页面本身渲不渲染（页面和 layout 是并行渲染的），只靠 layout 把关的话，页面里的查询照样会跑。
 * requirePageUser 顺带等 authReady()，所以门过了之后才能读数据库。
 */
export async function requireAdminPage(locale: Locale, next: string): Promise<SessionUser> {
  const user = await requirePageUser(locale, next)
  if (!isAdmin(user)) notFound()
  return user
}

export type AdminSection = 'users' | 'orders' | 'store' | 'content'

/** 各页的标题：「用户 · 管理后台」。后台不进搜索引擎。 */
export async function adminMetadata(rawLocale: string, section?: AdminSection): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale(rawLocale), namespace: 'admin' })
  return { title: section ? `${t(`nav.${section}`)} · ${t('title')}` : t('title'), robots: { index: false, follow: false } }
}

export interface AdminItemRef {
  title: string
  href: string
}

/**
 * 条目 slug → 标题和页面地址（目录条目在市场，社区作品在社区）。统计、解锁、商店订单里记的都只是 slug。
 * 表里没有的 slug 是已经下架的条目：页面只显示 slug，不给链接。目录读不出来时返回空表，后台照常能看。
 */
export async function itemIndex(locale: Locale): Promise<Map<string, AdminItemRef>> {
  try {
    const items = await marketSummaries(locale)
    return new Map(items.map((item) => [item.slug, { title: item.title, href: item.community ? `/community/works/${item.slug}` : `/market/${item.slug}` }]))
  } catch {
    return new Map()
  }
}
