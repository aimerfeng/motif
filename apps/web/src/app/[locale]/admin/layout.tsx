import { getTranslations } from 'next-intl/server'
import { AccountNav } from '@/components/account/account-nav'
import { resolveRouteLocale } from '@/i18n/locale'
import { requireAdminPage } from './shared'

/**
 * 管理后台（docs/decisions/0009 第 7 节）：只有管理员能进，二级导航分五块。
 * 这里的门只是第一道：每个页面自己还要再过一次（原因见 shared.ts）。
 */
export default async function AdminLayout({ children, params }: LayoutProps<'/[locale]/admin'>) {
  const locale = resolveRouteLocale((await params).locale)
  await requireAdminPage(locale, '/admin')
  const t = await getTranslations({ locale, namespace: 'admin' })
  return (
    <main className="mx-auto max-w-[1200px] px-5 pt-8 pb-24 sm:px-8">
      <AccountNav
        links={[
          { href: '/admin', label: t('nav.overview') },
          { href: '/admin/users', label: t('nav.users') },
          { href: '/admin/orders', label: t('nav.orders') },
          { href: '/admin/store', label: t('nav.store') },
          { href: '/admin/content', label: t('nav.content') },
        ]}
      />
      <div className="pt-10">{children}</div>
      {/* 按天的统计是按北京时间分的天，表里的时间也统一用北京时间显示，免得服务器换个时区数字就对不上。 */}
      <p className="mt-14 text-[12px] text-ink-faint">{t('timezone')}</p>
    </main>
  )
}
