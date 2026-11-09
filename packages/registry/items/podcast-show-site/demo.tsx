import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { defaults, PodcastShowSite, type PodcastShowSiteProps } from './podcast-show-site'
import { palette } from './theme'

// 自动演示：像有人把指针停在波形上找想听的那一段，先看第 5 章，再往回看，再看结尾；用户一动指针就交还控制权。
const STOPS: { at: number; value: number | null }[] = [
  { at: 0, value: null },
  { at: 0.7, value: 0.64 },
  { at: 4.4, value: 0.43 },
  { at: 7.6, value: 0.87 },
  { at: 10.4, value: null },
]
const CYCLE = 12

export function Demo(props: PodcastShowSiteProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const [ghost, setGhost] = useState<number | null>(null)

  useEffect(() => {
    const element = host.current
    if (!element) return
    const stop = (event: PointerEvent) => {
      if (!event.isTrusted || !autoplay.current) return
      autoplay.current = false
      setGhost(null)
    }
    element.addEventListener('pointermove', stop)
    element.addEventListener('pointerdown', stop)
    return () => {
      element.removeEventListener('pointermove', stop)
      element.removeEventListener('pointerdown', stop)
    }
  }, [])

  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay.current) return
      const t = time % CYCLE
      let next: number | null = null
      for (const stop of STOPS) if (t >= stop.at) next = stop.value
      setGhost((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  const options = { ...defaults, ...props }
  return (
    <div ref={host} className="h-full w-full overflow-y-auto overflow-x-hidden" style={{ background: palette(options.accent, options.dark).bg }}>
      <PodcastShowSite {...props} ghostScrub={ghost} />
    </div>
  )
}
