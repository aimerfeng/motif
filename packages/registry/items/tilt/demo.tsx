import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef } from 'react'
import { Tilt, type TiltProps } from './tilt'

// 虚拟指针沿一条 8 秒闭合的利萨如曲线移动，和循环视频的长度一致。
const CYCLE = 8

/** 演示用的「自动播放」：没有真实指针时向卡片派发合成的 pointermove；真实指针一动就让位，离开页面后恢复。 */
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
      const target = hostRef.current?.querySelector('[data-ghost-target]')
      const cursor = cursorRef.current
      if (!target || real.current) return
      const rect = target.getBoundingClientRect()
      const phase = (time / CYCLE) * Math.PI * 2
      const x = rect.left + rect.width / 2 + Math.sin(phase) * rect.width * 0.42
      const y = rect.top + rect.height / 2 + Math.sin(phase * 2 + 0.9) * rect.height * 0.36
      target.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }))
      if (cursor) {
        cursor.style.opacity = '1'
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )
}

export function Demo(props: TiltProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  useGhostPointer(hostRef, cursorRef)

  return (
    <div ref={hostRef} className="relative grid h-full w-full place-items-center overflow-hidden bg-background p-8">
      <Tilt {...props} className="relative w-72 rounded-3xl border bg-card p-4 shadow-2xl shadow-black/50">
        <div data-ghost-target>
          <div
            className="relative aspect-square overflow-hidden rounded-2xl shadow-xl shadow-black/40 [transform:translateZ(28px)]"
            style={{
              background:
                'radial-gradient(circle at 28% 24%, #f0abfc 0, transparent 46%), radial-gradient(circle at 78% 72%, #38bdf8 0, transparent 52%), linear-gradient(135deg, #4c1d95, #1e1b4b)',
            }}
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" fill="none" stroke="white" strokeOpacity="0.28" strokeWidth="0.4" aria-hidden>
              {[12, 22, 32, 42].map((r) => (
                <circle key={r} cx="50" cy="50" r={r} />
              ))}
              <circle cx="50" cy="50" r="3" fill="white" fillOpacity="0.5" stroke="none" />
            </svg>
          </div>
          <div className="mt-4 flex items-end justify-between gap-3 px-1 pb-1">
            <div className="[transform:translateZ(40px)]">
              <p className="text-lg font-semibold tracking-tight text-card-foreground">Nocturnes</p>
              <p className="text-sm text-muted-foreground">Ada Lindqvist</p>
              <p className="mt-2 text-xs text-muted-foreground">12 tracks · 48 min</p>
            </div>
            <button
              type="button"
              aria-label="Play"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 [transform:translateZ(56px)]"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                <path d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.4-6.5a.8.8 0 0 0 0-1.4L9.2 4.8A.8.8 0 0 0 8 5.5z" />
              </svg>
            </button>
          </div>
        </div>
      </Tilt>
      {/* 虚拟光标：让海报里看得出有指针在卡片上。 */}
      <div ref={cursorRef} className="pointer-events-none absolute top-0 left-0 opacity-0" aria-hidden>
        <svg viewBox="0 0 24 24" className="size-5 -translate-x-[3px] -translate-y-[2px] drop-shadow-md" fill="#fff" stroke="#0b0b10" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M5 3l14 7.5-6 1.8-2.6 6z" />
        </svg>
      </div>
    </div>
  )
}
