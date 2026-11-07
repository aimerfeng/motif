// SPDX-License-Identifier: MIT
// Copyright (c) 2025 kokonutUI
// Source: https://github.com/kokonut-labs/kokonutui/blob/83eec6d/components/kokonutui/glitch-text.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Signal lost',
  mode: 'bursts',
  interval: 2.6,
  intensity: 7,
  split: 2,
  slices: true,
  color: '#f5f5f4',
  colorA: '#00d9ff',
  colorB: '#ff2e88',
}
/* @motif:end */

type GlitchTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div'

export type GlitchTextProps = Partial<typeof defaults> & {
  /** 优先于 text，可以直接写成 <GlitchText>…</GlitchText>。 */
  children?: ReactNode
  /** 渲染成哪个标签。 */
  as?: GlitchTag
  className?: string
  style?: CSSProperties
}

/**
 * 三层同一份文字叠在一个网格单元里：两层色彩通道在下、正文在上。平时两层通道左右各错开一点（色差），
 * 每隔一段时间来一阵短促的跳动和横向切片；constant 模式则像上游那样持续抖动。
 * 动画全部在样式表里，用 CSS 变量调幅度和节奏；位移按 em 计，跟着字号缩放。
 */
export function GlitchText({ children, as: Tag = 'span', className, style, ...props }: GlitchTextProps) {
  const { text, mode, interval, intensity, split, slices, color, colorA, colorB } = { ...defaults, ...props }
  const content = children ?? text
  const vars = {
    '--mgt-cycle': `${Math.max(interval, 0.2)}s`,
    '--mgt-shift': `${intensity / 100}em`,
    '--mgt-split': `${split / 100}em`,
    '--mgt-skew': intensity * 0.6,
    '--mgt-color': color,
    '--mgt-a': colorA,
    '--mgt-b': colorB,
  } as CSSProperties

  return (
    <Tag className={cn('mgt-root', className)} data-mode={mode} data-slices={slices ? 'on' : 'off'} style={{ ...vars, ...style }}>
      <span className="mgt-layer mgt-a" aria-hidden>
        {content}
      </span>
      <span className="mgt-layer mgt-b" aria-hidden>
        {content}
      </span>
      <span className="mgt-layer mgt-base">{content}</span>
    </Tag>
  )
}
