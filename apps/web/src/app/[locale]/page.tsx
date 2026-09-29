import { useTranslations } from 'next-intl'
import { use } from 'react'
import { resolveRouteLocale } from '@/i18n/locale'

export default function HomePage({ params }: PageProps<'/[locale]'>) {
  resolveRouteLocale(use(params).locale)
  const t = useTranslations('home')

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6">
      <p className="text-sm tracking-wide text-(--color-muted)">{t('status')}</p>
      <h1 className="text-5xl font-semibold tracking-tight">Motif 母题</h1>
      <p className="text-xl">{t('tagline')}</p>
      <p className="max-w-prose text-(--color-muted)">{t('lead')}</p>
    </main>
  )
}
