import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef } from 'react'
import { SmoothCursor, type SmoothCursorProps } from './smooth-cursor'

/** 虚拟指针每 2 秒去下一个目标：0.55 秒沿一段弧线移过去，再停一会儿；四个目标 8 秒一圈，和循环视频等长。 */
const SEGMENT = 2
const TRAVEL = 0.55

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/** 演示用的「自动播放」：没有真实指针时向容器派发合成的 pointermove；真实指针一动就让位，离开页面后恢复。 */
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
      const targets = Array.from(host.querySelectorAll<HTMLElement>('[data-ghost-target]'))
      if (targets.length === 0) return
      const anchor = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect()
        return { x: rect.left + Math.min(rect.width * 0.5, 44), y: rect.top + rect.height * 0.55 }
      }
      const segment = Math.floor(time / SEGMENT)
      const from = anchor(targets[segment % targets.length]!)
      const to = anchor(targets[(segment + 1) % targets.length]!)
      const t = easeInOutCubic(Math.min(1, (time - segment * SEGMENT) / TRAVEL))
      // 走一段微微拱起的弧线，而不是直线：箭头一路上会跟着转。
      const bend = Math.sin(Math.PI * t) * 0.22
      const x = from.x + (to.x - from.x) * t - (to.y - from.y) * bend
      const y = from.y + (to.y - from.y) * t + (to.x - from.x) * bend
      host.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }))
    },
    { reducedMotion: 'static', staticTime: 2.3 },
  )
}

const PEOPLE = [
  { initials: 'LO', name: 'Lena Ortiz', email: 'lena@northwind.studio', role: 'Owner', tint: 'linear-gradient(135deg, #f472b6, #a855f7)' },
  { initials: 'SW', name: 'Sam Whitaker', email: 'sam@northwind.studio', role: 'Can view', tint: 'linear-gradient(135deg, #38bdf8, #6366f1)' },
]

export function Demo(props: SmoothCursorProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  useGhostPointer(hostRef)

  return (
    <div ref={hostRef} className="relative grid h-full w-full place-items-center overflow-hidden bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl shadow-black/40">
        <h3 className="text-base font-semibold tracking-tight text-card-foreground">Share “Q3 roadmap”</h3>
        <p className="mt-1 text-sm text-muted-foreground">People you invite can comment and see version history.</p>
        <div className="mt-5 flex gap-2">
          <div data-ghost-target className="flex h-10 min-w-0 flex-1 items-center rounded-lg border bg-background/60 px-3 text-sm text-foreground">
            <span className="truncate">maya@northwind.studio</span>
          </div>
          <div data-ghost-target className="flex h-10 items-center gap-1.5 rounded-lg border bg-background/60 px-3 text-sm whitespace-nowrap text-muted-foreground">
            Can edit
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <button data-ghost-target type="button" className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
            Invite
          </button>
        </div>
        <ul className="mt-6 space-y-3">
          {PEOPLE.map((person) => (
            <li key={person.email} className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white" style={{ background: person.tint }}>
                {person.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-card-foreground">{person.name}</p>
                <p className="truncate text-xs text-muted-foreground">{person.email}</p>
              </div>
              <span className="text-xs text-muted-foreground">{person.role}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <button data-ghost-target type="button" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
              <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
            </svg>
            Copy link
          </button>
          <button type="button" className="h-9 rounded-lg border px-3.5 text-sm text-card-foreground">
            Done
          </button>
        </div>
      </div>
      <SmoothCursor {...props} />
    </div>
  )
}
