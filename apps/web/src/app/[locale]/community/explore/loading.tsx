import { RepoGridSkeleton } from '@/components/community/repo-grid'
import { PageHeaderSkeleton, Skeleton } from '@/components/community/ui'

/**
 * 「全部仓库」的骨架：页头、搜索框和排序、一行数量、卡片格，位置和真实页面一一对应。
 * 提交搜索、换排序、翻页时看到的也是它（next/form 和链接都会先切到这里），所以工具栏的尺寸要跟真的一样，不然每搜一次都晃一下。
 */
export default function ExploreLoading() {
  return (
    <div className="space-y-10" aria-busy="true">
      <PageHeaderSkeleton />
      <div className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full gap-2 sm:max-w-md">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 w-[58px] rounded-lg" />
          </div>
          <Skeleton className="h-[38px] w-44 rounded-full" />
        </div>
        <Skeleton className="h-5 w-24" />
        <RepoGridSkeleton count={9} />
      </div>
    </div>
  )
}
