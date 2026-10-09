import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { Scrubber, type ScrubberProps } from './scrubber'

const ROWS = [
  { key: 'exposure', min: -2, max: 2, step: 0.05, decimals: 2, start: 0.35, phase: 0.0 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, decimals: 0, start: 18, phase: 1.6 },
  { key: 'warmth', label: 'Warmth', min: 2000, max: 9000, step: 50, decimals: 0, start: 5600, phase: 3.1 },
  { key: 'vignette', label: 'Vignette', min: 0, max: 1, step: 0.01, decimals: 2, start: 0.22, phase: 4.6 },
] as const

type Values = Record<(typeof ROWS)[number]['key'], number>
const START = Object.fromEntries(ROWS.map((r) => [r.key, r.start])) as Values

/** 每个滑块按自己的相位缓慢来回摆，轮流成为「正在拖动」的那一条。 */
function scripted(time: number): { values: Values; active: string } {
  const values = { ...START }
  for (const r of ROWS) {
    const mid = (r.min + r.max) / 2
    const amp = (r.max - r.min) * 0.32
    const raw = r.start + Math.sin(time * 0.55 + r.phase) * amp * 0.9 + (mid - r.start) * 0.15
    values[r.key] = Math.round((raw - r.min) / r.step) * r.step + r.min
  }
  const slot = Math.floor(time / 2.4) % ROWS.length
  return { values, active: ROWS[slot].key }
}

export function Demo(props: ScrubberProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(() => scripted(0))
  const [manual, setManual] = useState<Values | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      setAuto(scripted(time))
    },
    { reducedMotion: 'static', staticTime: 3.4 },
  )

  const values = manual ?? auto.values
  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_70%_at_50%_0%,oklch(0.93_0.05_65/0.6),transparent)] bg-background p-6">
      <div className="w-full max-w-[400px] rounded-2xl border bg-card p-5 shadow-xl shadow-stone-900/10">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-sm font-semibold">Develop</span>
          <span className="text-xs text-muted-foreground">DSC_0412.RAF</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {ROWS.map((row) => (
            <Scrubber
              key={row.key}
              {...props}
              label={'label' in row ? row.label : props.label}
              min={row.min}
              max={row.max}
              step={row.step}
              decimals={row.decimals}
              value={values[row.key]}
              active={manual ? undefined : auto.active === row.key}
              onValueChange={(v) => setManual({ ...values, [row.key]: v })}
            />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Drag anywhere on a bar, or focus it and use the arrow keys.</p>
      </div>
    </div>
  )
}
