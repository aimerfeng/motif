import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ToggleSpring, type ToggleSpringProps } from './toggle-spring'

const ROWS = [
  { key: 'push', description: 'Alerts for mentions and replies' },
  { key: 'digest', label: 'Weekly digest', description: 'A summary every Monday at 9:00' },
  { key: 'sound', label: 'Play sounds', description: 'Chime when a message arrives' },
  { key: 'beta', label: 'Beta features', description: 'Try new things before they ship' },
] as const

type State = Record<(typeof ROWS)[number]['key'], boolean>
const START: State = { push: true, digest: false, sound: false, beta: false }

/** 一轮 9 秒：依次翻动几个开关，最后回到初始状态。 */
function scripted(time: number): { state: State; pressed: string | null } {
  const t = time % 9
  const state = { ...START }
  let pressed: string | null = null
  const flips: [keyof State, number][] = [
    ['digest', 1.2],
    ['sound', 2.6],
    ['beta', 4.0],
    ['push', 5.4],
  ]
  for (const [key, at] of flips) {
    if (t >= at + 0.25) state[key] = !START[key]
    if (t >= at && t < at + 0.25) pressed = key
  }
  if (t >= 7.4) return { state: START, pressed: t < 7.65 ? 'push' : null }
  return { state, pressed }
}

export function Demo(props: ToggleSpringProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<{ state: State; pressed: string | null }>({ state: START, pressed: null })
  const [manual, setManual] = useState<State | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.pressed === next.pressed && ROWS.every((r) => prev.state[r.key] === next.state[r.key]) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 4.6 },
  )

  const state = manual ?? auto.state
  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(55%_60%_at_50%_100%,oklch(0.3_0.09_285/0.4),transparent)] bg-background p-6">
      <div className="w-full max-w-[420px] rounded-2xl border bg-card/70 p-5 shadow-2xl shadow-black/30">
        <div className="mb-1 text-sm font-semibold">Notifications</div>
        <div className="mb-4 text-xs text-muted-foreground">Choose what reaches you, and when.</div>
        <div className="divide-y divide-border/70">
          {ROWS.map((row) => (
            <div key={row.key} className="flex items-center py-3.5 first:pt-1 last:pb-1">
              <ToggleSpring
                {...props}
                label={'label' in row ? row.label : props.label}
                description={row.description}
                checked={state[row.key]}
                pressed={manual ? undefined : auto.pressed === row.key}
                onCheckedChange={(value) => setManual({ ...state, [row.key]: value })}
                className="w-full flex-row-reverse justify-between"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
