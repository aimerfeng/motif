import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { AiFeedbackBar, defaults, type AiFeedbackBarProps, type FeedbackStep } from './ai-feedback-bar'

const COMMENT = 'The second command fails on Windows.'

type Frame = { step: FeedbackStep; picked: string[]; comment: string }

/** One 10 s loop: thumbs down, pick reasons, type a comment, send, thanks; then a thumbs up. */
function scripted(time: number, reasons: string[]): Frame {
  const t = time % 10
  if (t < 1.2) return { step: 'idle', picked: [], comment: '' }
  if (t < 5.4) {
    const order = [reasons[1], reasons[0]].filter((r): r is string => Boolean(r))
    const picked = order.slice(0, t < 2.2 ? 0 : t < 2.9 ? 1 : 2)
    const chars = Math.max(0, Math.min(COMMENT.length, Math.floor((t - 3.1) * 18)))
    return { step: 'reasons', picked, comment: COMMENT.slice(0, chars) }
  }
  if (t < 7.2) return { step: 'done', picked: [], comment: '' }
  if (t < 8.2) return { step: 'idle', picked: [], comment: '' }
  return { step: 'helpful', picked: [], comment: '' }
}

function Info() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}

export function Demo(props: AiFeedbackBarProps) {
  const host = useRef<HTMLDivElement>(null)
  const [manual, setManual] = useState(false)
  const reasons = (props.reasons ?? defaults.reasons)
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean)
  const [auto, setAuto] = useState<Frame>(() => scripted(0, reasons))

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, reasons)
      setAuto((prev) => (prev.step === next.step && prev.comment === next.comment && prev.picked.join('|') === next.picked.join('|') ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 4.8 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4 sm:p-8" onPointerDown={() => setManual(true)} onKeyDown={() => setManual(true)}>
      <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-2xl shadow-black/40">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Assistant</div>
        <p className="text-sm leading-6 text-foreground">
          To reset the local cache, stop the dev server, run <code className="rounded bg-muted px-1 py-0.5 text-xs">tern cache clear</code>, then start it again with{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">tern dev</code>.
        </p>
        <div className="mt-4">
          <AiFeedbackBar
            {...props}
            className="w-full"
            icon={
              <span className="shrink-0" style={{ color: props.accent ?? defaults.accent }}>
                <Info />
              </span>
            }
            step={manual ? undefined : auto.step}
            selectedReasons={manual ? undefined : auto.picked}
            comment={manual ? undefined : auto.comment}
          />
        </div>
      </div>
    </div>
  )
}
