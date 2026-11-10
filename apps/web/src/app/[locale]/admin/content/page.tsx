import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { RepoModerationButton } from '@/components/admin/repo-moderation-button'
import { dateTimeFormat, first, formatBytes, hrefWith, knownRepoSource, pick, Segmented, tableBase, tableBody, tableHead, tableWrap, td, th } from '@/components/admin/ui'
import { EmptyState, PageHeader, SectionHeader } from '@/components/community/ui'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { latestPublicRepos, takenDownRepos, TOP_ITEM_DAYS, topItems, type AdminRepoRow } from '@/lib/accounts/admin'
import { STAT_EVENTS, type StatEvent } from '@/lib/stats/events'
import { adminMetadata, itemIndex, requireAdminPage, type AdminItemRef } from '../shared'

export async function generateMetadata({ params }: PageProps<'/[locale]/admin/content'>): Promise<Metadata> {
  return adminMetadata((await params).locale, 'content')
}

const DAY_OPTIONS = TOP_ITEM_DAYS.map((days) => `${days}` as const)
const DEFAULT_DAYS = `${TOP_ITEM_DAYS[0]}` as const
const DEFAULT_EVENT: StatEvent = 'view'
const TOP_SHOWN = 20
const REPOS_SHOWN = 30

/** 内容：哪些条目在被用（近 7 / 30 天，按一种事件排），最近公开的用户仓库和「下架」，以及下架中的仓库和「恢复」。 */
export default async function AdminContentPage({ params, searchParams }: PageProps<'/[locale]/admin/content'>) {
  const locale = resolveRouteLocale((await params).locale)
  await requireAdminPage(locale, '/admin/content')
  const t = await getTranslations({ locale, namespace: 'admin' })
  const search = await searchParams
  const days = pick(first(search.days), DAY_OPTIONS, DEFAULT_DAYS)
  const event = pick(first(search.event), STAT_EVENTS, DEFAULT_EVENT)
  const top = topItems({ event, days: Number(days), limit: TOP_SHOWN })
  const repos = latestPublicRepos(REPOS_SHOWN)
  const takenDown = takenDownRepos()
  const items: Map<string, AdminItemRef> = top.length > 0 ? await itemIndex(locale) : new Map()
  const number = new Intl.NumberFormat(locale)
  const when = dateTimeFormat(locale)
  // 默认值不写进地址；换一个筛选时另一个保持不变。
  const hrefOf = (next: { days?: string; event?: StatEvent }) => {
    const nextDays = next.days ?? days
    const nextEvent = next.event ?? event
    return hrefWith('/admin/content', { days: nextDays === DEFAULT_DAYS ? null : nextDays, event: nextEvent === DEFAULT_EVENT ? null : nextEvent })
  }

  // 两张仓库表是同一个样子：公开的那张列的是更新时间和「下架」，下架中的那张是下架时间和「恢复」。
  const repoTable = (rows: AdminRepoRow[], action: 'hide' | 'restore') => (
    <div className={tableWrap}>
      <table className={`${tableBase} min-w-[900px]`}>
        <thead className={tableHead}>
          <tr>
            <th className={th}>{t('columns.repo')}</th>
            <th className={th}>{t('columns.owner')}</th>
            <th className={th}>{t('columns.source')}</th>
            <th className={`${th} text-right`}>{t('columns.files')}</th>
            <th className={`${th} text-right`}>{t('columns.size')}</th>
            <th className={`${th} text-right`}>{t('columns.forks')}</th>
            <th className={th}>{t(action === 'hide' ? 'columns.updated' : 'columns.takenDown')}</th>
            <th className={`${th} text-right`}>
              <span className="sr-only">{t('columns.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody className={tableBody}>
          {rows.map((repo) => {
            const source = knownRepoSource(repo.source)
            return (
              <tr key={repo.id}>
                <td className={`${td} max-w-[320px]`}>
                  {/* 仓库页的地址要主人的 handle；极少数没有 handle 的账号，仓库没有可以打开的页面。 */}
                  {repo.owner_handle ? (
                    <Link href={`/u/${repo.owner_handle}/${repo.slug}`} className="font-medium break-all hover:underline">
                      {repo.name}
                    </Link>
                  ) : (
                    <span className="font-medium break-all">{repo.name}</span>
                  )}
                  {repo.description && <p className="mt-0.5 line-clamp-2 text-[12.5px] break-words text-ink-muted">{repo.description}</p>}
                </td>
                <td className={td}>
                  <Link href={`/admin/users/${encodeURIComponent(repo.owner_id)}`} className="break-all hover:underline">
                    {repo.owner_handle ? `@${repo.owner_handle}` : repo.owner_email}
                  </Link>
                </td>
                <td className={`${td} whitespace-nowrap text-ink-muted`}>{source ? t(`sources.${source}`) : repo.source}</td>
                <td className={`${td} text-right font-mono tabular-nums`}>{number.format(repo.file_count)}</td>
                <td className={`${td} text-right font-mono whitespace-nowrap tabular-nums`}>{formatBytes(repo.total_bytes)}</td>
                <td className={`${td} text-right font-mono tabular-nums`}>{number.format(repo.fork_count)}</td>
                <td className={`${td} whitespace-nowrap text-ink-muted`}>{when.format(action === 'hide' ? repo.updated_at : (repo.taken_down_at ?? repo.updated_at))}</td>
                <td className={`${td} text-right`}>
                  <RepoModerationButton id={repo.id} name={repo.name} action={action} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-14">
      <PageHeader title={t('nav.content')} lead={t('contentPage.lead')} />

      <section className="space-y-5">
        <SectionHeader title={t('contentPage.topTitle')} count={top.length} />
        <div className="flex flex-wrap gap-3">
          <Segmented label={t('contentPage.period')} options={DAY_OPTIONS.map((option) => ({ href: hrefOf({ days: option }), active: option === days, label: t('contentPage.days', { days: Number(option) }) }))} />
          <Segmented label={t('contentPage.sortBy')} options={STAT_EVENTS.map((option) => ({ href: hrefOf({ event: option }), active: option === event, label: t(`events.${option}`) }))} />
        </div>
        {top.length === 0 ? (
          <EmptyState title={t('contentPage.noStats')} compact />
        ) : (
          <div className={tableWrap}>
            <table className={`${tableBase} min-w-[640px] tabular-nums`}>
              <thead className={tableHead}>
                <tr>
                  <th className={`${th} w-12 text-right`}>#</th>
                  <th className={th}>{t('columns.item')}</th>
                  {STAT_EVENTS.map((column) => (
                    // 正在按哪一列排，用 aria-sort 告诉读屏软件，眼睛看的是加深的那一列。
                    <th key={column} aria-sort={column === event ? 'descending' : undefined} className={`${th} text-right ${column === event ? 'text-ink' : ''}`}>
                      {t(`events.${column}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={tableBody}>
                {top.map((row, position) => {
                  const item = items.get(row.slug)
                  return (
                    <tr key={row.slug}>
                      <td className={`${td} text-right font-mono text-[12.5px] text-ink-faint`}>{position + 1}</td>
                      <td className={td}>
                        {item ? (
                          <Link href={item.href} className="font-medium hover:underline">
                            {item.title}
                          </Link>
                        ) : (
                          // 目录里已经没有这个条目了（下架或改名），统计还留着。
                          <span className="text-ink-muted">{t('contentPage.removed')}</span>
                        )}
                        <span className="ml-2 font-mono text-[12px] text-ink-faint">{row.slug}</span>
                      </td>
                      {STAT_EVENTS.map((column) => (
                        <td key={column} className={`${td} text-right font-mono ${column === event ? 'text-ink' : 'text-ink-muted'}`}>
                          {number.format(row.counts[column])}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('contentPage.reposTitle')} count={repos.length} />
        <p className="max-w-2xl text-[13px] leading-relaxed text-ink-muted">{t('contentPage.reposLead')}</p>
        {repos.length === 0 ? (
          <EmptyState title={t('contentPage.noRepos')} compact />
        ) : (
          repoTable(repos, 'hide')
        )}
      </section>

      {/* 没有下架中的仓库时整块不出现：绝大多数时候它是空的。 */}
      {takenDown.length > 0 && (
        <section className="space-y-5">
          <SectionHeader title={t('contentPage.takenDownTitle')} count={takenDown.length} />
          <p className="max-w-2xl text-[13px] leading-relaxed text-ink-muted">{t('contentPage.takenDownLead')}</p>
          {repoTable(takenDown, 'restore')}
        </section>
      )}
    </div>
  )
}
