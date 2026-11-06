import { HttpError } from '@/lib/community/http'
import { all, one, run, transaction } from '@/lib/db'
import { creditCosts } from './pricing'

/*
 * 积分账本（docs/decisions/0009-accounts-credits-repos.md）。
 * 余额只在事务里和流水一起改：任何时候余额 = 这个用户全部流水的变动之和。
 * (用户, 类型, 关联对象) 唯一：同一张订单只到账一次、同一个条目只解锁一次，重试和并发都不会多扣多加。
 */

export type CreditKind = 'signup' | 'purchase' | 'admin' | 'unlock-item' | 'unlock-skill' | 'studio' | 'custom-order' | 'refund'
export type UnlockKind = 'item' | 'skill'

export interface LedgerEntry {
  id: number
  user_id: string
  delta: number
  balance_after: number
  kind: CreditKind
  ref: string | null
  note: string | null
  created_at: number
  updated_at: number
}

/** 余额不够：402，带上差多少，页面据此提示去买积分。 */
export class InsufficientCredits extends HttpError {
  readonly need: number
  readonly have: number
  constructor(need: number, have: number) {
    super(402, `not enough credits: this needs ${need}, the balance is ${have}`, { code: 'insufficient_credits', need, have })
    this.need = need
    this.have = have
  }
}

export function balanceOf(userId: string): number {
  return one<{ balance: number }>('SELECT balance FROM credit_balance WHERE user_id = ?', userId)?.balance ?? 0
}

function setBalance(userId: string, balance: number, now: number): void {
  run('INSERT INTO credit_balance (user_id, balance, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET balance = excluded.balance, updated_at = excluded.updated_at', userId, balance, now)
}

export interface CreditChange {
  userId: string
  delta: number
  kind: CreditKind
  /** 关联对象（订单号、条目 slug……）。给了就只记一次。 */
  ref?: string | null
  note?: string | null
  /** 管理员扣积分可以扣成负数；其他扣费余额不够就拒绝。 */
  allowNegative?: boolean
}

/** 记一笔。已经记过同一件事（同一个 ref）就什么也不做，applied 为 false。 */
export function applyCredit(change: CreditChange): { applied: boolean; balance: number; entry: LedgerEntry | null } {
  if (!Number.isInteger(change.delta)) throw new Error(`credit delta must be an integer, got ${change.delta}`)
  return transaction(() => {
    const ref = change.ref ?? null
    if (ref !== null && one('SELECT id FROM credit_ledger WHERE user_id = ? AND kind = ? AND ref = ?', change.userId, change.kind, ref)) {
      return { applied: false, balance: balanceOf(change.userId), entry: null }
    }
    const current = balanceOf(change.userId)
    const next = current + change.delta
    if (next < 0 && change.delta < 0 && !change.allowNegative) throw new InsufficientCredits(-change.delta, current)
    const now = Date.now()
    setBalance(change.userId, next, now)
    const { lastInsertRowid } = run(
      'INSERT INTO credit_ledger (user_id, delta, balance_after, kind, ref, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      change.userId,
      change.delta,
      next,
      change.kind,
      ref,
      change.note ?? null,
      now,
      now,
    )
    return { applied: true, balance: next, entry: one<LedgerEntry>('SELECT * FROM credit_ledger WHERE id = ?', lastInsertRowid)! }
  })
}

/**
 * 注册积分按邮箱只送一次：同一个收件箱换个写法（大小写、Gmail 的 +标签和点）注册多个账号也只算一个。
 * 换了 GitHub 账号或者真的换了邮箱挡不住，这里只防最省事的刷法。
 */
export function bonusKey(email: string): string {
  const [local = '', domain = ''] = email.trim().toLowerCase().split('@')
  const base = local.split('+')[0]!
  const gmail = domain === 'gmail.com' || domain === 'googlemail.com'
  return `${gmail ? base.replaceAll('.', '') : base}@${gmail ? 'gmail.com' : domain}`
}

export function grantSignupBonus(userId: string, email: string): boolean {
  const bonus = creditCosts().signupBonus
  if (bonus <= 0) return false
  return transaction(() => {
    const key = bonusKey(email)
    if (one('SELECT 1 AS yes FROM signup_bonus WHERE email_key = ? OR user_id = ?', key, userId)) return false
    run('INSERT INTO signup_bonus (email_key, user_id, created_at) VALUES (?, ?, ?)', key, userId, Date.now())
    return applyCredit({ userId, delta: bonus, kind: 'signup', ref: 'signup', note: 'welcome bonus' }).applied
  })
}

export function ledgerOf(userId: string, limit = 50, before?: number): LedgerEntry[] {
  return before === undefined
    ? all<LedgerEntry>('SELECT * FROM credit_ledger WHERE user_id = ? ORDER BY id DESC LIMIT ?', userId, limit)
    : all<LedgerEntry>('SELECT * FROM credit_ledger WHERE user_id = ? AND id < ? ORDER BY id DESC LIMIT ?', userId, before, limit)
}

export function isUnlocked(userId: string, kind: UnlockKind, target: string): boolean {
  return one('SELECT 1 AS yes FROM unlock WHERE user_id = ? AND kind = ? AND target = ?', userId, kind, target) !== undefined
}

export function unlocksOf(userId: string, kind: UnlockKind): string[] {
  return all<{ target: string }>('SELECT target FROM unlock WHERE user_id = ? AND kind = ? ORDER BY created_at DESC', userId, kind).map((row) => row.target)
}

/**
 * 解锁一个条目或 Skill：没解锁过就扣 cost 并记下，解锁过就不再扣。
 * 返回这次扣了多少（0 表示早就解锁了）和扣完的余额。余额不够抛 InsufficientCredits。
 */
export function unlock(userId: string, kind: UnlockKind, target: string, cost: number): { charged: number; balance: number } {
  return transaction(() => {
    if (isUnlocked(userId, kind, target)) return { charged: 0, balance: balanceOf(userId) }
    const { balance } = cost > 0 ? applyCredit({ userId, delta: -cost, kind: kind === 'item' ? 'unlock-item' : 'unlock-skill', ref: target }) : { balance: balanceOf(userId) }
    run('INSERT INTO unlock (user_id, kind, target, credits, created_at) VALUES (?, ?, ?, ?, ?)', userId, kind, target, cost, Date.now())
    return { charged: cost, balance }
  })
}

/**
 * 按用量扣费的一件事（一轮工作台对话）：只记一条流水，跑的过程中把它的金额往上调到 total。
 * 余额不够时扣到 0 为止，exhausted 为真，调用方据此中止。
 */
export function chargeUsage(userId: string, kind: CreditKind, ref: string, total: number, note?: string): { charged: number; balance: number; exhausted: boolean } {
  return transaction(() => {
    const now = Date.now()
    let entry = one<LedgerEntry>('SELECT * FROM credit_ledger WHERE user_id = ? AND kind = ? AND ref = ?', userId, kind, ref)
    if (!entry) {
      const balance = balanceOf(userId)
      run('INSERT INTO credit_ledger (user_id, delta, balance_after, kind, ref, note, created_at, updated_at) VALUES (?, 0, ?, ?, ?, ?, ?, ?)', userId, balance, kind, ref, note ?? null, now, now)
      entry = one<LedgerEntry>('SELECT * FROM credit_ledger WHERE user_id = ? AND kind = ? AND ref = ?', userId, kind, ref)!
    }
    const already = -entry.delta
    const balance = balanceOf(userId)
    const wanted = Math.max(0, total - already)
    const take = Math.min(wanted, Math.max(0, balance))
    if (take > 0) {
      setBalance(userId, balance - take, now)
      run('UPDATE credit_ledger SET delta = delta - ?, balance_after = ?, updated_at = ? WHERE id = ?', take, balance - take, now, entry.id)
    }
    return { charged: already + take, balance: balance - take, exhausted: take < wanted || balance - take <= 0 }
  })
}
