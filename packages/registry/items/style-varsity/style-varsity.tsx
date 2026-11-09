import { cn, cssVars } from '@motif/runtime'
import {
  createContext,
  useContext,
  useId,
  useMemo,
  useRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

/* @motif:defaults */
export const defaults = {
  primary: '#a3192e',
  secondary: '#f2b33d',
  ground: 'cream',
  outlineStyle: 'chenille',
  displayFont: 'block',
  stitching: 'running',
  radius: 10,
}
/* @motif:end */

export type VarsityProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export type Ground = 'cream' | 'heather' | 'chalk' | 'night'
export type OutlineStyle = 'chenille' | 'tackle' | 'drop'
export type DisplayFont = 'block' | 'serif' | 'heritage' | 'wide'

// ---------- 颜色 ----------

/** 毛巾绣内圈的毡布奶油色；所有底色上都用它，主队色太浅时换成墨色。 */
export const FELT = '#fbf5e6'
const INK_DARK = '#1f1b24'

/** 底色：地面、毡布面、凹陷的输入框、墨色和次要文字。麻灰底额外叠一层卫衣的杂色纤维。 */
const GROUNDS: Record<Ground, { ground: string; surface: string; sunk: string; ink: string; muted: string; dark: boolean }> = {
  cream: { ground: '#f1e6cf', surface: '#fbf5e7', sunk: '#ebdfc6', ink: '#1f1b24', muted: '#5f5645', dark: false },
  heather: { ground: '#d5d4cf', surface: '#f1f0eb', sunk: '#e2e1dc', ink: '#1b1c22', muted: '#4f5159', dark: false },
  chalk: { ground: '#f7f6f1', surface: '#ffffff', sunk: '#efede6', ink: '#1a1b22', muted: '#5b5c65', dark: false },
  night: { ground: '#111624', surface: '#1a2133', sunk: '#0c101a', ink: '#f2e9d6', muted: '#a8a295', dark: true },
}

// 字体：粗细、字距、行高；scale 是标题的缩放（宽体 Syne 要缩小，标题才能和其他字体占同样的宽度），
// em / digitEm 是大写字母和数字的平均字宽（已含字距），用来把文字塞进臂章、锦旗、名字条这类定宽的图形。
// 两款衬线的笔画收得很紧，加上贴布外圈后字母会粘在一起，所以字距放宽到 0.02–0.03em。
const DISPLAY: Record<DisplayFont, { family: string; weight: number; tracking: string; leading: number; scale: number; em: number; digitEm: number }> = {
  block: { family: "'Archivo Black', ui-sans-serif, system-ui, sans-serif", weight: 400, tracking: '0.01em', leading: 0.98, scale: 1, em: 0.78, digitEm: 0.68 },
  serif: { family: "'Fraunces Variable', ui-serif, Georgia, serif", weight: 900, tracking: '0.02em', leading: 0.98, scale: 1, em: 0.78, digitEm: 0.66 },
  heritage: { family: "'Playfair Display Variable', ui-serif, Georgia, serif", weight: 900, tracking: '0.03em', leading: 0.98, scale: 1.06, em: 0.73, digitEm: 0.57 },
  wide: { family: "'Syne Variable', ui-sans-serif, system-ui, sans-serif", weight: 800, tracking: '-0.01em', leading: 1.02, scale: 0.66, em: 1.19, digitEm: 1.02 },
}
type Metrics = { em: number; digitEm: number }
const BODY = "'Outfit Variable', 'PingFang SC', 'Microsoft YaHei', ui-sans-serif, system-ui, sans-serif"

// 描边：em 单位，跟着字号走。ring 是毡布内圈，edge 是副队色外圈，drop 是错位投影的偏移。
const OUTLINES: Record<OutlineStyle, { ring: number; edge: number; drop: number }> = {
  chenille: { ring: 0.05, edge: 0.055, drop: 0 },
  tackle: { ring: 0, edge: 0.07, drop: 0 },
  drop: { ring: 0.045, edge: 0, drop: 0.08 },
}

type RGB = [number, number, number]

function parseHex(hex: string): RGB {
  const match = /^#?([0-9a-f]{6}|[0-9a-f]{3})\b/i.exec(hex.trim())
  if (!match) return [128, 128, 128]
  let h = match[1]!
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toHex = (rgb: RGB) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`

function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as RGB
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 对比度。 */
export function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

function oklab(hex: string): RGB {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as RGB
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}

/**
 * 两种颜色叠成字母和它的轮廓时分不分得开：亮度差够，或者色相差够（红配藏青亮度相近，但一眼能分开）。
 * 两个藏青、酒红配正红这种组合两样都不够，轮廓会和字母糊成一团。
 */
function distinct(a: string, b: string): boolean {
  if (contrast(a, b) >= 2) return true
  const x = oklab(a)
  const y = oklab(b)
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) >= 0.2
}

function mix(a: string, b: string, t: number): string {
  const x = parseHex(a)
  const y = parseHex(b)
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t])
}

/** 在一种颜色上挑深墨或毡布奶油，取对比度高的那个。 */
export function inkOn(bg: string): string {
  return contrast(bg, INK_DARK) >= contrast(bg, FELT) ? INK_DARK : FELT
}

/** 把队色往墨色方向推，直到它在所有给定底色上都够得上 min 对比度：队色当文字用时不会看不清。 */
function legible(color: string, grounds: string[], ink: string, min: number): string {
  for (let step = 0; step <= 10; step++) {
    const candidate = mix(color, ink, step / 10)
    if (grounds.every((g) => contrast(candidate, g) >= min)) return candidate
  }
  return ink
}

type GroundSet = (typeof GROUNDS)[Ground]

/**
 * 字母（或按钮）外圈的颜色：默认用另一种队色。它和填充分不开时（两种队色太接近）换成填充上对比度最高的墨色或毡布色；
 * 填充和外圈都和底色分不开时退回底色上的墨色，字形的外轮廓总有一层看得见。
 */
function edgeFor(fill: string, trim: string, g: GroundSet): string {
  const shows = (c: string) => contrast(c, g.ground) >= 1.35 || contrast(fill, g.ground) >= 2.5
  return [trim, inkOn(fill), g.ink].find((c) => distinct(c, fill) && shows(c)) ?? g.ink
}

/** 一块颜色和底色、毡布面太接近时（例如奶油色的主队色放在奶油底上）补一圈墨线，否则透明。 */
function keylineFor(color: string, g: GroundSet): string {
  return contrast(color, g.ground) < 1.5 || contrast(color, g.surface) < 1.5 ? mix(g.ground, g.ink, 0.42) : 'transparent'
}

export type VarsityPalette = ReturnType<typeof varsityPalette>

/** 由两种队色和底色推出整套颜色，保证任何队色组合下文字和字形都看得清。 */
export function varsityPalette(primaryIn: string, secondaryIn: string, groundKey: string) {
  const g = GROUNDS[groundKey as Ground] ?? GROUNDS.cream
  const primary = toHex(parseHex(primaryIn))
  const secondary = toHex(parseHex(secondaryIn))
  // 主队色和毡布太接近时，内圈改成墨色，字形才有轮廓。
  const felt = contrast(primary, FELT) >= 1.45 ? FELT : INK_DARK
  return {
    ...g,
    primary,
    secondary,
    felt,
    feltBg: g.dark ? g.surface : FELT,
    // 主队色字母和主按钮的外圈（副队色）；副队色字母和副按钮的外圈（主队色），两者互为镜像；毡布字母的外圈。
    edge: edgeFor(primary, secondary, g),
    edgeSecondary: edgeFor(secondary, primary, g),
    edgeFelt: edgeFor(felt, secondary, g),
    onPrimary: inkOn(primary),
    onSecondary: inkOn(secondary),
    primaryInk: legible(primary, [g.ground, g.surface], g.ink, 3.4),
    secondaryInk: legible(secondary, [g.ground, g.surface], g.ink, 3.4),
    primaryLine: keylineFor(primary, g),
    secondaryLine: keylineFor(secondary, g),
    // 主队色面上的缝线用副队色，看不清就用面上的文字色；副队色面同理。
    stitchPrimary: contrast(secondary, primary) >= 1.8 ? secondary : inkOn(primary),
    stitchSecondary: contrast(primary, secondary) >= 1.8 ? primary : inkOn(secondary),
  }
}

type VarsityContextValue = { palette: VarsityPalette; outline: OutlineStyle; metrics: Metrics }

const VarsityContext = createContext<VarsityContextValue | null>(null)
let fallback: VarsityContextValue | null = null

/** 组件在 <Varsity> 外面单独用时，退回默认参数推出的颜色。 */
function useVarsity(): VarsityContextValue {
  const value = useContext(VarsityContext)
  if (value) return value
  fallback ??= { palette: varsityPalette(defaults.primary, defaults.secondary, defaults.ground), outline: 'chenille', metrics: DISPLAY.block }
  return fallback
}

/** 麻灰卫衣的杂色：深浅两层细小纤维，平铺 220px。 */
const HEATHER = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>" +
    "<filter id='d' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.9 0.35' numOctaves='2' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.12 0 0 0 0 0.12 0 0 0 0 0.14 0 0 0 4 -2.35'/></filter>" +
    "<filter id='l' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.8 0.3' numOctaves='2' seed='11' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 4 -2.4'/></filter>" +
    "<rect width='220' height='220' filter='url(#d)' opacity='0.5'/><rect width='220' height='220' filter='url(#l)' opacity='0.7'/></svg>",
)}")`

/*
 * 校园运动：两种队色、毡布奶油内圈、缝线虚线边。
 * 所有规则挂在 .vs 下，放在 @layer components 里，调用方的 Tailwind 工具类可以覆盖。
 */
const CSS = `@layer components{
.vs{position:relative;isolation:isolate;min-height:100%;background-color:var(--vs-ground);color:var(--vs-ink);font-family:${BODY};font-size:16px;line-height:1.55;font-weight:420;-webkit-font-smoothing:antialiased;font-synthesis:none;
  --vs-r-ctl:calc(var(--vs-r) * .7);--vs-line:color-mix(in oklab,var(--vs-ink) 15%,transparent);--vs-line-strong:color-mix(in oklab,var(--vs-ink) 28%,transparent);
  --vs-stitch-surface:color-mix(in oklab,var(--vs-primary-ink) 62%,transparent);--vs-stitch-w:2px}
.vs[data-ground=heather]{background-image:${HEATHER}}
.vs *,.vs *::before,.vs *::after{box-sizing:border-box}
.vs-wrap{width:100%;max-width:1220px;margin:0 auto;padding:0 clamp(16px,4vw,40px)}

/* 文字 */
.vs-label{font:800 .72rem/1.2 ${BODY};letter-spacing:.15em;text-transform:uppercase}
.vs-muted{color:var(--vs-muted)}
.vs-num{font-family:var(--vs-display);font-weight:var(--vs-dw);font-size:calc(var(--t,1rem) * var(--vs-dscale-sm));letter-spacing:var(--vs-dls);font-variant-numeric:tabular-nums lining-nums}
.vs-display{font-family:var(--vs-display);font-weight:var(--vs-dw);font-size:calc(var(--t,1rem) * var(--vs-dscale-sm));letter-spacing:var(--vs-dls);line-height:1.05;text-transform:uppercase}
.vs-ink-primary{color:var(--vs-primary-ink)}

/* 块字：同一段文字叠四层，底下几层用 text-stroke 画出毡布内圈、副队色外圈和错位投影。
   宽体字体按 --vs-dscale 缩小后在手机上会比小标签还小，所以缩放后的字号不低于 min(原字号, --bt-min)。 */
.vs-bt{--fs:2.5rem;--bt-fill:var(--vs-primary);--bt-e:var(--vs-edge);--bt-rw:var(--vs-ring-w);position:relative;display:grid;margin:0;padding:var(--vs-bt-pad);font-family:var(--vs-display);font-weight:var(--vs-dw);line-height:var(--vs-dlh);letter-spacing:var(--vs-dls);text-transform:uppercase;overflow-wrap:anywhere;
  font-size:max(min(var(--fs),var(--bt-min,1.5rem)),calc(var(--fs) * var(--vs-dscale)))}
span.vs-bt{display:inline-grid}
.vs-bt[data-tone=secondary]{--bt-fill:var(--vs-secondary);--bt-e:var(--vs-edge-secondary)}
.vs-bt[data-tone=felt]{--bt-fill:var(--vs-felt);--bt-e:var(--vs-edge-felt)}
.vs-bt-l{grid-area:1/1;position:relative}
.vs-bt-drop,.vs-bt-edge,.vs-bt-ring{user-select:none;pointer-events:none}
.vs-bt-fill{color:var(--bt-fill)}
.vs-bt-ring{color:var(--bt-ring,var(--vs-felt));-webkit-text-stroke:calc(var(--bt-rw) * 2) var(--bt-ring,var(--vs-felt))}
.vs-bt-edge{color:var(--bt-edge,var(--bt-e));-webkit-text-stroke:calc((var(--bt-rw) + var(--vs-edge-w)) * 2) var(--bt-edge,var(--bt-e))}
.vs-bt-drop{color:var(--bt-edge,var(--bt-e));-webkit-text-stroke:calc(var(--bt-rw) * 2) var(--bt-edge,var(--bt-e));transform:translate(var(--vs-drop),var(--vs-drop))}
.vs[data-outline=tackle] .vs-bt-ring,.vs[data-outline=drop] .vs-bt-edge,.vs:not([data-outline=drop]) .vs-bt-drop{display:none}

/* 缝线：虚线框，内缩一点；双道缝线再往里加一圈 */
.vs-stitch{position:relative}
.vs-stitch::before,.vs-stitch::after{content:'';position:absolute;pointer-events:none;border:var(--vs-stitch-w) dashed var(--stitch,var(--vs-stitch-surface));display:none}
.vs-stitch::before{inset:var(--stitch-in,7px);border-radius:max(0px,calc(var(--stitch-r,var(--vs-r)) - var(--stitch-in,7px)))}
.vs-stitch::after{inset:calc(var(--stitch-in,7px) + 5px);border-radius:max(0px,calc(var(--stitch-r,var(--vs-r)) - var(--stitch-in,7px) - 5px))}
.vs:not([data-stitch=off]) .vs-stitch::before{display:block}
.vs[data-stitch=double] .vs-stitch:not([data-single])::after{display:block}

/* 条纹：袖口那样的「主、毡、副、毡、主」 */
.vs-stripes{height:var(--h,18px);background:linear-gradient(to bottom,var(--vs-primary) 0 28%,var(--vs-felt) 28% 40%,var(--vs-secondary) 40% 60%,var(--vs-felt) 60% 72%,var(--vs-primary) 72% 100%)}
.vs-stripes[data-variant=thin]{background:linear-gradient(to bottom,var(--vs-secondary) 0 34%,var(--vs-felt) 34% 66%,var(--vs-secondary) 66% 100%)}

/* 卡片：毡布面，一圈浅墨边，缝线内缩 7px */
.vs-card{--stitch:var(--vs-stitch-surface);position:relative;border-radius:var(--vs-r);background:var(--vs-surface);color:var(--vs-ink);border:2px solid var(--vs-line);padding:clamp(20px,3vw,30px);box-shadow:var(--vs-card-shadow)}
.vs-card[data-tone=primary]{--stitch:var(--vs-stitch-primary);background:var(--vs-primary);color:var(--vs-on-primary);border-color:var(--vs-primary-line)}
.vs-card[data-tone=secondary]{--stitch:var(--vs-stitch-secondary);background:var(--vs-secondary);color:var(--vs-on-secondary);border-color:var(--vs-secondary-line)}
.vs-card[data-tone=felt]{background:var(--vs-felt-bg);border-color:var(--vs-line)}

/* 按钮：毡布补丁，大写加宽字距，里面一道缝线。外圈 --ring 必须声明在按钮自己身上：它引用的 --b-edge 只在按钮上有定义 */
.vs-btn{--h:46px;--b-bg:var(--vs-primary);--b-fg:var(--vs-on-primary);--b-edge:var(--vs-edge);--stitch:var(--vs-stitch-primary);--stitch-in:4px;--stitch-r:var(--vs-r-ctl);--vs-stitch-w:1.5px;
  position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.6em;height:var(--h);padding:0 1.35em;border:0;border-radius:var(--vs-r-ctl);background:var(--b-bg);color:var(--b-fg);
  font:800 .8rem/1 ${BODY};letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;text-decoration:none;cursor:pointer;box-shadow:var(--ring,none);
  transition:transform .14s cubic-bezier(.3,.7,.4,1),box-shadow .14s cubic-bezier(.3,.7,.4,1),background-color .14s,color .14s}
.vs-btn[data-size=sm]{--h:36px;font-size:.7rem;padding:0 1.05em;--stitch-in:3px}
.vs-btn[data-size=lg]{--h:56px;font-size:.88rem;padding:0 1.7em;--stitch-in:5px}
.vs-btn[data-variant=secondary]{--b-bg:var(--vs-secondary);--b-fg:var(--vs-on-secondary);--b-edge:var(--vs-edge-secondary);--stitch:var(--vs-stitch-secondary)}
.vs-btn[data-variant=outline]{--b-bg:transparent;--b-fg:var(--vs-ink);--b-edge:var(--vs-ink);--stitch:var(--vs-line-strong);box-shadow:inset 0 0 0 2px var(--vs-ink)}
.vs-btn[data-variant=ghost]{--b-bg:transparent;--b-fg:var(--vs-ink);--stitch:transparent;box-shadow:none;padding:0 .8em}
.vs[data-outline=chenille] :is(.vs-btn,.vs-seg-opt){--ring:0 0 0 2px var(--vs-felt),0 0 0 4.5px var(--b-edge)}
.vs[data-outline=tackle] :is(.vs-btn,.vs-seg-opt){--ring:0 0 0 3px var(--b-edge)}
.vs[data-outline=drop] :is(.vs-btn,.vs-seg-opt){--ring:0 0 0 2px var(--vs-felt),4px 4px 0 2px var(--b-edge)}
.vs-btn:hover{transform:translateY(-1px)}
.vs-btn:active{transform:translateY(1px)}
.vs[data-outline=drop] .vs-btn:not([data-variant=ghost]):not([data-variant=outline]):hover{transform:translate(-1px,-1px)}
.vs[data-outline=drop] .vs-btn:not([data-variant=ghost]):not([data-variant=outline]):active{transform:translate(3px,3px);--ring:0 0 0 2px var(--vs-felt),1px 1px 0 2px var(--b-edge)}
.vs-btn[data-variant=ghost]:hover{background:color-mix(in oklab,var(--vs-ink) 8%,transparent)}
.vs-btn[data-variant=outline]:hover{background:var(--vs-ink);color:var(--vs-ground)}
.vs-btn:disabled{opacity:.45;pointer-events:none}
.vs-btn:focus-visible,.vs-input:focus-visible,.vs-seg-opt:focus-visible,.vs-switch:focus-visible{outline:3px solid var(--vs-primary-ink);outline-offset:4px}
.vs-btn:focus-visible,.vs-seg-opt:focus-visible{outline-offset:8px}
.vs[data-stitch=off] .vs-svg-stitch{display:none}

/* 徽章：小毡标 */
.vs-badge{--b-bg:var(--vs-primary);--b-fg:var(--vs-on-primary);--b-line:var(--vs-primary-line);--stitch:var(--vs-stitch-primary);--stitch-in:3px;--stitch-r:var(--vs-r-chip);--vs-stitch-w:1.5px;display:inline-flex;align-items:center;gap:.45em;height:28px;padding:0 .85em;border-radius:var(--vs-r-chip);background:var(--b-bg);color:var(--b-fg);font:800 .66rem/1 ${BODY};letter-spacing:.15em;text-transform:uppercase;white-space:nowrap;box-shadow:inset 0 0 0 2px var(--b-line)}
.vs-badge[data-tone=secondary]{--b-bg:var(--vs-secondary);--b-fg:var(--vs-on-secondary);--b-line:var(--vs-secondary-line);--stitch:var(--vs-stitch-secondary)}
.vs-badge[data-tone=felt]{--b-bg:var(--vs-felt-bg);--b-fg:var(--vs-ink);--stitch:var(--vs-stitch-surface);box-shadow:inset 0 0 0 2px var(--vs-line)}
.vs-badge[data-tone=ink]{--b-bg:var(--vs-ink);--b-fg:var(--vs-ground);--b-line:transparent;--stitch:color-mix(in oklab,var(--vs-ground) 45%,transparent)}
.vs-badge[data-tone=outline]{--b-bg:transparent;--b-fg:var(--vs-ink);--stitch:transparent;box-shadow:inset 0 0 0 2px var(--vs-ink)}

/* 字母臂章：圆形或圆角方形的毡布，外面一圈毡布再一圈队色 */
.vs-patch{--stitch-r:var(--patch-r);--p-bg:var(--vs-secondary);--stitch:var(--vs-stitch-secondary);position:relative;display:inline-grid;place-items:center;flex:none;width:var(--size);height:var(--size);border-radius:var(--patch-r);background:var(--p-bg);box-shadow:var(--vs-patch-ring)}
.vs-patch[data-tone=primary]{--p-bg:var(--vs-primary);--stitch:var(--vs-stitch-primary)}
.vs-patch[data-tone=felt]{--p-bg:var(--vs-felt-bg);--stitch:var(--vs-stitch-surface)}
.vs-patch .vs-bt{padding:0}

/* 斜毡布条幅：放在主标题下面 */
.vs-banner{display:inline-block;transform:skewX(-10deg);background:var(--vs-secondary);color:var(--vs-on-secondary);border-radius:calc(var(--vs-r-ctl) * .6);box-shadow:var(--vs-patch-ring);padding:.55em 1.2em}
.vs-banner>span{display:block;transform:skewX(10deg);font:800 clamp(.72rem,1.6vw,.9rem)/1 ${BODY};letter-spacing:.2em;text-transform:uppercase;white-space:nowrap}

/* 输入框：凹进去的毡布 */
.vs-field{display:grid;gap:.5rem}
.vs-field>label{color:var(--vs-muted)}
.vs-hint{margin:0;font-size:13px;line-height:1.4;color:var(--vs-muted)}
.vs-input{width:100%;height:48px;padding:0 14px;border-radius:var(--vs-r-ctl);border:2px solid var(--vs-line-strong);background:var(--vs-sunk);color:var(--vs-ink);font:600 1rem ${BODY};letter-spacing:.02em;transition:border-color .14s,box-shadow .14s}
.vs-input::placeholder{color:color-mix(in oklab,var(--vs-muted) 70%,transparent);font-weight:450}
.vs-input:hover{border-color:color-mix(in oklab,var(--vs-ink) 45%,transparent)}
.vs-input:focus{outline:none;border-color:var(--vs-primary-ink);box-shadow:0 0 0 4px color-mix(in oklab,var(--vs-secondary) 45%,transparent)}
.vs-input[data-caps]{text-transform:uppercase;letter-spacing:.12em;font-weight:800}

/* 尺码/选项：方块补丁，选中的填主队色 */
.vs-seg{display:flex;flex-wrap:wrap;gap:8px}
.vs-seg-opt{--b-edge:var(--vs-edge);--stitch:var(--vs-stitch-primary);--stitch-in:3px;--stitch-r:var(--vs-r-ctl);--vs-stitch-w:1.5px;min-width:48px;height:44px;padding:0 .7em;border-radius:var(--vs-r-ctl);border:2px solid var(--vs-line-strong);background:var(--vs-surface);color:var(--vs-ink);font:800 .8rem/1 ${BODY};letter-spacing:.1em;cursor:pointer;transition:background-color .14s,color .14s,border-color .14s,transform .14s}
.vs-seg-opt:hover{border-color:var(--vs-ink)}
.vs-seg-opt:active{transform:translateY(1px)}
.vs-seg-opt[aria-checked=true]{background:var(--vs-primary);color:var(--vs-on-primary);border-color:transparent;box-shadow:var(--ring,none)}
.vs-seg-opt[aria-checked=false]{--stitch:transparent}

/* 开关：毡布圆钮滑到主队色轨道上 */
.vs-switch{position:relative;flex:none;width:56px;height:32px;padding:0;border-radius:min(16px,calc(var(--vs-r-ctl) + 6px));border:2px solid var(--vs-line-strong);background:var(--vs-sunk);cursor:pointer;transition:background-color .16s,border-color .16s}
.vs-switch::after{content:'';position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:min(11px,calc(var(--vs-r-ctl) + 1px));background:var(--vs-felt-bg);box-shadow:inset 0 0 0 2px var(--vs-line-strong);transition:transform .18s cubic-bezier(.3,1.3,.5,1),background-color .16s,box-shadow .16s}
.vs-switch[aria-checked=true]{background:var(--vs-primary);border-color:color-mix(in oklab,var(--vs-primary) 72%,var(--vs-ink))}
.vs-switch[aria-checked=true]::after{transform:translateX(24px);background:var(--vs-knob);box-shadow:inset 0 0 0 2px var(--vs-felt)}

/* 选项卡：底下一条袖口条纹，选中的那格像球衣色块 */
.vs-tabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;border-bottom:4px solid var(--vs-secondary)}
.vs-tab{flex:none;height:42px;padding:0 1.1em;border:0;border-radius:var(--vs-r-ctl) var(--vs-r-ctl) 0 0;background:transparent;color:var(--vs-muted);font:800 .74rem/1 ${BODY};letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:background-color .14s,color .14s}
.vs-tab:hover{color:var(--vs-ink);background:color-mix(in oklab,var(--vs-ink) 6%,transparent)}
.vs-tab[aria-selected=true]{background:var(--vs-primary);color:var(--vs-on-primary);box-shadow:inset 0 0 0 2px var(--vs-primary-line)}
/* 选项卡条横向滚动，会把外侧的焦点框上下裁掉：焦点框画在选项卡里面，选中的一格用主队色面上的文字色 */
.vs-tab:focus-visible{outline:3px solid var(--vs-ink);outline-offset:-6px}
.vs-tab[aria-selected=true]:focus-visible{outline-color:var(--vs-on-primary)}

@media (prefers-reduced-motion:reduce){.vs-btn,.vs-input,.vs-seg-opt,.vs-switch,.vs-switch::after,.vs-tab{transition:none}.vs-btn:hover,.vs-btn:active{transform:none}}
}`

export function Varsity({ className, style, children, ...props }: VarsityProps) {
  const o = { ...defaults, ...props }
  const outline: OutlineStyle = o.outlineStyle in OUTLINES ? (o.outlineStyle as OutlineStyle) : 'chenille'
  const display = DISPLAY[o.displayFont as DisplayFont] ?? DISPLAY.block
  const palette = useMemo(() => varsityPalette(o.primary, o.secondary, o.ground), [o.primary, o.secondary, o.ground])
  const context = useMemo<VarsityContextValue>(() => ({ palette, outline, metrics: display }), [palette, outline, display])
  const line = OUTLINES[outline]
  const ringPx = outline === 'tackle' ? 0 : 2.5
  // 盒子（臂章、条幅）的描边和字母的描边同一个性格；按钮的外圈见 CSS 里的 --ring。
  const patchRing =
    outline === 'chenille'
      ? '0 0 0 3px var(--vs-felt), 0 0 0 6px var(--vs-edge)'
      : outline === 'tackle'
        ? '0 0 0 3.5px var(--vs-edge)'
        : '0 0 0 3px var(--vs-felt), 5px 5px 0 3px var(--vs-edge)'
  const vars = cssVars({
    '--vs-ground': palette.ground,
    '--vs-surface': palette.surface,
    '--vs-sunk': palette.sunk,
    '--vs-ink': palette.ink,
    '--vs-muted': palette.muted,
    '--vs-primary': palette.primary,
    '--vs-secondary': palette.secondary,
    '--vs-on-primary': palette.onPrimary,
    '--vs-on-secondary': palette.onSecondary,
    '--vs-primary-ink': palette.primaryInk,
    '--vs-secondary-ink': palette.secondaryInk,
    '--vs-felt': palette.felt,
    '--vs-felt-bg': palette.feltBg,
    '--vs-edge': palette.edge,
    '--vs-edge-secondary': palette.edgeSecondary,
    '--vs-edge-felt': palette.edgeFelt,
    '--vs-primary-line': palette.primaryLine,
    '--vs-secondary-line': palette.secondaryLine,
    '--vs-stitch-primary': palette.stitchPrimary,
    '--vs-stitch-secondary': palette.stitchSecondary,
    '--vs-knob': contrast(palette.secondary, palette.primary) >= 1.5 ? palette.secondary : palette.onPrimary,
    '--vs-r': `${o.radius}px`,
    '--vs-r-chip': `${Math.min(o.radius * 0.7, 14)}px`,
    '--vs-display': display.family,
    '--vs-dw': display.weight,
    '--vs-dls': display.tracking,
    '--vs-dlh': display.leading,
    '--vs-dscale': display.scale,
    // 小号标题（品牌名、卡片标题、比分）不必和大标题一样缩：宽体只缩一半。
    '--vs-dscale-sm': display.scale < 1 ? (1 + display.scale) / 2 : display.scale,
    '--vs-ring-w': `${line.ring}em`,
    '--vs-edge-w': `${line.edge}em`,
    '--vs-drop': `${line.drop}em`,
    '--vs-bt-pad': `${line.ring + line.edge + line.drop}em`,
    '--vs-patch-ring': patchRing,
    '--vs-card-shadow': outline === 'drop' ? '6px 6px 0 var(--vs-edge)' : `0 ${ringPx}px 0 var(--vs-line)`,
  }, style)
  return (
    <VarsityContext.Provider value={context}>
      <div className={cn('vs', className)} data-ground={o.ground} data-outline={outline} data-stitch={o.stitching} style={vars}>
        <style>{CSS}</style>
        {children}
      </div>
    </VarsityContext.Provider>
  )
}

/** 内容容器：最大 1220px，两侧留白随屏宽变化。 */
export function Wrap({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('vs-wrap', className)} {...rest} />
}

type Tone = 'primary' | 'secondary' | 'felt'

export type BlockTextProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  /** 字号（CSS 长度，可以是 clamp()）；宽体字体会按比例缩小，但不小于 min(字号, 1.5rem)，可用 --bt-min 改这个下限。 */
  size?: string
  tone?: Tone
  /** 填充色，默认跟 tone 走。 */
  fill?: string
  /** 毡布内圈的颜色；'none' 去掉内圈（填充本身就是毡布色时用，否则同色内圈只会把字加粗）。 */
  ring?: string
  /** 外圈颜色，默认是另一种队色（两种队色太接近时自动换成墨色或毡布色）。 */
  edge?: string
}

/** 校队块字：填充、毡布内圈、副队色外圈（或错位投影）四层叠放，只有最上层给读屏软件。 */
export function BlockText({ as: Tag = 'span', size, tone = 'primary', fill, ring, edge, className, style, children, ...rest }: BlockTextProps) {
  // 只写传了的变量：值为 undefined 的键会盖掉调用方 style 里的同名变量。
  const own: Record<`--${string}`, string> = {}
  if (size) own['--fs'] = size
  if (fill) own['--bt-fill'] = fill
  if (edge) own['--bt-edge'] = edge
  if (ring === 'none') own['--bt-rw'] = '0em'
  else if (ring) own['--bt-ring'] = ring
  const vars = cssVars(own, style)
  return (
    <Tag className={cn('vs-bt', className)} data-tone={tone} style={vars} {...rest}>
      <span className="vs-bt-l vs-bt-drop" aria-hidden>
        {children}
      </span>
      <span className="vs-bt-l vs-bt-edge" aria-hidden>
        {children}
      </span>
      <span className="vs-bt-l vs-bt-ring" aria-hidden>
        {children}
      </span>
      <span className="vs-bt-l vs-bt-fill">{children}</span>
    </Tag>
  )
}

/** 袖口条纹分隔带。 */
export function Stripes({ className, variant = 'sleeve', height, style }: { className?: string; variant?: 'sleeve' | 'thin'; height?: number; style?: CSSProperties }) {
  return <div aria-hidden className={cn('vs-stripes', className)} data-variant={variant} style={cssVars({ '--h': height ? `${height}px` : undefined }, style)} />
}

export type CardProps = HTMLAttributes<HTMLDivElement> & { tone?: 'surface' | 'primary' | 'secondary' | 'felt'; stitched?: boolean }
/** 毡布卡片，内缩一道缝线。 */
export function Card({ className, tone = 'surface', stitched = true, ...rest }: CardProps) {
  return <div className={cn('vs-card', stitched && 'vs-stitch', className)} data-tone={tone} {...rest} />
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; size?: 'sm' | 'md' | 'lg' }
export function Button({ className, variant = 'primary', size = 'md', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('vs-btn vs-stitch', className)} data-variant={variant} data-size={size} data-single="" {...rest} />
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'primary' | 'secondary' | 'felt' | 'ink' | 'outline' }
export function Badge({ className, tone = 'primary', ...rest }: BadgeProps) {
  return <span className={cn('vs-badge vs-stitch', className)} data-tone={tone} data-single="" {...rest} />
}

const toneColor = (p: VarsityPalette, tone: Tone) => (tone === 'primary' ? p.primary : tone === 'secondary' ? p.secondary : p.felt)

/**
 * 臂章上字母的三种颜色。
 * - 填充和臂章分不开（同色，或两种队色太接近）时换成毡布色，再不行用墨色。
 * - 填充本身是毡布色时去掉毡布内圈：同色内圈只会把字加粗，把 C 的开口糊上。
 * - 毛巾绣里毡布内圈就是轮廓，外圈和臂章同色，像直接缝在臂章上。其余情况（贴布、投影、内圈看不出来）
 *   外圈或投影要和臂章、和填充都分得开：和填充同色的投影会盖住 C 的开口，读成 O。
 *   先试另一种队色，再试臂章上的墨色、毡布色。
 */
function patchLetter(p: VarsityPalette, outline: OutlineStyle, tone: Tone, letterTone: Tone) {
  const bg = tone === 'felt' ? p.feltBg : toneColor(p, tone)
  const other = tone === 'secondary' ? p.primary : p.secondary
  const want = toneColor(p, letterTone)
  const fill = contrast(want, bg) >= 1.6 ? want : ([p.felt, other, inkOn(bg)].find((c) => contrast(c, bg) >= 1.6) ?? inkOn(bg))
  const hasRing = outline !== 'tackle' && contrast(fill, p.felt) >= 1.4
  if (outline === 'chenille' && hasRing && contrast(p.felt, bg) >= 1.4) return { fill, ring: undefined, edge: bg }
  // 都不行时外圈和臂章同色（看不见）：填充已经保证和臂章分得开，字形至少是干净的。
  const edge = [other, inkOn(bg), p.felt, inkOn(fill)].find((c) => distinct(c, bg) && distinct(c, fill)) ?? bg
  return { fill, ring: hasRing ? undefined : 'none', edge }
}

export type PatchProps = HTMLAttributes<HTMLSpanElement> & { size?: number; shape?: 'circle' | 'square'; tone?: Tone; letter: string; letterTone?: Tone; label?: string }
/** 字母臂章：一块毡布上缝一个块字。 */
export function Patch({ size = 96, shape = 'circle', tone = 'secondary', letter, letterTone = 'primary', label, className, style, ...rest }: PatchProps) {
  const { palette, outline, metrics } = useVarsity()
  const r = shape === 'circle' ? `${size / 2}px` : `calc(var(--vs-r) * 1.4)`
  const look = patchLetter(palette, outline, tone, letterTone)
  // 字号按字宽塞进臂章（宽体字体不再额外缩小）：方形比圆形多出四角的空间，外圈和投影大约再占 0.15em。
  const room = size * (letter.length > 1 ? (shape === 'square' ? 0.74 : 0.7) : shape === 'square' ? 0.7 : 0.56)
  const fontSize = fitSize(letter, room, size * (letter.length > 1 ? 0.44 : 0.6), metrics, 0.15)
  // 缝线内缩跟着尺寸走；80px 以下的小臂章只缝一道，第二道会压到数字上。
  const stitchIn = Math.round(Math.min(9, Math.max(5, size * 0.085)) * 2) / 2
  return (
    <span
      role="img"
      aria-label={label ?? letter}
      className={cn('vs-patch vs-stitch', className)}
      data-tone={tone}
      data-single={size < 80 ? '' : undefined}
      style={cssVars({ '--size': `${size}px`, '--patch-r': r, '--stitch-in': `${stitchIn}px` }, style)}
      {...rest}
    >
      <BlockText aria-hidden fill={look.fill} ring={look.ring} edge={look.edge} style={{ fontSize: `${Math.round(fontSize * 10) / 10}px`, lineHeight: 1 }}>
        {letter}
      </BlockText>
    </span>
  )
}

/** 主标题下的斜毡布条幅。 */
export function Banner({ className, children, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('vs-banner', className)} {...rest}>
      <span>{children}</span>
    </span>
  )
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; caps?: boolean; hint?: string }
export function Input({ className, label, id, caps, hint, ...rest }: InputProps) {
  const auto = useId()
  const inputId = id ?? auto
  const hintId = hint ? `${inputId}-hint` : undefined
  const input = <input id={inputId} className={cn('vs-input', className)} data-caps={caps ? '' : undefined} aria-describedby={hintId} {...rest} />
  if (!label) return input
  return (
    <div className="vs-field">
      <label className="vs-label" htmlFor={inputId}>
        {label}
      </label>
      {input}
      {hint ? (
        <p id={hintId} className="vs-hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function rovingKey(event: KeyboardEvent, index: number, count: number, select: (next: number) => void) {
  let next: number
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index + 1
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index - 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = count - 1
  else return
  event.preventDefault()
  select((next + count) % count)
}

export type SegmentedProps = { options: { value: string; label: string; disabled?: boolean }[]; value: string; onValueChange: (value: string) => void; label: string; className?: string }
/** 方块补丁单选组（尺码、选项）：方向键移动并选中。 */
export function Segmented({ options, value, onValueChange, label, className }: SegmentedProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  const select = (i: number) => {
    const option = options[i]
    if (!option || option.disabled) return
    onValueChange(option.value)
    refs.current[i]?.focus()
  }
  return (
    <div role="radiogroup" aria-label={label} className={cn('vs-seg', className)} onKeyDown={(event) => rovingKey(event, index, options.length, select)}>
      {options.map((option, i) => (
        <button
          key={option.value}
          ref={(node) => {
            refs.current[i] = node
          }}
          type="button"
          role="radio"
          aria-checked={i === index}
          disabled={option.disabled}
          tabIndex={i === index ? 0 : -1}
          className="vs-seg-opt vs-stitch"
          data-single=""
          onClick={() => select(i)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
export function Switch({ checked = false, onCheckedChange, className, ...rest }: SwitchProps) {
  return <button type="button" role="switch" aria-checked={checked} className={cn('vs-switch', className)} onClick={() => onCheckedChange?.(!checked)} {...rest} />
}

export type TabsProps = { items: { id: string; label: string }[]; value: string; onValueChange: (id: string) => void; label: string; idBase: string; className?: string }
/** 选项卡：方向键切换，Home / End 跳到两端。面板用 `${idBase}-panel-${id}` 作为 id。 */
export function Tabs({ items, value, onValueChange, label, idBase, className }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = Math.max(0, items.findIndex((item) => item.id === value))
  const select = (i: number) => {
    onValueChange(items[i]!.id)
    refs.current[i]?.focus()
  }
  return (
    <div role="tablist" aria-label={label} className={cn('vs-tabs', className)} onKeyDown={(event) => rovingKey(event, index, items.length, select)}>
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(node) => {
            refs.current[i] = node
          }}
          id={`${idBase}-tab-${item.id}`}
          type="button"
          role="tab"
          aria-selected={i === index}
          aria-controls={`${idBase}-panel-${item.id}`}
          tabIndex={i === index ? 0 : -1}
          className="vs-tab"
          onClick={() => select(i)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

// ---------- SVG 图形：球衣、锦旗、队徽 ----------

/** SVG 文字的描边层（与 BlockText 同一套比例），用在球衣号码、锦旗和队徽上。 */
function SvgBlock({ x, y, size, text, fill, ring, edge, anchor = 'middle', letterSpacing }: { x: number; y: number; size: number; text: string; fill: string; ring: string; edge: string; anchor?: 'start' | 'middle'; letterSpacing?: number }) {
  const { outline } = useVarsity()
  const line = OUTLINES[outline]
  const common = { x, y, textAnchor: anchor, letterSpacing, style: { fontFamily: 'var(--vs-display)', fontWeight: 'var(--vs-dw)', fontSize: `${size}px`, textTransform: 'uppercase' } as CSSProperties, strokeLinejoin: 'miter' as const, strokeMiterlimit: 2.5 }
  const outer = (line.ring + line.edge) * size * 2
  const d = line.drop * size
  // 贴布单描边只有外圈：外圈和填充分不开时改用内圈的颜色（再不行用填充上的墨色），号码才有轮廓。
  const edgeColor = outline === 'tackle' && !distinct(edge, fill) ? (distinct(ring, fill) ? ring : inkOn(fill)) : edge
  return (
    <g aria-hidden>
      {line.drop > 0 ? (
        <text {...common} x={x + d} y={y + d} fill={edgeColor} stroke={edgeColor} strokeWidth={line.ring * size * 2}>
          {text}
        </text>
      ) : null}
      {line.edge > 0 ? (
        <text {...common} fill={edgeColor} stroke={edgeColor} strokeWidth={outer}>
          {text}
        </text>
      ) : null}
      {line.ring > 0 ? (
        <text {...common} fill={ring} stroke={ring} strokeWidth={line.ring * size * 2}>
          {text}
        </text>
      ) : null}
      <text {...common} fill={fill}>
        {text}
      </text>
    </g>
  )
}

/** 粗估文字宽度（数字、空格、字母分开算），把文字塞进臂章、锦旗、名字条这类定宽的地方；pad 是描边和投影额外占的 em。 */
function fitSize(text: string, width: number, max: number, m: Metrics, pad = 0): number {
  let ems = pad
  for (const ch of text) ems += /\d/.test(ch) ? m.digitEm : ch === ' ' ? 0.3 : m.em
  return Math.min(max, width / Math.max(0.5, ems))
}

const JERSEY = 'M112 18 Q150 60 188 18 L238 34 L296 96 L262 134 L236 112 L240 304 Q150 314 60 304 L64 112 L38 134 L4 96 L62 34 Z'

export type JerseyProps = { name: string; number: string; kit?: 'home' | 'away' | 'alt'; stripes?: boolean; className?: string; style?: CSSProperties }

/** 球衣插图：背后弧形的名字条和号码，袖口条纹。颜色由两种队色按主场、客场、第三球衣推出。 */
export function Jersey({ name, number, kit = 'home', stripes = true, className, style }: JerseyProps) {
  const { palette: p, metrics } = useVarsity()
  const clip = useId()
  const body = kit === 'home' ? p.primary : kit === 'away' ? FELT : p.secondary
  const trimRaw = kit === 'home' ? p.secondary : p.primary
  const trim = contrast(trimRaw, body) >= 1.4 ? trimRaw : inkOn(body)
  const numFill = contrast(trim, body) >= 1.8 ? trim : inkOn(body)
  // 号码外圈：先试毡布色，不够再用另一种队色，最后用墨色。
  const ringCandidates = [FELT, kit === 'home' ? p.primary : p.secondary, INK_DARK]
  const numRing = ringCandidates.find((c) => contrast(c, numFill) >= 1.6 && contrast(c, body) >= 1.3) ?? inkOn(numFill)
  const numEdge = contrast(trim, body) >= 1.4 && trim !== numFill ? trim : body === FELT ? p.primary : mix(body, INK_DARK, 0.45)
  const seam = contrast(body, INK_DARK) > 6 ? 'rgba(31,27,36,.32)' : 'rgba(251,245,230,.5)'
  // 白色客场球衣上的毡布条纹看不见，换成主队色。
  const stripeFelt = contrast(FELT, body) >= 1.3 ? FELT : body === FELT ? p.secondary : inkOn(body)
  // 球衣和底色分不开时（例如主队色就是奶油色）补一圈墨线。
  const keyline = contrast(body, p.ground) < 1.5 || contrast(body, p.surface) < 1.5
  const digits = number.slice(0, 2) || '0'
  const numSize = fitSize(digits, 128, 124, metrics)
  const nameSize = fitSize(name || ' ', 112, 21, metrics)
  return (
    <svg viewBox="-12 -4 324 330" role="img" aria-label={`${kit} jersey, ${name || 'no name'}, number ${digits}`} className={className} style={style}>
      <defs>
        <clipPath id={clip}>
          <path d={JERSEY} />
        </clipPath>
      </defs>
      <path d={JERSEY} fill="rgba(31,27,36,.16)" transform="translate(6 8)" />
      <path d={JERSEY} fill={body} />
      <g clipPath={`url(#${clip})`}>
        {stripes ? (
          <g fill="none">
            <path d="M294.2 83 L248.8 133.6 M5.8 83 L51.2 133.6" stroke={trim} strokeWidth="9" />
            <path d="M289 78.4 L243.6 129 M11 78.4 L56.4 129" stroke={stripeFelt} strokeWidth="5" />
            <path d="M284.6 74.4 L239.2 125 M15.4 74.4 L60.8 125" stroke={trim} strokeWidth="6" />
          </g>
        ) : null}
        <path d="M60 300 Q150 310 240 300" stroke={trim} strokeWidth="12" fill="none" />
        <path d="M112 18 Q150 60 188 18" stroke={trim} strokeWidth="18" fill="none" />
      </g>
      {keyline ? <path d={JERSEY} fill="none" stroke={p.ink} strokeWidth="2.5" strokeLinejoin="round" /> : null}
      <path d="M100 22 Q150 76 200 22" stroke={seam} strokeWidth="1.6" strokeDasharray="5 4" fill="none" />
      <path d="M236 112 L238 290 M64 112 L62 290" stroke={seam} strokeWidth="1.6" strokeDasharray="5 4" fill="none" />
      <path id={`${clip}-arc`} d="M84 112 Q150 90 216 112" fill="none" />
      <text aria-hidden fill={numFill} textAnchor="middle" style={{ fontFamily: 'var(--vs-display)', fontWeight: 'var(--vs-dw)', fontSize: `${nameSize}px`, letterSpacing: '0.06em', textTransform: 'uppercase' } as CSSProperties}>
        <textPath href={`#${clip}-arc`} startOffset="50%">
          {name}
        </textPath>
      </text>
      <SvgBlock x={150} y={146 + numSize * 0.72} size={numSize} text={digits} fill={numFill} ring={numRing} edge={numEdge} />
    </svg>
  )
}

export type PennantProps = { text: string; tone?: 'primary' | 'secondary'; className?: string; style?: CSSProperties }
/** 三角锦旗：副队色旗杆布、两根系带、沿边一道缝线，文字按长度缩放塞进旗面。 */
export function Pennant({ text, tone = 'primary', className, style }: PennantProps) {
  const { palette: p, metrics } = useVarsity()
  const body = tone === 'primary' ? p.primary : p.secondary
  const hoist = tone === 'primary' ? p.secondary : p.primary
  const fill = tone === 'primary' ? (contrast(FELT, body) >= 2 ? FELT : inkOn(body)) : contrast(p.primary, body) >= 2 ? p.primary : inkOn(body)
  const ring = tone === 'primary' ? (contrast(p.secondary, fill) >= 1.4 ? p.secondary : body) : contrast(FELT, fill) >= 1.4 ? FELT : body
  const stitch = tone === 'primary' ? p.stitchPrimary : p.stitchSecondary
  const size = fitSize(text, 160, 34, metrics)
  return (
    <svg viewBox="-8 -6 336 112" role="img" aria-label={`Pennant: ${text}`} className={className} style={style}>
      <path d="M8 40 L-6 34 M8 60 L-6 66" stroke="rgba(31,27,36,.55)" strokeWidth="3" strokeLinecap="round" />
      <path d="M0 0 L320 50 L0 100 Z" fill="rgba(31,27,36,.16)" transform="translate(4 5)" />
      <path d="M0 0 L320 50 L0 100 Z" fill={body} />
      <path d="M0 0 L34 5.3 L34 94.7 L0 100 Z" fill={hoist} />
      {contrast(body, p.ground) < 1.5 ? <path d="M0 0 L320 50 L0 100 Z" fill="none" stroke={p.ink} strokeWidth="2.5" strokeLinejoin="round" /> : null}
      <path d="M44 13 L284 50 L44 87 Z" fill="none" stroke={stitch} strokeWidth="2" strokeDasharray="6 5" className="vs-svg-stitch" />
      <SvgBlock x={52} y={50 + size * 0.36} size={size} text={text} fill={fill} ring={ring} edge={ring} anchor="start" />
    </svg>
  )
}

export type CrestProps = { monogram: string; year?: string; className?: string; style?: CSSProperties; label?: string }
const SHIELD = 'M12 10 H148 V84 C148 128 118 152 80 170 C42 152 12 128 12 84 Z'
/** 盾形队徽：外圈副队色，毡布内圈，缝线，中间是缩写和建校年份。 */
export function Crest({ monogram, year, className, style, label }: CrestProps) {
  const { palette: p, metrics } = useVarsity()
  const size = fitSize(monogram, 92, 70, metrics)
  const yearColor = contrast(p.secondary, p.primary) >= 1.8 ? p.secondary : p.onPrimary
  const ring = contrast(p.secondary, p.onPrimary) >= 1.5 ? p.secondary : p.primary
  return (
    <svg viewBox="0 0 160 180" role="img" aria-label={label ?? `Crest ${monogram}`} className={className} style={style}>
      <path d={SHIELD} fill={p.edge} stroke={p.edge} strokeWidth="14" strokeLinejoin="round" />
      <path d={SHIELD} fill={p.felt} stroke={p.felt} strokeWidth="6" strokeLinejoin="round" />
      <path d={SHIELD} fill={p.primary} />
      <path d="M22 20 H138 V84 C138 121 112 142 80 158 C48 142 22 121 22 84 Z" fill="none" stroke={p.stitchPrimary} strokeWidth="2" strokeDasharray="6 5" className="vs-svg-stitch" />
      <SvgBlock x={80} y={year ? 92 : 104} size={size} text={monogram} fill={p.onPrimary} ring={ring} edge={ring} />
      {year ? (
        <text x="80" y="132" textAnchor="middle" fill={yearColor} style={{ font: `800 13px ${BODY}`, letterSpacing: '0.24em' }}>
          {year}
        </text>
      ) : null}
    </svg>
  )
}
