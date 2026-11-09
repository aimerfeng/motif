import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef } from 'react'
import { BoidsFlock, type BoidAttractor, type BoidsFlockProps } from './boids-flock'

export function Demo(props: BoidsFlockProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  // 两个吸引点沿一条 8 字缓慢游走，把鸟群拉成松散的两团；数组原地修改，组件每帧读取。
  const attractors = useRef<BoidAttractor[]>([
    { x: 0.35, y: 0.5 },
    { x: 0.65, y: 0.5 },
  ])

  // 真实指针一动就停下自动播放；脚本派发的事件 isTrusted 为 false。
  useEffect(() => {
    const stop = (event: PointerEvent) => {
      if (event.isTrusted) autoplay.current = false
    }
    window.addEventListener('pointermove', stop)
    return () => window.removeEventListener('pointermove', stop)
  }, [])

  // 虚拟指针缓慢划过画面，驱散路过的鸟群。时间取自帧循环，录屏时也对得上。
  useFrameLoop(
    host,
    ({ time }) => {
      const [a, b] = attractors.current
      if (a && b) {
        a.x = 0.5 + 0.24 * Math.cos(time * 0.3)
        a.y = 0.5 + 0.2 * Math.sin(time * 0.6)
        b.x = 1 - a.x
        b.y = 1 - a.y
      }
      const root = host.current
      const target = root?.firstElementChild
      if (!autoplay.current || !root || !target) return
      const rect = root.getBoundingClientRect()
      const x = rect.left + rect.width * (0.5 + 0.4 * Math.sin(time * 0.45))
      const y = rect.top + rect.height * (0.5 + 0.32 * Math.sin(time * 0.7 + 1))
      target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y }))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="relative h-full w-full overflow-hidden">
      <BoidsFlock {...props} attractors={attractors.current} className="absolute inset-0" />
    </div>
  )
}
