import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CLIENTS, mergeCodexToml, mergeJsonConfig, serverEntry, type Action, type Scope, type SetupEnv } from '../src/clients.ts'
import { add, parseAssignments } from '../src/commands.ts'
import { CliError, keyFor, normalizeOrigin, readConfig, resolveOrigin, writeConfig } from '../src/context.ts'
import { applyWrites, codeDir, installCommand, planWrites, safeTarget } from '../src/install.ts'
import { relay, type UpstreamResponse } from '../src/proxy.ts'
import { packageUrl } from '../src/setup.ts'

let dir: string
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'motif-cli-'))
})
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('site address', () => {
  it('accepts https and local http only', () => {
    expect(normalizeOrigin('https://motif.example/some/path?x=1')).toBe('https://motif.example')
    expect(normalizeOrigin('http://localhost:3000/')).toBe('http://localhost:3000')
    expect(normalizeOrigin('http://127.0.0.1:3200')).toBe('http://127.0.0.1:3200')
    expect(normalizeOrigin('http://app.localhost:3000')).toBe('http://app.localhost:3000')
    // 明文 http 走公网：密钥会被看见。
    expect(() => normalizeOrigin('http://motif.example')).toThrow(CliError)
    expect(() => normalizeOrigin('ftp://motif.example')).toThrow(CliError)
    expect(() => normalizeOrigin('motif.example')).toThrow(CliError)
  })

  it('prefers the flag over the environment', () => {
    expect(resolveOrigin('https://a.example', { MOTIF_ORIGIN: 'https://b.example' })).toBe('https://a.example')
    expect(resolveOrigin(undefined, { MOTIF_ORIGIN: 'https://b.example' })).toBe('https://b.example')
    // 直接跑源码时占位符没被站点换掉：没有默认地址，要说清楚怎么给。
    expect(() => resolveOrigin(undefined, {})).toThrow(/--origin/)
  })
})

describe('saved keys', () => {
  it('keeps one key per site and never hands it to another', () => {
    const env = { MOTIF_CONFIG_DIR: dir }
    const file = path.join(dir, 'config.json')
    expect(readConfig(file)).toEqual({ keys: {} })
    writeConfig({ keys: { 'https://a.example': { key: 'mk_a', name: 'CLI', savedAt: '2026-01-01T00:00:00.000Z' } } }, file)
    expect(keyFor('https://a.example', env)).toBe('mk_a')
    expect(keyFor('https://b.example', env)).toBeNull()
    // 环境变量里的密钥优先（CI 用）。
    expect(keyFor('https://a.example', { ...env, MOTIF_API_KEY: 'mk_env' })).toBe('mk_env')
  })

  it('refuses a config file it cannot read instead of overwriting it', () => {
    const file = path.join(dir, 'config.json')
    fs.writeFileSync(file, '{ not json')
    expect(() => readConfig(file)).toThrow(CliError)
  })
})

describe('--set', () => {
  it('reads values as JSON when it can, as text otherwise', () => {
    expect(parseAssignments([])).toBeUndefined()
    expect(parseAssignments(['speed=1.5', 'loop=true', 'accent=#ff0055', 'title=Hello world', 'size=[1,2]', 'note=a=b'])).toEqual({
      speed: 1.5,
      loop: true,
      accent: '#ff0055',
      title: 'Hello world',
      size: [1, 2],
      note: 'a=b',
    })
    expect(() => parseAssignments(['speed'])).toThrow(CliError)
    expect(() => parseAssignments(['=1'])).toThrow(CliError)
  })
})

describe('add --dry-run', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  /** 站点的两个工具：报价按 owned 回答，下单总是交付一个文件。记下被调用的工具名。 */
  function site(owned: boolean) {
    const called: string[] = []
    vi.stubGlobal('fetch', (url: string) => {
      const tool = url.split('/').pop()!
      called.push(tool)
      const file = { path: 'components/motif/beam/beam.tsx', content: 'export {}' }
      const data =
        tool === 'get_quote'
          ? { slug: 'beam', credits: { credits: 10, unlocked: owned }, balance: 50 }
          : { id: 'ord_1', status: 'delivered', next: '', credits: { charged: 0, balance: 50 }, delivery: { registryItem: { files: [file], dependencies: [], registryDependencies: [] }, runtimeItem: { files: [], dependencies: [], registryDependencies: [] }, skill: null, page: 'https://motif.test/market/beam' } }
      return Promise.resolve(new Response(JSON.stringify({ data }), { status: 200 }))
    })
    return called
  }

  const context = { origin: 'https://motif.test', json: false }
  const options = { overwrite: false, dryRun: true }

  it('does not buy an item you do not own yet', async () => {
    vi.stubEnv('MOTIF_API_KEY', 'mk_test')
    const called = site(false)
    const lines: string[] = []
    vi.spyOn(process.stdout, 'write').mockImplementation((text) => (lines.push(String(text)), true))
    await add(context, { slug: 'beam' }, options)
    expect(called).toEqual(['get_quote'])
    expect(lines.join('')).toMatch(/10 credits · 50 in your account/)
  })

  it('lists the files of an item you own, and writes none', async () => {
    vi.stubEnv('MOTIF_API_KEY', 'mk_test')
    const called = site(true)
    const lines: string[] = []
    vi.spyOn(process.stdout, 'write').mockImplementation((text) => (lines.push(String(text)), true))
    vi.spyOn(process, 'cwd').mockReturnValue(dir)
    await add(context, { slug: 'beam' }, options)
    expect(called).toEqual(['get_quote', 'place_order'])
    expect(lines.join('')).toMatch(/beam\.tsx/)
    expect(fs.readdirSync(dir)).toEqual([])
  })
})

describe('writing files into a project', () => {
  it('only writes plain paths inside the target directory', () => {
    expect(safeTarget(dir, 'components/motif/aurora/aurora.tsx')).toBe(path.join(dir, 'components', 'motif', 'aurora', 'aurora.tsx'))
    for (const target of ['', '../outside.ts', 'a/../../outside.ts', '/etc/passwd', 'C:\\Windows\\x.ts', '.env', '.git/hooks/pre-commit', 'a/.github/workflows/x.yml', '..\\x.ts']) {
      expect(() => safeTarget(dir, target), target).toThrow(CliError)
    }
  })

  it('creates new files, leaves identical ones, and skips changed ones unless told to overwrite', () => {
    fs.mkdirSync(path.join(dir, 'lib'))
    fs.writeFileSync(path.join(dir, 'lib', 'same.ts'), 'same')
    fs.writeFileSync(path.join(dir, 'lib', 'edited.ts'), 'mine')
    const files = [
      { target: 'lib/new.ts', content: 'new' },
      { target: 'lib/same.ts', content: 'same' },
      { target: 'lib/edited.ts', content: 'theirs' },
    ]
    const careful = planWrites(dir, files, false)
    expect(careful.map((write) => write.action)).toEqual(['create', 'unchanged', 'skip'])
    applyWrites(careful)
    expect(fs.readFileSync(path.join(dir, 'lib', 'new.ts'), 'utf8')).toBe('new')
    // 用户改过的文件不动。
    expect(fs.readFileSync(path.join(dir, 'lib', 'edited.ts'), 'utf8')).toBe('mine')

    const forced = planWrites(dir, files, true)
    expect(forced.map((write) => write.action)).toEqual(['unchanged', 'unchanged', 'overwrite'])
    applyWrites(forced)
    expect(fs.readFileSync(path.join(dir, 'lib', 'edited.ts'), 'utf8')).toBe('theirs')
  })

  it('puts code under src/ when the project has one', () => {
    expect(codeDir(dir, undefined)).toBe(dir)
    fs.mkdirSync(path.join(dir, 'src'))
    expect(codeDir(dir, undefined)).toBe(path.join(dir, 'src'))
    expect(codeDir(dir, 'app/ui')).toBe(path.join(dir, 'app', 'ui'))
  })

  it('suggests the install command for the package manager in use', () => {
    expect(installCommand(dir, [])).toBeNull()
    expect(installCommand(dir, ['motion@^12'])).toBe('npm install motion@^12')
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '')
    expect(installCommand(dir, ['motion@^12', 'three@^0.180.0'])).toBe('pnpm add motion@^12 three@^0.180.0')
  })
})

const reply = (text: string, contentType = 'application/json', status = 200): UpstreamResponse => ({ status, contentType, text })

describe('stdio ↔ HTTP relay', () => {
  const request = JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'tools/list' })

  it('passes a JSON reply through on one line', async () => {
    const lines = await relay(request, () => Promise.resolve(reply('{\n  "jsonrpc": "2.0",\n  "id": 7,\n  "result": {}\n}')))
    expect(lines).toEqual(['{"jsonrpc":"2.0","id":7,"result":{}}'])
  })

  it('unwraps server-sent events', async () => {
    const sse = 'event: message\ndata: {"jsonrpc":"2.0","id":7,"result":{"a":1}}\n\nevent: message\r\ndata: {"jsonrpc":"2.0","method":"notifications/progress"}\r\n\r\n'
    const lines = await relay(request, () => Promise.resolve(reply(sse, 'text/event-stream')))
    expect(lines).toEqual(['{"jsonrpc":"2.0","id":7,"result":{"a":1}}', '{"jsonrpc":"2.0","method":"notifications/progress"}'])
  })

  it('says nothing for an accepted notification', async () => {
    const notification = JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })
    expect(await relay(notification, () => Promise.resolve(reply('', '', 202)))).toEqual([])
  })

  it('answers every waiting request with an error when the site cannot be reached', async () => {
    const batch = JSON.stringify([
      { jsonrpc: '2.0', id: 1, method: 'tools/list' },
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      { jsonrpc: '2.0', id: 'b', method: 'ping' },
    ])
    const lines = await relay(batch, () => Promise.reject(new Error('fetch failed')))
    expect(lines.map((line) => JSON.parse(line))).toEqual([
      { jsonrpc: '2.0', id: 1, error: { code: -32000, message: 'Motif is unreachable: fetch failed' } },
      { jsonrpc: '2.0', id: 'b', error: { code: -32000, message: 'Motif is unreachable: fetch failed' } },
    ])
  })

  it('turns a plain HTTP error into a JSON-RPC error', async () => {
    const lines = await relay(request, () => Promise.resolve(reply('{"error":"rate limited"}', 'application/json', 429)))
    expect(JSON.parse(lines[0]!)).toEqual({ jsonrpc: '2.0', id: 7, error: { code: -32000, message: 'Motif is unreachable: rate limited' } })
    const html = await relay(request, () => Promise.resolve(reply('<html>502</html>', 'text/html', 502)))
    expect(JSON.parse(html[0]!).error.code).toBe(-32000)
  })

  it('reports input that is not JSON', async () => {
    const lines = await relay('not json', () => Promise.reject(new Error('never called')))
    expect(JSON.parse(lines[0]!)).toEqual({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })
  })
})

function fakeEnv(overrides: Partial<SetupEnv> = {}): SetupEnv {
  return { cwd: '/work/app', home: '/home/me', platform: 'linux', appData: undefined, exists: () => false, onPath: () => false, ...overrides }
}

function plan(id: string, scope: Scope, env: SetupEnv): Action {
  const client = CLIENTS.find((entry) => entry.id === id)!
  return client.plan(scope, serverEntry(packageUrl('https://motif.example'), env.platform), env)
}

describe('agent setup', () => {
  it('starts the server through npx from the site itself, wrapped in cmd on Windows', () => {
    const url = packageUrl('https://motif.example')
    expect(url).toMatch(/^https:\/\/motif\.example\/cli\/motif-.+\.tgz$/)
    expect(serverEntry(packageUrl('https://motif.example'), 'linux')).toEqual({ command: 'npx', args: ['-y', url, 'mcp'] })
    expect(serverEntry(packageUrl('https://motif.example'), 'win32')).toEqual({ command: 'cmd', args: ['/c', 'npx', '-y', url, 'mcp'] })
  })

  it('never writes a secret into an agent config', () => {
    for (const client of CLIENTS) {
      for (const scope of ['auto', 'global', 'project'] as const) {
        expect(JSON.stringify(client.plan(scope, serverEntry(packageUrl('https://motif.example'), 'linux'), fakeEnv({ onPath: () => true }))), `${client.id}/${scope}`).not.toMatch(/mk_|authorization|bearer/i)
      }
    }
  })

  it('picks each client\'s own config file', () => {
    const env = fakeEnv()
    expect(plan('cursor', 'auto', env)).toMatchObject({ kind: 'json', file: '/home/me/.cursor/mcp.json', root: 'mcpServers' })
    expect(plan('cursor', 'project', env)).toMatchObject({ kind: 'json', file: '/work/app/.cursor/mcp.json' })
    expect(plan('vscode', 'auto', env)).toMatchObject({ kind: 'json', file: '/work/app/.vscode/mcp.json', root: 'servers', entry: { type: 'stdio', command: 'npx' } })
    expect(plan('codex', 'auto', env)).toMatchObject({ kind: 'toml', file: '/home/me/.codex/config.toml' })
    expect(plan('codex', 'project', env).kind).toBe('manual')
    expect(plan('claude', 'project', env)).toMatchObject({ kind: 'json', file: '/work/app/.mcp.json' })
    // 用户级的 Claude Code 配置交给 claude 命令；没装就给出那条命令。
    expect(plan('claude', 'auto', env).kind).toBe('manual')
    expect(plan('claude', 'auto', fakeEnv({ onPath: (command) => command === 'claude' }))).toMatchObject({ kind: 'exec', command: 'claude', args: ['mcp', 'add', '--scope', 'user', 'motif', '--', 'npx', '-y', packageUrl('https://motif.example'), 'mcp'] })
    expect(plan('claude-desktop', 'auto', fakeEnv({ platform: 'win32', appData: 'C:\\Users\\me\\AppData\\Roaming' }))).toMatchObject({ file: 'C:\\Users\\me\\AppData\\Roaming\\Claude\\claude_desktop_config.json' })
    // 路径按目标平台拼，和跑这段代码的机器无关（站点在 Linux 上给 Windows 用户生成说明）。
    expect(plan('cursor', 'auto', fakeEnv({ platform: 'win32', home: '%USERPROFILE%' }))).toMatchObject({ file: '%USERPROFILE%\\.cursor\\mcp.json', entry: { command: 'cmd' } })
    expect(plan('claude-desktop', 'auto', fakeEnv({ platform: 'darwin' }))).toMatchObject({ file: '/home/me/Library/Application Support/Claude/claude_desktop_config.json' })
  })

  it('detects the clients that are installed', () => {
    const env = fakeEnv({ exists: (file) => file === '/home/me/.cursor' || file === '/work/app/.vscode' })
    expect(CLIENTS.filter((client) => client.detect(env)).map((client) => client.id)).toEqual(['cursor', 'vscode'])
  })

  it('adds itself to a JSON config without touching the rest', () => {
    const entry = serverEntry(packageUrl('https://motif.example'), 'linux')
    expect(JSON.parse(mergeJsonConfig(null, 'mcpServers', entry))).toEqual({ mcpServers: { motif: entry } })
    const existing = JSON.stringify({ theme: 'dark', mcpServers: { other: { command: 'x' }, motif: { command: 'old' } } })
    expect(JSON.parse(mergeJsonConfig(existing, 'mcpServers', entry))).toEqual({ theme: 'dark', mcpServers: { other: { command: 'x' }, motif: entry } })
    // 带注释的 JSON、不是对象的内容：抛错，由调用方改成让用户手动加。
    expect(() => mergeJsonConfig('{ // comment\n}', 'mcpServers', entry)).toThrow()
    expect(() => mergeJsonConfig('[]', 'mcpServers', entry)).toThrow()
    expect(() => mergeJsonConfig('{"mcpServers": []}', 'mcpServers', entry)).toThrow()
  })

  it('adds or replaces its table in the Codex TOML config', () => {
    const entry = serverEntry(packageUrl('https://motif.example'), 'linux')
    const block = `[mcp_servers.motif]\ncommand = "npx"\nargs = ["-y", "${packageUrl('https://motif.example')}", "mcp"]\n`
    expect(mergeCodexToml(null, entry)).toBe(block)
    expect(mergeCodexToml('model = "x"\n', entry)).toBe(`model = "x"\n\n${block}`)
    const existing = 'model = "x"\n\n[mcp_servers.motif]\ncommand = "old"\nargs = []\n\n[mcp_servers.other]\ncommand = "y"\n'
    expect(mergeCodexToml(existing, entry)).toBe(`model = "x"\n\n${block}\n[mcp_servers.other]\ncommand = "y"\n`)
    // 再跑一次不会越加越多。
    expect(mergeCodexToml(mergeCodexToml(existing, entry), entry)).toBe(mergeCodexToml(existing, entry))
  })
})
