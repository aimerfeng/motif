import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PaperTextureBackground, defaults, type PaperTextureBackgroundProps } from './paper-texture'

/** 光源方向来回摆动的幅度（度）和周期（秒）：让折痕和皱褶接住移动的光。 */
const SWEEP = 40
const PERIOD = 10

export function Demo(props: PaperTextureBackgroundProps) {
  const host = useRef<HTMLDivElement>(null)
  const base = props.angle ?? defaults.angle
  const [angle, setAngle] = useState(base)
  useFrameLoop(host, ({ time }) => setAngle((((base + Math.sin((time / PERIOD) * Math.PI * 2) * SWEEP) % 360) + 360) % 360), {
    reducedMotion: 'static',
    staticTime: 0,
  })

  return (
    <div ref={host} className="h-full w-full">
      <PaperTextureBackground {...props} angle={angle} className="h-full w-full" />
    </div>
  )
}
