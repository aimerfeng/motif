// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Source: https://github.com/paper-design/shaders/blob/43cd68d/packages/shaders-react/src/shaders/color-panels.tsx
// Built on @paper-design/shaders-react; parameter ranges are narrowed from the Paper docs, and the defaults derive from Paper's Default preset.
// Modified by Motif; see the item's provenance.
import { ColorPanels } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#ff9d00', '#fd4f30', '#809bff', '#6d2eff', '#333aff', '#f15cff', '#ffd557'],
  colorBack: '#04040c',
  density: 3,
  length: 1.1,
  skew: 0,
  blur: 0,
  fadeOut: 0.3,
  rotation: 100,
  scale: 0.78,
  speed: 0.5,
}
/* @motif:end */

export type ColorPanelsBackgroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 旋转光板：一叠半透明的发光玻璃板围着中轴展开、缓缓转动。children 叠在效果之上。 */
export function ColorPanelsBackground({ className, style, children, ...props }: ColorPanelsBackgroundProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style}>
      <ColorPanels
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        colors={options.colors}
        colorBack={options.colorBack}
        density={options.density}
        length={options.length}
        // 上游的两个斜切角在官方预设里总是相等；合成一个参数，光板始终左右对称。
        angle1={options.skew}
        angle2={options.skew}
        blur={options.blur}
        fadeOut={options.fadeOut}
        // 边缘高光和轴心淡出固定开启：玻璃板的轮廓和纵深感靠它们撑着，关掉只会更平。
        edges
        fadeIn={1}
        gradient={0}
        rotation={options.rotation}
        scale={options.scale}
        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 4000 : 0}
      />
      {children}
    </div>
  )
}
