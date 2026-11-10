import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { CLIENTS, mergeCodexToml, mergeJsonConfig, NAME, serverEntry, type Action, type Scope, type ServerEntry, type SetupEnv } from './clients.ts'
import { bold, CliError, dim, green, note, VERSION, yellow, type Context } from './context.ts'

/*
 * `motif setup`：把 Motif 的 MCP 服务写进各个 coding agent 的配置（每个 agent 的配置在哪、长什么样见 clients.ts）。
 * 写进去的是 stdio 服务（npx … mcp，见 proxy.ts），不是带密钥的 HTTP 地址：
 * 配置文件里没有任何秘密，可以放心提交、同步；密钥只在 ~/.motif/config.json。
 */

/** CLI 的下载地址带版本号：npx 按地址缓存，版本变了地址就变，缓存自然失效。 */
export const packageUrl = (origin: string) => `${origin}/cli/motif-${VERSION}.tgz`

const commandLine = (entry: ServerEntry) => [entry.command, ...entry.args].join(' ')

export function realEnv(): SetupEnv {
  const onPath = (command: string) => {
    const result = spawnSync(process.platform === 'win32' ? 'where' : 'which', [command], { stdio: 'ignore' })
    return result.status === 0
  }
  return { cwd: process.cwd(), home: os.homedir(), platform: process.platform, appData: process.env.APPDATA, exists: (file) => fs.existsSync(file), onPath }
}

const readOrNull = (file: string) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null)

/** 执行一步，返回给用户看的一行。dryRun 时只说会做什么。 */
function perform(action: Action, dryRun: boolean): { ok: boolean; line: string } {
  switch (action.kind) {
    case 'manual':
      return { ok: false, line: `${yellow('run it yourself:')} ${action.text}` }
    case 'exec': {
      const display = `${action.command} ${action.args.join(' ')}`
      if (dryRun) return { ok: true, line: `would run: ${display}` }
      // Windows 上这些命令是 .cmd，要经过 shell 才能启动；参数都是我们自己拼的（命令名、选项和站点地址），没有需要转义的字符。
      const shell = process.platform === 'win32'
      // 已经登记过同名的服务时 add 会失败：先删掉旧的（没有也无妨）。
      spawnSync(action.command, ['mcp', 'remove', '--scope', 'user', NAME], { stdio: 'ignore', shell })
      const result = spawnSync(action.command, action.args, { stdio: ['ignore', 'ignore', 'pipe'], shell, encoding: 'utf8' })
      if (result.status !== 0) return { ok: false, line: `${yellow('that did not work; run it yourself:')} ${display}${result.stderr ? dim(`\n      ${result.stderr.trim().split('\n')[0]}`) : ''}` }
      return { ok: true, line: `ran: ${dim(display)}` }
    }
    case 'json':
    case 'toml': {
      let next: string
      try {
        next = action.kind === 'json' ? mergeJsonConfig(readOrNull(action.file), action.root, action.entry) : mergeCodexToml(readOrNull(action.file), action.entry)
      } catch (cause) {
        // 多半是带注释的 JSON：不冒险改写别人的配置文件，给出要加的内容。
        const snippet = action.kind === 'json' ? JSON.stringify({ [action.root]: { [NAME]: action.entry } }) : ''
        return { ok: false, line: `${yellow(`cannot edit ${action.file} (${cause instanceof Error ? cause.message : String(cause)}); add this to it yourself:`)} ${snippet}` }
      }
      if (dryRun) return { ok: true, line: `would write ${action.file}` }
      fs.mkdirSync(path.dirname(action.file), { recursive: true })
      fs.writeFileSync(action.file, next)
      return { ok: true, line: `wrote ${action.file}` }
    }
  }
}

export interface SetupOptions {
  clients: string[]
  scope: Scope
  dryRun: boolean
}

export function setup(context: Context, options: SetupOptions, env: SetupEnv = realEnv()): void {
  const unknown = options.clients.filter((id) => !CLIENTS.some((client) => client.id === id))
  if (unknown.length > 0) throw new CliError(`unknown client: ${unknown.join(', ')}`, `known clients: ${CLIENTS.map((client) => client.id).join(', ')}`)

  const entry = serverEntry(packageUrl(context.origin), env.platform)
  const chosen = options.clients.length > 0 ? CLIENTS.filter((client) => options.clients.includes(client.id)) : CLIENTS.filter((client) => client.detect(env))
  if (chosen.length === 0) {
    note(`No coding agent found on this machine. Name one: motif setup <${CLIENTS.map((client) => client.id).join('|')}>`)
    note(`Or add this MCP server to your agent by hand (stdio): ${bold(commandLine(entry))}`)
    return
  }

  let done = 0
  for (const client of chosen) {
    const result = perform(client.plan(options.scope, entry, env), options.dryRun)
    if (result.ok) done += 1
    note(`${result.ok ? green('✓') : yellow('!')} ${bold(client.label)}: ${result.line}`)
  }
  if (done > 0 && !options.dryRun) note(`\nRestart the agent (or reload its MCP servers) and ask it for UI: "find me a pricing section on Motif".`)
}
