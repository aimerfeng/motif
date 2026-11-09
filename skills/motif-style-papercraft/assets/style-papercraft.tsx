import { cn, cssVars, type CSSVariables } from '@/lib/motif-runtime'
import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'

/* @motif:defaults */
export const defaults = {
  palette: ['#ef7b45', '#2a7c71', '#f4c04e', '#be3f58', '#86b9dc'],
  layerDepth: 1,
  edge: 'wave',
  texture: 0.5,
  radius: 14,
  fontPairing: 'fraunces',
  dark: false,
}
/* @motif:end */

export type PapercraftProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export type Edge = 'wave' | 'zigzag' | 'scallop' | 'torn'
const EDGES: readonly Edge[] = ['wave', 'zigzag', 'scallop', 'torn']
/** 卡纸色的序号：1 是主色，依次往后；调色板少于 6 色时循环使用。 */
export type Tone = 1 | 2 | 3 | 4 | 5 | 6

// ---------- 颜色 ----------

const INK_DARK = '#221c17'
const INK_LIGHT = '#fffaf1'

/** 中性色：奶油色卡纸底、米白纸面、暖黑墨色；深色模式换成墨蓝卡纸。阴影是暖棕色，不是灰色。 */
const NEUTRALS = {
  light: { ground: '#f3ebdc', surface: '#fffaf1', ink: '#2b241f', muted: '#62564a', well: '#e7dcc9', cloud: '#fffaf1', night: '#fbf3e4', shade: '84 58 32', alpha: 1, skyBase: '#fffaf1', skyMix: 0.22 },
  dark: { ground: '#1b1f2c', surface: '#282d3e', ink: '#f5eee2', muted: '#aba293', well: '#131622', cloud: '#3a405a', night: '#fbf3e4', shade: '2 4 10', alpha: 1.7, skyBase: '#151a28', skyMix: 0.2 },
} as const

const PAIRINGS: Record<string, { head: string; body: string; weight: number; track: string }> = {
  fraunces: { head: "'Fraunces Variable', ui-serif, Georgia, serif", body: "'Plus Jakarta Sans Variable', ui-sans-serif, system-ui, sans-serif", weight: 800, track: '-0.03em' },
  bricolage: { head: "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif", body: "'Manrope Variable', ui-sans-serif, system-ui, sans-serif", weight: 800, track: '-0.035em' },
  outfit: { head: "'Outfit Variable', ui-sans-serif, system-ui, sans-serif", body: "'Outfit Variable', ui-sans-serif, system-ui, sans-serif", weight: 700, track: '-0.03em' },
  dmserif: { head: "'DM Serif Display', ui-serif, Georgia, serif", body: "'Outfit Variable', ui-sans-serif, system-ui, sans-serif", weight: 400, track: '-0.01em' },
}

const CJK = "'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

function rgbOf(hex: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})/i.exec(hex)
  const n = match ? parseInt(match[1]!, 16) : 0x808080
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toLinear = (v: number) => {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const toByte = (c: number) => Math.round(Math.max(0, Math.min(1, c <= 0.0031308 ? 12.92 * c : 1.055 * Math.max(0, c) ** (1 / 2.4) - 0.055)) * 255)
const toHex = (rgb: number[]) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`

function luminance(hex: string): number {
  const [r, g, b] = rgbOf(hex).map(toLinear)
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

/** WCAG 对比度。 */
export function contrast(a: string, b: string): number {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

function toOklab(hex: string): [number, number, number] {
  const [r, g, b] = rgbOf(hex).map(toLinear) as [number, number, number]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}

function fromOklab(L: number, a: number, b: number): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return toHex([4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(toByte))
}

/** 在一张卡纸上选对比度更高的墨色。 */
export function inkOn(hex: string): string {
  return contrast(hex, INK_DARK) >= contrast(hex, INK_LIGHT) ? INK_DARK : INK_LIGHT
}

/** sRGB 线性混色，t=1 时完全是 b。SVG 的 fill 需要具体颜色，所以在 JS 里算。 */
export function mixHex(a: string, b: string, t: number): string {
  const ca = rgbOf(a)
  const cb = rgbOf(b)
  return toHex(ca.map((v, i) => Math.round(v + (cb[i]! - v) * t)))
}

/** 留一点余量，十六进制取整之后也稳过 4.5:1。 */
const AA = 4.55

/** 二分查找：pass(t) 在 t=1 处成立、随 t 减小在某处失效时，返回成立的最小 t。 */
function threshold(pass: (t: number) => boolean): number {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2
    if (pass(mid)) hi = mid
    else lo = mid
  }
  return hi
}

/**
 * 能放字的卡纸：两种墨色都到不了 4.5:1 的中间调卡纸（例如 #2e8b7f 这种青绿），
 * 在 OKLab 里只改明度、保留色相和彩度，往墨色的反方向推到刚好达标。
 * muted 是这张纸上的次要文字：从墨色往纸色最多靠 30%，但仍保持 4.5:1。
 */
export function textSafe(hex: string): { fill: string; on: string; muted: string } {
  const on = inkOn(hex)
  let fill = hex
  if (contrast(hex, on) < AA) {
    const [L, a, b] = toOklab(hex)
    const target = on === INK_DARK ? 1 : 0
    const at = (t: number) => fromOklab(L + (target - L) * t, a, b)
    fill = at(threshold((t) => contrast(at(t), on) >= AA))
  }
  const away = (t: number) => mixHex(on, fill, 0.3 * (1 - t))
  return { fill, on, muted: away(threshold((t) => contrast(away(t), fill) >= AA)) }
}

// ---------- 刀模（边缘形状） ----------

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f1 = (n: number) => Math.round(n * 10) / 10

function svgUrl(markup: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(markup)}")`
}

/** 横向平铺的边缘贴片：边缘在上，下方填满；bottom 版本上下翻转。 */
const TILE: Record<Edge, { w: number; h: number }> = {
  wave: { w: 64, h: 16 },
  zigzag: { w: 22, h: 12 },
  scallop: { w: 32, h: 13 },
  torn: { w: 380, h: 18 },
}

function tornLine(w: number, h: number, seed: number): { face: [number, number][]; rim: [number, number][] } {
  const rand = rng(seed)
  const face: [number, number][] = []
  const rim: [number, number][] = []
  let x = 0
  let off = 0
  while (x < w) {
    off = off * 0.55 + (rand() - 0.5) * h * 0.5
    const y = Math.min(h - 2, Math.max(5, h * 0.55 + off))
    face.push([x, y])
    rim.push([x, Math.max(0.5, y - 2 - rand() * 3.2)])
    x += 3 + rand() * 8
  }
  // 首尾同高，平铺时没有接缝。
  face.push([w, face[0]![1]])
  rim.push([w, rim[0]![1]])
  return { face, rim }
}

function tilePath(edge: Edge, w: number, h: number): string {
  if (edge === 'wave') return `M0 ${h}V${h * 0.6}Q${w / 4} ${h * 0.02} ${w / 2} ${h * 0.6}T${w} ${h * 0.6}V${h}Z`
  if (edge === 'zigzag') return `M0 ${h}V${h - 1}L${w / 2} 1L${w} ${h - 1}V${h}Z`
  return `M0 ${h}V${h - 1}A${w / 2} ${h - 2} 0 0 1 ${w} ${h - 1}V${h}Z`
}

function polyTile(points: [number, number][], h: number): string {
  return `M0 ${h}${points.map(([x, y]) => `L${f1(x)} ${f1(y)}`).join('')}L${points[points.length - 1]![0]} ${h}Z`
}

function tileUrl(path: string, w: number, h: number, flip: boolean): string {
  const body = flip ? `<g transform='matrix(1 0 0 -1 0 ${h})'><path d='${path}'/></g>` : `<path d='${path}'/>`
  return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}' preserveAspectRatio='none'>${body}</svg>`)
}

function buildTiles(edge: Edge): CSSVariables {
  const t = TILE[edge]
  const torn = TILE.torn
  const line = tornLine(torn.w, torn.h, 11)
  const cut = edge === 'torn' ? polyTile(line.face, torn.h) : tilePath(edge, t.w, t.h)
  const face = polyTile(line.face, torn.h)
  const rim = polyTile(line.rim, torn.h)
  return {
    '--pc-tw': `${t.w}px`,
    '--pc-th': `${t.h}px`,
    '--pc-tile-top': tileUrl(cut, t.w, t.h, false),
    '--pc-tile-bottom': tileUrl(cut, t.w, t.h, true),
    '--pc-ttw': `${torn.w}px`,
    '--pc-tth': `${torn.h}px`,
    '--pc-torn-top': tileUrl(face, torn.w, torn.h, false),
    '--pc-torn-bottom': tileUrl(face, torn.w, torn.h, true),
    '--pc-rim-top': tileUrl(rim, torn.w, torn.h, false),
    '--pc-rim-bottom': tileUrl(rim, torn.w, torn.h, true),
  }
}

/** 圆形模切轮廓（太阳、圆贴纸）：半径 R，齿深 amp，圆心 (c, c)。 */
export function sealPath(edge: Edge, R: number, amp: number, c = 50, seed = 3): string {
  const pts: string[] = []
  const at = (r: number, a: number) => pts.push(`${f1(c + r * Math.cos(a))} ${f1(c + r * Math.sin(a))}`)
  if (edge === 'zigzag') {
    const n = 26
    for (let i = 0; i < n * 2; i++) at(i % 2 ? R - amp : R, (i * Math.PI) / n)
  } else if (edge === 'wave') {
    const n = 11
    const steps = n * 14
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2
      at(R - amp / 2 + (amp / 2) * Math.cos(n * a), a)
    }
  } else if (edge === 'scallop') {
    const n = 15
    const per = 10
    for (let i = 0; i < n * per; i++) at(R - amp + amp * Math.sin(((i % per) / per) * Math.PI) ** 0.6, (i / (n * per)) * Math.PI * 2)
  } else {
    const rand = rng(seed)
    const steps = 120
    let off = 0
    for (let i = 0; i < steps; i++) {
      off = off * 0.5 + (rand() - 0.5) * amp
      at(R - amp * 0.5 + Math.max(-amp * 0.5, Math.min(amp * 0.5, off)), (i / steps) * Math.PI * 2)
    }
  }
  return `M${pts.join('L')}Z`
}

// ---------- 纸纤维 ----------

/** 一块 300px 的颗粒贴片：细小纸屑 + 拉长的纤维。不用混合模式，只是半透明的点和线，开销很小。 */
function grainUrl(texture: number, dark: boolean): string {
  if (texture <= 0) return 'none'
  const fleck = dark ? '0 0 0 0 1 0 0 0 0 0.97 0 0 0 0 0.9' : '0 0 0 0 0.27 0 0 0 0 0.18 0 0 0 0 0.09'
  const fibre = dark ? '0 0 0 0 1 0 0 0 0 0.96 0 0 0 0 0.88' : '0 0 0 0 0.36 0 0 0 0 0.25 0 0 0 0 0.12'
  const band = `${'0 '.repeat(12)}1${' 0'.repeat(12)}`
  const a1 = f1((dark ? 0.42 : 0.56) * texture * 100) / 100
  const a2 = f1((dark ? 0.32 : 0.4) * texture * 100) / 100
  // 纤维：噪声的等值线是细长的曲线，再用一层稀疏的斑块遮住大半，只留下一段段短纤维。
  return svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>` +
      `<filter id='f' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix values='${fleck} 3.2 0 0 0 -1.9'/></filter>` +
      `<filter id='g' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves='2' seed='4' stitchTiles='stitch'/><feColorMatrix values='${fibre} 1 0 0 0 0'/><feComponentTransfer result='l'><feFuncA type='table' tableValues='${band}'/></feComponentTransfer>` +
      `<feTurbulence type='fractalNoise' baseFrequency='0.07' numOctaves='1' seed='9' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 5 0 0 0 -3'/><feComposite in='l' operator='in'/></filter>` +
      `<rect width='300' height='300' filter='url(#f)' opacity='${a1}'/><rect width='300' height='300' filter='url(#g)' opacity='${a2}'/></svg>`,
  )
}

// ---------- 上下文 ----------

interface PaperContext {
  palette: string[]
  edge: Edge
  dark: boolean
  ground: string
  surface: string
  sky: string
  cloud: string
}

const Ctx = createContext<PaperContext>({
  palette: defaults.palette,
  edge: 'wave',
  dark: false,
  ground: NEUTRALS.light.ground,
  surface: NEUTRALS.light.surface,
  sky: mixHex(NEUTRALS.light.skyBase, defaults.palette[4]!, NEUTRALS.light.skyMix),
  cloud: NEUTRALS.light.cloud,
})

/** 子组件读取当前的卡纸颜色、刀模和明暗。 */
export function usePaper(): PaperContext {
  return useContext(Ctx)
}

const toneOf = (palette: string[], tone: number) => palette[(tone - 1) % palette.length]!

// ---------- 样式 ----------

const SH = (a: number) => `rgb(var(--pc-shade) / calc(${a} * var(--pc-sa)))`
const D = (px: number) => `calc(${px}px * var(--pc-d))`

const CSS = `@layer components{
.pc{position:relative;isolation:isolate;min-height:100%;overflow-x:clip;color:var(--pc-ink);background-color:var(--pc-ground);font-family:var(--pc-body),${CJK};font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased;
  --e0:0 1px 1px ${SH(0.1)};
  --e1:0 1px 1px ${SH(0.14)},0 ${D(2)} ${D(4)} ${SH(0.12)};
  --e2:0 1px 1px ${SH(0.12)},0 ${D(3)} ${D(6)} ${SH(0.14)},0 ${D(12)} ${D(22)} ${D(-6)} ${SH(0.22)};
  --e3:0 2px 2px ${SH(0.12)},0 ${D(8)} ${D(14)} ${SH(0.16)},0 ${D(26)} ${D(40)} ${D(-10)} ${SH(0.3)};
  --f2:drop-shadow(0 ${D(2)} ${D(3)} ${SH(0.2)}) drop-shadow(0 ${D(10)} ${D(14)} ${SH(0.16)});
  --ctl:calc(var(--pc-r) * .7)}
.pc *,.pc *::before,.pc *::after{box-sizing:border-box}
.pc ::selection{background:var(--pc-f3);color:var(--pc-on3)}
.pc :focus-visible{outline:2.5px solid var(--pc-ink);outline-offset:3px}
.pc-grain{position:absolute;inset:0;z-index:40;pointer-events:none;background-image:var(--pc-grain);background-size:300px 300px}
.pc-wrap{position:relative;width:100%;max-width:1200px;margin:0 auto;padding:0 24px}
@media (max-width:640px){.pc-wrap{padding:0 16px}}

/* 文字 */
.pc-display,.pc-h2,.pc-h3{margin:0;font-family:var(--pc-head),${CJK};font-weight:var(--pc-hw);letter-spacing:var(--pc-track);text-wrap:balance}
.pc-display{line-height:1.02}
.pc-h2{line-height:1.08}
.pc-h3{line-height:1.2;font-size:1.25rem;letter-spacing:calc(var(--pc-track) * .5)}
.pc-label{display:block;margin:0;font:800 .72rem/1.3 var(--pc-body),${CJK};letter-spacing:.12em;text-transform:uppercase;color:var(--pc-muted)}
.pc-muted{color:var(--pc-muted)}
.pc-link{color:inherit;font-weight:700;text-decoration:underline wavy var(--pc-c1);text-decoration-thickness:1.5px;text-underline-offset:4px}

/* 纸面：不透明，靠颜色和投影与下层分开，没有描边 */
.pc-sheet{position:relative;border-radius:var(--pc-r);background-color:var(--fill,var(--pc-surface));color:var(--on,var(--pc-ink));box-shadow:var(--e2)}
.pc-sheet[data-lift="0"]{box-shadow:var(--e0)}.pc-sheet[data-lift="1"]{box-shadow:var(--e1)}.pc-sheet[data-lift="3"]{box-shadow:var(--e3)}
.pc-stack{position:relative;isolation:isolate}
.pc-stack>.pc-under{position:absolute;inset:0;z-index:-1;border-radius:var(--pc-r);box-shadow:var(--e1)}
.pc-stack>.pc-under:nth-child(1){background:var(--b1);transform:translate(${D(7)},${D(8)}) rotate(1.8deg)}
.pc-stack>.pc-under:nth-child(2){background:var(--b2);transform:translate(${D(-6)},${D(5)}) rotate(-1.5deg)}
.pc-stack>.pc-sheet{height:100%}

/* 按钮：卡纸 + 底下一层更深的同色纸 */
.pc-btn{--fill:var(--pc-f1);--on:var(--pc-on1);--base:color-mix(in oklab,var(--fill) 70%,#1a120c);--h:46px;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.55em;height:var(--h);padding:0 1.3em;border:0;border-radius:var(--ctl);
  background-color:var(--fill);color:var(--on);font:750 .95rem/1 var(--pc-body),${CJK};letter-spacing:-.005em;white-space:nowrap;cursor:pointer;text-decoration:none;
  box-shadow:0 ${D(3)} 0 var(--base),0 ${D(5)} ${D(9)} ${SH(0.26)};transition:transform .18s cubic-bezier(.3,1.4,.5,1),box-shadow .18s ease,background-color .18s ease}
.pc-btn:hover{transform:translateY(-1px);box-shadow:0 ${D(4)} 0 var(--base),0 ${D(8)} ${D(14)} ${SH(0.3)}}
.pc-btn:active{transform:translateY(${D(2.5)});box-shadow:0 ${D(0.5)} 0 var(--base),0 1px 2px ${SH(0.24)}}
.pc-btn[data-size=sm]{--h:36px;padding:0 1em;font-size:.84rem}
.pc-btn[data-size=lg]{--h:54px;padding:0 1.6em;font-size:1.04rem}
.pc-btn[data-variant=secondary]{--fill:var(--pc-surface);--on:var(--pc-ink);--base:color-mix(in oklab,var(--pc-surface) 78%,#5a3f22)}
.pc[data-dark=true] .pc-btn[data-variant=secondary]{--fill:color-mix(in oklab,var(--pc-surface) 88%,var(--pc-ink));--base:color-mix(in oklab,var(--pc-surface) 62%,#05060c)}
.pc-btn[data-variant=plain]{--fill:transparent;--on:inherit;box-shadow:none;padding:0 .8em}
.pc-btn[data-variant=plain]:hover{background-color:color-mix(in oklab,currentColor 9%,transparent);transform:none}
.pc-btn[data-variant=plain]:active{transform:none}
.pc-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:0 1px 0 var(--base)}
.pc-btn svg{flex:none}

/* 输入框：纸上裁出的窗口，露出下面更深的一层 */
.pc-field{display:grid;gap:7px}
.pc-field-label{font:700 .86rem/1.3 var(--pc-body),${CJK}}
.pc-field-hint{font-size:.8rem;color:var(--pc-muted)}
.pc-input{width:100%;height:48px;padding:0 14px;border:0;border-radius:calc(var(--pc-r) * .6);background-color:var(--pc-well);color:var(--pc-ink);font:500 1rem var(--pc-body),${CJK};
  box-shadow:inset 0 ${D(2)} ${D(3)} ${SH(0.24)},inset 0 -1px 0 rgb(255 255 255 / .35);transition:box-shadow .16s ease,background-color .16s ease}
.pc-input::placeholder{color:var(--pc-mute);opacity:1}
.pc-input:hover{background-color:color-mix(in oklab,var(--pc-well) 94%,var(--pc-ink))}
.pc-input:focus{outline:2.5px solid var(--pc-ink);outline-offset:2px}

/* 贴纸：半切贴纸，外圈一道纸白色的边 */
.pc-tag{--fill:var(--pc-f1);--on:var(--pc-on1);display:inline-flex;align-items:center;gap:.4em;height:28px;padding:0 .8em;border-radius:999px;background-color:var(--fill);color:var(--on);font:800 .74rem/1 var(--pc-body),${CJK};letter-spacing:.02em;white-space:nowrap;
  box-shadow:0 0 0 2.5px var(--pc-paper),0 ${D(2)} ${D(4)} 2px ${SH(0.2)}}
.pc-seal{position:relative;display:inline-grid;place-items:center;flex:none;color:var(--on);text-align:center}
.pc-seal>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 ${D(2)} ${D(3)} ${SH(0.26)})}
.pc-seal>span{position:relative;font:var(--pc-hw) .8em/1.05 var(--pc-head),${CJK};letter-spacing:.02em;text-transform:uppercase}
.pc-seal>span>b{display:block;font-size:1.65em;line-height:1;margin:.08em 0 .06em}

/* 文件夹标签页 */
.pc-tabs{position:relative;isolation:isolate}
.pc-tablist{display:flex;gap:4px;padding:0 14px}
.pc-tab{--fill:var(--pc-f1);--on:var(--pc-on1);position:relative;z-index:0;flex:none;height:50px;margin-bottom:-6px;padding:0 18px 6px;border:0;border-radius:var(--ctl) var(--ctl) 0 0;background-color:var(--fill);color:var(--on);
  font:750 .9rem/1 var(--pc-body),${CJK};cursor:pointer;transform:translateY(7px);box-shadow:0 -1px 3px ${SH(0.14)};transition:transform .2s cubic-bezier(.3,1.4,.5,1),background-color .2s ease}
.pc-tab:hover{transform:translateY(3px)}
.pc-tab[aria-selected=true]{z-index:2;background-color:var(--pc-surface);color:var(--pc-ink);transform:translateY(0)}
.pc-tabpanel{position:relative;z-index:1;padding:22px;border-radius:var(--pc-r);background-color:var(--pc-surface);color:var(--pc-ink);box-shadow:var(--e2)}

/* 开关：槽是裁出来的，滑块是一枚纸片圆 */
.pc-switch{position:relative;flex:none;width:54px;height:30px;padding:0;border:0;border-radius:999px;background-color:var(--pc-well);cursor:pointer;box-shadow:inset 0 ${D(2)} ${D(3)} ${SH(0.26)};transition:background-color .2s ease}
.pc-switch::after{content:'';position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:var(--pc-paper);box-shadow:0 ${D(2)} ${D(3)} ${SH(0.34)};transition:transform .25s cubic-bezier(.3,1.5,.5,1)}
.pc-switch[aria-checked=true]{background-color:var(--pc-c2)}
.pc-switch[aria-checked=true]::after{transform:translateX(24px)}

/* 便签：带一枚圆钉的有色纸，右下角折起（折角露出的是后面那张纸的颜色） */
.pc-note{--behind:var(--fill,var(--pc-ground));position:relative;display:flex;gap:14px;padding:20px 24px 20px 20px;border-radius:calc(var(--pc-r) * .5) calc(var(--pc-r) * .5) 0 calc(var(--pc-r) * .5);color:var(--note-on);
  background-color:var(--note-bg);box-shadow:var(--e1);transform:rotate(-.6deg)}
.pc-note::after{content:'';position:absolute;right:0;bottom:0;width:24px;height:24px;background:linear-gradient(315deg,var(--behind) 50%,var(--note-fold) 50%)}
.pc-brad{flex:none;width:18px;height:18px;margin-top:2px;border-radius:50%;background:radial-gradient(circle at 35% 30%,color-mix(in oklab,var(--pc-c1) 55%,#fff),var(--pc-c1) 60%);box-shadow:0 ${D(2)} ${D(3)} ${SH(0.35)}}
.pc-note-title{margin:0;font:800 .98rem/1.3 var(--pc-body),${CJK}}
.pc-note-body{margin:.25rem 0 0;font-size:.9rem;line-height:1.5}

/* 进度：裁出的槽 + 一条剪下来的纸条 */
.pc-progress{position:relative;height:16px;border-radius:999px;background-color:var(--pc-well);box-shadow:inset 0 ${D(2)} ${D(3)} ${SH(0.24)};overflow:hidden}
.pc-progress>span{position:absolute;inset:3px auto 3px 3px;border-radius:999px;background-color:var(--fill,var(--pc-c1));box-shadow:0 1px 2px ${SH(0.3)}}

/* 色带：整幅宽的卡纸，上下边缘是模切或手撕边；投影跟着轮廓走 */
.pc-band{position:relative;background-color:var(--fill);color:var(--on);filter:var(--f2)}
.pc-strip{position:absolute;left:0;right:0;height:var(--pc-th);background-color:var(--fill);pointer-events:none;-webkit-mask-repeat:repeat-x;mask-repeat:repeat-x;-webkit-mask-size:var(--pc-tw) 100%;mask-size:var(--pc-tw) 100%}
.pc-strip[data-side=top]{bottom:calc(100% - 1px);-webkit-mask-image:var(--pc-tile-top);mask-image:var(--pc-tile-top)}
.pc-strip[data-side=bottom]{top:calc(100% - 1px);-webkit-mask-image:var(--pc-tile-bottom);mask-image:var(--pc-tile-bottom)}
.pc-strip[data-kind=torn],.pc-strip[data-kind=rim]{height:var(--pc-tth);-webkit-mask-size:var(--pc-ttw) 100%;mask-size:var(--pc-ttw) 100%}
.pc-strip[data-kind=rim]{background-color:var(--pc-paper)}
.pc-strip[data-kind=torn][data-side=top]{-webkit-mask-image:var(--pc-torn-top);mask-image:var(--pc-torn-top)}
.pc-strip[data-kind=torn][data-side=bottom]{-webkit-mask-image:var(--pc-torn-bottom);mask-image:var(--pc-torn-bottom)}
.pc-strip[data-kind=rim][data-side=top]{-webkit-mask-image:var(--pc-rim-top);mask-image:var(--pc-rim-top)}
.pc-strip[data-kind=rim][data-side=bottom]{-webkit-mask-image:var(--pc-rim-bottom);mask-image:var(--pc-rim-bottom)}

/* 纸景：一层一层的山，阴影向上投到后一层上 */
.pc-hills{position:relative;pointer-events:none;clip-path:inset(-80% 0 -3px 0)}
.pc-hills>svg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 ${D(-1.5)} ${D(6)} ${SH(0.3)})}
.pc-sun{display:block;overflow:visible;filter:drop-shadow(0 ${D(3)} ${D(5)} ${SH(0.28)})}

@media (prefers-reduced-motion:reduce){.pc-btn,.pc-tab,.pc-switch,.pc-switch::after,.pc-input{transition:none}.pc-btn:hover:not(:active){transform:none}.pc-tab:not([aria-selected=true]):hover{transform:translateY(7px)}}
}`

// ---------- 根组件 ----------

/** 风格根节点：把参数写成 CSS 变量，铺一层纸纤维；子组件都读这些变量。 */
export function Papercraft({ className, style, children, ...props }: PapercraftProps) {
  const o = { ...defaults, ...props }
  const palette = o.palette.length > 0 ? o.palette.map((c) => c.slice(0, 7)) : defaults.palette
  const edge: Edge = EDGES.includes(o.edge as Edge) ? (o.edge as Edge) : 'wave'
  const n = o.dark ? NEUTRALS.dark : NEUTRALS.light
  const pair = PAIRINGS[o.fontPairing] ?? PAIRINGS.fraunces!
  const tiles = useMemo(() => buildTiles(edge), [edge])
  const grain = useMemo(() => grainUrl(o.texture, o.dark), [o.texture, o.dark])
  // 天空色取最后一张卡纸；首屏的次要文字直接压在天空上，所以颜色太深时往底色退，直到文字仍有 4.5:1。
  const tinted = mixHex(n.skyBase, palette[palette.length - 1]!, n.skyMix)
  const sky = mixHex(n.skyBase, tinted, 1 - threshold((t) => contrast(n.muted, mixHex(n.skyBase, tinted, 1 - t)) >= AA))
  const paletteKey = palette.join(',')
  const context = useMemo<PaperContext>(
    () => ({ palette: paletteKey.split(','), edge, dark: o.dark, ground: n.ground, surface: n.surface, sky, cloud: n.cloud }),
    [paletteKey, edge, o.dark, n, sky],
  )

  const vars: CSSVariables = {
    ...tiles,
    '--pc-ground': n.ground,
    '--pc-surface': n.surface,
    '--pc-paper': '#fffaf1',
    '--pc-ink': n.ink,
    '--pc-mute': n.muted,
    '--pc-muted': n.muted,
    '--pc-well': n.well,
    '--pc-sky': sky,
    '--pc-shade': n.shade,
    '--pc-sa': n.alpha,
    '--pc-d': o.layerDepth,
    '--pc-r': `${o.radius}px`,
    '--pc-head': pair.head,
    '--pc-body': pair.body,
    '--pc-hw': pair.weight,
    '--pc-track': pair.track,
    '--pc-grain': grain,
  }
  // c 是原样的卡纸色（山、太阳、开关槽这类不放字的地方）；f / on / m 是放字时用的纸色、墨色和次要墨色。
  for (let i = 1; i <= 6; i++) {
    const c = toneOf(palette, i)
    const safe = textSafe(c)
    vars[`--pc-c${i}`] = c
    vars[`--pc-f${i}`] = safe.fill
    vars[`--pc-on${i}`] = safe.on
    vars[`--pc-m${i}`] = safe.muted
  }

  return (
    <Ctx.Provider value={context}>
      <div className={cn('pc', className)} data-dark={o.dark ? 'true' : 'false'} style={cssVars(vars, style)}>
        <style>{CSS}</style>
        {children}
        <div className="pc-grain" aria-hidden />
      </div>
    </Ctx.Provider>
  )
}

/** 一张纸的填色、墨色和次要墨色；`.pc-muted`、`.pc-label` 读 --pc-muted，所以放在彩色纸上也不会变淡到读不清。 */
const toneVars = (tone: Tone | 'surface' | 'ground'): CSSVariables =>
  tone === 'surface' || tone === 'ground'
    ? { '--fill': `var(--pc-${tone})`, '--on': 'var(--pc-ink)', '--pc-muted': 'var(--pc-mute)' }
    : { '--fill': `var(--pc-f${tone})`, '--on': `var(--pc-on${tone})`, '--pc-muted': `var(--pc-m${tone})` }

// ---------- 基础组件 ----------

export type SheetProps = HTMLAttributes<HTMLDivElement> & {
  /** 纸的颜色：surface 是米白纸面，数字是卡纸色。 */
  tone?: Tone | 'surface'
  /** 层级：0 贴着底，1 卡片，2 抬起（默认），3 浮起。 */
  lift?: 0 | 1 | 2 | 3
  /** 在背后垫两张错开的卡纸。 */
  stack?: [Tone, Tone]
}

/** 一张纸。`stack` 时外层是包裹元素，className 和 style 加在外层上。 */
export function Sheet({ tone = 'surface', lift = 2, stack, className, style, ...rest }: SheetProps) {
  if (!stack) return <div className={cn('pc-sheet', className)} data-lift={lift} style={cssVars(toneVars(tone), style)} {...rest} />
  return (
    <div className={cn('pc-stack', className)} style={cssVars({ '--b1': `var(--pc-c${stack[0]})`, '--b2': `var(--pc-c${stack[1]})` }, style)}>
      <span className="pc-under" aria-hidden />
      <span className="pc-under" aria-hidden />
      <div className="pc-sheet" data-lift={lift} style={cssVars(toneVars(tone))} {...rest} />
    </div>
  )
}

type ButtonLook = {
  variant?: 'primary' | 'secondary' | 'plain'
  size?: 'sm' | 'md' | 'lg'
  /** primary 按钮换一种卡纸色。 */
  tone?: Tone
}

/** 有 href 时渲染成链接（导航、跳转），外观相同；没有时是 button。 */
export type PaperButtonProps = ButtonLook & ((ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }) | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }))

export function PaperButton({ variant = 'primary', size = 'md', tone, className, style, ...rest }: PaperButtonProps) {
  const look = {
    className: cn('pc-btn', className),
    'data-variant': variant,
    'data-size': size,
    style: cssVars(variant === 'primary' && tone ? toneVars(tone) : {}, style),
  }
  if (typeof rest.href === 'string') return <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} {...look} />
  const { type = 'button', ...button } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return <button type={type} {...button} {...look} />
}

export type PaperInputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }

export function PaperInput({ label, hint, className, id, ...rest }: PaperInputProps) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className={cn('pc-field', className)}>
      <label className="pc-field-label" htmlFor={inputId}>
        {label}
      </label>
      <input id={inputId} className="pc-input" aria-describedby={hint ? `${inputId}-hint` : undefined} {...rest} />
      {hint ? (
        <span id={`${inputId}-hint`} className="pc-field-hint">
          {hint}
        </span>
      ) : null}
    </div>
  )
}

export function Tag({ tone = 1, className, style, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone | 'surface' }) {
  return <span className={cn('pc-tag', className)} style={cssVars(toneVars(tone), style)} {...rest} />
}

export type SealProps = HTMLAttributes<HTMLSpanElement> & { tone?: Tone; size?: number; tilt?: number }

/** 圆形模切贴纸：轮廓跟随当前刀模，外圈一道纸白色的边。 */
export function Seal({ tone = 1, size = 104, tilt = -8, className, style, children, ...rest }: SealProps) {
  const { edge } = usePaper()
  const outer = useMemo(() => sealPath(edge, 50, edge === 'zigzag' ? 5 : 4.5, 50, 5), [edge])
  const inner = useMemo(() => sealPath(edge, 46.5, edge === 'zigzag' ? 5 : 4.5, 50, 5), [edge])
  return (
    <span className={cn('pc-seal', className)} style={cssVars(toneVars(tone), { width: size, height: size, transform: `rotate(${tilt}deg)`, fontSize: `${Math.max(0.92, size / 104)}rem`, ...style })} {...rest}>
      <svg viewBox="0 0 100 100" aria-hidden>
        <path d={outer} style={{ fill: 'var(--pc-paper)' }} />
        <path d={inner} style={{ fill: 'var(--fill)' }} />
        <circle cx="50" cy="50" r="33" fill="none" style={{ stroke: 'var(--on)' }} strokeOpacity=".35" strokeWidth="1.2" strokeDasharray="2.5 3" />
      </svg>
      <span>{children}</span>
    </span>
  )
}

export type FolderTabsProps = {
  items: { id: string; label: string; tone?: Tone; content: ReactNode }[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  label: string
  className?: string
}

/** 文件夹标签页：未选中的标签是彩色卡纸，塞在面板后面；选中的和面板同色、在最前。方向键切换。 */
export function FolderTabs({ items, value, defaultValue, onValueChange, label, className }: FolderTabsProps) {
  const [inner, setInner] = useState(defaultValue ?? items[0]?.id)
  const current = value ?? inner
  const index = Math.max(0, items.findIndex((item) => item.id === current))
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const base = useId()
  const select = (i: number, focus: boolean) => {
    const at = (i + items.length) % items.length
    setInner(items[at]!.id)
    onValueChange?.(items[at]!.id)
    if (focus) refs.current[at]?.focus()
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') select(index + 1, true)
    else if (event.key === 'ArrowLeft') select(index - 1, true)
    else if (event.key === 'Home') select(0, true)
    else if (event.key === 'End') select(items.length - 1, true)
    else return
    event.preventDefault()
  }
  const active = items[index]
  return (
    <div className={cn('pc-tabs', className)}>
      <div role="tablist" aria-label={label} className="pc-tablist" onKeyDown={onKeyDown}>
        {items.map((item, i) => (
          <button
            key={item.id}
            ref={(node) => {
              refs.current[i] = node
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={i === index}
            aria-controls={`${base}-panel`}
            tabIndex={i === index ? 0 : -1}
            className="pc-tab"
            style={cssVars(toneVars(item.tone ?? ((i % 6) + 1) as Tone))}
            onClick={() => select(i, false)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${index}`} className="pc-tabpanel" tabIndex={0}>
        {active?.content}
      </div>
    </div>
  )
}

export type PaperSwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }

export function PaperSwitch({ checked = false, onCheckedChange, className, ...rest }: PaperSwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('pc-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}

export type NoteProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & { title: string; tone?: Tone }

/**
 * 便签式提示：有色纸 + 圆钉 + 折角。浅色模式是淡淡染色的米白纸；深色模式下同样的淡染色会变成发灰的橄榄色，
 * 看起来像禁用状态，所以改成接近卡纸本色、略微提亮的一张便签，墨色按对比度重新选。
 */
export function Note({ title, tone = 3, className, style, children, ...rest }: NoteProps) {
  const { palette, dark, surface } = usePaper()
  const tint = toneOf(palette, tone)
  const paper = textSafe(dark ? mixHex(tint, '#fffaf1', 0.32) : mixHex(surface, tint, 0.2))
  const fold = dark ? mixHex(paper.fill, '#1a120c', 0.16) : mixHex(surface, tint, 0.46)
  return (
    <div role="note" className={cn('pc-note', className)} style={cssVars({ '--note-bg': paper.fill, '--note-on': paper.on, '--note-fold': fold }, style)} {...rest}>
      <span className="pc-brad" aria-hidden />
      <div>
        <p className="pc-note-title">{title}</p>
        {children ? <p className="pc-note-body">{children}</p> : null}
      </div>
    </div>
  )
}

export function PaperProgress({ value, max = 100, tone = 1, label, className }: { value: number; max?: number; tone?: Tone; label: string; className?: string }) {
  const pct = Math.max(0, Math.min(1, value / max))
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className={cn('pc-progress', className)} style={cssVars(toneVars(tone))}>
      <span style={{ width: `calc(${pct * 100}% - 6px)` }} />
    </div>
  )
}

function Strip({ side, kind }: { side: 'top' | 'bottom'; kind: 'edge' | 'torn' }) {
  if (kind === 'edge') return <span className="pc-strip" data-side={side} aria-hidden />
  return (
    <>
      <span className="pc-strip" data-side={side} data-kind="rim" aria-hidden />
      <span className="pc-strip" data-side={side} data-kind="torn" aria-hidden />
    </>
  )
}

export type CutBandProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone | 'surface' | 'ground'
  /** 上下边缘：edge 是当前刀模，torn 是带白色纸芯的撕纸边。 */
  top?: 'edge' | 'torn' | 'none'
  bottom?: 'edge' | 'torn' | 'none'
}

/** 整幅宽的色带。投影用 filter: drop-shadow，跟着模切轮廓走。 */
export function CutBand({ tone = 2, top = 'torn', bottom = 'edge', className, style, children, ...rest }: CutBandProps) {
  return (
    <div className={cn('pc-band', className)} style={cssVars(toneVars(tone), style)} {...rest}>
      {top !== 'none' ? <Strip side="top" kind={top} /> : null}
      {children}
      {bottom !== 'none' ? <Strip side="bottom" kind={bottom} /> : null}
    </div>
  )
}

// ---------- 纸景 ----------

function useBoxSize(ref: RefObject<HTMLElement | null>, fallback: { w: number; h: number }) {
  const [size, setSize] = useState(fallback)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const update = (w: number, h: number) =>
      setSize((s) => (Math.abs(s.w - w) < 1 && Math.abs(s.h - h) < 1 ? s : { w: Math.round(w), h: Math.round(h) }))
    const rect = element.getBoundingClientRect()
    update(rect.width, rect.height)
    const observer = new ResizeObserver(([entry]) => {
      if (entry) update(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return size
}

type Pt = [number, number]

/** 一条山脊：大起伏 base(x) 加上刀模的细节。所有长度都是像素，所以任何宽度下齿距都不变。 */
function ridge(edge: Edge, w: number, base: (x: number) => number, amp: number, len: number, rand: () => number): Pt[] {
  const pts: Pt[] = []
  if (edge === 'zigzag') {
    let x = -rand() * len
    let up = rand() > 0.5
    while (x < w + len) {
      pts.push([x, base(x) - (up ? amp * (0.55 + rand() * 0.45) : amp * rand() * 0.12)])
      x += len * (0.32 + rand() * 0.3)
      up = !up
    }
  } else if (edge === 'wave') {
    const p1 = rand() * 6.28
    const p2 = rand() * 6.28
    for (let x = -8; x <= w + 8; x += 6) pts.push([x, base(x) - amp * (0.5 + 0.5 * Math.sin((x / len) * 6.283 + p1)) * (0.7 + 0.3 * Math.sin((x / (len * 2.7)) * 6.283 + p2))])
  } else if (edge === 'scallop') {
    let x = -rand() * len
    while (x < w + len) {
      const bw = len * (0.8 + rand() * 0.45)
      const bh = amp * (0.7 + rand() * 0.45)
      for (let k = 0; k < 8; k++) {
        const xx = x + (bw * k) / 8
        pts.push([xx, base(xx) - bh * Math.sin((Math.PI * k) / 8) ** 0.55])
      }
      x += bw
    }
  } else {
    let off = 0
    for (let x = -6; x <= w + 12; x += 3 + rand() * 9) {
      off = off * 0.6 + (rand() - 0.5) * amp
      pts.push([x, base(x) - amp * 0.5 + off])
    }
  }
  return pts
}

function yAt(pts: Pt[], x: number): number {
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i]!
    const [x0, y0] = pts[i - 1]!
    if (x1 >= x) return y0 + ((y1 - y0) * (x - x0)) / Math.max(1e-6, x1 - x0)
  }
  return pts[pts.length - 1]![1]
}

const DETAIL: Record<Edge, { amp: number[]; len: number[] }> = {
  wave: { amp: [16, 18, 18, 15, 9], len: [230, 200, 170, 160, 260] },
  zigzag: { amp: [40, 46, 30, 24, 10], len: [120, 150, 100, 110, 46] },
  scallop: { amp: [14, 18, 16, 16, 9], len: [46, 58, 50, 64, 40] },
  torn: { amp: [9, 11, 11, 10, 7], len: [0, 0, 0, 0, 0] },
}

export type HillDecor = 'pines' | 'kelp' | 'cabin' | 'none'

export type PaperHillsProps = {
  className?: string
  style?: CSSProperties
  /** 换一组形状。 */
  seed?: number
  /** 把调色板的使用顺序往后挪几位。 */
  shift?: number
  /** 最前面一层的颜色：页面底色（默认）或纸面色。 */
  front?: 'ground' | 'surface'
  /** 天空色，用来给远山加雾；默认取当前天空色。 */
  sky?: string
  /** 背后四层的颜色（从远到近），例如水面或雪地；不给就按调色板和雾化规则取。 */
  colors?: string[]
  /** 中景那层上的剪纸小物：松树（默认）、海带、雪中小屋（带松树），或者不放。 */
  decor?: HillDecor
  /** 小物的颜色；默认从它所在那层的颜色压暗。 */
  decorColor?: string
}

type Shape = { d: string; fill: string }

const pine = (x: number, b: number, th: number) => {
  const tw = th * 0.56
  return `M${f1(x - tw / 2)} ${f1(b)}L${f1(x)} ${f1(b - th * 0.66)}L${f1(x + tw / 2)} ${f1(b)}ZM${f1(x - tw * 0.36)} ${f1(b - th * 0.42)}L${f1(x)} ${f1(b - th)}L${f1(x + tw * 0.36)} ${f1(b - th * 0.42)}Z`
}
const rect = (x: number, y: number, w: number, h: number) => `M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`

/** 剪纸山景：四层卡纸山 + 最前一层底色。在真实像素宽度上生成路径，刀模比例在任何屏幕上都一样。 */
export function PaperHills({ className, style, seed = 1, shift = 0, front = 'ground', sky, colors, decor = 'pines', decorColor }: PaperHillsProps) {
  const paper = usePaper()
  const ref = useRef<HTMLDivElement>(null)
  const { w, h } = useBoxSize(ref, { w: 1200, h: 280 })
  const skyColor = sky ?? paper.sky
  const frontColor = front === 'surface' ? paper.surface : paper.ground
  const paletteKey = paper.palette.join(',')
  const colorKey = colors?.join(',') ?? ''
  const layers = useMemo(() => {
    const palette = paletteKey.split(',')
    const custom = colorKey ? colorKey.split(',') : []
    const L = palette.length
    const pick = (i: number) => palette[(i + shift) % L]!
    const fills = [mixHex(pick(L - 1), skyColor, 0.45), mixHex(pick(1), skyColor, 0.2), pick(L > 4 ? 3 : 2), pick(0)].map((c, i) => custom[i] ?? c)
    fills.push(frontColor)
    const rand = rng(seed * 977 + 13)
    const s = Math.max(0.55, Math.min(1.3, h / 280))
    const tops = [0.2, 0.38, 0.55, 0.71, 0.87]
    const swell = [0.09, 0.08, 0.07, 0.05, 0.022]
    const period = [1150, 870, 980, 760, 1500]
    const detail = DETAIL[paper.edge]
    const built = fills.map((fill, i) => {
      const p1 = rand() * 6.28
      const p2 = rand() * 6.28
      const y0 = tops[i]! * h
      const A = swell[i]! * h
      const base = (x: number) => y0 + A * Math.sin((x / period[i]!) * 6.283 + p1) + A * 0.4 * Math.sin((x / (period[i]! * 0.43)) * 6.283 + p2)
      const pts = ridge(paper.edge, w, base, detail.amp[i]! * s, detail.len[i]!, rand)
      const shapes: Shape[] = []
      // 小物画在这层山的路径之前：底部被这层山盖住，只露出伸到山脊上方的部分。
      if (i === 2 && decor !== 'none') {
        const dark = decorColor ?? mixHex(fill, '#14201f', 0.3)
        if (decor === 'pines') {
          let d = ''
          for (const fx of [0.04, 0.075, 0.105, 0.6, 0.635, 0.672, 0.7, 0.935]) d += pine(fx * w, yAt(pts, fx * w) + 5 * s, (26 + rand() * 18) * s)
          shapes.push({ d, fill: dark })
        } else if (decor === 'kelp') {
          let d = ''
          for (const fx of [0.05, 0.09, 0.14, 0.52, 0.57, 0.8, 0.85, 0.89]) {
            const x0 = fx * w
            const b = yAt(pts, x0) + 6 * s
            const th = (56 + rand() * 40) * s
            const half = (5 + rand() * 2) * s
            const phase = rand() * 6.28
            const left: Pt[] = []
            const right: Pt[] = []
            for (let k = 0; k <= 12; k++) {
              const u = k / 12
              const x = x0 + Math.sin(u * 4.4 + phase) * 9 * s * u
              const hw = half * (1 - u * 0.85)
              left.push([x - hw, b - th * u])
              right.unshift([x + hw, b - th * u])
            }
            d += `M${[...left, ...right].map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}Z`
          }
          shapes.push({ d, fill: dark })
        } else {
          let d = ''
          for (const fx of [0.05, 0.085, 0.64, 0.68, 0.72, 0.93]) d += pine(fx * w, yAt(pts, fx * w) + 5 * s, (40 + rand() * 22) * s)
          shapes.push({ d, fill: dark })
          // 雪中小屋：主色墙、雪白屋顶、一扇门、一扇亮着的窗。
          const cw = 74 * s
          const x = w * 0.34
          const b = Math.max(yAt(pts, x - cw / 2), yAt(pts, x), yAt(pts, x + cw / 2)) + 5 * s
          const wh = cw * 0.56
          const wall = pick(0)
          shapes.push({ d: rect(x - cw / 2, b - wh, cw, wh), fill: wall })
          shapes.push({ d: `M${f1(x - cw * 0.64)} ${f1(b - wh)}L${f1(x)} ${f1(b - wh - cw * 0.42)}L${f1(x + cw * 0.64)} ${f1(b - wh)}Z`, fill: '#fffaf1' })
          shapes.push({ d: rect(x - cw * 0.3, b - wh * 0.7, cw * 0.22, wh * 0.7), fill: mixHex(wall, '#1a120c', 0.5) })
          shapes.push({ d: rect(x + cw * 0.08, b - wh * 0.72, cw * 0.24, cw * 0.2), fill: mixHex(pick(2), '#fff4dc', 0.35) })
        }
      }
      return { pts, fill, shapes }
    })
    // 只有最前一层伸到盒子底边以下（.pc-hills 的裁切向下多留 3px），后面几层在它的山脊下方就收口。
    // 否则每层都在同一条带抗锯齿的裁切线上收尾，后面的颜色会从那一排半透明像素里透出来，成了一条细缝。
    const frontLayer = built[built.length - 1]!
    const frontLow = Math.max(...frontLayer.pts.filter(([x]) => x >= 0 && x <= w).map(([, y]) => y))
    const tuck = Math.min(h, Math.max(frontLow + 4, h - 10))
    return built.map(({ pts, fill, shapes }, i) => {
      const bottom = i === built.length - 1 ? h + 6 : tuck
      const last = pts[pts.length - 1]!
      return { fill, shapes, d: `M${f1(pts[0]![0])} ${f1(bottom)}${pts.map(([x, y]) => `L${f1(x)} ${f1(y)}`).join('')}L${f1(last[0])} ${f1(bottom)}Z` }
    })
  }, [paletteKey, colorKey, paper.edge, w, h, seed, shift, skyColor, frontColor, decor, decorColor])

  return (
    <div ref={ref} className={cn('pc-hills', className)} style={style} aria-hidden>
      {layers.map((layer, i) => (
        <svg key={i} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          {layer.shapes.map((shape, k) => (
            <path key={k} d={shape.d} fill={shape.fill} />
          ))}
          <path d={layer.d} fill={layer.fill} />
        </svg>
      ))}
    </div>
  )
}

/** 剪纸太阳：外圈按刀模裁，里面一层浅色圆片。 */
export function PaperSun({ size = 220, tone = 3, className, style }: { size?: number; tone?: Tone; className?: string; style?: CSSProperties }) {
  const { edge, palette, surface, dark } = usePaper()
  const color = toneOf(palette, tone)
  const rim = useMemo(() => sealPath(edge, 50, edge === 'zigzag' ? 8 : edge === 'wave' ? 5 : 5.5, 50, 9), [edge])
  return (
    <svg className={cn('pc-sun', className)} style={style} width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <path d={rim} fill={color} />
      <circle cx="50" cy="50" r="35" fill={mixHex(color, dark ? '#fff4dc' : surface, 0.32)} />
      <circle cx="50" cy="50" r="24" fill={mixHex(color, dark ? '#fff4dc' : surface, 0.62)} />
    </svg>
  )
}

/** 剪纸云：平底，四个鼓包。 */
export function PaperCloud({ width = 140, className, style }: { width?: number; className?: string; style?: CSSProperties }) {
  const { cloud } = usePaper()
  return (
    <svg className={cn('pc-sun', className)} style={style} width={width} height={width * 0.5} viewBox="0 0 130 65" aria-hidden>
      <path d="M8 62A18 18 0 0 1 26 34A26 26 0 0 1 74 22A20 20 0 0 1 110 36A14 14 0 0 1 122 62Z" fill={cloud} />
    </svg>
  )
}
