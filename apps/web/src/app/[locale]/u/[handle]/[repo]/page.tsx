import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { EmptyState } from '@/components/community/ui'
import { GitHubIcon } from '@/components/icons'
import { FileEditor } from '@/components/repos/file-editor'
import { FileTree } from '@/components/repos/file-tree'
import { FileView } from '@/components/repos/file-view'
import { RepoActions } from '@/components/repos/repo-actions'
import { formatBytes } from '@/components/repos/repo-card'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { pageUser } from '@/lib/auth/page'
import { authReady, isAdmin } from '@/lib/auth/server'
import { fileContent, fileList, itemFromRepo, repoById, visibleRepo } from '@/lib/repos/repos'

export async function generateMetadata({ params }: PageProps<'/[locale]/u/[handle]/[repo]'>): Promise<Metadata> {
  const { handle, repo: slug } = await params
  await authReady()
  // 元数据只给公开仓库：私有仓库的名字不该出现在标题里被缓存。
  const repo = visibleRepo(handle, slug, null)
  return repo ? { title: `${repo.owner_handle}/${repo.name}`, description: repo.description || undefined } : { robots: { index: false } }
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? null

/** 仓库页：文件树 + 文件内容。?path= 选文件，主人还能 ?edit=1 改、?new=1 新建。 */
export default async function RepoPage({ params, searchParams }: PageProps<'/[locale]/u/[handle]/[repo]'>) {
  const { locale: raw, handle, repo: slug } = await params
  const locale = resolveRouteLocale(raw)
  const query = await searchParams
  const viewer = await pageUser()
  const repo = visibleRepo(handle, slug, viewer?.id ?? null, viewer ? isAdmin(viewer) : false)
  if (!repo) notFound()
  const t = await getTranslations({ locale, namespace: 'repos' })
  const isOwner = viewer?.id === repo.owner_id
  const files = fileList(repo.id)
  const requested = one(query.path)
  const readme = files.find((file) => /^readme(\.md|\.markdown|\.txt)?$/i.test(file.path))
  const selected = requested && files.some((file) => file.path === requested) ? requested : (readme?.path ?? files[0]?.path ?? null)
  const content = selected ? fileContent(repo.id, selected) : null
  const editing = isOwner && one(query.edit) === '1' && selected !== null
  const creating = isOwner && one(query.new) === '1'
  const base = `/u/${repo.owner_handle}/${repo.slug}`
  const forkedFrom = repo.forked_from ? repoById(repo.forked_from) : undefined
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })

  const origin = (() => {
    if (repo.source === 'github' && repo.github_repo)
      return (
        <a href={`https://github.com/${repo.github_repo}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
          <GitHubIcon className="size-3.5" />
          {t('origin.github', { repo: repo.github_repo, commit: repo.github_commit?.slice(0, 7) ?? '' })}
        </a>
      )
    if (repo.source === 'fork')
      return forkedFrom && forkedFrom.visibility === 'public' ? (
        <Link href={`/u/${forkedFrom.owner_handle}/${forkedFrom.slug}`} className="hover:text-ink">
          {t('origin.fork', { repo: `${forkedFrom.owner_handle}/${forkedFrom.name}` })}
        </Link>
      ) : (
        <span>{t('origin.fork', { repo: repo.source_ref ?? '' })}</span>
      )
    if (repo.source === 'item' && repo.source_ref)
      return (
        <Link href={`/market/${repo.source_ref}`} className="hover:text-ink">
          {t('origin.item', { item: repo.source_ref })}
        </Link>
      )
    if (repo.source === 'studio') return <span>{t('origin.studio')}</span>
    return null
  })()

  return (
    <main className="mx-auto max-w-[1400px] space-y-8 px-5 pt-10 pb-24 sm:px-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-[22px] leading-tight">
            <Link href={`/u/${repo.owner_handle}`} className="text-ink-muted hover:text-ink">
              {repo.owner_handle}
            </Link>
            <span className="px-1 text-ink-faint">/</span>
            <span className="font-medium text-ink">{repo.name}</span>
          </h1>
          <span className="rounded-full border border-line px-2.5 py-0.5 text-[12px] text-ink-muted">{repo.visibility === 'private' ? t('private') : t('public')}</span>
        </div>
        {/* 下架中：只有主人和管理员走得到这里。说清楚现在是什么状态，免得主人以为是自己设成了私有。 */}
        {repo.taken_down_at !== null && (
          <p role="status" className="max-w-2xl rounded-[var(--radius-card)] border border-pending/40 bg-pending/[0.06] px-4 py-3 text-[13.5px] leading-relaxed text-ink">
            {isOwner ? t('takenDown') : t('takenDownModerator')}
          </p>
        )}
        {repo.description && <p className="max-w-2xl text-[14px] leading-relaxed text-ink-muted">{repo.description}</p>}
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-faint">
          {origin}
          {repo.pushed_repo && (
            <a href={`https://github.com/${repo.pushed_repo}`} target="_blank" rel="noreferrer" className="hover:text-ink">
              {t('origin.pushed', { repo: repo.pushed_repo })}
            </a>
          )}
          <span>{t('fileCount', { count: repo.file_count })}</span>
          <span>{formatBytes(repo.total_bytes)}</span>
          {repo.fork_count > 0 && <span>{t('forkCount', { count: repo.fork_count })}</span>}
          <span>{t('updated', { date: date.format(repo.updated_at) })}</span>
        </p>
        <RepoActions
          isOwner={isOwner}
          repo={{
            id: repo.id,
            name: repo.name,
            slug: repo.slug,
            description: repo.description,
            visibility: repo.visibility,
            takenDown: repo.taken_down_at !== null,
            ownerHandle: repo.owner_handle,
            githubRepo: repo.github_repo,
            pushedRepo: repo.pushed_repo,
            isItem: itemFromRepo(repo.id) !== null,
          }}
        />
      </header>

      {files.length === 0 && !creating ? (
        <EmptyState
          title={isOwner ? t('emptyOwner') : t('empty')}
          action={
            isOwner ? (
              <Link href={{ pathname: base, query: { new: '1' } }} className="text-[13px] text-ink underline-offset-4 hover:underline">
                {t('actions.newFile')}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-[var(--radius-card)] border border-line p-1.5 lg:self-start">
            <FileTree entries={files} selected={creating ? null : selected} href={(path) => `${base}?path=${encodeURIComponent(path)}`} />
          </aside>
          <section className="min-w-0">
            {creating ? (
              <FileEditor repoId={repo.id} base={base} path={null} initial="" />
            ) : editing && content !== null ? (
              <FileEditor repoId={repo.id} base={base} path={selected} initial={content} />
            ) : (
              selected &&
              content !== null && (
                <FileView
                  path={selected}
                  source={content}
                  toolbar={
                    isOwner ? (
                      <Link href={{ pathname: base, query: { path: selected, edit: '1' } }} className="shrink-0 rounded-md px-2.5 py-1 text-[12px] text-ink-muted hover:bg-ink/5 hover:text-ink">
                        {t('actions.edit')}
                      </Link>
                    ) : undefined
                  }
                />
              )
            )}
          </section>
        </div>
      )}
    </main>
  )
}
