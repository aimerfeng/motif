import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StudioWorkbench } from '@/components/studio/studio-workbench'
import { resolveRouteLocale } from '@/i18n/locale'
import { getCatalog } from '@/lib/catalog'
import { loadSession } from '@/lib/studio/store'
import { toView } from '@/lib/studio/view'

export async function generateMetadata({ params }: PageProps<'/[locale]/studio/[id]'>): Promise<Metadata> {
  const { locale: raw, id } = await params
  const locale = resolveRouteLocale(raw)
  const session = await loadSession(id)
  // 会话链接是私人的工作区，不进搜索引擎。
  return { title: session?.item.manifest.title?.[locale] ?? 'Studio', robots: { index: false, follow: false } }
}

export default async function StudioSessionPage({ params }: PageProps<'/[locale]/studio/[id]'>) {
  const { locale: raw, id } = await params
  resolveRouteLocale(raw)
  const [session, catalog] = await Promise.all([loadSession(id), getCatalog()])
  if (!session) notFound()
  return <StudioWorkbench initial={toView(session)} exportData={{ vendor: catalog.vendor, runtime: catalog.runtime }} />
}
