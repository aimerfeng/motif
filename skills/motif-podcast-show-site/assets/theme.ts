import { cssVars } from '@/lib/motif-runtime'
import type { CSSProperties } from 'react'

/* ---------- 字体搭配 ---------- */

const SANS = ', ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
const SERIF = ', ui-serif, Georgia, "Songti SC", serif'
const MONO = ', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

/** scale 用来抹平不同标题字体的视觉大小差异（Instrument Serif 很窄，要放大一些）。 */
export const FONT_PAIRINGS = {
  broadcast: { display: `'Bricolage Grotesque Variable'${SANS}`, body: `'Geist Variable'${SANS}`, mono: `'Geist Mono Variable'${MONO}`, weight: 700, tracking: '-0.04em', scale: 1 },
  journal: { display: `'Fraunces Variable'${SERIF}`, body: `'IBM Plex Sans Variable'${SANS}`, mono: `'IBM Plex Mono'${MONO}`, weight: 560, tracking: '-0.025em', scale: 1 },
  lab: { display: `'Space Grotesk Variable'${SANS}`, body: `'Inter Tight Variable'${SANS}`, mono: `'JetBrains Mono Variable'${MONO}`, weight: 600, tracking: '-0.045em', scale: 0.98 },
  editorial: { display: `'Instrument Serif'${SERIF}`, body: `'Manrope Variable'${SANS}`, mono: `'Geist Mono Variable'${MONO}`, weight: 400, tracking: '-0.015em', scale: 1.14 },
} as const
export type FontPairing = keyof typeof FONT_PAIRINGS

/* ---------- 颜色 ---------- */

type Rgb = [number, number, number]

/** 把用户给的颜色规整成 #rrggbb；认不出来就用后备色。 */
export function normalizeHex(input: string, fallback = '#ff6a3d'): string {
  const value = input.trim()
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase()
  if (/^#[0-9a-f]{8}$/i.test(value)) return value.slice(0, 7).toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(value)) return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase()
  return fallback
}

function rgbOf(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function hexOf([r, g, b]: Rgb): string {
  const to = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

/** 在两个 #rrggbb 之间按 t 线性混合（t = 1 时得到 b）。 */
export function mix(a: string, b: string, t: number): string {
  const ca = rgbOf(a)
  const cb = rgbOf(b)
  return hexOf([ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t])
}

export function luminance(hex: string): number {
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = rgbOf(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export const INK_DARK = '#121316'
export const INK_LIGHT = '#ffffff'

/** 在一组底色上都要读得清的字色：取「最差情况下对比度更高」的那个。渐变底传两端颜色。 */
export function inkOn(...backgrounds: string[]): string {
  const worst = (ink: string) => Math.min(...backgrounds.map((bg) => contrast(ink, bg)))
  return worst(INK_DARK) >= worst(INK_LIGHT) ? INK_DARK : INK_LIGHT
}

function toHsl(hex: string): [number, number, number] {
  const [r, g, b] = rgbOf(hex).map((v) => v / 255) as Rgb
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
  }
  return [(((h * 60) % 360) + 360) % 360, s, l]
}

function fromHsl(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360
  const c = s * (1 - Math.abs(2 * l - 1))
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = l - c / 2
  const [r, g, b]: Rgb = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x]
  return hexOf([(r + m) * 255, (g + m) * 255, (b + m) * 255])
}

/**
 * 调 HSL 明度（保留色相和饱和度），直到颜色在每一个底色上都达到给定对比度。
 * 主色当文字、细线或按钮底色用时都过一遍：深底上的深色主色会被提亮，浅底上的浅色主色会被压暗，但看起来还是同一个颜色。
 * 传一组底色时按最难的那个算（浅色模式里最深的、深色模式里最浅的），同一个颜色放在页面底、卡片和浮层上都读得清。
 */
export function ensureContrast(color: string, bg: string | readonly string[], ratio: number): string {
  const grounds = typeof bg === 'string' ? [bg] : bg
  const worst = (candidate: string) => Math.min(...grounds.map((ground) => contrast(candidate, ground)))
  if (worst(color) >= ratio) return color
  const [h, s, l] = toHsl(color)
  const up = grounds.reduce((sum, ground) => sum + luminance(ground), 0) / grounds.length < 0.4
  for (let step = 1; step <= 100; step++) {
    const candidate = fromHsl(h, s, Math.min(1, Math.max(0, l + (up ? 0.01 : -0.01) * step)))
    if (worst(candidate) >= ratio) return candidate
  }
  return up ? '#ffffff' : '#000000'
}

/**
 * 实心填充上要放字（按钮、筛选标签）：中间亮度的颜色配深字、白字都差一点到 4.5，
 * 这时把填充的明度往离得近的那一侧推一点，直到挑出来的字色够用。
 */
function fillForText(color: string, ratio = 4.5): string {
  if (contrast(inkOn(color), color) >= ratio) return color
  const [h, s, l] = toHsl(color)
  for (let step = 1; step <= 50; step++) {
    for (const direction of [-1, 1]) {
      const candidate = fromHsl(h, s, Math.min(1, Math.max(0, l + direction * 0.01 * step)))
      if (contrast(inkOn(candidate), candidate) >= ratio) return candidate
    }
  }
  return color
}

/** 在 HSL 里转色相：头像和单集封面用主色的邻近色，整页还是一个色系。 */
export function rotateHue(hex: string, degrees: number): string {
  const [h, s, l] = toHsl(hex)
  return fromHsl(h + degrees, s, l)
}

/* ---------- 主题 ---------- */

export interface Palette {
  dark: boolean
  bg: string
  surface: string
  raised: string
  fg: string
  muted: string
  accent: string
  /** 主色当正文色用时的版本（对比度 ≥ 4.5）。 */
  accentText: string
  /** 主色当图形用时的版本（波形、进度、细线，对比度 ≥ 3）。 */
  accentUi: string
  onAccent: string
}

export function palette(accentInput: string, dark: boolean): Palette {
  const picked = normalizeHex(accentInput)
  const base = dark
    ? { bg: mix('#0c0d10', picked, 0.035), surface: mix('#15161a', picked, 0.05), raised: mix('#1d1f24', picked, 0.07), fg: '#f3f1ec', muted: '#a6a59f' }
    : { bg: mix('#f6f4ef', picked, 0.02), surface: '#ffffff', raised: mix('#efece6', picked, 0.05), fg: '#15161a', muted: '#5b5d65' }
  // 按钮、播放键这类实心填充至少要和页面底色拉开一点：深底上的藏青、浅底上的浅黄都会被调到看得见
  const accent = fillForText(ensureContrast(picked, base.bg, dark ? 2.4 : 1.35))
  // 主色文字和细线会出现在页面底（眉题、单集号、焦点环）、卡片和浮层（订阅区、当前章节、迷你播放条）上
  const grounds = [base.bg, base.surface, base.raised]
  return {
    dark,
    ...base,
    accent,
    accentText: ensureContrast(accent, grounds, 4.6),
    accentUi: ensureContrast(accent, grounds, 3),
    onAccent: inkOn(accent),
  }
}

export function themeStyle(colors: Palette, fontPairing: string, radius: number): CSSProperties {
  const font = FONT_PAIRINGS[fontPairing as FontPairing] ?? FONT_PAIRINGS.broadcast
  const ink = colors.dark ? '255 255 255' : '21 22 26'
  return cssVars(
    {
      '--pc-bg': colors.bg,
      '--pc-surface': colors.surface,
      '--pc-raised': colors.raised,
      '--pc-fg': colors.fg,
      '--pc-muted': colors.muted,
      '--pc-line': `rgb(${ink} / ${colors.dark ? 0.1 : 0.12})`,
      '--pc-line-strong': `rgb(${ink} / ${colors.dark ? 0.18 : 0.2})`,
      '--pc-wave': `rgb(${ink} / ${colors.dark ? 0.2 : 0.17})`,
      '--pc-buffered': `rgb(${ink} / ${colors.dark ? 0.34 : 0.3})`,
      '--pc-accent': colors.accent,
      '--pc-accent-text': colors.accentText,
      '--pc-accent-ui': colors.accentUi,
      '--pc-on-accent': colors.onAccent,
      '--pc-glow': `color-mix(in oklab, ${colors.accent} ${colors.dark ? 22 : 14}%, transparent)`,
      '--pc-radius': `${radius}px`,
      '--pc-display': font.display,
      '--pc-body': font.body,
      '--pc-mono': font.mono,
      '--pc-display-weight': font.weight,
      '--pc-display-tracking': font.tracking,
      '--pc-display-scale': font.scale,
    },
    { fontFamily: font.body, background: colors.bg, color: colors.fg, colorScheme: colors.dark ? 'dark' : 'light' },
  )
}

/** 标题字体的公共样式。 */
export const DISPLAY: CSSProperties = {
  fontFamily: 'var(--pc-display)',
  fontWeight: 'var(--pc-display-weight)' as CSSProperties['fontWeight'],
  letterSpacing: 'var(--pc-display-tracking)',
}

/* ---------- 格式 ---------- */

/** 秒 → m:ss 或 h:mm:ss。 */
export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** 秒 → 「52 min」「1 h 01 min」。 */
export function formatLength(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min` : `${minutes} min`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** ISO 日期 → 「Nov 4, 2026」；short 时省掉年份。 */
export function formatDate(iso: string, short = false): string {
  const [y, m, d] = iso.split('-').map(Number)
  const day = `${MONTHS[(m ?? 1) - 1]} ${d}`
  return short ? day : `${day}, ${y}`
}

/** 节目名 → 两个字母的缩写，封面和标志用。 */
export function monogram(name: string): string {
  const all = name.split(/\s+/).map((word) => word.replace(/[^\p{L}\p{N}]/gu, '')).filter(Boolean)
  // 去掉开头的冠词：The Overnight Incubators → OI
  const words = all.length > 1 && /^(the|a|an)$/i.test(all[0]!) ? all.slice(1) : all
  if (words.length === 0) return 'P'
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase()
  return `${words[0]![0]}${words[1]![0]}`.toUpperCase()
}

/** 节目名 → 订阅地址里的 slug。 */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'show'
  )
}
