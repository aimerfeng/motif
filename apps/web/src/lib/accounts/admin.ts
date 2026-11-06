import { all, one } from '@/lib/db'

/** 管理后台用的汇总查询（docs/decisions/0009 第 7 节）。 */

export interface AdminUserRow {
  id: string
  email: string
  name: string
  emailVerified: number
  createdAt: string | number
  handle: string | null
  githubLogin: string | null
  balance: number
}

export function recentUsers(limit = 100): AdminUserRow[] {
  return all<AdminUserRow>(
    `SELECT u.id, u.email, u.name, u.emailVerified, u.createdAt, p.handle, p.github_login AS githubLogin, COALESCE(b.balance, 0) AS balance
     FROM "user" u LEFT JOIN profile p ON p.user_id = u.id LEFT JOIN credit_balance b ON b.user_id = u.id
     ORDER BY u.createdAt DESC LIMIT ?`,
    limit,
  )
}

export function siteTotals(): { users: number; repos: number; credits: number; revenue: number } {
  return {
    users: one<{ n: number }>('SELECT COUNT(*) AS n FROM "user"')!.n,
    repos: one<{ n: number }>('SELECT COUNT(*) AS n FROM repo')!.n,
    credits: one<{ n: number | null }>('SELECT SUM(balance) AS n FROM credit_balance')!.n ?? 0,
    revenue: one<{ n: number | null }>(`SELECT SUM(amount) AS n FROM credit_order WHERE status = 'paid'`)!.n ?? 0,
  }
}

/** 订单上显示下单人。 */
export function emailsById(ids: string[]): Map<string, string> {
  if (ids.length === 0) return new Map()
  const rows = all<{ id: string; email: string }>(`SELECT id, email FROM "user" WHERE id IN (${ids.map(() => '?').join(',')})`, ...ids)
  return new Map(rows.map((row) => [row.id, row.email]))
}
