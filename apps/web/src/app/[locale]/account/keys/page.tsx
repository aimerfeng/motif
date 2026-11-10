import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ApiKeys } from '@/components/account/api-keys'
import { PageHeader } from '@/components/community/ui'
import { resolveRouteLocale } from '@/i18n/locale'
import { listKeys } from '@/lib/accounts/api-keys'
import { requirePageUser } from '@/lib/auth/page'
import { cliCommand } from '@/lib/cli'
import { SITE_URL } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/account/keys'>): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'account.keys' })
  return { title: t('title'), robots: { index: false } }
}

export default async function KeysPage({ params }: PageProps<'/[locale]/account/keys'>) {
  const locale = resolveRouteLocale((await params).locale)
  const user = await requirePageUser(locale, '/account/keys')
  const t = await getTranslations({ locale, namespace: 'account.keys' })
  const origin = new URL(SITE_URL).origin
  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} lead={t('lead')} />
      <ApiKeys keys={listKeys(user.id)} origin={origin} setup={cliCommand(origin, 'setup')} locale={locale} />
    </div>
  )
}
