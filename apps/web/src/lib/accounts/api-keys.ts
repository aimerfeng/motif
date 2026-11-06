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

export function createKey(userId: string, name: string): { key: string; view: ApiKeyView } {
  const label = name.trim().slice(0, 40) || 'MCP'
  const count = one<{ n: number }>('SELECT COUNT(*) AS n FROM api_key WHERE user_id = ? AND revoked_at IS NULL', userId)!.n
  if (count >= MAX_KEYS) throw new HttpError(409, `you can have at most ${MAX_KEYS} keys; revoke one first`)
  const key = `${PREFIX}${randomBytes(32).toString('base64url')}`
  const id = randomBytes(9).toString('base64url')
  const now = Date.now()
  run('INSERT INTO api_key (id, user_id, name, prefix, hash, created_at) VALUES (?, ?, ?, ?, ?, ?)', id, userId, label, key.slice(0, 10), hash(key), now)
  return { key, view: { id, name: label, prefix: key.slice(0, 10), createdAt: now, lastUsedAt: null } }
}

export function revokeKey(userId: string, id: string): void {
  const { changes } = run('UPDATE api_key SET revoked_at = ? WHERE id = ? AND user_id = ? AND revoked_at IS NULL', Date.now(), id, userId)
  if (changes === 0) throw new HttpError(404, 'no such key')
}

/** 请求头里的密钥对应的用户；没带是 null，带了但不对是 401（带错密钥不能悄悄当成没登录）。 */
export function userFromApiKey(request: Request): string | null {
  const header = request.headers.get('authorization') ?? ''
  const match = /^Bearer\s+(\S+)$/i.exec(header)
  if (!match) return null
  const key = match[1]!
  if (!key.startsWith(PREFIX)) throw new HttpError(401, 'invalid API key; create one at /account/keys')
  const row = one<{ id: string; user_id: string; last_used_at: number | null }>('SELECT id, user_id, last_used_at FROM api_key WHERE hash = ? AND revoked_at IS NULL', hash(key))
  if (!row) throw new HttpError(401, 'invalid or revoked API key; create one at /account/keys')
  // 最近使用时间只为了让用户认出哪个密钥还在用，精确到分钟就够，不用每个请求都写库。
  const now = Date.now()
  if (!row.last_used_at || now - row.last_used_at > 60_000) run('UPDATE api_key SET last_used_at = ? WHERE id = ?', now, row.id)
  return row.user_id
}
