import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { IsometricLayerExplode, type IsometricLayerExplodeProps, type LayerId } from './isometric-layer-explode'

type Forced = { tilt: boolean; focused: LayerId | null; value: string }

/** 一轮 12 秒：平面上输入几位 → 倾斜分层 → 依次单独查看三层 → 回到全部。 */
function scripted(time: number): Forced {
  const t = time % 12
  const value = '482915'.slice(0, Math.min(6, 3 + Math.floor(t / 0.5)))
  if (t < 1.6) return { tilt: false, focused: null, value: '482915'.slice(0, 3 + Math.floor(t / 0.5)) }
  if (t < 4) return { tilt: true, focused: null, value }
  if (t < 6) return { tilt: true, focused: 'container', value }
  if (t < 8) return { tilt: true, focused: 'slots', value }
  if (t < 10) return { tilt: true, focused: 'input', value }
  return { tilt: true, focused: null, value }
}

export function Demo(props: IsometricLayerExplodeProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Forced>(() => scripted(3))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.tilt === next.tilt && prev.focused === next.focused && prev.value === next.value ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div
      ref={host}
      className="grid h-full w-full place-items-center overflow-y-auto bg-background p-4 sm:p-6"
      onPointerDown={() => setManual(true)}
      onKeyDown={() => setManual(true)}
    >
      <div className="w-full max-w-[720px]">
        <div className="mb-3 px-1">
          <div className="text-sm font-semibold">Anatomy of a one-time-code field</div>
          <div className="text-xs text-muted-foreground">Three stacked layers. Only the top one ever receives a click.</div>
        </div>
        <IsometricLayerExplode {...props} forced={manual ? undefined : auto} />
      </div>
    </div>
  )
}
