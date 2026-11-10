import type { CreditOrder, OrderStatus } from '@/lib/credits/orders'
import { all, one, run } from '@/lib/db'
import { emptyCounts, STAT_EVENTS, type StatCounts, type StatEvent } from '@/lib/stats/events'
import { dayOffset, statDay } from '@/lib/stats/record'

/*
 * 管理后台用的查询（docs/decisions/0009 第 7 节）。后台自己的 SQL 都放在这里，页面只负责排版；
 * 谁能看由页面和接口各自检查（app/[locale]/admin/shared.ts、requireAdmin），这里不管权限。
 * 调用方负责先 await authReady()（页面的权限检查已经做了这一步）。
 */

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

const USER_COLUMNS = `u.id, u.email, u.name, u.emailVerified, u.createdAt, p.handle, p.github_login AS githubLogin, COALESCE(b.balance, 0) AS balance`
const USER_FROM = `FROM "user" u LEFT JOIN profile p ON p.user_id = u.id LEFT JOIN credit_balance b ON b.user_id = u.id`

/*
 * Better Auth 把 createdAt 存成 ISO 字符串，换了适配器或版本可能变成数字（毫秒；列是文本类型时 SQLite 会把它存成
 * "1793577600000.0" 这样的数字文本，所以只含数字和小数点的文本也按毫秒算，ISO 字符串里有 - 和 : 不会被误判）。
 * 排序和按天统计都先换算成毫秒：SQLite 里数字永远排在文本前面，直接比较的话，表里混着两种写法时次序和统计会悄悄出错。
 */
const USER_CREATED_MS = `(CASE WHEN typeof(u.createdAt) IN ('integer', 'real') OR u.createdAt NOT GLOB '*[^0-9.]*' THEN CAST(u.createdAt AS INTEGER) ELSE CAST(strftime('%s', u.createdAt) AS INTEGER) * 1000 END)`

/** 页面上显示注册时间用：和上面的 SQL 同一个口径，认不出来的算 0。 */
export function toMillis(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (!value) return 0
  const parsed = /^\d+(\.\d+)?$/.test(value) ? Number(value) : Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const isEvent = (value: string): value is StatEvent => (STAT_EVENTS as readonly string[]).includes(value)

/* ---------- 分页 ---------- */

export const ADMIN_PAGE_SIZE = 50

export interface Paged<Row> {
  rows: Row[]
  total: number
  /** 实际返回的是第几页（从 1 开始）：请求的页码超出范围时退回最后一页。 */
  page: number
  pageCount: number
}

function paging(total: number, page: number, pageSize: number): { page: number; pageCount: number; offset: number } {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, Number.isInteger(page) ? page : 1), pageCount)
  return { page: current, pageCount, offset: (current - 1) * pageSize }
}

/* ---------- 概览 ---------- */

export interface AdminTotals {
  users: number
  verifiedUsers: number
  publicRepos: number
  privateRepos: number
  /** 所有用户的余额之和：发出去还没花掉的积分。 */
  credits: number
  /** 已收款订单的金额之和（分）。 */
  revenue: number
  paidOrders: number
  pendingOrders: number
  unlocks: number
  /** 没吊销的 API 密钥。 */
  apiKeys: number
}

export function adminTotals(): AdminTotals {
  const users = one<{ total: number; verified: number | null }>('SELECT COUNT(*) AS total, SUM(emailVerified != 0) AS verified FROM "user"')!
  const repos = one<{ open: number | null; closed: number | null }>(`SELECT SUM(visibility = 'public') AS open, SUM(visibility != 'public') AS closed FROM repo`)!
  const orders = one<{ revenue: number | null; paid: number | null; pending: number | null }>(
    `SELECT SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS revenue, SUM(status = 'paid') AS paid, SUM(status = 'pending') AS pending FROM credit_order`,
  )!
  return {
    users: users.total,
    verifiedUsers: users.verified ?? 0,
    publicRepos: repos.open ?? 0,
    privateRepos: repos.closed ?? 0,
    credits: one<{ n: number | null }>('SELECT SUM(balance) AS n FROM credit_balance')!.n ?? 0,
    revenue: orders.revenue ?? 0,
    paidOrders: orders.paid ?? 0,
    pendingOrders: orders.pending ?? 0,
    unlocks: one<{ n: number }>('SELECT COUNT(*) AS n FROM unlock')!.n,
    apiKeys: one<{ n: number }>('SELECT COUNT(*) AS n FROM api_key WHERE revoked_at IS NULL')!.n,
  }
}

export const TREND_DAYS = 14

export interface AdminTrends {
  /** 统计日（YYYY-MM-DD），最早的在前，最后一个是今天。 */
  days: string[]
  newUsers: number[]
  /** 当天确认收款的金额（分）。 */
  revenue: number[]
  /** 当天各种条目事件的次数。 */
  events: StatCounts[]
}

/** 和 statDay 同一种切天方式（北京时间），三条走势才对得上同一天。 */
const DAY_SHIFT_MS = 8 * 3_600_000
const dayOfMs = (column: string) => `strftime('%Y-%m-%d', (${column} + ${DAY_SHIFT_MS}) / 1000, 'unixepoch')`

/** 最近 days 天每天的新增用户、收款和条目使用。没有数据的日子是 0，不会缺一天。 */
export function adminTrends(days = TREND_DAYS, now = Date.now()): AdminTrends {
  const today = statDay(now)
  const list = Array.from({ length: days }, (_, index) => dayOffset(today, index - (days - 1)))
  const index = new Map(list.map((day, position) => [day, position]))
  const since = Date.parse(`${list[0]}T00:00:00Z`) - DAY_SHIFT_MS

  const newUsers = list.map(() => 0)
  for (const row of all<{ day: string; total: number }>(`SELECT ${dayOfMs('ms')} AS day, COUNT(*) AS total FROM (SELECT ${USER_CREATED_MS} AS ms FROM "user" u) WHERE ms >= ? GROUP BY day`, since)) {
    const position = index.get(row.day)
    if (position !== undefined) newUsers[position] = Number(row.total)
  }

  const revenue = list.map(() => 0)
  for (const row of all<{ day: string; total: number }>(`SELECT ${dayOfMs('paid_at')} AS day, SUM(amount) AS total FROM credit_order WHERE status = 'paid' AND paid_at >= ? GROUP BY day`, since)) {
    const position = index.get(row.day)
    if (position !== undefined) revenue[position] = Number(row.total)
  }

  const events = list.map(emptyCounts)
  for (const row of all<{ day: string; event: string; total: number }>('SELECT day, event, SUM(count) AS total FROM item_stat_daily WHERE day >= ? GROUP BY day, event', list[0]!)) {
    const counts = events[index.get(row.day) ?? -1]
    if (counts && isEvent(row.event)) counts[row.event] = Number(row.total)
  }

  return { days: list, newUsers, revenue, events }
}

/* ---------- 用户 ---------- */

/** LIKE 里的通配符按字面匹配：搜「a_b」不该把「axb」也搜出来。 */
const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`

/**
 * 用户列表：q 在邮箱、昵称、handle、GitHub 用户名里找（不分大小写的包含），也可以直接贴用户 id。新注册的在前。
 */
export function searchUsers({ q = '', page = 1, pageSize = ADMIN_PAGE_SIZE }: { q?: string; page?: number; pageSize?: number } = {}): Paged<AdminUserRow> {
  const term = q.trim().replace(/^@/, '').slice(0, 100)
  const where = term ? `WHERE u.email LIKE ?1 ESCAPE '\\' OR u.name LIKE ?1 ESCAPE '\\' OR p.handle LIKE ?1 ESCAPE '\\' OR p.github_login LIKE ?1 ESCAPE '\\' OR u.id = ?2` : ''
  const params = term ? [likePattern(term), term] : []
  const total = one<{ n: number }>(`SELECT COUNT(*) AS n ${USER_FROM} ${where}`, ...params)!.n
  const { page: current, pageCount, offset } = paging(total, page, pageSize)
  const rows = all<AdminUserRow>(`SELECT ${USER_COLUMNS} ${USER_FROM} ${where} ORDER BY ${USER_CREATED_MS} DESC, u.id LIMIT ${Number(pageSize)} OFFSET ${offset}`, ...params)
  return { rows, total, page: current, pageCount }
}

export function adminUser(id: string): AdminUserRow | undefined {
  return one<AdminUserRow>(`SELECT ${USER_COLUMNS} ${USER_FROM} WHERE u.id = ?`, id)
}

export interface AdminApiKey {
  id: string
  name: string
  created_at: number
  last_used_at: number | null
  revoked_at: number | null
}

/** 用户的 API 密钥，连吊销了的一起（排查「密钥突然不能用」时要看）。只取这几列：哈希和前缀不出数据库。 */
export function apiKeysOfUser(userId: string): AdminApiKey[] {
  return all<AdminApiKey>('SELECT id, name, created_at, last_used_at, revoked_at FROM api_key WHERE user_id = ? ORDER BY created_at DESC', userId)
}

/** 订单上显示下单人。 */
export function emailsById(ids: string[]): Map<string, string> {
  if (ids.length === 0) return new Map()
  const rows = all<{ id: string; email: string }>(`SELECT id, email FROM "user" WHERE id IN (${ids.map(() => '?').join(',')})`, ...ids)
  return new Map(rows.map((row) => [row.id, row.email]))
}

/* ---------- 积分订单 ---------- */

export const ORDER_FILTERS = ['all', 'pending', 'paid', 'cancelled'] as const
export type OrderFilter = (typeof ORDER_FILTERS)[number]

export interface AdminCreditOrder extends CreditOrder {
  /** 下单人的邮箱。 */
  email: string | null
}

/** 积分订单，新的在前；status 不是 all 时只看这一种。 */
export function creditOrdersPage({ status = 'all', page = 1, pageSize = ADMIN_PAGE_SIZE }: { status?: OrderFilter; page?: number; pageSize?: number } = {}): Paged<AdminCreditOrder> {
  const where = status === 'all' ? '' : 'WHERE o.status = ?'
  const params = status === 'all' ? [] : [status]
  const total = one<{ n: number }>(`SELECT COUNT(*) AS n FROM credit_order o ${where}`, ...params)!.n
  const { page: current, pageCount, offset } = paging(total, page, pageSize)
  const rows = all<AdminCreditOrder>(
    `SELECT o.*, u.email AS email FROM credit_order o LEFT JOIN "user" u ON u.id = o.user_id ${where} ORDER BY o.created_at DESC, o.id LIMIT ${Number(pageSize)} OFFSET ${offset}`,
    ...params,
  )
  return { rows, total, page: current, pageCount }
}

/** 每种状态各有多少张订单（筛选按钮上的数字）。 */
export function creditOrderCounts(): Record<OrderFilter, number> {
  const counts: Record<OrderFilter, number> = { all: 0, pending: 0, paid: 0, cancelled: 0 }
  for (const row of all<{ status: OrderStatus; n: number }>('SELECT status, COUNT(*) AS n FROM credit_order GROUP BY status')) {
    counts.all += row.n
    if (row.status in counts) counts[row.status] = row.n
  }
  return counts
}

/* ---------- 内容 ---------- */

export const TOP_ITEM_DAYS = [7, 30] as const
export type TopItemDays = (typeof TOP_ITEM_DAYS)[number]

export interface TopItem {
  slug: string
  counts: StatCounts
}

/**
 * 最近 days 天里某一种事件最多的条目，连同它们同期的其他事件。
 * 排行榜（lib/stats/ranking.ts）只有综合分、收藏、拿走三张榜，而且只排还在市场里的条目；
 * 后台要看的是原始计数，下架了的条目也照样列出来。
 */
export function topItems({ event, days, limit = 20, now = Date.now() }: { event: StatEvent; days: number; limit?: number; now?: number }): TopItem[] {
  const since = dayOffset(statDay(now), -(days - 1))
  const bySlug = new Map<string, StatCounts>()
  for (const row of all<{ slug: string; event: string; total: number }>('SELECT slug, event, SUM(count) AS total FROM item_stat_daily WHERE day >= ? GROUP BY slug, event', since)) {
    if (!isEvent(row.event)) continue
    const counts = bySlug.get(row.slug) ?? emptyCounts()
    counts[row.event] = Number(row.total)
    bySlug.set(row.slug, counts)
  }
  return [...bySlug.entries()]
    .filter(([, counts]) => counts[event] > 0)
    .sort((a, b) => b[1][event] - a[1][event] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([slug, counts]) => ({ slug, counts }))
}

export interface AdminRepoRow {
  id: string
  slug: string
  name: string
  description: string
  source: string
  file_count: number
  total_bytes: number
  fork_count: number
  created_at: number
  updated_at: number
  owner_id: string
  owner_handle: string | null
  owner_email: string
  taken_down_at: number | null
}

const ADMIN_REPO_ROWS = `SELECT r.id, r.slug, r.name, r.description, r.source, r.file_count, r.total_bytes, r.fork_count, r.created_at, r.updated_at, r.taken_down_at,
            r.owner_id, p.handle AS owner_handle, u.email AS owner_email
     FROM repo r JOIN "user" u ON u.id = r.owner_id LEFT JOIN profile p ON p.user_id = r.owner_id`

/** 最近有改动的公开仓库（空仓库也算：巡查要看的是所有人看得见的东西）。 */
export function latestPublicRepos(limit = 30): AdminRepoRow[] {
  return all<AdminRepoRow>(`${ADMIN_REPO_ROWS} WHERE r.visibility = 'public' ORDER BY r.updated_at DESC, r.id LIMIT ?`, limit)
}

/** 下架中的仓库，最近下架的在前：下架错了要能找回来恢复。 */
export function takenDownRepos(limit = 100): AdminRepoRow[] {
  return all<AdminRepoRow>(`${ADMIN_REPO_ROWS} WHERE r.taken_down_at IS NOT NULL ORDER BY r.taken_down_at DESC, r.id LIMIT ?`, limit)
}

/**
 * 管理员下架一个仓库：改成私有并记下下架时间。文件不动，作者自己还看得到，但不能自己改回公开
 * （lib/repos/repos.ts 的 updateRepo 和 forkRepo 会拦）：只改成私有的话，作者点一下就又公开了，等于没下架。
 * 没有这个仓库返回 undefined；本来就不公开的不动（changed 为 false）：作者自己设成私有的仓库不归巡查管。
 * 不改 updated_at：那是内容的更新时间，恢复以后它应该回到列表里原来的位置。
 */
export function hideRepo(id: string): { id: string; changed: boolean } | undefined {
  const repo = one<{ visibility: string }>('SELECT visibility FROM repo WHERE id = ?', id)
  if (!repo) return undefined
  if (repo.visibility !== 'public') return { id, changed: false }
  run(`UPDATE repo SET visibility = 'private', taken_down_at = ? WHERE id = ?`, Date.now(), id)
  return { id, changed: true }
}

/** 撤销下架：回到下架前的样子（公开）。没有这个仓库返回 undefined；没在下架中的不动。 */
export function restoreRepo(id: string): { id: string; changed: boolean } | undefined {
  const repo = one<{ taken_down_at: number | null }>('SELECT taken_down_at FROM repo WHERE id = ?', id)
  if (!repo) return undefined
  if (repo.taken_down_at === null) return { id, changed: false }
  run(`UPDATE repo SET visibility = 'public', taken_down_at = NULL WHERE id = ?`, id)
  return { id, changed: true }
}

/**
 * 数据库有多大（字节）；读不到时是 null。按页数算，不看主文件的大小：
 * WAL 模式下刚写进去的数据还在 -wal 文件里，主文件可能只有一页（本机实测显示成 4 KB）。
 */
export function databaseBytes(): number | null {
  try {
    const pages = one<{ page_count: number }>('PRAGMA page_count')?.page_count
    const pageSize = one<{ page_size: number }>('PRAGMA page_size')?.page_size
    return pages && pageSize ? pages * pageSize : null
  } catch {
    return null
  }
}

/**
 * MOTIF_ADMIN_EMAILS 里列了几个邮箱。只数数，邮箱本身不出这个函数。
 * 拆分方式和 lib/auth/server.ts 的 isAdmin 一样（那边没有导出名单，也不该导出）。
 */
export function adminEmailCount(): number {
  const emails = (process.env.MOTIF_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  return new Set(emails).size
}
