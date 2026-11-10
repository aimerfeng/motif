import { randomBytes, randomInt } from 'node:crypto'
import { HttpError } from '@/lib/community/http'
import { one, run, transaction } from '@/lib/db'
import { adoptKey, KEY_HASH, KEY_PREFIX } from './api-keys'

/*
 * CLI 登录（docs/decisions/0011-cli-and-agent-onboarding.md）：终端里的 CLI 拿不到网页的登录状态，
 * 所以它发起一个请求，用户在浏览器里（已登录）核对确认码后同意。
 * 密钥由 CLI 在本机生成，交给站点的只有 SHA-256：站点从头到尾不经手明文，同意时把这个哈希登记成用户的一个 API 密钥。
 */

/** 请求十分钟内有效：够人打开浏览器、登录、确认，又不让一个没人管的请求长期挂着。 */
export const LOGIN_TTL_MS = 10 * 60_000
/** 过期的请求再留一小时：CLI 还在轮询时能得到「过期了」，而不是「没有这个请求」。 */
const KEEP_MS = 60 * 60_000
/** 确认码的字母表：去掉了容易看错的 0/O、1/I/L 和元音（拼不出词）。 */
const ALPHABET = 'BCDFGHJKMNPQRSTVWXZ23456789'
const CODE_LENGTH = 8

export type LoginStatus = 'pending' | 'approved' | 'denied' | 'expired'

interface LoginRow {
  id: string
  user_code: string
  key_hash: string
  key_prefix: string
  name: string
  status: 'pending' | 'approved' | 'denied'
  created_at: number
  expires_at: number
}

/** 人输入的确认码：不分大小写，连字符和空格可有可无。 */
export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export const displayCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`

function newCode(): string {
  return Array.from({ length: CODE_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
}

export function startLogin(input: { keyHash: unknown; keyPrefix: unknown; name: unknown }): { id: string; userCode: string; expiresIn: number } {
  const { keyHash, keyPrefix } = input
  if (typeof keyHash !== 'string' || !KEY_HASH.test(keyHash)) throw new HttpError(400, '"keyHash" must be the SHA-256 of the key, 64 hex characters')
  if (typeof keyPrefix !== 'string' || !KEY_PREFIX.test(keyPrefix)) throw new HttpError(400, '"keyPrefix" must be the first 10 characters of the key (mk_…)')
  const name = (typeof input.name === 'string' ? input.name : '').trim().slice(0, 40) || 'motif CLI'
  const now = Date.now()
  run('DELETE FROM cli_login WHERE expires_at < ?', now - KEEP_MS)
  const id = randomBytes(24).toString('base64url')
  const userCode = newCode()
  run('INSERT INTO cli_login (id, user_code, key_hash, key_prefix, name, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)', id, userCode, keyHash, keyPrefix, name, now, now + LOGIN_TTL_MS)
  return { id, userCode: displayCode(userCode), expiresIn: LOGIN_TTL_MS / 1000 }
}

const statusOf = (row: LoginRow, now: number): LoginStatus => (row.status === 'pending' && row.expires_at < now ? 'expired' : row.status)

/** CLI 轮询：只有发起请求的那个 CLI 知道 id。 */
export function loginStatus(id: string): LoginStatus {
  const row = one<LoginRow>('SELECT * FROM cli_login WHERE id = ?', id)
  if (!row) throw new HttpError(404, 'no such login request; run the login again')
  return statusOf(row, Date.now())
}

export interface PendingLogin {
  code: string
  name: string
  keyPrefix: string
  createdAt: number
}

/** 确认页上给用户核对的内容；确认码不对、已经处理过或过期了都是 null。 */
export function pendingLogin(code: string): PendingLogin | null {
  const row = one<LoginRow>('SELECT * FROM cli_login WHERE user_code = ?', normalizeCode(code))
  if (!row || statusOf(row, Date.now()) !== 'pending') return null
  return { code: displayCode(row.user_code), name: row.name, keyPrefix: row.key_prefix, createdAt: row.created_at }
}

/** 用户在确认页上同意或拒绝。同意：把 CLI 那个密钥的哈希登记到这个用户名下。 */
export function resolveLogin(userId: string, code: string, action: 'approve' | 'deny'): void {
  transaction(() => {
    const row = one<LoginRow>('SELECT * FROM cli_login WHERE user_code = ?', normalizeCode(code))
    if (!row || statusOf(row, Date.now()) !== 'pending') throw new HttpError(404, 'this code is not valid any more; run the command in your terminal again')
    if (action === 'approve') adoptKey(userId, row.name, row.key_prefix, row.key_hash)
    run('UPDATE cli_login SET status = ?, user_id = ? WHERE id = ?', action === 'approve' ? 'approved' : 'denied', userId, row.id)
  })
}
