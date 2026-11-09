import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { DisclosureCard, type DisclosureCardProps } from './card-disclosure'

export function Demo(props: DisclosureCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const [open, setOpen] = useState(false)

  // 真实指针一动就停下自动播放，交给用户自己点。
  useEffect(() => {
    const stop = (event: PointerEvent) => {
      if (!event.isTrusted || !autoplay.current) return
      autoplay.current = false
    }
    window.addEventListener('pointermove', stop)
    return () => window.removeEventListener('pointermove', stop)
  }, [])

  // 一轮 6 秒：1.5 秒展开，停到 4.5 秒收回。
  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay.current) return
      const t = time % 6
      const next = t >= 1.5 && t < 4.5
      setOpen((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <DisclosureCard
        {...props}
        open={open}
        onOpenChange={(next) => {
          autoplay.current = false
          setOpen(next)
        }}
      />
    </div>
  )
}
