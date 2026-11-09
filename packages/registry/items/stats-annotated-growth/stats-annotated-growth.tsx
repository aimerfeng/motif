import { cn, cssVars, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { motion } from 'motion/react'
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#8f8cff',
  curve: 'smooth',
  annotationStyle: 'callout',
  drawDuration: 4.5,
  showGrid: true,
  valuePrefix: '',
  metricLabel: 'Monthly active writers',
  heading: 'From a 400-person waitlist to 2.4 million writers',
}
/* @motif:end */

export type StatsAnnotatedGrowthProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 换一个值就把曲线淡出、从头再讲一遍（例如区块滚进视口时）；标题和说明不动。 */
  replayKey?: number | string
}

const SANS = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"
const SERIF = "'Instrument Serif', ui-serif, Georgia, serif"
const MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace"

// ———— 数据：换成你自己的 ————
// 只需要改 FIRST_YEAR、KEYS、MILESTONES 和 SUBHEADING：纵轴上限和刻度按数据峰值自动取整。
// 换成收入类指标时（valuePrefix 填 $、€），里程碑的标题和说明也要一起换成收入的故事。

const FIRST_YEAR = 2019
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 关键月份（从 FIRST_YEAR 一月起的月序号）和当月数值；中间的月份按对数插值。 */
const KEYS: ReadonlyArray<readonly [number, number]> = [
  [0, 400],
  [3, 1_200],
  [9, 5_800],
  [14, 19_000],
  [16, 74_000],
  [20, 128_000],
  [24, 205_000],
  [29, 340_000],
  [35, 515_000],
  [41, 630_000],
  [46, 760_000],
  [52, 1_000_000],
  [58, 1_270_000],
  [64, 1_540_000],
  [70, 1_800_000],
  [76, 2_090_000],
  [81, 2_410_000],
]

type Milestone = { at: number; title: string; body: string }

/** 里程碑的月份必须也是 KEYS 里的关键月份，线停在这里时读数才是整数。 */
const MILESTONES: Milestone[] = [
  { at: 3, title: 'First paying team', body: 'A six-person studio in Porto paid $48 for a year. We framed the receipt.' },
  { at: 14, title: 'Public launch', body: 'Opened the waitlist to everyone: 31,000 sign-ups in the first week.' },
  { at: 29, title: 'Series A, $14M', body: 'Led by Harrow & Pine, to build offline sync and the mobile apps.' },
  { at: 52, title: 'One million writers', body: 'Two-thirds of them now start their notes on a phone.' },
]

const SUBHEADING = 'Notewell started as a notes app for one design studio. This is every month since, with the four moments that bent the curve.'

// ———— 序列与插值 ————

/** 关键月份之间按对数插值（增长是乘性的），再叠一点确定性的起伏，看起来像真实数据；关键月份保持精确值。 */
function buildSeries(): number[] {
  const last = KEYS[KEYS.length - 1][0]
  const out: number[] = []
  let k = 0
  for (let i = 0; i <= last; i++) {
    while (KEYS[k + 1][0] < i) k++
    const [x0, v0] = KEYS[k]
    const [x1, v1] = KEYS[k + 1]
    const t = (i - x0) / (x1 - x0)
    const base = Math.exp(Math.log(v0) + (Math.log(v1) - Math.log(v0)) * t)
    const keyed = i === x0 || i === x1
    // 按月序号哈希出的伪随机起伏：每次渲染都一样，又不像正弦波那样有规律。
    const hash = Math.sin(i * 12.9898 + 4.1) * 43758.5453
    const wobble = keyed ? 0 : (hash - Math.floor(hash) - 0.5) * 0.028
    out.push(Math.round(base * (1 + wobble)))
  }
  return out
}

/** Fritsch–Carlson 单调三次插值的切线：曲线不会在两个月之间冲过头，也不会凭空下凹。 */
function monotoneTangents(v: readonly number[]): number[] {
  const n = v.length
  const d = v.slice(0, -1).map((value, k) => v[k + 1] - value)
  const m = v.map((_, k) => {
    if (k === 0) return d[0]
    if (k === n - 1) return d[n - 2]
    return d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2
  })
  for (let k = 0; k < n - 1; k++) {
    if (d[k] === 0) {
      m[k] = 0
      m[k + 1] = 0
      continue
    }
    const a = m[k] / d[k]
    const b = m[k + 1] / d[k]
    const s = a * a + b * b
    if (s > 9) {
      const t = 3 / Math.sqrt(s)
      m[k] = t * a * d[k]
      m[k + 1] = t * b * d[k]
    }
  }
  return m
}

/**
 * 纵轴上限和刻度间隔：峰值上方留出约 18% 的余量（终点的读数要放在线头上方），
 * 间隔取 1 / 2 / 2.5 / 5 × 10ⁿ，刻度总是 4–6 条。换数据时不用再手动调。
 */
function niceAxis(peak: number): { max: number; step: number } {
  const target = Math.max(1, peak) * 1.18
  const raw = target / 6
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag
  return { max: Math.ceil(target / step) * step, step }
}

const SERIES = buildSeries()
const LAST = SERIES.length - 1
const TANGENTS = monotoneTangents(SERIES)
const AXIS = niceAxis(Math.max(...SERIES))

type Curve = 'smooth' | 'step'

/** 月序号 x（可以是小数）处的数值，与画出来的曲线完全一致：线头的点和读数都用它。 */
function valueAt(x: number, curve: Curve): number {
  if (x <= 0) return SERIES[0]
  if (x >= LAST) return SERIES[LAST]
  const k = Math.floor(x)
  const t = x - k
  const v0 = SERIES[k]
  const v1 = SERIES[k + 1]
  if (curve === 'step') return v0
  const t2 = t * t
  const t3 = t2 * t
  return (2 * t3 - 3 * t2 + 1) * v0 + (t3 - 2 * t2 + t) * TANGENTS[k] + (-2 * t3 + 3 * t2) * v1 + (t3 - t2) * TANGENTS[k + 1]
}

function monthLabel(i: number): string {
  return `${MONTH_NAMES[((i % 12) + 12) % 12]} ${FIRST_YEAR + Math.floor(i / 12)}`
}

function compactNumber(v: number): string {
  if (v >= 999_500_000) return `${(v / 1e9).toFixed(2)}B`
  if (v >= 999_500) return `${(v / 1e6).toFixed(2)}M`
  if (v >= 9_950) return `${Math.round(v / 1e3)}k`
  if (v >= 1_000) return `${(v / 1e3).toFixed(1)}k`
  return String(Math.round(v))
}

/** 刻度是整齐的数，去掉多余的小数位：2.5M、750k、40。 */
function tickLabel(v: number): string {
  const trim = (n: number) => String(Number(n.toFixed(2)))
  if (v >= 1e9) return `${trim(v / 1e9)}B`
  if (v >= 1e6) return `${trim(v / 1e6)}M`
  if (v >= 1e3) return `${trim(v / 1e3)}k`
  return trim(v)
}

/** 按亮度挑主色上的文字颜色，任何主色上的编号和读数都清楚。 */
function inkOn(hex: string): string {
  const m = /^#?([0-9a-f]{6})(?:[0-9a-f]{2})?$/i.exec(hex.trim())
  if (!m) return '#0b0b10'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.2 ? '#0b0b10' : '#ffffff'
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (t: number) => 1 - (1 - t) ** 3
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const backOut = (t: number) => {
  const c = 1.9
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2
}
const smoothstep = (t: number) => t * t * (3 - 2 * t)

// ———— 时间线：线在里程碑之间缓入缓出，到达后停顿 ————

const DELAY = 0.45
const PAUSE = 0.65
/** 重播前曲线淡出的秒数。 */
export const REPLAY_FADE = 0.4
/** 图表宽度小于它时标注一律收进图下的编号列表。 */
const LIST_BELOW = 720
/** 减少动态效果时直接取这一刻：所有标注都已出现。 */
const STILL = 99

type Segment = { x0: number; x1: number; t0: number; t1: number }
type Timeline = { segments: Segment[]; reach: number[]; end: number }

function buildTimeline(drawDuration: number): Timeline {
  const stops = [0, ...MILESTONES.map((m) => m.at), LAST]
  const segments: Segment[] = []
  const reach: number[] = []
  let t = DELAY
  for (let s = 0; s < stops.length - 1; s++) {
    const x0 = stops[s]
    const x1 = stops[s + 1]
    const t1 = t + (Math.max(0.5, drawDuration) * (x1 - x0)) / LAST
    segments.push({ x0, x1, t0: t, t1 })
    t = t1
    if (s < MILESTONES.length) {
      reach.push(t)
      t += PAUSE
    }
  }
  return { segments, reach, end: t }
}

function indexAt(timeline: Timeline, time: number): number {
  for (const s of timeline.segments) {
    if (time <= s.t0) return s.x0
    if (time < s.t1) return s.x0 + (s.x1 - s.x0) * easeInOut((time - s.t0) / (s.t1 - s.t0))
  }
  return LAST
}

/** 整段故事（画线 + 停顿）的秒数，演示用它安排重播。 */
export function storyLength(drawDuration: number = defaults.drawDuration): number {
  return buildTimeline(drawDuration).end
}

// ———— 几何 ————

function buildGeometry(W: number, H: number, curve: Curve, showGrid: boolean, prefix: string) {
  const tickValues: number[] = []
  // 用乘法而不是累加：小数间隔（例如 2.5）累加会积出浮点误差。
  for (let k = 1; k * AXIS.step <= AXIS.max * (1 + 1e-9); k++) tickValues.push(k * AXIS.step)
  const longest = Math.max(...tickValues.map((v) => (prefix + tickLabel(v)).length))
  const padL = showGrid ? Math.round(14 + longest * 6.3) : 4
  const padR = 12
  const padT = 18
  const padB = 26
  const plotW = Math.max(40, W - padL - padR)
  const plotH = Math.max(40, H - padT - padB)
  const base = padT + plotH
  const px = (i: number) => padL + (i / LAST) * plotW
  const py = (v: number) => base - (v / AXIS.max) * plotH
  const f = (n: number) => n.toFixed(1)

  let line = `M${f(px(0))},${f(py(SERIES[0]))}`
  for (let k = 0; k < LAST; k++) {
    const x0 = px(k)
    const x1 = px(k + 1)
    const y1 = py(SERIES[k + 1])
    if (curve === 'step') line += `H${f(x1)}V${f(y1)}`
    else {
      const h = (x1 - x0) / 3
      line += `C${f(x0 + h)},${f(py(SERIES[k] + TANGENTS[k] / 3))},${f(x1 - h)},${f(py(SERIES[k + 1] - TANGENTS[k + 1] / 3))},${f(x1)},${f(y1)}`
    }
  }
  const area = `${line}L${f(px(LAST))},${f(base)}L${f(px(0))},${f(base)}Z`

  const toIndex = (X: number) => clamp01((X - padL) / plotW) * LAST
  // 每个像素列上曲线的高度：标注避让曲线时查这张表。
  const ys = new Float32Array(Math.ceil(W) + 1)
  for (let X = 0; X < ys.length; X++) ys[X] = py(valueAt(toIndex(X), curve))
  const lineTop = (a: number, b: number) => {
    let top = Infinity
    for (let X = Math.max(0, Math.floor(a)); X <= Math.min(ys.length - 1, Math.ceil(b)); X++) top = Math.min(top, ys[X])
    return top
  }

  const years: { x: number; label: string }[] = []
  // 年份间距不够放四位数时改用 ’19 这样的两位写法，窄屏上不会挤在一起。
  const short = (plotW * 12) / LAST < 46
  for (let y = 0; y * 12 <= LAST; y++) years.push({ x: px(y * 12), label: short ? `’${String(FIRST_YEAR + y).slice(2)}` : String(FIRST_YEAR + y) })

  return {
    W,
    H,
    padL,
    padR,
    base,
    curve,
    px,
    py,
    line,
    area,
    ys,
    lineTop,
    years,
    ticks: tickValues.map((v) => ({ v, y: py(v), label: prefix + tickLabel(v) })),
    clipX: padL - 6,
  }
}

type Geometry = ReturnType<typeof buildGeometry>

// ———— 标注布局：在曲线上方找互不遮挡的位置 ————

type Size = { w: number; h: number }
type Rect = { x0: number; x1: number; top: number; bottom: number }
type Spot = { left: number; top: number; bottom: number; align: 'left' | 'right'; leaderTop: number }

const MIN_LIFT = 20
/** 引线的理想长度：太短显得挤，太长标注会飘离曲线。 */
const IDEAL_LIFT = 40
const CHIP_H = 26
/** 旗杆到旗面文字底衬的距离。 */
const FLAG_GAP = 6

function hits(a: Rect, b: Rect, gap: number) {
  return a.x0 < b.x1 + gap && a.x1 > b.x0 - gap && a.top < b.bottom + gap && a.bottom > b.top - gap
}

/**
 * 每个标注只有两种朝向（向右展开 / 向左展开），高度从最接近理想引线长度的开始试。
 * 约束：在曲线上方、不压住别的标注和引线、向右展开的标注不挡住随后经过的线头读数。
 * 用带剪枝的深度优先搜索找引线长度整体最接近理想值的组合：贪心逐个放会把早期挤在一起的里程碑堵死。
 */
function placeLabels(geo: Geometry, sizes: Size[], callout: boolean, chip: Size): Spot[] {
  const pins = MILESTONES.map((m) => ({ x: geo.px(m.at), y: geo.py(SERIES[m.at]) }))
  const inset = callout ? 16 : -FLAG_GAP
  // 旗杆文字没有卡片边框把彼此隔开：两段文字靠得太近、或者文字贴着别人的旗杆，就分不清哪段属于哪根杆。
  const labelGap = callout ? 10 : 18
  const leaderGap = callout ? 10 : 26
  const endX = geo.px(LAST)
  const endY = geo.py(SERIES[LAST])
  const chipRect: Rect = { x0: endX + 10 - chip.w, x1: endX + 10, top: endY - 12 - chip.h, bottom: endY - 12 }
  const chipTop = (X: number) => Math.min(geo.ys[Math.round(X)] ?? geo.base, geo.base - chip.h / 2 - 3) - chip.h / 2

  type Candidate = Spot & { cost: number; rect: Rect; leader: Rect }
  const candidates: Candidate[][] = pins.map((p, i) => {
    const { w, h } = sizes[i]
    const list: Candidate[] = []
    for (const align of ['right', 'left'] as const) {
      const left = align === 'left' ? p.x - inset : p.x + inset - w
      const right = left + w
      if (left < geo.padL - 4 || right > geo.W - 2) continue
      let maxBottom = Math.min(p.y - MIN_LIFT, geo.lineTop(left - 8, right + 8) - 12)
      if (align === 'left') for (let X = Math.ceil(p.x); X <= right - 10; X += 2) maxBottom = Math.min(maxBottom, chipTop(X) - 6)
      for (let bottom = maxBottom; bottom - h >= 0; bottom -= 4) {
        const top = bottom - h
        const leaderTop = callout ? bottom : top + 2
        list.push({
          left,
          top,
          bottom,
          align,
          leaderTop,
          // 同样的引线长度下略偏向「向左展开」：曲线左上方总是空的。
          cost: Math.abs(p.y - bottom - IDEAL_LIFT) + (align === 'right' ? 0 : 0.5),
          rect: { x0: left, x1: right, top, bottom },
          leader: { x0: p.x - 2, x1: p.x + 2, top: leaderTop, bottom: p.y - 7 },
        })
      }
    }
    return list.sort((a, b) => a.cost - b.cost)
  })

  const labels: Rect[] = [chipRect]
  const leaders: Rect[] = []
  const chosen: Candidate[] = []
  const best: { spots: Candidate[] | null; cost: number } = { spots: null, cost: Infinity }
  let visits = 0
  const search = (i: number, cost: number) => {
    if (i === pins.length) {
      if (cost < best.cost) {
        best.spots = [...chosen]
        best.cost = cost
      }
      return
    }
    for (const c of candidates[i]) {
      if (++visits > 160_000) return
      const next = cost + c.cost
      if (next >= best.cost) break
      if (labels.some((r) => hits(c.rect, r, labelGap) || hits(c.leader, r, leaderGap)) || leaders.some((r) => hits(c.rect, r, leaderGap))) continue
      labels.push(c.rect)
      leaders.push(c.leader)
      chosen[i] = c
      search(i + 1, next)
      labels.pop()
      leaders.pop()
    }
  }
  search(0, 0)
  if (best.spots) return best.spots

  // 怎么放都会重叠（极窄的图表）：每个标注取自己最好的位置，贴着点放，总比消失好。
  return pins.map((p, i) => {
    const own = candidates[i][0]
    if (own) return own
    const { w, h } = sizes[i]
    const left = Math.min(Math.max(geo.padL, p.x - inset), geo.W - w)
    const bottom = Math.max(h, p.y - MIN_LIFT)
    return { left, top: bottom - h, bottom, align: 'left' as const, leaderTop: callout ? bottom : bottom - h + 2 }
  })
}

/** 一条增长曲线讲公司故事：线从左往右画，在里程碑处停顿并弹出标注，线头读数跟着计数。 */
export function StatsAnnotatedGrowth({ className, style, replayKey, ...props }: StatsAnnotatedGrowthProps) {
  const { accent, curve, annotationStyle, drawDuration, showGrid, valuePrefix, metricLabel, heading } = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const ink = inkOn(accent)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const curveKind: Curve = curve === 'step' ? 'step' : 'smooth'
  const prefix = valuePrefix.trim()

  const hostRef = useRef<HTMLElement>(null)
  const plotRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = plotRef.current
    if (!el) return
    const measure = () => setWidth(Math.round(el.clientWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const W = width > 0 ? width : 960
  const narrow = W < 560
  // 平板宽度下曲线前段太平，四个标注只能沿着长引线叠成一摞楼梯：这时改用图下的编号列表。
  const listMode = annotationStyle === 'list' || W < LIST_BELOW
  const callout = annotationStyle !== 'label'
  // 列表模式下图下还有一排说明，图表本身矮一些，整个区块仍然一屏放得下。
  const H = narrow ? 240 : Math.round(listMode ? Math.min(340, Math.max(280, W * 0.3)) : Math.min(400, Math.max(300, W * 0.36)))

  const geo = useMemo(() => buildGeometry(W, H, curveKind, showGrid, prefix), [W, H, curveKind, showGrid, prefix])
  const timeline = useMemo(() => buildTimeline(drawDuration), [drawDuration])

  // 标注的真实尺寸（字体加载后会变），用来做避让布局。
  const labelRefs = useRef<(HTMLLIElement | null)[]>([])
  const [sizes, setSizes] = useState<Size[] | null>(null)
  useLayoutEffect(() => {
    if (listMode) return
    const read = () => {
      const next = MILESTONES.map((_, i) => ({ w: labelRefs.current[i]?.offsetWidth ?? 0, h: labelRefs.current[i]?.offsetHeight ?? 0 }))
      setSizes((prev) => (prev && prev.every((s, i) => s.w === next[i].w && s.h === next[i].h) ? prev : next))
    }
    read()
    const ro = new ResizeObserver(read)
    for (const el of labelRefs.current) if (el) ro.observe(el)
    return () => ro.disconnect()
  }, [listMode])

  const chip = useMemo<Size>(() => ({ w: 26 + (prefix.length + 5) * 8.4, h: CHIP_H }), [prefix])
  const spots = useMemo(() => {
    if (listMode) return []
    const fallback: Size = callout ? { w: 150, h: 56 } : { w: 130, h: 38 }
    const measured = MILESTONES.map((_, i) => (sizes?.[i]?.w ? sizes[i] : fallback))
    return placeLabels(geo, measured, callout, chip)
  }, [geo, sizes, callout, listMode, chip])

  // 帧循环里直接改 DOM：每帧只动几个属性，不触发 React 渲染。
  const clipRef = useRef<SVGRectElement>(null)
  const tipRef = useRef<SVGGElement>(null)
  const haloRef = useRef<SVGCircleElement>(null)
  const crossRef = useRef<SVGLineElement>(null)
  const endRippleRef = useRef<SVGCircleElement>(null)
  const chipRef = useRef<HTMLDivElement>(null)
  const chipInnerRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLSpanElement>(null)
  const pinRefs = useRef<(SVGGElement | null)[]>([])
  const rippleRefs = useRef<(SVGCircleElement | null)[]>([])
  const leaderRefs = useRef<(SVGLineElement | null)[]>([])
  const listRefs = useRef<(HTMLLIElement | null)[]>([])
  const dataRef = useRef<SVGGElement>(null)
  const notesRef = useRef<HTMLOListElement>(null)

  const clock = useRef(0)
  const origin = useRef(0)
  /** 正在淡出准备重播时，记下淡出开始的时刻；淡出结束才把故事拨回开头。 */
  const fadeFrom = useRef<number | null>(null)
  const live = useRef({ geo, timeline, prefix, reduced })
  live.current = { geo, timeline, prefix, reduced }

  const apply = () => {
    const { geo: g, timeline: tl, prefix: pre, reduced: still } = live.current
    let fade = 1
    if (fadeFrom.current !== null) {
      const k = (clock.current - fadeFrom.current) / REPLAY_FADE
      if (still || k >= 1) {
        origin.current = fadeFrom.current + REPLAY_FADE
        fadeFrom.current = null
      } else fade = 1 - easeInOut(clamp01(k))
    }
    const t = still ? STILL : Math.max(0, clock.current - origin.current)
    const xi = indexAt(tl, t)
    const value = valueAt(xi, g.curve)
    const X = g.px(xi)
    const Y = g.py(value)
    const appear = still ? 1 : easeOut(clamp01(t / 0.4))
    const show = String(appear * fade)
    // 只淡出曲线和标注：坐标轴、标题、说明留在原地，像同一张图在重播。
    const layer = fade.toFixed(3)
    if (dataRef.current) dataRef.current.style.opacity = layer
    if (notesRef.current) notesRef.current.style.opacity = layer

    clipRef.current?.setAttribute('width', Math.max(0, X - g.clipX + 1.5).toFixed(2))
    const tip = tipRef.current
    if (tip) {
      tip.setAttribute('transform', `translate(${X.toFixed(2)} ${Y.toFixed(2)})`)
      tip.style.opacity = show
    }
    const phase = (t % 1.8) / 1.8
    haloRef.current?.setAttribute('r', (5 + 12 * phase).toFixed(2))
    haloRef.current?.setAttribute('opacity', (0.42 * (1 - phase)).toFixed(3))
    const cross = crossRef.current
    if (cross) {
      cross.setAttribute('x1', X.toFixed(2))
      cross.setAttribute('x2', X.toFixed(2))
      cross.setAttribute('y1', Math.min(g.base, Y + 9).toFixed(2))
      // 十字线在曲线图层里，图层本身会淡出。
      cross.style.opacity = String(appear)
    }

    // 读数贴在线头右侧；接近终点时翻到左上方，停在曲线上方的空白里。
    const f = smoothstep(clamp01(1 - (g.px(LAST) - X - 6) / 90))
    const fy = smoothstep(clamp01(f * 1.6))
    const cy = Y + (1 - fy) * Math.min(0, g.base - CHIP_H / 2 - 3 - Y)
    const chipEl = chipRef.current
    if (chipEl) {
      chipEl.style.transform = `translate3d(${X.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`
      chipEl.style.opacity = show
    }
    const inner = chipInnerRef.current
    if (inner) {
      inner.style.transform = `translate(calc(10px - ${(100 * f).toFixed(2)}%), calc(${(-50 - 50 * fy).toFixed(2)}% - ${(12 * fy).toFixed(2)}px))`
      const text = pre + compactNumber(value)
      if (inner.textContent !== text) inner.textContent = text
    }
    const date = monthLabel(Math.round(xi))
    if (dateRef.current && dateRef.current.textContent !== date) dateRef.current.textContent = date

    for (let i = 0; i < MILESTONES.length; i++) {
      const l = still ? STILL : t - tl.reach[i]
      const m = MILESTONES[i]
      const px = g.px(m.at)
      const py = g.py(SERIES[m.at])
      const pop = l <= 0 ? 0 : backOut(clamp01(l / 0.5))
      pinRefs.current[i]?.setAttribute('transform', `translate(${px.toFixed(2)} ${py.toFixed(2)}) scale(${pop.toFixed(3)})`)
      const ripple = rippleRefs.current[i]
      if (ripple) {
        const r = clamp01(l / 0.9)
        ripple.setAttribute('r', (6 + 20 * easeOut(r)).toFixed(2))
        ripple.setAttribute('opacity', l <= 0 || r >= 1 ? '0' : (0.55 * (1 - r)).toFixed(3))
      }
      leaderRefs.current[i]?.setAttribute('stroke-dashoffset', (1 - easeOut(clamp01((l - 0.08) / 0.35))).toFixed(3))
      const label = labelRefs.current[i]
      if (label) {
        const q = easeOut(clamp01((l - 0.2) / 0.45))
        label.style.opacity = q.toFixed(3)
        label.style.transform = `translateY(${((1 - q) * 8).toFixed(2)}px)`
      }
      // 列表项不跟着整层淡出（那样整排说明会闪一下），只退回「还没讲到」的浅色。
      const item = listRefs.current[i]
      if (item) item.style.opacity = (0.38 + 0.62 * easeOut(clamp01(l / 0.45)) * fade).toFixed(3)
    }

    const end = endRippleRef.current
    if (end) {
      const l = still ? STILL : t - tl.end
      const r = clamp01(l / 1.1)
      end.setAttribute('r', (7 + 26 * easeOut(r)).toFixed(2))
      end.setAttribute('opacity', l <= 0 || r >= 1 ? '0' : (0.6 * (1 - r)).toFixed(3))
    }
  }

  useFrameLoop(
    hostRef,
    ({ time }) => {
      clock.current = time
      apply()
    },
    { reducedMotion: 'static', staticTime: 0 },
  )
  // 尺寸或参数变化后重新渲染了 DOM，按当前时刻补画一帧（静止模式下帧循环不会再跑）。
  useLayoutEffect(() => apply())

  const replay = () => {
    if (fadeFrom.current === null) fadeFrom.current = clock.current
  }
  const lastKey = useRef(replayKey)
  useEffect(() => {
    if (Object.is(lastKey.current, replayKey)) return
    lastKey.current = replayKey
    if (fadeFrom.current === null) fadeFrom.current = clock.current
  }, [replayKey])

  const enter = (delay: number) => ({
    initial: reduced ? (false as const) : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  const first = monthLabel(0)
  const finalValue = prefix + compactNumber(SERIES[LAST])
  const chartLabel = `${metricLabel} from ${first} to ${monthLabel(LAST)}, rising from ${prefix}${compactNumber(SERIES[0])} to ${finalValue}.`
  const endX = geo.px(LAST)
  const endY = geo.py(SERIES[LAST])

  return (
    <section
      ref={hostRef}
      className={cn('@container relative w-full overflow-hidden text-foreground', className)}
      style={cssVars({ '--acc': accent, '--surface': 'color-mix(in oklab, var(--card) 55%, var(--background))' }, { fontFamily: SANS, ...style })}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(48% 42% at 78% 38%, color-mix(in oklab, var(--acc) 10%, transparent), transparent 72%)' }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 @3xl:px-8 @3xl:py-16">
        <motion.header {...enter(0)} className="grid gap-5 @4xl:grid-cols-[1.4fr_1fr] @4xl:items-end @4xl:gap-14">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              <span className="size-1.5 rounded-full" style={{ background: accent }} />
              Our story
            </p>
            <h2 className="mt-4 text-[2.15rem] leading-[1.04] text-balance @xl:text-5xl @5xl:text-[3.4rem]" style={{ fontFamily: SERIF, letterSpacing: '-0.012em' }}>
              {heading}
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-pretty text-muted-foreground @4xl:justify-self-end @4xl:pb-1.5">{SUBHEADING}</p>
        </motion.header>

        <motion.figure {...enter(0.1)} className="mt-9 rounded-2xl border p-3 @xl:p-5 @3xl:mt-11 @3xl:p-6" style={{ background: 'var(--surface)' }}>
          <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
            <span className="flex min-w-0 items-center gap-2.5 text-[13px] font-medium">
              <span aria-hidden className="h-[3px] w-4 shrink-0 rounded-full" style={{ background: accent }} />
              <span className="truncate">{metricLabel}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums" style={{ fontFamily: MONO }}>
                {first} – <span ref={dateRef} />
              </span>
              {!reduced && (
                <button
                  type="button"
                  onClick={replay}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M2.5 8a5.5 5.5 0 1 0 1.7-3.98" />
                    <path d="M2.5 2.5v3h3" />
                  </svg>
                  Replay
                </button>
              )}
            </span>
          </figcaption>

          <div ref={plotRef} className="relative mt-4" style={{ height: H }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 block overflow-visible text-foreground" role="img" aria-label={chartLabel}>
              <defs>
                <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={accent} stopOpacity="0.34" />
                  <stop offset="0.7" stopColor={accent} stopOpacity="0.06" />
                  <stop offset="1" stopColor={accent} stopOpacity="0" />
                </linearGradient>
                <clipPath id={`${uid}-clip`}>
                  <rect ref={clipRef} x={geo.clipX} y={-16} width={0} height={H + 32} />
                </clipPath>
              </defs>

              {showGrid &&
                geo.ticks.map((tick) => (
                  <g key={tick.v}>
                    <line x1={geo.padL} x2={W - geo.padR} y1={tick.y} y2={tick.y} stroke="currentColor" strokeOpacity={0.08} strokeDasharray="3 5" />
                    <text x={geo.padL - 12} y={tick.y + 3.5} textAnchor="end" className="fill-muted-foreground" style={{ fontFamily: MONO, fontSize: 10.5 }}>
                      {tick.label}
                    </text>
                  </g>
                ))}
              <line x1={geo.padL} x2={W - geo.padR} y1={geo.base} y2={geo.base} stroke="currentColor" strokeOpacity={0.16} />
              {geo.years.map((year, i) => (
                <g key={year.label}>
                  <line x1={year.x} x2={year.x} y1={geo.base} y2={geo.base + 4} stroke="currentColor" strokeOpacity={0.22} />
                  <text x={year.x} y={geo.base + 18} textAnchor={i === 0 && geo.padL < 16 ? 'start' : 'middle'} className="fill-muted-foreground" style={{ fontFamily: MONO, fontSize: 10.5 }}>
                    {year.label}
                  </text>
                </g>
              ))}

              <g ref={dataRef}>
                <g clipPath={`url(#${uid}-clip)`}>
                  <path d={geo.area} fill={`url(#${uid}-fill)`} />
                  <path d={geo.line} fill="none" stroke={accent} strokeOpacity={0.16} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
                  <path d={geo.line} fill="none" stroke={accent} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
                </g>

                <line ref={crossRef} y2={geo.base} stroke={accent} strokeOpacity={0.5} strokeDasharray="2 4" style={{ opacity: 0 }} />

                {!listMode &&
                  MILESTONES.map((m, i) => {
                    const spot = spots[i]
                    if (!spot) return null
                    const x = geo.px(m.at)
                    return (
                      <line
                        key={m.at}
                        ref={(el) => {
                          leaderRefs.current[i] = el
                        }}
                        x1={x}
                        x2={x}
                        y1={geo.py(SERIES[m.at]) - 8}
                        y2={spot.leaderTop}
                        pathLength={1}
                        strokeDasharray="1 1"
                        strokeDashoffset={1}
                        stroke="currentColor"
                        strokeOpacity={0.34}
                      />
                    )
                  })}

                {MILESTONES.map((m, i) => (
                  <circle
                    key={m.at}
                    ref={(el) => {
                      rippleRefs.current[i] = el
                    }}
                    cx={geo.px(m.at)}
                    cy={geo.py(SERIES[m.at])}
                    r={6}
                    fill="none"
                    stroke={accent}
                    strokeWidth={1.5}
                    opacity={0}
                  />
                ))}
                <circle ref={endRippleRef} cx={endX} cy={endY} r={7} fill="none" stroke={accent} strokeWidth={1.5} opacity={0} />

                {MILESTONES.map((m, i) => (
                  <g
                    key={m.at}
                    ref={(el) => {
                      pinRefs.current[i] = el
                    }}
                    transform={`translate(${geo.px(m.at)} ${geo.py(SERIES[m.at])}) scale(0)`}
                  >
                    {listMode ? (
                      <>
                        <circle r={9.5} fill={accent} style={{ stroke: 'var(--surface)' }} strokeWidth={2.5} />
                        <text textAnchor="middle" dy="0.35em" fill={ink} style={{ fontSize: 10.5, fontWeight: 650 }}>
                          {i + 1}
                        </text>
                      </>
                    ) : (
                      <>
                        <circle r={6} style={{ fill: 'var(--surface)' }} stroke={accent} strokeWidth={2.2} />
                        <circle r={2.2} fill={accent} />
                      </>
                    )}
                  </g>
                ))}
              </g>

              <g ref={tipRef} style={{ opacity: 0 }}>
                <circle ref={haloRef} r={6} fill={accent} opacity={0.3} />
                <circle r={5} fill={accent} style={{ stroke: 'var(--surface)' }} strokeWidth={2.5} />
              </g>
            </svg>

            {!listMode && (
              <ol ref={notesRef} aria-label="Milestones" className="pointer-events-none absolute inset-0 m-0 list-none p-0">
                {MILESTONES.map((m, i) => {
                  const spot = spots[i]
                  const right = spot?.align === 'right'
                  return (
                    <li
                      key={m.at}
                      ref={(el) => {
                        labelRefs.current[i] = el
                      }}
                      className={cn(
                        'absolute w-max whitespace-nowrap',
                        callout ? 'rounded-xl border bg-card px-3 py-2 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.6)]' : 'rounded-md px-1.5 py-1',
                        right && !callout && 'text-right',
                      )}
                      // 旗杆文字垫一层半透明的卡片底色：网格虚线不会从字中间穿过。
                      style={{ left: spot?.left ?? 0, top: spot?.top ?? 0, opacity: 0, background: callout ? undefined : 'color-mix(in oklab, var(--surface) 86%, transparent)' }}
                    >
                      <p className={cn('flex items-center gap-2 text-[10.5px] tracking-[0.08em] text-muted-foreground', right && !callout && 'justify-end')} style={{ fontFamily: MONO }}>
                        <span className="uppercase">{monthLabel(m.at)}</span>
                        <span aria-hidden className="size-[3px] rounded-full bg-current opacity-60" />
                        <span className="text-foreground/80 tabular-nums">{prefix + compactNumber(SERIES[m.at])}</span>
                      </p>
                      <p className="mt-1 text-[13.5px] leading-tight font-medium">{m.title}</p>
                      {/* 图上只放得下标题：完整的一句话留给读屏软件，窄屏的列表模式里则直接显示。 */}
                      <p className="sr-only">{m.body}</p>
                    </li>
                  )
                })}
              </ol>
            )}

            <div ref={chipRef} aria-hidden className="pointer-events-none absolute top-0 left-0 size-0" style={{ opacity: 0 }}>
              <div
                ref={chipInnerRef}
                className="w-max rounded-full px-3 text-[14px] leading-[26px] font-semibold whitespace-nowrap tabular-nums shadow-[0_6px_18px_-6px_rgba(0,0,0,0.55)]"
                style={{ background: accent, color: ink, height: CHIP_H }}
              />
            </div>
          </div>

          {listMode && (
            <ol aria-label="Milestones" className="mt-5 grid list-none gap-x-8 gap-y-5 border-t px-1 pt-5 @xl:grid-cols-2 @5xl:grid-cols-4">
              {MILESTONES.map((m, i) => (
                <li
                  key={m.at}
                  ref={(el) => {
                    listRefs.current[i] = el
                  }}
                  className="flex gap-3"
                  style={{ opacity: 0.38 }}
                >
                  <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums" style={{ background: accent, color: ink }}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10.5px] tracking-[0.08em] text-muted-foreground" style={{ fontFamily: MONO }}>
                      <span className="uppercase">{monthLabel(m.at)}</span> · <span className="text-foreground/80 tabular-nums">{prefix + compactNumber(SERIES[m.at])}</span>
                    </p>
                    <p className="mt-1 text-sm font-medium">{m.title}</p>
                    <p className="mt-1 text-[13px] leading-snug text-pretty text-muted-foreground">{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </motion.figure>
      </div>
    </section>
  )
}
