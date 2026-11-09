// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Defaults, parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { PaperTexture } from '@paper-design/shaders-react'
import { cn } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colorPaper: '#ffffff',
  colorShadow: '#cccccc',
  roughness: 0.4,
  fiber: 0.4,
  folds: 0.5,
  crumples: 0,
  wrinkles: 1,
  drops: 0.4,
  angle: 300,
  seed: 4,
}
/* @motif:end */

export type PaperTextureBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 纸张肌理：Paper 的 PaperTexture 静态着色器铺满容器，children 叠在纸面之上。 */
export function PaperTextureBackground({ className, style, children, ...props }: PaperTextureBackgroundProps) {
  const options = { ...defaults, ...props }

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={{ backgroundColor: options.colorPaper, ...style }}>
      <PaperTexture
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colorBack="#d3d2ab"
        colorPaper={options.colorPaper}
        colorShadow={options.colorShadow}
        roughness={options.roughness}
        roughnessSize={0.5}
        fiber={options.fiber}
        fiberSize={0.5}
        folds={options.folds}
        foldSizeX={1}
        foldSizeY={1}
        wrinkles={options.wrinkles}
        wrinkleSize={0.65}
        crumples={options.crumples}
        crumpleCount={6}
        drops={options.drops}
        angle={options.angle}
        seed={options.seed}
        fit="contain"
        scale={0.9}
      />
      {children}
    </div>
  )
}
