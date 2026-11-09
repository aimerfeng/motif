import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ChartAreaForecast, type ChartAreaForecastProps } from './chart-area-forecast'

const PERIOD = 6

export function Demo(props: ChartAreaForecastProps) {
  const host = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)

  // Autoplay: a virtual pointer sweeps across the months after the reveal.
  useFrameLoop(
    host,
    ({ time }) => {
      const t = time % PERIOD
      if (t < 1.4) {
        setActive(null)
        return
      }
      setActive(Math.min(8, Math.floor(((t - 1.4) / (PERIOD - 1.4)) * 9)))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={host} className="flex h-full w-full items-center justify-center bg-background p-4" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
      <ChartAreaForecast {...props} activeIndex={active} />
    </div>
  )
}
