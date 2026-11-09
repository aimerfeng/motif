import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SliderRangeMarks, type SliderRangeMarksProps } from './slider-range-marks'

type Auto = { value: number | [number, number]; active: number | null }

const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)))

/** 一轮 8 秒：先拖下限，再拖上限，最后都回到起点。 */
function scripted(time: number, range: boolean, step: number): Auto {
  const t = time % 8
  const snap = (v: number) => Math.round(v / step) * step
  if (!range) {
    const v = 35 + 35 * ease((t - 0.6) / 2.4) - 35 * ease((t - 4.6) / 2.4)
    return { value: snap(v), active: (t > 0.4 && t < 3.2) || (t > 4.4 && t < 7.2) ? 0 : null }
  }
  const a = 25 - 10 * ease((t - 0.6) / 1.6) + 10 * ease((t - 5.2) / 1.6)
  const b = 45 + 30 * ease((t - 2.8) / 1.8) - 30 * ease((t - 5.2) / 1.6)
  let active: number | null = null
  if (t > 0.4 && t < 2.4) active = 0
  else if (t > 2.6 && t < 4.8) active = 1
  return { value: [snap(a), snap(b)], active }
}

const fmt = (v: number) => `$${v * 5}`

export function Demo(props: SliderRangeMarksProps) {
  const host = useRef<HTMLDivElement>(null)
  const range = (props.mode ?? 'range') === 'range'
  const vertical = props.orientation === 'vertical'
  const step = props.step ?? 1
  const [auto, setAuto] = useState<Auto>(() => scripted(0, range, step))
  const [manual, setManual] = useState<number | [number, number] | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = scripted(time, range, step)
      setAuto((prev) => (prev.active === next.active && String(prev.value) === String(next.value) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 1.6 },
  )

  const value = manual ?? auto.value
  const pair = Array.isArray(value) ? value : [0, value]
  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[340px] rounded-2xl border bg-card/70 p-5 shadow-2xl shadow-black/30">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-sm font-semibold">{range ? 'Price per night' : 'Max price per night'}</div>
          <div className="text-sm text-muted-foreground tabular-nums">
            {range ? `${fmt(pair[0])} – ${fmt(pair[1])}` : fmt(pair[1])}
          </div>
        </div>
        <div className="mb-5 text-xs text-muted-foreground">Taxes and cleaning fees included.</div>
        <div className={vertical ? 'flex justify-center pt-2' : 'px-2 pt-4'}>
          <SliderRangeMarks
            {...props}
            value={value}
            onValueChange={setManual}
            activeThumb={manual !== null ? null : auto.active}
            formatValue={fmt}
            thumbLabels={range ? ['Minimum price', 'Maximum price'] : ['Maximum price']}
            className={vertical ? 'h-44' : 'w-full'}
          />
        </div>
        <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
          <span>214 stays match</span>
          <span className="font-medium text-foreground">Show results</span>
        </div>
      </div>
    </div>
  )
}
