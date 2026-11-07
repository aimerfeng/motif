import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { CardFlip, type CardFlipProps } from './card-flip'

export function Demo(props: CardFlipProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const [flipped, setFlipped] = useState(false)

  // 真实指针一动就停下自动播放，翻回正面，交给用户自己悬停；脚本派发的事件 isTrusted 为 false。
  useEffect(() => {
    const stop = (event: PointerEvent) => {
      if (!event.isTrusted || !autoplay.current) return
      autoplay.current = false
      setFlipped(false)
    }
    window.addEventListener('pointermove', stop)
    return () => window.removeEventListener('pointermove', stop)
  }, [])

  // 一轮 5 秒：2 秒时翻到背面，停 2.2 秒再翻回来。用帧循环的时间而不是定时器，录屏时也能对上。
  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay.current) return
      const t = time % 5
      setFlipped(t >= 2 && t < 4.2)
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-8">
      <CardFlip
        {...props}
        flipped={flipped}
        onFlippedChange={(next) => {
          autoplay.current = false
          setFlipped(next)
        }}
      />
    </div>
  )
}
