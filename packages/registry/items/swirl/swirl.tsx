// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { Swirl } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#ffd1d1', '#ff8a8a', '#660000'],
  colorBack: '#330000',
  bandCount: 4,
  twist: 0.1,
  center: 0.2,
  proportion: 0.5,
  softness: 0,
  noise: 0.2,
  speed: 0.32,
}
/* @motif:end */

export type SwirlBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 螺旋色带背景。children 叠在效果之上。 */
export function SwirlBackground({ className, style, children, ...props }: SwirlBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <Swirl
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colors={options.colors}
        colorBack={options.colorBack}
        bandCount={options.bandCount}
        twist={options.twist}
        center={options.center}
        proportion={options.proportion}
        softness={options.softness}
        noise={options.noise}

        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 3000 : 0}
      />
      {children}
    </div>
  )
}
