// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/button/swipe-button.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useState, type ButtonHTMLAttributes, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  label: 'Get early access',
  hoverLabel: 'Join the waitlist',
  arrow: true,
  direction: 'up',
  duration: 380,
  radius: 14,
  firstColor: '#0f3d2e',
  firstInk: '#f2efe6',
  secondColor: '#f4b942',
  secondInk: '#0f3d2e',
}
/* @motif:end */

export type SwipeButtonProps = Partial<typeof defaults> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'children'> & {
    className?: string
    style?: CSSProperties
    /** 强制处于「已扫过」的状态，用于演示或受控场景；不传则跟随悬停和键盘焦点。 */
    active?: boolean
  }

// 第二层的起点：从哪个方向滑进来。第一层往相反方向滑出。
const FROM = {
  up: 'translate3d(0, 100%, 0)',
  down: 'translate3d(0, -100%, 0)',
  left: 'translate3d(100%, 0, 0)',
  right: 'translate3d(-100%, 0, 0)',
} as const
const OUT = {
  up: 'translate3d(0, -100%, 0)',
  down: 'translate3d(0, 100%, 0)',
  left: 'translate3d(-100%, 0, 0)',
  right: 'translate3d(100%, 0, 0)',
} as const

/** 悬停时，第二层文字和颜色从一侧把第一层整块推走。键盘聚焦时同样触发。两层内容宽度取较大者，按钮不会因为换字而抖动。 */
export function SwipeButton({ className, style, active, onPointerEnter, onPointerLeave, onFocus, onBlur, ...rest }: SwipeButtonProps) {
  const { label, hoverLabel, direction, arrow, radius, duration, firstColor, firstInk, secondColor, secondInk, ...buttonProps } = { ...defaults, ...rest }
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const hot = active ?? (hovered || focused)
  const key = (direction in FROM ? direction : 'up') as keyof typeof FROM
  const transition = `transform ${duration}ms cubic-bezier(0.65, 0, 0.35, 1)`

  const face = 'flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold whitespace-nowrap'

  return (
    <button
      type="button"
      {...buttonProps}
      onPointerEnter={(event) => {
        setHovered(true)
        onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        setHovered(false)
        onPointerLeave?.(event)
      }}
      onFocus={(event) => {
        // 只有键盘聚焦才触发，鼠标点击后的焦点不应该把按钮卡在翻转状态。
        if (event.currentTarget.matches(':focus-visible')) setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      className={cn('relative inline-grid overflow-hidden outline-offset-4 select-none focus-visible:outline-2 focus-visible:outline-current motion-reduce:[&_*]:!transition-none', className)}
      style={{ borderRadius: radius, ...style }}
    >
      {/* 两层叠在同一个格子里，按钮的宽度是两句文案里更宽的那个。 */}
      <span className={cn(face, '[grid-area:1/1]')} style={{ backgroundColor: firstColor, color: firstInk, transform: hot ? OUT[key] : 'translate3d(0,0,0)', transition }}>
        {label}
      </span>
      <span className={cn(face, '[grid-area:1/1]')} aria-hidden style={{ backgroundColor: secondColor, color: secondInk, transform: hot ? 'translate3d(0,0,0)' : FROM[key], transition }}>
        {hoverLabel}
        {arrow && <Arrow />}
      </span>
      {/* 第一层的文案才是读屏器看到的名称；第二层只是视觉装饰。 */}
    </button>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  )
}
