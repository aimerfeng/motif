import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { InteractiveHoverButton, type InteractiveHoverButtonProps } from './interactive-hover-button'

export function Demo(props: InteractiveHoverButtonProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const [active, setActive] = useState(false)

  // 真实指针一动就停下自动播放，交给用户自己悬停；脚本派发的事件 isTrusted 为 false。
  useEffect(() => {
    const stop = (event: PointerEvent) => {
      if (!event.isTrusted || !autoplay.current) return
      autoplay.current = false
      setActive(false)
    }
    window.addEventListener('pointermove', stop)
    return () => window.removeEventListener('pointermove', stop)
  }, [])

  // 每 4 秒「悬停」一次，停留 1.8 秒。用帧循环的时间而不是定时器，录屏时也能对上。
  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay.current) return
      const t = time % 4
      setActive(t >= 1 && t < 2.8)
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex flex-col items-center gap-4">
        <InteractiveHoverButton {...props} active={active} />
        <p className="text-xs text-muted-foreground">Version 2.4 · 18 improvements and fixes</p>
      </div>
    </div>
  )
}
