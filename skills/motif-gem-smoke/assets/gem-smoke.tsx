// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { GemSmoke } from '@paper-design/shaders-react'
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  shape: 'diamond',
  colors: ['#fe5b16', '#f7ff61', '#ffffff'],
  colorBack: '#000000',
  colorInner: '#000000',
  innerGlow: 0.65,
  outerGlow: 1,
  innerDistortion: 0.6,
  outerDistortion: 0.8,
  offset: 0,
  angle: 0,
  size: 0.8,
  scale: 0.6,
  speed: 1,
}
/* @motif:end */

export type GemSmokeProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 宝石烟雾：一颗宝石形的轮廓里翻涌着彩色烟雾，外圈带辉光。children 叠在效果之上。 */
export function GemSmokeShape({ className, style, children, ...props }: GemSmokeProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={{ background: options.colorBack, ...style }}>
      <GemSmoke
        className="absolute inset-0 -z-10"
        width="100%"
        height="100%"
        shape={options.shape as 'diamond'}
        colors={options.colors}
        colorBack={options.colorBack}
        colorInner={options.colorInner}
        innerGlow={options.innerGlow}
        outerGlow={options.outerGlow}
        innerDistortion={options.innerDistortion}
        outerDistortion={options.outerDistortion}
        offset={options.offset}
        angle={options.angle}
        size={options.size}
        scale={options.scale}
        // 减少动态效果时停在一帧好看的静态画面上。
        speed={reducedMotion ? 0 : options.speed}
        frame={reducedMotion ? 2200 : 0}
      />
      {children}
    </div>
  )
}
