import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SlidingNumber, type SlidingNumberProps } from './sliding-number'

// 每 2 秒刷新一次指标（从第 1 秒起），4 步一轮，共 8 秒，与循环视频等长。
const STEP = 2
const REVENUE_STEPS = [0, 1360, 2870, 940]
const CUSTOMER_STEPS = [318, 327, 341, 322]
const ORDER_STEPS = [214, 219, 226, 231]

export function Demo(props: SlidingNumberProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const next = Math.floor((time + 1) / STEP) % REVENUE_STEPS.length
      setStep((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 2.5 },
  )

  const revenue = (props.value ?? 12480) + REVENUE_STEPS[step]!
  const customers = CUSTOMER_STEPS[step]!
  const change = ((revenue - (props.value ?? 12480)) / Math.max(1, props.value ?? 12480)) * 100

  return (
    <div ref={hostRef} className="grid h-full w-full place-items-center bg-background p-8">
      <div className="w-full max-w-md rounded-3xl border bg-card p-7 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Revenue this month</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 tabular-nums">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            Live
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <SlidingNumber {...props} value={revenue} className="text-5xl font-semibold tracking-tight text-card-foreground" />
          <span className="text-sm font-medium text-emerald-400 tabular-nums">{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-4 border-t pt-5">
          <div>
            <p className="text-xs text-muted-foreground">New customers</p>
            <SlidingNumber value={customers} prefix="" suffix="" grouping={false} spring={props.spring} className="mt-1 text-xl font-semibold text-card-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Orders today</p>
            <SlidingNumber value={ORDER_STEPS[step]!} prefix="" suffix="" grouping={false} spring={props.spring} className="mt-1 text-xl font-semibold text-card-foreground" />
          </div>
        </div>
      </div>
    </div>
  )
}
