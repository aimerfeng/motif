import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PageHeader } from '@/components/community/ui'
import { NewRepo } from '@/components/repos/new-repo'
import { resolveRouteLocale } from '@/i18n/locale'
import { requirePageUser } from '@/lib/auth/page'
import { githubConfigured } from '@/lib/auth/server'

export async function generateMetadata({ params }: PageProps<'/[locale]/repos/new'>): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'repos.new' })
  return { title: t('title'), robots: { index: false } }
}

export default async function NewRepoPage({ params }: PageProps<'/[locale]/repos/new'>) {
  const locale = resolveRouteLocale((await params).locale)
  await requirePageUser(locale, '/repos/new')
  const t = await getTranslations({ locale, namespace: 'repos.new' })
  return (
    <main className="mx-auto max-w-[1100px] space-y-10 px-5 pt-12 pb-24 sm:px-8">
      <PageHeader title={t('title')} lead={t('lead')} />
      <NewRepo githubAvailable={githubConfigured()} />
    </main>
  )
}
