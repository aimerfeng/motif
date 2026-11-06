'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, type FormEvent } from 'react'
import { field } from '@/components/account/auth-forms'
import { useGitHubLink } from '@/components/account/connections'
import { buttonPrimary, buttonSecondary, EmptyState, Skeleton } from '@/components/community/ui'
import { GitHubIcon } from '@/components/icons'
import { useRouter } from '@/i18n/navigation'
import { api, errorText } from '@/lib/api-client'
import type { GitHubRepo } from '@/lib/repos/github'

type Tab = 'github' | 'empty'
interface Created {
  repo: { owner_handle: string; slug: string }
  skipped?: { binary: number; tooLarge: number; ignored: number; overLimit: number }
}

/** 新建仓库：从 GitHub 导入（自己的仓库列表，或者粘贴任意公开仓库的地址），或者建一个空仓库。 */
export function NewRepo({ githubAvailable }: { githubAvailable: boolean }) {
  const t = useTranslations('repos.new')
  const [tab, setTab] = useState<Tab>(githubAvailable ? 'github' : 'empty')
  const tabs: Tab[] = ['github', 'empty']
  return (
    <div className="space-y-8">
      <div role="tablist" className="inline-flex rounded-full border border-line p-1">
        {tabs.map((value) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className="rounded-full px-4 py-1.5 text-[13.5px] text-ink-muted transition-colors duration-150 hover:text-ink aria-selected:bg-ink aria-selected:text-canvas"
          >
            {t(`tabs.${value}`)}
          </button>
        ))}
      </div>
      {tab === 'github' ? <FromGitHub githubAvailable={githubAvailable} /> : <Empty />}
    </div>
  )
}

function useCreate() {
  const router = useRouter()
  const t = useTranslations('repos.new')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const create = async (key: string, body: Record<string, unknown>) => {
    setBusy(key)
    setError(null)
    try {
      const created = await api<Created>('/api/repos', { body })
      const skipped = created.skipped ? Object.values(created.skipped).reduce((sum, n) => sum + n, 0) : 0
      if (skipped > 0) window.alert(t('skipped', { count: skipped }))
      router.push(`/u/${created.repo.owner_handle}/${created.repo.slug}`)
    } catch (cause) {
      setError(errorText(cause))
      setBusy(null)
    }
  }
  return { busy, error, create }
}

function FromGitHub({ githubAvailable }: { githubAvailable: boolean }) {
  const t = useTranslations('repos.new')
  const link = useGitHubLink()
  const { busy, error, create } = useCreate()
  const [list, setList] = useState<{ connected: boolean; repos: GitHubRepo[] } | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api<{ connected: boolean; repos: GitHubRepo[] }>('/api/repos/github')
      .then(setList)
      .catch((cause: unknown) => setListError(errorText(cause)))
  }, [])

  const submitUrl = (event: FormEvent) => {
    event.preventDefault()
    void create('url', { mode: 'github', github: url })
  }

  const shown = (list?.repos ?? []).filter((repo) => repo.fullName.toLowerCase().includes(filter.trim().toLowerCase()))

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4">
        <h2 className="text-[15px] font-medium">{t('yours')}</h2>
        {listError && <p className="text-[13px] text-danger">{listError}</p>}
        {list === null && !listError ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : list && !list.connected ? (
          <EmptyState
            icon={GitHubIcon}
            title={githubAvailable ? t('connectFirst') : t('githubUnavailable')}
            action={
              githubAvailable ? (
                <button type="button" className={buttonPrimary} onClick={() => void link('/repos/new')}>
                  {t('connect')}
                </button>
              ) : undefined
            }
          />
        ) : list && list.repos.length === 0 ? (
          <EmptyState icon={GitHubIcon} title={t('noRepos')} compact />
        ) : (
          list && (
            <>
              <input placeholder={t('filter')} value={filter} onChange={(event) => setFilter(event.target.value)} className={field} />
              <ul className="max-h-[520px] divide-y divide-line overflow-y-auto rounded-[var(--radius-card)] border border-line">
                {shown.map((repo) => (
                  <li key={repo.fullName} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[13.5px]">{repo.fullName}</p>
                      <p className="truncate text-[12.5px] text-ink-faint">{repo.description || (repo.fork ? t('isFork') : '')}</p>
                    </div>
                    <button type="button" disabled={busy !== null} className={buttonSecondary} onClick={() => void create(repo.fullName, { mode: 'github', github: repo.fullName })}>
                      {busy === repo.fullName ? t('importing') : t('import')}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )
        )}
      </section>
      <section className="space-y-4">
        <h2 className="text-[15px] font-medium">{t('byUrl')}</h2>
        <p className="text-[13px] leading-relaxed text-ink-muted">{t('byUrlLead')}</p>
        <form onSubmit={submitUrl} className="space-y-3">
          <input required placeholder="https://github.com/owner/repo" value={url} onChange={(event) => setUrl(event.target.value)} className={`${field} font-mono text-[13px]`} data-testid="import-url" />
          <button type="submit" disabled={busy !== null} className={`${buttonPrimary} w-full`} data-testid="import-submit">
            {busy === 'url' ? t('importing') : t('import')}
          </button>
        </form>
        <p className="text-[12px] leading-relaxed text-ink-faint">{t('limits')}</p>
      </section>
      {error && <p className="text-[13px] text-danger lg:col-span-2">{error}</p>}
    </div>
  )
}

function Empty() {
  const t = useTranslations('repos.new')
  const { busy, error, create } = useCreate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    void create('empty', { mode: 'empty', name, description, visibility })
  }
  return (
    <form onSubmit={submit} className="max-w-xl space-y-5">
      <label className="block">
        <span className="text-[13px] font-medium">{t('name')}</span>
        <input required maxLength={64} pattern="[A-Za-z0-9._\-]+" value={name} onChange={(event) => setName(event.target.value)} className={`mt-2 font-mono ${field}`} data-testid="repo-name" />
        <span className="mt-1.5 block text-[12px] text-ink-faint">{t('nameHint')}</span>
      </label>
      <label className="block">
        <span className="text-[13px] font-medium">{t('description')}</span>
        <input maxLength={300} value={description} onChange={(event) => setDescription(event.target.value)} className={`mt-2 ${field}`} />
      </label>
      <fieldset className="flex gap-6 text-[13.5px]">
        {(['public', 'private'] as const).map((value) => (
          <label key={value} className="flex items-center gap-2">
            <input type="radio" name="visibility" checked={visibility === value} onChange={() => setVisibility(value)} />
            {t(value)}
          </label>
        ))}
      </fieldset>
      {error && <p className="text-[13px] text-danger">{error}</p>}
      <button type="submit" disabled={busy !== null} className={buttonPrimary} data-testid="create-repo">
        {busy ? t('creating') : t('create')}
      </button>
    </form>
  )
}
