import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SlideToConfirm, type SlideToConfirmProps } from './slide-to-confirm'

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

/** 一轮 9 秒：静候 -> 慢慢滑过 -> 已确认 -> 复位。 */
function scripted(time: number): { progress: number; done: boolean } {
  const t = time % 9
  if (t < 1.4) return { progress: 0, done: false }
  if (t < 3.2) return { progress: easeInOut((t - 1.4) / 1.8), done: false }
  if (t < 6.8) return { progress: 1, done: true }
  if (t < 7.6) return { progress: 1 - easeInOut((t - 6.8) / 0.8), done: false }
  return { progress: 0, done: false }
}

export function Demo(props: SlideToConfirmProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(() => scripted(0))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      setAuto(scripted(time))
    },
    { reducedMotion: 'static', staticTime: 4.6 },
  )

  return (
    <div
      ref={host}
      onPointerDown={() => setManual(true)}
      className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_110%,oklch(0.36_0.12_30/0.55),transparent)] bg-background p-6"
    >
      <div className="w-full max-w-[380px] rounded-3xl border bg-card/80 p-6 shadow-2xl shadow-black/40">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-foreground/[0.07]">
            <svg viewBox="0 0 24 24" className="size-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="12" rx="2.5" />
              <path d="M9 20h6M12 16v4" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">Studio Display</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Connected · 3 apps open
            </div>
          </div>
        </div>
        <SlideToConfirm
          {...props}
          progress={manual ? undefined : auto.progress}
          done={manual ? undefined : auto.done}
          className="mx-auto"
        />
        <p className="mt-4 text-center text-xs text-muted-foreground">Unsaved work is kept for 30 days.</p>
      </div>
    </div>
  )
}
