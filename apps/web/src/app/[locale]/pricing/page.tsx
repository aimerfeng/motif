import type { Metadata } from 'next'
import { connection } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { PageHeader, SectionHeader } from '@/components/community/ui'
import { CostTable } from '@/components/credits/cost-table'
import { PackageGrid } from '@/components/credits/packages'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { PACKAGES, supportContact } from '@/lib/credits/pricing'
import { alternatesFor } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/pricing'>): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'credits.pricing' })
  return { title: t('title'), description: t('lead'), alternates: alternatesFor('/pricing') }
}

/** 积分定价：套餐、每样东西花多少，以及积分能用在哪里（docs/decisions/0009 第 5、6 节）。 */
export default async function PricingPage({ params }: PageProps<'/[locale]/pricing'>) {
  // 单价可以用环境变量调，按请求读。
  await connection()
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'credits.pricing' })
  const uses = ['studio', 'mcp', 'download', 'custom'] as const
  return (
    <main className="mx-auto max-w-[1200px] space-y-16 px-5 pt-14 pb-24 sm:px-8">
      <PageHeader title={t('title')} lead={t('lead')} />
      <section className="space-y-5">
        <PackageGrid packages={PACKAGES} support={supportContact()} />
        <p className="text-[12.5px] text-ink-faint">{t('note')}</p>
      </section>
      <section className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          <SectionHeader title={t('usesTitle')} />
          <ul className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2">
            {uses.map((use) => (
              <li key={use} className="bg-canvas p-5">
                <p className="text-[14px] font-medium">{t(`uses.${use}.title`)}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{t(`uses.${use}.text`)}</p>
              </li>
            ))}
          </ul>
          <p className="text-[13px] leading-relaxed text-ink-muted">
            {t('freeNote')}{' '}
            <Link href="/account/keys" className="text-ink underline-offset-4 hover:underline">
              {t('keysLink')}
            </Link>
          </p>
        </div>
        <div className="space-y-5">
          <SectionHeader title={t('costsTitle')} />
          <CostTable locale={locale} />
        </div>
      </section>
    </main>
  )
}
