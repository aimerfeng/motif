// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/neon-gradient-card.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  colors: ['#ff00aa', '#00fff1'],
  borderSize: 2,
  borderRadius: 20,
  glowSize: 56,
  glowOpacity: 0.8,
  duration: 3,
}
/* @motif:end */

export type NeonGradientCardProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 内容区的类名（内边距、背景等）。 */
  contentClassName?: string
  children?: ReactNode
}

/**
 * 霓虹渐变卡片：卡片外缘一圈渐变描边，背后垫一团同样渐变、大幅模糊的光；渐变在两种颜色之间上下缓缓推移。
 * 描边和光都是一条两倍高的渐变带在圆角容器里平移（transform），不用测量卡片尺寸。
 */
export function NeonGradientCard({ className, style, contentClassName, children, ...props }: NeonGradientCardProps) {
  const { colors, borderSize, borderRadius, glowSize, glowOpacity, duration } = { ...defaults, ...props }
  const stops = colors.length > 1 ? colors : [colors[0] ?? '#ff00aa', colors[0] ?? '#ff00aa']

  return (
    <div
      className={cn('relative isolate', className)}
      style={cssVars(
        {
          '--ngc-border': `${borderSize}px`,
          '--ngc-radius': `${borderRadius}px`,
          '--ngc-gradient': `linear-gradient(0deg, ${stops.join(', ')})`,
          '--ngc-speed': `${duration}s`,
          '--ngc-blur': `${glowSize}px`,
        },
        { borderRadius, ...style },
      )}
    >
      {/* 光晕：和描边同一条渐变，整体模糊。 */}
      <div aria-hidden className="ngc-layer ngc-glow" style={{ opacity: glowOpacity }}>
        <div className="ngc-strip" />
      </div>
      {/* 描边：比卡片大出 borderSize 的一圈，露在内容外面。 */}
      <div aria-hidden className="ngc-layer">
        <div className="ngc-strip" />
      </div>
      <div
        className={cn('relative size-full min-h-[inherit] bg-card p-6 break-words text-card-foreground', contentClassName)}
        style={{ borderRadius: Math.max(borderRadius - borderSize, 0) }}
      >
        {children}
      </div>
    </div>
  )
}
