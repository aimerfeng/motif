import { useTranslations } from 'next-intl'
import type { ComponentProps, ComponentType, SVGProps } from 'react'
import { ArrowIcon, CheckIcon, CodeIcon, GitHubIcon, LayersIcon, PlusIcon, UploadIcon, UsersIcon } from '@/components/icons'
import { ItemCard } from '@/components/market/item-card'
import { Link } from '@/i18n/navigation'
import type { ItemSummary } from '@/lib/catalog'
import type { Creator } from '@/lib/repos/explore'
import type { RepoWithOwner } from '@/lib/repos/repos'
import type { LeaderEntry } from '@/lib/stats/board'
import { CreatorCard } from './creator-card'
import { RepoGrid } from './repo-grid'
import { buttonPrimary, buttonSecondary, EmptyState, HairlineGrid, linkMuted, SectionHeader } from './ui'

/*
 * 社区概览页里不依赖链的几个分区：最新公开的仓库、活跃创作者、本周热门、怎么参与。
 * 没连社区链时它们就是概览页的全部内容；连了链时接在链上内容后面，两种情况用同一套组件。
 */

/** 最新公开的仓库。一个都没有时不留白：直接给出最近的两条路——导入自己的项目，或者去市场挑一个存下来。 */
export function LatestRepos({ repos, total }: { repos: RepoWithOwner[]; total: number }) {
  const t = useTranslations('community.home.repos')
  return (
    <section className="space-y-5" data-testid="community-latest-repos">
      <SectionHeader
        title={t('title')}
        count={total > 0 ? total : undefined}
        action={
          total > 0 && (
            <Link href="/community/explore" className={linkMuted}>
              {t('all')} →
            </Link>
          )
        }
      />
      {repos.length === 0 ? (
        <EmptyState
          icon={LayersIcon}
          title={t('empty')}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/repos/new" className={buttonPrimary}>
                <GitHubIcon className="size-4" />
                {t('import')}
              </Link>
              <Link href="/market" className={buttonSecondary}>
                {t('market')}
              </Link>
            </div>
          }
        />
      ) : (
        <RepoGrid repos={repos} />
      )}
    </section>
  )
}

/** 活跃创作者：榜上前几位。一个都没有时整个分区不出现——上面「最新公开的仓库」的空状态已经说了该做什么。 */
export function ActiveCreators({ creators, total }: { creators: Creator[]; total: number }) {
  const t = useTranslations('community.home.creators')
  if (creators.length === 0) return null
  return (
    <section className="space-y-5" data-testid="community-creators">
      <SectionHeader
        title={t('title')}
        count={total}
        action={
          <Link href="/community/creators" className={linkMuted}>
            {t('all')} →
          </Link>
        }
      />
      <HairlineGrid count={creators.length}>
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </HairlineGrid>
    </section>
  )
}

/** 上榜的条目少于这个数就不叫「热门」（和首页的热门条一个标准）。 */
const MIN_RANKED = 3
const TRENDING_CARDS = 6

/**
 * 本周热门：排行榜综合榜的前几名。
 * 上榜的不到 3 个时不拿空榜单充数：换成精选条目，标题也跟着换成「精选」，不冒充排名。
 * morph：同一页上已经有这些条目的卡片时（连了链的概览页有「社区作品」）传 false，过渡用的名字必须唯一。
 */
export function Trending({ entries, picks, morph = true }: { entries: LeaderEntry[]; picks: ItemSummary[]; morph?: boolean }) {
  const t = useTranslations('community.home.trending')
  const tm = useTranslations('market')
  const ranked = entries.length >= MIN_RANKED
  const cards: { item: ItemSummary; rank?: number }[] = ranked ? entries.slice(0, TRENDING_CARDS) : picks.slice(0, TRENDING_CARDS).map((item) => ({ item }))
  if (cards.length === 0) return null
  return (
    <section className="space-y-5" data-testid="community-trending">
      <SectionHeader
        title={ranked ? t('title') : t('picks')}
        action={
          <Link href={ranked ? '/rank' : '/market'} className={linkMuted}>
            {ranked ? t('all') : t('market')} →
          </Link>
        }
      />
      <ul className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ item, rank }) => (
          // 手机上一列六张太长，把后三张收起来；完整的榜单就在分区标题右边的链接里。
          <li key={item.slug} className="min-w-0 max-sm:[&:nth-child(n+4)]:hidden">
            <ItemCard item={item} categoryLabel={tm(`categories.${item.category}`)} rank={rank} titleAs="h3" morph={morph} />
          </li>
        ))}
      </ul>
    </section>
  )
}

type Href = ComponentProps<typeof Link>['href']

interface Step {
  key: 'signIn' | 'repo' | 'publish' | 'share'
  icon: ComponentType<SVGProps<SVGSVGElement>>
  links: { href: Href; label: string }[]
}

/**
 * 怎么参与：四步，每一步都落到一个真实的页面上。
 * viewer：null 是没登录；登录了就把第一步换成「已登录」和自己的主页，不再让人去登录。
 * 还没有资料页（handle 为 null，极少见：登录钩子没跑完）时去账号页，那里会补建。
 */
export function TakePart({ viewer }: { viewer: { handle: string | null } | null }) {
  const t = useTranslations('community.home.how')
  const steps: Step[] = [
    {
      key: 'signIn',
      icon: UsersIcon,
      links: viewer
        ? [{ href: viewer.handle ? `/u/${viewer.handle}` : '/account', label: t('signIn.profile') }]
        : [{ href: { pathname: '/login', query: { next: '/community' } }, label: t('signIn.link') }],
    },
    {
      key: 'repo',
      icon: PlusIcon,
      links: [
        { href: '/repos/new', label: t('repo.link') },
        { href: '/market', label: t('repo.alt') },
      ],
    },
    { key: 'publish', icon: CodeIcon, links: [{ href: '/studio', label: t('publish.link') }] },
    { key: 'share', icon: UploadIcon, links: [{ href: '/community/explore', label: t('share.link') }] },
  ]
  return (
    <section className="space-y-5" data-testid="community-take-part">
      <SectionHeader title={t('title')} />
      <ol className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {steps.map(({ key, icon: Glyph, links }, index) => (
          <li key={key} className="flex flex-col gap-3 bg-canvas p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-raised text-ink-muted">
                <Glyph className="size-4" />
              </span>
              <h3 className="min-w-0 text-[15px] font-medium">{t(`${key}.title`)}</h3>
              <span aria-hidden className="ml-auto font-mono text-[11.5px] text-ink-faint">
                0{index + 1}
              </span>
            </div>
            <p className="text-[13.5px] leading-relaxed text-pretty text-ink-muted">{t(`${key}.body`)}</p>
            <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[13px]">
              {key === 'signIn' && viewer && (
                <span className="inline-flex items-center gap-1 text-success">
                  <CheckIcon className="size-3.5" />
                  {t('signIn.done')}
                </span>
              )}
              {links.map((link) => (
                <Link key={link.label} href={link.href} className="group/link inline-flex items-center gap-1 text-ink underline-offset-4 hover:underline">
                  {link.label}
                  <ArrowIcon className="size-3.5 text-ink-faint transition-transform duration-150 group-hover/link:text-ink motion-safe:group-hover/link:translate-x-0.5" />
                </Link>
              ))}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
