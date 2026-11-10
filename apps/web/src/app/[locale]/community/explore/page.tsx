import type { Metadata } from 'next'
import Form from 'next/form'
import { connection } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { Pagination } from '@/components/community/pagination'
import { RepoGrid } from '@/components/community/repo-grid'
import { buttonPrimary, buttonSecondary, EmptyState, linkMuted, PageHeader } from '@/components/community/ui'
import { LayersIcon, PlusIcon, SearchIcon } from '@/components/icons'
import { resolveRouteLocale } from '@/i18n/locale'
import { getPathname, Link } from '@/i18n/navigation'
import { authReady } from '@/lib/auth/server'
import { EXPLORE_SORTS, explorePublicRepos, parseExploreQuery, SEARCH_MAX, type ExploreQuery } from '@/lib/repos/explore'
import { alternatesFor } from '@/lib/site'

export async function generateMetadata({ params, searchParams }: PageProps<'/[locale]/community/explore'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.explore' })
  const { q } = parseExploreQuery(await searchParams)
  return {
    title: t('title'),
    description: t('description'),
    alternates: alternatesFor('/community/explore'),
    // 搜索结果页有无穷多个，内容都是这一页的子集：不进索引，页面上的链接照常跟。
    ...(q ? { robots: { index: false, follow: true } } : {}),
  }
}

/** 默认值不写进链接：同一个视图只有一个地址，翻页、换排序的链接也短。 */
function hrefOf({ q, sort, page }: ExploreQuery): string {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (sort !== 'recent') params.set('sort', sort)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/community/explore?${query}` : '/community/explore'
}

/** 空状态里那句话的宽度有限、也不折长词：搜索词太长就截短再放进去，完整的词还在上面的搜索框里。 */
const CLIP = 24
function clip(text: string): string {
  const chars = Array.from(text)
  return chars.length > CLIP ? `${chars.slice(0, CLIP).join('')}…` : text
}

/**
 * 全部公开仓库：搜索、排序、翻页，状态全在地址里（?q= ?sort= ?page=）。
 * 搜索是一个普通的 GET 表单，排序和翻页是普通链接：不开 JS 也能用，任何一个视图都能直接分享。
 */
export default async function ExplorePage({ params, searchParams }: PageProps<'/[locale]/community/explore'>) {
  // 按请求渲染：要读数据库和地址里的筛选。放在最前面，构建时不会先去碰数据库。
  await connection()
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.explore' })
  const query = parseExploreQuery(await searchParams)
  await authReady()
  const result = explorePublicRepos(query)
  // 地址里的页码可能超出范围，以实际返回的那一页为准。
  const view: ExploreQuery = { ...query, page: result.page }
  // 站上一个公开仓库都没有（不是「没搜到」）时，搜索框和排序没有东西可筛，不摆出来。
  const nothingYet = result.total === 0 && !query.q

  return (
    <div className="space-y-10" data-testid="community-explore">
      <PageHeader title={t('title')} lead={t('lead')}>
        <Link href="/repos/new" className={buttonPrimary}>
          <PlusIcon className="size-4" />
          {t('new')}
        </Link>
      </PageHeader>

      {nothingYet ? (
        <EmptyState
          icon={LayersIcon}
          title={t('empty')}
          action={
            <Link href="/repos/new" className={buttonSecondary}>
              {t('new')}
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
            {/* next/form：开着 JS 时是站内跳转（不整页刷新），没有 JS 时就是浏览器自己的 GET 提交。action 要带上语言前缀。 */}
            <Form action={getPathname({ href: '/community/explore', locale })} role="search" className="flex w-full gap-2 sm:max-w-md">
              <div className="relative min-w-0 flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" />
                {/* key：点「清除搜索」或换了搜索词回到这一页时，输入框跟着地址重置（defaultValue 只在挂载时生效）。 */}
                <input
                  key={query.q}
                  type="search"
                  name="q"
                  defaultValue={query.q}
                  maxLength={SEARCH_MAX}
                  placeholder={t('search.placeholder')}
                  aria-label={t('search.label')}
                  autoComplete="off"
                  enterKeyHint="search"
                  className="h-9 w-full rounded-lg border border-line bg-raised pr-3 pl-9 text-[14px] placeholder:text-ink-faint focus:border-line-strong focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
              </div>
              {/* 搜索时保留当前的排序；页码不带，新的搜索从第一页看起。 */}
              {query.sort !== 'recent' && <input type="hidden" name="sort" value={query.sort} />}
              <button type="submit" className="h-9 shrink-0 rounded-lg border border-line-strong px-3.5 text-[13.5px] text-ink transition-colors duration-150 hover:border-ink">
                {t('search.submit')}
              </button>
            </Form>
            {/* shrink-0：一行放不下时让搜索框让位，排序的两个选项不折行。 */}
            <nav aria-label={t('sort.label')} className="inline-flex shrink-0 self-start rounded-full border border-line p-0.5 sm:self-auto">
              {EXPLORE_SORTS.map((sort) => (
                <Link
                  key={sort}
                  href={hrefOf({ ...view, sort, page: 1 })}
                  aria-current={sort === query.sort ? 'page' : undefined}
                  className="rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap text-ink-muted transition-colors duration-(--duration-fast) hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-canvas"
                >
                  {t(`sort.${sort}`)}
                </Link>
              ))}
            </nav>
          </div>

          {result.total === 0 ? (
            <EmptyState
              icon={SearchIcon}
              title={t('noMatch', { q: clip(query.q) })}
              action={
                <Link href={hrefOf({ ...view, q: '', page: 1 })} className={buttonSecondary}>
                  {t('all')}
                </Link>
              }
            />
          ) : (
            <>
              <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[13px] text-ink-muted" data-testid="explore-count">
                {/* 搜索词是用户输入的，可能是一长串不带空格的字符：允许在任意位置折行，不把页面撑出横向滚动。 */}
                <span className="min-w-0 [overflow-wrap:anywhere]">{query.q ? t('found', { q: query.q, count: result.total }) : t('count', { count: result.total })}</span>
                {query.q && (
                  <Link href={hrefOf({ ...view, q: '', page: 1 })} className={`${linkMuted} underline underline-offset-4`}>
                    {t('search.clear')}
                  </Link>
                )}
              </p>
              <RepoGrid repos={result.rows} />
              <Pagination page={result.page} pages={result.pages} hrefOf={(page) => hrefOf({ ...view, page })} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
