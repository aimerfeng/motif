import { HttpError } from '@/lib/community/http'

/*
 * 用户仓库用到的 GitHub 接口（docs/decisions/0009-accounts-credits-repos.md 第 4 节）。
 * 有用户的令牌就用它（每小时 5000 次，能看到他自己的仓库）；没有就匿名（每台服务器每小时 60 次，只能读公开仓库），
 * 配了 MOTIF_GITHUB_TOKEN 时匿名请求改用它。
 */

const API = 'https://api.github.com'
export const FULL_NAME = /^[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/
/** 下载 zipball 的上限（压缩后）。超过就不导入，告诉用户仓库太大。 */
const MAX_ZIP_BYTES = 40 * 1024 * 1024

function headers(token: string | null): Record<string, string> {
  const auth = token ?? process.env.MOTIF_GITHUB_TOKEN ?? null
  return { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'motif', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) }
}

async function call<T>(path: string, token: string | null, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method: init.method ?? 'GET',
    headers: { ...headers(token), ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(30_000),
  })
  if (response.ok) return (response.status === 204 ? null : await response.json()) as T
  const detail = ((await response.json().catch(() => null)) as { message?: string } | null)?.message ?? response.statusText
  if (response.status === 404) throw new HttpError(404, 'GitHub: repository not found (or it is private)')
  if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') throw new HttpError(429, 'GitHub rate limit reached; connect your GitHub account or try again later')
  if (response.status === 401) throw new HttpError(401, 'GitHub rejected the token; sign in with GitHub again', { code: 'github_auth' })
  throw new HttpError(response.status === 422 ? 409 : 502, `GitHub: ${detail}`)
}

export interface GitHubRepo {
  fullName: string
  name: string
  description: string
  private: boolean
  fork: boolean
  defaultBranch: string
  stars: number
  updatedAt: string
  htmlUrl: string
  owner: string
}

interface RawRepo {
  full_name: string
  name: string
  description: string | null
  private: boolean
  fork: boolean
  default_branch: string
  stargazers_count: number
  updated_at: string
  html_url: string
  owner: { login: string }
}

const view = (raw: RawRepo): GitHubRepo => ({
  fullName: raw.full_name,
  name: raw.name,
  description: raw.description ?? '',
  private: raw.private,
  fork: raw.fork,
  defaultBranch: raw.default_branch,
  stars: raw.stargazers_count,
  updatedAt: raw.updated_at,
  htmlUrl: raw.html_url,
  owner: raw.owner.login,
})

/** 用户自己的公开仓库（自己是主人的），按最近更新排序。 */
export async function listUserRepos(token: string): Promise<GitHubRepo[]> {
  const raw = await call<RawRepo[]>('/user/repos?affiliation=owner&visibility=public&sort=updated&per_page=100', token)
  return raw.map(view)
}

export async function getRepo(fullName: string, token: string | null): Promise<GitHubRepo> {
  if (!FULL_NAME.test(fullName)) throw new HttpError(400, 'expected a GitHub repository like owner/name')
  return view(await call<RawRepo>(`/repos/${fullName}`, token))
}

/** 「https://github.com/a/b」「github.com/a/b.git」「a/b」都认。 */
export function parseRepoInput(input: string): string | null {
  const trimmed = input.trim().replace(/\.git$/, '').replace(/\/+$/, '')
  const match = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+\/[^/\s#?]+)/i.exec(trimmed) ?? /^([^/\s]+\/[^/\s]+)$/.exec(trimmed)
  const name = match?.[1]
  return name && FULL_NAME.test(name) ? name : null
}

export async function headCommit(fullName: string, branch: string, token: string | null): Promise<string> {
  const ref = await call<{ object: { sha: string } }>(`/repos/${fullName}/git/ref/heads/${encodeURIComponent(branch)}`, token)
  return ref.object.sha
}

/** 下载某个提交的 zipball。边读边数字节，超过上限立即中止。 */
export async function downloadZipball(fullName: string, sha: string, token: string | null): Promise<Uint8Array> {
  const response = await fetch(`${API}/repos/${fullName}/zipball/${sha}`, { headers: headers(token), redirect: 'follow', signal: AbortSignal.timeout(120_000) })
  if (!response.ok || !response.body) throw new HttpError(502, `GitHub: could not download ${fullName} (${response.status})`)
  const declared = Number(response.headers.get('content-length'))
  if (declared > MAX_ZIP_BYTES) throw new HttpError(413, 'this repository is too large to import (over 40 MB compressed)')
  const chunks: Uint8Array[] = []
  let size = 0
  const reader = response.body.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_ZIP_BYTES) {
      await reader.cancel()
      throw new HttpError(413, 'this repository is too large to import (over 40 MB compressed)')
    }
    chunks.push(value)
  }
  return new Uint8Array(Buffer.concat(chunks))
}

/** 在用户的 GitHub 下新建一个公开仓库。auto_init：空仓库不能用 Git Data 接口，先让 GitHub 建一个初始提交。 */
export async function createUserRepo(token: string, name: string, description: string): Promise<GitHubRepo> {
  return view(await call<RawRepo>('/user/repos', token, { method: 'POST', body: { name, description: description.slice(0, 300), private: false, auto_init: true } }))
}

/**
 * 把一组文件作为一个提交推到某个分支：建树（文件内容直接放在树里，GitHub 会建 blob）→ 建提交 → 移动分支。
 * 不带 base_tree：提交后的仓库正好是这组文件，没列出的文件（包括初始化时的 README）被删掉。
 */
export async function commitFiles(token: string, fullName: string, branch: string, files: Record<string, string>, message: string): Promise<string> {
  const parent = await headCommit(fullName, branch, token)
  const tree = await call<{ sha: string }>(`/repos/${fullName}/git/trees`, token, {
    method: 'POST',
    body: { tree: Object.entries(files).map(([path, content]) => ({ path, mode: '100644', type: 'blob', content })) },
  })
  const commit = await call<{ sha: string }>(`/repos/${fullName}/git/commits`, token, { method: 'POST', body: { message, tree: tree.sha, parents: [parent] } })
  await call(`/repos/${fullName}/git/refs/heads/${encodeURIComponent(branch)}`, token, { method: 'PATCH', body: { sha: commit.sha } })
  return commit.sha
}

/** 在 GitHub 上 fork 到用户名下。GitHub 异步建 fork，返回的地址可能要过几秒才能打开。 */
export async function forkOnGitHub(token: string, fullName: string): Promise<GitHubRepo> {
  return view(await call<RawRepo>(`/repos/${fullName}/forks`, token, { method: 'POST', body: { default_branch_only: true } }))
}
