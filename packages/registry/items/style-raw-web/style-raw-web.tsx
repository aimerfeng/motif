import { cn, cssVars } from '@motif/runtime'
import {
  useId,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FieldsetHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TableHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

/* @motif:defaults */
export const defaults = {
  font: 'serif',
  textSize: 18,
  ground: '#ffffff',
  linkColor: '#0000ee',
  visitedColor: '#551a8b',
  borderStyle: 'bevel',
  maxWidth: 1000,
  density: 1,
}
/* @motif:end */

export type RawWebProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

// ---- 颜色：所有灰都由底色和墨色混出来，链接色不够清楚时往墨色推 ----

type Rgb = [number, number, number]

function parse(hex: string): Rgb {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16)
  if (Number.isNaN(n)) return [255, 255, 255]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`
}

/** a 往 b 混合 t（0–1），在 sRGB 里线性插值。 */
export function mixHex(a: string, b: string, t: number): string {
  const x = parse(a)
  const y = parse(b)
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t])
}

function lin(v: number): number {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const [r, g, b] = parse(hex)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** CIE L*a*b*（D65），只用来判断两个颜色看起来是不是同一种颜色。 */
function lab(hex: string): Rgb {
  const [r, g, b] = parse(hex).map(lin) as Rgb
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047)
  const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b)
  const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883)
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

/** 色差 ΔE76：大约 30 以上一眼能分出是两种颜色。 */
function colourDistance(a: string, b: string): number {
  const p = lab(a)
  const q = lab(b)
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])
}

/** WCAG 对比度。 */
export function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** 保留色相，把 fg 一步步往 toward 推，直到在 bg 上达到 min 的对比度。用户挑什么颜色，文字都读得清。 */
export function readable(fg: string, bg: string, toward: string, min = 4.5): string {
  for (let i = 0; i <= 20; i++) {
    const candidate = mixHex(fg, toward, i / 20)
    if (contrast(candidate, bg) >= min) return candidate
  }
  return toward
}

/** 在一个色块上用黑字还是白字。 */
export function inkOn(bg: string): string {
  return contrast('#000000', bg) >= contrast('#ffffff', bg) ? '#000000' : '#ffffff'
}

/*
 * 底色只能落在两段里：亮度 ≥ 0.45（黑字）或 ≤ 0.05（白字）。
 * 中间调（例如 #808080、#ff0000、#2b6cb0）上，任何有颜色的链接都到不了 4.5:1，
 * 链接、访问过、按下和次要文字会全被推成墨色，链接只剩下划线能认。
 * 所以保留色相，把底色往白抬或往黑压到最近的一段。「最近」按对比度算，分界点正好就是黑字和白字的分界（亮度约 0.18），
 * 所以文字色不会因为这一步变掉。
 */
const LIGHT_GROUND = 0.45
const DARK_GROUND = 0.05

export function settleGround(hex: string): string {
  const g = toHex(parse(hex))
  const l = luminance(g)
  if (l >= LIGHT_GROUND || l <= DARK_GROUND) return g
  const lift = inkOn(g) === '#000000'
  const toward = lift ? '#ffffff' : '#000000'
  let lo = 0
  let hi = 1
  for (let i = 0; i < 14; i++) {
    const t = (lo + hi) / 2
    const lt = luminance(mixHex(g, toward, t))
    if (lift ? lt >= LIGHT_GROUND : lt <= DARK_GROUND) hi = t
    else lo = t
  }
  return mixHex(g, toward, hi)
}

/** 按下时的颜色：传统是红；链接或访问过的颜色已经接近红时换蓝，再接近就换绿，保证按下那一下看得出来。 */
const ACTIVE_HUES = [
  { name: 'red', hex: '#ee0000' },
  { name: 'blue', hex: '#0000ee' },
  { name: 'green', hex: '#008a00' },
] as const

function pickActive(link: string, visited: string, ground: string, ink: string): { hex: string; name: string } {
  let best = { hex: ACTIVE_HUES[0].hex as string, name: ACTIVE_HUES[0].name as string, gap: -1 }
  for (const hue of ACTIVE_HUES) {
    const hex = readable(hue.hex, ground, ink)
    const gap = Math.min(colourDistance(hex, link), colourDistance(hex, visited))
    if (gap >= 30) return { hex, name: hue.name }
    if (gap > best.gap) best = { hex, name: hue.name, gap }
  }
  return best
}

export interface RawWebTokens {
  ground: string
  ink: string
  muted: string
  link: string
  visited: string
  active: string
  /** 按下颜色的英文色名（red / blue / green），给说明文字用。 */
  activeName: string
  rule: string
  ruleStrong: string
  hi: string
  lo: string
  face: string
  faceHi: string
  faceLo: string
  faceHover: string
  facePress: string
  control: string
  field: string
  tint: string
  mark: string
  disabled: string
  scheme: 'light' | 'dark'
}

/**
 * 由底色、链接色、访问过的链接色推出整套 token。底色先经过 settleGround，离开中间调。
 * 斜面（bevel）的亮边永远在左上、暗边在右下：近白的底上两条边都比底色深（白底上白色亮边看不见），
 * 浅灰的底（如 #c0c0c0）亮边用白，深底上两条边都比底色亮。
 */
export function rawWebTokens({ ground, linkColor, visitedColor }: { ground: string; linkColor: string; visitedColor: string }): RawWebTokens {
  const g = settleGround(ground)
  const ink = inkOn(g)
  const darkInk = ink === '#000000'
  const nearWhite = darkInk && luminance(g) > 0.78
  const link = readable(linkColor, g, ink)
  const visited = readable(visitedColor, g, ink)
  const active = pickActive(link, visited, g, ink)
  const hi = darkInk ? (nearWhite ? mixHex(g, '#000000', 0.17) : mixHex(g, '#ffffff', 0.7)) : mixHex(g, '#ffffff', 0.42)
  const lo = darkInk ? mixHex(g, '#000000', 0.5) : mixHex(g, '#ffffff', 0.14)
  const face = darkInk ? (nearWhite ? mixHex(g, '#000000', 0.07) : g) : mixHex(g, '#ffffff', 0.1)
  const yellow = '#ffff00'
  const [r, gg, b] = parse(g)
  const nearYellow = Math.hypot(r - 255, gg - 255, b) < 150
  return {
    ground: g,
    ink,
    muted: readable(mixHex(g, ink, 0.64), g, ink, 4.6),
    link,
    visited,
    active: active.hex,
    activeName: active.name,
    rule: mixHex(g, ink, 0.45),
    ruleStrong: mixHex(g, ink, 0.72),
    hi,
    lo,
    face,
    faceHi: darkInk ? mixHex(face, '#ffffff', 0.85) : mixHex(face, '#ffffff', 0.32),
    faceLo: darkInk ? mixHex(face, '#000000', 0.45) : mixHex(face, '#000000', 0.5),
    faceHover: mixHex(face, ink, 0.05),
    facePress: mixHex(face, ink, 0.12),
    control: mixHex(g, ink, 0.55),
    field: darkInk ? mixHex(g, '#ffffff', nearWhite ? 0.75 : 0.85) : mixHex(g, '#000000', 0.35),
    tint: mixHex(g, ink, 0.045),
    mark: nearYellow ? '#9be7ff' : yellow,
    disabled: mixHex(face, ink, 0.38),
    scheme: darkInk ? 'light' : 'dark',
  }
}

// ---- 字体：正文一个字族，代码和元信息用等宽，控件用接近系统界面字的无衬线 ----

const NEWSREADER = "'Newsreader Variable', serif"
const PLEX_SANS = "'IBM Plex Sans Variable', sans-serif"
const PLEX_MONO = "'IBM Plex Mono', ui-monospace, monospace"
const CJK = "'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif"

export const rawWebFonts = {
  serif: { label: 'Newsreader', body: NEWSREADER, head: NEWSREADER, ui: PLEX_SANS, mono: PLEX_MONO, scale: 1, track: '-0.01em' },
  sans: { label: 'IBM Plex Sans', body: PLEX_SANS, head: PLEX_SANS, ui: PLEX_SANS, mono: PLEX_MONO, scale: 0.92, track: '-0.015em' },
  mono: { label: 'IBM Plex Mono', body: PLEX_MONO, head: PLEX_MONO, ui: PLEX_MONO, mono: PLEX_MONO, scale: 0.86, track: '-0.02em' },
  split: { label: 'IBM Plex Mono / Newsreader', body: NEWSREADER, head: PLEX_MONO, ui: PLEX_MONO, mono: PLEX_MONO, scale: 1, track: '-0.03em' },
} as const

export type RawWebFont = keyof typeof rawWebFonts

/** 正文的实际字号（px）：等宽和无衬线的字面更大，按比例缩小一点，让四种字体读起来一样大。 */
export function bodySize(font: string, textSize: number): number {
  const entry = rawWebFonts[font as RawWebFont] ?? rawWebFonts.serif
  return Math.round(textSize * entry.scale)
}

/*
 * 原生网页：几乎只给 HTML 元素本身写样式（标题、段落、列表、链接、表格、hr、表单），类名只有页面栏、分栏、导航和控件几个。
 * 边框风格用根元素上的 data-border 切换：bevel（凸起的表格、凹下的单元格、刻槽 hr）、solid、double、dashed。
 * 规则放在 @layer components：盖过 Tailwind 的 preflight，又能被工具类覆盖。
 */
const CSS = `@layer components{
.rw{position:relative;isolation:isolate;min-height:100%;background:var(--rw-ground);color:var(--rw-ink);color-scheme:var(--rw-scheme);font-family:var(--rw-body),${CJK};font-size:var(--rw-size);line-height:calc(1.36 + .14*var(--rw-d));font-optical-sizing:auto;overflow-wrap:break-word;-webkit-text-size-adjust:100%}
.rw ::selection{background:var(--rw-link);color:var(--rw-ground)}
.rw-page{container-type:inline-size;max-width:var(--rw-max);margin:0 auto;padding:calc(1.1rem*var(--rw-d)) clamp(16px,3.6vw,2.25rem) calc(2.6rem*var(--rw-d))}

.rw :is(h1,h2,h3,h4,h5,h6,.rw-h1,.rw-h2,.rw-h3){font-family:var(--rw-head),${CJK};font-weight:700;line-height:1.12;letter-spacing:var(--rw-track)}
.rw :is(h1,h2,h3,h4,h5,h6){margin:calc(1.2em*var(--rw-d)) 0 calc(.5em*var(--rw-d));text-wrap:balance}
.rw :is(h1,h2,h3,h4,h5,h6):first-child{margin-top:0}
.rw :is(h1,.rw-h1){font-size:2.25em}
.rw :is(h2,.rw-h2){font-size:1.5em}
.rw :is(h3,.rw-h3){font-size:1.17em}
.rw h4{font-size:1em}.rw h5{font-size:.83em}.rw h6{font-size:.67em}

.rw :is(p,ul,ol,dl,blockquote,pre,figure,fieldset,details,address){margin:0 0 calc(1em*var(--rw-d))}
.rw :is(ul,ol){padding-left:2.1em}
.rw ul{list-style:disc}.rw ol{list-style:decimal}.rw :is(ul,ol) ul{list-style:circle;margin:0}
.rw li{margin:calc(.3em*var(--rw-d)) 0}
.rw dt{font-weight:700}
.rw dd{margin:calc(.1em*var(--rw-d)) 0 calc(.65em*var(--rw-d)) 2.1em}
.rw blockquote{margin-inline:2.1em}
.rw address{font-style:italic}
.rw :is(b,strong){font-weight:700}
.rw :is(i,em,cite,dfn){font-style:italic}
.rw small{font-size:.83em}
.rw :is(code,kbd,samp,pre){font-family:var(--rw-mono),ui-monospace,monospace;font-size:var(--rw-code)}
.rw kbd{display:inline-block;padding:0 .35em;line-height:1.35;border:1px solid var(--rw-control);border-bottom-width:2px;background:var(--rw-face)}
.rw mark{background:var(--rw-mark);color:#000;padding:0 .12em}
.rw abbr[title]{text-decoration:underline dotted;cursor:help}
.rw pre{padding:calc(.7em*var(--rw-d)) 1em;background:var(--rw-tint);line-height:1.5;white-space:pre;overflow-x:auto;tab-size:2}
.rw hr{height:0;margin:calc(1.35em*var(--rw-d)) 0;border:0}

.rw a{color:var(--rw-link);text-decoration-line:underline;text-decoration-thickness:1px;text-underline-offset:.16em;cursor:pointer}
.rw a:visited,.rw a[data-visited]{color:var(--rw-visited)}
.rw a:hover,.rw a[data-hover]{text-decoration-thickness:2px}
.rw a:active,.rw a[data-active]{color:var(--rw-active)}
.rw a:focus-visible,.rw a[data-focus]{outline:2px dotted currentColor;outline-offset:2px}

.rw-table-wrap{max-width:100%;overflow-x:auto;margin:0 0 calc(1em*var(--rw-d))}
.rw table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums lining-nums}
.rw caption{caption-side:top;text-align:left;font-weight:700;padding:0 0 calc(.35em*var(--rw-d))}
.rw :is(th,td){padding:calc(.3em*var(--rw-d)) calc(.6em*var(--rw-d));text-align:left;vertical-align:top}
.rw th{background:var(--rw-face);font-weight:700;vertical-align:bottom}
.rw :is(th,td)[data-num]{text-align:right;white-space:nowrap}
.rw fieldset{min-width:0;padding:calc(.55em*var(--rw-d)) 1em calc(1em*var(--rw-d))}
.rw legend{padding:0 .35em;font-weight:700}

.rw[data-border=bevel] table{border-collapse:separate;border-spacing:2px;border:1px solid;border-color:var(--rw-hi) var(--rw-lo) var(--rw-lo) var(--rw-hi)}
.rw[data-border=bevel] :is(th,td),.rw[data-border=bevel] pre{border:1px solid;border-color:var(--rw-lo) var(--rw-hi) var(--rw-hi) var(--rw-lo)}
.rw[data-border=bevel] hr{border-top:1px solid var(--rw-lo);border-bottom:1px solid var(--rw-hi)}
.rw[data-border=bevel] fieldset{border:1px solid var(--rw-lo);box-shadow:inset 1px 1px 0 var(--rw-hi),1px 1px 0 var(--rw-hi)}
.rw[data-border=solid] :is(table,th,td,pre,fieldset){border:1px solid var(--rw-rule)}
.rw[data-border=solid] hr{border-top:1px solid var(--rw-rule)}
.rw[data-border=double] table{border:3px double var(--rw-rule-strong)}
.rw[data-border=double] :is(th,td){border:1px solid var(--rw-rule)}
.rw[data-border=double] :is(pre,fieldset){border:3px double var(--rw-rule-strong)}
.rw[data-border=double] hr{border-top:3px double var(--rw-rule-strong)}
.rw[data-border=dashed] :is(table,th,td,pre,fieldset){border:1px dashed var(--rw-rule)}
.rw[data-border=dashed] hr{border-top:1px dashed var(--rw-rule)}

.rw-cols{display:grid;grid-template-columns:minmax(0,1fr);column-gap:calc(2.4em*var(--rw-d))}
@container (min-width:46rem){
  .rw-cols{grid-template-columns:minmax(0,1.75fr) minmax(0,1fr)}
  .rw-cols[data-even]{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .rw-side{padding-left:calc(2.4em*var(--rw-d))}
  .rw[data-border=bevel] .rw-side{border-left:1px solid var(--rw-lo);box-shadow:inset 1px 0 0 var(--rw-hi)}
  .rw[data-border=solid] .rw-side{border-left:1px solid var(--rw-rule)}
  .rw[data-border=double] .rw-side{border-left:3px double var(--rw-rule-strong)}
  .rw[data-border=dashed] .rw-side{border-left:1px dashed var(--rw-rule)}
}

.rw-nav{display:flex;flex-wrap:wrap;align-items:baseline;row-gap:.2em;margin:0;padding:0;list-style:none}
.rw .rw-nav{padding:0;list-style:none}
.rw .rw-nav li{margin:0}
.rw-nav li:not(:last-child)::after{content:'|' / '';margin:0 .6em;color:var(--rw-muted)}
.rw .rw-nav [aria-current]{color:var(--rw-ink);font-weight:700;text-decoration:none}
.rw .rw-muted{color:var(--rw-muted)}
.rw .rw-mono{font-family:var(--rw-mono),ui-monospace,monospace}
.rw .rw-meta{font-family:var(--rw-mono),ui-monospace,monospace;font-size:var(--rw-meta);color:var(--rw-muted)}

.rw :is(.rw-btn,.rw-input,.rw-select,.rw-textarea,.rw-check){font-family:var(--rw-ui),${CJK};font-size:var(--rw-ui-size);line-height:1.25;color:var(--rw-ink);border-radius:0}
.rw .rw-btn{display:inline-flex;align-items:center;justify-content:center;gap:.45em;min-height:2.2em;padding:.3em 1.05em;background:var(--rw-face);border:1px solid var(--rw-control);cursor:default;white-space:nowrap;user-select:none;transition:background-color 60ms linear}
.rw .rw-btn:hover{background:var(--rw-face-hover)}
.rw .rw-btn:active{background:var(--rw-face-press)}
.rw .rw-btn[data-primary]{box-shadow:0 0 0 1px var(--rw-ink)}
.rw .rw-btn:focus-visible{outline:1px dotted var(--rw-ink);outline-offset:-5px;box-shadow:0 0 0 2px var(--rw-ink)}
.rw .rw-btn:disabled{color:var(--rw-disabled);background:var(--rw-face);cursor:not-allowed}
.rw[data-border=bevel] .rw-btn{border-width:2px;border-color:var(--rw-face-hi) var(--rw-face-lo) var(--rw-face-lo) var(--rw-face-hi)}
.rw[data-border=bevel] .rw-btn:active:not(:disabled){border-color:var(--rw-face-lo) var(--rw-face-hi) var(--rw-face-hi) var(--rw-face-lo);background:var(--rw-face);padding:calc(.3em + 1px) calc(1.05em - 1px) calc(.3em - 1px) calc(1.05em + 1px)}
.rw :is(.rw-input,.rw-select,.rw-textarea){display:block;width:100%;min-height:2.25em;padding:.32em .5em;background:var(--rw-field);border:1px solid var(--rw-control)}
.rw .rw-textarea{min-height:5.5em;resize:vertical}
.rw :is(.rw-input,.rw-textarea)::placeholder{color:var(--rw-muted);opacity:1}
.rw :is(.rw-input,.rw-select,.rw-textarea):focus-visible{outline:2px solid var(--rw-link);outline-offset:0}
.rw[data-border=bevel] :is(.rw-input,.rw-select,.rw-textarea){border-width:2px;border-color:var(--rw-lo) var(--rw-hi) var(--rw-hi) var(--rw-lo)}
.rw .rw-field{display:grid;gap:.3em;margin:0 0 calc(.8em*var(--rw-d))}
.rw .rw-field>label{font-family:var(--rw-ui),${CJK};font-size:var(--rw-ui-size)}
.rw .rw-check{display:inline-flex;align-items:center;gap:.5em;cursor:default}
.rw :is(input[type=checkbox],input[type=radio]){flex:none;width:1.05em;height:1.05em;margin:0;accent-color:var(--rw-link)}
.rw :is(input[type=checkbox],input[type=radio]):focus-visible{outline:2px dotted var(--rw-ink);outline-offset:2px}
.rw summary{cursor:pointer;font-weight:700}
.rw summary:focus-visible{outline:2px dotted currentColor;outline-offset:2px}
.rw details[open]>summary{margin-bottom:calc(.4em*var(--rw-d))}

.rw-counter{display:inline-flex;gap:1px;padding:1px;background:var(--rw-lo);vertical-align:middle}
.rw-counter>span{min-width:1.3ch;padding:0 .18em;background:#000;color:#f2f2f2;font:700 .78rem/1.55 var(--rw-mono),ui-monospace,monospace;text-align:center}
.rw-badge{display:inline-flex;flex:none;width:88px;height:31px;overflow:hidden;border:1px solid #000;font:400 14px/.86 'VT323',ui-monospace,monospace;text-transform:uppercase;vertical-align:middle;user-select:none}
.rw-badge>span{display:flex;align-items:center;justify-content:center;padding:0 3px;text-align:center;box-shadow:inset 1px 1px 0 rgb(255 255 255 / .45),inset -1px -1px 0 rgb(0 0 0 / .35)}
.rw-badge>span:first-child{flex:none;min-width:30px;font-size:17px}
.rw-badge>span:last-child{flex:1}

@media (prefers-reduced-motion:reduce){.rw .rw-btn{transition:none}}
}`

export function RawWeb({ className, style, children, ...props }: RawWebProps) {
  const { font, linkColor, visitedColor, ground, maxWidth, borderStyle, density, textSize } = { ...defaults, ...props }
  const t = rawWebTokens({ ground, linkColor, visitedColor })
  const f = rawWebFonts[font as RawWebFont] ?? rawWebFonts.serif
  const vars = cssVars(
    {
      '--rw-ground': t.ground,
      '--rw-ink': t.ink,
      '--rw-muted': t.muted,
      '--rw-link': t.link,
      '--rw-visited': t.visited,
      '--rw-active': t.active,
      '--rw-rule': t.rule,
      '--rw-rule-strong': t.ruleStrong,
      '--rw-hi': t.hi,
      '--rw-lo': t.lo,
      '--rw-face': t.face,
      '--rw-face-hi': t.faceHi,
      '--rw-face-lo': t.faceLo,
      '--rw-face-hover': t.faceHover,
      '--rw-face-press': t.facePress,
      '--rw-control': t.control,
      '--rw-field': t.field,
      '--rw-tint': t.tint,
      '--rw-mark': t.mark,
      '--rw-disabled': t.disabled,
      '--rw-scheme': t.scheme,
      '--rw-body': f.body,
      '--rw-head': f.head,
      '--rw-ui': f.ui,
      '--rw-mono': f.mono,
      '--rw-track': f.track,
      '--rw-size': `${bodySize(font, textSize)}px`,
      '--rw-code': f.body === f.mono ? '1em' : '.86em',
      '--rw-meta': f.body === f.mono ? '.86em' : '.8em',
      '--rw-ui-size': f.ui === f.body ? '.9em' : '.84em',
      '--rw-max': `${maxWidth}px`,
      '--rw-d': density,
    },
    style,
  )
  return (
    <div className={cn('rw', className)} data-border={borderStyle} style={vars}>
      <style>{CSS}</style>
      {children}
    </div>
  )
}

/** 页面栏：居中，最大宽度是 maxWidth，手机上两侧 16px。它也是容器查询的容器。 */
export function Page({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rw-page', className)} {...rest} />
}

/** 正文加一条侧栏；页面栏不到 46rem 宽时叠成一栏。`even` 换成两栏等宽。 */
export function Columns({ className, even, ...rest }: HTMLAttributes<HTMLDivElement> & { even?: boolean }) {
  return <div className={cn('rw-cols', className)} data-even={even ? '' : undefined} {...rest} />
}

/** 侧栏：宽屏时左边一条和 hr 同样风格的竖线。 */
export function Side({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <aside className={cn('rw-side', className)} {...rest} />
}

export type NavProps = HTMLAttributes<HTMLElement> & { label: string; items: { label: string; href?: string; current?: boolean; visited?: boolean }[] }
/** 一行用竖线隔开的文字链接。当前页仍是链接（带 aria-current="page"，读屏能听到「当前页」），只是墨色、加粗、不加下划线。 */
export function Nav({ label, items, className, ...rest }: NavProps) {
  return (
    <nav aria-label={label} className={className} {...rest}>
      <ul className="rw-nav">
        {items.map((item) => (
          <li key={item.label}>
            {item.current ? (
              <a aria-current="page" href={item.href ?? '#'}>
                {item.label}
              </a>
            ) : (
              <a href={item.href ?? '#'} data-visited={item.visited ? '' : undefined}>
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }
/** 看起来就是浏览器原生按钮：灰面、灰边、直角。primary 是默认按钮，多一圈 1px 墨色细框；键盘聚焦时框加到 2px，里面再加一圈点线。 */
export function Button({ className, primary, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn('rw-btn', className)} data-primary={primary ? '' : undefined} {...rest} />
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('rw-input', className)} {...rest} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('rw-textarea', className)} {...rest} />
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('rw-select', className)} {...rest} />
}

export type FieldProps = { label: string; children: (id: string) => ReactNode; className?: string }
/** 标签在上、控件在下；标签总是可见的文字，不用占位符代替。 */
export function Field({ label, children, className }: FieldProps) {
  const id = useId()
  return (
    <div className={cn('rw-field', className)}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
    </div>
  )
}

export type CheckProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { type?: 'checkbox' | 'radio'; label: ReactNode }
/** 原生复选框和单选框，勾选色是链接色。 */
export function Check({ label, type = 'checkbox', className, ...rest }: CheckProps) {
  return (
    <label className={cn('rw-check', className)}>
      <input type={type} {...rest} />
      <span>{label}</span>
    </label>
  )
}

export function Fieldset({ legend, children, className, ...rest }: FieldsetHTMLAttributes<HTMLFieldSetElement> & { legend: string }) {
  return (
    <fieldset className={className} {...rest}>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  )
}

/** 表格包一层横向滚动：再宽的表格也不会把 360px 的页面撑出横向滚动条。 */
export function Table({ className, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="rw-table-wrap">
      <table className={className} {...rest} />
    </div>
  )
}

/** 访客计数器：黑底白字的数字格，前面补零。读屏只读 sr-only 那句「{n} {label}」；旁边如果另有可见的说明字，给它加 aria-hidden。 */
export function Counter({ value, digits = 6, label = 'visitors', className }: { value: number; digits?: number; label?: string; className?: string }) {
  const text = String(Math.max(0, Math.floor(value))).padStart(digits, '0')
  return (
    <span className={className}>
      <span className="rw-counter" aria-hidden>
        {text.split('').map((digit, i) => (
          <span key={i}>{digit}</span>
        ))}
      </span>
      <span className="sr-only">
        {Math.floor(value).toLocaleString('en-US')} {label}
      </span>
    </span>
  )
}

/** 88×31 小按钮：左边一个色块写短词，右边两行小字。颜色是固定的，字色按色块明暗选黑或白。 */
export function WebBadge({ mark, text, colors, title }: { mark: string; text: string; colors: [string, string]; title?: string }) {
  return (
    <span className="rw-badge" role="img" aria-label={title ?? `${mark} ${text}`}>
      <span style={{ background: colors[0], color: inkOn(colors[0]) }}>{mark}</span>
      <span style={{ background: colors[1], color: inkOn(colors[1]) }}>{text}</span>
    </span>
  )
}
