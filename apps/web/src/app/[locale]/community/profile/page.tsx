import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ProfileEditor } from '@/components/community/profile-editor'
import { PageHeader } from '@/components/community/ui'
import { resolveRouteLocale } from '@/i18n/locale'
import { alternatesFor } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/community/profile'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.profileEditor' })
  return { title: t('title'), alternates: alternatesFor('/community/profile'), robots: { index: false } }
}

export default async function ProfileEditorPage({ params }: PageProps<'/[locale]/community/profile'>) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.profileEditor' })
  return (
    <div className="space-y-10">
      <PageHeader title={t('title')} lead={t('lead')} />
      <ProfileEditor />
    </div>
  )
}
