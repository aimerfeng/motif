import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CreditOrdersTable } from '@/components/admin/credit-orders-table'
import { first, hrefWith, pageOf, Pagination, pick, Segmented } from '@/components/admin/ui'
import { EmptyState, PageHeader } from '@/components/community/ui'
import { resolveRouteLocale } from '@/i18n/locale'
import { creditOrderCounts, creditOrdersPage, ORDER_FILTERS } from '@/lib/accounts/admin'
import { adminMetadata, requireAdminPage } from '../shared'

export async function generateMetadata({ params }: PageProps<'/[locale]/admin/orders'>): Promise<Metadata> {
  return adminMetadata((await params).locale, 'orders')
}

/** 积分订单：按状态筛选、翻页；待付款的可以直接确认收款或取消。 */
export default async function AdminOrdersPage({ params, searchParams }: PageProps<'/[locale]/admin/orders'>) {
  const locale = resolveRouteLocale((await params).locale)
  await requireAdminPage(locale, '/admin/orders')
  const t = await getTranslations({ locale, namespace: 'admin' })
  const search = await searchParams
  const status = pick(first(search.status), ORDER_FILTERS, 'all')
  const result = creditOrdersPage({ status, page: pageOf(first(search.page)) })
  const counts = creditOrderCounts()
  const number = new Intl.NumberFormat(locale)
  // 「全部」是默认值，不写进地址。
  const hrefOf = (filter: (typeof ORDER_FILTERS)[number], page = 1) => hrefWith('/admin/orders', { status: filter === 'all' ? null : filter, page: page > 1 ? page : null })

  return (
    <div className="space-y-8">
      <PageHeader title={t('nav.orders')} lead={t('ordersPage.lead')} />

      <Segmented
        label={t('columns.status')}
        options={ORDER_FILTERS.map((filter) => ({
          href: hrefOf(filter),
          active: filter === status,
          label: (
            <>
              {filter === 'all' ? t('ordersPage.all') : t(`orderStatus.${filter}`)}
              <span className="ml-1.5 font-mono text-[11.5px] tabular-nums opacity-70">{number.format(counts[filter])}</span>
            </>
          ),
        }))}
      />

      {result.rows.length === 0 ? <EmptyState title={t('ordersPage.empty')} /> : <CreditOrdersTable orders={result.rows} locale={locale} showUser />}

      <Pagination locale={locale} page={result.page} pageCount={result.pageCount} total={result.total} hrefOf={(page) => hrefOf(status, page)} />
    </div>
  )
}
