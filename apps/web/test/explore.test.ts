import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// 每次运行一个新的数据库文件；要在导入 lib/db 之前设好路径。
const dir = mkdtempSync(path.join(tmpdir(), 'motif-explore-'))
process.env.MOTIF_DB_PATH = path.join(dir, 'test.sqlite')

const db = await import('../src/lib/db')
const profile = await import('../src/lib/accounts/profile')
const repos = await import('../src/lib/repos/repos')
const explore = await import('../src/lib/repos/explore')
const { dayOffset, statDay } = await import('../src/lib/stats/record')

type RepoWithOwner = ReturnType<typeof repos.createRepo>

const FILES = { 'index.tsx': 'export default function Demo() { return null }\n' }
const NOW = Date.UTC(2026, 10, 9, 4)

/** 建一个有资料的用户，返回 id；handle 取邮箱的 @ 前面那一段。 */
function newUser(handle: string, name: string, bio = ''): string {
  const id = `user-${handle}`
  db.run('INSERT INTO "user" (id, name, email, createdAt) VALUES (?, ?, ?, ?)', id, name, `${handle}@example.com`, new Date(NOW).toISOString())
  expect(profile.ensureProfile({ id, email: `${handle}@example.com`, name }).handle).toBe(handle)
  if (bio) db.run('UPDATE profile SET bio = ? WHERE user_id = ?', bio, id)
  return id
}

/** 建仓库走真实的 createRepo；更新时间单独写死，排序才不取决于测试跑得多快。 */
function newRepo(ownerId: string, name: string, minutes: number, extra: { description?: string; visibility?: 'public' | 'private'; files?: Record<string, string> } = {}): RepoWithOwner {
  const repo = repos.createRepo({ ownerId, name, source: 'empty', files: FILES, ...extra })
  at(repo, minutes)
  return repo
}

function at(repo: { id: string }, minutes: number): void {
  db.run('UPDATE repo SET updated_at = ? WHERE id = ?', NOW + minutes * 60_000, repo.id)
}

const names = (rows: RepoWithOwner[]): string[] => rows.map((repo) => `${repo.owner_handle}/${repo.name}`)

let ada = ''
let grace = ''
let linus = ''

beforeAll(() => {
  // Better Auth 的 user 表由它自己的迁移建；测试里建一个够用的。
  db.db().exec(`CREATE TABLE "user" (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, emailVerified INTEGER NOT NULL DEFAULT 0, image TEXT, createdAt TEXT, updatedAt TEXT, githubLogin TEXT)`)
  db.migrateOwnTables()
})

afterAll(() => {
  db.db().close()
  rmSync(dir, { recursive: true, force: true })
})

describe('an empty site', () => {
  it('has zero counts and one empty page everywhere', () => {
    expect(explore.communityStats()).toEqual({ creators: 0, repos: 0, forks: 0 })
    expect(explore.explorePublicRepos()).toEqual({ rows: [], total: 0, page: 1, pages: 1, pageSize: explore.EXPLORE_PAGE_SIZE })
    expect(explore.explorePublicRepos({ q: 'anything', page: 9 })).toMatchObject({ rows: [], total: 0, page: 1, pages: 1 })
    expect(explore.listCreators()).toEqual({ rows: [], total: 0, page: 1, pages: 1, pageSize: explore.CREATORS_PAGE_SIZE })
    expect(explore.topCreators()).toEqual([])
    expect(explore.weeklyUses(NOW)).toBe(0)
  })
})

describe('query string parsing', () => {
  it('falls back to defaults for missing or broken values', () => {
    expect(explore.parseExploreQuery({})).toEqual({ q: '', sort: 'recent', page: 1 })
    expect(explore.parseExploreQuery({ q: '  glow   border ', sort: 'forks', page: '3' })).toEqual({ q: 'glow border', sort: 'forks', page: 3 })
    expect(explore.parseExploreQuery({ q: ['first', 'second'], sort: 'stars; DROP TABLE repo', page: ['2', '9'] })).toEqual({ q: 'first', sort: 'recent', page: 2 })
    expect(explore.parseExploreQuery({ q: 'x'.repeat(500) }).q).toHaveLength(explore.SEARCH_MAX)
  })

  it('only accepts positive whole page numbers', () => {
    for (const raw of ['0', '-1', '1.5', '1e3', 'abc', '', ' 2', '99999999999999999999', undefined]) expect(explore.parsePage(raw)).toBe(1)
    expect(explore.parsePage('12')).toBe(12)
    expect(explore.parsePage(['7', '8'])).toBe(7)
  })

  it('splits a search into at most five terms and drops a leading @', () => {
    expect(explore.searchTerms('  @ada   border-beam ')).toEqual(['ada', 'border-beam'])
    expect(explore.searchTerms('@ @@')).toEqual([])
    expect(explore.searchTerms('a b c d e f g')).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('escapes LIKE wildcards and the escape character itself', () => {
    expect(explore.escapeLike('100%_done\\')).toBe('100\\%\\_done\\\\')
    expect(explore.escapeLike('plain-text')).toBe('plain-text')
  })
})

describe('public repositories', () => {
  beforeAll(() => {
    ada = newUser('ada', 'Ada Lovelace', 'Borders and glows.')
    grace = newUser('grace', 'Grace Hopper')
    linus = newUser('linus', 'Linus')

    const beam = newRepo(ada, 'border-beam', 10, { description: 'A glowing border that travels around a card' })
    newRepo(ada, 'secret-plans', 60, { description: 'glowing but private', visibility: 'private' })
    // 公开但没有文件：点进去没有东西可看，哪里都不该出现。
    newRepo(ada, 'empty-shell', 70, { description: 'glowing but empty', files: {} })

    newRepo(grace, 'snake_case-utils', 20, { description: '100% typed helpers' })
    newRepo(grace, 'snakeXcase', 30, { description: 'Plain helpers, 100x faster' })
    newRepo(grace, 'Aurora', 40, { description: '极光背景，WebGL 着色器' })

    // Linus fork 了两次：ada/border-beam 的 fork_count 变成 2，他自己名下多两个公开仓库。
    at(repos.forkRepo(beam, linus), 50)
    at(repos.forkRepo(repos.repoById(beam.id)!, linus), 55)
    // fork 会改来源仓库的计数，但不该把它顶到「最近更新」的最前面。
    at(beam, 10)
  })

  it('lists public repositories with files, newest first', () => {
    const result = explore.explorePublicRepos()
    expect(names(result.rows)).toEqual(['linus/border-beam-2', 'linus/border-beam', 'grace/Aurora', 'grace/snakeXcase', 'grace/snake_case-utils', 'ada/border-beam'])
    expect(result).toMatchObject({ total: 6, page: 1, pages: 1 })
    // 和首页「最新仓库」是同一批。
    expect(names(repos.recentPublicRepos(3))).toEqual(names(result.rows).slice(0, 3))
  })

  it('sorts by forks, then by recency', () => {
    expect(names(explore.explorePublicRepos({ sort: 'forks' }).rows)).toEqual(['ada/border-beam', 'linus/border-beam-2', 'linus/border-beam', 'grace/Aurora', 'grace/snakeXcase', 'grace/snake_case-utils'])
  })

  it('searches name, description and owner handle', () => {
    const search = (q: string) => names(explore.explorePublicRepos({ q }).rows)
    expect(search('aurora')).toEqual(['grace/Aurora'])
    expect(search('着色器')).toEqual(['grace/Aurora'])
    expect(search('TRAVELS')).toEqual(['linus/border-beam-2', 'linus/border-beam', 'ada/border-beam'])
    expect(search('grace')).toEqual(['grace/Aurora', 'grace/snakeXcase', 'grace/snake_case-utils'])
    expect(search('@linus')).toEqual(['linus/border-beam-2', 'linus/border-beam'])
    expect(search('ada/border')).toEqual(['ada/border-beam'])
    // 每个词都要命中。
    expect(search('grace helpers')).toEqual(['grace/snakeXcase', 'grace/snake_case-utils'])
    expect(search('grace border')).toEqual([])
  })

  it('never returns private or empty repositories', () => {
    const search = (q: string) => names(explore.explorePublicRepos({ q }).rows)
    expect(search('glowing')).toEqual(['linus/border-beam-2', 'linus/border-beam', 'ada/border-beam'])
    expect(search('secret')).toEqual([])
    expect(search('empty-shell')).toEqual([])
  })

  it('treats % and _ in a search as plain characters', () => {
    const search = (q: string) => names(explore.explorePublicRepos({ q }).rows)
    expect(search('snake_case')).toEqual(['grace/snake_case-utils'])
    expect(search('100%')).toEqual(['grace/snake_case-utils'])
    expect(search('%')).toEqual(['grace/snake_case-utils'])
    expect(search('_')).toEqual(['grace/snake_case-utils'])
    expect(search('\\')).toEqual([])
    expect(search("' OR 1=1 --")).toEqual([])
  })

  it('pages through results and pulls out-of-range pages back in', () => {
    const page = (number: number, pageSize = 4) => explore.explorePublicRepos({ page: number, pageSize })
    expect(page(1)).toMatchObject({ total: 6, page: 1, pages: 2, pageSize: 4 })
    expect(names(page(1).rows)).toEqual(['linus/border-beam-2', 'linus/border-beam', 'grace/Aurora', 'grace/snakeXcase'])
    expect(names(page(2).rows)).toEqual(['grace/snake_case-utils', 'ada/border-beam'])
    expect(page(99)).toMatchObject({ page: 2, pages: 2 })
    expect(names(page(99).rows)).toEqual(names(page(2).rows))
    for (const broken of [0, -3, Number.NaN, Number.POSITIVE_INFINITY, 1.9]) expect(page(broken).page).toBe(1)
    // 搜索结果按自己的总数分页。
    expect(explore.explorePublicRepos({ q: 'grace', page: 2, pageSize: 2 })).toMatchObject({ total: 3, page: 2, pages: 2 })
  })

  it('bounds the page size', () => {
    expect(explore.explorePublicRepos({ pageSize: 1_000_000 }).pageSize).toBeLessThanOrEqual(60)
    expect(explore.explorePublicRepos({ pageSize: 0 })).toMatchObject({ pageSize: 1, pages: 6 })
    expect(explore.explorePublicRepos({ pageSize: -5 }).rows).toHaveLength(1)
    expect(explore.explorePublicRepos({ pageSize: Number.NaN }).pageSize).toBe(explore.EXPLORE_PAGE_SIZE)
  })
})

describe('creators', () => {
  it('counts what the hub shows', () => {
    expect(explore.communityStats()).toEqual({ creators: 3, repos: 6, forks: 2 })
  })

  it('ranks by forks received, then by public repositories', () => {
    const creators = explore.topCreators()
    expect(creators.map((creator) => [creator.rank, creator.handle, creator.repos, creator.forks])).toEqual([
      [1, 'ada', 1, 2],
      [2, 'grace', 3, 0],
      [3, 'linus', 2, 0],
    ])
    expect(creators[0]).toMatchObject({ id: ada, name: 'Ada Lovelace', bio: 'Borders and glows.', top: [{ slug: 'border-beam', name: 'border-beam' }] })
    // 私有的和空的仓库不出现在卡片上；名字保留大小写，slug 是小写。
    expect(creators[1]!.top).toEqual([
      { slug: 'aurora', name: 'Aurora' },
      { slug: 'snakexcase', name: 'snakeXcase' },
      { slug: 'snake_case-utils', name: 'snake_case-utils' },
    ])
    expect(creators[1]!.activeAt).toBe(NOW + 40 * 60_000)
    expect(explore.topCreators(2).map((creator) => creator.handle)).toEqual(['ada', 'grace'])
    expect(explore.topCreators(1_000_000)).toHaveLength(3)
  })

  it('lists at most three repositories per creator, most forked first', () => {
    const extra = newRepo(grace, 'fourth', 5, { description: 'old but popular' })
    repos.forkRepo(extra, linus)
    const row = explore.topCreators().find((creator) => creator.handle === 'grace')!
    expect(row).toMatchObject({ repos: 4, forks: 1 })
    expect(row.top.map((repo) => repo.name)).toEqual(['fourth', 'Aurora', 'snakeXcase'])
  })

  it('pages the directory with continuous ranks', () => {
    const firstPage = explore.listCreators({ page: 1, pageSize: 2 })
    expect(firstPage).toMatchObject({ total: 3, page: 1, pages: 2, pageSize: 2 })
    expect(firstPage.rows.map((creator) => [creator.rank, creator.handle])).toEqual([
      [1, 'ada'],
      [2, 'grace'],
    ])
    const lastPage = explore.listCreators({ page: 50, pageSize: 2 })
    expect(lastPage).toMatchObject({ page: 2, pages: 2 })
    expect(lastPage.rows.map((creator) => [creator.rank, creator.handle])).toEqual([[3, 'linus']])
  })

  it('drops a creator whose last public repository goes private', () => {
    const only = repos.reposOf(ada, false).find((repo) => repo.slug === 'border-beam')!
    repos.updateRepo(only, { visibility: 'private' })
    expect(explore.topCreators().map((creator) => creator.handle)).toEqual(['grace', 'linus'])
    expect(explore.communityStats()).toMatchObject({ creators: 2 })
    expect(explore.explorePublicRepos({ q: 'ada/' }).total).toBe(0)
    repos.updateRepo(repos.repoById(only.id)!, { visibility: 'public' })
    expect(explore.communityStats()).toMatchObject({ creators: 3 })
  })
})

describe('weekly uses', () => {
  it('adds up copies, takes and remixes of the last seven stat days', () => {
    const today = statDay(NOW)
    const record = (day: string, slug: string, event: string, count: number) => db.run('INSERT INTO item_stat_daily (day, slug, event, count) VALUES (?, ?, ?, ?)', day, slug, event, count)
    record(today, 'border-beam', 'copy', 3)
    record(today, 'border-beam', 'take', 2)
    record(today, 'aurora', 'remix', 1)
    // 浏览和收藏不算「用」。
    record(today, 'border-beam', 'view', 40)
    record(today, 'border-beam', 'favorite', 7)
    record(dayOffset(today, -6), 'aurora', 'take', 5)
    // 第 8 天之前的不在「本周」里。
    record(dayOffset(today, -7), 'aurora', 'take', 100)
    expect(explore.weeklyUses(NOW)).toBe(11)
  })
})
