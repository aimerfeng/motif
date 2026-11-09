import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { FeaturesChartStack, type FeaturesChartStackProps } from './features-chart-stack'

export function Demo(props: FeaturesChartStackProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [fanned, setFanned] = useState(false)

  // 自动播放：每 4 秒一个周期，1–3 秒散开；用户真正移动指针后交给悬停
  useFrameLoop(
    ref,
    ({ time }) => {
      if (!auto) return
      const t = time % 4
      const next = t >= 1 && t < 3
      setFanned((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2 },
  )

  return (
    <div ref={ref} className="h-full w-full overflow-y-auto bg-background" onPointerMove={() => setAuto(false)}>
      <FeaturesChartStack {...props} fanned={auto ? fanned : undefined} className="min-h-full" />
    </div>
  )
}
