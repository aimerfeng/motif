import type { CSSProperties } from 'react'

/* ---------- 字体搭配 ---------- */

const CJK = "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"

export const FONT_PAIRS = {
  drafting: {
    display: `'Space Grotesk Variable', ui-sans-serif, system-ui, ${CJK}`,
    body: `'Space Grotesk Variable', ui-sans-serif, system-ui, ${CJK}`,
    mono: "'JetBrains Mono Variable', ui-monospace, monospace",
    weight: 600,
    tracking: '-0.035em',
    scale: 1,
  },
  plex: {
    display: `'IBM Plex Sans Variable', ui-sans-serif, system-ui, ${CJK}`,
    body: `'IBM Plex Sans Variable', ui-sans-serif, system-ui, ${CJK}`,
    mono: "'IBM Plex Mono', ui-monospace, monospace",
    weight: 600,
    tracking: '-0.025em',
    scale: 1,
  },
  geist: {
    display: `'Geist Variable', ui-sans-serif, system-ui, ${CJK}`,
    body: `'Geist Variable', ui-sans-serif, system-ui, ${CJK}`,
    mono: "'Geist Mono Variable', ui-monospace, monospace",
    weight: 600,
    tracking: '-0.04em',
    scale: 1,
  },
  plotter: {
    display: "'JetBrains Mono Variable', ui-monospace, monospace",
    body: `'JetBrains Mono Variable', ui-monospace, ${CJK}`,
    mono: "'JetBrains Mono Variable', ui-monospace, monospace",
    weight: 700,
    tracking: '-0.05em',
    scale: 0.9,
  },
} as const
export type FontPairing = keyof typeof FONT_PAIRS

/* ---------- 颜色 ---------- */

function rgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3 || h.length === 4) h = [...h.slice(0, 3)].map((c) => c + c).join('')
  const n = Number.parseInt(h.slice(0, 6), 16)
  if (Number.isNaN(n)) return [0, 0, 0]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** 在两个颜色之间线性混合，t=0 是 a，t=1 是 b。 */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = rgb(a)
  const [br, bg, bb] = rgb(b)
  const to = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0')
  return `#${to(ar, br)}${to(ag, bg)}${to(ab, bb)}`
}

export function alpha(hex: string, a: number): string {
  const [r, g, b] = rgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

function luminance(hex: string): number {
  const channel = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = rgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const LIGHT_INK = '#f2f7ff'
const DARK_INK = '#0d1b33'
/** 墨色对纸至少 7:1：次要文字最低 4.5:1，两者之间才留得出约 1.5:1 的层次。 */
const INK_TARGET = 7

/** 从 from 往 to（纯白或纯黑）推，返回第一个对纸达到 min 的颜色；色相跟着 from 走，不会一步跳到纯色。 */
function pushInk(paper: string, from: string, to: string, min: number): string {
  for (let t = 0; t < 1; t += 0.02) {
    const tone = mix(from, to, t)
    if (contrast(paper, tone) >= min) return tone
  }
  return to
}

/**
 * 线条色就是正文色，所以它和纸色之间要留够层次：对比度不到 7:1 时，保持色相往白或往黑推。
 * 用户选的那一侧推到头也不够时，才换到另一侧的蓝图墨（浅墨 / 深墨，同样只推到够用为止）。
 * 中间调的纸两侧都到不了 7:1：选余量大的一侧，停在接近极限的地方，不变成纯黑纯白。
 */
export function resolveInk(paper: string, line: string): string {
  if (contrast(paper, line) >= INK_TARGET) return line
  const lightMax = contrast(paper, '#ffffff')
  const darkMax = contrast(paper, '#000000')
  const lineLight = luminance(line) >= luminance(paper)
  // 线条色和纸几乎一样时它没有「方向」可言，直接按余量选一侧的蓝图墨。
  const usable = contrast(paper, line) >= 2
  let light = usable ? lineLight : lightMax >= darkMax
  if ((light ? lightMax : darkMax) < INK_TARGET) light = (light ? darkMax : lightMax) >= INK_TARGET ? !light : lightMax >= darkMax
  const max = light ? lightMax : darkMax
  const from = usable && light === lineLight ? line : light ? LIGHT_INK : DARK_INK
  const target = Math.min(INK_TARGET, Math.max(4.5, max * 0.96))
  return pushInk(paper, from, light ? '#ffffff' : '#000000', target)
}

/** 一个颜色在几种底色上最差的那个对比度。 */
function worstContrast(surfaces: string[], tone: string): number {
  return Math.min(...surfaces.map((surface) => contrast(surface, tone)))
}

/** 从纸色往墨色走，找到第一个在所有底色上都达标的层级：次要文字再淡也要可读。 */
function readableTone(paper: string, surfaces: string[], ink: string, start: number, min: number): string {
  for (let t = start; t < 1; t += 0.02) {
    const tone = mix(paper, ink, t)
    if (worstContrast(surfaces, tone) >= min) return tone
  }
  return ink
}

export interface ThemeOptions {
  paper: string
  lineColor: string
  gridSize: number
  fontPairing: string
}

export function themeStyle(options: ThemeOptions): CSSProperties {
  const font = FONT_PAIRS[options.fontPairing as FontPairing] ?? FONT_PAIRS.drafting
  const paper = options.paper
  const ink = resolveInk(paper, options.lineColor)
  const dark = luminance(paper) < luminance(ink)
  const grid = Math.max(8, options.gridSize)
  // 晒图纸的边缘总是更深一些：深纸往黑色压（墨更显眼）；浅纸往墨色压，但压到墨在最深的底上还有 4.5:1 为止。
  let deep = mix(paper, '#000000', 0.28)
  if (!dark) {
    let amount = 0.1
    while (amount > 0 && contrast(mix(paper, ink, amount * 0.6), ink) < 4.5) amount -= 0.01
    deep = mix(paper, ink, Math.max(0, amount))
  }
  // 次要文字也会落在加深的底上（地图、估价器、配置面板、命令框、首屏暗角），最深处大约是从纸往 deep 走六成。
  const surfaces = [paper, mix(paper, deep, 0.6)]
  const muted = readableTone(paper, surfaces, ink, 0.68, 4.5)
  // 次要正文取墨和弱文字的几何中点：墨 : 次要 和 次要 : 弱 的对比度一样，三层间距均匀。
  const soft = readableTone(paper, surfaces, ink, 0.86, Math.sqrt(worstContrast(surfaces, ink) * worstContrast(surfaces, muted)))
  return {
    '--paper': paper,
    '--paper-deep': deep,
    '--ink': ink,
    '--ink-soft': soft,
    '--ink-muted': muted,
    '--rule': alpha(ink, 0.62),
    '--hair': alpha(ink, 0.3),
    '--faint': alpha(ink, 0.12),
    '--grid-minor': alpha(ink, dark ? 0.065 : 0.08),
    '--grid-major': alpha(ink, dark ? 0.13 : 0.15),
    '--grid': `${grid}px`,
    '--grid-major-size': `${grid * 5}px`,
    '--bp-display': font.display,
    '--bp-body': font.body,
    '--bp-mono': font.mono,
    '--display-weight': font.weight,
    '--display-tracking': font.tracking,
    '--hs': font.scale,
    '--background': paper,
    '--foreground': ink,
    '--border': alpha(ink, 0.3),
    fontFamily: font.body,
    backgroundColor: paper,
    color: ink,
    colorScheme: dark ? 'dark' : 'light',
  } as CSSProperties
}

/** 品牌名转成 CLI 命令名：只保留字母数字。 */
export function cliName(brand: string): string {
  const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '')
  return slug || 'edge'
}
