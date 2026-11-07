import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef } from 'react'
import { InteractiveGrid, type InteractiveGridProps } from './interactive-grid'

// 虚拟指针沿一条 8 秒闭合的利萨如曲线移动，和循环视频的长度一致。
const CYCLE = 8

/** 演示用的「自动播放」：没有真实指针时派发合成的 pointermove；真实指针一动就让位，离开页面后恢复。 */
function useGhostPointer(hostRef: React.RefObject<HTMLElement | null>, cursorRef: React.RefObject<HTMLElement | null>) {
  const real = useRef(false)

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!event.isTrusted) return
      real.current = true
      if (cursorRef.current) cursorRef.current.style.opacity = '0'
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
  }, [cursorRef])

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const host = hostRef.current
      const cursor = cursorRef.current
      if (!host || real.current) return
      const rect = host.getBoundingClientRect()
      const phase = (time / CYCLE) * Math.PI * 2
      const x = rect.width * (0.5 + 0.3 * Math.sin(phase))
      const y = rect.height * (0.5 + 0.24 * Math.sin(phase * 2 + 0.9))
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + x, clientY: rect.top + y }))
      if (cursor) {
        cursor.style.opacity = '1'
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
    },
    { reducedMotion: 'static', staticTime: 2 },
  )
}

export function Demo(props: InteractiveGridProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  useGhostPointer(hostRef, cursorRef)

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden bg-background">
      <InteractiveGrid {...props} className="absolute inset-0" />
      {/* 虚拟光标：让海报里看得出是指针在划过网格。 */}
      <div ref={cursorRef} className="pointer-events-none absolute top-0 left-0 opacity-0" aria-hidden>
        <svg viewBox="0 0 24 24" className="size-5 -translate-x-[3px] -translate-y-[2px] drop-shadow-md" fill="#fff" stroke="#0b0b10" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M5 3l14 7.5-6 1.8-2.6 6z" />
        </svg>
      </div>
    </div>
  )
}
