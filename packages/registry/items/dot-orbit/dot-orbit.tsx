// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { DotOrbit } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#ffc96b', '#ff6200', '#ff2f00', '#421100', '#1a0000'],
  colorBack: '#000000',
  size: 1,
  sizeRange: 0,
  spreading: 1,
  stepsPerColor: 4,
  speed: 1.5,
  scale: 1,
}
/* @motif:end */

export type DotOrbitBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 点阵轨道背景。children 叠在效果之上。 */
export function DotOrbitBackground({ className, style, children, ...props }: DotOrbitBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <DotOrbit
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colors={options.colors}
        colorBack={options.colorBack}
        size={options.size}
        sizeRange={options.sizeRange}
        spreading={options.spreading}
        stepsPerColor={options.stepsPerColor}
        scale={options.scale}

        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 4000 : 0}
      />
      {children}
    </div>
  )
}
