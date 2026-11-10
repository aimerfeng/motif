import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { GrantCredits } from '@/components/account/grant-credits'
import { CreditOrdersTable } from '@/components/admin/credit-orders-table'
import { dateTimeFormat, FactList, formatBytes, knownRepoSource, StatusText, tableBase, tableBody, tableHead, tableWrap, td, th } from '@/components/admin/ui'
import { EmptyState, linkMuted, PageHeader, SectionHeader, Stat, StatGrid } from '@/components/community/ui'
import { LedgerTable } from '@/components/credits/ledger-table'
import { ArrowIcon } from '@/components/icons'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { adminUser, apiKeysOfUser, toMillis } from '@/lib/accounts/admin'
import { ledgerOf, unlocksOf } from '@/lib/credits/ledger'
import { ordersOf } from '@/lib/credits/orders'
import { reposOf } from '@/lib/repos/repos'
import { adminMetadata, itemIndex, requireAdminPage, type AdminItemRef } from '../../shared'

export async function generateMetadata({ params }: PageProps<'/[locale]/admin/users/[id]'>): Promise<Metadata> {
  return adminMetadata((await params).locale, 'users')
}

// 流水和订单各看最近这么多条：排查一个账号的问题够用了，再往前的在数据库里。
const LEDGER_SHOWN = 100
const ORDERS_SHOWN = 50

/** 一个用户的全部记录：资料、余额、积分流水、订单、解锁、仓库、API 密钥，以及给他加减积分。 */
export default async function AdminUserPage({ params }: PageProps<'/[locale]/admin/users/[id]'>) {
  const { locale: rawLocale, id } = await params
  const locale = resolveRouteLocale(rawLocale)
  await requireAdminPage(locale, `/admin/users/${encodeURIComponent(id)}`)
  const user = adminUser(id)
  if (!user) notFound()

  const t = await getTranslations({ locale, namespace: 'admin' })
  const ledger = ledgerOf(user.id, LEDGER_SHOWN)
  const orders = ordersOf(user.id, ORDERS_SHOWN)
  const items = unlocksOf(user.id, 'item')
  const skills = unlocksOf(user.id, 'skill')
  const repos = reposOf(user.id, true)
  const keys = apiKeysOfUser(user.id)
  const liveKeys = keys.filter((key) => key.revoked_at === null).length
  const publicRepos = repos.filter((repo) => repo.visibility === 'public').length
  // 只有解锁过条目才去读目录（社区连不上时这一步要等一会儿）。
  const index: Map<string, AdminItemRef> = items.length > 0 ? await itemIndex(locale) : new Map()
  const number = new Intl.NumberFormat(locale)
  const when = dateTimeFormat(locale)
  const joined = toMillis(user.createdAt)

  return (
    <div className="space-y-14">
      <div className="space-y-6">
        {/* 二级导航按整条地址判断当前页，到了详情页「用户」那一格不会亮，所以这里给一条回去的路。 */}
        <Link href="/admin/users" className={`inline-flex items-center gap-1.5 ${linkMuted}`}>
          <ArrowIcon className="size-3.5 rotate-180" />
          {t('user.back')}
        </Link>
        <PageHeader title={user.name || user.email} />
        <FactList
          rows={[
            { label: t('columns.email'), value: <span className="break-all">{user.email}</span> },
            {
              label: t('user.verification'),
              value: <StatusText tone={user.emailVerified ? 'success' : 'pending'}>{user.emailVerified ? t('user.verified') : t('unverified')}</StatusText>,
            },
            {
              label: t('user.handle'),
              value: user.handle ? (
                <Link href={`/u/${user.handle}`} className="font-mono text-[12.5px] hover:underline">
                  @{user.handle}
                </Link>
              ) : (
                '—'
              ),
            },
            { label: 'GitHub', value: user.githubLogin ? <span className="font-mono text-[12.5px]">{user.githubLogin}</span> : '—' },
            { label: t('columns.joined'), value: joined ? when.format(joined) : '—' },
            { label: t('user.id'), value: <span className="font-mono text-[12.5px] break-all">{user.id}</span> },
          ]}
        />
      </div>

      <StatGrid className="grid-cols-2 md:grid-cols-4">
        <Stat label={t('columns.balance')} value={number.format(user.balance)} />
        <Stat label={t('user.repos')} value={number.format(repos.length)} hint={t('user.reposHint', { open: publicRepos, closed: repos.length - publicRepos })} />
        <Stat label={t('user.unlocks')} value={number.format(items.length + skills.length)} />
        <Stat label={t('user.keys')} value={number.format(liveKeys)} />
      </StatGrid>

      <section className="space-y-5">
        <SectionHeader title={t('grant.title')} />
        <GrantCredits defaultUser={user.email} />
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('user.ledger')} count={ledger.length} />
        <LedgerTable entries={ledger} locale={locale} />
        {ledger.length === LEDGER_SHOWN && <p className="text-[13px] text-ink-faint">{t('user.latestOnly', { count: LEDGER_SHOWN })}</p>}
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('user.orders')} count={orders.length} />
        {orders.length === 0 ? <EmptyState title={t('user.noOrders')} compact /> : <CreditOrdersTable orders={orders} locale={locale} />}
        {orders.length === ORDERS_SHOWN && <p className="text-[13px] text-ink-faint">{t('user.latestOnly', { count: ORDERS_SHOWN })}</p>}
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('user.unlocks')} count={items.length + skills.length} />
        {items.length + skills.length === 0 ? (
          <EmptyState title={t('user.noUnlocks')} compact />
        ) : (
          <FactList
            rows={[
              { label: t('user.unlockedItems', { count: items.length }), value: <Chips values={items} hrefOf={(slug) => index.get(slug)?.href} titleOf={(slug) => index.get(slug)?.title} /> },
              { label: t('user.unlockedSkills', { count: skills.length }), value: <Chips values={skills} /> },
            ]}
          />
        )}
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('user.repos')} count={repos.length} />
        {repos.length === 0 ? (
          <EmptyState title={t('user.noRepos')} compact />
        ) : (
          <div className={tableWrap}>
            <table className={`${tableBase} min-w-[720px]`}>
              <thead className={tableHead}>
                <tr>
                  <th className={th}>{t('columns.repo')}</th>
                  <th className={th}>{t('columns.visibility')}</th>
                  <th className={th}>{t('columns.source')}</th>
                  <th className={`${th} text-right`}>{t('columns.files')}</th>
                  <th className={`${th} text-right`}>{t('columns.size')}</th>
                  <th className={th}>{t('columns.updated')}</th>
                </tr>
              </thead>
              <tbody className={tableBody}>
                {repos.map((repo) => {
                  const source = knownRepoSource(repo.source)
                  return (
                    <tr key={repo.id}>
                      <td className={td}>
                        {/* 私有仓库的页面只有作者自己打得开（别人一律 404，管理员也一样），所以只给公开的加链接。 */}
                        {repo.visibility === 'public' ? (
                          <Link href={`/u/${repo.owner_handle}/${repo.slug}`} className="font-medium hover:underline">
                            {repo.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{repo.name}</span>
                        )}
                      </td>
                      <td className={td}>
                        <StatusText tone={repo.visibility === 'public' ? 'success' : 'muted'}>{repo.visibility === 'public' ? t('user.public') : t('user.private')}</StatusText>
                      </td>
                      <td className={`${td} whitespace-nowrap text-ink-muted`}>{source ? t(`sources.${source}`) : repo.source}</td>
                      <td className={`${td} text-right font-mono tabular-nums`}>{number.format(repo.file_count)}</td>
                      <td className={`${td} text-right font-mono whitespace-nowrap tabular-nums`}>{formatBytes(repo.total_bytes)}</td>
                      <td className={`${td} whitespace-nowrap text-ink-muted`}>{when.format(repo.updated_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-5">
        <SectionHeader title={t('user.apiKeys')} count={keys.length} />
        {keys.length === 0 ? (
          <EmptyState title={t('user.noKeys')} compact />
        ) : (
          <div className={tableWrap}>
            {/* 只有名字和时间：密钥的哈希和前缀连查询都没取（lib/accounts/admin.ts 的 apiKeysOfUser）。 */}
            <table className={`${tableBase} min-w-[620px]`}>
              <thead className={tableHead}>
                <tr>
                  <th className={th}>{t('columns.name')}</th>
                  <th className={th}>{t('columns.status')}</th>
                  <th className={th}>{t('columns.created')}</th>
                  <th className={th}>{t('columns.lastUsed')}</th>
                </tr>
              </thead>
              <tbody className={tableBody}>
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td className={`${td} break-words`}>{key.name || '—'}</td>
                    <td className={td}>
                      {key.revoked_at === null ? (
                        <StatusText tone="success">{t('user.keyActive')}</StatusText>
                      ) : (
                        <StatusText tone="muted">{t('user.keyRevoked', { date: when.format(key.revoked_at) })}</StatusText>
                      )}
                    </td>
                    <td className={`${td} whitespace-nowrap text-ink-muted`}>{when.format(key.created_at)}</td>
                    <td className={`${td} whitespace-nowrap text-ink-muted`}>{key.last_used_at ? when.format(key.last_used_at) : t('user.neverUsed')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

/** 一串短标识（条目 slug、Skill 名）：能对上现有页面的给链接，对不上的（已下架）只显示名字。 */
function Chips({ values, hrefOf, titleOf }: { values: string[]; hrefOf?: (value: string) => string | undefined; titleOf?: (value: string) => string | undefined }) {
  if (values.length === 0) return <span className="text-ink-faint">—</span>
  const chip = 'rounded-md border border-line px-2 py-0.5 font-mono text-[12px] text-ink-muted'
  return (
    <span className="flex min-w-0 flex-wrap justify-end gap-1.5">
      {values.map((value) => {
        const href = hrefOf?.(value)
        return href ? (
          <Link key={value} href={href} title={titleOf?.(value)} className={`${chip} transition-colors duration-150 hover:border-line-strong hover:text-ink`}>
            {value}
          </Link>
        ) : (
          <span key={value} className={chip}>
            {value}
          </span>
        )
      })}
    </span>
  )
}
