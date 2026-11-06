import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PageHeader, SectionHeader, Stat, StatGrid } from '@/components/community/ui'
import { CostTable } from '@/components/credits/cost-table'
import { LedgerTable } from '@/components/credits/ledger-table'
import { OrderActions } from '@/components/credits/order-actions'
import { PackageGrid, PayInstructions } from '@/components/credits/packages'
import { resolveRouteLocale } from '@/i18n/locale'
import { requirePageUser } from '@/lib/auth/page'
import { balanceOf, ledgerOf } from '@/lib/credits/ledger'
import { ordersOf } from '@/lib/credits/orders'
import { formatAmount, PACKAGES, supportContact, type PackageId } from '@/lib/credits/pricing'

export async function generateMetadata({ params }: PageProps<'/[locale]/account/credits'>): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'credits.page' })
  return { title: t('title'), robots: { index: false } }
}

export default async function CreditsPage({ params }: PageProps<'/[locale]/account/credits'>) {
  const locale = resolveRouteLocale((await params).locale)
  const user = await requirePageUser(locale, '/account/credits')
  const t = await getTranslations({ locale, namespace: 'credits' })
  const orders = ordersOf(user.id)
  const pending = orders.filter((order) => order.status === 'pending')
  const spent = ledgerOf(user.id, 1000).reduce((sum, entry) => sum + (entry.delta < 0 ? -entry.delta : 0), 0)
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
  const support = supportContact()

  return (
    <div className="space-y-14">
      <PageHeader title={t('page.title')} lead={t('page.lead')} />
      <StatGrid className="grid-cols-2 sm:grid-cols-3">
        <Stat label={t('page.balance')} value={balanceOf(user.id).toLocaleString()} />
        <Stat label={t('page.spent')} value={spent.toLocaleString()} />
        <Stat label={t('page.pending')} value={pending.length} className="max-sm:col-span-2" />
      </StatGrid>

      {pending.map((order) => (
        <PayInstructions key={order.id} order={order} support={support} />
      ))}

      <section className="space-y-5">
        <SectionHeader title={t('packages.title')} />
        <PackageGrid packages={PACKAGES} support={support} />
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <SectionHeader title={t('ledger.title')} />
          <LedgerTable entries={ledgerOf(user.id, 100)} locale={locale} />
        </div>
        <div className="space-y-5">
          <SectionHeader title={t('costs.title')} />
          <CostTable locale={locale} />
        </div>
      </section>

      {orders.length > 0 && (
        <section className="space-y-5">
          <SectionHeader title={t('orders.title')} count={orders.length} />
          <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-[13.5px]">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[12.5px] text-ink-muted">{order.id}</span>
                  <span>{t(`packages.names.${order.package_id as PackageId}`)}</span>
                  <span className="text-ink-muted tabular-nums">
                    {order.credits.toLocaleString()} · {formatAmount(order.amount)}
                  </span>
                  <span className="text-ink-faint">{date.format(order.created_at)}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className={`text-[12.5px] ${order.status === 'paid' ? 'text-success' : order.status === 'pending' ? 'text-pending' : 'text-ink-faint'}`}>{t(`orders.status.${order.status}`)}</span>
                  {order.status === 'pending' && <OrderActions id={order.id} />}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
