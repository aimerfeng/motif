import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ExposureSlider, type ExposureSliderProps } from './exposure-slider'

/** 一轮 8 秒的曝光调节：先提亮，再压暗，最后回到 0。 */
const KEYS: [number, number][] = [
  [0, 0],
  [1.0, 0],
  [2.2, 0.45],
  [3.4, 0.45],
  [4.8, -0.3],
  [6.0, -0.3],
  [7.2, 0],
  [8, 0],
]

function scripted(time: number, min: number, max: number) {
  const t = time % 8
  let f = 0
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [t0, v0] = KEYS[i]!
    const [t1, v1] = KEYS[i + 1]!
    if (t >= t0 && t <= t1) {
      const k = (t - t0) / (t1 - t0)
      const e = k * k * (3 - 2 * k)
      f = v0 + (v1 - v0) * e
      break
    }
  }
  return Math.round(f >= 0 ? f * max : -f * min)
}

export function Demo(props: ExposureSliderProps) {
  const host = useRef<HTMLDivElement>(null)
  const [manual, setManual] = useState(false)
  const [auto, setAuto] = useState(0)
  const min = props.min ?? -20
  const max = props.max ?? 20

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, min, max)
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  return (
    <div
      ref={host}
      className="grid h-full w-full place-items-center bg-background p-4"
      onPointerDown={() => setManual(true)}
      onKeyDown={() => setManual(true)}
    >
      <div className="w-full max-w-[420px] rounded-2xl border bg-card/70 p-5 shadow-2xl shadow-black/30">
        <div className="mb-1 flex items-baseline justify-between text-sm font-semibold">
          <span>Light</span>
          <span className="text-xs font-normal text-muted-foreground">IMG_0412.raw</span>
        </div>
        <div className="mb-5 text-xs text-muted-foreground">Drag the ruler or use the arrow keys.</div>
        <div className="flex justify-center">
          <ExposureSlider {...props} value={manual ? undefined : auto} />
        </div>
      </div>
    </div>
  )
}
