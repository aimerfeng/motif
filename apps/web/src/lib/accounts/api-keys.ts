import { createHash, randomBytes } from 'node:crypto'
import { HttpError } from '@/lib/community/http'
import { all, one, run } from '@/lib/db'

/*
 * API 密钥：给 MCP 和 /api/agent 用（docs/decisions/0009-accounts-credits-repos.md 第 8 节）。
 * 明文只在创建时给用户看一次，库里只存 SHA-256。密钥本身有 32 字节随机数，不需要加盐慢哈希。
 */

const PREFIX = 'mk_'
export const MAX_KEYS = 10

export interface ApiKeyView {
  id: string
  name: string
  prefix: string
  createdAt: number
  lastUsedAt: number | null
}

const hash = (key: string) => createHash('sha256').update(key).digest('hex')

export function listKeys(userId: string): ApiKeyView[] {
  return all<ApiKeyView>('SELECT id, name, prefix, created_at AS createdAt, last_used_at AS lastUsedAt FROM api_key WHERE user_id = ? AND revoked_at IS NULL ORDER BY created_at DESC', userId)
}

function insertKey(userId: string, name: string, prefix: string, keyHash: string): ApiKeyView {
  const label = name.trim().slice(0, 40) || 'MCP'
  const count = one<{ n: number }>('SELECT COUNT(*) AS n FROM api_key WHERE user_id = ? AND revoked_at IS NULL', userId)!.n
  if (count >= MAX_KEYS) throw new HttpError(409, `you can have at most ${MAX_KEYS} keys; revoke one first`)
  const id = randomBytes(9).toString('base64url')
  const now = Date.now()
  run('INSERT INTO api_key (id, user_id, name, prefix, hash, created_at) VALUES (?, ?, ?, ?, ?, ?)', id, userId, label, prefix, keyHash, now)
  return { id, name: label, prefix, createdAt: now, lastUsedAt: null }
}

export function createKey(userId: string, name: string): { key: string; view: ApiKeyView } {
  const key = `${PREFIX}${randomBytes(32).toString('base64url')}`
  return { key, view: insertKey(userId, name, key.slice(0, 10), hash(key)) }
}

/** 密钥哈希和前缀的格式：CLI 登录时由客户端提交（lib/accounts/cli-login.ts），不合格式的不收。 */
export const KEY_HASH = /^[0-9a-f]{64}$/
export const KEY_PREFIX = /^mk_[A-Za-z0-9_-]{7}$/

/** 登记一个在用户机器上生成的密钥（CLI 登录）：站点只见过它的哈希。和网页上新建的密钥共用数量上限。 */
export function adoptKey(userId: string, name: string, prefix: string, keyHash: string): ApiKeyView {
  if (one('SELECT 1 FROM api_key WHERE hash = ?', keyHash)) throw new HttpError(409, 'this key is already registered; run the login again')
  return insertKey(userId, name, prefix, keyHash)
}

export function revokeKey(userId: string, id: string): void {
  const { changes } = run('UPDATE api_key SET revoked_at = ? WHERE id = ? AND user_id = ? AND revoked_at IS NULL', Date.now(), id, userId)
  if (changes === 0) throw new HttpError(404, 'no such key')
}

export interface ApiKeyIdentity {
  id: string
  userId: string
  name: string
  prefix: string
}

/** 请求头里的密钥是哪一个；没带是 null，带了但不对是 401（带错密钥不能悄悄当成没登录）。 */
export function apiKeyOf(request: Request): ApiKeyIdentity | null {
  const header = request.headers.get('authorization') ?? ''
  const match = /^Bearer\s+(\S+)$/i.exec(header)
  if (!match) return null
  const key = match[1]!
  if (!key.startsWith(PREFIX)) throw new HttpError(401, 'invalid API key; create one at /account/keys')
  const row = one<{ id: string; user_id: string; name: string; prefix: string; last_used_at: number | null }>(
    'SELECT id, user_id, name, prefix, last_used_at FROM api_key WHERE hash = ? AND revoked_at IS NULL',
    hash(key),
  )
  if (!row) throw new HttpError(401, 'invalid or revoked API key; create one at /account/keys')
  // 最近使用时间只为了让用户认出哪个密钥还在用，精确到分钟就够，不用每个请求都写库。
  const now = Date.now()
  if (!row.last_used_at || now - row.last_used_at > 60_000) run('UPDATE api_key SET last_used_at = ? WHERE id = ?', now, row.id)
  return { id: row.id, userId: row.user_id, name: row.name, prefix: row.prefix }
}

/** 请求头里的密钥对应的用户；没带是 null，带了但不对是 401。 */
export function userFromApiKey(request: Request): string | null {
  return apiKeyOf(request)?.userId ?? null
}
