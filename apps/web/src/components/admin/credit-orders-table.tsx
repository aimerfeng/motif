import { getTranslations } from 'next-intl/server'
import { OrderActions } from '@/components/credits/order-actions'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import type { CreditOrder, OrderStatus } from '@/lib/credits/orders'
import { formatAmount } from '@/lib/credits/pricing'
import { dateTimeFormat, StatusText, tableBase, tableBody, tableHead, tableWrap, td, th } from './ui'

const TONE: Record<OrderStatus, 'pending' | 'success' | 'muted'> = { pending: 'pending', paid: 'success', cancelled: 'muted' }
const isStatus = (value: string): value is OrderStatus => value in TONE

/**
 * 积分订单表：订单页（带下单人一列）和用户详情页（不带）共用。待确认的那几行带「已收款 / 取消」。
 * 套餐直接显示它的 id（trial、pro…）：后台对账看的是积分和金额两列，id 和数据库、接口里的写法一致，方便查。
 */
export async function CreditOrdersTable({ orders, locale, showUser = false }: { orders: (CreditOrder & { email?: string | null })[]; locale: Locale; showUser?: boolean }) {
  const t = await getTranslations({ locale, namespace: 'admin' })
  const number = new Intl.NumberFormat(locale)
  const when = dateTimeFormat(locale)

  return (
    <div className={tableWrap}>
      <table className={`${tableBase} ${showUser ? 'min-w-[980px]' : 'min-w-[820px]'}`}>
        <thead className={tableHead}>
          <tr>
            <th className={th}>{t('columns.order')}</th>
            {showUser && <th className={th}>{t('columns.user')}</th>}
            <th className={th}>{t('columns.package')}</th>
            <th className={`${th} text-right`}>{t('columns.credits')}</th>
            <th className={`${th} text-right`}>{t('columns.amount')}</th>
            <th className={th}>{t('columns.status')}</th>
            <th className={th}>{t('columns.created')}</th>
            <th className={th}>{t('columns.paid')}</th>
            <th className={th}>{t('columns.note')}</th>
            <th className={`${th} text-right`}>
              <span className="sr-only">{t('columns.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody className={tableBody}>
          {orders.map((order) => {
            // 备注是确认收款时填的流水号和说明（app/api/admin/orders/[id]）。
            const note = [order.provider_ref, order.note].filter(Boolean).join(' · ')
            return (
              <tr key={order.id}>
                <td className={`${td} font-mono text-[12.5px] whitespace-nowrap`}>{order.id}</td>
                {showUser && (
                  <td className={td}>
                    <Link href={`/admin/users/${encodeURIComponent(order.user_id)}`} className="break-all hover:underline">
                      {order.email ?? order.user_id}
                    </Link>
                  </td>
                )}
                <td className={`${td} font-mono text-[12.5px] whitespace-nowrap text-ink-muted`}>{order.package_id}</td>
                <td className={`${td} text-right font-mono tabular-nums`}>{number.format(order.credits)}</td>
                <td className={`${td} text-right font-mono tabular-nums`}>{formatAmount(order.amount)}</td>
                <td className={td}>{isStatus(order.status) ? <StatusText tone={TONE[order.status]}>{t(`orderStatus.${order.status}`)}</StatusText> : order.status}</td>
                <td className={`${td} whitespace-nowrap text-ink-muted`}>{when.format(order.created_at)}</td>
                <td className={`${td} whitespace-nowrap text-ink-muted`}>{order.paid_at ? when.format(order.paid_at) : '—'}</td>
                <td className={`${td} max-w-[220px] text-[12.5px] break-words text-ink-muted`}>{note || '—'}</td>
                <td className={`${td} text-right`}>{order.status === 'pending' && <OrderActions id={order.id} admin />}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
