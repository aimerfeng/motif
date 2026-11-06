import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthCard, LoginForm } from '@/components/account/auth-forms'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { githubConfigured } from '@/lib/auth/server'
import { mailAvailable } from '@/lib/mail'

export async function generateMetadata({ params }: PageProps<'/[locale]/login'>): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'auth.login' })
  return { title: t('title'), robots: { index: false } }
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? null

export default async function LoginPage({ params, searchParams }: PageProps<'/[locale]/login'>) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'auth' })
  const query = await searchParams
  const next = one(query.next) ?? '/account'
  return (
    <AuthCard
      title={t('login.title')}
      lead={t('login.lead')}
      footer={
        <>
          {t('login.noAccount')}{' '}
          <Link href={{ pathname: '/signup', query: { next } }} className="font-medium text-ink underline-offset-4 hover:underline">
            {t('login.toSignup')}
          </Link>
        </>
      }
    >
      <LoginForm github={githubConfigured()} email={mailAvailable()} next={next} error={one(query.error)} />
    </AuthCard>
  )
}
