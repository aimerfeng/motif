// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/ui/Headline.astro
// Modified by Motif; see the item's provenance.
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { cn } from '@motif/runtime'

/* ---------- 主题：上游的 --aw-color-* 映射到 Motif 的主题变量 ---------- */

export const FONT_PAIRS = {
  inter: { heading: "'Inter Tight Variable'", body: "'Manrope Variable'", weight: 700, tracking: '-0.035em' },
  jakarta: { heading: "'Plus Jakarta Sans Variable'", body: "'Plus Jakarta Sans Variable'", weight: 800, tracking: '-0.03em' },
  fraunces: { heading: "'Fraunces Variable'", body: "'IBM Plex Sans Variable'", weight: 650, tracking: '-0.02em' },
  grotesk: { heading: "'Space Grotesk Variable'", body: "'IBM Plex Sans Variable'", weight: 700, tracking: '-0.03em' },
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

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** 主色当文字用时：往黑（浅底）或白（深底）里混，直到对比度够读。任何主色都可读。 */
function readableOn(color: string, background: string, target = 4.8) {
  const toward = luminance(background) > 0.4 ? '#000000' : '#ffffff'
  for (let t = 0; t <= 1; t += 0.05) {
    const candidate = mix(color, toward, t)
    if (contrast(candidate, background) >= target) return candidate
  }
  return toward
}

export function themeStyle(options: { accent: string; radius: number; dark: boolean; fontPairing: string }): CSSProperties {
  const font = FONT_PAIRS[options.fontPairing as FontPair] ?? FONT_PAIRS.inter
  const accent = /^#[0-9a-f]{6}/i.test(options.accent) ? options.accent.slice(0, 7) : '#f59e0b'
  const onAccent = contrast(accent, '#ffffff') >= contrast(accent, '#111111') ? '#ffffff' : '#111111'
  // 上游 CustomStyles.astro：浅色白底黑字，深色 rgb(8 9 10) 底；卡片用 white / slate-900。
  const tokens = options.dark
    ? { page: '#08090a', heading: '#f7f8f8', text: '#e5ecf6', muted: 'rgba(229,236,246,0.68)', card: '#0f172a', border: '#334155', tint: mix('#08090a', accent, 0.1) }
    : { page: '#ffffff', heading: '#000000', text: '#101010', muted: 'rgba(16,16,16,0.68)', card: '#ffffff', border: '#e5e7eb', tint: mix('#ffffff', accent, 0.08) }
  // 标签、链接等主色文字要在最难读的底色（页面底和浅色调底）上都够对比度。
  const worstBg = options.dark ? mix(tokens.tint, '#ffffff', 0.04) : tokens.tint
  return {
    '--background': tokens.page,
    '--foreground': tokens.text,
    '--heading': tokens.heading,
    '--card': tokens.card,
    '--muted': tokens.tint,
    '--muted-foreground': tokens.muted,
    '--border': tokens.border,
    '--color-border': tokens.border,
    '--input': tokens.border,
    '--tint': tokens.tint,
    '--primary': accent,
    '--primary-hover': mix(accent, options.dark ? '#ffffff' : '#000000', 0.12),
    '--primary-foreground': onAccent,
    '--accent-ink': readableOn(accent, worstBg),
    '--ring': accent,
    '--radius': `${options.radius}px`,
    '--font-heading': font.heading,
    '--heading-weight': font.weight,
    '--heading-tracking': font.tracking,
    fontFamily: `${font.body}, ui-sans-serif, system-ui, sans-serif`,
    background: tokens.page,
    color: tokens.text,
    colorScheme: options.dark ? 'dark' : 'light',
  } as CSSProperties
}

export const headingStyle: CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 'var(--heading-weight)' as CSSProperties['fontWeight'],
  letterSpacing: 'var(--heading-tracking)',
  color: 'var(--heading)',
}

/* ---------- 图标：上游的 tabler 图标换成内联 SVG ---------- */

const ICONS: Record<string, ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  info: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" />,
  scan: <path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2M7 13l5-4 5 4M9 11.5V16h6v-4.5" />,
  clipboard: (
    <>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1.5" />
      <path d="M9 14l2 2 4-4" />
    </>
  ),
  stamp: (
    <>
      <path d="M21 17.9a3 3 0 00-3-2.9H6a3 3 0 00-3 2.9V19h18v-1.1zM5 21h14" />
      <path d="M9 15l1-5a3 3 0 114 0l1 5" />
    </>
  ),
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  home: <path d="M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-5h4v5" />,
  receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h3" />,
  star: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.4 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z" />,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const filled = name === 'star'
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5 shrink-0', className)}
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  )
}

/* ---------- 品牌：虚构的字标 ---------- */

export function BrandMark({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xl', className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--primary)" />
        <path d="M9 21a7 7 0 0114 0z" fill="var(--primary-foreground)" />
        <path d="M16 6.5v3M8.5 10l2 2M23.5 10l-2 2M6 24.5h20" stroke="var(--primary-foreground)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="truncate" style={headingStyle}>
        {name}
      </span>
    </span>
  )
}

export function Avatar({ name }: { name: string }) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360
  const initials = name
    .split(/\s+/)
    .filter((part) => /^[A-Z]/.test(part))
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-sm font-semibold text-white"
      style={{ background: `linear-gradient(140deg, oklch(0.62 0.13 ${hash}), oklch(0.45 0.13 ${(hash + 50) % 360}))` }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

/* ---------- 按钮：上游的 btn / btn-primary / btn-secondary ---------- */

const BTN =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[calc(var(--radius)*3)] border text-center text-base font-medium leading-snug whitespace-nowrap outline-none transition-[background-color,border-color,color] duration-200 ease-in py-3.5 px-6 @3xl:px-8 focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60'

export const buttonClass = {
  primary: cn(BTN, 'border-primary bg-primary font-semibold text-primary-foreground hover:border-[var(--primary-hover)] hover:bg-[var(--primary-hover)]'),
  secondary: cn(BTN, 'border-border bg-transparent text-foreground hover:bg-[var(--tint)]'),
}

export function Button({
  children,
  variant = 'secondary',
  className,
  href,
  onClick,
  type,
  disabled,
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
  href?: string
  onClick?: (event: MouseEvent) => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  if (type)
    return (
      <button type={type} onClick={onClick} disabled={disabled} className={cn(buttonClass[variant], className)}>
        {children}
      </button>
    )
  return (
    <a
      href={href ?? '#'}
      onClick={(event) => {
        event.preventDefault()
        onClick?.(event)
      }}
      className={cn(buttonClass[variant], className)}
    >
      {children}
    </a>
  )
}

/* ---------- Headline 与 WidgetWrapper ---------- */

export function Headline({
  tagline,
  title,
  subtitle,
  className,
  titleClass,
  subtitleClass,
  as: Tag = 'h2',
  id,
}: {
  tagline?: string
  title?: ReactNode
  subtitle?: ReactNode
  className?: string
  titleClass?: string
  subtitleClass?: string
  as?: 'h1' | 'h2'
  id?: string
}) {
  return (
    <div className={cn('mx-auto mb-8 max-w-3xl text-center @3xl:mb-12', className)}>
      {tagline && <p className="text-base font-bold tracking-wide text-[var(--accent-ink)] uppercase">{tagline}</p>}
      {title && (
        <Tag id={id} className={cn('mt-1 text-3xl leading-tight text-balance @3xl:text-4xl', titleClass)} style={headingStyle}>
          {title}
        </Tag>
      )}
      {subtitle && <p className={cn('mt-4 text-xl text-pretty text-muted-foreground', subtitleClass)}>{subtitle}</p>}
    </div>
  )
}

export function WidgetWrapper({
  id,
  children,
  className,
  containerClass,
  label,
}: {
  id?: string
  children: ReactNode
  className?: string
  containerClass?: string
  label?: string
}) {
  return (
    <section id={id} aria-labelledby={label} className={cn('relative scroll-mt-[72px]', className)}>
      <div className={cn('relative mx-auto max-w-7xl px-4 py-12 @3xl:px-6 @3xl:py-16 @5xl:py-20', containerClass)}>{children}</div>
    </section>
  )
}

/** 平滑滚到页内锚点：沙箱里不改地址栏，减少动态效果时直接跳。 */
export function scrollToId(id: string, reduced: boolean | null) {
  if (typeof document === 'undefined') return
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}
