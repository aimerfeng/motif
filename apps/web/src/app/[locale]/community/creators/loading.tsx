import { CreatorCardSkeleton } from '@/components/community/creator-card'
import { HairlineGrid, PageHeaderSkeleton, Skeleton } from '@/components/community/ui'

const CARDS = 9

/** 创作者名录的骨架：页头、一行人数、卡片格，位置和真实页面一一对应，翻页时看到的也是它。 */
export default function CreatorsLoading() {
  return (
    <div className="space-y-10" aria-busy="true">
      <PageHeaderSkeleton />
      <div className="space-y-5">
        <Skeleton className="h-5 w-24" />
        <HairlineGrid count={CARDS}>
          {Array.from({ length: CARDS }, (_, index) => (
            <CreatorCardSkeleton key={index} />
          ))}
        </HairlineGrid>
      </div>
    </div>
  )
}
