import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { TeamSelector, type TeamSelectorProps } from './input-team-stepper'

const PRICE = 12

/** 一轮 8 秒：逐个加人到上限，撞一下上限，再逐个减回去，撞一下下限。 */
function scripted(time: number, min: number, max: number) {
  const t = time % 8
  const span = max - min
  const step = 2.6 / Math.max(1, span)
  if (t < 0.6) return { value: min, bumps: 0 }
  if (t < 3.2) return { value: Math.min(max, min + 1 + Math.floor((t - 0.6) / step)), bumps: 0 }
  if (t < 4.2) return { value: max, bumps: 1 }
  if (t < 6.8) return { value: Math.max(min, max - 1 - Math.floor((t - 4.2) / step)), bumps: 1 }
  return { value: min, bumps: 2 }
}

export function Demo(props: TeamSelectorProps) {
  const host = useRef<HTMLDivElement>(null)
  const min = Math.max(1, props.min ?? 1)
  const max = Math.max(min, Math.min(6, props.max ?? 4))
  const [auto, setAuto] = useState({ value: min, signal: 0 })
  const [manual, setManual] = useState<number | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const s = scripted(time, min, max)
      const c = Math.floor(time / 8)
      const signal = c * 2 + s.bumps
      setAuto((prev) => (prev.value === s.value && prev.signal === signal ? prev : { value: s.value, signal }))
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  const count = manual ?? auto.value
  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="flex w-full max-w-xs flex-col gap-3">
        <TeamSelector {...props} value={count} shakeSignal={manual === null ? auto.signal : undefined} onChange={setManual} />
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <span className="text-muted-foreground">Studio plan · {count} seats</span>
          <span className="font-semibold tabular-nums text-foreground">${count * PRICE}/mo</span>
        </div>
      </div>
    </div>
  )
}
