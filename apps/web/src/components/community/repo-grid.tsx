import { useLocale, useTranslations } from 'next-intl'
import { RepoCard } from '@/components/repos/repo-card'
import type { RepoWithOwner } from '@/lib/repos/repos'
import { HairlineGrid, Skeleton } from './ui'

/**
 * 社区里的一格公开仓库：概览页的「最新公开」和「全部仓库」页用同一种卡片、同一种日期写法。
 * 卡片带上主人的 handle——这里是把所有人的仓库放在一起看，不像个人主页那样默认是同一个人的。
 */
export function RepoGrid({ repos }: { repos: RepoWithOwner[] }) {
  const t = useTranslations('repos')
  const date = new Intl.DateTimeFormat(useLocale(), { dateStyle: 'medium' })
  return (
    <HairlineGrid count={repos.length}>
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} showOwner updated={t('updated', { date: date.format(repo.updated_at) })} />
      ))}
    </HairlineGrid>
  )
}

/** 仓库卡片格的占位：和 RepoCard 同样的内边距、同样高的三行（名字、两行描述、一行信息），换成真卡片时不跳。 */
export function RepoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <HairlineGrid count={count}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden className="flex flex-col gap-3 bg-canvas p-5">
          <Skeleton className="h-[21px] w-2/3" />
          <Skeleton className="h-[42px] w-full" />
          <Skeleton className="h-[18px] w-1/2" />
        </div>
      ))}
    </HairlineGrid>
  )
}
