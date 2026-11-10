import { useLocale, useTranslations } from 'next-intl'
import { UserAvatar } from '@/components/account/user-avatar'
import { Link } from '@/i18n/navigation'
import type { Creator } from '@/lib/repos/explore'
import { Skeleton } from './ui'

/**
 * 创作者卡片：是谁、做了多少、最拿得出手的几个仓库。放在细线卡片格（HairlineGrid）里用。
 *
 * 整张卡片点进个人主页：链接只包住名字，再用 ::after 铺满卡片，读屏读到的就是名字而不是一整张卡的内容。
 * 仓库标签是卡片里单独的链接，设了 relative 才会盖在那层 ::after 上面、点得到。
 */
export function CreatorCard({ creator, showRank = false, titleAs: Title = 'h3' }: { creator: Creator; showRank?: boolean; titleAs?: 'h2' | 'h3' }) {
  const t = useTranslations('community.creators')
  const date = new Intl.DateTimeFormat(useLocale(), { dateStyle: 'medium' })
  const profile = `/u/${creator.handle}`
  // 名字只有空白的账号（邮箱注册时可以这么填）用 handle 顶上，卡片不能没有可点的标题。
  const name = creator.name.trim() || creator.handle
  return (
    <article className="relative flex flex-col gap-3.5 bg-canvas p-5 transition-colors duration-150 hover:bg-raised" data-testid="creator-card">
      <div className="flex items-center gap-3">
        <UserAvatar id={creator.id} name={name} className="size-10 text-[15px]" />
        <div className="min-w-0 flex-1">
          <Title className="truncate text-[15px] font-medium tracking-[-0.01em]">
            {/* 卡片格有 overflow-hidden，往外扩的焦点框会被裁掉：焦点框画在铺满卡片的 ::after 上，往里收 2px。 */}
            <Link
              href={profile}
              className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus"
            >
              {name}
            </Link>
          </Title>
          <p className="truncate font-mono text-[12px] text-ink-faint">@{creator.handle}</p>
        </div>
        {showRank && (
          <p className="shrink-0 self-start font-mono text-[11.5px] text-ink-faint tabular-nums">
            <span className="sr-only">{t('rank', { rank: creator.rank })}</span>
            <span aria-hidden>{String(creator.rank).padStart(2, '0')}</span>
          </p>
        )}
      </div>
      {creator.bio && <p className="line-clamp-2 text-[13px] leading-relaxed text-pretty text-ink-muted">{creator.bio}</p>}
      {creator.top.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {creator.top.map((repo) => (
            <li key={repo.slug} className="min-w-0">
              <Link
                href={`${profile}/${repo.slug}`}
                className="relative block max-w-[13rem] truncate rounded-full border border-line px-2.5 py-0.5 font-mono text-[11.5px] leading-5 text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
              >
                {repo.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-faint">
        <span>{t('repos', { count: creator.repos })}</span>
        {creator.forks > 0 && <span>{t('forks', { count: creator.forks })}</span>}
        <span>{t('active', { date: date.format(creator.activeAt) })}</span>
      </p>
    </article>
  )
}

/** 创作者卡片的占位：头像、名字和 handle、一行仓库标签、一行数字，高度和真卡片（没写简介的那种）一致，换上来不跳。 */
export function CreatorCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-3.5 bg-canvas p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-[18px] w-28" />
          <Skeleton className="h-[14px] w-20" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-[26px] w-24 rounded-full" />
        <Skeleton className="h-[26px] w-16 rounded-full" />
      </div>
      <Skeleton className="h-[18px] w-2/3" />
    </div>
  )
}
