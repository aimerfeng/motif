import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ProfileEditor } from '@/components/community/profile-editor'
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
    <div>
      <div className="max-w-2xl">
        <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">{t('title')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead')}</p>
      </div>
      <div className="mt-10">
        <ProfileEditor />
      </div>
    </div>
  )
}
