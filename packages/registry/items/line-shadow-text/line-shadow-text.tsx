// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/line-shadow-text.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Long run',
  shadowColor: '#ff6a3d',
  offset: 7,
  spacing: 6,
  thickness: 22,
  direction: 'back',
  speed: 1,
}
/* @motif:end */

type LineShadowTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div'

export type LineShadowTextProps = Partial<typeof defaults> & {
  /** 优先于 text，可以直接写成 <LineShadowText>…</LineShadowText>。 */
  children?: ReactNode
  /** 渲染成哪个标签。 */
  as?: LineShadowTag
  className?: string
  style?: CSSProperties
}

/**
 * 文字后面错开一份由细斜线填充的「影子」，斜线缓缓平移。影子是 aria-hidden 的第二层，
 * 与正文放在同一个网格单元里，换行完全一致；尺寸全部用 em，跟着字号走。
 */
export function LineShadowText({ children, as: Tag = 'span', className, style, ...props }: LineShadowTextProps) {
  const { text, shadowColor, offset, spacing, thickness, direction, speed } = { ...defaults, ...props }
  const content = children ?? text
  // 45° 渐变在正方形色块里画出「\」方向的线，135° 画出「/」方向的线；色块平铺后连成整条斜线。
  const angle = direction === 'forward' ? 135 : 45
  const half = Math.min(Math.max(thickness, 4), 50) / 2
  const vars = {
    '--mls-offset': `${offset / 100}em`,
    '--mls-tile': `${spacing / 100}em`,
    '--mls-pattern': `linear-gradient(${angle}deg, transparent ${50 - half}%, ${shadowColor} ${50 - half}%, ${shadowColor} ${50 + half}%, transparent ${50 + half}%)`,
    // 每个周期正好平移一块色块，循环首尾无缝；速度为 0 时不动。
    '--mls-duration': speed > 0 ? `${1 / speed}s` : '0s',
    '--mls-play': speed > 0 ? 'running' : 'paused',
  } as CSSProperties

  return (
    <Tag className={cn('mls-root', className)} style={{ ...vars, ...style }}>
      <span className="mls-shadow" aria-hidden>
        {content}
      </span>
      <span className="mls-text">{content}</span>
    </Tag>
  )
}
