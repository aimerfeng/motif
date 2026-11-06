import { getTranslations } from 'next-intl/server'
import { AccountNav } from '@/components/account/account-nav'
import { resolveRouteLocale } from '@/i18n/locale'
import { requirePageUser } from '@/lib/auth/page'

/** 账号栏目：要登录。二级导航：概览、积分、API 密钥。 */
export default async function AccountLayout({ children, params }: LayoutProps<'/[locale]/account'>) {
  const locale = resolveRouteLocale((await params).locale)
  await requirePageUser(locale, '/account')
  const t = await getTranslations({ locale, namespace: 'account.nav' })
  return (
    <main className="mx-auto max-w-[1100px] px-5 pt-8 pb-24 sm:px-8">
      <AccountNav links={[{ href: '/account', label: t('overview') }, { href: '/account/credits', label: t('credits') }, { href: '/account/keys', label: t('keys') }]} />
      <div className="pt-10">{children}</div>
    </main>
  )
}
