// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/button/c-button-61.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  icon: 'theme',
  variant: 'outline',
  accent: '#f43f5e',
  size: 36,
  strokeWidth: 2,
  spring: {
    visualDuration: 0.3,
    bounce: 0.25,
  },
  showCount: true,
}
/* @motif:end */

type Icon = 'theme' | 'menu' | 'sound' | 'like'

export type IconToggleMorphProps = Partial<typeof defaults> & {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  /** 点赞计数（未按下时的数字）。 */
  count?: number
  label?: string
  className?: string
  style?: CSSProperties
}

const LABELS: Record<Icon, [string, string]> = {
  theme: ['Switch to dark mode', 'Switch to light mode'],
  menu: ['Open menu', 'Close menu'],
  sound: ['Mute', 'Unmute'],
  like: ['Like', 'Unlike'],
}

/** 按强调色亮度选深色或浅色文字。 */
function inkFor(hex: string) {
  const h = hex.replace('#', '')
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3 ? '#0a0a0a' : '#ffffff'
}

const HEART = 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'
const SPEAKER = 'M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z'

/** 两个字形：[未按下, 按下]。 */
function glyphs(icon: Icon, fill: string): [ReactNode, ReactNode] {
  switch (icon) {
    case 'theme':
      return [
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </>,
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />,
      ]
    case 'menu':
      return [<path d="M4 6h16M4 12h16M4 18h16" />, <path d="M18 6 6 18M6 6l12 12" />]
    case 'sound':
      return [
        <>
          <path d={SPEAKER} />
          <path d="M16 9a5 5 0 0 1 0 6M19.4 18.4a9 9 0 0 0 0-12.8" />
        </>,
        <>
          <path d={SPEAKER} />
          <path d="m22 9-6 6M16 9l6 6" />
        </>,
      ]
    case 'like':
      return [<path d={HEART} />, <path d={HEART} fill={fill} />]
  }
}

/** 形变图标按钮：按下（aria-pressed）时两个 SVG 字形旋转、缩放互换。 */
export function IconToggleMorph({ pressed, defaultPressed = false, onPressedChange, count = 12, label, className, style, ...props }: IconToggleMorphProps) {
  const options = { ...defaults, ...props }
  const icon = options.icon as Icon
  const { variant, accent, size, strokeWidth, spring, showCount } = options
  const reduced = useReducedMotion()
  const [inner, setInner] = useState(defaultPressed)
  const on = pressed ?? inner
  const withCount = icon === 'like' && showCount
  const solid = variant === 'solid' && on
  const ink = solid ? inkFor(accent) : on && icon === 'like' ? accent : 'currentColor'
  const glyph = Math.round(size * 0.46)
  const [offGlyph, onGlyph] = glyphs(icon, solid ? ink : accent)
  // 上游：菜单图标隐藏时缩到 75%，其余缩到 0
  const hiddenScale = icon === 'menu' ? 0.75 : 0
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }

  const toggle = () => {
    const next = !on
    if (pressed === undefined) setInner(next)
    onPressedChange?.(next)
  }

  const svg = (shown: boolean, rotate: number, children: ReactNode) => (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={glyph}
      height={glyph}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="absolute inset-0"
      initial={false}
      animate={shown ? { scale: 1, rotate: 0, opacity: 1 } : { scale: hiddenScale, rotate, opacity: 0 }}
      transition={transition}
    >
      {children}
    </motion.svg>
  )

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label ?? LABELS[icon][on ? 1 : 0]}
      onClick={toggle}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-sm font-medium tabular-nums outline-none transition-[background-color,border-color,color,box-shadow] duration-200 select-none focus-visible:ring-2 focus-visible:ring-(--a) focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        variant === 'ghost' ? 'border border-transparent hover:bg-muted' : solid ? 'border border-transparent' : 'border border-border bg-background shadow-xs hover:bg-muted',
        on && !solid && icon !== 'like' && 'bg-muted',
        className,
      )}
      style={{ '--a': accent, height: size, minWidth: size, paddingInline: withCount ? Math.round(size * 0.3) : 0, backgroundColor: solid ? accent : undefined, color: solid ? ink : undefined, ...style } as CSSProperties}
    >
      <motion.span
        className="relative block shrink-0"
        style={{ width: glyph, height: glyph, color: ink }}
        animate={icon === 'like' && on && !reduced ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        {svg(!on, -90, offGlyph)}
        {svg(on, 90, onGlyph)}
      </motion.span>
      {withCount && (
        <span className="relative inline-block overflow-hidden" style={{ height: '1.25em', lineHeight: '1.25em' }}>
          <motion.span className="block" initial={false} animate={{ y: on ? '-1.25em' : '0em' }} transition={transition}>
            <span className="block">{count}</span>
            <span className="block" aria-hidden="true">
              {count + 1}
            </span>
          </motion.span>
        </span>
      )}
    </button>
  )
}
