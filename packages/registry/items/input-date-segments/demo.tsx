import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { defaults, InputDateSegments, type DateSegmentsValue, type InputDateSegmentsProps, type SegmentType } from './input-date-segments'

const TARGET: Record<SegmentType, string> = { month: '04', day: '18', year: '2026', hour: '07', minute: '45', dayPeriod: 'p' }
const LOOP = 8

// 演示脚本：按语言区域的顺序逐段「键入」，停留后清空，循环播放
function orderOf(locale: string, granularity: string, h12: boolean): SegmentType[] {
  const opts: Intl.DateTimeFormatOptions = {
    ...(granularity !== 'time' ? { year: 'numeric', month: '2-digit', day: '2-digit' } : {}),
    ...(granularity !== 'day' ? { hour: '2-digit', minute: '2-digit', hourCycle: h12 ? 'h12' : 'h23' } : {}),
  }
  return new Intl.DateTimeFormat(locale, opts)
    .formatToParts(new Date(2001, 10, 22, 10, 33))
    .map((p) => p.type)
    .filter((t): t is SegmentType => ['year', 'month', 'day', 'hour', 'minute', 'dayPeriod'].includes(t))
}

function scripted(time: number, order: SegmentType[]): { value: DateSegmentsValue; active: SegmentType | null } {
  const t = time % LOOP
  const value: DateSegmentsValue = {}
  if (t > LOOP - 0.8) return { value, active: null }
  const slot = Math.min(0.9, 5.6 / order.length)
  let active: SegmentType | null = null
  let pm = false
  order.forEach((type, i) => {
    const start = 0.5 + i * slot
    if (t < start) return
    const typed = TARGET[type]
    const chars = type === 'dayPeriod' ? 1 : Math.min(typed.length, Math.floor((t - start) / 0.16) + 1)
    if (t < start + slot) active = type
    if (type === 'dayPeriod') pm = true
    else if (type === 'hour') value.hour = Number(typed.slice(0, chars))
    else value[type] = Number(typed.slice(0, chars)) || null
  })
  if (pm && value.hour != null) value.hour = (value.hour % 12) + 12
  return { value, active }
}

export function Demo(props: InputDateSegmentsProps) {
  const host = useRef<HTMLDivElement>(null)
  const d = defaults as Required<InputDateSegmentsProps>
  const locale = props.locale ?? d.locale
  const granularity = props.granularity ?? d.granularity
  const h12 = (props.hourCycle ?? d.hourCycle) === '12'
  const [auto, setAuto] = useState<{ value: DateSegmentsValue; active: SegmentType | null }>({ value: {}, active: null })
  const [manual, setManual] = useState<DateSegmentsValue | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, orderOf(locale, granularity, h12))
      setAuto((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 7 },
  )

  const label = granularity === 'time' ? 'Pickup time' : granularity === 'minute' ? 'Departure' : 'Travel date'
  const hint = granularity === 'day' ? 'Use the arrow keys or type the numbers.' : 'Local time at the arrivals hall.'

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[340px] rounded-xl border bg-card p-6" onFocusCapture={() => manual ?? setManual(auto.value)}>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Book a transfer</h2>
        <p className="mt-1 mb-5 text-[13px] text-muted-foreground">Shuttle from the airport to your hotel.</p>
        <InputDateSegments
          {...props}
          label={label}
          description={hint}
          name="date"
          value={manual ?? auto.value}
          activeSegment={manual ? null : auto.active}
          onChange={setManual}
        />
      </div>
    </div>
  )
}
