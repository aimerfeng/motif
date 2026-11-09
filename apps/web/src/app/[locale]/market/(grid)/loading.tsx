import { Skeleton } from '@/components/community/ui'
import { ItemCardSkeleton } from '@/components/market/item-card'

/**
 * 进市场时立刻出的骨架：和真实页面同样的标题、层级标签和卡片网格位置，内容出来时不跳。
 * 市场按请求渲染，几百个条目的数据要整页取回；没有这个骨架时点了「市场」要等到数据全部回来才有反应。
 * 放在路由组 (grid) 里，只管市场首页，不会在打开条目页时闪出网格。
 */
export default function MarketLoading() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-12 pb-24 sm:px-8 sm:pt-14" aria-busy="true">
      <div className="max-w-2xl">
        <Skeleton className="h-[46px] w-48 sm:h-[59px] sm:w-60" />
        <Skeleton className="mt-4 h-4 w-full max-w-md" />
      </div>
      <section className="mt-10">
        <div className="flex gap-6 border-b border-line pb-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-16" />
          ))}
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className="min-w-0">
              <ItemCardSkeleton />
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
