import { createHash, randomBytes } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/*
 * agent 接入（docs/decisions/0011）在站点这一侧的纯逻辑：命令行登录、CLI 的分发包、接入页的配置说明、GET 调工具时的参数还原。
 * 和 accounts.test.ts 一样：数据库用临时文件，先设环境变量再动态导入。
 */

const dir = mkdtempSync(path.join(tmpdir(), 'motif-agents-'))
process.env.MOTIF_DB_PATH = path.join(dir, 'test.sqlite')

const db = await import('../src/lib/db')
const keys = await import('../src/lib/accounts/api-keys')
const login = await import('../src/lib/accounts/cli-login')
const cli = await import('../src/lib/cli')
const guides = await import('../src/lib/agent-clients')
const { inputFromQuery } = await import('../src/lib/store/query-input')

beforeAll(() => {
  db.db().exec(`CREATE TABLE "user" (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, emailVerified INTEGER NOT NULL DEFAULT 0, image TEXT, createdAt TEXT, updatedAt TEXT, githubLogin TEXT)`)
  db.migrateOwnTables()
})

afterAll(() => {
  db.db().close()
  rmSync(dir, { recursive: true, force: true })
})

let counter = 0
function newUser(): string {
  const id = `u${++counter}`
  db.run('INSERT INTO "user" (id, name, email, createdAt) VALUES (?, ?, ?, ?)', id, 'Ada', `ada${counter}@example.com`, new Date().toISOString())
  return id
}

/** CLI 那一侧做的事：本机生成密钥，只交出哈希和前缀。 */
function localKey() {
  const key = `mk_${randomBytes(32).toString('base64url')}`
  return { key, keyHash: createHash('sha256').update(key).digest('hex'), keyPrefix: key.slice(0, 10) }
}

const withKey = (key: string) => new Request('https://motif.test/mcp', { headers: { Authorization: `Bearer ${key}` } })

describe('命令行登录', () => {
  it('同意之后，CLI 本机的那个密钥就是这个用户的密钥', () => {
    const user = newUser()
    const local = localKey()
    const started = login.startLogin({ ...local, name: 'laptop' })
    expect(started.userCode).toMatch(/^[BCDFGHJKMNPQRSTVWXZ2-9]{4}-[BCDFGHJKMNPQRSTVWXZ2-9]{4}$/)
    expect(login.loginStatus(started.id)).toBe('pending')
    // 同意之前，这个密钥什么也不是。
    expect(() => keys.userFromApiKey(withKey(local.key))).toThrow(/invalid/)

    // 人输入的确认码：小写、不带连字符也认。
    const typed = started.userCode.replace('-', '').toLowerCase()
    expect(login.pendingLogin(typed)).toMatchObject({ code: started.userCode, name: 'laptop', keyPrefix: local.keyPrefix })
    login.resolveLogin(user, typed, 'approve')

    expect(login.loginStatus(started.id)).toBe('approved')
    expect(keys.userFromApiKey(withKey(local.key))).toBe(user)
    expect(keys.listKeys(user).map((entry) => entry.name)).toEqual(['laptop'])
  })

  it('一个确认码只能用一次', () => {
    const started = login.startLogin({ ...localKey(), name: '' })
    login.resolveLogin(newUser(), started.userCode, 'approve')
    expect(login.pendingLogin(started.userCode)).toBeNull()
    expect(() => {
      login.resolveLogin(newUser(), started.userCode, 'approve')
    }).toThrow(/not valid any more/)
  })

  it('拒绝：密钥不会被登记', () => {
    const user = newUser()
    const local = localKey()
    const started = login.startLogin({ ...local, name: 'ci' })
    login.resolveLogin(user, started.userCode, 'deny')
    expect(login.loginStatus(started.id)).toBe('denied')
    expect(keys.listKeys(user)).toEqual([])
    expect(() => keys.userFromApiKey(withKey(local.key))).toThrow(/invalid/)
  })

  it('过了十分钟就不能再同意', () => {
    vi.useFakeTimers()
    try {
      const started = login.startLogin({ ...localKey(), name: 'slow' })
      vi.advanceTimersByTime(login.LOGIN_TTL_MS + 1000)
      expect(login.loginStatus(started.id)).toBe('expired')
      expect(login.pendingLogin(started.userCode)).toBeNull()
      expect(() => {
        login.resolveLogin(newUser(), started.userCode, 'approve')
      }).toThrow(/not valid any more/)
    } finally {
      vi.useRealTimers()
    }
  })

  it('只收哈希：明文密钥或格式不对的输入一律拒绝', () => {
    const local = localKey()
    expect(() => login.startLogin({ keyHash: local.key, keyPrefix: local.keyPrefix, name: 'x' })).toThrow(/keyHash/)
    expect(() => login.startLogin({ keyHash: local.keyHash, keyPrefix: 'sk_1234567', name: 'x' })).toThrow(/keyPrefix/)
    expect(() => login.loginStatus('nope')).toThrow(/no such login/)
  })
})

/** 把 tar 拆成 { 名字: { 内容, 权限 } }，顺便核对每个头的校验和。 */
function untar(tar: Buffer): Record<string, { text: string; mode: number }> {
  const entries: Record<string, { text: string; mode: number }> = {}
  const field = (block: Buffer, start: number, length: number) => block.subarray(start, start + length).toString('utf8').replace(/\0.*$/, '')
  for (let offset = 0; offset + 512 <= tar.length; ) {
    const header = tar.subarray(offset, offset + 512)
    if (header.every((byte) => byte === 0)) break
    const size = parseInt(field(header, 124, 12), 8)
    const expected = parseInt(field(header, 148, 8), 8)
    const blank = Buffer.from(header)
    blank.fill(0x20, 148, 156)
    expect(blank.reduce((sum, byte) => sum + byte, 0)).toBe(expected)
    entries[field(header, 0, 100)] = { text: tar.subarray(offset + 512, offset + 512 + size).toString('utf8'), mode: parseInt(field(header, 100, 8), 8) }
    offset += 512 + Math.ceil(size / 512) * 512
  }
  return entries
}

describe('CLI 的分发包', () => {
  it('是 npm 能装的包：package/ 下一个清单和一个可执行文件', () => {
    const script = `#!/usr/bin/env node\nconsole.log(${JSON.stringify('你好 '.repeat(400))})\n`
    const entries = untar(gunzipSync(cli.cliTarball(script, '1.2.3', 1_700_000_000)))
    expect(Object.keys(entries)).toEqual(['package/package.json', 'package/motif.mjs'])
    expect(entries['package/motif.mjs']).toEqual({ text: script, mode: 0o755 })
    const manifest = JSON.parse(entries['package/package.json']!.text) as { version: string; bin: Record<string, string>; type: string }
    expect(manifest).toMatchObject({ version: '1.2.3', type: 'module', bin: { motif: 'motif.mjs' } })
  })

  it('同样的输入得到同样的包（ETag 靠它）', () => {
    expect(cli.cliTarball('x', '1.0.0', 1).equals(cli.cliTarball('x', '1.0.0', 1))).toBe(true)
  })

  it('命令里的包地址带版本号', () => {
    const url = cli.cliPackageUrl('https://motif.test')
    expect(url).toBe(`https://motif.test/cli/motif-${cli.cliVersion()}.tgz`)
    expect(cli.cliCommand('https://motif.test', 'setup')).toBe(`npx -y ${url} setup`)
  })
})

describe('接入页的配置说明', () => {
  const all = guides.agentGuides('https://motif.test')
  const packageUrl = cli.cliPackageUrl('https://motif.test')

  it('每个 agent 在两种系统下都有说明，自动的那条命令只配它自己', () => {
    expect(all.length).toBeGreaterThanOrEqual(7)
    for (const guide of all) {
      expect(guide.setup).toBe(`npx -y ${packageUrl} setup ${guide.id}`)
      for (const os of ['unix', 'windows'] as const) {
        const step = guide.manual[os]
        const text = step.kind === 'file' ? step.snippet : step.text
        expect(text, `${guide.id} ${os}`).toContain(packageUrl)
        // 配置里不能有密钥，也不能有本机的真实路径。
        expect(text).not.toMatch(/mk_|Bearer|Authorization/)
        if (step.kind === 'file') expect(step.file).toMatch(os === 'windows' ? /^(\.|%USERPROFILE%|%APPDATA%)/ : /^(\.|~)/)
      }
    }
  })

  it('Windows 上的 JSON 配置用 cmd /c 包一层 npx', () => {
    const cursor = all.find((guide) => guide.id === 'cursor')!
    const windows = cursor.manual.windows
    const unix = cursor.manual.unix
    expect(windows.kind === 'file' && unix.kind === 'file').toBe(true)
    if (windows.kind !== 'file' || unix.kind !== 'file') return
    const server = (snippet: string) => (JSON.parse(snippet) as { mcpServers: { motif: { command: string; args: string[] } } }).mcpServers.motif
    expect(server(unix.snippet)).toEqual({ command: 'npx', args: ['-y', packageUrl, 'mcp'] })
    expect(server(windows.snippet)).toEqual({ command: 'cmd', args: ['/c', 'npx', '-y', packageUrl, 'mcp'] })
  })
})

describe('GET 调工具：查询串还原成输入', () => {
  const schema = {
    properties: {
      query: { type: 'string' },
      limit: { type: 'integer' },
      dark: { type: 'boolean' },
      times: { type: 'array', items: { type: 'number' } },
      values: { type: 'object' },
    },
  }
  const parse = (query: string) => inputFromQuery(new URLSearchParams(query), schema)

  it('按 schema 还原数字、布尔和对象', () => {
    expect(parse('query=pricing&limit=5&dark=true&values={"speed":2}')).toEqual({ query: 'pricing', limit: 5, dark: true, values: { speed: 2 } })
    // 字符串字段里的数字保持字符串。
    expect(parse('query=42')).toEqual({ query: '42' })
  })

  it('数组的三种写法', () => {
    expect(parse('times=0.8&times=2.5')).toEqual({ times: [0.8, 2.5] })
    expect(parse('times=0.8,2.5')).toEqual({ times: [0.8, 2.5] })
    expect(parse('times=[0.8,2.5]')).toEqual({ times: [0.8, 2.5] })
  })

  it('还原不了的原样留着，交给 zod 报错', () => {
    expect(parse('limit=many&dark=maybe&values={oops&extra=1')).toEqual({ limit: 'many', dark: 'maybe', values: '{oops', extra: '1' })
  })
})
