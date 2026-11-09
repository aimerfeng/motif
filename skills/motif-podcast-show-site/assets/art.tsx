import { cn } from '@/lib/motif-runtime'
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { initials } from './data'
import { DISPLAY, ensureContrast, inkOn, mix, monogram, rotateHue } from './theme'

/* ---------- 图标（全部内联 SVG） ---------- */

const GLYPHS = {
  play: <path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.4-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6Z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  rss: (
    <>
      <path d="M5 5a14 14 0 0 1 14 14M5 11a8 8 0 0 1 8 8" />
      <circle cx="6" cy="18" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  up: <path d="M12 19V6m-6 6 6-6 6 6" />,
  transcript: <path d="M5 6h14M5 10h14M5 14h9M5 18h6" />,
  mic: (
    <>
      <rect x="9" y="3.5" width="6" height="11" rx="3" />
      <path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3" />
    </>
  ),
  notes: (
    <>
      <path d="M6.5 3.5h7.5l4 4v13h-11.5Z" />
      <path d="M14 3.5v4h4M9.5 12.5h5M9.5 16h5" />
    </>
  ),
  menu: <path d="M4.5 8.5h15M4.5 15.5h15" />,
  close: <path d="m6.5 6.5 11 11m0-11-11 11" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof GLYPHS

export function Icon({ name, className, strokeWidth = 1.8 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={cn('size-5 shrink-0', className)} aria-hidden>
      {GLYPHS[name]}
    </svg>
  )
}

/** 后退 / 快进按钮的图标：带秒数的圆弧箭头。 */
export function SkipIcon({ seconds, forward, className }: { seconds: number; forward?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={cn('size-7 shrink-0', className)} aria-hidden>
      <g transform={forward ? 'translate(24 0) scale(-1 1)' : undefined}>
        <path d="M5.2 9.2A7.5 7.5 0 1 1 4.5 13" />
        <path d="M4.6 4.8v4.6h4.6" />
      </g>
      <text x="12.1" y="15.5" textAnchor="middle" fontSize="7.6" fontWeight="700" letterSpacing="-0.4" fill="currentColor" stroke="none" style={{ fontFamily: 'var(--pc-mono)' }}>
        {seconds}
      </text>
    </svg>
  )
}

/** 虚构的节目标志：圆角方块里三根电平条。 */
export function ShowMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8 shrink-0', className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="var(--pc-accent)" />
      <g fill="var(--pc-on-accent)">
        <rect x="8" y="12" width="3.4" height="8" rx="1.7" />
        <rect x="14.3" y="7.5" width="3.4" height="17" rx="1.7" />
        <rect x="20.6" y="10.5" width="3.4" height="11" rx="1.7" />
      </g>
    </svg>
  )
}

/* ---------- 元信息行 ---------- */

/**
 * 「Ep 147 · Oct 27 · 47 min」这种用圆点隔开的一行。折行时圆点不能挂在行尾或行首：
 * 每个圆点放在它后面那一项的左边，整行往左挪一个间距再裁掉溢出，所以每行开头那一项的圆点正好被裁掉。
 */
export function MetaLine({ items, className }: { items: (ReactNode | { node: ReactNode; className?: string })[]; className?: string }) {
  return (
    <p className={cn('overflow-hidden', className)}>
      <span className="-ml-4 flex flex-wrap gap-y-1">
        {items.map((item, i) => {
          const entry = item && typeof item === 'object' && 'node' in item ? item : { node: item, className: undefined }
          return (
            <span key={i} className={cn('relative ml-4 whitespace-nowrap', entry.className)}>
              <span aria-hidden className="absolute -left-[0.72rem] top-0">
                ·
              </span>
              {entry.node}
            </span>
          )
        })}
      </span>
    </p>
  )
}

/* ---------- 封面 ---------- */

export type CoverStyle = 'orbits' | 'contours' | 'halftone' | 'monogram'

interface CoverColors {
  background: string
  /** 字色按这些颜色挑（渐变取两端）。 */
  base: string[]
  ink: string
  line: string
  feature: string
}

function coverColors(style: CoverStyle, accent: string): CoverColors {
  switch (style) {
    case 'contours': {
      const paper = mix(accent, '#fbfaf6', 0.86)
      const deep = mix(accent, '#fbfaf6', 0.72)
      return { background: `linear-gradient(160deg, ${paper}, ${deep})`, base: [paper, deep], ink: inkOn(paper, deep), line: ensureContrast(mix(accent, '#000000', 0.15), deep, 2.4), feature: accent }
    }
    case 'halftone': {
      const top = mix(accent, '#ffffff', 0.08)
      const bottom = mix(accent, '#000000', 0.18)
      const ink = inkOn(top, bottom)
      return { background: `linear-gradient(180deg, ${top}, ${bottom})`, base: [top, bottom], ink, line: ink, feature: ink }
    }
    case 'monogram': {
      const ground = mix(accent, '#0b0c0f', 0.86)
      return { background: ground, base: [ground], ink: inkOn(ground), line: inkOn(ground), feature: ensureContrast(accent, ground, 3.2) }
    }
    default: {
      const glow = mix(accent, '#08090c', 0.28)
      const mid = mix(accent, '#08090c', 0.62)
      const edge = mix(accent, '#08090c', 0.82)
      return {
        background: `radial-gradient(120% 95% at 74% 22%, ${glow} 0%, ${mid} 52%, ${edge} 100%)`,
        base: [mid, edge, glow],
        ink: inkOn(mid, edge, glow),
        line: inkOn(mid, edge),
        feature: mix(accent, '#ffffff', 0.12),
      }
    }
  }
}

function seeded(seed: number, k: number) {
  const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** viewBox 单位（0–100）里的矩形。 */
interface Box {
  x: number
  y: number
  w: number
  h: number
}

/** 点到矩形的距离（在矩形里为 0）。 */
function distanceTo(box: Box, x: number, y: number) {
  return Math.hypot(Math.max(box.x - x, 0, x - box.x - box.w), Math.max(box.y - y, 0, y - box.y - box.h))
}

/** 让开区域边上留的空隙，和遮罩的羽化。 */
const ZONE_PAD = 4
const ZONE_FEATHER = 2.2

/** 线条类构图用的遮罩：文字区域挖空，边缘羽化，像地图上给地名留的白边。 */
function ZoneMask({ id, zones }: { id: string; zones: Box[] }) {
  return (
    <>
      <filter id={`${id}-feather`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140">
        <feGaussianBlur stdDeviation={ZONE_FEATHER} />
      </filter>
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
        <rect width="100" height="100" fill="#ffffff" />
        <g fill="#000000" filter={`url(#${id}-feather)`}>
          {zones.map((zone, i) => (
            <rect key={i} x={zone.x - ZONE_PAD} y={zone.y - ZONE_PAD} width={zone.w + ZONE_PAD * 2} height={zone.h + ZONE_PAD * 2} rx={ZONE_PAD} />
          ))}
        </g>
      </mask>
    </>
  )
}

interface CompositionProps {
  colors: CoverColors
  seed: number
  /** 构图要让开的区域：首屏封面上是眉题和节目名，网点缩略图上是底部的大号集数。 */
  zones: Box[]
  /** 遮罩的 id；不需要遮罩时为 null。 */
  mask: string | null
}

const masked = (mask: string | null) => (mask ? `url(#${mask})` : undefined)

function Orbits({ colors, seed, mask }: CompositionProps) {
  const tilt = -22 + seeded(seed, 1) * 14
  const cx = 64 + seeded(seed, 2) * 10
  const cy = 30 + seeded(seed, 3) * 8
  return (
    <g>
      <g mask={masked(mask)}>
        <g transform={`rotate(${tilt} ${cx} ${cy})`} fill="none" stroke={colors.line}>
          {[13, 21, 30, 40, 51, 63, 76].map((r, i) => (
            <ellipse key={r} cx={cx} cy={cy} rx={r} ry={r * 0.42} strokeOpacity={0.5 - i * 0.055} strokeWidth={0.35} />
          ))}
          {[21, 40, 63].map((r, i) => {
            const a = seeded(seed, 4 + i) * Math.PI * 2
            return <circle key={r} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r * 0.42} r={1.1 + i * 0.35} fill={colors.line} stroke="none" fillOpacity={0.85} />
          })}
        </g>
      </g>
      <circle cx={cx} cy={cy} r={8.5} fill={colors.feature} />
      <circle cx={cx - 2.6} cy={cy - 2.8} r={3.2} fill="#ffffff" fillOpacity={0.28} />
    </g>
  )
}

function Contours({ colors, seed, mask }: CompositionProps) {
  const cx = 66 + seeded(seed, 1) * 8
  const cy = 36 + seeded(seed, 2) * 10
  const p1 = seeded(seed, 3) * 6
  const p2 = seeded(seed, 4) * 6
  const loops = Array.from({ length: 11 }, (_, k) => {
    const base = 5 + k * 6.4
    const points = Array.from({ length: 72 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2
      const r = base * (1 + 0.13 * Math.sin(3 * a + p1 + k * 0.18) + 0.08 * Math.sin(5 * a + p2 - k * 0.1))
      return `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r * 0.86).toFixed(2)}`
    })
    return `M${points.join('L')}Z`
  })
  return (
    <g>
      <g fill="none" stroke={colors.line} mask={masked(mask)}>
        {loops.map((d, k) => (
          <path key={k} d={d} strokeWidth={k % 4 === 3 ? 0.6 : 0.32} strokeOpacity={k % 4 === 3 ? 0.9 : 0.6} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={2.2} fill={colors.feature} />
    </g>
  )
}

function Halftone({ colors, seed, zones, mask }: CompositionProps) {
  const sx = 62 + seeded(seed, 1) * 14
  const sy = 34 + seeded(seed, 2) * 8
  const dots: ReactNode[] = []
  for (let row = 0; row < 17; row++) {
    for (let col = 0; col < 17; col++) {
      const x = 3 + col * 6 + (row % 2) * 3
      const y = 3 + row * 6
      const d = Math.hypot(x - sx, y - sy)
      // 网点越靠近文字越小：印刷上的「挖空」，字永远压在干净的底色上
      const near = zones.reduce((min, zone) => Math.min(min, distanceTo(zone, x, y)), Infinity)
      const clear = Math.min(1, Math.max(0, (near - ZONE_PAD) / 10))
      const r = Math.max(0, 2.75 - d * 0.052) * clear
      if (r > 0.18) dots.push(<circle key={`${row}-${col}`} cx={x} cy={y} r={r} />)
    }
  }
  return (
    <g fill={colors.feature} fillOpacity={0.88}>
      {dots}
      <g mask={masked(mask)}>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={sx - 26 + i * 5} y={sy + 19 + i * 3.4} width={100} height={0.8 - i * 0.18} fillOpacity={0.7} />
        ))}
      </g>
    </g>
  )
}

/** 字母构图：节目名一行时，大号缩写的顶边（按常见标题字体的大写高度估的）和基线。 */
const MONOGRAM_TOP = 43
const MONOGRAM_BASELINE = 98
/** 节目名一行时的底边；多出来的行把大号缩写往下推一些（缩写从底边出血），给电平条腾地方。 */
const ONE_LINE_BOTTOM = 23.1
/** 电平条最高的那根。 */
const STRIP_HEIGHT = 13

function Monogram({ colors, seed, letters, titleBottom }: CompositionProps & { letters: string; titleBottom: number }) {
  const shift = Math.min(10, Math.max(0, titleBottom - ONE_LINE_BOTTOM) * 0.6)
  // 电平条居中放在节目名下面、大号缩写上面的那条空隙里；空隙窄就压扁，实在放不下就不画
  const top = titleBottom + 3.5
  const bottom = MONOGRAM_TOP + shift - 3.5
  const scale = Math.min(0.85, (bottom - top) / STRIP_HEIGHT)
  const center = (top + bottom) / 2
  return (
    <g>
      <text x="-4" y={MONOGRAM_BASELINE + shift} fontSize="74" fill={colors.feature} style={{ ...DISPLAY, letterSpacing: '-0.06em' }}>
        {letters}
      </text>
      {scale > 0.45 && (
        <g fill={colors.line} fillOpacity={0.55}>
          {Array.from({ length: 30 }, (_, i) => {
            const h = (2 + Math.abs(Math.sin(i * 0.9 + seed) * 7 + Math.sin(i * 0.37 + seed * 2) * 4)) * scale
            return <rect key={i} x={6 + i * 3} y={center - h / 2} width={1.4} height={h} rx={0.7} />
          })}
        </g>
      )}
    </g>
  )
}

/** 眉题和节目名的位置（量出来的，viewBox 单位）。字号全是 cqw，所以只跟字体和节目名有关、跟封面多大无关。 */
interface TextBoxes {
  eyebrow: Box
  title: Box
}

/** 量到之前的估计值：眉题一行、节目名一行。 */
function estimatedBoxes(style: CoverStyle): TextBoxes {
  return {
    eyebrow: { x: 7, y: 7, w: 60, h: 6.9 },
    title: style === 'monogram' ? { x: 7, y: 15, w: 86, h: 8.1 } : { x: 7, y: 81.75, w: 86, h: 11.25 },
  }
}

function useTextBoxes(enabled: boolean, style: CoverStyle) {
  const root = useRef<HTMLDivElement>(null)
  const eyebrow = useRef<HTMLParagraphElement>(null)
  const title = useRef<HTMLParagraphElement>(null)
  const [boxes, setBoxes] = useState<TextBoxes | null>(null)
  useLayoutEffect(() => {
    const container = root.current
    const eyebrowElement = eyebrow.current
    const titleElement = title.current
    if (!enabled || !container || !eyebrowElement || !titleElement) return
    const measure = () => {
      const size = container.clientWidth
      if (size === 0) return
      const unit = (value: number) => Math.round((value / size) * 400) / 4
      const box = (element: HTMLElement): Box => ({ x: unit(element.offsetLeft), y: unit(element.offsetTop), w: unit(element.offsetWidth), h: unit(element.offsetHeight) })
      const next = { eyebrow: box(eyebrowElement), title: box(titleElement) }
      setBoxes((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    }
    measure()
    // 字体加载完、节目名改了、换了字体搭配，文字块的尺寸都会变
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    observer.observe(eyebrowElement)
    observer.observe(titleElement)
    return () => observer.disconnect()
  }, [enabled, style])
  return { root, eyebrow, title, boxes: boxes ?? estimatedBoxes(style) }
}

export interface CoverArtProps {
  style: CoverStyle
  accent: string
  /** 节目名：大封面上排版，缩略图不显示。 */
  title: string
  seed: number
  variant: 'show' | 'episode' | 'mini'
  /** 单集封面左下角的大号集数。 */
  label?: string
  className?: string
  css?: CSSProperties
}

/** 节目名的字号（cqw）：最长的那个词要能放进一行（86cqw 宽），不然只能在词中间断开。 */
function titleSize(title: string, base: number) {
  const longest = title.split(/\s+/).reduce((max, word) => Math.max(max, word.length), 0)
  return Math.min(base, 86 / (Math.max(1, longest) * 0.6))
}

/** 网点缩略图底部留给大号集数的那一条。 */
const LABEL_BAND: Box = { x: -20, y: 70, w: 140, h: 50 }

/** 生成的节目封面：四种构图都是 SVG，颜色从主色推出来，字色按底色亮度挑；文字压着的地方构图都让开。 */
export function CoverArt({ style, accent, title, seed, variant, label, className, css }: CoverArtProps) {
  // 单集缩略图在主色两侧轻轻转一点色相，列表里不至于一模一样
  const colors = coverColors(style, variant === 'episode' ? rotateHue(accent, ((seed % 5) - 2) * 7) : accent)
  const show = variant === 'show'
  const text = useTextBoxes(show, style)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const { eyebrow, title: heading } = text.boxes
  // 眉题让到左上角、节目名让到底边，一直延伸到封面边缘；字母构图的节目名在上面，由电平条自己避开
  const zones: Box[] = show
    ? [{ x: -20, y: -20, w: eyebrow.x + eyebrow.w + 20, h: eyebrow.y + eyebrow.h + 20 }, ...(style === 'monogram' ? [] : [{ x: -20, y: heading.y, w: 140, h: 140 }])]
    : style === 'halftone'
      ? [LABEL_BAND]
      : []
  const mask = show ? `${uid}-clear` : null
  const composition: CompositionProps = { colors, seed, zones, mask }
  return (
    <div ref={text.root} className={cn('@container relative aspect-square shrink-0 overflow-hidden', className)} style={{ background: colors.background, color: colors.ink, ...css }} aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
        {mask && (
          <defs>
            <ZoneMask id={mask} zones={zones} />
          </defs>
        )}
        {style === 'orbits' && <Orbits {...composition} />}
        {style === 'contours' && <Contours {...composition} />}
        {style === 'halftone' && <Halftone {...composition} />}
        {style === 'monogram' && <Monogram {...composition} letters={monogram(title)} titleBottom={show ? heading.y + heading.h : ONE_LINE_BOTTOM} />}
      </svg>
      {show && (
        <>
          <p ref={text.eyebrow} className="absolute left-[7cqw] top-[7cqw] text-[4.6cqw] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--pc-mono)' }}>
            A science podcast
          </p>
          <p
            ref={text.title}
            className={cn('absolute inset-x-[7cqw] leading-[0.9] [overflow-wrap:anywhere]', style === 'monogram' ? 'top-[15cqw]' : 'bottom-[7cqw]')}
            style={{ ...DISPLAY, fontSize: `${titleSize(title, style === 'monogram' ? 9 : 12.5)}cqw` }}
          >
            {title}
          </p>
        </>
      )}
      {variant === 'episode' && label && (
        <p className="absolute bottom-[8cqw] left-[9cqw] text-[30cqw] leading-none" style={{ ...DISPLAY, fontVariantNumeric: 'tabular-nums' }}>
          {label}
        </p>
      )}
    </div>
  )
}

/* ---------- 头像 ---------- */

/** 首字母 + 主色邻近色的渐变；字色在渐变两端都要读得清。 */
export function Avatar({ name, accent, hue, className }: { name: string; accent: string; hue: number; className?: string }) {
  const a = rotateHue(accent, hue)
  const b = mix(rotateHue(accent, hue + 38), '#0b0c0f', 0.42)
  return (
    <span
      className={cn('@container grid aspect-square shrink-0 place-items-center rounded-full', className)}
      style={{ background: `linear-gradient(140deg, ${a}, ${b})`, color: inkOn(a, b, mix(a, b, 0.5)) }}
      aria-hidden
    >
      <span className="text-[38cqw] leading-none" style={{ ...DISPLAY, letterSpacing: '-0.02em' }}>
        {initials(name)}
      </span>
    </span>
  )
}
