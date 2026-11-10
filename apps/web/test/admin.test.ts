import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

/*
 * 管理后台的查询（lib/accounts/admin.ts）和商店订单列表（lib/store/orders.ts 的 listOrders）。
 * 和 accounts.test.ts 一样：数据库和订单目录都用临时的，模块在导入时读环境变量，所以先设环境变量再动态导入；
 * Better Auth 的 user 表手动建一个最小的。
 */

const dir = mkdtempSync(path.join(tmpdir(), 'motif-admin-'))
process.env.MOTIF_DB_PATH = path.join(dir, 'test.sqlite')
process.env.MOTIF_ORDERS_DATA = path.join(dir, 'orders')

const db = await import('../src/lib/db')
const admin = await import('../src/lib/accounts/admin')
const store = await import('../src/lib/store/orders')
const repos = await import('../src/lib/repos/repos')

beforeAll(() => {
  db.db().exec(`CREATE TABLE "user" (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, emailVerified INTEGER NOT NULL DEFAULT 0, image TEXT, createdAt TEXT, updatedAt TEXT, githubLogin TEXT)`)
  db.migrateOwnTables()
})

afterAll(() => {
  db.db().close()
  rmSync(dir, { recursive: true, force: true })
})

// 每个用例从空表开始：这些查询都是全表汇总，互相留下的数据会让数字对不上。
beforeEach(() => {
  db.db().exec('DELETE FROM item_stat_daily; DELETE FROM "user";')
})

// 北京时间 2026-11-09 12:00。
const NOW = Date.parse('2026-11-09T04:00:00Z')
const HOUR = 3_600_000
const DAY = 24 * HOUR

interface NewUser {
  id: string
  name?: string
  email?: string
  verified?: boolean
  createdAt?: string | number
  handle?: string
  github?: string
  balance?: number
}

function addUser({ id, name = id, email = `${id}@example.com`, verified = true, createdAt = new Date(NOW).toISOString(), handle, github, balance }: NewUser): string {
  db.run('INSERT INTO "user" (id, name, email, emailVerified, createdAt) VALUES (?, ?, ?, ?, ?)', id, name, email, verified ? 1 : 0, createdAt)
  if (handle) db.run('INSERT INTO profile (user_id, handle, github_login, bio, created_at) VALUES (?, ?, ?, ?, ?)', id, handle, github ?? null, '', NOW)
  if (balance !== undefined) db.run('INSERT INTO credit_balance (user_id, balance, updated_at) VALUES (?, ?, ?)', id, balance, NOW)
  return id
}

function addOrder(id: string, userId: string, status: 'pending' | 'paid' | 'cancelled', amount: number, createdAt: number, paidAt: number | null = null): void {
  db.run(
    'INSERT INTO credit_order (id, user_id, package_id, credits, amount, currency, status, provider, created_at, updated_at, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id,
    userId,
    'trial',
    amount * 10,
    amount,
    'CNY',
    status,
    'manual',
    createdAt,
    createdAt,
    paidAt,
  )
}

function addRepo(id: string, ownerId: string, visibility: 'public' | 'private', updatedAt: number): void {
  db.run('INSERT INTO repo (id, owner_id, slug, name, visibility, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', id, ownerId, id, id, visibility, 'empty', updatedAt, updatedAt)
}

function addStat(day: string, slug: string, event: string, count: number): void {
  db.run('INSERT INTO item_stat_daily (day, slug, event, count) VALUES (?, ?, ?, ?)', day, slug, event, count)
}

describe('toMillis', () => {
  it('reads ISO strings, millisecond numbers and digit strings alike', () => {
    expect(admin.toMillis('2026-11-09T04:00:00.000Z')).toBe(NOW)
    expect(admin.toMillis(NOW)).toBe(NOW)
    expect(admin.toMillis(String(NOW))).toBe(NOW)
    expect(admin.toMillis(`${NOW}.0`)).toBe(NOW)
    expect(admin.toMillis('not a date')).toBe(0)
    expect(admin.toMillis(null)).toBe(0)
  })
})

describe('adminTotals', () => {
  it('is all zeros on an empty site', () => {
    expect(admin.adminTotals()).toEqual({ users: 0, verifiedUsers: 0, publicRepos: 0, privateRepos: 0, credits: 0, revenue: 0, paidOrders: 0, pendingOrders: 0, unlocks: 0, apiKeys: 0 })
  })

  it('counts users, repos, credits, orders, unlocks and live API keys', () => {
    const ada = addUser({ id: 'ada', balance: 300 })
    const bob = addUser({ id: 'bob', verified: false, balance: 50 })
    addRepo('r1', ada, 'public', NOW)
    addRepo('r2', ada, 'private', NOW)
    addRepo('r3', bob, 'public', NOW)
    addOrder('o1', ada, 'paid', 990, NOW, NOW)
    addOrder('o2', ada, 'paid', 4900, NOW, NOW)
    addOrder('o3', bob, 'pending', 990, NOW)
    addOrder('o4', bob, 'cancelled', 990, NOW)
    db.run('INSERT INTO unlock (user_id, kind, target, credits, created_at) VALUES (?, ?, ?, ?, ?)', ada, 'item', 'border-beam', 20, NOW)
    db.run('INSERT INTO api_key (id, user_id, name, prefix, hash, created_at) VALUES (?, ?, ?, ?, ?, ?)', 'k1', ada, 'laptop', 'mk_abc', 'hash-1', NOW)
    db.run('INSERT INTO api_key (id, user_id, name, prefix, hash, created_at, revoked_at) VALUES (?, ?, ?, ?, ?, ?, ?)', 'k2', ada, 'old', 'mk_def', 'hash-2', NOW, NOW)

    expect(admin.adminTotals()).toEqual({ users: 2, verifiedUsers: 1, publicRepos: 2, privateRepos: 1, credits: 350, revenue: 5890, paidOrders: 2, pendingOrders: 1, unlocks: 1, apiKeys: 1 })
  })
})

describe('adminTrends', () => {
  it('returns one bucket per day, oldest first, ending today (Beijing time)', () => {
    const trends = admin.adminTrends(14, NOW)
    expect(trends.days).toHaveLength(14)
    expect(trends.days[0]).toBe('2026-10-27')
    expect(trends.days[13]).toBe('2026-11-09')
    expect(trends.newUsers).toEqual(Array(14).fill(0))
    expect(trends.revenue).toEqual(Array(14).fill(0))
    expect(trends.events[13]).toEqual({ view: 0, copy: 0, favorite: 0, take: 0, remix: 0 })
  })

  it('buckets sign-ups by Beijing day whether createdAt is an ISO string or a number', () => {
    addUser({ id: 'today' })
    // UTC 11 月 8 日 17:00 已经是北京时间 11 月 9 日 01:00。
    addUser({ id: 'early', createdAt: '2026-11-08T17:00:00.000Z' })
    // UTC 11 月 8 日 15:00 还是北京时间 11 月 8 日 23:00。
    addUser({ id: 'yesterday', createdAt: Date.parse('2026-11-08T15:00:00Z') })
    addUser({ id: 'first-day', createdAt: '2026-10-26T16:00:00.000Z' })
    // 窗口之外（北京时间 10 月 26 日 23:59）不算。
    addUser({ id: 'too-old', createdAt: '2026-10-26T15:59:00.000Z' })

    const { newUsers } = admin.adminTrends(14, NOW)
    expect(newUsers[13]).toBe(2)
    expect(newUsers[12]).toBe(1)
    expect(newUsers[0]).toBe(1)
    expect(newUsers.reduce((sum, value) => sum + value, 0)).toBe(4)
  })

  it('sums revenue by the day the payment was confirmed, paid orders only', () => {
    const ada = addUser({ id: 'ada' })
    addOrder('o1', ada, 'paid', 990, NOW - 5 * DAY, NOW)
    addOrder('o2', ada, 'paid', 4900, NOW - 5 * DAY, NOW - DAY)
    addOrder('o3', ada, 'paid', 100, NOW - 5 * DAY, NOW - DAY + HOUR)
    addOrder('o4', ada, 'pending', 7777, NOW)
    addOrder('o5', ada, 'paid', 5555, NOW - 40 * DAY, NOW - 30 * DAY)

    const { revenue } = admin.adminTrends(14, NOW)
    expect(revenue[13]).toBe(990)
    expect(revenue[12]).toBe(5000)
    expect(revenue.reduce((sum, value) => sum + value, 0)).toBe(5990)
  })

  it('adds up item events per day across items', () => {
    addStat('2026-11-09', 'border-beam', 'view', 5)
    addStat('2026-11-09', 'loader-dots', 'view', 2)
    addStat('2026-11-09', 'loader-dots', 'take', 1)
    addStat('2026-11-07', 'border-beam', 'favorite', -1)
    addStat('2026-10-01', 'border-beam', 'view', 99)
    addStat('2026-11-09', 'border-beam', 'unknown', 42)

    const { events } = admin.adminTrends(14, NOW)
    expect(events[13]).toEqual({ view: 7, copy: 0, favorite: 0, take: 1, remix: 0 })
    expect(events[11]!.favorite).toBe(-1)
    expect(events.reduce((sum, counts) => sum + counts.view, 0)).toBe(7)
  })
})

describe('searchUsers', () => {
  beforeEach(() => {
    addUser({ id: 'u-ada', name: 'Ada Lovelace', email: 'ada@example.com', handle: 'ada', github: 'ada-gh', balance: 120, createdAt: '2026-11-01T00:00:00.000Z' })
    addUser({ id: 'u-bob', name: '小明', email: 'bob_1@test.dev', verified: false, handle: 'bob', createdAt: '2026-11-03T00:00:00.000Z' })
    // 数字写法的注册时间排序时也要落在正确的位置（直接比较的话数字会排在所有字符串前面）。
    addUser({ id: 'u-cat', name: 'Cat', email: 'cat@example.com', createdAt: Date.parse('2026-11-02T00:00:00Z') })
  })

  it('lists everyone, newest first, with handle and balance', () => {
    const result = admin.searchUsers()
    expect(result.total).toBe(3)
    expect(result.rows.map((row) => row.id)).toEqual(['u-bob', 'u-cat', 'u-ada'])
    expect(result.rows[2]).toMatchObject({ handle: 'ada', githubLogin: 'ada-gh', balance: 120, emailVerified: 1 })
    expect(result.rows[1]).toMatchObject({ handle: null, githubLogin: null, balance: 0 })
  })

  it('matches email, name, handle and GitHub login, ignoring case and a leading @', () => {
    const ids = (q: string) => admin.searchUsers({ q }).rows.map((row) => row.id)
    expect(ids('EXAMPLE.com')).toEqual(['u-cat', 'u-ada'])
    expect(ids('lovelace')).toEqual(['u-ada'])
    expect(ids('小明')).toEqual(['u-bob'])
    expect(ids('@bob')).toEqual(['u-bob'])
    expect(ids('ada-gh')).toEqual(['u-ada'])
    expect(ids('u-cat')).toEqual(['u-cat'])
    expect(ids('nobody')).toEqual([])
  })

  it('treats % and _ in the query literally', () => {
    expect(admin.searchUsers({ q: 'bob_1' }).total).toBe(1)
    expect(admin.searchUsers({ q: 'a_a' }).total).toBe(0)
    expect(admin.searchUsers({ q: '%' }).total).toBe(0)
  })

  it('pages through results and clamps a page past the end', () => {
    const first = admin.searchUsers({ pageSize: 2 })
    expect(first).toMatchObject({ total: 3, page: 1, pageCount: 2 })
    expect(first.rows.map((row) => row.id)).toEqual(['u-bob', 'u-cat'])
    const last = admin.searchUsers({ page: 9, pageSize: 2 })
    expect(last.page).toBe(2)
    expect(last.rows.map((row) => row.id)).toEqual(['u-ada'])
    expect(admin.searchUsers({ q: 'nobody', page: 3 })).toMatchObject({ total: 0, page: 1, pageCount: 1, rows: [] })
  })

  it('finds one user by id', () => {
    expect(admin.adminUser('u-ada')).toMatchObject({ email: 'ada@example.com', handle: 'ada', balance: 120 })
    expect(admin.adminUser('missing')).toBeUndefined()
  })
})

describe('apiKeysOfUser', () => {
  it('lists live and revoked keys without the hash or the prefix', () => {
    const ada = addUser({ id: 'ada' })
    const bob = addUser({ id: 'bob' })
    db.run('INSERT INTO api_key (id, user_id, name, prefix, hash, created_at, last_used_at) VALUES (?, ?, ?, ?, ?, ?, ?)', 'k1', ada, 'laptop', 'mk_abc', 'hash-1', NOW - DAY, NOW)
    db.run('INSERT INTO api_key (id, user_id, name, prefix, hash, created_at, revoked_at) VALUES (?, ?, ?, ?, ?, ?, ?)', 'k2', ada, 'old', 'mk_def', 'hash-2', NOW - 2 * DAY, NOW)
    db.run('INSERT INTO api_key (id, user_id, name, prefix, hash, created_at) VALUES (?, ?, ?, ?, ?, ?)', 'k3', bob, 'other', 'mk_ghi', 'hash-3', NOW)

    const keys = admin.apiKeysOfUser(ada)
    expect(keys).toEqual([
      { id: 'k1', name: 'laptop', created_at: NOW - DAY, last_used_at: NOW, revoked_at: null },
      { id: 'k2', name: 'old', created_at: NOW - 2 * DAY, last_used_at: null, revoked_at: NOW },
    ])
    expect(JSON.stringify(keys)).not.toMatch(/hash|mk_/)
  })
})

describe('credit orders', () => {
  beforeEach(() => {
    const ada = addUser({ id: 'ada' })
    const bob = addUser({ id: 'bob' })
    addOrder('o1', ada, 'paid', 990, NOW - 3 * DAY, NOW - 3 * DAY)
    addOrder('o2', bob, 'pending', 4900, NOW - 2 * DAY)
    addOrder('o3', ada, 'cancelled', 990, NOW - DAY)
    addOrder('o4', bob, 'pending', 990, NOW)
  })

  it('lists orders newest first with the buyer email', () => {
    const result = admin.creditOrdersPage()
    expect(result.total).toBe(4)
    expect(result.rows.map((row) => row.id)).toEqual(['o4', 'o3', 'o2', 'o1'])
    expect(result.rows[0]).toMatchObject({ email: 'bob@example.com', status: 'pending', amount: 990 })
  })

  it('filters by status and pages', () => {
    expect(admin.creditOrdersPage({ status: 'pending' }).rows.map((row) => row.id)).toEqual(['o4', 'o2'])
    expect(admin.creditOrdersPage({ status: 'paid' }).rows.map((row) => row.id)).toEqual(['o1'])
    const second = admin.creditOrdersPage({ status: 'all', page: 2, pageSize: 3 })
    expect(second).toMatchObject({ total: 4, page: 2, pageCount: 2 })
    expect(second.rows.map((row) => row.id)).toEqual(['o1'])
  })

  it('counts orders per status', () => {
    expect(admin.creditOrderCounts()).toEqual({ all: 4, pending: 2, paid: 1, cancelled: 1 })
  })

  it('maps user ids to emails', () => {
    expect(admin.emailsById(['ada', 'missing'])).toEqual(new Map([['ada', 'ada@example.com']]))
    expect(admin.emailsById([])).toEqual(new Map())
  })
})

describe('topItems', () => {
  beforeEach(() => {
    addStat('2026-11-09', 'border-beam', 'view', 10)
    addStat('2026-11-05', 'border-beam', 'view', 5)
    addStat('2026-11-09', 'border-beam', 'take', 1)
    addStat('2026-11-08', 'loader-dots', 'view', 12)
    addStat('2026-11-08', 'loader-dots', 'take', 4)
    // 八天前：7 天的窗口看不到，30 天的看得到。
    addStat('2026-11-01', 'mesh-gradient', 'view', 100)
    addStat('2026-11-09', 'gone-item', 'copy', 3)
  })

  it('ranks by the chosen event inside the window and carries the other counts', () => {
    const week = admin.topItems({ event: 'view', days: 7, now: NOW })
    expect(week.map((item) => item.slug)).toEqual(['border-beam', 'loader-dots'])
    expect(week[0]!.counts).toEqual({ view: 15, copy: 0, favorite: 0, take: 1, remix: 0 })

    const month = admin.topItems({ event: 'view', days: 30, now: NOW })
    expect(month.map((item) => item.slug)).toEqual(['mesh-gradient', 'border-beam', 'loader-dots'])
  })

  it('leaves out items with nothing for that event and honours the limit', () => {
    expect(admin.topItems({ event: 'take', days: 7, now: NOW }).map((item) => item.slug)).toEqual(['loader-dots', 'border-beam'])
    expect(admin.topItems({ event: 'copy', days: 7, now: NOW }).map((item) => item.slug)).toEqual(['gone-item'])
    expect(admin.topItems({ event: 'remix', days: 30, now: NOW })).toEqual([])
    expect(admin.topItems({ event: 'view', days: 30, limit: 1, now: NOW })).toHaveLength(1)
  })
})

describe('repo moderation', () => {
  it('lists public repos by latest change and hides one without touching the rest', () => {
    const ada = addUser({ id: 'ada', handle: 'ada' })
    const bob = addUser({ id: 'bob' })
    addRepo('r-old', ada, 'public', NOW - 2 * DAY)
    addRepo('r-new', bob, 'public', NOW - DAY)
    addRepo('r-private', ada, 'private', NOW)

    const listed = admin.latestPublicRepos()
    expect(listed.map((repo) => repo.id)).toEqual(['r-new', 'r-old'])
    expect(listed[0]).toMatchObject({ owner_id: 'bob', owner_handle: null, owner_email: 'bob@example.com' })
    expect(listed[1]).toMatchObject({ owner_handle: 'ada' })
    expect(admin.latestPublicRepos(1)).toHaveLength(1)

    expect(admin.hideRepo('r-new')).toEqual({ id: 'r-new', changed: true })
    expect(admin.latestPublicRepos().map((repo) => repo.id)).toEqual(['r-old'])
    expect(db.one<{ visibility: string }>('SELECT visibility FROM repo WHERE id = ?', 'r-new')!.visibility).toBe('private')
    // 文件和别的仓库都不动。
    expect(db.one<{ n: number }>('SELECT COUNT(*) AS n FROM repo')!.n).toBe(3)
  })

  it('is a no-op on a repo that is already private and reports a missing one', () => {
    const ada = addUser({ id: 'ada' })
    addRepo('r-private', ada, 'private', NOW - DAY)
    expect(admin.hideRepo('r-private')).toEqual({ id: 'r-private', changed: false })
    expect(db.one<{ updated_at: number }>('SELECT updated_at FROM repo WHERE id = ?', 'r-private')!.updated_at).toBe(NOW - DAY)
    expect(admin.hideRepo('missing')).toBeUndefined()
  })

  it('marks a hidden repo as taken down, keeps its last-change time, and restores it', () => {
    const ada = addUser({ id: 'ada', handle: 'ada' })
    addRepo('r-1', ada, 'public', NOW - DAY)
    // 主人自己设成私有的不算下架。
    addRepo('r-own', ada, 'private', NOW)

    admin.hideRepo('r-1')
    const row = db.one<{ visibility: string; taken_down_at: number | null; updated_at: number }>('SELECT visibility, taken_down_at, updated_at FROM repo WHERE id = ?', 'r-1')!
    expect(row.visibility).toBe('private')
    expect(row.taken_down_at).toBeTypeOf('number')
    expect(row.updated_at).toBe(NOW - DAY)
    expect(admin.takenDownRepos().map((repo) => repo.id)).toEqual(['r-1'])

    expect(admin.restoreRepo('r-1')).toEqual({ id: 'r-1', changed: true })
    expect(admin.takenDownRepos()).toEqual([])
    expect(admin.latestPublicRepos().map((repo) => repo.id)).toEqual(['r-1'])

    // 「恢复」只撤销下架，不能把主人自己设成私有的仓库公开出去。
    expect(admin.restoreRepo('r-own')).toEqual({ id: 'r-own', changed: false })
    expect(db.one<{ visibility: string }>('SELECT visibility FROM repo WHERE id = ?', 'r-own')!.visibility).toBe('private')
    expect(admin.restoreRepo('missing')).toBeUndefined()
  })

  it('keeps a taken-down repo private: the owner cannot republish or fork it', () => {
    const ada = addUser({ id: 'ada', handle: 'ada' })
    addRepo('r-1', ada, 'public', NOW - DAY)
    admin.hideRepo('r-1')

    expect(() => repos.updateRepo(repos.repoById('r-1')!, { visibility: 'public' })).toThrow(/took this repository down/)
    // 别的设置照常能改。
    expect(repos.updateRepo(repos.repoById('r-1')!, { description: 'still mine' })).toMatchObject({ description: 'still mine', visibility: 'private' })
    expect(() => repos.forkRepo(repos.repoById('r-1')!, ada)).toThrow(/took this repository down/)

    admin.restoreRepo('r-1')
    expect(repos.updateRepo(repos.repoById('r-1')!, { visibility: 'private' }).visibility).toBe('private')
    expect(repos.updateRepo(repos.repoById('r-1')!, { visibility: 'public' }).visibility).toBe('public')
  })

  it('shows a taken-down repo to its owner and to moderators only', () => {
    const ada = addUser({ id: 'ada', handle: 'ada' })
    addRepo('r-1', ada, 'public', NOW - DAY)
    addRepo('r-own', ada, 'private', NOW)
    admin.hideRepo('r-1')

    expect(repos.visibleRepo('ada', 'r-1', null)).toBeUndefined()
    expect(repos.visibleRepo('ada', 'r-1', 'bob')).toBeUndefined()
    expect(repos.visibleRepo('ada', 'r-1', ada)?.id).toBe('r-1')
    expect(repos.visibleRepo('ada', 'r-1', 'bob', true)?.id).toBe('r-1')
    // 主人自己设成私有的，管理员一样看不到。
    expect(repos.visibleRepo('ada', 'r-own', 'bob', true)).toBeUndefined()
  })
})

describe('system health numbers', () => {
  it('reports the size of the database', () => {
    expect(admin.databaseBytes()).toBeGreaterThan(0)
  })

  it('counts admin emails without duplicates, blanks or case differences', () => {
    const before = process.env.MOTIF_ADMIN_EMAILS
    try {
      delete process.env.MOTIF_ADMIN_EMAILS
      expect(admin.adminEmailCount()).toBe(0)
      process.env.MOTIF_ADMIN_EMAILS = ' Ada@example.com, ada@example.com ,, grace@example.com '
      expect(admin.adminEmailCount()).toBe(2)
    } finally {
      // 别的用例不看这个变量，但环境变量是进程级的，用完放回原样。
      if (before === undefined) delete process.env.MOTIF_ADMIN_EMAILS
      else process.env.MOTIF_ADMIN_EMAILS = before
    }
  })
})

describe('listOrders (agent store)', () => {
  const order = (id: string, createdAt: number, status: 'queued' | 'delivered' | 'failed', kind: 'item' | 'custom' = 'item') => ({
    id: `ord_${id.padEnd(22, '0')}`,
    createdAt,
    updatedAt: createdAt,
    kind,
    buyer: 'test-agent',
    price: { usdc: '0', motif: '0', free: true },
    status,
  })

  it('is empty before any order exists', async () => {
    expect(await store.listOrders()).toEqual({ orders: [], total: 0, counts: { awaiting_payment: 0, queued: 0, in_progress: 0, delivered: 0, failed: 0 } })
  })

  it('returns the newest orders first, bounded, with totals per status', async () => {
    await store.saveOrder(order('a', NOW - 2 * DAY, 'delivered'))
    await store.saveOrder({ ...order('b', NOW, 'queued', 'custom'), brief: 'a pricing table' })
    await store.saveOrder(order('c', NOW - DAY, 'failed'))

    const all = await store.listOrders()
    expect(all.total).toBe(3)
    expect(all.orders.map((entry) => entry.status)).toEqual(['queued', 'failed', 'delivered'])
    expect(all.orders[0]).toMatchObject({ kind: 'custom', brief: 'a pricing table' })
    expect(all.counts).toEqual({ awaiting_payment: 0, queued: 1, in_progress: 0, delivered: 1, failed: 1 })

    const bounded = await store.listOrders(2)
    expect(bounded.orders).toHaveLength(2)
    expect(bounded.total).toBe(3)
  })
})
