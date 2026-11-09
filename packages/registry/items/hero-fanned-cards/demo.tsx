import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { HeroFannedCards, type HeroFannedCardsProps } from './hero-fanned-cards'

const ORDER = [1, 0, 2, null] as const

/** Autoplay: after the entrance, lift each card in turn as if hovered; real pointer input stops it. */
export function Demo(props: HeroFannedCardsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const [auto, setAuto] = useState(true)

  useFrameLoop(
    ref,
    ({ time }) => {
      if (!auto) return
      const t = time - 2
      const idx = t < 0 ? null : ORDER[Math.floor(t / 1.2) % ORDER.length] ?? null
      setActive((prev) => (prev === idx ? prev : idx))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={ref} className="h-full w-full overflow-y-auto bg-orange-50" onPointerMove={() => auto && setAuto(false)}>
      <div className="flex min-h-full flex-col justify-center">
        <HeroFannedCards {...props} activeIndex={auto ? active : undefined} />
      </div>
    </div>
  )
}
