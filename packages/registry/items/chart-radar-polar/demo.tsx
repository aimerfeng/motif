import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ChartRadarPolar, type ChartRadarPolarProps } from './chart-radar-polar'

const PERIOD = 8

export function Demo(props: ChartRadarPolarProps) {
  const host = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const count = props.chartType === 'polar' ? 4 : 5

  // 自动播放：入场后虚拟指针依次悬停各个维度 / 扇形，展示提示框。
  useFrameLoop(
    host,
    ({ time }) => {
      const t = time % PERIOD
      setActive(t < 1.4 ? null : Math.min(count - 1, Math.floor(((t - 1.4) / (PERIOD - 1.4)) * count)))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={host} className="flex h-full w-full items-center justify-center bg-background p-4" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
      <ChartRadarPolar {...props} activeIndex={active} />
    </div>
  )
}
