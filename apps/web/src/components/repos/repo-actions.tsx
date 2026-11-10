'use client'

import { useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { GITHUB_WRITE_SCOPE, useGitHubLink } from '@/components/account/connections'
import { useMe } from '@/components/account/me'
import { field } from '@/components/account/auth-forms'
import { buttonPrimary, buttonSecondary } from '@/components/community/ui'
import { DownloadIcon, GitHubIcon } from '@/components/icons'
import { rememberSession } from '@/components/studio/open-in-studio'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { api, ApiError, errorText } from '@/lib/api-client'

interface RepoInfo {
  id: string
  name: string
  slug: string
  description: string
  visibility: 'public' | 'private'
  /** 被管理员下架了：不能改回公开。 */
  takenDown: boolean
  ownerHandle: string
  githubRepo: string | null
  pushedRepo: string | null
  isItem: boolean
}

type Busy = 'fork' | 'studio' | 'sync' | 'push' | 'ghfork' | 'save' | 'delete' | null

/** 仓库页顶上的操作：fork、在工作台打开、下载；主人还有同步、推到 GitHub 和设置。 */
export function RepoActions({ repo, isOwner }: { repo: RepoInfo; isOwner: boolean }) {
  const t = useTranslations('repos.actions')
  const me = useMe()
  const router = useRouter()
  const pathname = usePathname()
  const linkGitHub = useGitHubLink()
  const [busy, setBusy] = useState<Busy>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string; href?: string } | null>(null)
  const [settings, setSettings] = useState(false)

  const run = async (key: Exclude<Busy, null>, action: () => Promise<void>) => {
    setBusy(key)
    setMessage(null)
    try {
      await action()
    } catch (error) {
      // GitHub 没关联或者没给建仓库的权限：直接带去 GitHub 授权，回来接着点。
      if (error instanceof ApiError && (error.code === 'github_scope' || error.code === 'github_connect')) {
        setMessage({ ok: false, text: t('needGitHub') })
        await linkGitHub(pathname, [GITHUB_WRITE_SCOPE])
        return
      }
      setMessage({ ok: false, text: errorText(error) })
    } finally {
      setBusy(null)
    }
  }

  const loginHref = { pathname: '/login', query: { next: pathname } }
  const signedIn = me !== null && me !== undefined

  // 下架中的仓库，不是主人还能走到这里的只有管理员：只让看，fork 和下载的接口对他一样是 404，不摆出来。
  if (repo.takenDown && !isOwner) return null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {repo.isItem &&
          (signedIn ? (
            <button
              type="button"
              disabled={busy !== null}
              className={buttonPrimary}
              onClick={() =>
                void run('studio', async () => {
                  const { id } = await api<{ id: string }>(`/api/repos/${repo.id}/studio`, { body: {} })
                  rememberSession(id)
                  router.push(`/studio/${id}`)
                })
              }
            >
              {busy === 'studio' ? t('working') : t('openInStudio')}
            </button>
          ) : (
            <Link href={loginHref} className={buttonPrimary}>
              {t('openInStudio')}
            </Link>
          ))}
        {!isOwner &&
          (signedIn ? (
            <button
              type="button"
              disabled={busy !== null}
              className={buttonSecondary}
              onClick={() =>
                void run('fork', async () => {
                  const { repo: fork } = await api<{ repo: { owner_handle: string; slug: string } }>(`/api/repos/${repo.id}/fork`, { body: {} })
                  router.push(`/u/${fork.owner_handle}/${fork.slug}`)
                })
              }
              data-testid="fork-repo"
            >
              {busy === 'fork' ? t('working') : t('fork')}
            </button>
          ) : (
            <Link href={loginHref} className={buttonSecondary}>
              {t('fork')}
            </Link>
          ))}
        <a href={`/api/repos/${repo.id}/download`} className={buttonSecondary}>
          <DownloadIcon className="size-4" />
          {t('download')}
        </a>
        {repo.githubRepo && !isOwner && signedIn && (
          <button
            type="button"
            disabled={busy !== null}
            className={buttonSecondary}
            onClick={() =>
              void run('ghfork', async () => {
                const result = await api<{ url: string }>(`/api/repos/${repo.id}/github-fork`, { body: {} })
                setMessage({ ok: true, text: t('forkedOnGitHub'), href: result.url })
              })
            }
          >
            <GitHubIcon className="size-4" />
            {busy === 'ghfork' ? t('working') : t('forkOnGitHub')}
          </button>
        )}
        {isOwner && repo.githubRepo && (
          <button
            type="button"
            disabled={busy !== null}
            className={buttonSecondary}
            onClick={() => {
              if (!window.confirm(t('confirmSync', { repo: repo.githubRepo! }))) return
              void run('sync', async () => {
                const result = await api<{ changed: boolean }>(`/api/repos/${repo.id}/sync`, { body: {} })
                setMessage({ ok: true, text: result.changed ? t('synced') : t('upToDate') })
                router.refresh()
              })
            }}
          >
            {busy === 'sync' ? t('working') : t('sync')}
          </button>
        )}
        {isOwner && (
          <button
            type="button"
            disabled={busy !== null}
            className={buttonSecondary}
            onClick={() =>
              void run('push', async () => {
                const result = await api<{ url: string; fullName: string }>(`/api/repos/${repo.id}/push`, { body: {} })
                setMessage({ ok: true, text: t('pushed', { repo: result.fullName }), href: result.url })
                router.refresh()
              })
            }
            data-testid="push-repo"
          >
            <GitHubIcon className="size-4" />
            {busy === 'push' ? t('working') : repo.pushedRepo ? t('pushAgain') : t('push')}
          </button>
        )}
        {isOwner && (
          <>
            <Link href={{ pathname: `/u/${repo.ownerHandle}/${repo.slug}`, query: { new: '1' } }} className={buttonSecondary}>
              {t('newFile')}
            </Link>
            <button type="button" aria-expanded={settings} className={buttonSecondary} onClick={() => setSettings((value) => !value)}>
              {t('settings')}
            </button>
          </>
        )}
      </div>
      {message && (
        <p className={`text-[13px] ${message.ok ? 'text-success' : 'text-danger'}`}>
          {message.text}{' '}
          {message.href && (
            <a href={message.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              {message.href.replace(/^https:\/\//, '')}
            </a>
          )}
        </p>
      )}
      {isOwner && settings && <RepoSettings repo={repo} busy={busy} run={run} />}
    </div>
  )
}

function RepoSettings({ repo, busy, run }: { repo: RepoInfo; busy: Busy; run: (key: Exclude<Busy, null>, action: () => Promise<void>) => Promise<void> }) {
  const t = useTranslations('repos.settings')
  const router = useRouter()
  const [name, setName] = useState(repo.name)
  const [description, setDescription] = useState(repo.description)
  const [visibility, setVisibility] = useState(repo.visibility)

  const save = (event: FormEvent) => {
    event.preventDefault()
    void run('save', async () => {
      const { repo: updated } = await api<{ repo: { slug: string; owner_handle: string } }>(`/api/repos/${repo.id}`, { method: 'PATCH', body: { name, description, visibility } })
      router.replace(`/u/${updated.owner_handle}/${updated.slug}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={save} className="grid gap-4 rounded-[var(--radius-card)] border border-line p-5 sm:grid-cols-2">
      <label className="block">
        <span className="text-[13px] font-medium">{t('name')}</span>
        <input required maxLength={64} pattern="[A-Za-z0-9._\-]+" value={name} onChange={(event) => setName(event.target.value)} className={`mt-2 font-mono ${field}`} />
      </label>
      <label className="block">
        <span className="text-[13px] font-medium">{t('visibility')}</span>
        <select value={visibility} disabled={repo.takenDown} onChange={(event) => setVisibility(event.target.value as 'public' | 'private')} className={`mt-2 ${field} disabled:opacity-60`}>
          <option value="public">{t('public')}</option>
          <option value="private">{t('private')}</option>
        </select>
        {repo.takenDown && <span className="mt-1.5 block text-[12px] text-ink-faint">{t('takenDownHint')}</span>}
      </label>
      <label className="block sm:col-span-2">
        <span className="text-[13px] font-medium">{t('description')}</span>
        <input maxLength={300} value={description} onChange={(event) => setDescription(event.target.value)} className={`mt-2 ${field}`} />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
        <button type="submit" disabled={busy !== null} className={buttonPrimary}>
          {busy === 'save' ? t('saving') : t('save')}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          className="rounded-full border border-danger/40 px-4 py-2 text-[13.5px] text-danger transition-colors duration-150 hover:bg-danger/10 disabled:opacity-40"
          onClick={() => {
            if (window.prompt(t('confirmDelete', { name: repo.name })) !== repo.name) return
            void run('delete', async () => {
              await api(`/api/repos/${repo.id}`, { method: 'DELETE' })
              router.replace(`/u/${repo.ownerHandle}`)
              router.refresh()
            })
          }}
        >
          {t('delete')}
        </button>
      </div>
    </form>
  )
}
