import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PollResults, type PollResultsProps } from './poll-results'

const OPTIONS = [
  { id: 'offline', label: 'Offline mode' },
  { id: 'calendar', label: 'Two-way calendar sync' },
  { id: 'export', label: 'CSV and PDF export' },
  { id: 'themes', label: 'Custom workspace themes' },
]

const VOTES = { offline: 412, calendar: 298, export: 176, themes: 87 }

type Phase = { value: string[]; voted: boolean }

/** 一轮 8 秒：先选一项，再提交，结果展开后停留，最后复位。 */
function scripted(time: number): Phase {
  const t = time % 8
  if (t < 1) return { value: [], voted: false }
  if (t < 2.2) return { value: ['calendar'], voted: false }
  if (t < 7.6) return { value: ['calendar'], voted: true }
  return { value: [], voted: false }
}

export function Demo(props: Partial<PollResultsProps>) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Phase>({ value: [], voted: false })
  const [manual, setManual] = useState<Phase | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.voted === next.voted && prev.value.join() === next.value.join() ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 4.2 },
  )

  const phase = manual ?? auto
  const pressingSubmit = !manual && !phase.voted && phase.value.length > 0

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[420px] rounded-2xl border bg-card p-5 shadow-2xl shadow-black/30">
        <PollResults
          {...props}
          title="What should we build next?"
          description="Help us prioritize the Q3 roadmap."
          options={OPTIONS}
          votes={VOTES}
          value={phase.value}
          hasVoted={phase.voted}
          onValueChange={(v) => setManual({ value: Array.isArray(v) ? v : v ? [v] : [], voted: false })}
          action={
            <button
              type="button"
              disabled={phase.value.length === 0}
              onClick={() => setManual({ value: phase.value, voted: true })}
              className={
                'h-10 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-[opacity,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 ' +
                (pressingSubmit ? 'scale-[0.98]' : '')
              }
            >
              Submit vote
            </button>
          }
        />
        {manual && (
          <button type="button" onClick={() => setManual(null)} className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Reset poll
          </button>
        )}
      </div>
    </div>
  )
}
