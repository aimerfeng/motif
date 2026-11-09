// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Next.js Templates
// Source: https://github.com/NextJSTemplates/startup-nextjs/blob/e730b6a/src/components/Blog/TagButton.tsx
// Modified by Motif; see the item's provenance.
import { useId, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'

/* ---------- 主题 ---------- */

/** 标题字体；正文沿用上游的 Inter 系（Inter Tight）。 */
export const HEADLINE_FONTS = {
  sans: { family: "'Inter Tight Variable'", weight: 700, tracking: '-0.02em' },
  serif: { family: "'Newsreader Variable'", weight: 600, tracking: '-0.012em' },
  display: { family: "'Playfair Display Variable'", weight: 700, tracking: '-0.008em' },
} as const
export type HeadlineFont = keyof typeof HEADLINE_FONTS

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

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** 主色当文字用时向前景色靠，直到在背景和卡片上都够 4.5:1。 */
function readableOn(accent: string, surfaces: string[], toward: string) {
  for (let t = 0; t <= 1; t += 0.05) {
    const candidate = mix(accent, toward, t)
    if (surfaces.every((surface) => contrast(candidate, surface) >= 4.6)) return candidate
  }
  return toward
}

export interface Theme {
  accent: string
  dark: boolean
  headlineFont: string
}

export function themeStyle({ accent, dark, headlineFont }: Theme): CSSProperties {
  const font = HEADLINE_FONTS[headlineFont as HeadlineFont] ?? HEADLINE_FONTS.sans
  // 上游的色板：浅色 white / black / body-color，深色 bg-color-dark / gray-dark / body-color-dark；
  // 浅色正文灰略压暗，保证在白底上够 4.5:1。
  const t = dark
    ? { background: '#171c28', foreground: '#ffffff', card: '#1e232e', muted: '#2c303b', mutedForeground: '#959cb1', border: 'rgba(255,255,255,0.1)', shadow: 'none' }
    : { background: '#ffffff', foreground: '#121723', card: '#ffffff', muted: '#f0f2f9', mutedForeground: '#636b7c', border: 'rgba(120,130,147,0.16)', shadow: '0px 5px 15px rgba(6,8,15,0.06)' }
  const onAccent = contrast(accent, '#ffffff') >= contrast(accent, '#121723') ? '#ffffff' : '#121723'
  return {
    '--background': t.background,
    '--foreground': t.foreground,
    '--card': t.card,
    '--muted': t.muted,
    '--muted-foreground': t.mutedForeground,
    '--border': t.border,
    '--color-border': t.border,
    '--primary': accent,
    '--primary-foreground': onAccent,
    '--accent-text': readableOn(accent, [t.background, t.card, t.muted], t.foreground),
    '--shadow-three': t.shadow,
    '--font-head': font.family,
    '--head-weight': font.weight,
    '--head-tracking': font.tracking,
    fontFamily: "'Inter Tight Variable', system-ui, sans-serif",
    background: t.background,
    color: t.foreground,
    colorScheme: dark ? 'dark' : 'light',
  } as CSSProperties
}

export const headStyle: CSSProperties = { fontFamily: 'var(--font-head)', fontWeight: 'var(--head-weight)' as CSSProperties['fontWeight'], letterSpacing: 'var(--head-tracking)' }

/** 链接的点击都留在页面里：这是演示用的静态杂志。 */
export const stay = (event: { preventDefault: () => void }) => event.preventDefault()

/* ---------- 图标 ---------- */

const STROKE_ICONS: Record<string, ReactNode> = {
  link: <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  bookmark: <path d="M6 4h12v16l-6-4-6 4V4z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={cn('size-4 shrink-0', className)} aria-hidden>
      {STROKE_ICONS[name]}
    </svg>
  )
}

/** 上游的日历 / 评论 / 浏览图标，原样保留路径。 */
export function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" className="fill-current" aria-hidden>
      <path d="M3.89531 8.67529H3.10666C2.96327 8.67529 2.86768 8.77089 2.86768 8.91428V9.67904C2.86768 9.82243 2.96327 9.91802 3.10666 9.91802H3.89531C4.03871 9.91802 4.1343 9.82243 4.1343 9.67904V8.91428C4.1343 8.77089 4.03871 8.67529 3.89531 8.67529Z" />
      <path d="M6.429 8.67529H5.64035C5.49696 8.67529 5.40137 8.77089 5.40137 8.91428V9.67904C5.40137 9.82243 5.49696 9.91802 5.64035 9.91802H6.429C6.57239 9.91802 6.66799 9.82243 6.66799 9.67904V8.91428C6.66799 8.77089 6.5485 8.67529 6.429 8.67529Z" />
      <path d="M8.93828 8.67529H8.14963C8.00624 8.67529 7.91064 8.77089 7.91064 8.91428V9.67904C7.91064 9.82243 8.00624 9.91802 8.14963 9.91802H8.93828C9.08167 9.91802 9.17727 9.82243 9.17727 9.67904V8.91428C9.17727 8.77089 9.08167 8.67529 8.93828 8.67529Z" />
      <path d="M11.4715 8.67529H10.6828C10.5394 8.67529 10.4438 8.77089 10.4438 8.91428V9.67904C10.4438 9.82243 10.5394 9.91802 10.6828 9.91802H11.4715C11.6149 9.91802 11.7105 9.82243 11.7105 9.67904V8.91428C11.7105 8.77089 11.591 8.67529 11.4715 8.67529Z" />
      <path d="M3.89531 11.1606H3.10666C2.96327 11.1606 2.86768 11.2562 2.86768 11.3996V12.1644C2.86768 12.3078 2.96327 12.4034 3.10666 12.4034H3.89531C4.03871 12.4034 4.1343 12.3078 4.1343 12.1644V11.3996C4.1343 11.2562 4.03871 11.1606 3.89531 11.1606Z" />
      <path d="M6.429 11.1606H5.64035C5.49696 11.1606 5.40137 11.2562 5.40137 11.3996V12.1644C5.40137 12.3078 5.49696 12.4034 5.64035 12.4034H6.429C6.57239 12.4034 6.66799 12.3078 6.66799 12.1644V11.3996C6.66799 11.2562 6.5485 11.1606 6.429 11.1606Z" />
      <path d="M8.93828 11.1606H8.14963C8.00624 11.1606 7.91064 11.2562 7.91064 11.3996V12.1644C7.91064 12.3078 8.00624 12.4034 8.14963 12.4034H8.93828C9.08167 12.4034 9.17727 12.3078 9.17727 12.1644V11.3996C9.17727 11.2562 9.08167 11.1606 8.93828 11.1606Z" />
      <path d="M11.4715 11.1606H10.6828C10.5394 11.1606 10.4438 11.2562 10.4438 11.3996V12.1644C10.4438 12.3078 10.5394 12.4034 10.6828 12.4034H11.4715C11.6149 12.4034 11.7105 12.3078 11.7105 12.1644V11.3996C11.7105 11.2562 11.591 11.1606 11.4715 11.1606Z" />
      <path d="M13.2637 3.3697H7.64754V2.58105C8.19721 2.43765 8.62738 1.91189 8.62738 1.31442C8.62738 0.597464 8.02992 0 7.28906 0C6.54821 0 5.95074 0.597464 5.95074 1.31442C5.95074 1.91189 6.35702 2.41376 6.93058 2.58105V3.3697H1.31442C0.597464 3.3697 0 3.96716 0 4.68412V13.2637C0 13.9807 0.597464 14.5781 1.31442 14.5781H13.2637C13.9807 14.5781 14.5781 13.9807 14.5781 13.2637V4.68412C14.5781 3.96716 13.9807 3.3697 13.2637 3.3697ZM6.6677 1.31442C6.6677 0.979841 6.93058 0.716957 7.28906 0.716957C7.62364 0.716957 7.91042 0.979841 7.91042 1.31442C7.91042 1.649 7.64754 1.91189 7.28906 1.91189C6.95448 1.91189 6.6677 1.6251 6.6677 1.31442ZM1.31442 4.08665H13.2637C13.5983 4.08665 13.8612 4.34954 13.8612 4.68412V6.45261H0.716957V4.68412C0.716957 4.34954 0.979841 4.08665 1.31442 4.08665ZM13.2637 13.8612H1.31442C0.979841 13.8612 0.716957 13.5983 0.716957 13.2637V7.16957H13.8612V13.2637C13.8612 13.5983 13.5983 13.8612 13.2637 13.8612Z" />
    </svg>
  )
}

export function CommentIcon() {
  return (
    <svg width="18" height="13" viewBox="0 0 18 13" className="fill-current" aria-hidden>
      <path d="M15.6375 0H1.6875C0.759375 0 0 0.759375 0 1.6875V10.6875C0 11.3062 0.309375 11.8406 0.84375 12.15C1.09687 12.2906 1.40625 12.375 1.6875 12.375C1.96875 12.375 2.25 12.2906 2.53125 12.15L5.00625 10.7156C5.11875 10.6594 5.23125 10.6312 5.34375 10.6312H15.6094C16.5375 10.6312 17.2969 9.87187 17.2969 8.94375V1.6875C17.325 0.759375 16.5656 0 15.6375 0ZM16.3406 8.94375C16.3406 9.3375 16.0312 9.64687 15.6375 9.64687H5.37187C5.09062 9.64687 4.78125 9.73125 4.52812 9.87187L2.05313 11.3063C1.82812 11.4187 1.575 11.4187 1.35 11.3063C1.125 11.1938 1.0125 10.9688 1.0125 10.7156V1.6875C1.0125 1.29375 1.32188 0.984375 1.71563 0.984375H15.6656C16.0594 0.984375 16.3687 1.29375 16.3687 1.6875V8.94375H16.3406Z" />
      <path d="M12.2342 3.375H4.69668C4.41543 3.375 4.19043 3.6 4.19043 3.88125C4.19043 4.1625 4.41543 4.3875 4.69668 4.3875H12.2623C12.5435 4.3875 12.7685 4.1625 12.7685 3.88125C12.7685 3.6 12.5154 3.375 12.2342 3.375Z" />
      <path d="M11.0529 6.55322H4.69668C4.41543 6.55322 4.19043 6.77822 4.19043 7.05947C4.19043 7.34072 4.41543 7.56572 4.69668 7.56572H11.0811C11.3623 7.56572 11.5873 7.34072 11.5873 7.05947C11.5873 6.77822 11.3342 6.55322 11.0529 6.55322Z" />
    </svg>
  )
}

export function EyeIcon() {
  return (
    <svg width="20" height="12" viewBox="0 0 20 12" className="fill-current" aria-hidden>
      <path d="M10.2559 3.8125C9.03711 3.8125 8.06836 4.8125 8.06836 6C8.06836 7.1875 9.06836 8.1875 10.2559 8.1875C11.4434 8.1875 12.4434 7.1875 12.4434 6C12.4434 4.8125 11.4746 3.8125 10.2559 3.8125ZM10.2559 7.09375C9.66211 7.09375 9.16211 6.59375 9.16211 6C9.16211 5.40625 9.66211 4.90625 10.2559 4.90625C10.8496 4.90625 11.3496 5.40625 11.3496 6C11.3496 6.59375 10.8496 7.09375 10.2559 7.09375Z" />
      <path d="M19.7559 5.625C17.6934 2.375 14.1309 0.4375 10.2559 0.4375C6.38086 0.4375 2.81836 2.375 0.755859 5.625C0.630859 5.84375 0.630859 6.125 0.755859 6.34375C2.81836 9.59375 6.38086 11.5312 10.2559 11.5312C14.1309 11.5312 17.6934 9.59375 19.7559 6.34375C19.9121 6.125 19.9121 5.84375 19.7559 5.625ZM10.2559 10.4375C6.84961 10.4375 3.69336 8.78125 1.81836 5.96875C3.69336 3.1875 6.84961 1.53125 10.2559 1.53125C13.6621 1.53125 16.8184 3.1875 18.6934 5.96875C16.8184 8.78125 13.6621 10.4375 10.2559 10.4375Z" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden>
      <path
        d="M19.4062 16.8125L13.9375 12.375C14.9375 11.0625 15.5 9.46875 15.5 7.78125C15.5 5.75 14.7188 3.875 13.2812 2.4375C10.3438 -0.5 5.5625 -0.5 2.59375 2.4375C1.1875 3.84375 0.40625 5.75 0.40625 7.75C0.40625 9.78125 1.1875 11.6562 2.625 13.0937C4.09375 14.5625 6.03125 15.3125 7.96875 15.3125C9.875 15.3125 11.75 14.5938 13.2188 13.1875L18.75 17.6562C18.8438 17.75 18.9688 17.7812 19.0938 17.7812C19.25 17.7812 19.4062 17.7188 19.5312 17.5938C19.6875 17.3438 19.6562 17 19.4062 16.8125ZM3.375 12.3438C2.15625 11.125 1.5 9.5 1.5 7.75C1.5 6 2.15625 4.40625 3.40625 3.1875C4.65625 1.9375 6.3125 1.3125 7.96875 1.3125C9.625 1.3125 11.2812 1.9375 12.5312 3.1875C13.75 4.40625 14.4375 6.03125 14.4375 7.75C14.4375 9.46875 13.7188 11.125 12.5 12.3438C10 14.8438 5.90625 14.8438 3.375 12.3438Z"
        fill="currentColor"
      />
    </svg>
  )
}

/* ---------- 刊名、作者、标签 ---------- */

/** 虚构刊标：折角的书页。 */
export function Masthead({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5 text-foreground', className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <path d="M5 4h15l7 7v17H5z" className="fill-primary" />
        <path d="M20 4v7h7" fill="none" stroke="var(--primary-foreground)" strokeWidth="2" strokeLinejoin="round" opacity="0.7" />
        <path d="M10 17h12M10 22h8" stroke="var(--primary-foreground)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="truncate" style={headStyle}>
        {name}
      </span>
    </span>
  )
}

/** 首字母 + 渐变，代替上游的作者照片。 */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360
  const initials = name
    .replace(/^Dr\.\s+/, '')
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(140deg, oklch(0.62 0.13 ${hash}), oklch(0.42 0.12 ${(hash + 50) % 360}))` }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

export function TagButton({ text }: { text: string }) {
  return (
    <a
      href="#0"
      onClick={stay}
      className="mr-3 mb-3 inline-flex items-center justify-center rounded-xs bg-muted px-4 py-2 text-sm text-foreground outline-none transition-colors duration-300 hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary"
    >
      {text}
    </a>
  )
}

/* ---------- 生成的封面插图（代替上游照片） ---------- */

export type CoverStyle = 'waves' | 'orbits' | 'blocks'

export function Cover({ variant, palette, seed = 0, className }: { variant: string; palette: readonly [string, string, string]; seed?: number; className?: string }) {
  const id = `cv${useId().replace(/[^\w-]/g, '')}`
  const [a, b, c] = palette
  const flip = seed % 2 === 1
  const sunX = 70 + ((seed * 97) % 260)
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={cn('absolute inset-0 size-full', className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2={flip ? 0 : 1} y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={c} stopOpacity="0.9" />
          <stop offset="1" stopColor={c} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}-bg)`} />
      {variant === 'orbits' ? (
        <g transform={flip ? 'translate(400 0) scale(-1 1)' : undefined}>
          <circle cx="250" cy="120" r="150" fill={`url(#${id}-glow)`} opacity="0.35" />
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx="250" cy="120" rx={60 + i * 42} ry={24 + i * 17} fill="none" stroke="#ffffff" strokeOpacity={0.32 - i * 0.05} strokeWidth="1.2" transform="rotate(-14 250 120)" />
          ))}
          <circle cx="250" cy="120" r="34" fill={c} />
          <circle cx="238" cy="110" r="34" fill="#ffffff" opacity="0.16" />
          <circle cx={150 + (seed % 3) * 14} cy="152" r="9" fill="#ffffff" opacity="0.85" />
          <circle cx="352" cy="78" r="6" fill={c} opacity="0.9" />
          {[...Array(14)].map((_, i) => (
            <circle key={i} cx={(i * 67 + seed * 31) % 400} cy={(i * 41 + seed * 17) % 240} r={i % 3 === 0 ? 1.6 : 1} fill="#ffffff" opacity="0.6" />
          ))}
        </g>
      ) : variant === 'blocks' ? (
        <g transform={flip ? 'translate(400 0) scale(-1 1)' : undefined}>
          <rect x="0" y="0" width="150" height="240" fill={c} opacity="0.9" />
          <path d="M150 240a110 110 0 01220 0z" fill="#ffffff" opacity="0.88" />
          <path d="M260 0a90 90 0 0090 90V0z" fill={a} opacity="0.85" />
          <circle cx="75" cy="78" r="38" fill={b} />
          <rect x="196" y="58" width="56" height="56" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.7" transform="rotate(18 224 86)" />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M24 ${150 + i * 14}h102`} stroke={b} strokeWidth="5" strokeLinecap="round" opacity={0.75 - i * 0.1} />
          ))}
          <circle cx="260" cy="240" r="34" fill={c} />
        </g>
      ) : (
        <g>
          <circle cx={sunX} cy="78" r="70" fill={`url(#${id}-glow)`} opacity="0.55" />
          <circle cx={sunX} cy="78" r="30" fill={c} />
          <path d="M0 150C60 122 120 176 200 148S330 118 400 142V240H0z" fill="#ffffff" opacity="0.18" />
          <path d="M0 176C70 150 130 200 210 172S330 146 400 170V240H0z" fill="#ffffff" opacity="0.22" />
          <path d="M0 202C80 180 140 222 220 198S340 182 400 196V240H0z" fill={b} opacity="0.75" />
          <path d="M0 222C90 206 150 236 230 220S350 210 400 218V240H0z" fill="#000000" opacity="0.18" />
        </g>
      )}
    </svg>
  )
}
