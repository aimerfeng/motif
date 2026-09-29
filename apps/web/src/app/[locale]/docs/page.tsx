import { ComingSoon } from '@/components/coming-soon'
import { resolveRouteLocale } from '@/i18n/locale'

export default async function Page({ params }: PageProps<'/[locale]/docs'>) {
  const locale = resolveRouteLocale((await params).locale)
  return <ComingSoon locale={locale} section="docs" />
}
