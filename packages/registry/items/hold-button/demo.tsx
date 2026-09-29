import { useRef, useState } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { HoldButton, defaults, type HoldButtonProps } from './hold-button'

const PERIOD = 5

export function Demo(props: HoldButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [holding, setHolding] = useState(false)
  const holdDuration = props.holdDuration ?? defaults.holdDuration

  // 空闲时每隔几秒自动「按住」一次直到确认；真实按压照常生效。减少动态效果时不自动播放。
  useFrameLoop(
    ref,
    ({ time }) => {
      const t = (time % Math.max(PERIOD, holdDuration + 3.4)) - 0.5
      setHolding(t >= 0 && t < holdDuration + 0.1)
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={ref} className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex flex-col items-center gap-4">
        <HoldButton {...props} holding={holding} />
        <p className="text-xs text-muted-foreground">Removes 14 projects permanently</p>
      </div>
    </div>
  )
}
