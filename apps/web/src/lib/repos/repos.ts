import { randomBytes } from 'node:crypto'
import type { ItemManifest, ItemSource } from '@motif/schema'
import { profileOf } from '@/lib/accounts/profile'
import { HttpError } from '@/lib/community/http'
import { marketSource } from '@/lib/community/market-source'
import { all, one, run, transaction } from '@/lib/db'
import { assertWithinLimits, byteLength, filesFromZip, LIMITS, normalizeFiles, normalizePath, type SkipReport } from './files'
import { commitFiles, createUserRepo, downloadZipball, forkOnGitHub, getRepo, headCommit, type GitHubRepo } from './github'

/*
 * 用户仓库（docs/decisions/0009-accounts-credits-repos.md 第 4 节）：一组文本文件，存在 SQLite 里。
 * 地址是 /u/<handle>/<slug>；slug 是名字的小写。私有仓库对别人一律 404。
 */

export type Visibility = 'public' | 'private'
export type RepoSource = 'empty' | 'github' | 'fork' | 'item' | 'studio'

export interface Repo {
  id: string
  owner_id: string
  slug: string
  name: string
  description: string
  visibility: Visibility
  source: RepoSource
  /** 来源的说明：GitHub 仓库全名、条目 slug、工作台会话 id。 */
  source_ref: string | null
  forked_from: string | null
  /** 从 GitHub 导入的仓库和导入时的提交，「从 GitHub 同步」用。 */
  github_repo: string | null
  github_commit: string | null
  /** 推到了用户 GitHub 的哪个仓库，再推就在它上面加提交。 */
  pushed_repo: string | null
  file_count: number
  total_bytes: number
  fork_count: number
  created_at: number
  updated_at: number
}

/** 仓库所在的地址：主人的 handle + slug。 */
export interface RepoWithOwner extends Repo {
  owner_handle: string
  owner_name: string
}

/** 和 GitHub 一样：字母、数字、点、横线、下划线，不能只有点。 */
export const REPO_NAME = /^(?!\.+$)[A-Za-z0-9._-]{1,64}$/
/** 条目仓库的清单文件：有它就能「在工作台打开」。 */
export const MANIFEST_FILE = 'motif.manifest.json'

const WITH_OWNER = `SELECT r.*, p.handle AS owner_handle, u.name AS owner_name FROM repo r JOIN profile p ON p.user_id = r.owner_id JOIN "user" u ON u.id = r.owner_id`

export function checkRepoName(name: string): string {
  const trimmed = name.trim()
  if (!REPO_NAME.test(trimmed)) throw new HttpError(400, 'a repository name is 1–64 letters, digits, dots, dashes or underscores')
  return trimmed
}

/** 没被自己占用的名字：name、name-2、name-3…… */
function freeName(ownerId: string, name: string): string {
  const base = name.slice(0, 58)
  if (!one('SELECT 1 AS yes FROM repo WHERE owner_id = ? AND slug = ?', ownerId, base.toLowerCase())) return base
  for (let n = 2; n < 100; n++) if (!one('SELECT 1 AS yes FROM repo WHERE owner_id = ? AND slug = ?', ownerId, `${base}-${n}`.toLowerCase())) return `${base}-${n}`
  throw new HttpError(409, 'pick a different repository name')
}

function writeFiles(repoId: string, raw: Record<string, string>): void {
  const files = normalizeFiles(raw)
  const { count, bytes } = assertWithinLimits(files)
  run('DELETE FROM repo_file WHERE repo_id = ?', repoId)
  for (const [path, content] of Object.entries(files)) run('INSERT INTO repo_file (repo_id, path, content, size) VALUES (?, ?, ?, ?)', repoId, path, content, byteLength(content))
  run('UPDATE repo SET file_count = ?, total_bytes = ?, updated_at = ? WHERE id = ?', count, bytes, Date.now(), repoId)
}

interface NewRepo {
  ownerId: string
  name: string
  description?: string
  visibility?: Visibility
  source: RepoSource
  sourceRef?: string | null
  forkedFrom?: string | null
  githubRepo?: string | null
  githubCommit?: string | null
  files: Record<string, string>
  /** 名字被自己占用时自动加数字，而不是报错（导入、fork 用；新建时用户自己起名，重名要告诉他）。 */
  autoRename?: boolean
}

export function createRepo(input: NewRepo): RepoWithOwner {
  return transaction(() => {
    const count = one<{ n: number }>('SELECT COUNT(*) AS n FROM repo WHERE owner_id = ?', input.ownerId)!.n
    if (count >= LIMITS.reposPerUser) throw new HttpError(409, `you can have at most ${LIMITS.reposPerUser} repositories`)
    let name = checkRepoName(input.name)
    if (input.autoRename) name = freeName(input.ownerId, name)
    else if (one('SELECT 1 AS yes FROM repo WHERE owner_id = ? AND slug = ?', input.ownerId, name.toLowerCase())) throw new HttpError(409, `you already have a repository named "${name}"`)
    const id = randomBytes(9).toString('base64url')
    const now = Date.now()
    run(
      `INSERT INTO repo (id, owner_id, slug, name, description, visibility, source, source_ref, forked_from, github_repo, github_commit, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.ownerId,
      name.toLowerCase(),
      name,
      (input.description ?? '').trim().slice(0, 300),
      input.visibility ?? 'public',
      input.source,
      input.sourceRef ?? null,
      input.forkedFrom ?? null,
      input.githubRepo ?? null,
      input.githubCommit ?? null,
      now,
      now,
    )
    writeFiles(id, input.files)
    return repoById(id)!
  })
}

export function repoById(id: string): RepoWithOwner | undefined {
  return one<RepoWithOwner>(`${WITH_OWNER} WHERE r.id = ?`, id)
}

/** 别人能看到的仓库：私有的只有主人能看到，对别人和不存在一样。 */
export function visibleRepo(handle: string, slug: string, viewerId: string | null): RepoWithOwner | undefined {
  const repo = one<RepoWithOwner>(`${WITH_OWNER} WHERE p.handle = ? AND r.slug = ?`, handle, slug.toLowerCase())
  if (!repo || (repo.visibility === 'private' && repo.owner_id !== viewerId)) return undefined
  return repo
}

/** 主人才能改：不是主人一律 404（不暴露私有仓库存在）。 */
export function ownedRepo(id: string, userId: string): RepoWithOwner {
  const repo = repoById(id)
  if (!repo || repo.owner_id !== userId) throw new HttpError(404, 'no such repository')
  return repo
}

export function reposOf(ownerId: string, includePrivate: boolean): RepoWithOwner[] {
  return includePrivate
    ? all<RepoWithOwner>(`${WITH_OWNER} WHERE r.owner_id = ? ORDER BY r.updated_at DESC`, ownerId)
    : all<RepoWithOwner>(`${WITH_OWNER} WHERE r.owner_id = ? AND r.visibility = 'public' ORDER BY r.updated_at DESC`, ownerId)
}

export function recentPublicRepos(limit = 24): RepoWithOwner[] {
  return all<RepoWithOwner>(`${WITH_OWNER} WHERE r.visibility = 'public' AND r.file_count > 0 ORDER BY r.updated_at DESC LIMIT ?`, limit)
}

export interface RepoFileEntry {
  path: string
  size: number
}

export function fileList(repoId: string): RepoFileEntry[] {
  return all<RepoFileEntry>('SELECT path, size FROM repo_file WHERE repo_id = ? ORDER BY path', repoId)
}

export function fileContent(repoId: string, path: string): string | null {
  return one<{ content: string }>('SELECT content FROM repo_file WHERE repo_id = ? AND path = ?', repoId, path)?.content ?? null
}

export function allFiles(repoId: string): Record<string, string> {
  return Object.fromEntries(all<{ path: string; content: string }>('SELECT path, content FROM repo_file WHERE repo_id = ? ORDER BY path', repoId).map((row) => [row.path, row.content]))
}

/** 新建或覆盖一个文件。 */
export function putFile(repo: Repo, rawPath: string, content: string): void {
  const path = normalizePath(rawPath)
  if (!path) throw new HttpError(400, 'invalid file path')
  transaction(() => {
    const files = allFiles(repo.id)
    files[path] = content.replaceAll('\r\n', '\n')
    writeFiles(repo.id, files)
  })
}

export function deleteFile(repo: Repo, path: string): void {
  transaction(() => {
    const { changes } = run('DELETE FROM repo_file WHERE repo_id = ? AND path = ?', repo.id, path)
    if (changes === 0) throw new HttpError(404, 'no such file')
    const stats = one<{ n: number; bytes: number | null }>('SELECT COUNT(*) AS n, SUM(size) AS bytes FROM repo_file WHERE repo_id = ?', repo.id)!
    run('UPDATE repo SET file_count = ?, total_bytes = ?, updated_at = ? WHERE id = ?', stats.n, stats.bytes ?? 0, Date.now(), repo.id)
  })
}

export function updateRepo(repo: Repo, changes: { name?: string; description?: string; visibility?: Visibility }): RepoWithOwner {
  return transaction(() => {
    let name = repo.name
    if (changes.name !== undefined && changes.name.trim() !== repo.name) {
      name = checkRepoName(changes.name)
      if (one('SELECT 1 AS yes FROM repo WHERE owner_id = ? AND slug = ? AND id != ?', repo.owner_id, name.toLowerCase(), repo.id)) throw new HttpError(409, `you already have a repository named "${name}"`)
    }
    const description = changes.description === undefined ? repo.description : changes.description.trim().slice(0, 300)
    const visibility = changes.visibility ?? repo.visibility
    if (visibility !== 'public' && visibility !== 'private') throw new HttpError(400, 'visibility must be public or private')
    run('UPDATE repo SET name = ?, slug = ?, description = ?, visibility = ?, updated_at = ? WHERE id = ?', name, name.toLowerCase(), description, visibility, Date.now(), repo.id)
    return repoById(repo.id)!
  })
}

export function deleteRepo(repo: Repo): void {
  run('DELETE FROM repo WHERE id = ?', repo.id)
}

/** Fork 站内的公开仓库（或自己的私有仓库）：复制一份到自己名下。 */
export function forkRepo(source: RepoWithOwner, userId: string): RepoWithOwner {
  if (source.visibility === 'private' && source.owner_id !== userId) throw new HttpError(404, 'no such repository')
  return transaction(() => {
    const fork = createRepo({
      ownerId: userId,
      name: source.name,
      description: source.description,
      // 别人的仓库只有公开的能 fork；自己的私有仓库 fork 出来也是私有的，不能借 fork 公开出去。
      visibility: source.visibility,
      source: 'fork',
      sourceRef: `${source.owner_handle}/${source.slug}`,
      forkedFrom: source.id,
      githubRepo: source.github_repo,
      githubCommit: source.github_commit,
      files: allFiles(source.id),
      autoRename: true,
    })
    run('UPDATE repo SET fork_count = fork_count + 1 WHERE id = ?', source.id)
    return fork
  })
}

/** 条目 ↔ 仓库：仓库里是条目的源文件，加一个 motif.manifest.json 存清单。 */
export function itemToFiles(item: ItemSource): Record<string, string> {
  return { [MANIFEST_FILE]: `${JSON.stringify(item.manifest, null, 2)}\n`, ...item.files }
}

/** 仓库能不能当条目在工作台打开：有清单，并且清单里列出的源文件都在。 */
export function itemFromRepo(repoId: string): ItemSource | null {
  const raw = fileContent(repoId, MANIFEST_FILE)
  if (!raw) return null
  let manifest: ItemManifest
  try {
    manifest = JSON.parse(raw) as ItemManifest
  } catch {
    return null
  }
  if (typeof manifest !== 'object' || manifest === null || typeof manifest.slug !== 'string' || !Array.isArray(manifest.files)) return null
  const files: Record<string, string> = {}
  for (const file of manifest.files) {
    const content = typeof file?.path === 'string' ? fileContent(repoId, file.path) : null
    if (content === null) return null
    files[file.path] = content
  }
  return { manifest, files }
}

/** Fork 市场里的条目：条目的源文件存成自己的仓库，可以接着在工作台改。 */
export async function repoFromItem(slug: string, userId: string): Promise<RepoWithOwner> {
  const item = await marketSource(slug)
  if (!item) throw new HttpError(404, `no item named "${slug}"`)
  return createRepo({ ownerId: userId, name: slug, description: item.manifest.summary.en, source: 'item', sourceRef: slug, files: itemToFiles(item), autoRename: true })
}

export interface ImportResult {
  repo: RepoWithOwner
  skipped: SkipReport
}

async function snapshot(github: GitHubRepo, token: string | null): Promise<{ sha: string; files: Record<string, string>; skipped: SkipReport }> {
  const sha = await headCommit(github.fullName, github.defaultBranch, token)
  const { files, skipped } = filesFromZip(await downloadZipball(github.fullName, sha, token))
  if (Object.keys(files).length === 0) throw new HttpError(422, 'this repository has no text files we can import')
  return { sha, files, skipped }
}

/** 从 GitHub 导入一个公开仓库（默认分支的最新提交）。 */
export async function importFromGitHub(userId: string, fullName: string, token: string | null, visibility: Visibility = 'public'): Promise<ImportResult> {
  const github = await getRepo(fullName, token)
  if (github.private) throw new HttpError(403, 'private GitHub repositories cannot be imported yet')
  const { sha, files, skipped } = await snapshot(github, token)
  const repo = createRepo({ ownerId: userId, name: github.name, description: github.description, visibility, source: 'github', sourceRef: github.fullName, githubRepo: github.fullName, githubCommit: sha, files, autoRename: true })
  return { repo, skipped }
}

/** 从 GitHub 同步：用来源仓库的最新提交整个替换文件（站内的修改会被覆盖，页面上先确认）。 */
export async function syncFromGitHub(repo: Repo, token: string | null): Promise<ImportResult & { changed: boolean }> {
  if (!repo.github_repo) throw new HttpError(400, 'this repository was not imported from GitHub')
  const github = await getRepo(repo.github_repo, token)
  // 来源后来改成了私有：不拉（服务器的匿名令牌可能看得到，但用户不一定该看到）。
  if (github.private) throw new HttpError(403, 'the GitHub repository is private now; it can no longer be synced')
  const { sha, files, skipped } = await snapshot(github, token)
  transaction(() => {
    writeFiles(repo.id, files)
    run('UPDATE repo SET github_commit = ? WHERE id = ?', sha, repo.id)
  })
  return { repo: repoById(repo.id)!, skipped, changed: sha !== repo.github_commit }
}

/** 需要 public_repo（或 repo）权限的操作：没有就让页面去 GitHub 补授权。 */
export function assertCanWrite(scopes: string[]): void {
  if (!scopes.includes('public_repo') && !scopes.includes('repo')) throw new HttpError(403, 'GitHub needs permission to create repositories for you', { code: 'github_scope', scope: 'public_repo' })
}

/** 推到用户的 GitHub：第一次新建仓库，之后在同一个仓库上加提交。返回 GitHub 上的地址。 */
export async function pushToGitHub(repo: RepoWithOwner, token: string, githubName?: string): Promise<{ url: string; fullName: string; commit: string }> {
  const files = allFiles(repo.id)
  if (Object.keys(files).length === 0) throw new HttpError(422, 'the repository is empty')
  let target: GitHubRepo | null = null
  if (repo.pushed_repo) target = await getRepo(repo.pushed_repo, token).catch(() => null)
  if (!target) {
    const name = checkRepoName(githubName ?? repo.name)
    target = await createUserRepo(token, name, repo.description || `Published from Motif: /u/${repo.owner_handle}/${repo.slug}`)
  }
  const commit = await commitFiles(token, target.fullName, target.defaultBranch, files, `Publish from Motif (${repo.owner_handle}/${repo.slug})`)
  run('UPDATE repo SET pushed_repo = ?, updated_at = ? WHERE id = ?', target.fullName, Date.now(), repo.id)
  return { url: target.htmlUrl, fullName: target.fullName, commit }
}

/** 在 GitHub 上 fork 这个仓库的来源（导入自别人的 GitHub 仓库时）。 */
export async function forkSourceOnGitHub(repo: Repo, token: string): Promise<{ url: string; fullName: string }> {
  if (!repo.github_repo) throw new HttpError(400, 'this repository did not come from GitHub')
  const fork = await forkOnGitHub(token, repo.github_repo)
  return { url: fork.htmlUrl, fullName: fork.fullName }
}

/** 用户的 handle（建仓库后跳转地址要用）。 */
export function ownerHandle(userId: string): string {
  const profile = profileOf(userId)
  if (!profile) throw new HttpError(500, 'profile missing')
  return profile.handle
}
