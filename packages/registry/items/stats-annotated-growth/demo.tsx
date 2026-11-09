import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { REPLAY_FADE, StatsAnnotatedGrowth, storyLength, type StatsAnnotatedGrowthProps } from './stats-annotated-growth'

/** 画完之后停留的秒数；默认参数下整个周期正好 10 秒，与循环视频等长。 */
const HOLD = 2.45

export function Demo(props: StatsAnnotatedGrowthProps) {
  const host = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState(0)
  const period = storyLength(props.drawDuration) + HOLD

  // 按帧循环的时间周期性重播（截图时只有 rAF 被接管，不能用 setTimeout）。
  // 提前 REPLAY_FADE 秒触发：曲线淡出之后正好在周期边界从头开始，标题和说明一直留在原地。
  useFrameLoop(host, ({ time }) => setCycle(Math.floor((time + REPLAY_FADE) / period)), { reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <div className="flex min-h-full flex-col justify-center">
        <StatsAnnotatedGrowth {...props} replayKey={cycle} />
      </div>
    </div>
  )
}
