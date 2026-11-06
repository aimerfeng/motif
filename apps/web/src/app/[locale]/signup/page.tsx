import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AuthCard, SignupForm } from '@/components/account/auth-forms'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { githubConfigured } from '@/lib/auth/server'
import { creditCosts } from '@/lib/credits/pricing'
import { mailAvailable } from '@/lib/mail'

export async function generateMetadata({ params }: PageProps<'/[locale]/signup'>): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'auth.signup' })
  return { title: t('title') }
}

export default async function SignupPage({ params, searchParams }: PageProps<'/[locale]/signup'>) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'auth' })
  const raw = (await searchParams).next
  const next = (Array.isArray(raw) ? raw[0] : raw) ?? '/account'
  return (
    <AuthCard
      title={t('signup.title')}
      lead={t('signup.lead', { bonus: creditCosts().signupBonus })}
      footer={
        <>
          {t('signup.haveAccount')}{' '}
          <Link href={{ pathname: '/login', query: { next } }} className="font-medium text-ink underline-offset-4 hover:underline">
            {t('signup.toLogin')}
          </Link>
        </>
      }
    >
      <SignupForm github={githubConfigured()} email={mailAvailable()} next={next} />
    </AuthCard>
  )
}
