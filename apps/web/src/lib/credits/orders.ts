import { randomBytes } from 'node:crypto'
import { HttpError } from '@/lib/community/http'
import { all, one, run, transaction } from '@/lib/db'
import { applyCredit } from './ledger'
import { packageById } from './pricing'

/*
 * 积分订单（docs/decisions/0009-accounts-credits-repos.md 第 6 节）：待付款 → 已付款 / 已取消。
 * 付款通道还没接，现在由管理员确认收款（provider = manual）。接入通道后，回调确认走同一个 markPaid：
 * 标记已付款和加积分在一个事务里，流水关联订单号，同一张订单确认几次都只到账一次。
 */

export type OrderStatus = 'pending' | 'paid' | 'cancelled'

export interface CreditOrder {
  id: string
  user_id: string
  package_id: string
  credits: number
  amount: number
  currency: string
  status: OrderStatus
  provider: string
  provider_ref: string | null
  note: string | null
  created_at: number
  updated_at: number
  paid_at: number | null
}

/** 付款通道。现在只有 manual：下单后管理员在 /admin 确认收款。 */
export const PAYMENT_PROVIDER = 'manual'

const MAX_PENDING = 3

export function createOrder(userId: string, packageId: string): CreditOrder {
  const pack = packageById(packageId)
  if (!pack) throw new HttpError(400, `no credit package "${packageId}"`)
  return transaction(() => {
    const pending = one<{ n: number }>(`SELECT COUNT(*) AS n FROM credit_order WHERE user_id = ? AND status = 'pending'`, userId)!.n
    if (pending >= MAX_PENDING) throw new HttpError(409, `you already have ${pending} unpaid orders; pay or cancel one first`)
    const now = Date.now()
    // 订单号要能念给客服听：日期 + 6 位随机字符。
    const id = `MO${new Date(now).toISOString().slice(2, 10).replaceAll('-', '')}${randomBytes(4).toString('hex').slice(0, 6).toUpperCase()}`
    run(
      'INSERT INTO credit_order (id, user_id, package_id, credits, amount, currency, status, provider, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      id,
      userId,
      pack.id,
      pack.credits,
      pack.amount,
      pack.currency,
      'pending',
      PAYMENT_PROVIDER,
      now,
      now,
    )
    return orderById(id)!
  })
}

export function orderById(id: string): CreditOrder | undefined {
  return one<CreditOrder>('SELECT * FROM credit_order WHERE id = ?', id)
}

export function ordersOf(userId: string, limit = 20): CreditOrder[] {
  return all<CreditOrder>('SELECT * FROM credit_order WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', userId, limit)
}

export function ordersByStatus(status: OrderStatus | 'all', limit = 100): CreditOrder[] {
  return status === 'all'
    ? all<CreditOrder>('SELECT * FROM credit_order ORDER BY created_at DESC LIMIT ?', limit)
    : all<CreditOrder>('SELECT * FROM credit_order WHERE status = ? ORDER BY created_at DESC LIMIT ?', status, limit)
}

/** 确认收款：订单标为已付款，积分到账。已经付过的订单再确认一次什么也不做。 */
export function markPaid(id: string, by: { provider: string; ref?: string | null; note?: string | null }): CreditOrder {
  return transaction(() => {
    const order = orderById(id)
    if (!order) throw new HttpError(404, 'no such order')
    if (order.status === 'paid') return order
    // 取消了的订单也可以确认：用户取消以后才把钱转过来，钱收到了就要给积分。
    const now = Date.now()
    run('UPDATE credit_order SET status = ?, provider = ?, provider_ref = ?, note = ?, paid_at = ?, updated_at = ? WHERE id = ?', 'paid', by.provider, by.ref ?? null, by.note ?? null, now, now, id)
    applyCredit({ userId: order.user_id, delta: order.credits, kind: 'purchase', ref: order.id, note: `${order.package_id} package` })
    return orderById(id)!
  })
}

/** 取消一张待付款的订单。userId 给了就只能取消自己的。 */
export function cancelOrder(id: string, userId?: string): CreditOrder {
  return transaction(() => {
    const order = orderById(id)
    if (!order || (userId && order.user_id !== userId)) throw new HttpError(404, 'no such order')
    if (order.status !== 'pending') throw new HttpError(409, `this order is already ${order.status}`)
    run('UPDATE credit_order SET status = ?, updated_at = ? WHERE id = ?', 'cancelled', Date.now(), id)
    return orderById(id)!
  })
}
