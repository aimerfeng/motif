import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SliderParameterPanel, defaults, type SliderParameterPanelProps } from './slider-parameter-panel'

const LOOP = 8
/** 每组行在一轮里依次滑到的几个值（按行排列）；首尾相同，循环接得上。第三段回到默认值，重置按钮随之隐去。 */
const KEYS: Record<string, number[][]> = {
  transform: [
    [-2, 4, 2],
    [3.5, 4, -1.5],
    [3.5, -2.5, -1.5],
    [0, 0, 0],
    [-2, 4, 2],
  ],
  model: [
    [1.25, 0.9, 0.5],
    [0.4, 0.9, 0.5],
    [0.4, 0.6, -0.8],
    [1, 1, 0],
    [1.25, 0.9, 0.5],
  ],
}

const ease = (x: number) => x * x * (3 - 2 * x)

function scripted(time: number, rows: string, precision: number): number[] {
  const keys = KEYS[rows] ?? KEYS.transform!
  const segs = keys.length - 1
  const t = ((time % LOOP) / LOOP) * segs
  const i = Math.min(segs - 1, Math.floor(t))
  // 每段前 60% 在滑动，后面停一下，让数字框和重置按钮看得清。
  const k = ease(Math.min(1, (t - i) / 0.6))
  const a = keys[i]!
  const b = keys[i + 1]!
  return a.map((v, j) => Number((v + (b[j]! - v) * k).toFixed(precision)))
}

export function Demo(props: SliderParameterPanelProps) {
  const host = useRef<HTMLDivElement>(null)
  const rows = props.rows ?? defaults.rows
  const precision = props.precision ?? defaults.precision
  const [auto, setAuto] = useState<number[]>(() => scripted(0, rows, precision))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, rows, precision)
      setAuto((prev) => (prev.join() === next.join() ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.2 },
  )

  const stop = () => setManual(true)

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4" onPointerDown={stop} onKeyDown={stop}>
      <div className="w-full max-w-80 rounded-xl border bg-card p-5 shadow-2xl shadow-black/30">
        <SliderParameterPanel key={rows} {...props} values={manual ? undefined : auto} />
      </div>
    </div>
  )
}
