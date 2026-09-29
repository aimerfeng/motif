// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { PulsingBorder } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#0dc1fd', '#d915ef', '#ff3f2ecc'],
  colorBack: '#00000000',
  roundness: 0.25,
  thickness: 0.1,
  softness: 0.75,
  bloom: 0.25,
  spotSize: 0.5,
  pulse: 0.25,
  smoke: 0.3,
  speed: 1,
}
/* @motif:end */

export type PulsingBorderCardProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 脉冲光边。children 叠在光边之上，尺寸由外层决定。 */
export function PulsingBorderCard({ className, style, children, ...props }: PulsingBorderCardProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <PulsingBorder
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colors={options.colors}
        colorBack={options.colorBack}
        roundness={options.roundness}
        thickness={options.thickness}
        softness={options.softness}
        bloom={options.bloom}
        spotSize={options.spotSize}
        pulse={options.pulse}
        smoke={options.smoke}
        scale={1}
        margin={0.06}
        intensity={0.2}
        spots={4}
        smokeSize={0.6}
        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 5000 : 0}
      />
      {children}
    </div>
  )
}
