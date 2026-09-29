// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { SmokeRing } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#ffffff'],
  colorBack: '#000000',
  radius: 0.25,
  thickness: 0.65,
  innerShape: 0.7,
  noiseScale: 3,
  noiseIterations: 8,
  speed: 0.5,
  scale: 0.8,
  offsetY: 0,
}
/* @motif:end */

export type SmokeRingBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 烟环背景。children 叠在效果之上。 */
export function SmokeRingBackground({ className, style, children, ...props }: SmokeRingBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <SmokeRing
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colors={options.colors}
        colorBack={options.colorBack}
        radius={options.radius}
        thickness={options.thickness}
        innerShape={options.innerShape}
        noiseScale={options.noiseScale}
        noiseIterations={options.noiseIterations}
        scale={options.scale}
        offsetY={options.offsetY}

        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 5000 : 0}
      />
      {children}
    </div>
  )
}
