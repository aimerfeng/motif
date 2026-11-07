// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/rainbow-button.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@motif/runtime'
import type { ComponentProps } from 'react'

/* @motif:defaults */
export const defaults = {
  label: 'Upgrade to Pro',
  colors: ['#ff4242', '#a0ff42', '#40a1ff', '#43d0ff', '#a142fe'],
  fill: '#ffffff',
  glow: 1,
  borderWidth: 2,
  radius: 12,
  size: 'lg',
  speed: 2.4,
}
/* @motif:end */

export type RainbowButtonProps = Partial<typeof defaults> & Omit<ComponentProps<'button'>, keyof typeof defaults>

const SIZES: Record<string, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-8 text-base',
}

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
 * 底边流动彩虹的按钮。彩虹画在一条四倍宽的渐变带上，用 transform 平移（不重绘）；
 * 上半部分被底色渐变盖住，只有底边和两侧下半段露出来，下方再垫一团模糊的同色光。
 */
export function RainbowButton({ className, style, children, type = 'button', ...props }: RainbowButtonProps) {
  const { label, colors, fill, glow, borderWidth, radius, size, speed, ...rest } = { ...defaults, ...props }
  // 末尾补上第一个颜色，渐变首尾相接，平铺时没有接缝。
  const stops = colors.length > 0 ? [...colors, colors[0]] : ['#ffffff', '#ffffff']
  const light = prefersDarkInk(fill)

  return (
    <button
      type={type}
      {...rest}
      className={cn(
        'group relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-medium tracking-tight whitespace-nowrap',
        'transition-transform duration-150 ease-out active:scale-[0.98]',
        'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        SIZES[size] ?? SIZES.md,
        className,
      )}
      style={cssVars(
        {
          '--mrb-rainbow': `linear-gradient(90deg, ${stops.join(', ')})`,
          '--mrb-fill': fill,
          '--mrb-speed': `${speed}s`,
        },
        { borderRadius: radius, color: light ? '#0b0b10' : '#fafafa', ...style },
      )}
    >
      {/* 彩边 + 底色：彩虹铺满整个按钮，渐变遮罩盖住上半部分，再在内缩 borderWidth 处铺满底色。 */}
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
        <span className="mrb-strip" />
        <span
          className="absolute inset-0"
          style={{ background: 'linear-gradient(var(--mrb-fill) 50%, color-mix(in srgb, var(--mrb-fill) 60%, transparent) 80%, transparent)' }}
        />
        <span className="absolute" style={{ inset: borderWidth, borderRadius: Math.max(radius - borderWidth, 0), background: 'var(--mrb-fill)' }} />
      </span>

      {/* 底部光晕：同一条彩虹，裁成按钮下方的一小条再整体模糊，会晕进按钮的下沿。 */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-[-24%] left-1/2 -z-10 h-[28%] w-3/5 -translate-x-1/2 overflow-hidden blur-[0.875rem]"
        style={{ opacity: glow }}
      >
        <span className="mrb-strip" />
      </span>

      {children ?? label}
    </button>
  )
}
