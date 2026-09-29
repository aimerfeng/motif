// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { MeshGradient } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#e0eaff', '#241d9a', '#f75092', '#9f50d3'],
  distortion: 0.8,
  swirl: 0.1,
  grainMixer: 0,
  grainOverlay: 0,
  speed: 0.6,
  scale: 1,
  rotation: 0,
}
/* @motif:end */

export type MeshGradientBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 流动的网格渐变背景。children 叠在渐变之上。 */
export function MeshGradientBackground({ className, style, children, ...props }: MeshGradientBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <MeshGradient
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colors={options.colors}
        distortion={options.distortion}
        swirl={options.swirl}
        grainMixer={options.grainMixer}
        grainOverlay={options.grainOverlay}
        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 4200 : 0}
        scale={options.scale}
        rotation={options.rotation}
      />
      {children}
    </div>
  )
}
