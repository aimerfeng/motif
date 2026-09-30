// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Mikolaj Dobrucki
// Source: https://github.com/launch-ui/launch-ui/blob/b0d4d5b/components/sections/hero/default.tsx
// Modified by Motif; see the item's provenance.
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@motif/runtime'

/* ---------- 主题：把品牌参数变成 CSS 变量，覆盖沙箱里的默认主题 ---------- */

export const FONT_PAIRS = {
  geist: { display: "'Geist Variable'", body: "'Geist Variable'", mono: "'Geist Mono Variable'", weight: 600, tracking: '-0.04em', scale: 1 },
  grotesk: { display: "'Space Grotesk Variable'", body: "'Inter Tight Variable'", mono: "'JetBrains Mono Variable'", weight: 600, tracking: '-0.035em', scale: 1 },
  editorial: { display: "'Instrument Serif'", body: "'Geist Variable'", mono: "'Geist Mono Variable'", weight: 400, tracking: '-0.02em', scale: 1.18 },
  jakarta: { display: "'Plus Jakarta Sans Variable'", body: "'Plus Jakarta Sans Variable'", mono: "'IBM Plex Mono'", weight: 700, tracking: '-0.035em', scale: 0.96 },
} as const
export type FontPair = keyof typeof FONT_PAIRS

function luminance(hex: string) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

export function themeStyle(options: { accent: string; radius: number; dark: boolean; fontPair: string }): CSSProperties {
  const font = FONT_PAIRS[options.fontPair as FontPair] ?? FONT_PAIRS.geist
  const onAccent = luminance(options.accent) > 0.42 ? '#0c0c10' : '#ffffff'
  const tokens = options.dark
    ? { background: '#09090c', foreground: '#f5f5f7', card: '#111116', muted: '#16161c', mutedForeground: '#9b9ba8', border: 'rgba(255,255,255,0.08)' }
    : { background: '#ffffff', foreground: '#0d0d12', card: '#ffffff', muted: '#f4f4f7', mutedForeground: '#5b5b69', border: 'rgba(13,13,18,0.09)' }
  return {
    '--background': tokens.background,
    '--foreground': tokens.foreground,
    '--card': tokens.card,
    '--muted': tokens.muted,
    '--muted-foreground': tokens.mutedForeground,
    '--border': tokens.border,
    '--color-border': tokens.border,
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

/* ---------- 图标（内联 SVG） ---------- */

const ICONS: Record<string, ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  pulse: <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />,
  rollback: (
    <>
      <path d="M4 9h11a5 5 0 010 10H9" />
      <path d="M8 5L4 9l4 4" />
    </>
  ),
  trace: (
    <>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="18" cy="12" r="2.2" />
      <circle cx="6" cy="18" r="2.2" />
      <path d="M8 6.6c5 .6 6 2.6 8 4.8M8 17.4c5-.6 6-2.6 8-4.8" />
    </>
  ),
  flag: <path d="M6 21V4M6 5h11l-2 4 2 4H6" />,
  route: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />,
  plug: <path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 01-12 0V8zM12 17v4" />,
  shield: <path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3zM9 12l2.2 2.2L15.5 10" />,
  star: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.4 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  bell: <path d="M6 16v-5a6 6 0 1112 0v5l1.5 2h-15L6 16zM10 21h4" />,
  layers: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </>
  ),
}

export function Icon({ name, className }: { name: keyof typeof ICONS | (string & {}); className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={name === 'star' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={name === 'star' ? 0 : 1.6} strokeLinecap="round" strokeLinejoin="round" className={cn('size-5 shrink-0', className)} aria-hidden>
      {ICONS[name]}
    </svg>
  )
}

/* ---------- 品牌标志与头像 ---------- */

export function BrandMark({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[17px] font-semibold tracking-tight', className)}>
      <span className="grid size-7 place-items-center rounded-[calc(var(--radius)*0.6)] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset,0_6px_18px_-6px_var(--primary)]">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 15c3.5 0 4.5-9 8-9s4.5 9 8 9" />
        </svg>
      </span>
      <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{name}</span>
    </span>
  )
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-medium text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, oklch(0.72 0.14 ${hash}), oklch(0.5 0.17 ${(hash + 50) % 360}))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

/** 六个虚构品牌的字标：图形 + 文字，风格各不相同。 */
export function LogoWall({ className }: { className?: string }) {
  const logo = 'flex items-center gap-2 text-foreground/55 transition-colors duration-200 hover:text-foreground/90'
  return (
    <div className={cn('grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-8 @2xl:grid-cols-3 @5xl:grid-cols-6', className)}>
      <span className={logo}>
        <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
          <path d="M12 2l9 6.5-3.4 11H6.4L3 8.5 12 2z" opacity="0.9" />
          <path d="M12 8l4 3-1.5 4.5h-5L8 11l4-3z" fill="var(--background)" />
        </svg>
        <span className="text-lg font-semibold tracking-tight">Halvorsen</span>
      </span>
      <span className={logo}>
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M4 18V9a8 8 0 0116 0v9M9 18v-6a3 3 0 016 0v6" />
        </svg>
        <span className="text-lg font-bold lowercase tracking-tighter">brightloom</span>
      </span>
      <span className={logo}>
        <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
          <rect x="3" y="3" width="8" height="8" rx="2" />
          <rect x="13" y="3" width="8" height="8" rx="4" />
          <rect x="3" y="13" width="8" height="8" rx="4" />
          <rect x="13" y="13" width="8" height="8" rx="2" />
        </svg>
        <span className="text-lg font-medium tracking-[0.18em] uppercase">Tessera</span>
      </span>
      <span className={logo}>
        <span className="text-xl font-black italic tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
          Corvid<span className="text-primary">.</span>
        </span>
      </span>
      <span className={logo}>
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M7 15l5-8 5 8" strokeLinejoin="round" />
        </svg>
        <span className="text-lg font-semibold tracking-tight">Marlowe&amp;Finch</span>
      </span>
      <span className={logo}>
        <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
          <path d="M3 12a9 9 0 0118 0h-4.5a4.5 4.5 0 00-9 0H3zM3 15h4.5a4.5 4.5 0 009 0H21a9 9 0 01-18 0z" />
        </svg>
        <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>
          oddkin
        </span>
      </span>
    </div>
  )
}

/* ---------- 基础组件 ---------- */

type ButtonProps = { children: ReactNode; variant?: 'primary' | 'ghost' | 'outline'; size?: 'md' | 'lg'; className?: string; href?: string }

export function Button({ children, variant = 'primary', size = 'md', className, href = '#' }: ButtonProps) {
  const styles = {
    primary:
      'bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_8px_24px_-10px_var(--primary)] hover:brightness-110',
    ghost: 'text-muted-foreground hover:text-foreground',
    outline: 'border border-border bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08]',
  }[variant]
  return (
    <a
      href={href}
      onClick={(event) => event.preventDefault()}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap outline-none transition-[background-color,color,filter,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-primary/60',
        size === 'lg' ? 'h-11 px-5 text-[15px]' : 'h-9 px-3.5 text-sm',
        styles,
        className,
      )}
    >
      {children}
    </a>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3 py-1 text-xs font-medium text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
      <span className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
      {children}
    </span>
  )
}

export function Heading({ children, level = 2, className }: { children: ReactNode; level?: 1 | 2 | 3; className?: string }) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  const size =
    level === 1
      ? '[font-size:clamp(2.25rem,calc(5.4cqw*var(--hs)),4.7rem)] leading-[1.04]'
      : level === 2
        ? '[font-size:clamp(1.8rem,calc(3.5cqw*var(--hs)),3rem)] leading-[1.08]'
        : 'text-xl leading-snug'
  return (
    <Tag className={cn('text-balance', size, className)} style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>
      {children}
    </Tag>
  )
}
