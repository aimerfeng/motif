// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { NeuroNoise } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colorFront: '#ffffff',
  colorMid: '#47a6ff',
  colorBack: '#000000',
  brightness: 0.05,
  contrast: 0.3,
  speed: 1,
  scale: 1,
  rotation: 0,
}
/* @motif:end */

export type NeuroNoiseBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 神经噪声背景。children 叠在效果之上。 */
export function NeuroNoiseBackground({ className, style, children, ...props }: NeuroNoiseBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <NeuroNoise
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colorFront={options.colorFront}
        colorMid={options.colorMid}
        colorBack={options.colorBack}
        brightness={options.brightness}
        contrast={options.contrast}
        scale={options.scale}
        rotation={options.rotation}

        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 3000 : 0}
      />
      {children}
    </div>
  )
}
