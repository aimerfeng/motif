// SPDX-License-Identifier: Apache-2.0
// Paper Shaders (https://shaders.paper.design)
// Built on @paper-design/shaders-react. Parameter ranges and presets adapted from
// https://github.com/paper-design/shaders (43cd68d). Modified by Motif; see the item's provenance.
import { Heatmap } from '@paper-design/shaders-react'
import { cn, useDrawnImage, usePrefersReducedMotion } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  mark: 'heart',
  text: 'HOT',
  colors: ['#11206a', '#1f3ba2', '#2f63e7', '#6bd7ff', '#ffe679', '#ff991e', '#ff4c00'],
  colorBack: '#000000',
  contour: 0.5,
  innerGlow: 0.5,
  outerGlow: 0.5,
  noise: 0,
  angle: 0,
  scale: 0.68,
  speed: 1,
}
/* @motif:end */

export type HeatmapMarkProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 内置图形，画在 100×100 的格子里。 */
const SHAPES: Record<string, string> = {
  heart: 'M50 90C22 68 6 52 6 33C6 18 17 8 30 8C39 8 46 13 50 21C54 13 61 8 70 8C83 8 94 18 94 33C94 52 78 68 50 90Z',
  bolt: 'M60 3L16 57H45L38 97L84 39H54Z',
  spark: 'M50 2C54 34 66 46 98 50C66 54 54 66 50 98C46 66 34 54 2 50C34 46 46 34 50 2Z',
}
const FONT = '400 360px "Archivo Black"'

/**
 * 热力图形：一层层彩色等高线从图形内部流向边缘，外圈带一点辉光。
 * 图形在 Canvas 上现画（内置矢量图形或一段文字），裁掉四周空白，再交给 Paper 的 Heatmap。
 */
export function HeatmapMark({ className, style, children, ...props }: HeatmapMarkProps) {
  const options = { ...defaults, ...props }
  const reducedMotion = usePrefersReducedMotion()
  const text = options.text.trim() || 'HOT'
  const path = SHAPES[options.mark]

  const image = useDrawnImage(
    path ? `shape:${options.mark}` : `text:${text}`,
    (context, width, height) => {
      // Heatmap 把图片铺在白底上按亮度取形状：图形要画成黑色。
      context.fillStyle = '#000000'
      if (path) {
        const scale = Math.min(width, height) / 100
        context.translate((width - 100 * scale) / 2, (height - 100 * scale) / 2)
        context.scale(scale, scale)
        context.fill(new Path2D(path))
        return
      }
      context.font = FONT
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(text, width / 2, height / 2, width * 0.96)
    },
    path ? { width: 900, height: 900, trim: 24 } : { width: 1700, height: 560, fonts: [FONT], trim: 24 },
  )

  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={{ background: options.colorBack, ...style }}>
      {image && (
        <Heatmap
          className="absolute inset-0 -z-10"
          width="100%"
          height="100%"
          image={image}
          colors={options.colors}
          colorBack={options.colorBack}
          contour={options.contour}
          innerGlow={options.innerGlow}
          outerGlow={options.outerGlow}
          noise={options.noise}
          angle={options.angle}
          scale={options.scale}
          // 减少动态效果时停在一帧好看的静态画面上。
          speed={reducedMotion ? 0 : options.speed}
          frame={reducedMotion ? 1800 : 0}
        />
      )}
      {children}
    </div>
  )
}
