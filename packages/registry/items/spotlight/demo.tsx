import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef } from 'react'
import { Spotlight, type SpotlightProps } from './spotlight'

// 虚拟指针沿一条 8 秒闭合的利萨如曲线移动，和循环视频的长度一致。
const CYCLE = 8

/** 演示用的「自动播放」：没有真实指针时向卡片派发合成的 pointermove；真实指针一动就让位，离开页面后恢复。 */
function useGhostPointer(cardRef: React.RefObject<HTMLElement | null>, cursorRef: React.RefObject<HTMLElement | null>) {
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
    cardRef,
    ({ time }) => {
      const card = cardRef.current
      const cursor = cursorRef.current
      if (!card || real.current) return
      const rect = card.getBoundingClientRect()
      const phase = (time / CYCLE) * Math.PI * 2
      const x = rect.left + rect.width / 2 + Math.sin(phase) * rect.width * 0.38
      const y = rect.top + rect.height / 2 + Math.sin(phase * 2 + 0.9) * rect.height * 0.3
      card.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }))
      if (cursor) {
        cursor.style.opacity = '1'
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
    },
    { reducedMotion: 'static', staticTime: 2.4 },
  )
}

const STATS = [
  { value: '1.2s', label: 'Median build' },
  { value: '99.98%', label: 'Uptime, 90 days' },
  { value: '38', label: 'Edge regions' },
]

export function Demo(props: SpotlightProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  useGhostPointer(cardRef, cursorRef)

  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-background p-8">
      <div
        ref={cardRef}
        className="relative w-full max-w-lg rounded-3xl border bg-card p-8 shadow-2xl shadow-black/40 [background-image:radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:22px_22px]"
      >
        <Spotlight {...props} />
        <div className="relative">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />
            </svg>
          </div>
          <h3 className="mt-5 text-xl font-semibold tracking-tight text-card-foreground">Instant previews</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Every pull request gets its own URL within seconds, so reviewers can click through the change instead of reading the diff.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t pt-6">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-lg font-semibold tracking-tight text-card-foreground tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      {/* 虚拟光标：让海报里看得出有指针在卡片上。 */}
      <div ref={cursorRef} className="pointer-events-none absolute top-0 left-0 opacity-0" aria-hidden>
        <svg viewBox="0 0 24 24" className="size-5 -translate-x-[3px] -translate-y-[2px] drop-shadow-md" fill="#fff" stroke="#0b0b10" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M5 3l14 7.5-6 1.8-2.6 6z" />
        </svg>
      </div>
    </div>
  )
}
