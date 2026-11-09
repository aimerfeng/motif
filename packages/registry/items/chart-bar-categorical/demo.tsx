import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ChartBarCategorical, type ChartBarCategoricalProps } from './chart-bar-categorical'

const PERIOD = 8

export function Demo(props: ChartBarCategoricalProps) {
  const host = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)

  // 自动播放：入场后虚拟指针依次悬停各月，展示变暗与提示框。
  useFrameLoop(
    host,
    ({ time }) => {
      const t = time % PERIOD
      setActive(t < 1.6 ? null : Math.min(5, Math.floor(((t - 1.6) / (PERIOD - 1.6)) * 6)))
    },
    { reducedMotion: 'static', staticTime: 3.5 },
  )

  return (
    <div ref={host} className="flex h-full w-full items-center justify-center bg-background p-4" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
      <ChartBarCategorical {...props} activeIndex={active} />
    </div>
  )
}
