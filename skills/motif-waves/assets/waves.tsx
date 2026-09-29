// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { Waves } from '@paper-design/shaders-react'
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colorFront: '#ffc21a',
  colorBack: '#0b0b0f',
  shape: 2.25,
  frequency: 0.2,
  amplitude: 1,
  spacing: 1.25,
  proportion: 0.6,
  speed: 0.6,
  scale: 1.7,
  rotation: 0,
}
/* @motif:end */

export type WavesBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 起伏的波纹线背景。children 叠在线条之上。 */
export function WavesBackground({ className, style, children, ...props }: WavesBackgroundProps) {
  const options = { ...defaults, ...props }
  const hostRef = useRef<HTMLDivElement>(null)
  const [time, setTime] = useState(0)

  // 上游的 Waves 是静态着色器。这里用一个缓慢的往复运动让它呼吸：
  // 线条上下漂移、形态轻微变形。减少动态效果时停在 time = 0。
  useFrameLoop(hostRef, ({ time }) => setTime(time), { speed: options.speed, reducedMotion: 'static', staticTime: 0 })
  const drift = Math.sin(time * 0.5) * 0.12
  const morph = Math.min(3, Math.max(0, options.shape + Math.sin(time * 0.37) * 0.18))

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={style}>
      <Waves
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colorFront={options.colorFront}
        colorBack={options.colorBack}
        frequency={options.frequency}
        amplitude={options.amplitude}
        spacing={options.spacing}
        proportion={options.proportion}
        scale={options.scale}
        rotation={options.rotation}
        shape={morph}
        offsetY={drift}
        softness={0}
      />
      {children}
    </div>
  )
}
