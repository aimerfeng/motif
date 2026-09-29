import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef } from 'react'
import { Particles, type ParticlesProps } from './particles'

export function Demo(props: ParticlesProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)

  // 真实指针一动，自动播放就停下；脚本派发的事件 isTrusted 为 false。
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (event.isTrusted) autoplay.current = false
    }
    window.addEventListener('pointermove', onPointer)
    return () => window.removeEventListener('pointermove', onPointer)
  }, [])

  // 幽灵指针沿一条缓慢的 8 字轨迹移动，周期 8 秒，和循环视频等长。
  useFrameLoop(
    host,
    ({ time }) => {
      const element = host.current
      if (!autoplay.current || !element) return
      const bounds = element.getBoundingClientRect()
      const phase = (time * Math.PI) / 4
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: bounds.left + bounds.width * (0.5 + 0.32 * Math.sin(phase)),
          clientY: bounds.top + bounds.height * (0.5 + 0.28 * Math.sin(phase * 2)),
        }),
      )
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="relative h-full w-full overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,oklch(0.3_0.09_285/0.55),transparent_75%)]" />
      <Particles {...props} className="absolute inset-0" />
    </div>
  )
}
