// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { Warp, type WarpProps } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#121212', '#9470ff', '#121212', '#8838ff'],
  shape: 'checks',
  shapeScale: 0.1,
  proportion: 0.45,
  softness: 1,
  distortion: 0.25,
  swirl: 0.8,
  speed: 1,
  scale: 1,
  rotation: 0,
}
/* @motif:end */

export type WarpBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 扭曲漩涡背景。children 叠在效果之上。 */
export function WarpBackground({ className, style, children, ...props }: WarpBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <Warp
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colors={options.colors}
        shape={options.shape as WarpProps['shape']}
        shapeScale={options.shapeScale}
        proportion={options.proportion}
        softness={options.softness}
        distortion={options.distortion}
        swirl={options.swirl}
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
