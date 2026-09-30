// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Next.js Templates
// Source: https://github.com/NextJSTemplates/startup-nextjs/blob/e730b6a/src/components/Hero/index.tsx
// Modified by Motif; see the item's provenance.
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@motif/runtime'

/* ---------- 主题 ---------- */

export const FONT_PAIRS = {
  bricolage: { display: "'Bricolage Grotesque Variable'", body: "'Manrope Variable'", mono: "'IBM Plex Mono'", weight: 700, tracking: '-0.03em', scale: 1 },
  inter: { display: "'Inter Tight Variable'", body: "'IBM Plex Sans Variable'", mono: "'IBM Plex Mono'", weight: 700, tracking: '-0.035em', scale: 1.02 },
  outfit: { display: "'Outfit Variable'", body: "'Manrope Variable'", mono: "'IBM Plex Mono'", weight: 600, tracking: '-0.025em', scale: 1.06 },
  serif: { display: "'DM Serif Display'", body: "'IBM Plex Sans Variable'", mono: "'IBM Plex Mono'", weight: 400, tracking: '-0.015em', scale: 1.06 },
} as const
export type FontPair = keyof typeof FONT_PAIRS

function rgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** 在两个 #rrggbb 之间线性混合。 */
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
  const font = FONT_PAIRS[options.fontPair as FontPair] ?? FONT_PAIRS.bricolage
  const onAccent = luminance(options.accent) > 0.4 ? '#0b1030' : '#ffffff'
  const tokens = options.dark
    ? { background: '#0d1020', foreground: '#f1f3ff', card: '#151a30', muted: '#1a2040', mutedForeground: '#9aa3c7', border: 'rgba(160,175,255,0.14)', tint: mix('#0d1020', options.accent, 0.12) }
    : { background: '#ffffff', foreground: '#090e34', card: '#ffffff', muted: '#f2f4ff', mutedForeground: '#5b6280', border: 'rgba(9,14,52,0.1)', tint: mix('#ffffff', options.accent, 0.06) }
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
  inbox: <path d="M3 13l2.5-7.5A2 2 0 017.4 4h9.2a2 2 0 011.9 1.5L21 13v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5zM3 13h5l1 2.5h6L16 13h5" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7.5L12 13l8.5-5.5" />
    </>
  ),
  chat: <path d="M4 5h16v11H9l-5 4V5z" />,
  send: <path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z" />,
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />,
  tag: (
    <>
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <circle cx="7.5" cy="8.5" r="1.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  users: <path d="M16 20v-1.5a4 4 0 00-4-4H7a4 4 0 00-4 4V20M9.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM21 20v-1.5a4 4 0 00-3-3.9M15.5 4.2a3.5 3.5 0 010 6.6" />,
  note: <path d="M5 4h14v11l-5 5H5V4zM14 20v-5h5M8 9h8M8 13h4" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  star: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.4 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  wallet: <path d="M4 7a2 2 0 012-2h11v3M4 7v10a2 2 0 002 2h13a1 1 0 001-1V9a1 1 0 00-1-1H6a2 2 0 01-2-1zM16 13.5h.01" />,
  split: <path d="M12 20v-7M12 13L6 6M12 13l6-7M6 6H3M6 6v3M18 6h3M18 6v3" />,
  alert: <path d="M12 4l9 16H3L12 4zM12 10v4M12 17h.01" />,
  ledger: <path d="M5 4h12a2 2 0 012 2v14H7a2 2 0 01-2-2V4zM9 9h6M9 13h6M9 17h3" />,
  shield: <path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3zM9 12l2.2 2.2L15.5 10" />,
  play: <path d="M8 5.5v13l11-6.5-11-6.5z" />,
  cross: <path d="M6 6l12 12M18 6L6 18" />,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />,
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

export function BrandMark({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[21px] text-foreground', className)}>
      <svg viewBox="0 0 32 32" className="size-8" fill="none" aria-hidden>
        <rect width="32" height="32" rx="9" className="fill-primary" />
        <path d="M6 19c3 0 3-6 6-6s3 6 6 6 3-6 6-6" stroke="var(--primary-foreground)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M6 24c3 0 3-4 6-4s3 4 6 4 3-4 6-4" stroke="var(--primary-foreground)" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>{name}</span>
    </span>
  )
}

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  let hash = 0
  for (const ch of name) hash = (hash * 37 + ch.charCodeAt(0)) % 360
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-full font-semibold text-white', className)}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(140deg, oklch(0.76 0.13 ${hash}), oklch(0.55 0.15 ${(hash + 40) % 360}))` }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

export function Partners({ className }: { className?: string }) {
  const logo = 'flex items-center gap-2 text-foreground/45 transition-colors duration-200 hover:text-foreground/80'
  return (
    <div className={cn('grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-8 @2xl:grid-cols-3 @5xl:grid-cols-6', className)}>
      <span className={logo}>
        <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
          <path d="M12 3c4 0 8 3 8 7 0 5-5 6-8 11-3-5-8-6-8-11 0-4 4-7 8-7z" />
          <circle cx="12" cy="10" r="2.6" fill="var(--background)" />
        </svg>
        <span className="text-xl font-bold tracking-tight">Plumline</span>
      </span>
      <span className={logo}>
        <span className="text-2xl font-black tracking-tighter lowercase">stallion<span className="text-primary">.</span>co</span>
      </span>
      <span className={logo}>
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M4 20L12 4l8 16M7.5 14h9" />
        </svg>
        <span className="text-xl font-semibold tracking-[0.12em] uppercase">Aperta</span>
      </span>
      <span className={logo}>
        <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
          <rect x="2" y="9" width="6" height="12" rx="1.5" />
          <rect x="9" y="3" width="6" height="18" rx="1.5" opacity=".7" />
          <rect x="16" y="12" width="6" height="9" rx="1.5" opacity=".45" />
        </svg>
        <span className="text-xl font-bold tracking-tight">Bricklane</span>
      </span>
      <span className={logo}>
        <span className="text-xl font-medium italic" style={{ fontFamily: 'var(--font-display)' }}>
          Fernhill&nbsp;&amp;&nbsp;Wren
        </span>
      </span>
      <span className={logo}>
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3c-3 3-3 15 0 18M3 12h18" />
        </svg>
        <span className="text-xl font-bold tracking-tight">Orbital</span>
      </span>
    </div>
  )
}

/* ---------- 基础组件 ---------- */

export function Button({ children, variant = 'primary', size = 'md', className }: { children: ReactNode; variant?: 'primary' | 'outline' | 'dark' | 'soft'; size?: 'md' | 'lg'; className?: string }) {
  const styles = {
    primary: 'bg-primary text-primary-foreground hover:brightness-110',
    outline: 'border border-border bg-card text-foreground hover:bg-muted',
    dark: 'bg-foreground text-background hover:opacity-90',
    soft: 'bg-primary/10 text-primary hover:bg-primary/15',
  }[variant]
  return (
    <a
      href="#"
      onClick={(event) => event.preventDefault()}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-[calc(var(--radius)*0.7)] font-semibold whitespace-nowrap outline-none transition-[background-color,filter,opacity] duration-200 focus-visible:ring-2 focus-visible:ring-primary/60',
        size === 'lg' ? 'h-[52px] px-8 text-base' : 'h-10 px-5 text-[15px]',
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
      ? '[font-size:clamp(2.2rem,calc(4.6cqw*var(--hs)),4.2rem)] leading-[1.06]'
      : level === 2
        ? '[font-size:clamp(1.8rem,calc(3.6cqw*var(--hs)),3rem)] leading-[1.08]'
        : 'text-xl leading-snug'
  return (
    <Tag className={cn('text-balance text-foreground', size, className)} style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>
      {children}
    </Tag>
  )
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold text-primary">{children}</p>
}
