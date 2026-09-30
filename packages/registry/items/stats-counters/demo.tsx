import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { StatsCounters, type StatsCountersProps } from './stats-counters'

const PERIOD = 6

export function Demo(props: StatsCountersProps) {
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState(0)

  useFrameLoop(
    host,
    ({ time }) => {
      const n = Math.floor(time / PERIOD)
      setCycle(n)
      if (stage.current) stage.current.style.opacity = String(Math.min(1, (PERIOD - (time - n * PERIOD)) / 0.4))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <div ref={stage} className="flex min-h-full flex-col justify-center">
        <StatsCounters key={`${cycle}:${JSON.stringify(props)}`} {...props} />
      </div>
    </div>
  )
}
