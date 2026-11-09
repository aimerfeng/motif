import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { defaults, RelativeTimeZones, type RelativeTimeZonesProps } from './relative-time-zones'

// 固定的起点让海报和循环视频每次都一样；时钟由 useFrameLoop 的 time 推进。
const BASE = Date.UTC(2026, 2, 14, 15, 42, 8)

const DEPLOYS = [
  { id: 'd7f3a21', branch: 'main', note: 'Rate-limit retries on webhook sender', ago: 3 * 3600 + 12 * 60 },
  { id: '91bc04e', branch: 'main', note: 'Move session cache to the edge pool', ago: 26 * 3600 },
  { id: '4e0a9d8', branch: 'release/2.4', note: 'Fix invoice rounding for JPY', ago: 50 * 60 },
]

const CYCLE = 3.2

export function Demo(props: RelativeTimeZonesProps) {
  const host = useRef<HTMLDivElement>(null)
  const [seconds, setSeconds] = useState(0)
  const [active, setActive] = useState<number | null>(0)
  const [manual, setManual] = useState(false)
  const variant = props.variant ?? defaults.variant

  useFrameLoop(
    host,
    ({ time }) => {
      const s = Math.floor(time)
      setSeconds((prev) => (prev === s ? prev : s))
      if (manual) return
      const step = Math.floor(time / CYCLE)
      const phase = time % CYCLE
      const next = phase < CYCLE - 0.5 ? step % DEPLOYS.length : null
      setActive((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 1.2 },
  )

  const now = new Date(BASE + seconds * 1000)

  if (variant === 'list') {
    return (
      <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
        <div className="w-full max-w-[360px]">
          <div className="mb-2 flex items-baseline justify-between px-1">
            <span className="text-sm font-semibold">Team clocks</span>
            <span className="text-xs text-muted-foreground">On-call: Platform</span>
          </div>
          <RelativeTimeZones {...props} time={now} />
        </div>
      </div>
    )
  }

  return (
    <div ref={host} className="grid h-full w-full place-items-start justify-center bg-background p-4 pt-[12%]">
      <div className="w-full max-w-[440px] rounded-xl border bg-card/70 p-4 shadow-2xl shadow-black/30" onPointerEnter={() => setManual(true)}>
        <div className="mb-3 text-sm font-semibold">Recent deploys</div>
        <ul className="grid gap-3">
          {DEPLOYS.map((d, i) => (
            <li key={d.id} className="grid grid-cols-[1fr_auto] items-start gap-3 text-sm">
              <div className="min-w-0">
                <div className="truncate">{d.note}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {d.id} · {d.branch}
                </div>
              </div>
              <RelativeTimeZones
                {...props}
                time={now}
                date={new Date(BASE - d.ago * 1000)}
                open={manual ? undefined : active === i}
                align="end"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
