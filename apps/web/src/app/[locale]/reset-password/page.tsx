import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthCard, ResetForm } from '@/components/account/auth-forms'
import { resolveRouteLocale } from '@/i18n/locale'

export async function generateMetadata({ params }: PageProps<'/[locale]/reset-password'>): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'auth.reset' })
  return { title: t('title'), robots: { index: false } }
}

/** 邮件里的链接先到 Better Auth 校验，再带着 ?token=（或 ?error=INVALID_TOKEN）跳到这里。 */
export default async function ResetPasswordPage({ params, searchParams }: PageProps<'/[locale]/reset-password'>) {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'auth.reset' })
  const query = await searchParams
  const token = typeof query.token === 'string' ? query.token : null
  const error = typeof query.error === 'string' ? query.error : null
  return (
    <AuthCard title={t('title')} lead={t('lead')}>
      <ResetForm token={token} error={error} />
    </AuthCard>
  )
}
