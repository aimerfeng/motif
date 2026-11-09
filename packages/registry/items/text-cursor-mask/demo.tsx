import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, type RefObject } from 'react'
import { TextCursorMask, type TextCursorMaskProps } from './text-cursor-mask'

const CYCLE = 8

/** 演示用的自动播放：没有真实指针时派发合成的 pointermove，在空白处游走并扫过文字；真实指针一动就让位。 */
function useGhostPointer(hostRef: RefObject<HTMLElement | null>) {
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
      const target = host?.firstElementChild
      if (!host || !target || real.current) return
      const rect = host.getBoundingClientRect()
      const phase = (time / CYCLE) * Math.PI * 2
      const x = rect.left + rect.width / 2 + Math.sin(phase) * rect.width * 0.32
      const y = rect.top + rect.height / 2 + Math.sin(phase * 2) * rect.height * 0.3
      target.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }))
    },
    { reducedMotion: 'static', staticTime: 0.4 },
  )
}

export function Demo(props: TextCursorMaskProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  useGhostPointer(hostRef)
  return (
    <div ref={hostRef} className="h-full w-full bg-background">
      <TextCursorMask {...props} />
    </div>
  )
}
