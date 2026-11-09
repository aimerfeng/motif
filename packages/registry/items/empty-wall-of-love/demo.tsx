import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { EmptyWallOfLove, type EmptyWallOfLoveProps } from './empty-wall-of-love'

/** 每 4 秒开合一次：0–0.6 合上，0.6–3.4 打开。 */
export function Demo(props: EmptyWallOfLoveProps) {
  const host = useRef<HTMLDivElement>(null)
  const [autoOpen, setAutoOpen] = useState(false)
  const [manual, setManual] = useState<boolean | null>(null)
  const autoplay = props.autoplay ?? true

  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay || manual !== null) return
      const t = time % 4
      const next = t >= 0.6 && t < 3.4
      setAutoOpen((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2 },
  )

  const open = manual ?? (autoplay ? autoOpen : false)
  return (
    <div ref={host} className="flex h-full w-full items-center justify-center overflow-y-auto bg-background">
      <EmptyWallOfLove {...props} open={open} onOpenChange={setManual} className="py-12" />
    </div>
  )
}
