// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { SimplexNoise } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#4449cf', '#ffd1e0', '#f94446', '#ffd36b', '#ffffff'],
  stepsPerColor: 2,
  softness: 0,
  speed: 0.5,
  scale: 0.6,
  rotation: 0,
}
/* @motif:end */

export type SimplexNoiseBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 单纯形噪声背景。children 叠在效果之上。 */
export function SimplexNoiseBackground({ className, style, children, ...props }: SimplexNoiseBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <SimplexNoise
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colors={options.colors}
        stepsPerColor={options.stepsPerColor}
        softness={options.softness}
        scale={options.scale}
        rotation={options.rotation}

        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 5000 : 0}
      />
      {children}
    </div>
  )
}
