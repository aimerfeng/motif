// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { GodRays } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#a600ff6e', '#6200fff0', '#ffffff', '#33fff5'],
  colorBack: '#000000',
  colorBloom: '#0000ff',
  density: 0.3,
  spotty: 0.3,
  intensity: 0.8,
  bloom: 0.4,
  speed: 0.75,
  offsetX: 0,
  offsetY: -0.55,
}
/* @motif:end */

export type GodRaysBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 丁达尔光束背景。children 叠在效果之上。 */
export function GodRaysBackground({ className, style, children, ...props }: GodRaysBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <GodRays
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colors={options.colors}
        colorBack={options.colorBack}
        colorBloom={options.colorBloom}
        density={options.density}
        spotty={options.spotty}
        intensity={options.intensity}
        bloom={options.bloom}
        offsetX={options.offsetX}
        offsetY={options.offsetY}
        midSize={0.2}
        midIntensity={0.4}
        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 4000 : 0}
      />
      {children}
    </div>
  )
}
