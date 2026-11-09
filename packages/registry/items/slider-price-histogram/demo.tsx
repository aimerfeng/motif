import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SliderPriceHistogram, type SliderPriceHistogramProps } from './slider-price-histogram'

const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)))

/** 一轮 8 秒：先把下限拖高，再把上限拖低，然后回到起点。 */
function scripted(time: number): [number, number] {
  const t = time % 8
  const lo = 200 + 160 * ease((t - 0.4) / 1.8) - 160 * ease((t - 5.2) / 2)
  const hi = 780 - 220 * ease((t - 2.6) / 1.8) + 220 * ease((t - 5.2) / 2)
  return [Math.round(lo), Math.round(hi)]
}

export function Demo(props: SliderPriceHistogramProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<[number, number]>(() => scripted(0))
  const [manual, setManual] = useState<[number, number] | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = scripted(time)
      setAuto((prev) => (prev[0] === next[0] && prev[1] === next[1] ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.2 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[340px] rounded-2xl border bg-card/70 p-5 shadow-2xl shadow-black/30">
        <div className="mb-1 text-sm font-semibold">Filter stays</div>
        <div className="mb-5 text-xs text-muted-foreground">Nightly price before taxes and fees.</div>
        <SliderPriceHistogram {...props} label="Price per night" value={manual ?? auto} onValueChange={setManual} />
      </div>
    </div>
  )
}
