import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { GrantCredits } from '@/components/account/grant-credits'
import { EmptyState, PageHeader, SectionHeader, Stat, StatGrid } from '@/components/community/ui'
import { OrderActions } from '@/components/credits/order-actions'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { emailsById, recentUsers, siteTotals } from '@/lib/accounts/admin'
import { requirePageUser } from '@/lib/auth/page'
import { isAdmin } from '@/lib/auth/server'
import { ordersByStatus } from '@/lib/credits/orders'
import { formatAmount } from '@/lib/credits/pricing'

export const metadata: Metadata = { title: 'Admin', robots: { index: false } }

/** 管理后台（docs/decisions/0009 第 7 节）：确认积分订单的收款、给用户加减积分、看用户。不是管理员一律 404。 */
export default async function AdminPage({ params }: PageProps<'/[locale]/admin'>) {
  const locale = resolveRouteLocale((await params).locale)
  const user = await requirePageUser(locale, '/admin')
  if (!isAdmin(user)) notFound()
  const t = await getTranslations({ locale, namespace: 'admin' })
  const totals = siteTotals()
  const pending = ordersByStatus('pending')
  const recent = ordersByStatus('all', 30).filter((order) => order.status !== 'pending')
  const emails = emailsById([...new Set([...pending, ...recent].map((order) => order.user_id))])
  const users = recentUsers()
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' })
  const when = (value: string | number) => date.format(typeof value === 'number' ? value : new Date(value))

  return (
    <main className="mx-auto max-w-[1200px] space-y-14 px-5 pt-12 pb-24 sm:px-8">
      <PageHeader title={t('title')} lead={t('lead')} />
      <StatGrid className="grid-cols-2 sm:grid-cols-4">
        <Stat label={t('totals.users')} value={totals.users.toLocaleString()} />
        <Stat label={t('totals.repos')} value={totals.repos.toLocaleString()} />
        <Stat label={t('totals.credits')} value={totals.credits.toLocaleString()} />
        <Stat label={t('totals.revenue')} value={formatAmount(totals.revenue)} />
      </StatGrid>

      <section className="space-y-5">
        <SectionHeader title={t('pending')} count={pending.length} />
        {pending.length === 0 ? (
          <EmptyState title={t('noPending')} compact />
        ) : (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
            {pending.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-[13.5px]">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[12.5px]">{order.id}</span>
                  <span>{emails.get(order.user_id) ?? order.user_id}</span>
                  <span className="text-ink-muted tabular-nums">
                    {order.credits.toLocaleString()} · {formatAmount(order.amount)}
                  </span>
                  <span className="text-ink-faint">{when(order.created_at)}</span>
                </span>
                <OrderActions id={order.id} admin />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('grant.title')} />
        <GrantCredits />
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('recentOrders')} count={recent.length} />
        {recent.length > 0 && (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line text-[13px]">
            {recent.map((order) => (
              <li key={order.id} className="flex flex-wrap justify-between gap-3 px-5 py-3">
                <span className="flex flex-wrap gap-x-3">
                  <span className="font-mono text-[12.5px]">{order.id}</span>
                  <span className="text-ink-muted">{emails.get(order.user_id) ?? order.user_id}</span>
                  <span className="text-ink-muted tabular-nums">{formatAmount(order.amount)}</span>
                </span>
                <span className={order.status === 'paid' ? 'text-success' : 'text-ink-faint'}>
                  {order.status} · {when(order.paid_at ?? order.updated_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('users')} count={users.length} />
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="border-b border-line text-[12px] text-ink-faint">
              <tr>
                <th className="px-4 py-2.5 font-normal">{t('columns.user')}</th>
                <th className="px-4 py-2.5 font-normal">{t('columns.email')}</th>
                <th className="px-4 py-2.5 font-normal">GitHub</th>
                <th className="px-4 py-2.5 text-right font-normal">{t('columns.balance')}</th>
                <th className="px-4 py-2.5 text-right font-normal">{t('columns.joined')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2.5">{row.handle ? <Link href={`/u/${row.handle}`}>@{row.handle}</Link> : row.name}</td>
                  <td className="px-4 py-2.5 text-ink-muted">
                    {row.email}
                    {!row.emailVerified && <span className="ml-2 text-[11.5px] text-pending">{t('unverified')}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{row.githubLogin ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">{row.balance.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-ink-faint">{when(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
