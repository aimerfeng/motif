import { cn, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useMemo, useRef, type CSSProperties, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  eyebrow: 'How Halyard works',
  accent: '#ffb547',
  tone: 'dark',
  font: 'serif',
  layout: 'right',
  pace: 1,
  smooth: 0.4,
  ease: [0.65, 0, 0.35, 1],
  stagger: 0.35,
}
/* @motif:end */

export interface Chapter {
  /** 进度条上的短标签。 */
  label: string
  title: string
  body: string
}

export const CHAPTERS: Chapter[] = [
  {
    label: 'Collect',
    title: 'Every event, as it happens.',
    body: 'Add one line to your app and Halyard starts receiving clicks, errors and payments within a second. Nothing is sampled away.',
  },
  {
    label: 'Sort',
    title: 'Sorted before you ask.',
    body: 'Events fall into streams by user, release and region, so a busy afternoon reads like a ledger instead of a firehose.',
  },
  {
    label: 'Connect',
    title: 'Traced end to end.',
    body: 'A checkout that failed in Lisbon links back to the deploy that caused it and to the three customers it reached.',
  },
  {
    label: 'Answer',
    title: 'One chart for the meeting.',
    body: 'Pin the answer and share the link. The chart keeps itself current until someone closes the question.',
  },
]

export type ScrollStoryProps = Partial<typeof defaults> & {
  /** 章节内容；点阵的四种排布按章节顺序循环使用。 */
  chapters?: Chapter[]
  className?: string
  style?: CSSProperties
}

const FONTS: Record<string, string> = {
  serif: "'Instrument Serif', 'Songti SC', serif",
  grotesk: "'Bricolage Grotesque Variable', 'PingFang SC', sans-serif",
  sans: "'Inter Tight Variable', 'PingFang SC', sans-serif",
}
const BODY_FONT = "'Inter Tight Variable', 'PingFang SC', sans-serif"
const TONES = {
  dark: { background: '#0e0f12', ink: '#f2efe8' },
  light: { background: '#f4f0e8', ink: '#18171c' },
}

/** 第一章之前、最后一章之后各多留的滚动距离（按章计），首尾两章也有停留的余地。 */
const LEAD = 0.25
/** 每段切换两端停住的比例：停住时文字完整可读，中间那段才是变形。 */
const HOLD = 0.2

interface Dot {
  x: number
  y: number
  r: number
  o: number
}

const COUNT = 24
const LANES = [27, 42, 57, 72]
// 每条流里事件的时刻：故意不等距，像真实的事件流。
const LANE_TIMES = [
  [16, 25, 38, 47, 63, 80],
  [20, 33, 41, 56, 70, 84],
  [16, 29, 45, 52, 66, 77],
  [22, 31, 43, 59, 72, 84],
]
const BARS = [2, 3, 5, 4, 6, 4]
const BAR_X = (column: number) => 22 + column * 11.2
const BAR_Y = (row: number) => 77 - row * 9
const BASELINE = 83
const HIGHLIGHT = BARS.indexOf(Math.max(...BARS))
const RING = { cx: 50, cy: 50, radius: 30 }

/** 可复现的伪随机数（mulberry32）：散点每次渲染都一样，服务端和客户端也一样。 */
function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function scatter(): Dot[] {
  const next = random(11)
  const dots: Dot[] = []
  // 带最小间距的随机撒点：看起来随机，又不会挤成一团。
  for (let tries = 0; dots.length < COUNT && tries < 5000; tries++) {
    const x = 14 + next() * 72
    const y = 14 + next() * 72
    if (dots.every((dot) => Math.hypot(dot.x - x, dot.y - y) > 10)) dots.push({ x, y, r: 1.1 + next() * 2.1, o: 0.35 + next() * 0.65 })
  }
  return dots
}

const streams = (): Dot[] => LANES.flatMap((y, lane) => LANE_TIMES[lane]!.map((x) => ({ x, y, r: 2.2, o: lane % 2 ? 0.7 : 1 })))

const ring = (): Dot[] =>
  Array.from({ length: COUNT }, (_, index) => {
    const angle = -Math.PI / 2 + (index / COUNT) * Math.PI * 2
    return { x: RING.cx + Math.cos(angle) * RING.radius, y: RING.cy + Math.sin(angle) * RING.radius, r: 1.7, o: 0.9 }
  })

const bars = (): Dot[] => BARS.flatMap((height, column) => Array.from({ length: height }, (_, row) => ({ x: BAR_X(column), y: BAR_Y(row), r: 2.5, o: column === HIGHLIGHT ? 1 : 0.42 })))

/**
 * 把下一种排布的落点分给上一种排布里的点：每次取全局最近的一对（贪心匹配）。
 * 这样每个点只走近路，变形读起来是「重新归队」而不是满屏乱飞。
 */
function match(previous: Dot[], slots: Dot[]): Dot[] {
  const pairs = previous.flatMap((from, a) => slots.map((to, b) => ({ a, b, distance: Math.hypot(from.x - to.x, from.y - to.y) })))
  pairs.sort((one, two) => one.distance - two.distance)
  const result: (Dot | undefined)[] = Array.from({ length: previous.length })
  const taken = new Set<number>()
  for (const { a, b } of pairs) {
    if (result[a] || taken.has(b)) continue
    result[a] = slots[b]
    taken.add(b)
  }
  return result as Dot[]
}

// 四种排布按点的编号对齐：LAYOUTS[k][i] 是第 i 个点在第 k 种排布里的位置。
const LAYOUTS: Dot[][] = [scatter()]
for (const build of [streams, ring, bars]) LAYOUTS.push(match(LAYOUTS.at(-1)!, build()))
// 环形那一段按角度连线：记下点在环上的顺序。
const RING_ORDER = LAYOUTS[2]!.map((dot, index) => ({ index, angle: Math.atan2(dot.y - RING.cy, dot.x - RING.cx) }))
  .sort((a, b) => a.angle - b.angle)
  .map(({ index }) => index)
// 「追踪」那一段跨过圆心的几条连线（按环上的位置取点）。
const CHORDS = [
  [0, 9],
  [4, 15],
  [7, 19],
  [12, 22],
].map(([a, b]) => [RING_ORDER[a!]!, RING_ORDER[b!]!] as const)
// 连线两端的点画大一点：它们是被「追踪」到的那几个事件。
for (const index of new Set(CHORDS.flat())) LAYOUTS[2]![index] = { ...LAYOUTS[2]![index]!, r: 2.8, o: 1 }
// 散点那一段会冒出涟漪的点。
const PULSES = [3, 10, 18]

/** CSS cubic-bezier(x1, y1, x2, y2)：先用牛顿法由 x 求参数 t，再算 y。 */
function bezier([x1, y1, x2, y2]: readonly number[]): (x: number) => number {
  const cx = 3 * x1!
  const bx = 3 * (x2! - x1!) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1!
  const by = 3 * (y2! - y1!) - cy
  const ay = 1 - cy - by
  const curveX = (t: number) => ((ax * t + bx) * t + cx) * t
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const slope = slopeX(t)
      if (Math.abs(slope) < 1e-6) break
      t -= (curveX(t) - x) / slope
    }
    t = Math.min(Math.max(t, 0), 1)
    return ((ay * t + by) * t + cy) * t
  }
}

const clamp = (value: number) => Math.min(Math.max(value, 0), 1)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

interface Pose {
  dots: Dot[]
  /** 四种排布各自的装饰层（事件流的线、环上的连线、柱子）显示多少。 */
  weights: number[]
  /** 停留处理并缓动后的章节位置，0 … n-1，文字、计数器都跟它走。 */
  chapter: number
}

/**
 * 连续的章节进度 → 这一刻的画面。
 * 每段两端停住（HOLD），中间那段按缓动变形；点按从左到右的顺序错开出发（stagger）。
 */
function poseAt(progress: number, count: number, ease: (x: number) => number, stagger: number): Pose {
  const last = Math.max(count - 1, 0)
  const clamped = Math.min(Math.max(progress, 0), last)
  const base = Math.max(Math.min(Math.floor(clamped), last - 1), 0)
  const next = Math.min(base + 1, last)
  const t = next === base ? 0 : clamp((clamped - base - HOLD) / (1 - 2 * HOLD))
  const from = LAYOUTS[base % LAYOUTS.length]!
  const to = LAYOUTS[next % LAYOUTS.length]!
  const dots = from.map((a, index) => {
    const b = to[index]!
    const order = clamp((a.x - 14) / 72)
    const local = ease(clamp((t - stagger * order) / Math.max(1 - stagger, 1e-3)))
    return { x: lerp(a.x, b.x, local), y: lerp(a.y, b.y, local), r: lerp(a.r, b.r, local), o: lerp(a.o, b.o, local) }
  })
  const chapter = base + ease(t)
  const weights = [0, 0, 0, 0]
  for (let k = 0; k < count; k++) weights[k % LAYOUTS.length]! += clamp(1 - Math.abs(chapter - k))
  return { dots, weights, chapter }
}

const ringPath = (dots: Dot[]) => `M${RING_ORDER.map((index) => `${dots[index]!.x.toFixed(2)} ${dots[index]!.y.toFixed(2)}`).join('L')}Z`
const chordPath = (dots: Dot[]) => CHORDS.map(([a, b]) => `M${dots[a]!.x.toFixed(2)} ${dots[a]!.y.toFixed(2)}L${dots[b]!.x.toFixed(2)} ${dots[b]!.y.toFixed(2)}`).join('')

interface SceneRefs {
  dots: (SVGCircleElement | null)[]
  pulses: (SVGCircleElement | null)[]
  lanes: SVGGElement | null
  ring: SVGPathElement | null
  chords: SVGPathElement | null
  bars: SVGGElement | null
}

/** 点阵画面。动画版传入 refs，之后每帧直接改属性；减少动态效果时按某一章静态渲染。 */
function Scene({ pose, accent, ink, refs }: { pose: Pose; accent: string; ink: string; refs?: RefObject<SceneRefs> }) {
  const { dots, weights } = pose
  return (
    <svg viewBox="6 6 88 88" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden>
      <g
        ref={(element) => {
          if (refs) refs.current.lanes = element
        }}
        opacity={weights[1]}
        stroke={ink}
        strokeOpacity={0.16}
        strokeWidth={0.35}
      >
        {LANES.map((y) => (
          <line key={y} x1={10} x2={90} y1={y} y2={y} />
        ))}
      </g>
      <g
        ref={(element) => {
          if (refs) refs.current.bars = element
        }}
        opacity={weights[3]}
      >
        {BARS.map((height, column) => (
          <rect key={column} x={BAR_X(column) - 3.8} width={7.6} y={BAR_Y(height - 1) - 4.6} height={BASELINE - BAR_Y(height - 1) + 4.6} rx={1.6} fill={accent} fillOpacity={column === HIGHLIGHT ? 0.2 : 0.08} />
        ))}
        <line x1={12} x2={88} y1={BASELINE + 2.4} y2={BASELINE + 2.4} stroke={ink} strokeOpacity={0.3} strokeWidth={0.35} />
      </g>
      <path
        ref={(element) => {
          if (refs) refs.current.ring = element
        }}
        d={ringPath(dots)}
        opacity={weights[2]}
        fill="none"
        stroke={accent}
        strokeOpacity={0.45}
        strokeWidth={0.4}
      />
      <path
        ref={(element) => {
          if (refs) refs.current.chords = element
        }}
        d={chordPath(dots)}
        opacity={weights[2]}
        fill="none"
        stroke={accent}
        strokeOpacity={0.6}
        strokeWidth={0.35}
        strokeDasharray="1.2 1.2"
      />
      {refs &&
        PULSES.map((index, position) => (
          <circle
            key={index}
            ref={(element) => {
              refs.current.pulses[position] = element
            }}
            cx={dots[index]!.x}
            cy={dots[index]!.y}
            r={0}
            fill="none"
            stroke={accent}
            strokeWidth={0.35}
            opacity={0}
          />
        ))}
      {dots.map((dot, index) => (
        <circle
          key={index}
          ref={(element) => {
            if (refs) refs.current.dots[index] = element
          }}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          opacity={dot.o}
          fill={accent}
        />
      ))}
    </svg>
  )
}

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * 滚动叙事：整段滚动期间画面钉在视口里，内容按滚动进度逐章切换。
 * 进度来自舞台和外层 section 的相对位置（不关心滚动容器是谁），带一段可调的跟手延迟；
 * 每帧直接写属性，不触发 React 重渲染。开启「减少动态效果」时不再钉住，四章按顺序静态排开。
 */
export function ScrollStory({ className, style, chapters = CHAPTERS, ...props }: ScrollStoryProps) {
  const options = { ...defaults, ...props }
  const { eyebrow, accent, tone, font, layout, pace, smooth, ease, stagger } = options
  const { background, ink } = TONES[tone as keyof typeof TONES] ?? TONES.dark
  const reduced = usePrefersReducedMotion()
  const easing = useMemo(() => bezier(ease), [ease])
  const count = chapters.length

  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const scene = useRef<SceneRefs>({ dots: [], pulses: [], lanes: null, ring: null, chords: null, bars: null })
  const blocks = useRef<(HTMLDivElement | null)[]>([])
  const labels = useRef<(HTMLSpanElement | null)[]>([])
  const counter = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const shown = useRef<number | null>(null)

  useFrameLoop(
    section,
    ({ time, delta }) => {
      const outer = section.current?.getBoundingClientRect()
      const inner = stage.current?.getBoundingClientRect()
      if (!outer || !inner) return
      const range = outer.height - inner.height
      const target = range > 0 ? clamp((inner.top - outer.top) / range) : 0
      // 指数逼近：smooth 秒内追上约 95%。第一帧直接对齐，不从 0 滑过来。
      const alpha = smooth > 0 ? 1 - Math.exp((-3 * delta) / smooth) : 1
      const current = shown.current === null ? target : shown.current + (target - shown.current) * alpha
      shown.current = current

      const progress = -LEAD + current * (count - 1 + 2 * LEAD)
      const pose = poseAt(progress, count, easing, stagger)
      const refs = scene.current
      pose.dots.forEach((dot, index) => {
        const element = refs.dots[index]
        if (!element) return
        element.setAttribute('cx', dot.x.toFixed(2))
        element.setAttribute('cy', dot.y.toFixed(2))
        element.setAttribute('r', dot.r.toFixed(2))
        element.setAttribute('opacity', dot.o.toFixed(3))
      })
      PULSES.forEach((index, position) => {
        const element = refs.pulses[position]
        const dot = pose.dots[index]
        if (!element || !dot) return
        const phase = (time * 0.55 + position * 0.37) % 1
        element.setAttribute('cx', dot.x.toFixed(2))
        element.setAttribute('cy', dot.y.toFixed(2))
        element.setAttribute('r', (dot.r + phase * 9).toFixed(2))
        element.setAttribute('opacity', ((1 - phase) * 0.7 * pose.weights[0]!).toFixed(3))
      })
      refs.lanes?.setAttribute('opacity', pose.weights[1]!.toFixed(3))
      refs.bars?.setAttribute('opacity', pose.weights[3]!.toFixed(3))
      refs.ring?.setAttribute('opacity', pose.weights[2]!.toFixed(3))
      refs.chords?.setAttribute('opacity', pose.weights[2]!.toFixed(3))
      if (pose.weights[2]! > 0) {
        refs.ring?.setAttribute('d', ringPath(pose.dots))
        refs.chords?.setAttribute('d', chordPath(pose.dots))
      }

      blocks.current.slice(0, count).forEach((element, index) => {
        if (!element) return
        const offset = pose.chapter - index
        const opacity = clamp(1 - Math.abs(offset) * 1.8)
        element.style.opacity = opacity.toFixed(3)
        element.style.transform = `translate3d(0, ${(-offset * 40).toFixed(2)}px, 0)`
        element.style.visibility = opacity > 0 ? 'visible' : 'hidden'
      })
      labels.current.slice(0, count).forEach((element, index) => {
        if (element) element.style.opacity = (0.38 + 0.62 * clamp(1 - Math.abs(pose.chapter - index))).toFixed(3)
      })
      if (counter.current) counter.current.style.transform = `translate3d(0, ${(-pose.chapter).toFixed(4)}em, 0)`
      if (fill.current) fill.current.style.transform = `scaleX(${clamp(progress / Math.max(count - 1, 1)).toFixed(4)})`
    },
    { reducedMotion: 'static' },
  )

  const display = FONTS[font] ?? FONTS.serif
  const line = `color-mix(in oklab, ${ink} 12%, transparent)`
  const panel = `color-mix(in oklab, ${ink} 3%, transparent)`
  const total = pad(count)

  if (reduced) {
    return (
      <section className={cn('@container', className)} style={{ background, color: ink, fontFamily: BODY_FONT, ...style }}>
        <div className="mx-auto max-w-6xl px-6 py-16 @3xl:px-12 @3xl:py-24">
          <p className="text-[13px] font-medium tracking-[0.14em] uppercase" style={{ color: accent }}>
            {eyebrow}
          </p>
          <ol className="mt-10 grid gap-14 @3xl:gap-20">
            {chapters.map((chapter, index) => (
              <li key={index} className="grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-14">
                <div className={cn(layout === 'left' && '@3xl:order-last')}>
                  <p className="font-mono text-[13px] tabular-nums" style={{ color: accent }}>
                    {pad(index + 1)} / {total}
                  </p>
                  <h3 className="mt-4 text-[clamp(2rem,5.4cqw,4.25rem)] leading-[1.02] tracking-[-0.01em] text-balance" style={{ fontFamily: display }}>
                    {chapter.title}
                  </h3>
                  <p className="mt-5 max-w-[36ch] text-[15px] leading-relaxed opacity-70 @3xl:text-[17px]">{chapter.body}</p>
                </div>
                <div className="relative aspect-[4/3] rounded-[28px] border" style={{ borderColor: line, background: panel }}>
                  <Scene pose={poseAt(index, count, easing, stagger)} accent={accent} ink={ink} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  const first = poseAt(-LEAD, count, easing, stagger)
  return (
    <section ref={section} className={cn('relative', className)} style={{ height: `calc(100svh + ${((count - 1 + 2 * LEAD) * pace * 100).toFixed(1)}svh)`, background, color: ink, fontFamily: BODY_FONT, ...style }}>
      <div ref={stage} className="@container sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto grid h-full max-w-6xl grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-5 px-5 py-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] @3xl:grid-rows-1 @3xl:gap-14 @3xl:px-12 @3xl:py-14">
          {/* 窄屏时这一列 display: contents，子元素直接进外层网格：小标题、画面、正文、进度条从上到下。 */}
          <div className={cn('contents @3xl:flex @3xl:min-h-0 @3xl:flex-col @3xl:justify-between @3xl:gap-6 @3xl:py-2', layout === 'left' ? '@3xl:order-last' : '@3xl:order-first')}>
            <p className="order-1 flex items-center gap-3 text-[13px] font-medium tracking-[0.14em] uppercase" style={{ color: accent }}>
              <span className="inline-flex items-center font-mono leading-none tracking-normal tabular-nums">
                <span className="relative block h-[1em] overflow-hidden">
                  <span ref={counter} className="flex flex-col will-change-transform">
                    {chapters.map((_, index) => (
                      <span key={index} className="h-[1em] leading-none">
                        {pad(index + 1)}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="opacity-60">&nbsp;/ {total}</span>
              </span>
              <span className="h-px w-8 bg-current opacity-40" />
              <span className="truncate">{eyebrow}</span>
            </p>
            <div className="order-3 grid">
              {chapters.map((chapter, index) => (
                <div
                  key={index}
                  ref={(element) => {
                    blocks.current[index] = element
                  }}
                  className="[grid-area:1/1] will-change-transform"
                  style={{ opacity: index === 0 ? 1 : 0, visibility: index === 0 ? 'visible' : 'hidden' }}
                >
                  <h3 className="text-[clamp(2rem,6cqw,4.5rem)] leading-[1.02] tracking-[-0.01em] text-balance" style={{ fontFamily: display }}>
                    {chapter.title}
                  </h3>
                  <p className="mt-4 max-w-[36ch] text-[15px] leading-relaxed opacity-70 @3xl:mt-6 @3xl:text-[17px]">{chapter.body}</p>
                </div>
              ))}
            </div>
            <div className="order-4" aria-hidden>
              <div className="grid text-[12px] font-medium" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
                {chapters.map((chapter, index) => (
                  <span
                    key={index}
                    ref={(element) => {
                      labels.current[index] = element
                    }}
                    className="truncate pr-2"
                    style={{ opacity: index === 0 ? 1 : 0.38 }}
                  >
                    {chapter.label}
                  </span>
                ))}
              </div>
              <span className="relative mt-3 block h-px" style={{ background: line }}>
                <span ref={fill} className="absolute inset-0 origin-left will-change-transform" style={{ background: accent, transform: 'scaleX(0)' }} />
              </span>
            </div>
          </div>
          <div className="relative order-2 min-h-0 rounded-[28px] border @3xl:my-auto @3xl:aspect-square @3xl:max-h-full" style={{ borderColor: line, background: panel }}>
            <Scene pose={first} accent={accent} ink={ink} refs={scene} />
          </div>
        </div>
      </div>
    </section>
  )
}
