import path from 'node:path'

/*
 * motif 能接入哪些 coding agent、各自的 MCP 配置写在哪、长什么样。
 * 这里只有纯数据和纯函数（不碰文件系统、不起进程）：`motif setup` 照它去写配置（setup.ts），
 * 站点的接入页也照它生成手动配置的说明（apps/web 的 /agents），两边不会对不上。
 */

export type Scope = 'auto' | 'global' | 'project'

/** 测试时换成假的环境；真跑的时候是 realEnv()。 */
export interface SetupEnv {
  cwd: string
  home: string
  platform: NodeJS.Platform
  appData: string | undefined
  exists: (file: string) => boolean
  onPath: (command: string) => boolean
}

export interface ServerEntry {
  command: string
  args: string[]
}

export type Action =
  /** 往一个 JSON 配置里加一项。vscode 的格式和别人不一样：根是 servers，每项要写 type。 */
  | { kind: 'json'; file: string; root: 'mcpServers' | 'servers'; entry: ServerEntry & { type?: 'stdio' } }
  | { kind: 'toml'; file: string; entry: ServerEntry }
  /** 交给这个 agent 自己的命令行去登记（它的配置文件不适合别人直接改）。 */
  | { kind: 'exec'; command: string; args: string[] }
  /** 没法自动做：告诉用户怎么手动做。 */
  | { kind: 'manual'; text: string }

export interface Client {
  id: string
  label: string
  detect: (env: SetupEnv) => boolean
  plan: (scope: Scope, entry: ServerEntry, env: SetupEnv) => Action
}

export const NAME = 'motif'

/** agent 启动这个服务用的命令（packageUrl：CLI 包的下载地址）。Windows 上 npx 是个 .cmd，多数 agent 不经过 shell 就起不了它，所以包一层 cmd /c。 */
export function serverEntry(packageUrl: string, platform: NodeJS.Platform): ServerEntry {
  const npx = ['npx', '-y', packageUrl, 'mcp']
  return platform === 'win32' ? { command: 'cmd', args: ['/c', ...npx] } : { command: npx[0]!, args: npx.slice(1) }
}

/** 路径按目标机器的平台拼，不按运行这段代码的机器：站点（Linux）也用它给 Windows 用户生成说明。 */
const join = (env: SetupEnv, ...parts: string[]) => (env.platform === 'win32' ? path.win32 : path.posix).join(...parts)

function claudeDesktopDir(env: SetupEnv): string {
  if (env.platform === 'win32') return join(env, env.appData ?? join(env, env.home, 'AppData', 'Roaming'), 'Claude')
  if (env.platform === 'darwin') return join(env, env.home, 'Library', 'Application Support', 'Claude')
  return join(env, env.home, '.config', 'Claude')
}

const json = (file: string, entry: ServerEntry): Action => ({ kind: 'json', file, root: 'mcpServers', entry })
const projectOnly = (label: string): Action => ({ kind: 'manual', text: `${label} has no per-project MCP config; run setup without --project to add it for your user.` })

export const CLIENTS: Client[] = [
  {
    id: 'claude',
    label: 'Claude Code',
    detect: (env) => env.onPath('claude') || env.exists(join(env, env.home, '.claude')),
    plan(scope, entry, env) {
      if (scope === 'project') return json(join(env, env.cwd, '.mcp.json'), entry)
      // 用户级的配置在 ~/.claude.json，Claude Code 自己随时在改写它：交给 claude 命令去登记，不直接动那个文件。
      const args = ['mcp', 'add', '--scope', 'user', NAME, '--', entry.command, ...entry.args]
      return env.onPath('claude') ? { kind: 'exec', command: 'claude', args } : { kind: 'manual', text: `claude ${args.join(' ')}` }
    },
  },
  {
    id: 'cursor',
    label: 'Cursor',
    detect: (env) => env.exists(join(env, env.home, '.cursor')),
    plan: (scope, entry, env) => json(join(env, scope === 'project' ? env.cwd : env.home, '.cursor', 'mcp.json'), entry),
  },
  {
    id: 'vscode',
    label: 'VS Code (Copilot)',
    detect: (env) => env.exists(join(env, env.cwd, '.vscode')),
    plan(scope, entry, env) {
      // 用户级的 mcp.json 在各系统、各发行版（Insiders、VSCodium）位置都不一样：全局的交给 code 命令。
      if (scope === 'global') return { kind: 'manual', text: `code --add-mcp '${JSON.stringify({ name: NAME, ...entry })}'` }
      return { kind: 'json', file: join(env, env.cwd, '.vscode', 'mcp.json'), root: 'servers', entry: { type: 'stdio', ...entry } }
    },
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    detect: (env) => env.exists(join(env, env.home, '.codeium', 'windsurf')),
    plan: (scope, entry, env) => (scope === 'project' ? projectOnly('Windsurf') : json(join(env, env.home, '.codeium', 'windsurf', 'mcp_config.json'), entry)),
  },
  {
    id: 'codex',
    label: 'Codex CLI',
    detect: (env) => env.exists(join(env, env.home, '.codex')),
    plan: (scope, entry, env) => (scope === 'project' ? projectOnly('Codex') : { kind: 'toml', file: join(env, env.home, '.codex', 'config.toml'), entry }),
  },
  {
    id: 'gemini',
    label: 'Gemini CLI',
    detect: (env) => env.exists(join(env, env.home, '.gemini')),
    plan: (scope, entry, env) => json(join(env, scope === 'project' ? env.cwd : env.home, '.gemini', 'settings.json'), entry),
  },
  {
    id: 'claude-desktop',
    label: 'Claude Desktop',
    detect: (env) => env.exists(claudeDesktopDir(env)),
    plan: (scope, entry, env) => (scope === 'project' ? projectOnly('Claude Desktop') : json(join(env, claudeDesktopDir(env), 'claude_desktop_config.json'), entry)),
  },
]

/** 在一个 JSON 配置里加上（或换掉）motif 这一项，别的内容原样保留。原文件不是合法 JSON 就抛错，不去猜。 */
export function mergeJsonConfig(text: string | null, root: string, entry: object): string {
  let config: Record<string, unknown> = {}
  if (text && text.trim() !== '') {
    const parsed: unknown = JSON.parse(text)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('the file does not hold a JSON object')
    config = parsed as Record<string, unknown>
  }
  const servers = config[root]
  if (servers !== undefined && (typeof servers !== 'object' || servers === null || Array.isArray(servers))) throw new Error(`"${root}" is not an object`)
  config[root] = { ...(servers as Record<string, unknown> | undefined), [NAME]: entry }
  return `${JSON.stringify(config, null, 2)}\n`
}

const tomlString = (value: string) => JSON.stringify(value)

/** Codex 的 config.toml：换掉已有的 [mcp_servers.motif] 这一段（到下一个表头为止），没有就加在最后。别的行不动。 */
export function mergeCodexToml(text: string | null, entry: ServerEntry): string {
  const block = [`[mcp_servers.${NAME}]`, `command = ${tomlString(entry.command)}`, `args = [${entry.args.map(tomlString).join(', ')}]`]
  const lines = (text ?? '').split(/\r?\n/)
  const start = lines.findIndex((line) => line.trim() === `[mcp_servers.${NAME}]`)
  if (start === -1) {
    const existing = (text ?? '').trimEnd()
    return `${existing}${existing ? '\n\n' : ''}${block.join('\n')}\n`
  }
  let end = lines.findIndex((line, index) => index > start && /^\s*\[/.test(line))
  if (end === -1) end = lines.length
  // 这一段后面跟着的空行留给下一段。
  while (end > start + 1 && lines[end - 1]!.trim() === '') end -= 1
  lines.splice(start, end - start, ...block)
  return `${lines.join('\n').trimEnd()}\n`
}
