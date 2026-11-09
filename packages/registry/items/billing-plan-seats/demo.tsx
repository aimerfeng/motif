import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { BillingPlanSeats, type BillingPlanSeatsProps } from './billing-plan-seats'

// 自动播放：每 4 秒切换一次消费上限开关；用户点了开关就交还控制
const PERIOD = 4

export function Demo(props: BillingPlanSeatsProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [on, setOn] = useState(props.showSpendCap ?? true)
  const base = props.showSpendCap ?? true

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const flip = Math.floor(time / PERIOD) % 2 === 1
      const next = flip ? !base : base
      setOn((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
        <BillingPlanSeats
          {...props}
          spendCapOn={on}
          onSpendCapChange={(v) => {
            setAuto(false)
            setOn(v)
          }}
        />
      </div>
    </div>
  )
}
