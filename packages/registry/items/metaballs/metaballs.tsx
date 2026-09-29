// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { Metaballs } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#6e33cc', '#ff5500', '#ffc105', '#ffc800', '#f585ff'],
  colorBack: '#000000',
  count: 12,
  size: 0.6,
  speed: 1,
  scale: 1,
  rotation: 0,
}
/* @motif:end */

export type MetaballsBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 融球背景。children 叠在效果之上。 */
export function MetaballsBackground({ className, style, children, ...props }: MetaballsBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <Metaballs
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colors={options.colors}
        colorBack={options.colorBack}
        count={options.count}
        size={options.size}
        scale={options.scale}
        rotation={options.rotation}

        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 4000 : 0}
      />
      {children}
    </div>
  )
}
