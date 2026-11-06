import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Connections } from '@/components/account/connections'
import { ProfileForm } from '@/components/account/profile-form'
import { PageHeader, Stat, StatGrid } from '@/components/community/ui'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { ensureProfile } from '@/lib/accounts/profile'
import { linkedAccounts, requirePageUser } from '@/lib/auth/page'
import { githubConfigured } from '@/lib/auth/server'
import { balanceOf } from '@/lib/credits/ledger'
import { mailAvailable } from '@/lib/mail'
import { reposOf } from '@/lib/repos/repos'

export async function generateMetadata({ params }: PageProps<'/[locale]/account'>): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'account.overview' })
  return { title: t('title'), robots: { index: false } }
}

export default async function AccountPage({ params, searchParams }: PageProps<'/[locale]/account'>) {
  const locale = resolveRouteLocale((await params).locale)
  const user = await requirePageUser(locale, '/account')
  const t = await getTranslations({ locale, namespace: 'account.overview' })
  const profile = ensureProfile(user)
  const accounts = linkedAccounts(user.id)
  const github = accounts.find((account) => account.providerId === 'github')
  const repos = reposOf(user.id, true)
  const welcome = (await searchParams).welcome !== undefined

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} lead={t('lead', { email: user.email })} />
      {welcome && (
        <p role="status" className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-[13.5px] text-ink">
          {t('welcome')}
        </p>
      )}
      <StatGrid className="grid-cols-1 sm:grid-cols-3">
        <Stat label={t('balance')} value={<Link href="/account/credits">{balanceOf(user.id).toLocaleString()}</Link>} />
        <Stat label={t('repos')} value={<Link href={`/u/${profile.handle}`}>{repos.length}</Link>} />
        <Stat label={t('handle')} value={<Link href={`/u/${profile.handle}`}>@{profile.handle}</Link>} />
      </StatGrid>
      <section className="grid gap-10 lg:grid-cols-2">
        <ProfileForm initial={{ name: user.name, handle: profile.handle, bio: profile.bio }} />
        <Connections
          email={user.email}
          emailVerified={user.emailVerified}
          hasPassword={accounts.some((account) => account.providerId === 'credential')}
          github={github ? { accountId: github.id, login: user.githubLogin, scopes: github.scopes } : null}
          githubAvailable={githubConfigured()}
          mailAvailable={mailAvailable()}
          canUnlink={accounts.length > 1}
        />
      </section>
    </div>
  )
}
