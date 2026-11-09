// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/ui/Headline.astro
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/ui/WidgetWrapper.astro
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/assets/styles/tailwind.css
// Modified by Motif; see the item's provenance.
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'

/* ---------- 主题 ---------- */

const SANS = ', ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
const SERIF = ', ui-serif, Georgia, "Songti SC", serif'
const MONO = ', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

// 上游只用 Inter；字体清单里没有 Inter，默认用最接近的 Inter Tight。
export const FONT_PAIRS = {
  inter: { heading: `'Inter Tight Variable'${SANS}`, body: `'Inter Tight Variable'${SANS}`, weight: 700, tracking: '-0.05em' },
  grotesk: { heading: `'Space Grotesk Variable'${SANS}`, body: `'Geist Variable'${SANS}`, weight: 700, tracking: '-0.04em' },
  serif: { heading: `'Instrument Serif'${SERIF}`, body: `'Geist Variable'${SANS}`, weight: 400, tracking: '-0.02em' },
  mono: { heading: `'JetBrains Mono Variable'${MONO}`, body: `'Geist Variable'${SANS}`, weight: 700, tracking: '-0.06em' },
} as const

function rgb(hex: string): [number, number, number] {
  const clean = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#0161ef'
  const n = Number.parseInt(clean.slice(1, 7), 16)
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

/** 把强调色往黑或白推，直到它在背景上作为文字也读得清（≥ 4.5:1）。 */
function readable(color: string, background: string) {
  const toward = luminance(background) > 0.4 ? '#000000' : '#ffffff'
  for (let t = 0; t <= 1; t += 0.05) {
    const candidate = mix(color, toward, t)
    if (contrast(candidate, background) >= 4.5) return candidate
  }
  return toward
}

/** 强调色作底色时用的文字色：按亮度选白或近黑。 */
function inkOn(color: string) {
  return luminance(color) > 0.36 ? '#0a0a0b' : '#ffffff'
}

export function themeStyle(options: { accent: string; secondaryAccent: string; dark: boolean; fontPairing: string }): CSSProperties {
  const font = FONT_PAIRS[options.fontPairing as keyof typeof FONT_PAIRS] ?? FONT_PAIRS.inter
  // 上游 CustomStyles.astro 的亮色 / 暗色取值。
  const t = options.dark
    ? { page: '#08090a', heading: '#f7f8f8', text: '#e5ecf6', muted: 'rgb(229 236 246 / 66%)', card: '#0f172a', border: '#334155', soft: '#1e293b' }
    : { page: '#ffffff', heading: '#000000', text: '#101010', muted: 'rgb(16 16 16 / 66%)', card: '#ffffff', border: '#e5e7eb', soft: '#f3f4f6' }
  const primaryText = readable(options.accent, t.page)
  return {
    '--background': t.page,
    '--foreground': t.heading,
    '--text': t.text,
    '--muted-foreground': t.muted,
    '--card': t.card,
    '--soft': t.soft,
    '--border': t.border,
    '--color-border': t.border,
    '--primary': options.accent,
    '--primary-hover': mix(options.accent, options.dark ? '#ffffff' : '#000000', 0.14),
    '--primary-foreground': inkOn(options.accent),
    '--primary-text': primaryText,
    '--tagline': options.dark ? readable(mix(options.accent, '#ffffff', 0.55), t.page) : readable(mix(options.accent, '#000000', 0.15), t.page),
    '--accent2': options.secondaryAccent,
    '--accent2-foreground': inkOn(options.secondaryAccent),
    '--accent2-text': readable(options.secondaryAccent, t.page),
    '--font-heading': font.heading,
    '--heading-weight': font.weight,
    '--heading-tracking': font.tracking,
    fontFamily: font.body,
    background: t.page,
    color: t.text,
    colorScheme: options.dark ? 'dark' : 'light',
  } as CSSProperties
}

export const headingStyle: CSSProperties = { fontFamily: 'var(--font-heading)', fontWeight: 'var(--heading-weight)', letterSpacing: 'var(--heading-tracking)' }

/* ---------- 图标（替代 astro-icon / tabler） ---------- */

const ICONS: Record<string, ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12l5 5L20 7" />,
  calendar: <path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7zM16 3v4M8 3v4M4 11h16" />,
  pin: <path d="M9 11a3 3 0 106 0 3 3 0 00-6 0zM17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
  mic: <path d="M9 5a3 3 0 016 0v5a3 3 0 01-6 0V5zM5 10a7 7 0 0014 0M8 21h8M12 17v4" />,
  pen: <path d="M20 17v-12c0-1.121-.879-2-2-2s-2 .879-2 2v12l2 2l2-2zM16 7h4M18 19h-13a2 2 0 110-4h4a2 2 0 100-4h-3" />,
  code: <path d="M7 8l-4 4 4 4M17 8l4 4-4 4M14 4l-4 16" />,
  tool: <path d="M7 10h3V7L6.5 3.5a6 6 0 018 8l6 6a2 2 0 01-3 3l-6-6a6 6 0 01-8-8L7 10" />,
  coffee: <path d="M3 14c.83.642 2.077 1.017 3.5 1 1.423.017 2.67-.358 3.5-1 .83-.642 2.077-1.017 3.5-1 1.423-.017 2.67.358 3.5 1M8 3a2.4 2.4 0 00-1 2 2.4 2.4 0 001 2M12 3a2.4 2.4 0 00-1 2 2.4 2.4 0 001 2M3 10h14v5a6 6 0 01-6 6H9a6 6 0 01-6-6v-5zM16.746 16.726a3 3 0 10.252-5.555" />,
  dots: <path d="M4 12a1 1 0 102 0 1 1 0 10-2 0M11 12a1 1 0 102 0 1 1 0 10-2 0M18 12a1 1 0 102 0 1 1 0 10-2 0" />,
  users: <path d="M5 7a4 4 0 108 0 4 4 0 10-8 0M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85" />,
  globe: <path d="M3 12a9 9 0 1018 0 9 9 0 10-18 0M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 000 18M12.5 3a17 17 0 010 18" />,
  at: <path d="M8 12a4 4 0 108 0 4 4 0 10-8 0M16 12v1.5a2.5 2.5 0 005 0V12a9 9 0 10-5.5 8.28" />,
  train: <path d="M5 13a7 7 0 0114 0v3a3 3 0 01-3 3H8a3 3 0 01-3-3v-3zM5 13h14M9 21l-1.5 0M15 21l1.5 0M8 16h.01M16 16h.01M9 6l3-3 3 3" />,
  access: <path d="M10 5a2 2 0 104 0 2 2 0 10-4 0M8 21l4-9 4 9M6 9l6 1 6-1" />,
  ticket: <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2" />,
  menu: <path d="M4 8h16M4 16h16" />,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cn('h-5 w-5 shrink-0', className)} aria-hidden>
      {ICONS[name]}
    </svg>
  )
}

/* ---------- 上游 ui/ 组件 ---------- */

/** WidgetWrapper.astro：一节的外框和统一的上下留白。 */
export function WidgetWrapper({ id, containerClass, bg, children, className }: { id?: string; containerClass?: string; bg?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn('not-prose relative isolate scroll-mt-[72px]', className)}>
      <div className="pointer-events-none absolute inset-0 -z-[1]" aria-hidden="true">
        {bg}
      </div>
      <div className={cn('relative mx-auto max-w-7xl px-4 py-12 text-(--text) md:px-6 md:py-16 lg:py-20', containerClass)}>{children}</div>
    </section>
  )
}

/** Headline.astro：居中的眉题、标题和副标题。 */
export function Headline({ title, subtitle, tagline, as = 'h2', className, titleClass = 'text-3xl md:text-4xl', subtitleClass = 'text-xl' }: { title?: ReactNode; subtitle?: ReactNode; tagline?: ReactNode; as?: 'h1' | 'h2'; className?: string; titleClass?: string; subtitleClass?: string }) {
  const Tag = as
  return (
    <div className={cn('mb-8 max-w-3xl text-center md:mx-auto md:mb-12', className)}>
      {tagline && <p className="text-base font-bold tracking-wide text-(--tagline) uppercase">{tagline}</p>}
      {title && (
        <Tag className={cn('leading-[1.1] text-balance text-foreground', titleClass)} style={headingStyle}>
          {title}
        </Tag>
      )}
      {subtitle && <p className={cn('mt-4 text-pretty text-muted-foreground', subtitleClass)}>{subtitle}</p>}
    </div>
  )
}

/** Button.astro + tailwind.css 的 btn / btn-primary。 */
export function Button({ children, variant = 'secondary', href = '#', className }: { children: ReactNode; variant?: 'primary' | 'secondary'; href?: string; className?: string }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (href === '#') event.preventDefault()
      }}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-full border px-6 py-3.5 text-center text-base leading-snug font-medium outline-none transition-[background-color,border-color,color] duration-200 ease-in focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 focus-visible:ring-offset-background md:px-8',
        variant === 'primary'
          ? 'border-(--primary) bg-(--primary) font-semibold text-(--primary-foreground) hover:border-(--primary-hover) hover:bg-(--primary-hover)'
          : 'border-[color-mix(in_oklab,var(--text)_35%,transparent)] bg-transparent text-(--text) hover:border-[color-mix(in_oklab,var(--text)_60%,transparent)] hover:bg-(--soft)',
        className,
      )}
    >
      {children}
    </a>
  )
}

/* ---------- 生成的图案头像（替代讲者照片） ---------- */

function hashOf(text: string) {
  let hash = 2166136261
  for (const ch of text) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619)
  return hash >>> 0
}

/** 由名字决定图案和配色的圆形头像：四种几何图案，颜色取自两个强调色。 */
export function PatternAvatar({ name, accent, secondary, className }: { name: string; accent: string; secondary: string; className?: string }) {
  const hash = hashOf(name)
  const kind = hash % 4
  const flip = (hash >> 3) % 2 === 1
  const a = flip ? accent : secondary
  const b = flip ? secondary : accent
  const base = mix(a, '#0b0b10', 0.25)
  const light = mix(b, '#ffffff', 0.35)
  const rot = ((hash >> 5) % 4) * 90
  return (
    <svg viewBox="0 0 144 144" className={cn('block rounded-full', className)} aria-hidden="true">
      <rect width="144" height="144" fill={base} />
      <g transform={`rotate(${rot} 72 72)`}>
        {kind === 0 && [0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx="0" cy="144" r={150 - i * 25} fill={i % 2 ? base : light} />)}
        {kind === 1 &&
          Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 4 }, (_, c) => <path key={`${r}-${c}`} d={`M${c * 36} ${r * 36 + 36}a36 36 0 0 1 36 -36v36z`} fill={(r + c) % 2 ? light : b} transform={(r + c) % 3 === 0 ? `rotate(90 ${c * 36 + 18} ${r * 36 + 18})` : undefined} />),
          )}
        {kind === 2 && (
          <>
            <rect x="0" y="0" width="72" height="144" fill={light} />
            <circle cx="72" cy="72" r="40" fill={b} />
            <path d="M72 32a40 40 0 0 1 0 80z" fill={base} />
          </>
        )}
        {kind === 3 &&
          Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 18 - 20} y="-20" width="9" height="200" fill={i % 3 === 0 ? b : light} transform="rotate(30 72 72)" />)}
      </g>
    </svg>
  )
}
