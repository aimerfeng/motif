import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { TextSplitFlap, type TextSplitFlapProps } from './text-split-flap'

// 每 3.6 秒重新挂载一次，所有行重新翻一遍；两轮 7.2 秒与循环视频等长。
const CYCLE = 3.6

const ROWS = [
  { time: '08:15', city: 'LISBON', gate: 'A12', status: 'BOARDING' },
  { time: '08:40', city: 'OSAKA', gate: 'C04', status: 'ON TIME' },
  { time: '09:05', city: 'NAIROBI', gate: 'B21', status: 'DELAYED' },
]

export function Demo(props: TextSplitFlapProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState(0)

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const next = Math.floor(time / CYCLE)
      setRun((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 2.5 },
  )

  return (
    <div ref={hostRef} className="grid h-full w-full place-items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-xl rounded-2xl border bg-card p-5 text-card-foreground shadow-2xl shadow-black/40 sm:p-7">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Daily visitors</p>
        <TextSplitFlap key={`hero-${run}`} {...props} className="mt-2 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl" />
        <div className="mt-6 border-t pt-4">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Departures</p>
          <ul className="mt-3 space-y-2 text-sm sm:text-base">
            {ROWS.map((row, index) => (
              <li key={row.city} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3">
                <TextSplitFlap key={`t-${run}`} {...props} text={row.time} stagger={(props.stagger ?? 40) + index * 10} className="tabular-nums text-muted-foreground" />
                <TextSplitFlap key={`c-${run}`} {...props} text={row.city} glyphs="ABCDEFGHIJKLMNOPQRSTUVWXYZ" className="font-semibold" />
                <TextSplitFlap key={`s-${run}`} {...props} text={row.status} glyphs="ABCDEFGHIJKLMNOPQRSTUVWXYZ" className="text-xs text-amber-300 sm:text-sm" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
