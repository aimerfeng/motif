import { useFrameLoop } from '@motif/runtime'
import { useMemo, useRef, useState } from 'react'
import { alignStart, DateWeekStrip, defaults, type DateWeekStripProps } from './date-week-strip'

const AGENDA: { offset: number; time: string; title: string }[] = [
  { offset: 0, time: '07:30', title: 'Tempo run, 6 km' },
  { offset: 1, time: '18:00', title: 'Strength: lower body' },
  { offset: 1, time: '20:30', title: 'Mobility, 20 min' },
  { offset: 3, time: '06:45', title: 'Intervals 8 × 400 m' },
  { offset: 4, time: '12:15', title: 'Easy spin, 45 min' },
  { offset: 5, time: '09:00', title: 'Long run, 16 km' },
  { offset: 5, time: '17:00', title: 'Yoga flow' },
  { offset: 8, time: '07:00', title: 'Recovery jog' },
  { offset: 9, time: '18:30', title: 'Track session' },
  { offset: 11, time: '08:00', title: 'Hill repeats' },
  { offset: 12, time: '10:00', title: 'Swim, 1.5 km' },
]

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const STEP = 0.8

export function Demo(props: DateWeekStripProps) {
  const host = useRef<HTMLDivElement>(null)
  const days = props.days ?? (defaults as { days: number }).days
  const weekStart = props.weekStart ?? (defaults as { weekStart: string }).weekStart
  const base = useMemo(() => alignStart(new Date(), weekStart), [weekStart])
  const markers = useMemo(() => AGENDA.map((a) => addDays(base, a.offset)), [base])

  const [auto, setAuto] = useState({ week: 0, index: 0 })
  const [manual, setManual] = useState<{ start: Date; value?: Date } | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const step = Math.floor(time / STEP)
      const week = Math.floor(step / days) % 2
      const index = step % days
      setAuto((prev) => (prev.week === week && prev.index === index ? prev : { week, index }))
    },
    { reducedMotion: 'static', staticTime: 1.8 },
  )

  const start = manual?.start ?? addDays(base, auto.week * days)
  const value = manual ? manual.value : addDays(start, auto.index)
  const items = value ? AGENDA.filter((a) => addDays(base, a.offset).getTime() === value.getTime()) : []
  const label = value?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[460px] rounded-2xl border bg-card/60 p-4 shadow-2xl shadow-black/30 sm:p-5">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div className="text-sm font-semibold text-foreground">Training plan</div>
          <div className="text-xs text-muted-foreground">Week of {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        </div>
        <DateWeekStrip
          {...props}
          markers={markers}
          startDate={start}
          value={value}
          onStartDateChange={(s) => s && setManual({ start: s, value })}
          onValueChange={(v) => setManual({ start, value: v })}
          className="w-full"
        />
        <div className="mt-4 min-h-[104px]">
          <div className="mb-2 text-xs font-medium text-muted-foreground">{label}</div>
          {items.length ? (
            <ul className="space-y-1.5">
              {items.map((item) => (
                <li key={item.title} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <span className="w-11 shrink-0 text-xs text-muted-foreground tabular-nums">{item.time}</span>
                  <span className="truncate text-foreground">{item.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground">Rest day. Nothing scheduled.</div>
          )}
        </div>
      </div>
    </div>
  )
}
