// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/aurora-text.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'northern lights',
  colors: ['#7cf0bd', '#2fd4c8', '#3b9cf0', '#9b7bf0'],
  speed: 1,
  angle: 120,
  stretch: 200,
  glow: 0.35,
}
/* @motif:end */

export type AuroraTextProps = Partial<typeof defaults> & {
  /** 优先于 text，可以直接写成 <AuroraText>…</AuroraText>。 */
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * 渐变裁剪成文字，背景位置沿一条椭圆缓慢绕行；glow 大于 0 时，背后再叠一层模糊的同款渐变。
 * 两层放在同一个网格单元里，换行和渐变都逐像素对齐。字号、字重、颜色以外的排版跟随父元素。
 */
export function AuroraText({ children, className, style, ...props }: AuroraTextProps) {
  const { text, colors, speed, angle, stretch, glow } = { ...defaults, ...props }
  const content = children ?? text
  const first = colors[0] ?? '#ffffff'
  // 末尾补回第一个颜色：渐变首尾相接，背景绕回起点时不会出现色带跳变。
  const stops = colors.length > 1 ? [...colors, first] : [first, first]
  const vars = {
    '--mat-gradient': `linear-gradient(${angle}deg, ${stops.join(', ')})`,
    '--mat-size': `${stretch}%`,
    '--mat-duration': `${8 / Math.max(speed, 0.05)}s`,
    '--mat-glow': glow,
  } as CSSProperties

  return (
    <span className={cn('mat-root', className)} style={{ ...vars, ...style }}>
      <span className="sr-only">{content}</span>
      {glow > 0 && (
        <span className="mat-layer mat-glow" aria-hidden>
          {content}
        </span>
      )}
      <span className="mat-layer" aria-hidden>
        {content}
      </span>
    </span>
  )
}
