import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { IssuePropertyPicker, assigneeOptions, priorityOptions, statusOptions, type IssuePropertyPickerProps, type Property } from './issue-property-picker'

const OPTIONS = { status: statusOptions, priority: priorityOptions, assignee: assigneeOptions }
const START: Record<Property, string> = { status: 'planned', priority: 'medium', assignee: 'emma-carter' }
/* 自动播放每轮依次选的值：一轮 6 秒。 */
const SEQUENCE: Record<Property, string[]> = {
  status: ['in-progress', 'completed', 'planned'],
  priority: ['urgent', 'high', 'medium'],
  assignee: ['ryan-mitchell', 'alex-morgan', 'emma-carter'],
}
const PERIOD = 6

type Auto = { value: string; open: boolean; active?: string }

function scripted(property: Property, time: number): Auto {
  const seq = SEQUENCE[property]
  const round = Math.floor(time / PERIOD)
  const t = time % PERIOD
  const from = round === 0 ? START[property] : seq[(round - 1) % seq.length]!
  const to = seq[round % seq.length]!
  const list = OPTIONS[property].map((o) => o.value)
  const a = list.indexOf(from)
  const b = list.indexOf(to)
  const steps = Math.abs(b - a)
  const openAt = 1
  const stepTime = 0.4
  const pickAt = openAt + 0.6 + steps * stepTime + 0.4
  if (t < openAt || t >= pickAt) return { value: t >= pickAt ? to : from, open: false }
  const k = Math.min(steps, Math.max(0, Math.floor((t - openAt - 0.6) / stepTime) + 1))
  return { value: from, open: true, active: list[a + Math.sign(b - a) * k] }
}

export function Demo(props: IssuePropertyPickerProps) {
  const host = useRef<HTMLDivElement>(null)
  const featured = (props.property ?? 'status') as Property
  const [auto, setAuto] = useState<Auto>({ value: START[featured], open: false })
  const [manual, setManual] = useState(false)
  const [values, setValues] = useState(START)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(featured, time)
      setAuto((prev) => (prev.value === next.value && prev.open === next.open && prev.active === next.active ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.2 },
  )

  const stop = () => {
    if (manual) return
    setManual(true)
    setValues((v) => ({ ...v, [featured]: auto.value }))
  }

  const rows: { property: Property; label: string }[] = [
    { property: 'status', label: 'Status' },
    { property: 'priority', label: 'Priority' },
    { property: 'assignee', label: 'Assignee' },
  ]

  return (
    <div ref={host} onPointerDown={stop} onKeyDown={stop} className="grid h-full w-full place-items-start justify-center overflow-hidden bg-background px-4 pt-[12vh]">
      <div className="w-full max-w-[400px] rounded-xl border bg-card p-5 shadow-2xl shadow-black/30">
        <div className="mb-1 font-mono text-xs text-muted-foreground">ENG-482</div>
        <div className="mb-4 text-sm font-semibold text-card-foreground">Retry failed webhook deliveries with backoff</div>
        <div className="space-y-2">
          {rows.map((row) => {
            const isAuto = !manual && row.property === featured
            return (
              <div key={row.property} className="flex items-center justify-between gap-3">
                <span className="w-16 shrink-0 text-xs text-muted-foreground">{row.label}</span>
                <IssuePropertyPicker
                  {...props}
                  property={row.property}
                  value={isAuto ? auto.value : values[row.property]}
                  onValueChange={(v) => setValues((s) => ({ ...s, [row.property]: v }))}
                  open={isAuto ? auto.open : undefined}
                  activeValue={isAuto ? auto.active : undefined}
                  className="min-w-0"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
