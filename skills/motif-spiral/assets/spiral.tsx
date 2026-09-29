// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { Spiral } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colorBack: '#001429',
  colorFront: '#79d1ff',
  density: 1,
  strokeWidth: 0.5,
  strokeTaper: 0,
  softness: 0,
  noise: 0,
  noiseFrequency: 0.3,
  speed: 1,
  scale: 1,
}
/* @motif:end */

export type SpiralBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 螺线背景。children 叠在效果之上。 */
export function SpiralBackground({ className, style, children, ...props }: SpiralBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <Spiral
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colorBack={options.colorBack}
        colorFront={options.colorFront}
        density={options.density}
        strokeWidth={options.strokeWidth}
        strokeTaper={options.strokeTaper}
        softness={options.softness}
        noise={options.noise}
        noiseFrequency={options.noiseFrequency}
        scale={options.scale}
        distortion={0}
        strokeCap={0}
        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 3000 : 0}
      />
      {children}
    </div>
  )
}
