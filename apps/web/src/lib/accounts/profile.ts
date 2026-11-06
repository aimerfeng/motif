import { HttpError } from '@/lib/community/http'
import { all, one, run, transaction } from '@/lib/db'

/*
 * 用户资料：每个用户一个唯一的 handle，主页 /u/<handle>，仓库 /u/<handle>/<仓库>。
 * 第一次登录时自动生成（GitHub 用户名优先，其次邮箱前半段），之后用户可以改。
 */

export const HANDLE = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/

/** 会和站点路由、常见系统名混淆的名字不给用。 */
const RESERVED = new Set([
  'admin', 'administrator', 'api', 'app', 'account', 'accounts', 'auth', 'login', 'logout', 'signin', 'signup', 'register', 'settings', 'market', 'studio',
  'community', 'docs', 'lab', 'pricing', 'credits', 'mcp', 'r', 'skill', 'skills', 'u', 'user', 'users', 'motif', 'root', 'support', 'help', 'about',
  'new', 'null', 'undefined', 'system', 'official', 'staff', 'team', 'www', 'mail', 'email', 'noreply', 'no-reply', 'security', 'billing',
])

export function handleProblem(handle: string): 'format' | 'reserved' | null {
  if (!HANDLE.test(handle)) return 'format'
  if (RESERVED.has(handle)) return 'reserved'
  return null
}

/** 把任意字符串收拾成一个合法 handle 的样子（还可能和别人重名）。 */
export function handleBase(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28)
    .replace(/-+$/, '')
  if (cleaned.length < 3 || RESERVED.has(cleaned)) return `${cleaned || 'user'}-motif`.replace(/^-/, '').slice(0, 28)
  return cleaned
}

function handleTaken(handle: string, exceptUser?: string): boolean {
  return one<{ user_id: string }>('SELECT user_id FROM profile WHERE handle = ? AND user_id != ?', handle, exceptUser ?? '') !== undefined
}

/** 第一个没人用的：base、base-2、base-3……再不行就加随机数。 */
export function uniqueHandle(base: string): string {
  if (!handleTaken(base)) return base
  for (let n = 2; n < 50; n++) {
    const candidate = `${base.slice(0, 28)}-${n}`
    if (!handleTaken(candidate)) return candidate
  }
  return `${base.slice(0, 24)}-${Math.random().toString(36).slice(2, 7)}`
}

export interface Profile {
  user_id: string
  handle: string
  github_login: string | null
  bio: string
  created_at: number
}

export interface PublicUser {
  id: string
  handle: string
  name: string
  image: string | null
  bio: string
  githubLogin: string | null
  createdAt: number
}

/** 第一次登录时建资料。已经有了就原样返回（钩子重试、并发时不会建两份）。 */
export function ensureProfile(user: { id: string; email: string; name: string; githubLogin?: string | null }): Profile {
  return transaction(() => {
    const existing = one<Profile>('SELECT * FROM profile WHERE user_id = ?', user.id)
    if (existing) return existing
    const handle = uniqueHandle(handleBase(user.githubLogin || user.email.split('@')[0] || user.name))
    run('INSERT INTO profile (user_id, handle, github_login, bio, created_at) VALUES (?, ?, ?, ?, ?)', user.id, handle, user.githubLogin ?? null, '', Date.now())
    return one<Profile>('SELECT * FROM profile WHERE user_id = ?', user.id)!
  })
}

export function profileOf(userId: string): Profile | undefined {
  return one<Profile>('SELECT * FROM profile WHERE user_id = ?', userId)
}

const PUBLIC_USER = `SELECT u.id, p.handle, u.name, u.image, p.bio, p.github_login AS githubLogin, u.createdAt AS createdAt FROM profile p JOIN "user" u ON u.id = p.user_id`

/** Better Auth 存的时间是 ISO 字符串或毫秒数，统一成毫秒。 */
function normalize(row: PublicUser & { createdAt: unknown }): PublicUser {
  const created = typeof row.createdAt === 'number' ? row.createdAt : Date.parse(String(row.createdAt))
  return { ...row, createdAt: Number.isFinite(created) ? created : 0 }
}

export function userByHandle(handle: string): PublicUser | undefined {
  const row = one<PublicUser & { createdAt: unknown }>(`${PUBLIC_USER} WHERE p.handle = ?`, handle)
  return row && normalize(row)
}

export function userById(id: string): PublicUser | undefined {
  const row = one<PublicUser & { createdAt: unknown }>(`${PUBLIC_USER} WHERE u.id = ?`, id)
  return row && normalize(row)
}

export function usersById(ids: string[]): Map<string, PublicUser> {
  if (ids.length === 0) return new Map()
  const rows = all<PublicUser & { createdAt: unknown }>(`${PUBLIC_USER} WHERE u.id IN (${ids.map(() => '?').join(',')})`, ...ids)
  return new Map(rows.map((row) => [row.id, normalize(row)]))
}

export const BIO_MAX = 160

export function updateProfile(userId: string, changes: { handle?: string; bio?: string }): Profile {
  return transaction(() => {
    const current = profileOf(userId)
    if (!current) throw new HttpError(404, 'no profile')
    let handle = current.handle
    if (changes.handle !== undefined && changes.handle !== current.handle) {
      const problem = handleProblem(changes.handle)
      if (problem === 'format') throw new HttpError(400, 'handle must be 3–32 lowercase letters, digits or dashes, not starting or ending with a dash')
      if (problem === 'reserved') throw new HttpError(400, 'this handle is reserved')
      if (handleTaken(changes.handle, userId)) throw new HttpError(409, 'this handle is taken')
      handle = changes.handle
    }
    const bio = changes.bio === undefined ? current.bio : changes.bio.trim().slice(0, BIO_MAX)
    run('UPDATE profile SET handle = ?, bio = ? WHERE user_id = ?', handle, bio, userId)
    return { ...current, handle, bio }
  })
}

export function setGitHubLogin(userId: string, login: string): void {
  run('UPDATE profile SET github_login = ? WHERE user_id = ?', login, userId)
  run('UPDATE "user" SET githubLogin = ? WHERE id = ?', login, userId)
}
