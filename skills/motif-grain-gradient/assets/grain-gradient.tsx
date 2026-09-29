// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { GrainGradient, type GrainGradientProps } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#7300ff', '#eba8ff', '#00bfff', '#2a00ff'],
  colorBack: '#000000',
  shape: 'corners',
  softness: 0.5,
  intensity: 0.5,
  noise: 0.25,
  speed: 1,
  scale: 1,
  rotation: 0,
}
/* @motif:end */

export type GrainGradientBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 颗粒渐变背景。children 叠在效果之上。 */
export function GrainGradientBackground({ className, style, children, ...props }: GrainGradientBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <GrainGradient
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colors={options.colors}
        colorBack={options.colorBack}
        shape={options.shape as GrainGradientProps['shape']}
        softness={options.softness}
        intensity={options.intensity}
        noise={options.noise}
        scale={options.scale}
        rotation={options.rotation}
        fit={options.shape === 'wave' || options.shape === 'dots' || options.shape === 'truchet' ? 'none' : 'contain'}
        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 6200 : 0}
      />
      {children}
    </div>
  )
}
