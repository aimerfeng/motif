// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Bohdan (https://bohd4n.dev/)
// Source: https://github.com/bohd4nx/app-landing/blob/8bd0798/src/components/AppHero/index.tsx
// Modified by Motif; see the item's provenance.
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'

/* ---------- 主题 ---------- */

export const FONT_PAIRS = {
  archivo: { display: "'Archivo Black'", body: "'Inter Tight Variable'", mono: "'JetBrains Mono Variable'", weight: 400, tracking: '-0.02em', scale: 0.96, upper: false },
  grotesk: { display: "'Space Grotesk Variable'", body: "'IBM Plex Sans Variable'", mono: "'JetBrains Mono Variable'", weight: 700, tracking: '-0.04em', scale: 1, upper: false },
  bricolage: { display: "'Bricolage Grotesque Variable'", body: "'Manrope Variable'", mono: "'JetBrains Mono Variable'", weight: 800, tracking: '-0.035em', scale: 1.02, upper: false },
  syne: { display: "'Syne Variable'", body: "'Geist Variable'", mono: "'Geist Mono Variable'", weight: 700, tracking: '-0.03em', scale: 0.98, upper: false },
} as const
export type FontPair = keyof typeof FONT_PAIRS

function rgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = rgb(a)
  const [br, bg, bb] = rgb(b)
  const to = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0')
  return `#${to(ar, br)}${to(ag, bg)}${to(ab, bb)}`
}

function luminance(hex: string) {
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = rgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function themeStyle(options: { accent: string; radius: number; dark: boolean; fontPair: string }): CSSProperties {
  const font = FONT_PAIRS[options.fontPair as FontPair] ?? FONT_PAIRS.archivo
  const onAccent = luminance(options.accent) > 0.4 ? '#15100c' : '#ffffff'
  const tokens = options.dark
    ? { background: '#0c0b0a', foreground: '#f7f3ee', card: '#161412', muted: '#1e1b18', mutedForeground: '#a39b92', border: 'rgba(255,240,225,0.1)', tint: mix('#0c0b0a', options.accent, 0.1) }
    : { background: '#faf7f2', foreground: '#171310', card: '#ffffff', muted: '#f1ece4', mutedForeground: '#6a6158', border: 'rgba(23,19,16,0.11)', tint: mix('#faf7f2', options.accent, 0.08) }
  return {
    '--background': tokens.background,
    '--foreground': tokens.foreground,
    '--card': tokens.card,
    '--muted': tokens.muted,
    '--muted-foreground': tokens.mutedForeground,
    '--border': tokens.border,
    '--color-border': tokens.border,
    '--tint': tokens.tint,
    '--primary': options.accent,
    '--primary-foreground': onAccent,
    '--radius': `${options.radius}px`,
    '--font-display': font.display,
    '--font-mono': font.mono,
    '--display-weight': font.weight,
    '--display-tracking': font.tracking,
    '--hs': font.scale,
    fontFamily: font.body,
    background: tokens.background,
    color: tokens.foreground,
    colorScheme: options.dark ? 'dark' : 'light',
  } as CSSProperties
}

/* ---------- 图标 ---------- */

const ICONS: Record<string, ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  star: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.4 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z" />,
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="3" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0112 7.8 4.2 4.2 0 0119.5 10c0 5.4-7.5 10-7.5 10z" />,
  pin: (
    <>
      <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 10-13 0c0 5.4 6.5 11 6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  watch: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="3" />
      <path d="M9 7l.7-3.5h4.6L15 7M9 17l.7 3.5h4.6L15 17M12 10v2l1.2 1" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" />
    </>
  ),
  flame: <path d="M12 3c1 3.5 5 5.5 5 10.2A5 5 0 0112 18a5 5 0 01-5-4.8c0-2 1-3 2-4 .3 1.4 1 2 1.8 2.3C10.5 8.5 11 5.5 12 3z" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  moon: <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />,
  shield: <path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3zM9 12l2.2 2.2L15.5 10" />,
  cross: <path d="M6 6l12 12M18 6L6 18" />,
  home: <path d="M4 11l8-7 8 7v9H4v-9zM10 20v-5h4v5" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c.7-3.6 3.4-5.5 7-5.5s6.3 1.9 7 5.5" />
    </>
  ),
  pause: <path d="M8 5v14M16 5v14" />,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const filled = name === 'star'
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.7} strokeLinecap="round" strokeLinejoin="round" className={cn('size-5 shrink-0', className)} aria-hidden>
      {ICONS[name]}
    </svg>
  )
}

/* ---------- 品牌 ---------- */

export function AppIcon({ className }: { className?: string }) {
  return (
    <span className={cn('relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[27%] bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_8px_20px_-8px_var(--primary)]', className)} aria-hidden>
      <svg viewBox="0 0 40 40" className="size-[62%]" fill="none" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 28c3-9 6-14 9-14s2 11 6 11 6-8 9-12" />
      </svg>
    </span>
  )
}

export function BrandMark({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-[19px] text-foreground', className)}>
      <AppIcon className="size-8" />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>{name}</span>
    </span>
  )
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  let hash = 0
  for (const ch of name) hash = (hash * 41 + ch.charCodeAt(0)) % 360
  const initials = name
    .replace('@', '')
    .split(/[\s._]+/)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('')
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(140deg, oklch(0.74 0.14 ${hash}), oklch(0.5 0.16 ${(hash + 45) % 360}))` }} aria-hidden>
      {initials}
    </span>
  )
}

export function Stars({ value = 5, className }: { value?: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5 text-amber-400', className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="star" className={cn('size-4', i >= value && 'opacity-25')} />
      ))}
    </span>
  )
}

/* ---------- 基础组件 ---------- */

export function Button({ children, variant = 'primary', size = 'md', className }: { children: ReactNode; variant?: 'primary' | 'outline' | 'ghost'; size?: 'md' | 'lg'; className?: string }) {
  const styles = {
    primary: 'bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_12px_28px_-12px_var(--primary)] hover:brightness-110',
    outline: 'border border-border bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08]',
    ghost: 'text-muted-foreground hover:text-foreground',
  }[variant]
  return (
    <a
      href="#"
      onClick={(event) => event.preventDefault()}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap outline-none transition-[background-color,color,filter,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-primary/60',
        size === 'lg' ? 'h-[52px] px-7 text-[15px]' : 'h-10 px-5 text-sm',
        styles,
        className,
      )}
    >
      {children}
    </a>
  )
}

export function Heading({ children, level = 2, className }: { children: ReactNode; level?: 1 | 2 | 3; className?: string }) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  const size =
    level === 1
      ? '[font-size:clamp(2.4rem,calc(4.6cqw*var(--hs)),4.4rem)] leading-[1.02]'
      : level === 2
        ? '[font-size:clamp(1.75rem,calc(3.2cqw*var(--hs)),2.9rem)] leading-[1.08]'
        : 'text-xl leading-snug'
  return (
    <Tag className={cn('text-balance text-foreground', size, className)} style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>
      {children}
    </Tag>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-primary uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
      <span className="h-px w-6 bg-primary" />
      {children}
    </span>
  )
}
