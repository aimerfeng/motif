import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ColorSwatches, defaults, type ColorSwatchesProps } from './radio-color-swatches'

const NAMES = ['Harbor', 'Iris', 'Peony', 'Ember', 'Marigold', 'Honey', 'Fern', 'Slate', 'Sand', 'Ink']
const STEP = 1.4

export function Demo(props: ColorSwatchesProps) {
  const host = useRef<HTMLDivElement>(null)
  const palette = props.palette ?? defaults.palette
  const [auto, setAuto] = useState(0)
  const [manual, setManual] = useState<string | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = Math.floor(time / STEP) % palette.length
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 1.2 },
  )

  const current = manual && palette.includes(manual) ? manual : palette[auto % palette.length]!
  const index = Math.max(0, palette.indexOf(current))
  const labels = palette.map((_, i) => NAMES[i % NAMES.length]!)

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[300px] rounded-xl border bg-card p-4 shadow-xl shadow-black/20">
        <div className="mb-4 flex items-center gap-3">
          <span
            aria-hidden
            className="size-10 shrink-0 rounded-lg border transition-[background-color] duration-300 motion-reduce:transition-none"
            style={{ backgroundColor: current }}
          />
          <div className="min-w-0">
            <div className="text-sm leading-5 font-semibold">Canvas tote</div>
            <div className="text-xs leading-4 text-muted-foreground">{labels[index]} · $48</div>
          </div>
        </div>
        <ColorSwatches {...props} labels={labels} value={current} onValueChange={setManual} />
      </div>
    </div>
  )
}
