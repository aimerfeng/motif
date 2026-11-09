import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef } from 'react'
import { DotFieldRipple, type DotFieldRippleProps } from './dot-field-ripple'

// 虚拟指针沿一条 8 秒闭合的利萨如曲线移动，和循环视频的长度一致。
const CYCLE = 8

/** 演示用的「自动播放」：没有真实指针时派发合成的 pointermove；真实指针一动就让位，离开页面后恢复。 */
function useGhostPointer(hostRef: React.RefObject<HTMLElement | null>) {
  const real = useRef(false)

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.isTrusted) real.current = true
    }
    const onLeave = () => {
      real.current = false
    }
    window.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const host = hostRef.current
      if (!host || real.current) return
      const rect = host.getBoundingClientRect()
      const phase = (time / CYCLE) * Math.PI * 2
      const x = rect.width * (0.5 + 0.28 * Math.sin(phase))
      const y = rect.height * (0.5 + 0.22 * Math.sin(phase * 2 + 0.9))
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + x, clientY: rect.top + y }))
    },
    { reducedMotion: 'static', staticTime: 1.2 },
  )
}

export function Demo(props: DotFieldRippleProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  useGhostPointer(hostRef)
  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden bg-background">
      <DotFieldRipple {...props} className="absolute inset-0" />
    </div>
  )
}
