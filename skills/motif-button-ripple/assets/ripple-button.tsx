// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/ripple-button.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@/lib/motif-runtime'
import { useRef, useState, type ComponentProps, type MouseEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  label: 'Confirm transfer',
  rippleColor: '#add8e6',
  rippleDuration: 600,
  rippleOpacity: 0.35,
  idlePulse: true,
  variant: 'pulse',
  pulseColor: '#add8e680',
  pulseDistance: 8,
  pulseDuration: 1.5,
  radius: 8,
}
/* @motif:end */

export type RippleButtonProps = Partial<typeof defaults> & Omit<ComponentProps<'button'>, keyof typeof defaults>

type Ripple = { x: number; y: number; size: number; key: number }

/**
 * 点击时从按下的位置扩散出一圈涟漪的按钮（magicui RippleButton），
 * 可选 PulsatingButton 的待机光环：呼吸（pulse）或向外扩散（ripple）。
 */
export function RippleButton({ className, style, children, onClick, type = 'button', ...props }: RippleButtonProps) {
  const { label, rippleColor, rippleDuration, rippleOpacity, idlePulse, variant, pulseColor, pulseDistance, pulseDuration, radius, ...rest } = {
    ...defaults,
    ...props,
  }
  const [buttonRipples, setButtonRipples] = useState<Ripple[]>([])
  const nextKey = useRef(0)

  const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    // 键盘触发的 click 没有坐标：从按钮中心扩散。
    const fromKeyboard = event.detail === 0 && event.clientX === 0 && event.clientY === 0
    const cx = fromKeyboard ? rect.width / 2 : event.clientX - rect.left
    const cy = fromKeyboard ? rect.height / 2 : event.clientY - rect.top
    const newRipple = { x: cx - size / 2, y: cy - size / 2, size, key: nextKey.current++ }
    setButtonRipples((prevRipples) => [...prevRipples, newRipple])
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    createRipple(event)
    onClick?.(event)
  }

  return (
    <button
      type={type}
      {...rest}
      className={cn(
        'relative flex cursor-pointer items-center justify-center rounded-lg border-2 bg-background px-4 py-2 text-center text-primary',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      style={cssVars(
        {
          '--mrb-duration': `${rippleDuration}ms`,
          '--mrb-opacity': String(rippleOpacity),
          '--mrb-pulse-color': pulseColor,
          '--mrb-distance': `${pulseDistance}px`,
          '--mrb-pulse-duration': `${pulseDuration}s`,
        },
        { borderRadius: radius, ...style },
      )}
      onClick={handleClick}
    >
      {idlePulse ? (
        <span
          aria-hidden="true"
          className={cn('pointer-events-none absolute -inset-0.5 rounded-[inherit]', variant === 'pulse' ? 'mrb-pulse' : 'mrb-pulse-ripple')}
        />
      ) : null}
      <span className="relative z-10">{children ?? label}</span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        {buttonRipples.map((ripple) => (
          <span
            className="mrb-ripple absolute rounded-full"
            key={ripple.key}
            style={{
              width: `${ripple.size}px`,
              height: `${ripple.size}px`,
              top: `${ripple.y}px`,
              left: `${ripple.x}px`,
              backgroundColor: rippleColor,
              opacity: 0,
              transform: 'scale(0)',
            }}
            onAnimationEnd={() => setButtonRipples((prevRipples) => prevRipples.filter((r) => r.key !== ripple.key))}
          />
        ))}
      </span>
    </button>
  )
}
