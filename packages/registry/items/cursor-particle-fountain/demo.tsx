import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { CoolMode, type CoolModeProps } from './cursor-particle-fountain'

/** 自动播放一圈 4 秒：0.2–1.8 秒按住按钮（指针微微晃动），2.6 秒轻点一下，和循环视频等长。 */
const CYCLE = 4

function useGhostPress(targetRef: React.RefObject<HTMLElement | null>) {
  const real = useRef(false)
  const down = useRef(false)

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.isTrusted) real.current = true
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrameLoop(
    targetRef,
    ({ time }) => {
      const target = targetRef.current
      if (!target || real.current) return
      const t = time % CYCLE
      const rect = target.getBoundingClientRect()
      const x = rect.left + rect.width * (0.5 + 0.18 * Math.sin(time * 2.4))
      const y = rect.top + rect.height * 0.5
      const holding = (t > 0.2 && t < 1.8) || (t > 2.6 && t < 2.68)
      const init = { clientX: x, clientY: y, bubbles: true }
      if (holding && !down.current) target.dispatchEvent(new PointerEvent('pointerdown', init))
      else if (!holding && down.current) target.dispatchEvent(new PointerEvent('pointerup', init))
      else target.dispatchEvent(new PointerEvent('pointermove', init))
      down.current = holding
    },
    { reducedMotion: 'static' },
  )
}

export function Demo(props: CoolModeProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [liked, setLiked] = useState(false)
  useGhostPress(buttonRef)

  return (
    <div className="grid h-full w-full place-items-center overflow-hidden bg-background p-4">
      <article className="w-full max-w-sm rounded-2xl border bg-card p-5 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-pink-500 text-xs font-semibold text-white">
            JN
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-card-foreground">June Navarro</p>
            <p className="truncate text-xs text-muted-foreground">Shipped v2.4 of the Fernly app</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-card-foreground">
          Offline sync is finally here. Edits made on a plane now merge cleanly when you land.
        </p>
        <div className="mt-5 flex items-center justify-between">
          <CoolMode {...props}>
            <button
              ref={buttonRef}
              type="button"
              aria-pressed={liked}
              onClick={() => setLiked((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
              </svg>
              Celebrate
            </button>
          </CoolMode>
          <span className="text-xs text-muted-foreground">{liked ? '129 cheers' : '128 cheers'}</span>
        </div>
      </article>
    </div>
  )
}
