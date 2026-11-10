import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

declare const __MOTIF_CLI_VERSION__: string | undefined
/** 打包时写进来（scripts/build.mjs）；直接跑源码（测试）时没有。 */
export const VERSION = typeof __MOTIF_CLI_VERSION__ === 'string' ? __MOTIF_CLI_VERSION__ : '0.0.0-dev'

/**
 * 站点分发这个文件时，把占位符换成它自己的地址（apps/web/src/app/cli/[file]/route.ts）：
 * 从哪个站点下载的 CLI，默认就连哪个站点，不用用户再配一次。
 */
const BUILT_IN_ORIGIN = '__MOTIF_ORIGIN__'

/** 出了用户能处理的问题：只打印这句话（和下一步怎么办），不打印调用栈。 */
export class CliError extends Error {
  readonly hint: string | undefined
  /** 站点返回的 HTTP 状态码（请求没发出去时没有）。 */
  readonly status: number | undefined
  constructor(message: string, hint?: string, status?: number) {
    super(message)
    this.hint = hint
    this.status = status
  }
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

/** 只接受 https；http 只给本机开发用——API 密钥不能明文走公网。 */
export function normalizeOrigin(raw: string): string {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new CliError(`"${raw}" is not a URL (expected something like https://example.com)`)
  }
  const local = LOCAL_HOSTS.has(url.hostname) || url.hostname.endsWith('.localhost')
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) throw new CliError(`refusing to talk to ${raw}: your API key would travel unencrypted. Use an https:// address.`)
  return url.origin
}

/** 站点地址：命令行 > 环境变量 > 下载这份 CLI 的站点。 */
export function resolveOrigin(flag: string | undefined, env: NodeJS.ProcessEnv = process.env): string {
  const raw = flag ?? env.MOTIF_ORIGIN ?? (/^https?:\/\//.test(BUILT_IN_ORIGIN) ? BUILT_IN_ORIGIN : undefined)
  if (!raw) throw new CliError('no site address: pass --origin https://… or set MOTIF_ORIGIN')
  return normalizeOrigin(raw)
}

export interface StoredKey {
  key: string
  name: string
  savedAt: string
}

/** 密钥按站点分开存：一个站点的密钥永远不会发给另一个地址（比如 --origin 指到别处时）。 */
export interface Config {
  keys: Record<string, StoredKey>
}

export function configFile(env: NodeJS.ProcessEnv = process.env): string {
  return path.join(env.MOTIF_CONFIG_DIR || path.join(os.homedir(), '.motif'), 'config.json')
}

export function readConfig(file = configFile()): Config {
  let text: string
  try {
    text = fs.readFileSync(file, 'utf8')
  } catch {
    return { keys: {} }
  }
  try {
    const parsed = JSON.parse(text) as Partial<Config> | null
    return { keys: parsed && typeof parsed.keys === 'object' && parsed.keys ? parsed.keys : {} }
  } catch {
    // 不悄悄当成空的再覆盖掉：里面可能还有别的站点的密钥。
    throw new CliError(`${file} is not valid JSON`, 'fix it or delete it, then run "motif login" again')
  }
}

export function writeConfig(config: Config, file = configFile()): void {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 })
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 })
  // 文件已经存在时 writeFile 的 mode 不生效；Windows 上 chmod 没有意义，文件在用户目录里靠 ACL 保护。
  if (process.platform !== 'win32') fs.chmodSync(file, 0o600)
}

/** 这个站点的密钥：环境变量（CI 用）优先，其次是 login 存下的。 */
export function keyFor(origin: string, env: NodeJS.ProcessEnv = process.env): string | null {
  return env.MOTIF_API_KEY || readConfig(configFile(env)).keys[origin]?.key || null
}

export interface Context {
  origin: string
  /** 输出原始 JSON（给脚本和 agent 读），不排版。 */
  json: boolean
}

/** 进度和提示写到标准错误：标准输出只放结果，管道和 --json 才干净。 */
export function note(message: string): void {
  process.stderr.write(`${message}\n`)
}

const colors = process.stdout.isTTY && !process.env.NO_COLOR
const paint = (code: number) => (text: string) => (colors ? `\u001b[${code}m${text}\u001b[0m` : text)
export const bold = paint(1)
export const dim = paint(2)
export const green = paint(32)
export const yellow = paint(33)
