import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { strToU8, zipSync } from 'fflate'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

/*
 * 账号、积分、仓库（docs/decisions/0009）的纯逻辑。数据库用一个临时文件：
 * 模块在导入时读 MOTIF_DB_PATH，所以先设环境变量再动态导入。Better Auth 的 user 表这里手动建一个最小的。
 */

const dir = mkdtempSync(path.join(tmpdir(), 'motif-accounts-'))
process.env.MOTIF_DB_PATH = path.join(dir, 'test.sqlite')

const db = await import('../src/lib/db')
const ledger = await import('../src/lib/credits/ledger')
const pricing = await import('../src/lib/credits/pricing')
const profile = await import('../src/lib/accounts/profile')
const files = await import('../src/lib/repos/files')
const github = await import('../src/lib/repos/github')
const keys = await import('../src/lib/accounts/api-keys')

beforeAll(() => {
  db.db().exec(`CREATE TABLE "user" (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, emailVerified INTEGER NOT NULL DEFAULT 0, image TEXT, createdAt TEXT, updatedAt TEXT, githubLogin TEXT)`)
  db.migrateOwnTables()
})

afterAll(() => {
  db.db().close()
  rmSync(dir, { recursive: true, force: true })
})

let counter = 0
function newUser(name = 'Ada', email = `ada${++counter}@example.com`): string {
  const id = `u${++counter}`
  db.run('INSERT INTO "user" (id, name, email, createdAt) VALUES (?, ?, ?, ?)', id, name, email, new Date().toISOString())
  return id
}

/** 余额必须永远等于流水之和。 */
function assertConsistent(userId: string) {
  const sum = db.one<{ total: number | null }>('SELECT SUM(delta) AS total FROM credit_ledger WHERE user_id = ?', userId)!.total ?? 0
  expect(ledger.balanceOf(userId)).toBe(sum)
}

describe('credit ledger', () => {
  let user: string
  beforeEach(() => {
    user = newUser()
  })

  it('applies changes and keeps the balance equal to the ledger', () => {
    expect(ledger.applyCredit({ userId: user, delta: 200, kind: 'signup', ref: 'signup' }).balance).toBe(200)
    expect(ledger.applyCredit({ userId: user, delta: -30, kind: 'unlock-item', ref: 'globe' }).balance).toBe(170)
    assertConsistent(user)
  })

  it('records the same thing only once', () => {
    ledger.applyCredit({ userId: user, delta: 500, kind: 'purchase', ref: 'MO1' })
    const again = ledger.applyCredit({ userId: user, delta: 500, kind: 'purchase', ref: 'MO1' })
    expect(again.applied).toBe(false)
    expect(ledger.balanceOf(user)).toBe(500)
    // 没有 ref 的（管理员调整）可以记很多次。
    ledger.applyCredit({ userId: user, delta: 1, kind: 'admin' })
    ledger.applyCredit({ userId: user, delta: 1, kind: 'admin' })
    expect(ledger.balanceOf(user)).toBe(502)
    assertConsistent(user)
  })

  it('refuses to go negative unless an admin allows it', () => {
    ledger.applyCredit({ userId: user, delta: 5, kind: 'signup', ref: 'signup' })
    expect(() => ledger.applyCredit({ userId: user, delta: -10, kind: 'unlock-item', ref: 'x' })).toThrow(ledger.InsufficientCredits)
    expect(ledger.balanceOf(user)).toBe(5)
    expect(ledger.applyCredit({ userId: user, delta: -10, kind: 'admin', allowNegative: true }).balance).toBe(-5)
    assertConsistent(user)
  })

  it('unlocks once and never charges twice', () => {
    ledger.applyCredit({ userId: user, delta: 50, kind: 'signup', ref: 'signup' })
    expect(ledger.unlock(user, 'item', 'globe', 10)).toEqual({ charged: 10, balance: 40 })
    expect(ledger.unlock(user, 'item', 'globe', 10)).toEqual({ charged: 0, balance: 40 })
    expect(ledger.isUnlocked(user, 'item', 'globe')).toBe(true)
    // 条目和 Skill 是两回事。
    expect(ledger.isUnlocked(user, 'skill', 'globe')).toBe(false)
    expect(() => ledger.unlock(user, 'skill', 'motif-design', 100)).toThrow(ledger.InsufficientCredits)
    expect(ledger.isUnlocked(user, 'skill', 'motif-design')).toBe(false)
    assertConsistent(user)
  })

  it('charges usage on one ledger entry and stops at zero', () => {
    ledger.applyCredit({ userId: user, delta: 30, kind: 'signup', ref: 'signup' })
    expect(ledger.chargeUsage(user, 'studio', 'run1', 12)).toMatchObject({ charged: 12, balance: 18, exhausted: false })
    // 总额往上调：只扣差额。
    expect(ledger.chargeUsage(user, 'studio', 'run1', 20)).toMatchObject({ charged: 20, balance: 10, exhausted: false })
    // 余额不够：扣到 0，告诉调用方该停了。
    expect(ledger.chargeUsage(user, 'studio', 'run1', 45)).toMatchObject({ charged: 30, balance: 0, exhausted: true })
    expect(db.all('SELECT id FROM credit_ledger WHERE user_id = ? AND kind = ?', user, 'studio')).toHaveLength(1)
    assertConsistent(user)
  })
})

describe('credit pricing', () => {
  it('rounds token usage up once over the whole turn', () => {
    const costs = { ...pricing.creditCosts(), per1kInput: 1, per1kOutput: 5 }
    expect(pricing.tokenCost({ inputTokens: 0, outputTokens: 0 }, costs)).toBe(0)
    expect(pricing.tokenCost({ inputTokens: 1, outputTokens: 0 }, costs)).toBe(1)
    expect(pricing.tokenCost({ inputTokens: 50_000, outputTokens: 2_000 }, costs)).toBe(60)
  })

  it('formats yuan amounts', () => {
    expect(pricing.formatAmount(990)).toBe('¥9.9')
    expect(pricing.formatAmount(3900)).toBe('¥39')
    expect(pricing.formatAmount(1)).toBe('¥0.01')
  })

  it('has packages that give more credits per yuan as they grow', () => {
    const rates = pricing.PACKAGES.map((pack) => pack.credits / pack.amount)
    for (let i = 1; i < rates.length; i++) expect(rates[i]).toBeGreaterThan(rates[i - 1]!)
  })
})

describe('profile handles', () => {
  it('normalizes names into valid handles', () => {
    expect(profile.handleBase('Ada.Lovelace')).toBe('ada-lovelace')
    expect(profile.handleBase('  --Ada__  ')).toBe('ada')
    expect(profile.handleProblem(profile.handleBase('张三'))).toBeNull()
    expect(profile.handleProblem(profile.handleBase('admin'))).toBeNull()
    expect(profile.handleProblem('admin')).toBe('reserved')
    expect(profile.handleProblem('-bad')).toBe('format')
    expect(profile.handleProblem('ab')).toBe('format')
  })

  it('gives every user a unique handle', () => {
    const a = newUser('Grace', 'grace@example.com')
    const b = newUser('Grace', 'grace@example.org')
    const first = profile.ensureProfile({ id: a, email: 'grace@example.com', name: 'Grace' })
    const second = profile.ensureProfile({ id: b, email: 'grace@example.org', name: 'Grace' })
    expect(first.handle).toBe('grace')
    expect(second.handle).toBe('grace-2')
    // 再调一次不会建第二份。
    expect(profile.ensureProfile({ id: a, email: 'grace@example.com', name: 'Grace' }).handle).toBe('grace')
    expect(() => profile.updateProfile(b, { handle: 'grace' })).toThrow(/taken/)
    expect(profile.updateProfile(b, { handle: 'grace-hopper' }).handle).toBe('grace-hopper')
  })

  it('prefers the GitHub login', () => {
    const id = newUser('Linus', 'linus@example.com')
    expect(profile.ensureProfile({ id, email: 'linus@example.com', name: 'Linus', githubLogin: 'torvalds' }).handle).toBe('torvalds')
  })
})

describe('api keys', () => {
  it('only accepts live keys and stores no plaintext', () => {
    const user = newUser()
    const { key, view } = keys.createKey(user, 'laptop')
    expect(key.startsWith('mk_')).toBe(true)
    expect(db.one('SELECT 1 AS yes FROM api_key WHERE hash = ?', key)).toBeUndefined()
    const request = (value: string) => new Request('https://motif.test/mcp', { headers: { Authorization: `Bearer ${value}` } })
    expect(keys.userFromApiKey(request(key))).toBe(user)
    expect(keys.userFromApiKey(new Request('https://motif.test/mcp'))).toBeNull()
    expect(() => keys.userFromApiKey(request('mk_wrong'))).toThrow(/invalid/)
    keys.revokeKey(user, view.id)
    expect(() => keys.userFromApiKey(request(key))).toThrow(/revoked/)
  })
})

describe('repository files', () => {
  it('normalizes paths and rejects escapes', () => {
    expect(files.normalizePath('src\\app/./page.tsx')).toBe('src/app/page.tsx')
    expect(files.normalizePath('/README.md')).toBe('README.md')
    expect(files.normalizePath('../etc/passwd')).toBeNull()
    expect(files.normalizePath('a/\nb')).toBeNull()
    expect(files.normalizePath('')).toBeNull()
  })

  it('imports only text files from a GitHub zipball', () => {
    const zip = zipSync({
      'owner-repo-abc123/README.md': strToU8('# hi\r\n'),
      'owner-repo-abc123/src/index.ts': strToU8('export const a = 1\n'),
      'owner-repo-abc123/node_modules/x/index.js': strToU8('ignored'),
      'owner-repo-abc123/logo.png': new Uint8Array([137, 80, 78, 71]),
      'owner-repo-abc123/data.bin': new Uint8Array([1, 0, 2]),
      'owner-repo-abc123/big.txt': strToU8('x'.repeat(files.LIMITS.fileBytes + 1)),
    })
    const { files: imported, skipped } = files.filesFromZip(zip)
    expect(imported).toEqual({ 'README.md': '# hi\n', 'src/index.ts': 'export const a = 1\n' })
    expect(skipped).toEqual({ binary: 2, tooLarge: 1, ignored: 1, overLimit: 0 })
  })

  it('parses GitHub repository addresses', () => {
    expect(github.parseRepoInput('https://github.com/aimerfeng/motif')).toBe('aimerfeng/motif')
    expect(github.parseRepoInput('github.com/aimerfeng/motif.git')).toBe('aimerfeng/motif')
    expect(github.parseRepoInput('https://github.com/aimerfeng/motif/tree/main/apps')).toBe('aimerfeng/motif')
    expect(github.parseRepoInput('aimerfeng/motif')).toBe('aimerfeng/motif')
    expect(github.parseRepoInput('https://gitlab.com/a/b')).toBeNull()
    expect(github.parseRepoInput('not a repo')).toBeNull()
  })
})

describe('review fixes', () => {
  it('keeps sign-in redirects on this site', async () => {
    const { safeNext } = await import('../src/lib/auth/client')
    expect(safeNext('/account/credits?x=1#top')).toBe('/account/credits?x=1#top')
    expect(safeNext('/u/ada/repo')).toBe('/u/ada/repo')
    for (const bad of ['//evil.example', '/\\evil.example', '/\t/evil.example', '/\n/evil.example', 'https://evil.example', 'javascript:alert(1)', '', null]) {
      expect(safeNext(bad, '/account')).toBe('/account')
    }
  })

  it('gives the signup bonus once per inbox', () => {
    expect(ledger.bonusKey('A.Da+test@Gmail.com')).toBe('ada@gmail.com')
    expect(ledger.bonusKey('ada+x@example.com')).toBe('ada@example.com')
    expect(ledger.bonusKey('a.da@example.com')).toBe('a.da@example.com')
    const first = newUser('Ada', 'ada.lovelace@gmail.com')
    const second = newUser('Ada', 'adalovelace+2@gmail.com')
    expect(ledger.grantSignupBonus(first, 'ada.lovelace@gmail.com')).toBe(true)
    expect(ledger.grantSignupBonus(first, 'ada.lovelace@gmail.com')).toBe(false)
    expect(ledger.grantSignupBonus(second, 'adalovelace+2@gmail.com')).toBe(false)
    expect(ledger.balanceOf(first)).toBe(pricing.creditCosts().signupBonus)
    expect(ledger.balanceOf(second)).toBe(0)
  })

  it('stops inflating a zipball once the repository limits are reached', () => {
    const entries: Record<string, Uint8Array> = {}
    // 同一份 400 KB 的内容重复很多次：压缩后很小，全部解开会远超总大小上限。
    const chunk = strToU8('a'.repeat(400 * 1024))
    for (let i = 0; i < 60; i++) entries[`o-r-sha/copy-${String(i).padStart(2, '0')}.txt`] = chunk
    const { files: imported, skipped } = files.filesFromZip(zipSync(entries))
    const total = Object.values(imported).reduce((sum, text) => sum + text.length, 0)
    expect(total).toBeLessThanOrEqual(files.LIMITS.totalBytes)
    expect(skipped.overLimit).toBe(60 - Object.keys(imported).length)
    expect(skipped.overLimit).toBeGreaterThan(0)
  })

  it('rejects bad paths on every write', () => {
    expect(() => files.normalizeFiles({ 'ok.ts': '', '../../x.sh': 'rm -rf /' })).toThrow(/invalid file path/)
    expect(files.normalizeFiles({ './src\\a.ts': '1' })).toEqual({ 'src/a.ts': '1' })
  })
})
