import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

/*
 * 排行榜的统计（docs/decisions/0010）：去重、收藏的正负、榜单的次序和名次变化。
 * 数据库用临时文件，先设环境变量再动态导入（模块在导入时读 MOTIF_DB_PATH）。
 */

const dir = mkdtempSync(path.join(tmpdir(), 'motif-stats-'))
process.env.MOTIF_DB_PATH = path.join(dir, 'test.sqlite')

const db = await import('../src/lib/db')
const record = await import('../src/lib/stats/record')
const ranking = await import('../src/lib/stats/ranking')
const events = await import('../src/lib/stats/events')

beforeAll(() => {
  db.db().exec(`CREATE TABLE "user" (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, emailVerified INTEGER NOT NULL DEFAULT 0, image TEXT, createdAt TEXT, updatedAt TEXT, githubLogin TEXT)`)
  db.migrateOwnTables()
})

afterAll(() => {
  db.db().close()
  rmSync(dir, { recursive: true, force: true })
})

beforeEach(() => {
  db.run('DELETE FROM item_stat_daily')
  db.run('DELETE FROM item_stat_seen')
})

// 固定的「现在」：北京时间 2026-11-20 中午。
const NOW = Date.parse('2026-11-20T04:00:00Z')
const TODAY = record.statDay(NOW)

function request(ip: string, agent = 'Mozilla/5.0') {
  return new Request('https://motifne.net/api/stats', { headers: { 'x-forwarded-for': ip, 'user-agent': agent } })
}

/** 往表里直接放某天的计数（测试榜单时不用一次次 record）。 */
function seed(day: string, slug: string, event: string, count: number) {
  db.run('INSERT INTO item_stat_daily (day, slug, event, count) VALUES (?, ?, ?, ?)', day, slug, event, count)
}

describe('stat days', () => {
  it('cuts days at midnight Beijing time', () => {
    expect(record.statDay(Date.parse('2026-11-19T15:59:00Z'))).toBe('2026-11-19')
    expect(record.statDay(Date.parse('2026-11-19T16:00:00Z'))).toBe('2026-11-20')
  })

  it('counts days across month ends', () => {
    expect(record.dayOffset('2026-12-01', -1)).toBe('2026-11-30')
    expect(record.dayOffset('2026-11-30', 2)).toBe('2026-12-02')
  })
})

describe('recording', () => {
  it('counts a visitor once per item, action and day', () => {
    process.env.MOTIF_TRUSTED_PROXY_HOPS = '1'
    const visitor = record.visitorOf(request('203.0.113.7'), TODAY)!
    expect(record.recordStat({ slug: 'globe', event: 'view', visitor, day: TODAY })).toBe(true)
    expect(record.recordStat({ slug: 'globe', event: 'view', visitor, day: TODAY })).toBe(false)
    // 另一个条目、另一种动作、另一个访客都单独算。
    expect(record.recordStat({ slug: 'dock', event: 'view', visitor, day: TODAY })).toBe(true)
    expect(record.recordStat({ slug: 'globe', event: 'copy', visitor, day: TODAY })).toBe(true)
    const other = record.visitorOf(request('198.51.100.2'), TODAY)!
    expect(record.recordStat({ slug: 'globe', event: 'view', visitor: other, day: TODAY })).toBe(true)
    const rows = db.all<{ slug: string; event: string; count: number }>('SELECT slug, event, count FROM item_stat_daily ORDER BY slug, event')
    expect(rows).toEqual([
      { slug: 'dock', event: 'view', count: 1 },
      { slug: 'globe', event: 'copy', count: 1 },
      { slug: 'globe', event: 'view', count: 2 },
    ])
  })

  it('records an unfavorite as minus one, each direction once a day', () => {
    const visitor = record.visitorOfUser('u1', TODAY)
    record.recordStat({ slug: 'globe', event: 'favorite', visitor, day: TODAY })
    record.recordStat({ slug: 'globe', event: 'favorite', visitor, delta: -1, day: TODAY })
    record.recordStat({ slug: 'globe', event: 'favorite', visitor, delta: -1, day: TODAY })
    expect(db.one<{ count: number }>("SELECT count FROM item_stat_daily WHERE slug = 'globe' AND event = 'favorite'")!.count).toBe(0)
  })

  it('counts at most a few browsers from the same address', () => {
    process.env.MOTIF_TRUSTED_PROXY_HOPS = '1'
    const counted = Array.from({ length: record.MAX_VISITORS_PER_SOURCE + 2 }, (_, i) => {
      const visitor = record.visitorOf(request('203.0.113.9', `Mozilla/5.0 (variant ${i})`), TODAY)!
      return record.recordStat({ slug: 'globe', event: 'view', visitor, day: TODAY })
    })
    expect(counted.filter(Boolean)).toHaveLength(record.MAX_VISITORS_PER_SOURCE)
    // 另一个地址不受影响。
    expect(record.recordStat({ slug: 'globe', event: 'view', visitor: record.visitorOf(request('198.51.100.20'), TODAY)!, day: TODAY })).toBe(true)
  })

  it('ignores crawlers and changes the visitor every day', () => {
    expect(record.visitorOf(request('203.0.113.7', 'Googlebot/2.1'), TODAY)).toBeNull()
    const today = record.visitorOf(request('203.0.113.7'), TODAY)
    const tomorrow = record.visitorOf(request('203.0.113.7'), record.dayOffset(TODAY, 1))
    expect(today).not.toBe(tomorrow)
    expect(today).not.toContain('203.0.113.7')
  })
})

describe('ranking', () => {
  it('orders by score and leaves out items without any', () => {
    seed(TODAY, 'globe', 'view', 10) // 10
    seed(TODAY, 'dock', 'take', 2) // 12
    seed(TODAY, 'dock', 'view', 1) // 13
    seed(TODAY, 'marquee', 'favorite', -1) // 收藏净值为负不算分
    const board = ranking.rankItems({ period: '7d', board: 'score', now: NOW })
    expect(board.map((entry) => [entry.slug, entry.rank, entry.value])).toEqual([
      ['dock', 1, 13],
      ['globe', 2, 10],
    ])
    expect(events.scoreOf(board[0]!.counts)).toBe(13)
  })

  it('only counts the chosen period and compares with the one before', () => {
    seed(TODAY, 'globe', 'view', 5)
    seed(record.dayOffset(TODAY, -6), 'dock', 'view', 3) // 本周的第一天
    seed(record.dayOffset(TODAY, -7), 'dock', 'view', 50) // 上周
    seed(record.dayOffset(TODAY, -8), 'globe', 'view', 40) // 上周
    seed(record.dayOffset(TODAY, -9), 'marquee', 'view', 60) // 上周，本周没有
    const week = ranking.rankItems({ period: '7d', board: 'score', now: NOW })
    expect(week.map((entry) => [entry.slug, entry.value, entry.previousRank])).toEqual([
      ['globe', 5, 3],
      ['dock', 3, 2],
    ])
    const all = ranking.rankItems({ period: 'all', board: 'score', now: NOW })
    expect(all.map((entry) => entry.slug)).toEqual(['marquee', 'dock', 'globe'])
    expect(all.every((entry) => entry.previousRank === null)).toBe(true)
  })

  it('ranks favorites and takes separately, filters and breaks ties stably', () => {
    seed(TODAY, 'globe', 'favorite', 3)
    seed(TODAY, 'dock', 'favorite', 3)
    seed(TODAY, 'marquee', 'take', 1)
    const order = ['dock', 'globe']
    const favorites = ranking.rankItems({ period: '30d', board: 'favorite', now: NOW, tieBreak: (a, b) => order.indexOf(a) - order.indexOf(b) })
    expect(favorites.map((entry) => entry.slug)).toEqual(['dock', 'globe'])
    expect(ranking.rankItems({ period: '30d', board: 'take', now: NOW }).map((entry) => entry.slug)).toEqual(['marquee'])
    expect(ranking.rankItems({ period: '30d', board: 'favorite', now: NOW, include: (slug) => slug !== 'dock' }).map((entry) => entry.slug)).toEqual(['globe'])
  })

  it('returns a daily series for the sparkline', () => {
    seed(TODAY, 'globe', 'view', 4)
    seed(record.dayOffset(TODAY, -2), 'globe', 'copy', 1)
    const [entry] = ranking.rankItems({ period: '7d', board: 'score', now: NOW })
    expect(entry!.series).toHaveLength(ranking.SERIES_DAYS)
    expect(entry!.series.at(-1)).toBe(4)
    expect(entry!.series.at(-3)).toBe(3)
    expect(ranking.weeklyRanks(undefined, NOW).get('globe')).toBe(1)
  })
})
