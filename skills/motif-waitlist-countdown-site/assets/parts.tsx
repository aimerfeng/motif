// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/ui/Headline.astro
// Modified by Motif; see the item's provenance.
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'

/* ---------- 主题：上游 CustomStyles.astro 的 --aw-color-* 映射到 Motif 的主题变量 ---------- */

export const FONT_PAIRS = {
  inter: { heading: "'Inter Tight Variable'", body: "'Manrope Variable'", weight: 700, tracking: '-0.035em' },
  fraunces: { heading: "'Fraunces Variable'", body: "'Manrope Variable'", weight: 600, tracking: '-0.02em' },
  bricolage: { heading: "'Bricolage Grotesque Variable'", body: "'IBM Plex Sans Variable'", weight: 700, tracking: '-0.03em' },
  serif: { heading: "'Instrument Serif'", body: "'Geist Variable'", weight: 400, tracking: '-0.01em' },
} as const
export type FontPair = keyof typeof FONT_PAIRS

export function rgb(hex: string): [number, number, number] {
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
  const accent = /^#[0-9a-f]{6}/i.test(options.accent) ? options.accent.slice(0, 7) : '#fb923c'
  // 按钮上的字：黑白里对比度更高的那个。
  const onAccent = contrast(accent, '#ffffff') >= contrast(accent, '#111111') ? '#ffffff' : '#111111'
  // 上游：浅色白底黑字，深色 rgb(8 9 10) 底；卡片 white / slate-900，边框 gray-200 / slate-700。
  const tokens = options.dark
    ? { page: '#08090a', heading: '#f7f8f8', text: '#e5ecf6', muted: 'rgba(229,236,246,0.68)', card: '#0f172a', border: '#334155', tint: mix('#08090a', accent, 0.1) }
    : { page: '#ffffff', heading: '#000000', text: '#101010', muted: 'rgba(16,16,16,0.68)', card: '#ffffff', border: '#e5e7eb', tint: mix('#ffffff', accent, 0.08) }
  // 标签、链接等主色文字要在最难读的底色（页面底、浅色调底、卡片底）上都够对比度。
  const worstBg = options.dark ? mix(tokens.tint, '#ffffff', 0.06) : tokens.tint
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
    '--primary-hover': mix(accent, options.dark ? '#ffffff' : '#000000', 0.14),
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
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  dot: <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />,
  dots: <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth="3" />,
  info: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  sun: (
    <>
      <path d="M8 15a4 4 0 018 0" />
      <path d="M3 15h2M19 15h2M5.6 8.6l1.4 1.4M18.4 8.6L17 10M12 5v2M4 19h16" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M4 11h16M8 15h2v2H8z" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7M7.5 8a2.5 2.5 0 010-5C9.5 3 12 8 12 8s2.5-5 4.5-5a2.5 2.5 0 010 5" />
    </>
  ),
  bulb: <path d="M3 12h1M12 3v1M20 12h1M5.6 5.6l.7.7M18.4 5.6l-.7.7M9 16a5 5 0 116 0 3.5 3.5 0 00-1 3 2 2 0 01-4 0 3.5 3.5 0 00-1-3M9.7 17h4.6" />,
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />,
  tool: <path d="M7 10h3V7L6.5 3.5a6 6 0 018 8l6 6a2.1 2.1 0 01-3 3l-6-6a6 6 0 01-8-8L7 10" />,
  bell: (
    <>
      <path d="M10 5a2 2 0 114 0 7 7 0 014 6v3a4 4 0 002 3H4a4 4 0 002-3v-3a7 7 0 014-6M9 17v1a3 3 0 006 0v-1" />
      <path d="M21 6.7a11 11 0 00-2-4.7M3 6.7a11 11 0 012-4.7" />
    </>
  ),
  truck: (
    <>
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M5 17H3V6a1 1 0 011-1h9v12M9 17h6M19 17h2v-6h-8M13 6h5l3 5" />
    </>
  ),
  moon: <path d="M12 3a6 6 0 009 9 9 9 0 11-9-9z" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
    </>
  ),
  link: <path d="M9 15l6-6M11 6l.5-.5a5 5 0 017 7l-.5.5M13 18l-.4.5a5 5 0 01-7-7l.4-.5" />,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5 shrink-0', className)}
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  )
}

/* ---------- 品牌：虚构的字标（地平线上的半个太阳） ---------- */

export function BrandMark({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2 text-xl', className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="9" fill="var(--primary)" />
        <path d="M9.5 20a6.5 6.5 0 0113 0z" fill="var(--primary-foreground)" />
        <path d="M7 23.5h18" stroke="var(--primary-foreground)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="truncate" style={headingStyle}>
        {name}
      </span>
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

/** 页内跳转：沙箱里不改地址栏，减少动态效果时直接跳。 */
export function scrollToId(id: string, reduced: boolean | null) {
  if (typeof document === 'undefined') return
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}

export function Button({
  children,
  variant = 'secondary',
  className,
  to,
  reduced,
  type,
  onClick,
  disabled,
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
  /** 页内锚点（不带 #）。 */
  to?: string
  reduced?: boolean | null
  type?: 'button' | 'submit'
  onClick?: () => void
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
      href={to ? `#${to}` : '#'}
      onClick={(event) => {
        event.preventDefault()
        if (to) scrollToId(to, reduced ?? null)
        onClick?.()
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
  id,
}: {
  tagline?: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  className?: string
  titleClass?: string
  subtitleClass?: string
  id?: string
}) {
  return (
    <div className={cn('mx-auto mb-8 max-w-3xl text-center @3xl:mb-12', className)}>
      {tagline && <p className="text-base font-bold tracking-wide text-[var(--accent-ink)] uppercase">{tagline}</p>}
      {title && (
        <h2 id={id} className={cn('text-3xl leading-tight text-balance @3xl:text-4xl', titleClass)} style={headingStyle}>
          {title}
        </h2>
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
