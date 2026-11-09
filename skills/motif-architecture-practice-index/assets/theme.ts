import type { CSSProperties } from 'react'

/* ---------- 颜色工具 ---------- */

function rgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** 在两个 #rrggbb 之间线性混合。 */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = rgb(a)
  const [br, bg, bb] = rgb(b)
  const to = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, '0')
  return `#${to(ar, br)}${to(ag, bg)}${to(ab, bb)}`
}

function luminance(hex: string): number {
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = rgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** 标记色在底色上不够清楚时，逐步混向墨色，直到对比度达标（文字 4.5，线条 3）。 */
function legible(color: string, ground: string, ink: string, min: number): string {
  let out = color
  for (let t = 0.1; contrast(out, ground) < min && t <= 1; t += 0.1) out = mix(color, ink, t)
  return out
}

function alpha(hex: string, a: number): string {
  const [r, g, b] = rgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/* ---------- 底色与字体 ---------- */

interface Tone {
  bg: string
  panel: string
  ink: string
  muted: string
}

// 每种底色都有浅、深两套；muted 在底色和行悬停色（墨色 4.5%）上的对比度都 ≥ 4.75。
const GROUNDS: Record<string, { light: Tone; dark: Tone }> = {
  paper: {
    light: { bg: '#f2efe9', panel: '#f7f5f0', ink: '#1b1a17', muted: '#66625b' },
    dark: { bg: '#161513', panel: '#1c1b18', ink: '#ece8e0', muted: '#9d978c' },
  },
  concrete: {
    light: { bg: '#e7e7e4', panel: '#eeeeeb', ink: '#1c1e20', muted: '#5b5f64' },
    dark: { bg: '#181a1c', panel: '#1e2124', ink: '#e5e7e8', muted: '#959ba0' },
  },
  clay: {
    light: { bg: '#ede3d5', panel: '#f3ebe0', ink: '#2a2019', muted: '#675b4e' },
    dark: { bg: '#1f1813', panel: '#261e18', ink: '#efe3d3', muted: '#a89886' },
  },
  sage: {
    light: { bg: '#e4e9e1', panel: '#ebefe8', ink: '#1a211c', muted: '#566259' },
    dark: { bg: '#131916', panel: '#19201c', ink: '#e2e9e0', muted: '#919e94' },
  },
}

export const FONT_PAIRS = {
  swiss: { display: "'Inter Tight Variable', ui-sans-serif, sans-serif", body: "'Inter Tight Variable', ui-sans-serif, sans-serif", mono: "'IBM Plex Mono', ui-monospace, monospace", weight: 450, tracking: '-0.028em', scale: 1 },
  monograph: { display: "'Instrument Serif', ui-serif, serif", body: "'Inter Tight Variable', ui-sans-serif, sans-serif", mono: "'IBM Plex Mono', ui-monospace, monospace", weight: 400, tracking: '-0.012em', scale: 1.12 },
  drafting: { display: "'Geist Variable', ui-sans-serif, sans-serif", body: "'Geist Variable', ui-sans-serif, sans-serif", mono: "'Geist Mono Variable', ui-monospace, monospace", weight: 460, tracking: '-0.035em', scale: 0.98 },
  journal: { display: "'Newsreader Variable', ui-serif, serif", body: "'IBM Plex Sans Variable', ui-sans-serif, sans-serif", mono: "'IBM Plex Mono', ui-monospace, monospace", weight: 420, tracking: '-0.018em', scale: 1.06 },
} as const

/** 悬停 / 高亮行的墨色不透明度。 */
const HOVER = 0.045

export interface ThemeOptions {
  accent: string
  groundTone: string
  fontPairing: string
  dark: boolean
}

export function themeStyle(options: ThemeOptions): CSSProperties {
  const ground = GROUNDS[options.groundTone] ?? GROUNDS.paper!
  const tone = options.dark ? ground.dark : ground.light
  const font = FONT_PAIRS[options.fontPairing as keyof typeof FONT_PAIRS] ?? FONT_PAIRS.swiss
  // 标记色文字会落在底色、面板色和悬停行上：悬停行（底色混 4.5% 墨色）离文字最近，按它算才不会在高亮行上掉到 4.5 以下。
  const worst = mix(tone.bg, tone.ink, HOVER)
  const accentInk = legible(options.accent, worst, tone.ink, 4.6)
  const accentLine = legible(options.accent, worst, tone.ink, 3)
  const onAccent = contrast(options.accent, '#ffffff') >= contrast(options.accent, '#141210') ? '#ffffff' : '#141210'
  return {
    '--bg': tone.bg,
    '--panel': tone.panel,
    '--ink': tone.ink,
    '--muted': tone.muted,
    '--line': alpha(tone.ink, 0.13),
    '--line-strong': alpha(tone.ink, 0.26),
    '--hover': alpha(tone.ink, HOVER),
    '--accent': options.accent,
    '--accent-ink': accentInk,
    '--accent-line': accentLine,
    '--on-accent': onAccent,
    // 让 Tailwind 的主题类（bg-background、text-muted-foreground …）也跟着走
    '--background': tone.bg,
    '--foreground': tone.ink,
    '--muted-foreground': tone.muted,
    '--border': alpha(tone.ink, 0.13),
    '--color-border': alpha(tone.ink, 0.13),
    '--primary': options.accent,
    '--primary-foreground': onAccent,
    '--font-display': font.display,
    '--font-mono': font.mono,
    '--display-weight': font.weight,
    '--display-tracking': font.tracking,
    '--ds': font.scale,
    fontFamily: font.body,
    background: tone.bg,
    color: tone.ink,
    colorScheme: options.dark ? 'dark' : 'light',
  } as CSSProperties
}

/** 事务所名 → 邮箱域名里用的短名。 */
export function domainOf(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')
  return `${slug || 'studio'}.studio`
}
