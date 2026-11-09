import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SelectChartType, type SelectChartTypeProps } from './select-chart-type'

type Auto = { open: boolean; highlighted?: string; value: string }

/** 一轮 9 秒：展开，依次经过几种图表，选中柱状图后收起。 */
function scripted(time: number): Auto {
  const t = time % 9
  if (t < 0.6) return { open: false, value: 'line-chart' }
  if (t < 6.2) {
    const steps = ['line-chart', 'bar-chart', 'donut-chart', 'scatter-chart', 'bar-chart']
    const i = Math.min(steps.length - 1, Math.floor((t - 0.6) / 1.15))
    return { open: true, highlighted: steps[i], value: 'line-chart' }
  }
  return { open: false, value: 'bar-chart' }
}

export function Demo(props: SelectChartTypeProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Auto>({ open: false, value: 'line-chart' })
  const [manual, setManual] = useState(false)
  const [value, setValue] = useState('line-chart')

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.open === next.open && prev.highlighted === next.highlighted && prev.value === next.value ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3.0 },
  )

  return (
    <div
      ref={host}
      onPointerDownCapture={() => {
        if (!manual) {
          setValue(auto.value)
          setManual(true)
        }
      }}
      onKeyDownCapture={() => {
        if (!manual) {
          setValue(auto.value)
          setManual(true)
        }
      }}
      className="grid h-full w-full place-items-center bg-background p-4"
    >
      <div className="w-full max-w-[560px] rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex min-h-[260px] flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">Weekly signups</div>
            <div className="mt-1 text-xs text-muted-foreground">Widget 3 of 6 · Growth report</div>
          </div>
          <SelectChartType
            {...props}
            {...(manual
              ? { value, onValueChange: setValue }
              : { value: auto.value, open: auto.open, highlighted: auto.highlighted })}
          />
        </div>
      </div>
    </div>
  )
}
