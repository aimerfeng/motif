import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type RefObject } from 'react'
import { defaults, MoireInterference, type MoireInterferenceProps } from './moire-interference'

/**
 * 演示用的「自动播放」：一个看不见的指针沿缓慢的利萨如曲线在画面中部游走，推着最上面一层光栅，
 * 条纹跟着扫动。它和漂移共用速度：drift 为 0 时它也停住。真实指针一动就让位，离开页面后恢复。
 */
function useGhostPointer(hostRef: RefObject<HTMLDivElement | null>, speed: number) {
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
      const target = hostRef.current?.firstElementChild
      if (!target || real.current) return
      const rect = target.getBoundingClientRect()
      const x = rect.left + rect.width * (0.5 + 0.36 * Math.sin(time * 0.7))
      const y = rect.top + rect.height * (0.5 + 0.26 * Math.sin(time * 1.02 + 1.1))
      target.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y }))
    },
    { speed, reducedMotion: 'static', staticTime: 0 },
  )
}

export function Demo(props: MoireInterferenceProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  useGhostPointer(hostRef, props.drift ?? defaults.drift)
  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden">
      <MoireInterference {...props} className="absolute inset-0" />
    </div>
  )
}
