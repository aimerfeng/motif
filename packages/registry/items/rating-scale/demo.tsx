import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { RatingScale, defaults, type RatingScaleProps } from './rating-scale'

const LOOP = 8

/** A slow scripted walk through the scale, from the frame-loop time. */
function scripted(time: number, type: string, max: number): number {
  const steps = type === 'nps' ? [Math.round(max * 0.3), Math.round(max * 0.6), max, Math.round(max * 0.9)] : [2, 3, 5, 4]
  const t = time % LOOP
  return steps[Math.min(Math.floor(t / (LOOP / steps.length)), steps.length - 1)]!
}

export function Demo(props: RatingScaleProps) {
  const host = useRef<HTMLDivElement>(null)
  const type = props.type ?? defaults.type
  const max = props.max ?? defaults.max
  const [auto, setAuto] = useState(() => scripted(0, type, max))
  const [manual, setManual] = useState<{ key: string; value: number } | null>(null)
  const key = `${type}:${max}`

  useFrameLoop(
    host,
    ({ time }) => {
      const next = scripted(time, type, max)
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 5 },
  )

  const value = manual && manual.key === key ? manual.value : auto

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg shadow-black/20">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Ticket #4182 resolved</div>
            <div className="text-xs text-muted-foreground">Support chat with Mara · 12 min</div>
          </div>
          <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">Closed</span>
        </div>
        <RatingScale {...props} value={value} onValueChange={(v) => setManual({ key, value: v })} />
      </div>
    </div>
  )
}
