// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/button/ripple-button.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@/lib/motif-runtime'
import { useCallback, useRef, type ComponentProps, type MouseEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  label: 'Subscribe to the letter',
  fill: '#cbfe7e',
  inkColor: '#000000',
  size: 'md',
  radius: 999,
  duration: 0.25,
}
/* @motif:end */

export type ButtonInkFillProps = Partial<typeof defaults> & Omit<ComponentProps<'button'>, keyof typeof defaults>

const SIZES: Record<string, string> = {
  sm: 'px-5 py-3 text-sm',
  md: 'p-[1.3rem] text-[1.2rem]',
  lg: 'px-8 py-6 text-[1.45rem]',
}

const LIGHT_INK = '#ffffff'
const DARK_INK = '#0e352e'

/** 底色上的文字颜色：白字和深色字里对比度（WCAG）更高的那个。 */
function inkFor(hex: string): string {
  const match = /^#?([0-9a-f]{6})/i.exec(hex)
  if (!match) return LIGHT_INK
  const value = Number.parseInt(match[1]!, 16)
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  // #0e352e 的相对亮度约 0.028。
  return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.078 ? LIGHT_INK : DARK_INK
}

/** 按钮当前尺寸下墨水圆的直径和左上角位置（以指针为圆心）。 */
function place(button: HTMLButtonElement, event: MouseEvent<HTMLButtonElement>) {
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2
  return { size, x, y }
}

export function ButtonInkFill({ children, className, style, ...props }: ButtonInkFillProps) {
  const { fill, inkColor, duration, radius, size, label, ...rest } = { ...defaults, ...props }
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleRef = useRef<HTMLSpanElement>(null)
  const isHoveredRef = useRef(false)

  const createRipple = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (isHoveredRef.current || !buttonRef.current || !rippleRef.current) return
    isHoveredRef.current = true

    const button = buttonRef.current
    const ripple = rippleRef.current
    const { size, x, y } = place(button, event)

    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    ripple.classList.remove('ripple-leave')
    ripple.classList.add('ripple-enter')
    button.setAttribute('data-inked', '')
  }, [])

  const removeRipple = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (event.target !== event.currentTarget) return
    if (!buttonRef.current || !rippleRef.current) return
    isHoveredRef.current = false

    const button = buttonRef.current
    const ripple = rippleRef.current
    const { x, y } = place(button, event)

    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    ripple.classList.remove('ripple-enter')
    ripple.classList.add('ripple-leave')
    button.removeAttribute('data-inked')

    const handleAnimationEnd = () => {
      ripple.classList.remove('ripple-leave')
      ripple.removeEventListener('animationend', handleAnimationEnd)
    }

    ripple.addEventListener('animationend', handleAnimationEnd)
  }, [])

  const handleMouseMove = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || !rippleRef.current || !isHoveredRef.current) return

    const ripple = rippleRef.current
    const { x, y } = place(buttonRef.current, event)

    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
  }, [])

  return (
    <button
      type="button"
      ref={buttonRef}
      className={cn(
        'bif relative flex cursor-pointer items-center justify-center overflow-hidden font-medium',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        SIZES[size] ?? SIZES.md,
        className,
      )}
      style={cssVars(
        {
          '--bif-ink': inkColor,
          '--bif-text': inkFor(fill),
          '--bif-hover-text': inkFor(inkColor),
          '--bif-duration': `${duration}s`,
        },
        { backgroundColor: fill, borderRadius: radius, ...style },
      )}
      onMouseEnter={(e) => {
        if (e.target === e.currentTarget) {
          createRipple(e)
        }
      }}
      onMouseLeave={(e) => {
        if (e.target === e.currentTarget) {
          removeRipple(e)
        }
      }}
      onMouseMove={handleMouseMove}
      {...rest}
    >
      <span className="relative z-[2]">{children ?? label}</span>
      <span ref={rippleRef} aria-hidden className="ripple" />
    </button>
  )
}
