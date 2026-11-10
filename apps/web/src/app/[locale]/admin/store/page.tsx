import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { dateTimeFormat, StatusText, tableBase, tableBody, tableHead, tableWrap, td, th } from '@/components/admin/ui'
import { EmptyState, PageHeader, Stat, StatGrid } from '@/components/community/ui'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { emailsById } from '@/lib/accounts/admin'
import { listOrders, type Order, type OrderStatus } from '@/lib/store/orders'
import { adminMetadata, itemIndex, requireAdminPage, type AdminItemRef } from '../shared'

export async function generateMetadata({ params }: PageProps<'/[locale]/admin/store'>): Promise<Metadata> {
  return adminMetadata((await params).locale, 'store')
}

// 订单是一张单一个文件，没有索引：只列最近这么多张，总数和各状态的数是全量的。
const ORDERS_SHOWN = 200
// 定制需求最长 2000 字，表格里先露这么多，剩下的点开看。
const BRIEF_PREVIEW = 240

const STATUSES = ['awaiting_payment', 'queued', 'in_progress', 'delivered', 'failed'] as const satisfies readonly OrderStatus[]
const TONE: Record<OrderStatus, 'pending' | 'success' | 'danger'> = { awaiting_payment: 'pending', queued: 'pending', in_progress: 'pending', delivered: 'success', failed: 'danger' }
const isStatus = (value: string): value is OrderStatus => value in TONE
// 订单文件里的类型。商店以后加了新的类型，这里不认识的原样显示。
const KINDS = ['item', 'skill', 'custom'] as const
const knownKind = (value: string) => KINDS.find((kind) => kind === value)

/** 给 agent 的商店的订单（docs/decisions/0008）：现成条目和定制单，新的在前。只读，这里不改订单。 */
export default async function AdminStorePage({ params }: PageProps<'/[locale]/admin/store'>) {
  const locale = resolveRouteLocale((await params).locale)
  await requireAdminPage(locale, '/admin/store')
  const t = await getTranslations({ locale, namespace: 'admin' })
  const { orders, total, counts } = await listOrders(ORDERS_SHOWN)
  const emails = emailsById([...new Set(orders.flatMap((order) => (order.buyerId ? [order.buyerId] : [])))])
  const items: Map<string, AdminItemRef> = orders.some((order) => order.slug || order.base) ? await itemIndex(locale) : new Map()
  const number = new Intl.NumberFormat(locale)
  const when = dateTimeFormat(locale)

  const cost = (order: Order) => {
    if (order.credits) return t('storePage.credits', { count: order.credits })
    // 条目单扣的是「解锁」的积分：记了账号却是 0，说明这个账号早就买过；没记账号的是早期的单，扣没扣不知道。
    if (order.kind === 'item') return order.buyerId ? t('storePage.owned') : '—'
    return order.price.free ? t('storePage.free') : `${order.price.usdc} USDC`
  }
  const itemLink = (slug: string) => {
    const item = items.get(slug)
    return item ? (
      <Link href={item.href} className="hover:underline">
        {item.title}
      </Link>
    ) : (
      <span className="font-mono text-[12.5px]">{slug}</span>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title={t('nav.store')} lead={t('storePage.lead')} />

      {/* 6 格：2、3、6 列都能排满。 */}
      <StatGrid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label={t('storePage.total')} value={number.format(total)} />
        {STATUSES.map((status) => (
          <Stat key={status} label={t(`storePage.statuses.${status}`)} value={number.format(counts[status])} />
        ))}
      </StatGrid>

      {orders.length === 0 ? (
        <EmptyState title={t('storePage.empty')} />
      ) : (
        <div className={tableWrap}>
          <table className={`${tableBase} min-w-[980px]`}>
            <thead className={tableHead}>
              <tr>
                <th className={th}>{t('columns.order')}</th>
                <th className={th}>{t('columns.kind')}</th>
                <th className={th}>{t('columns.status')}</th>
                <th className={th}>{t('columns.content')}</th>
                <th className={th}>{t('columns.buyer')}</th>
                <th className={`${th} text-right`}>{t('columns.cost')}</th>
                <th className={th}>{t('columns.created')}</th>
              </tr>
            </thead>
            <tbody className={tableBody}>
              {orders.map((order) => {
                const kind = knownKind(order.kind)
                const email = order.buyerId ? emails.get(order.buyerId) : undefined
                return (
                  <tr key={order.id}>
                    <td className={`${td} font-mono text-[12px] whitespace-nowrap text-ink-muted`}>{order.id}</td>
                    <td className={`${td} whitespace-nowrap`}>{kind ? t(`storePage.kinds.${kind}`) : order.kind}</td>
                    <td className={td}>{isStatus(order.status) ? <StatusText tone={TONE[order.status]}>{t(`storePage.statuses.${order.status}`)}</StatusText> : order.status}</td>
                    <td className={`${td} max-w-[380px] space-y-1.5`}>
                      {order.slug && <p>{itemLink(order.slug)}</p>}
                      {order.brief && <Brief text={order.brief} more={t('storePage.more')} less={t('storePage.less')} />}
                      {order.base && (
                        <p className="text-[12.5px] text-ink-faint">
                          {t('storePage.base')} {itemLink(order.base)}
                        </p>
                      )}
                      {order.error && <p className="text-[12.5px] break-words text-danger">{order.error}</p>}
                      {!order.slug && !order.brief && !order.error && <span className="text-ink-faint">—</span>}
                    </td>
                    <td className={td}>
                      {order.buyerId ? (
                        <Link href={`/admin/users/${encodeURIComponent(order.buyerId)}`} className="break-all hover:underline">
                          {email ?? order.buyerId}
                        </Link>
                      ) : (
                        !order.buyer && <span className="text-ink-faint">—</span>
                      )}
                      {/* 下单的 agent 自己报的名字，谁都能随便填，所以标出来、放在账号下面。 */}
                      {order.buyer && (
                        <p className="text-[12.5px] break-words text-ink-faint">
                          {t('storePage.agent')} {order.buyer}
                        </p>
                      )}
                    </td>
                    <td className={`${td} text-right font-mono whitespace-nowrap tabular-nums`}>{cost(order)}</td>
                    <td className={`${td} whitespace-nowrap text-ink-muted`}>{when.format(order.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > orders.length && <p className="text-[13px] text-ink-faint">{t('storePage.showing', { shown: orders.length, total })}</p>}
    </div>
  )
}

/** 定制单的需求：短的直接显示，长的先露开头，点开看全文（不用脚本，details 自己会展开）。 */
function Brief({ text, more, less }: { text: string; more: string; less: string }) {
  const body = 'break-words whitespace-pre-wrap'
  if (text.length <= BRIEF_PREVIEW) return <p className={body}>{text}</p>
  return (
    <details className="group">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className={`group-open:hidden ${body}`}>{text.slice(0, BRIEF_PREVIEW)}… </span>
        <span className="text-[12.5px] text-ink-muted underline decoration-line-strong underline-offset-4 group-open:hidden">{more}</span>
        <span className="hidden text-[12.5px] text-ink-muted underline decoration-line-strong underline-offset-4 group-open:inline">{less}</span>
      </summary>
      <p className={`mt-1.5 ${body}`}>{text}</p>
    </details>
  )
}
