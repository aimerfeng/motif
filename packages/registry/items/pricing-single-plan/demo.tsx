import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PricingSinglePlan, type PricingSinglePlanProps } from './pricing-single-plan'

const PERIOD = 2.4

export function Demo(props: PricingSinglePlanProps) {
  const host = useRef<HTMLDivElement>(null)
  const start = props.billing ?? 'annually'
  const other = start === 'annually' ? 'monthly' : 'annually'
  const [auto, setAuto] = useState(true)
  const [value, setValue] = useState(start)

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const next = Math.floor(time / PERIOD) % 2 === 0 ? start : other
      setValue((v) => (v === next ? v : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#ffffff' : '#030712' }}>
      <div className="flex min-h-full flex-col justify-center">
        <PricingSinglePlan
          {...props}
          value={value}
          onValueChange={(v) => {
            setAuto(false)
            setValue(v)
          }}
        />
      </div>
    </div>
  )
}
