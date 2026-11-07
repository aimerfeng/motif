// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/shimmer-button.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@/lib/motif-runtime'
import type { ComponentProps } from 'react'

/* @motif:defaults */
export const defaults = {
  label: 'Get early access',
  shimmerColor: '#ffffff',
  background: '#0e0e14',
  radius: 100,
  shimmerSize: 1.8,
  spread: 110,
  duration: 3,
}
/* @motif:end */

export type ShimmerButtonProps = Partial<typeof defaults> & Omit<ComponentProps<'button'>, keyof typeof defaults>

/** 底色上用深色字吗：比较白字和深色字（#0b0b10，相对亮度约 0.0035）的 WCAG 对比度。 */
function prefersDarkInk(hex: string): boolean {
  const match = /^#?([0-9a-f]{6})/i.exec(hex)
  if (!match) return false
  const value = Number.parseInt(match[1]!, 16)
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return (luminance + 0.05) / 0.0535 > 1.05 / (luminance + 0.05)
}

/**
 * 边缘有一缕光绕行的按钮。光是一块旋转的锥形渐变，装在一个沿按钮来回滑动的方块里；
 * 背板只比按钮内缩 shimmerSize，所以光只从边缘那一圈透出来。
 */
export function ShimmerButton({ className, style, children, type = 'button', ...props }: ShimmerButtonProps) {
  const { label, shimmerColor, background, radius, shimmerSize, spread, duration, ...rest } = { ...defaults, ...props }
  const light = prefersDarkInk(background)

  return (
    <button
      type={type}
      {...rest}
      className={cn(
        'group relative z-0 inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden border px-6 py-3 text-sm font-medium tracking-tight whitespace-nowrap',
        'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      style={cssVars(
        {
          '--msb-spread': `${spread}deg`,
          '--msb-color': shimmerColor,
          '--msb-speed': `${duration}s`,
          '--msb-cut': `${shimmerSize}px`,
          '--msb-bg': background,
        },
        {
          borderRadius: radius,
          background,
          color: light ? '#0b0b10' : '#ffffff',
          borderColor: light ? 'rgb(0 0 0 / 0.08)' : 'rgb(255 255 255 / 0.1)',
          ...style,
        },
      )}
    >
      {/* 光：容器按按钮尺寸建立 size 容器，光块的滑动距离用 cqw 计算。 */}
      <span aria-hidden className="msb-sparks pointer-events-none absolute inset-0 -z-30 blur-[2px]">
        <span className="msb-spark absolute inset-y-0 left-0 aspect-square h-full">
          <span className="msb-cone absolute -inset-full" />
        </span>
      </span>

      <span className="relative">{children ?? label}</span>

      {/* 底部内发光：悬停时收拢变亮，按下时加深。 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_-8px_10px_#ffffff1f] transition-shadow duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
      />

      {/* 背板盖住光的中间部分，只留边缘一圈。 */}
      <span
        aria-hidden
        className="pointer-events-none absolute -z-20"
        style={{ inset: 'var(--msb-cut)', borderRadius: `max(${radius - shimmerSize}px, 0px)`, background: 'var(--msb-bg)' }}
      />

      {/* 同一束光再画一份、大幅模糊后淡淡地叠在背板上：光走到哪，按钮内侧就被映亮一点。 */}
      <span aria-hidden className="msb-sparks pointer-events-none absolute inset-0 -z-10 opacity-25 blur-[10px]">
        <span className="msb-spark absolute inset-y-0 left-0 aspect-square h-full">
          <span className="msb-cone absolute -inset-full" />
        </span>
      </span>
    </button>
  )
}
