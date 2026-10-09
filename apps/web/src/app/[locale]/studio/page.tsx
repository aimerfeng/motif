import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { StudioHome } from '@/components/studio/studio-home'
import { resolveRouteLocale } from '@/i18n/locale'
import { alternatesFor } from '@/lib/site'
import { runnerConfig } from '@/lib/studio/runner'

export async function generateMetadata({ params }: PageProps<'/[locale]/studio'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'studio.home' })
  return { title: t('title'), description: t('lead'), alternates: alternatesFor('/studio') }
}

// 有没有配置 agent 取决于运行时的环境变量，不能在构建时定下来。
export const dynamic = 'force-dynamic'

export default async function StudioPage({ params }: PageProps<'/[locale]/studio'>) {
  resolveRouteLocale((await params).locale)
  return <StudioHome available={runnerConfig() !== null} />
}
