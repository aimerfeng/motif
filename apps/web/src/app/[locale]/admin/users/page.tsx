import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { dateTimeFormat, first, hrefWith, inputField, pageOf, Pagination, tableBase, tableBody, tableHead, tableWrap, td, th } from '@/components/admin/ui'
import { buttonSecondary, EmptyState, linkMuted, PageHeader } from '@/components/community/ui'
import { resolveRouteLocale } from '@/i18n/locale'
import { getPathname, Link } from '@/i18n/navigation'
import { searchUsers, toMillis } from '@/lib/accounts/admin'
import { adminMetadata, requireAdminPage } from '../shared'

export async function generateMetadata({ params }: PageProps<'/[locale]/admin/users'>): Promise<Metadata> {
  return adminMetadata((await params).locale, 'users')
}

/** 用户列表：按邮箱、昵称、handle、GitHub 用户名搜，新注册的在前；点进去是这个人的全部记录。 */
export default async function AdminUsersPage({ params, searchParams }: PageProps<'/[locale]/admin/users'>) {
  const locale = resolveRouteLocale((await params).locale)
  await requireAdminPage(locale, '/admin/users')
  const t = await getTranslations({ locale, namespace: 'admin' })
  const search = await searchParams
  const q = (first(search.q) ?? '').trim().slice(0, 100)
  const result = searchUsers({ q, page: pageOf(first(search.page)) })
  const number = new Intl.NumberFormat(locale)
  const when = dateTimeFormat(locale)

  return (
    <div className="space-y-8">
      <PageHeader title={t('nav.users')} lead={t('usersPage.lead')} />

      {/* 普通的 GET 表单：搜的词就在地址里，能收藏、能后退，不用客户端脚本。action 要带语言前缀，所以先换算一次。 */}
      <form action={getPathname({ href: '/admin/users', locale })} role="search" className="flex flex-wrap items-center gap-2">
        <input type="search" name="q" defaultValue={q} maxLength={100} placeholder={t('usersPage.placeholder')} aria-label={t('usersPage.search')} className={`${inputField} min-w-0 flex-1 sm:max-w-sm`} />
        <button type="submit" className={buttonSecondary}>
          {t('usersPage.search')}
        </button>
        {q && (
          <Link href="/admin/users" className={`${linkMuted} px-2`}>
            {t('usersPage.clear')}
          </Link>
        )}
        <span className="ml-auto text-[13px] text-ink-faint tabular-nums">{t('usersPage.count', { count: result.total })}</span>
      </form>

      {result.rows.length === 0 ? (
        <EmptyState title={q ? t('usersPage.noMatch', { q }) : t('usersPage.empty')} />
      ) : (
        <div className={tableWrap}>
          <table className={`${tableBase} min-w-[760px]`}>
            <thead className={tableHead}>
              <tr>
                <th className={th}>{t('columns.user')}</th>
                <th className={th}>{t('columns.email')}</th>
                <th className={th}>GitHub</th>
                <th className={`${th} text-right`}>{t('columns.balance')}</th>
                <th className={th}>{t('columns.joined')}</th>
              </tr>
            </thead>
            <tbody className={tableBody}>
              {result.rows.map((row) => (
                <tr key={row.id}>
                  <td className={td}>
                    <Link href={`/admin/users/${encodeURIComponent(row.id)}`} className="font-medium hover:underline">
                      {row.name || row.email}
                    </Link>
                    {row.handle && <span className="ml-2 font-mono text-[12px] text-ink-faint">@{row.handle}</span>}
                  </td>
                  <td className={`${td} text-ink-muted`}>
                    <span className="break-all">{row.email}</span>
                    {!row.emailVerified && <span className="ml-2 text-[12px] whitespace-nowrap text-pending">{t('unverified')}</span>}
                  </td>
                  <td className={`${td} font-mono text-[12.5px] text-ink-muted`}>{row.githubLogin ?? '—'}</td>
                  <td className={`${td} text-right font-mono tabular-nums`}>{number.format(row.balance)}</td>
                  <td className={`${td} whitespace-nowrap text-ink-muted`}>{when.format(toMillis(row.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination locale={locale} page={result.page} pageCount={result.pageCount} total={result.total} hrefOf={(page) => hrefWith('/admin/users', { q, page: page > 1 ? page : null })} />
    </div>
  )
}
