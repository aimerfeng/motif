import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { GoalRings, type GoalRing, type GoalRingsProps } from './goal-rings'

type Day = { id: string; short: string; name: string; date: string; focus?: number; reading?: number; water?: number }

// 一个虚构的习惯应用 Daybook 本周的数据：周四是今天，周五到周日还没到。
const DAYS: Day[] = [
  { id: 'mon', short: 'M', name: 'Monday', date: 'Mon, Nov 2', focus: 3.5, reading: 24, water: 2 },
  { id: 'tue', short: 'T', name: 'Tuesday', date: 'Tue, Nov 3', focus: 4.4, reading: 18, water: 1.6 },
  { id: 'wed', short: 'W', name: 'Wednesday', date: 'Wed, Nov 4', focus: 2.1, reading: 41, water: 2.5 },
  { id: 'thu', short: 'T', name: 'Today', date: 'Thu, Nov 5', focus: 3.2, reading: 36, water: 1.7 },
  { id: 'fri', short: 'F', name: 'Friday', date: 'Fri, Nov 6' },
  { id: 'sat', short: 'S', name: 'Saturday', date: 'Sat, Nov 7' },
  { id: 'sun', short: 'S', name: 'Sunday', date: 'Sun, Nov 8' },
]

const hours = (value: number) => {
  const h = Math.floor(value)
  const m = Math.round((value - h) * 60)
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, '0')}m`
}

function ringsFor(day: Day): GoalRing[] {
  return [
    { id: 'focus', label: 'Deep work', value: day.focus ?? 0, goal: 4, display: hours(day.focus ?? 0), goalDisplay: '4h' },
    { id: 'reading', label: 'Reading', value: day.reading ?? 0, goal: 30, display: String(day.reading ?? 0), goalDisplay: '30 pages' },
    { id: 'water', label: 'Water', value: day.water ?? 0, goal: 2.4, display: (day.water ?? 0).toFixed(1), goalDisplay: '2.4 L' },
  ]
}

const overall = (day: Day) => Math.round((ringsFor(day).reduce((sum, ring) => sum + Math.min(1, ring.value / ring.goal), 0) / 3) * 100)

// 12 秒一轮：今天 → 周一 → 周二 → 周三 → 回到今天，和循环视频等长。
const SCRIPT = ['thu', 'mon', 'tue', 'wed']

export function Demo(props: GoalRingsProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState('thu')
  const [manual, setManual] = useState<string | null>(null)
  const selected = DAYS.find((day) => day.id === (manual ?? auto)) ?? DAYS[3]!

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = SCRIPT[Math.floor((time % 12) / 3)]!
      setAuto((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-6">
      <section aria-label="Daily goals" className="w-full max-w-[480px] rounded-3xl border bg-card p-6 text-card-foreground shadow-[0_30px_80px_-40px_rgb(0_0_0/0.8)]">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Daybook</p>
            <h2 className="text-lg font-semibold tracking-tight">{selected.name}</h2>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">{selected.date}</p>
        </header>

        <GoalRings {...props} rings={ringsFor(selected)} caption="of goals" className="mt-5" />

        <div role="group" aria-label="This week" className="mt-6 flex justify-between border-t pt-4">
          {DAYS.map((day) => {
            const future = day.focus === undefined
            const isSelected = day.id === selected.id
            return (
              <button
                key={day.id}
                type="button"
                disabled={future}
                aria-pressed={isSelected}
                aria-label={future ? `${day.date}, upcoming` : `${day.date}, ${overall(day)}% of goals`}
                onClick={() => setManual(day.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl px-2 py-1.5 outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default',
                  isSelected ? 'bg-foreground/[0.07]' : 'enabled:hover:bg-foreground/[0.04]',
                )}
              >
                <span className={cn('text-[11px] font-medium', isSelected ? 'text-foreground' : 'text-muted-foreground')}>{day.short}</span>
                <span aria-hidden className={cn(future && 'opacity-60')}>
                  <GoalRings
                    rings={ringsFor(day)}
                    size={30}
                    thickness={4}
                    gap={1.5}
                    palette={props.palette}
                    trackOpacity={props.trackOpacity}
                    spring={props.spring}
                    stagger={0}
                    showLegend={false}
                    showCenter={false}
                  />
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
