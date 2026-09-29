// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { Dithering, type DitheringProps } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colorBack: '#000000',
  colorFront: '#3db9ff',
  shape: 'sphere',
  type: '4x4',
  size: 2,
  speed: 1,
  scale: 0.6,
}
/* @motif:end */

export type DitheringBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 抖动像素背景。children 叠在效果之上。 */
export function DitheringBackground({ className, style, children, ...props }: DitheringBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <Dithering
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colorBack={options.colorBack}
        colorFront={options.colorFront}
        shape={options.shape as DitheringProps['shape']}
        type={options.type as DitheringProps['type']}
        size={options.size}
        scale={options.scale}
        fit={options.shape === 'wave' || options.shape === 'dots' || options.shape === 'simplex' ? 'none' : 'contain'}
        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 5000 : 0}
      />
      {children}
    </div>
  )
}
