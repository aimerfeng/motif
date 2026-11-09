import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DynamicGridGallery, type DynamicGridGalleryProps } from './gallery-dynamic-grid'

export function Demo(props: DynamicGridGalleryProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<number | null>(null)
  const [manual, setManual] = useState(false)
  const count = Math.max(1, Math.round(props.columns ?? 3) * Math.round(props.rows ?? 2))

  // 自动播放：虚拟指针每 1.6 秒换一格，一轮结束后回到等分状态停一拍。
  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const steps = Math.min(count, 4)
      const slot = Math.floor(time / 1.6) % (steps + 1)
      const next = slot < steps ? (slot * 5 + 1) % count : null
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 1.7 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Field series · 2026</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Six days across the Ochre Basin</h2>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">Hover a frame to bring it forward. Shot between first light and dusk.</p>
        </div>
        <div className="aspect-[3/2] w-full" onPointerEnter={() => setManual(true)} onPointerLeave={() => setManual(false)}>
          <DynamicGridGallery {...props} activeIndex={manual ? undefined : auto} />
        </div>
      </section>
    </div>
  )
}
