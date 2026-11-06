import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { RepoWithOwner } from '@/lib/repos/repos'

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** 仓库列表里的一张卡片。showOwner：发现页里要显示是谁的。 */
export function RepoCard({ repo, showOwner = false, updated }: { repo: RepoWithOwner; showOwner?: boolean; updated: string }) {
  const t = useTranslations('repos')
  return (
    <Link href={`/u/${repo.owner_handle}/${repo.slug}`} className="group flex flex-col gap-3 bg-canvas p-5 transition-colors duration-150 hover:bg-raised" data-testid="repo-card">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate font-mono text-[14px] text-ink">
          {showOwner && <span className="text-ink-muted">{repo.owner_handle}/</span>}
          {repo.name}
        </p>
        {repo.visibility === 'private' && <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[11px] text-ink-muted">{t('private')}</span>}
      </div>
      <p className="line-clamp-2 min-h-[2.6em] text-[13px] leading-relaxed text-ink-muted">{repo.description || t('noDescription')}</p>
      <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-faint">
        <span>{t(`sources.${repo.source}`)}</span>
        <span>{t('fileCount', { count: repo.file_count })}</span>
        {repo.fork_count > 0 && <span>{t('forkCount', { count: repo.fork_count })}</span>}
        <span>{updated}</span>
      </p>
    </Link>
  )
}
