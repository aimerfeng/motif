import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { GrantCredits } from '@/components/account/grant-credits'
import { DailyBars } from '@/components/admin/daily-bars'
import { SystemHealth } from '@/components/admin/system-health'
import { dateTimeFormat, dayFormat, hrefWith, tableBase, tableBody, tableHead, tableWrap, td, th } from '@/components/admin/ui'
import { EmptyState, linkMuted, PageHeader, SectionHeader, Stat, StatGrid } from '@/components/community/ui'
import { OrderActions } from '@/components/credits/order-actions'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { adminTotals, adminTrends, creditOrdersPage, TREND_DAYS } from '@/lib/accounts/admin'
import { formatAmount } from '@/lib/credits/pricing'
import { STAT_EVENTS } from '@/lib/stats/events'
import { listOrders } from '@/lib/store/orders'
import { adminMetadata, requireAdminPage } from './shared'

export async function generateMetadata({ params }: PageProps<'/[locale]/admin'>): Promise<Metadata> {
  return adminMetadata((await params).locale)
}

// 概览上最多列这么多张待确认的订单，再多就去订单页处理。
const PENDING_SHOWN = 20

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

/** 管理后台的概览：全站的数、近 14 天的走势、等着确认收款的订单、加减积分、系统状态。 */
export default async function AdminPage({ params }: PageProps<'/[locale]/admin'>) {
  const locale = resolveRouteLocale((await params).locale)
  await requireAdminPage(locale, '/admin')
  const t = await getTranslations({ locale, namespace: 'admin' })
  const totals = adminTotals()
  const trends = adminTrends()
  const pending = creditOrdersPage({ status: 'pending', pageSize: PENDING_SHOWN })
  // 只要总数；订单文件读不出来（目录权限之类）不该让整个概览打不开。
  const storeOrders = await listOrders(1).then(
    (result) => result.total,
    () => null,
  )
  const number = new Intl.NumberFormat(locale)
  const when = dateTimeFormat(locale)
  const day = dayFormat(locale)
  // 条目互动合成一个数画图（五种事件各画一张太碎），每种事件各是多少在下面的表里。
  const eventTotals = trends.events.map((counts) => STAT_EVENTS.reduce((total, event) => total + counts[event], 0))

  return (
    <div className="space-y-14">
      <PageHeader title={t('title')} lead={t('lead')} />

      {/* 10 格：2 列和 5 列都能排满，不留灰色的空格。 */}
      <StatGrid className="grid-cols-2 md:grid-cols-5">
        <Stat label={t('totals.users')} value={number.format(totals.users)} />
        <Stat label={t('totals.verified')} value={number.format(totals.verifiedUsers)} />
        <Stat label={t('totals.publicRepos')} value={number.format(totals.publicRepos)} />
        <Stat label={t('totals.privateRepos')} value={number.format(totals.privateRepos)} />
        <Stat label={t('totals.credits')} value={number.format(totals.credits)} />
        <Stat label={t('totals.revenue')} value={formatAmount(totals.revenue)} />
        <Stat label={t('totals.paidOrders')} value={number.format(totals.paidOrders)} />
        <Stat label={t('totals.unlocks')} value={number.format(totals.unlocks)} />
        <Stat label={t('totals.apiKeys')} value={number.format(totals.apiKeys)} />
        <Stat label={t('totals.storeOrders')} value={storeOrders === null ? '—' : number.format(storeOrders)} />
      </StatGrid>

      <section className="space-y-5">
        <SectionHeader
          title={t('pending')}
          count={pending.total}
          action={
            <Link href={hrefWith('/admin/orders', { status: pending.total > 0 ? 'pending' : null })} className={linkMuted}>
              {t('allOrders')}
            </Link>
          }
        />
        {pending.rows.length === 0 ? (
          <EmptyState title={t('noPending')} compact />
        ) : (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
            {pending.rows.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-[13.5px]">
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[12.5px] break-all">{order.id}</span>
                  <Link href={`/admin/users/${encodeURIComponent(order.user_id)}`} className="break-all hover:underline">
                    {order.email ?? order.user_id}
                  </Link>
                  <span className="text-ink-muted tabular-nums">
                    {number.format(order.credits)} · {formatAmount(order.amount)}
                  </span>
                  <span className="text-ink-faint">{when.format(order.created_at)}</span>
                </span>
                <OrderActions id={order.id} admin />
              </li>
            ))}
          </ul>
        )}
        {pending.total > pending.rows.length && <p className="text-[13px] text-ink-faint">{t('pendingMore', { shown: pending.rows.length, total: pending.total })}</p>}
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('trends.title', { days: TREND_DAYS })} />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-3">
          <DailyBars label={t('trends.newUsers')} total={number.format(sum(trends.newUsers))} days={trends.days} values={trends.newUsers} formatValue={(value) => number.format(value)} formatDay={day} />
          <DailyBars label={t('trends.revenue')} total={formatAmount(sum(trends.revenue))} days={trends.days} values={trends.revenue} formatValue={formatAmount} formatDay={day} />
          <DailyBars label={t('trends.events')} total={number.format(sum(eventTotals))} days={trends.days} values={eventTotals} formatValue={(value) => number.format(value)} formatDay={day} />
        </div>
        {/* 图只看得出形状，精确的数在这张表里（也是读屏软件和打印时的替代）。最新的一天在最上面。 */}
        <details className="text-[13px]">
          <summary className="w-fit cursor-pointer text-ink-muted transition-colors duration-150 hover:text-ink">{t('trends.table')}</summary>
          <div className={`mt-4 ${tableWrap}`}>
            <table className={`${tableBase} min-w-[640px] tabular-nums`}>
              <thead className={tableHead}>
                <tr>
                  <th className={th}>{t('trends.day')}</th>
                  <th className={`${th} text-right`}>{t('trends.newUsers')}</th>
                  <th className={`${th} text-right`}>{t('trends.revenue')}</th>
                  {STAT_EVENTS.map((event) => (
                    <th key={event} className={`${th} text-right`}>
                      {t(`events.${event}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={tableBody}>
                {trends.days
                  .map((value, index) => ({ value, index }))
                  .reverse()
                  .map(({ value, index }) => (
                    <tr key={value}>
                      <td className={`${td} font-mono text-[12.5px] text-ink-muted`}>{value}</td>
                      <td className={`${td} text-right`}>{number.format(trends.newUsers[index] ?? 0)}</td>
                      <td className={`${td} text-right`}>{formatAmount(trends.revenue[index] ?? 0)}</td>
                      {STAT_EVENTS.map((event) => (
                        <td key={event} className={`${td} text-right`}>
                          {number.format(trends.events[index]?.[event] ?? 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('grant.title')} />
        <GrantCredits />
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('health.title')} />
        <SystemHealth locale={locale} />
      </section>
    </div>
  )
}
