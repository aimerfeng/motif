import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthCard } from '@/components/account/auth-forms'
import { ConnectCodeForm, ConnectDevice } from '@/components/account/connect-device'
import { resolveRouteLocale } from '@/i18n/locale'
import { pendingLogin } from '@/lib/accounts/cli-login'
import { requirePageUser } from '@/lib/auth/page'

export async function generateMetadata({ params }: PageProps<'/[locale]/connect'>): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'connect' })
  return { title: t('title'), robots: { index: false } }
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? null

/**
 * `motif login` 让用户打开的页面：登录（没登录先去登录，再回到这里），核对确认码，同意或拒绝。
 * 没带确认码（用户自己手动打开的）就让他填。
 */
export default async function ConnectPage({ params, searchParams }: PageProps<'/[locale]/connect'>) {
  const locale = resolveRouteLocale((await params).locale)
  const code = one((await searchParams).code)
  const user = await requirePageUser(locale, code ? `/connect?code=${encodeURIComponent(code)}` : '/connect')
  const t = await getTranslations({ locale, namespace: 'connect' })
  const pending = code ? pendingLogin(code) : null

  if (pending) {
    return (
      <AuthCard title={t('title')} lead={t('lead')}>
        <ConnectDevice pending={pending} account={user.email} locale={locale} />
      </AuthCard>
    )
  }
  return (
    <AuthCard title={t('enterTitle')} lead={t('enterLead')}>
      <ConnectCodeForm invalid={code !== null} />
    </AuthCard>
  )
}
