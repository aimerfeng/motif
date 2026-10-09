import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { SwipeButton, type SwipeButtonProps } from './swipe-button'

export function Demo(props: SwipeButtonProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const [active, setActive] = useState(false)

  // 真实指针一动，自动播放停下，交给按钮自己的悬停；脚本派发的事件 isTrusted 为 false。
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!event.isTrusted || !autoplay.current) return
      autoplay.current = false
      setActive(false)
    }
    window.addEventListener('pointermove', onPointer)
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  // 自动播放：4 秒一轮，1 秒时扫过去，3 秒时扫回来，和循环视频等长。
  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay.current) return
      const phase = time % 4
      const next = phase > 1 && phase < 3
      setActive((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 2 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[#f6f3ec]">
      <SwipeButton {...props} active={autoplay.current ? active : undefined} />
    </div>
  )
}
