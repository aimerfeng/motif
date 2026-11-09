import { Skeleton } from '@/components/community/ui'

/** 打开条目时立刻出的骨架：标题区和「预览 + 调参面板」两栏的位置和真实页面一致，预览框尺寸不跳。 */
export default function ItemLoading() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-8 pb-24 sm:px-8" aria-busy="true">
      <Skeleton className="h-4 w-44" />
      <Skeleton className="mt-4 h-10 w-64 sm:h-12 sm:w-80" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="aspect-[4/3] rounded-[var(--radius-card)] border border-line bg-sunken sm:aspect-[16/10]" />
        <Skeleton className="h-80" />
      </div>
    </main>
  )
}
