import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { FoldedCornerCards, toneColors, type FoldedCornerCardsProps } from './card-folded-corner'

export function Demo(props: FoldedCornerCardsProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const [lifted, setLifted] = useState<number | undefined>(0)

  // 真实指针一动就停下自动播放，交给悬停。
  useEffect(() => {
    const stop = (event: PointerEvent) => {
      if (!event.isTrusted || !autoplay.current) return
      autoplay.current = false
      setLifted(undefined)
    }
    window.addEventListener('pointermove', stop)
    return () => window.removeEventListener('pointermove', stop)
  }, [])

  // 每 1.5 秒轮到下一张卡掀起折角，最后留一段全部放平。
  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay.current) return
      const t = time % 6
      const next = t < 4.5 ? Math.floor(t / 1.5) : undefined
      setLifted((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0.5 },
  )

  const page = toneColors(props.tone ?? 'light').page
  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-y-auto p-4 sm:p-8" style={{ backgroundColor: page }}>
      <div className="w-full max-w-4xl" onClick={(e) => e.preventDefault()}>
        <FoldedCornerCards {...props} liftedIndex={lifted} />
      </div>
    </div>
  )
}
