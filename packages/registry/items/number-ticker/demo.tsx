import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { NumberTicker, type NumberTickerProps } from './number-ticker'

/** 演示每隔一个周期重播一次，循环视频的长度与它一致。 */
const PERIOD = 5

export function Demo(props: NumberTickerProps) {
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
    { reducedMotion: 'static', staticTime: 1 },
  )

  // 第二、三个指标沿用弹簧与方向，数值和格式用自己的。
  const { spring, direction, startOnView } = props
  const at = (extra: number): NumberTickerProps => ({
    ...(spring ? { spring } : {}),
    ...(direction ? { direction } : {}),
    ...(startOnView !== undefined ? { startOnView } : {}),
    delay: (props.delay ?? 0) + extra,
  })

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-8">
      <div ref={stage} key={`${cycle}:${JSON.stringify(props)}`} className="w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-card-foreground">Studio overview</p>
          <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">Last 30 days</span>
        </div>
        <div className="mt-6 grid grid-cols-3 divide-x">
          <div className="pr-6">
            <p className="text-3xl font-semibold sm:text-4xl">
              <NumberTicker {...props} />
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">Effects copied</p>
          </div>
          <div className="px-6">
            <p className="text-3xl font-semibold sm:text-4xl">
              <NumberTicker {...at(0.15)} value={99.98} startValue={0} decimalPlaces={2} suffix="%" prefix="" />
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">Uptime</p>
          </div>
          <div className="pl-6">
            <p className="text-3xl font-semibold sm:text-4xl">
              <NumberTicker {...at(0.3)} value={142} startValue={0} decimalPlaces={0} prefix="" suffix="" />
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">Countries</p>
          </div>
        </div>
      </div>
    </div>
  )
}
