import { parseArgs } from 'node:util'
import { CLIENTS, type Scope } from './clients.ts'
import * as commands from './commands.ts'
import { bold, CliError, dim, keyFor, note, resolveOrigin, VERSION, yellow, type Context } from './context.ts'
import { ensureLogin, login, logout, whoami } from './login.ts'
import { runProxy } from './proxy.ts'
import { setup } from './setup.ts'

const HELP = `${bold('motif')} ${VERSION} — UI for coding agents: templates, sections, components and effects

${bold('Connect an agent')}
  setup [client…]        Sign in (if needed) and add Motif to your coding agents over MCP.
                         Clients: ${CLIENTS.map((client) => client.id).join(', ')} (default: the ones found here)
                         --project  write the project's config instead of your user config
                         --global   user config for every client · --dry-run  only show what would change
  mcp                    Run as a stdio MCP server (this is what setup configures)

${bold('Account')}
  login                  Sign in through the browser; saves an API key on this machine  (--no-browser)
  logout                 Revoke that key and forget it
  whoami                 Who is signed in, and the credit balance

${bold('Market')}
  search <words…>        Find items  (--kind, --category, --limit)
  info <slug>            Parameters, presets, dependencies, license, price
  preview <slug>         Render it and save screenshots  (--preset, --set key=value, --out <dir>)
  add <slug>             Buy it (once) and write its code into this project
                         --preset <id> · --set key=value … · --dir <path> · --overwrite
                         --dry-run  show the price or the files, without buying or writing
  custom "<brief>"       Order a custom build  (--base <slug>, --wait to wait and save it)
  order <id>             Status of an order  (--wait, --save)
  skills [words…]        List agent skills  (--general)
  skill <name>           Save a skill into .claude/skills/  (--dir, --overwrite)

${bold('Raw access')}
  tools                  List the tools behind all of this
  call <tool> [json]     Call one with a JSON input

${bold('Everywhere')}
  --origin <url>         Talk to another Motif site (or set MOTIF_ORIGIN)
  --json                 Print raw JSON
  MOTIF_API_KEY          Use this key instead of the saved one (for CI)
`

const OPTIONS = {
  origin: { type: 'string' },
  json: { type: 'boolean' },
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' },
  'no-browser': { type: 'boolean' },
  name: { type: 'string' },
  global: { type: 'boolean' },
  project: { type: 'boolean' },
  'dry-run': { type: 'boolean' },
  kind: { type: 'string' },
  category: { type: 'string' },
  limit: { type: 'string' },
  preset: { type: 'string' },
  set: { type: 'string', multiple: true },
  dir: { type: 'string' },
  out: { type: 'string' },
  overwrite: { type: 'boolean' },
  base: { type: 'string' },
  wait: { type: 'boolean' },
  save: { type: 'boolean' },
  general: { type: 'boolean' },
} as const

function out(text: string): void {
  process.stdout.write(text)
}

function need(value: string | undefined, usage: string): string {
  if (!value) throw new CliError(`usage: motif ${usage}`)
  return value
}

export async function main(argv: string[]): Promise<void> {
  let parsed
  try {
    parsed = parseArgs({ args: argv, options: OPTIONS, allowPositionals: true, strict: true })
  } catch (cause) {
    throw new CliError(cause instanceof Error ? cause.message : String(cause), 'motif help lists every command and option')
  }
  const { values: flags, positionals } = parsed
  const [command = 'help', ...rest] = positionals
  if (flags.version) {
    out(`${VERSION}\n`)
    return
  }
  if (flags.help || command === 'help') {
    out(HELP)
    return
  }

  const context: Context = { origin: resolveOrigin(flags.origin), json: flags.json ?? false }
  const save = { dir: flags.dir, overwrite: flags.overwrite ?? false, dryRun: flags['dry-run'] ?? false }
  const tuning = { preset: flags.preset, values: commands.parseAssignments(flags.set ?? []) }

  switch (command) {
    case 'login':
      return login(context, { browser: !flags['no-browser'], name: flags.name })
    case 'logout':
      return logout(context)
    case 'whoami':
    case 'balance': {
      const me = await whoami(context)
      if (context.json) out(`${JSON.stringify(me, null, 2)}\n`)
      else out(`${bold(me.user.handle ? `@${me.user.handle}` : me.user.name)} · ${me.balance} credits · key "${me.key.name}" (${me.key.prefix}…) · ${context.origin}\n`)
      return
    }
    case 'setup': {
      if (flags.global && flags.project) throw new CliError('pass --global or --project, not both')
      const scope: Scope = flags.global ? 'global' : flags.project ? 'project' : 'auto'
      // 先登录再写配置：配置里没有密钥，agent 连上之后靠这台机器上存的密钥买东西。dry run 不动任何东西，也不登录。
      if (!save.dryRun) await ensureLogin(context, !flags['no-browser'])
      setup(context, { clients: rest, scope, dryRun: save.dryRun })
      return
    }
    case 'mcp':
      return runProxy(context)
    case 'search': {
      const limit = flags.limit === undefined ? undefined : Number(flags.limit)
      return commands.search(context, { query: rest.join(' ') || undefined, kind: flags.kind, category: flags.category, limit })
    }
    case 'info':
      return commands.info(context, need(rest[0], 'info <slug>'))
    case 'preview':
      return commands.preview(context, { slug: need(rest[0], 'preview <slug>'), ...tuning }, flags.out)
    case 'add':
      if (!keyFor(context.origin)) throw new CliError('not signed in: adding an item spends credits', 'run: motif login')
      return commands.add(context, { slug: need(rest[0], 'add <slug>'), ...tuning }, save)
    case 'custom':
      return commands.custom(context, { brief: need(rest.join(' '), 'custom "<what to build>"'), base: flags.base }, { ...save, wait: flags.wait ?? false })
    case 'order':
      return commands.order(context, need(rest[0], 'order <id>'), { ...save, save: flags.save ?? false, wait: flags.wait ?? false })
    case 'skills':
      return commands.skills(context, { query: rest.join(' ') || undefined, general: flags.general })
    case 'skill':
      return commands.skill(context, need(rest[0], 'skill <name>'), save)
    case 'tools':
      return commands.tools(context)
    case 'call':
      return commands.call(context, need(rest[0], 'call <tool> [json]'), rest[1])
    default:
      throw new CliError(`unknown command "${command}"`, 'motif help lists every command')
  }
}

// 管道另一头先关了（motif skills | head）不是出错：剩下的输出丢掉，不打一屏堆栈。
// 不在这里 process.exit：Windows 上请求的连接还没关完就退出，Node 会在 libuv 里断言失败。让命令自己跑完。
process.stdout.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code !== 'EPIPE') throw error
})

main(process.argv.slice(2)).catch((error: unknown) => {
  if (error instanceof CliError) {
    note(`${yellow('motif:')} ${error.message}`)
    if (error.hint) note(dim(`       ${error.hint}`))
  } else {
    console.error(error)
  }
  process.exitCode = 1
})
