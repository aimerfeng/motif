import type { Metadata } from 'next'
import { connection } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { AuthCard, ForgotForm } from '@/components/account/auth-forms'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { mailAvailable } from '@/lib/mail'

export async function generateMetadata({ params }: PageProps<'/[locale]/forgot-password'>): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'auth.forgot' })
  return { title: t('title'), robots: { index: false } }
}

export default async function ForgotPasswordPage({ params }: PageProps<'/[locale]/forgot-password'>) {
  // 邮件配没配是运行时的环境变量，不能在构建时定下来。
  await connection()
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'auth' })
  return (
    <AuthCard
      title={t('forgot.title')}
      lead={t('forgot.lead')}
      footer={
        <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
          {t('forgot.back')}
        </Link>
      }
    >
      {mailAvailable() ? <ForgotForm /> : <p className="text-[13.5px] text-ink-muted">{t('emailDisabled')}</p>}
    </AuthCard>
  )
}
