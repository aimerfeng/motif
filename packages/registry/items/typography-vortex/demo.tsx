import { useEffect, useRef } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { TypographyVortex, type TypographyVortexProps } from './typography-vortex'

/**
 * 演示里加一个「自动播放」的虚拟指针：沿一条缓慢的李萨如曲线移动，偶尔点一下，
 * 这样海报和循环视频里也能看到溶解与吸入。真实指针一动就让位，离开后再接着放。
 * 组件本体不含这段逻辑。
 */
export function Demo(props: TypographyVortexProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const real = useRef(false)
  const clickCycle = useRef(-1)

  useFrameLoop(
    wrapRef,
    ({ time }) => {
      const host = wrapRef.current?.firstElementChild
      if (!host || real.current) return
      const rect = host.getBoundingClientRect()
      const x = rect.left + rect.width * (0.5 + 0.3 * Math.sin(time * 0.55 + 0.6))
      const y = rect.top + rect.height * (0.5 + 0.24 * Math.sin(time * 0.41 + 2.1))
      const init = { clientX: x, clientY: y, bubbles: false }
      host.dispatchEvent(new PointerEvent('pointermove', init))
      const cycle = Math.floor(time / 9)
      if (cycle !== clickCycle.current && time % 9 > 6.5) {
        clickCycle.current = cycle
        host.dispatchEvent(new PointerEvent('pointerdown', init))
      }
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    // 合成事件的 isTrusted 为 false，只有真实指针会让自动播放让位。
    const onMove = (event: PointerEvent) => {
      if (event.isTrusted) real.current = true
    }
    const onLeave = (event: PointerEvent) => {
      if (event.isTrusted) real.current = false
    }
    wrap.addEventListener('pointermove', onMove, true)
    wrap.addEventListener('pointerleave', onLeave)
    return () => {
      wrap.removeEventListener('pointermove', onMove, true)
      wrap.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={wrapRef} className="h-full w-full">
      <TypographyVortex {...props} className="h-full w-full" />
    </div>
  )
}
