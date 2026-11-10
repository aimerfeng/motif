import { RepoGridSkeleton } from '@/components/community/repo-grid'
import { PageHeaderSkeleton, Skeleton } from '@/components/community/ui'

/**
 * 社区概览的骨架：页头、五格数字、分区标题和一格卡片，和真实页面（连没连链都是这个次序）的位置对得上，内容出来时不跳。
 * 放在路由组 (hub) 里，只管概览这一页；其他社区子页面继续用上一层那份通用的骨架。
 */
export default function CommunityHubLoading() {
  return (
    <div className="space-y-16" aria-busy="true">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="bg-canvas px-5 py-4 last:col-span-2 sm:last:col-span-1">
            <Skeleton className="h-[18px] w-16" />
            <Skeleton className="mt-1 h-[28px] w-14 sm:h-[33px]" />
          </div>
        ))}
      </div>
      <div className="space-y-5">
        <Skeleton className="h-5 w-36" />
        <RepoGridSkeleton />
      </div>
    </div>
  )
}
