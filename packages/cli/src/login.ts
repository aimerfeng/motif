import { spawn } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import os from 'node:os'
import { http } from './api.ts'
import { bold, CliError, configFile, dim, green, keyFor, note, readConfig, writeConfig, type Context } from './context.ts'

/*
 * 登录（站点那一半在 apps/web/src/lib/accounts/cli-login.ts）：密钥在本机生成，交给站点的只有它的 SHA-256；
 * 用户在浏览器里（已登录）核对确认码、点同意，站点才把这个哈希登记成他的 API 密钥。
 * 明文密钥只存在这台机器的 ~/.motif/config.json 里。
 */

interface StartResponse {
  id: string
  userCode: string
  verifyUrl: string
  expiresIn: number
  interval: number
}

/** 密钥的格式和站点自己发的一样：mk_ + 32 个随机字节。前 10 个字符是给人认的前缀。 */
export function newKey(): { key: string; hash: string; prefix: string } {
  const key = `mk_${randomBytes(32).toString('base64url')}`
  return { key, hash: createHash('sha256').update(key).digest('hex'), prefix: key.slice(0, 10) }
}

/** 尽力打开浏览器；打不开没关系，地址已经打印出来了。不经过 shell：地址不会被当成命令解析。 */
function openBrowser(url: string): void {
  const [command, args] =
    process.platform === 'win32' ? ['rundll32', ['url.dll,FileProtocolHandler', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]]
  try {
    const child = spawn(command as string, args as string[], { stdio: 'ignore', detached: true })
    child.on('error', () => undefined)
    child.unref()
  } catch {
    // 没有图形界面的机器（SSH、容器）：用户自己把地址复制到浏览器里。
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function login(context: Context, options: { browser: boolean; name?: string }): Promise<void> {
  const fresh = newKey()
  const name = (options.name ?? `CLI · ${os.hostname()}`).slice(0, 40)
  const started = await http<StartResponse>(context, 'POST', '/api/cli/login', { key: null, body: { keyHash: fresh.hash, keyPrefix: fresh.prefix, name } })

  note('')
  note(`  Confirm this sign-in in your browser:`)
  note(`  ${bold(started.verifyUrl)}`)
  note('')
  note(`  Check that the page shows this code: ${bold(started.userCode)}`)
  note('')
  if (options.browser) openBrowser(started.verifyUrl)
  note(dim('  Waiting for you to approve…'))

  const deadline = Date.now() + started.expiresIn * 1000
  let status = 'pending'
  while (status === 'pending' && Date.now() < deadline) {
    await sleep(Math.max(1, started.interval) * 1000)
    status = (await http<{ status: string }>(context, 'GET', `/api/cli/login/${encodeURIComponent(started.id)}`, { key: null })).status
  }
  if (status === 'denied') throw new CliError('the sign-in was declined in the browser')
  if (status !== 'approved') throw new CliError('the sign-in was not confirmed in time', 'run the command again')

  const config = readConfig()
  const previous = config.keys[context.origin]?.key
  config.keys[context.origin] = { key: fresh.key, name, savedAt: new Date().toISOString() }
  writeConfig(config)
  // 换下来的旧密钥不该继续有效；吊销失败（比如它早就被吊销了）不影响这次登录。
  if (previous) await http(context, 'DELETE', '/api/cli/me', { key: previous }).catch(() => undefined)

  const me = await whoami(context)
  note(`${green('✓')} Signed in as ${bold(me.user.handle ? `@${me.user.handle}` : me.user.name)} · ${me.balance} credits · key saved in ${configFile()}`)
}

export interface Me {
  user: { name: string; handle: string | null }
  key: { name: string; prefix: string }
  balance: number
}

export function whoami(context: Context): Promise<Me> {
  return http<Me>(context, 'GET', '/api/cli/me')
}

/** 没登录就先登录（setup 和要花积分的命令用）。 */
export async function ensureLogin(context: Context, browser = true): Promise<void> {
  if (!keyFor(context.origin)) await login(context, { browser })
}

export async function logout(context: Context): Promise<void> {
  const config = readConfig()
  const stored = config.keys[context.origin]
  if (!stored) {
    note(`Not signed in to ${context.origin}.`)
    return
  }
  // 先吊销再删本地：本机删掉的密钥不该在服务器上继续有效。已经失效的密钥（401）当作吊销成功。
  await http(context, 'DELETE', '/api/cli/me', { key: stored.key }).catch((error: unknown) => {
    if (!(error instanceof CliError) || error.status !== 401) throw error
  })
  delete config.keys[context.origin]
  writeConfig(config)
  note(`${green('✓')} Signed out of ${context.origin}; the key was revoked.`)
}
