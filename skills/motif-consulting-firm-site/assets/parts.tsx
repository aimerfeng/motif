// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Emil Gulamov
// Source: https://github.com/mearashadowfax/ScrewFast/blob/aa9da9a/src/components/ui/buttons/PrimaryCTA.astro
// Modified by Motif; see the item's provenance.
import { useId, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'

// ---------------------------------------------------------------------------
// 主题：上游写死的 neutral / orange 换成可选的灰阶家族 + 一个主色
// ---------------------------------------------------------------------------

/** Tailwind 的五个灰阶家族，下标 0–10 对应 50–950。 */
const GRAYS: Record<string, string[]> = {
  slate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#020617'],
  gray: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827', '#030712'],
  zinc: ['#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a', '#18181b', '#09090b'],
  neutral: ['#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717', '#0a0a0a'],
  stone: ['#fafaf9', '#f5f5f4', '#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c', '#57534e', '#44403c', '#292524', '#1c1917', '#0c0a09'],
}

const DENSITY: Record<string, number> = { compact: 0.72, regular: 1, airy: 1.3 }

const SANS = ', ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
const SERIF = ', ui-serif, Georgia, "Times New Roman", "Songti SC", serif'

type RGB = [number, number, number]

function parseHex(hex: string): RGB | null {
  const raw = hex.trim().replace('#', '')
  const full = raw.length === 3 ? raw.replace(/./g, (c) => c + c) : raw.slice(0, 6)
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toHex = ([r, g, b]: RGB) => `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
const mixRgb = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

function luminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** 把颜色朝黑或白一点点推，直到它和底色的对比度达到 min：任何主色都能当文字或按钮用。 */
function ensureContrast(color: RGB, against: RGB, min: number, toward: RGB): RGB {
  let out = color
  for (let t = 0; t <= 1 && contrast(out, against) < min; t += 0.04) out = mixRgb(color, toward, t)
  return out
}

const WHITE: RGB = [255, 255, 255]
const BLACK: RGB = [0, 0, 0]

export type ThemeOptions = { accent: string; grayFamily: string; serifHeadings: boolean; radius: number; density: string; dark: boolean }

export function themeVars({ accent, grayFamily, serifHeadings, radius, density, dark }: ThemeOptions): CSSProperties {
  const g = GRAYS[grayFamily] ?? GRAYS.slate!
  const at = (i: number) => g[i]!
  const rgbAt = (i: number) => parseHex(at(i))!
  const brand = parseHex(accent) ?? parseHex('#1d3461')!

  // 浅色：页面 100、区块 200、卡片白；深色：页面 900、区块 950、卡片 800（上游是 neutral-200 / 800）。
  const surfaces = dark
    ? { bg: 9, bg2: 10, surface: 8, ink: 1, body: 3, soft: 4, mut: 4, line: 7, line2: 7 }
    : { bg: 1, bg2: 2, surface: -1, ink: 9, body: 7, soft: 6, mut: 6, line: 3, line2: 2 }
  const surfaceHex = surfaces.surface < 0 ? '#ffffff' : at(surfaces.surface)
  // 按钮底色：深色模式下太暗的主色提亮到能和页面分开。
  const fill = dark ? ensureContrast(brand, rgbAt(surfaces.bg), 2.4, WHITE) : brand
  const onFill = contrast(fill, WHITE) >= contrast(fill, rgbAt(10)) ? '#ffffff' : at(10)
  // 文字用的主色：对最不利的底色（浅色的区块底、深色的卡片）也要有 4.5:1。
  const ink = dark ? ensureContrast(brand, rgbAt(surfaces.surface), 4.5, WHITE) : ensureContrast(brand, rgbAt(surfaces.bg2), 4.5, BLACK)
  const hover = toHex(mixRgb(fill, onFill === '#ffffff' ? BLACK : WHITE, 0.14))

  const vars: Record<string, string> = {
    '--bg': at(surfaces.bg),
    '--bg-2': at(surfaces.bg2),
    '--surface': surfaceHex,
    '--field': dark ? `color-mix(in srgb, ${at(7)} 40%, ${at(9)})` : at(0),
    '--ink': at(surfaces.ink),
    '--body': at(surfaces.body),
    '--soft': at(surfaces.soft),
    '--mut': at(surfaces.mut),
    '--line': at(surfaces.line),
    '--line-2': at(surfaces.line2),
    '--ring-c': dark ? at(2) : at(5),
    '--brand': toHex(fill),
    '--brand-hover': hover,
    '--on-brand': onFill,
    '--brand-ink': toHex(ink),
    '--panel': `color-mix(in srgb, ${toHex(fill)} ${dark ? 16 : 9}%, ${surfaceHex})`,
    '--r': `${radius}px`,
    '--d': String(DENSITY[density] ?? 1),
    '--font-body': `'IBM Plex Sans Variable'${SANS}`,
    '--font-head': serifHeadings ? `'Newsreader Variable'${SERIF}` : `'IBM Plex Sans Variable'${SANS}`,
    '--head-weight': serifHeadings ? '500' : '700',
    '--head-track': serifHeadings ? '-0.012em' : '-0.025em',
  }
  return { ...vars, colorScheme: dark ? 'dark' : 'light', fontFamily: 'var(--font-body)', backgroundColor: 'var(--bg)', color: 'var(--body)' } as CSSProperties
}

// ---------------------------------------------------------------------------
// 图标（替换上游的 Icon.astro）
// ---------------------------------------------------------------------------

const PATHS = {
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrowRightLong: <path d="M3 12h18m-4-4 4 4-4 4" />,
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  arrowCircle: <><circle cx="12" cy="12" r="9" /><path d="m12.75 15 3-3-3-3m3 3h-7.5" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  mapPin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></>,
  envelope: <><path d="M3.5 9.5 12 4l8.5 5.5V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" /><path d="m3.5 9.5 8.5 5.5 8.5-5.5" /></>,
  bank: <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18" />,
  bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />,
  cross: <><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><path d="M12 8v8M8 12h8" /></>,
  factory: <path d="M3 20.5V10l5.5 3.5V10l5.5 3.5V5h6.5v15.5zM7 17h2m3 0h2m3 0h1.5" />,
  bag: <path d="M5 8.5h14l-1.2 12H6.2zM9 8.5V7a3 3 0 0 1 6 0v1.5" />,
  chip: <><rect x="7" y="7" width="10" height="10" rx="1.5" /><path d="M10 3.5V7m4-3.5V7m-4 10v3.5m4-3.5v3.5M3.5 10H7m-3.5 4H7m10-4h3.5M17 14h3.5" /></>,
  truck: <><path d="M3 6h11v10H3zM14 9.5h4l3 3.5v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17.5" cy="17.5" r="1.8" /></>,
  shield: <path d="M12 3.5 19.5 6v5.5c0 4.6-3.2 7.9-7.5 9.5-4.3-1.6-7.5-4.9-7.5-9.5V6z" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof PATHS

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={cn('size-5', className)} aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// 按钮（PrimaryCTA / SecondaryCTA）
// ---------------------------------------------------------------------------

const FOCUS = 'outline-hidden ring-(--ring-c) focus-visible:ring-3'

export function PrimaryCTA({ title, href, noArrow, className, onClick, type }: { title: string; href?: string; noArrow?: boolean; className?: string; onClick?: () => void; type?: 'submit' | 'button' }) {
  const classes = cn(
    'group inline-flex items-center justify-center gap-x-2 rounded-(--r) border border-transparent bg-(--brand) px-4 py-3 text-sm font-bold text-(--on-brand) transition-colors duration-300 hover:bg-(--brand-hover) active:bg-(--brand-hover) disabled:pointer-events-none disabled:opacity-50 2xl:text-base',
    FOCUS,
    className,
  )
  const inner = (
    <>
      {title}
      {noArrow ? null : <Icon name="arrowRight" className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />}
    </>
  )
  if (href) {
    return (
      <a className={classes} href={href} onClick={onClick}>
        {inner}
      </a>
    )
  }
  return (
    <button type={type ?? 'button'} className={classes} onClick={onClick}>
      {inner}
    </button>
  )
}

export function SecondaryCTA({ title, href }: { title: string; href: string }) {
  return (
    <a
      className={cn(
        'inline-flex items-center justify-center gap-x-2 rounded-(--r) border border-(--line) bg-(--surface) px-4 py-3 text-center text-sm font-medium text-(--soft) shadow-xs transition-colors duration-300 hover:bg-(--bg-2) hover:text-(--ink) 2xl:text-base',
        FOCUS,
      )}
      href={href}
    >
      {title}
    </a>
  )
}

export const focusRing = FOCUS

/** 标题统一走 head 字体；serifHeadings 切换衬线。 */
export function Heading({ as: Tag = 'h2', className, children, id }: { as?: 'h1' | 'h2' | 'h3'; className?: string; children: ReactNode; id?: string }) {
  return (
    <Tag id={id} className={cn('font-(family-name:--font-head) [font-weight:var(--head-weight)] [letter-spacing:var(--head-track)] text-balance text-(--ink)', className)}>
      {children}
    </Tag>
  )
}

/** 虚构事务所的字标：一个方框里的两道竖线，替换上游的 BrandLogo。 */
export function BrandMark({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 28 28" className="size-7 shrink-0" aria-hidden="true">
        <rect width="28" height="28" style={{ rx: 'calc(var(--r) * 0.8)' } as CSSProperties} fill="var(--brand)" />
        <path d="M9 7.5v13M14 7.5v13M19 7.5v13M9 14h10" stroke="var(--on-brand)" strokeWidth="1.8" strokeLinecap="square" />
      </svg>
      <span className="font-(family-name:--font-head) text-lg [font-weight:var(--head-weight)] tracking-tight whitespace-nowrap text-(--ink)">{name}</span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// 配图：上游的照片全部换成按主色着色的 SVG 图案
// ---------------------------------------------------------------------------

export type ArtKind = 'contour' | 'bars' | 'grid' | 'rings' | 'lines' | 'nodes'

function contourPath(i: number): string {
  const pts: string[] = []
  for (let x = -20; x <= 420; x += 20) {
    const y = 40 + i * 22 + Math.sin(x / 62 + i * 0.55) * (14 + i * 1.6) + Math.cos(x / 31 - i) * 5
    pts.push(`${x},${y.toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}

export function Art({ kind, className, label }: { kind: ArtKind; className?: string; label?: string }) {
  const id = useId().replace(/:/g, '')
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const }
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={cn('block size-full bg-(--panel)', className)} {...a11y}>
      <defs>
        <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0v20" fill="none" stroke="var(--line)" strokeWidth="0.8" />
        </pattern>
        <pattern id={`${id}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0v7" stroke="var(--brand)" strokeOpacity="0.5" strokeWidth="1.2" />
        </pattern>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--brand)" stopOpacity="0.32" />
          <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {kind === 'contour' && (
        <g fill="none" stroke="var(--brand)" strokeWidth="1.1">
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={contourPath(i)} strokeOpacity={0.18 + (i % 4 === 1 ? 0.5 : 0.12)} />
          ))}
          <circle cx="262" cy="134" r="5" fill="var(--brand)" stroke="none" />
          <circle cx="262" cy="134" r="14" strokeOpacity="0.5" />
        </g>
      )}
      {kind === 'bars' && (
        <>
          <rect width="400" height="300" fill={`url(#${id}-grid)`} />
          {[62, 84, 78, 104, 122, 116, 148, 172].map((h, i) => (
            <rect key={i} x={46 + i * 40} y={252 - h} width="24" height={h} fill={i === 7 ? 'var(--brand)' : `url(#${id}-hatch)`} stroke="var(--brand)" strokeOpacity={i === 7 ? 0 : 0.55} />
          ))}
          <path d="M30 252h344" stroke="var(--ink)" strokeOpacity="0.55" strokeWidth="1.2" />
          <path d="M58 182 98 160l40 6 40-28 40-16 40 6 40-34 40-22" fill="none" stroke="var(--ink)" strokeOpacity="0.7" strokeWidth="1.4" strokeDasharray="4 4" />
        </>
      )}
      {kind === 'grid' && (
        <>
          <rect width="400" height="300" fill={`url(#${id}-grid)`} />
          {Array.from({ length: 13 * 9 }, (_, n) => {
            const cx = n % 13
            const cy = Math.floor(n / 13)
            const v = (Math.sin(cx * 0.9 + cy * 1.7) + Math.cos(cx * 0.4 - cy * 0.8)) / 2
            if (v < 0.15) return null
            return <rect key={n} x={70 + cx * 20 + 2} y={50 + cy * 20 + 2} width="16" height="16" fill="var(--brand)" fillOpacity={Math.min(0.9, v * 0.85)} />
          })}
        </>
      )}
      {kind === 'rings' && (
        <>
          <rect width="400" height="300" fill={`url(#${id}-grid)`} opacity="0.6" />
          <clipPath id={`${id}-clip`}>
            <circle cx="160" cy="150" r="92" />
          </clipPath>
          <circle cx="240" cy="150" r="92" fill={`url(#${id}-hatch)`} clipPath={`url(#${id}-clip)`} />
          <circle cx="160" cy="150" r="92" fill="none" stroke="var(--brand)" strokeWidth="1.4" />
          <circle cx="240" cy="150" r="92" fill="none" stroke="var(--ink)" strokeOpacity="0.6" strokeWidth="1.4" />
          <circle cx="160" cy="150" r="4" fill="var(--brand)" />
          <circle cx="240" cy="150" r="4" fill="var(--ink)" fillOpacity="0.7" />
        </>
      )}
      {kind === 'lines' && (
        <>
          <rect width="400" height="300" fill={`url(#${id}-grid)`} opacity="0.7" />
          <path d="M20 236 70 222l50 8 50-30 50 4 50-42 50-10 50-48 50-18V300H20z" fill={`url(#${id}-fade)`} />
          <path d="M20 236 70 222l50 8 50-30 50 4 50-42 50-10 50-48 50-18" fill="none" stroke="var(--brand)" strokeWidth="2" />
          <path d="M20 250 70 246l50 4 50-14 50 2 50-12 50-4 50-10 50-6" fill="none" stroke="var(--ink)" strokeOpacity="0.45" strokeWidth="1.3" strokeDasharray="3 5" />
          <circle cx="320" cy="118" r="5" fill="var(--brand)" />
        </>
      )}
      {kind === 'nodes' && (
        <>
          <rect width="400" height="300" fill={`url(#${id}-grid)`} opacity="0.6" />
          <g stroke="var(--ink)" strokeOpacity="0.45" strokeWidth="1.2" fill="none">
            <path d="M200 70v40M110 110h180M110 110v40M200 110v40M290 110v40M80 190h60M110 150v40M80 190v30M140 190v30M260 190h60M290 150v40M260 190v30M320 190v30" />
          </g>
          {[
            [200, 60, 1],
            [110, 150, 0],
            [200, 150, 0.6],
            [290, 150, 0],
            [80, 226, 0],
            [140, 226, 0],
            [260, 226, 0],
            [320, 226, 0],
          ].map(([x, y, solid], i) => (
            <rect key={i} x={x! - 16} y={y! - 10} width="32" height="20" rx="3" fill={solid ? 'var(--brand)' : 'var(--surface)'} fillOpacity={solid ? solid : 1} stroke="var(--brand)" strokeWidth="1.2" />
          ))}
        </>
      )}
    </svg>
  )
}
