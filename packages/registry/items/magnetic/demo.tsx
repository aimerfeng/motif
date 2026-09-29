import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef } from 'react'
import { Magnetic, type MagneticProps } from './magnetic'

const ICONS = [
  { label: 'Like', path: 'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7C19.5 15.9 12 20.5 12 20.5z' },
  { label: 'Comment', path: 'M4 5h16v11H9l-5 4z' },
  { label: 'Save', path: 'M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z' },
  { label: 'Share', path: 'M12 3v12M8 7l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7' },
]

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
      const x = rect.left + rect.width / 2 + Math.sin(phase) * rect.width * 0.36
      const y = rect.top + rect.height / 2 + Math.sin(phase * 2 + 0.9) * 26
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }))
      if (cursor) {
        cursor.style.opacity = '1'
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
    },
    { reducedMotion: 'static', staticTime: 1.4 },
  )
}

export function Demo(props: MagneticProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  useGhostPointer(hostRef, cursorRef)

  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-background p-8">
      <div className="text-center">
        <p className="mb-5 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">Post actions</p>
        <div ref={hostRef} className="flex items-center gap-3 rounded-3xl border bg-card px-8 py-9 shadow-2xl shadow-black/40">
          {ICONS.map((icon) => (
            <Magnetic key={icon.label} {...props}>
              <button
                type="button"
                aria-label={icon.label}
                className="grid size-12 place-items-center rounded-full border bg-secondary text-secondary-foreground shadow-md shadow-black/30"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={icon.path} />
                </svg>
              </button>
            </Magnetic>
          ))}
          <div className="mx-1 h-8 w-px bg-border" aria-hidden />
          <Magnetic {...props}>
            <button type="button" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20">
              Follow
            </button>
          </Magnetic>
        </div>
      </div>
      {/* 虚拟光标：只是为了让海报里看得出「有指针在靠近」。 */}
      <div ref={cursorRef} className="pointer-events-none absolute top-0 left-0 opacity-0" aria-hidden>
        <svg viewBox="0 0 24 24" className="size-5 -translate-x-[3px] -translate-y-[2px] drop-shadow-md" fill="#fff" stroke="#0b0b10" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M5 3l14 7.5-6 1.8-2.6 6z" />
        </svg>
      </div>
    </div>
  )
}
