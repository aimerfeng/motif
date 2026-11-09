import { useFrameLoop } from '@motif/runtime'
import { frame, motionValue } from 'motion/react'
import { useId, useLayoutEffect, useRef, useState, type ComponentType } from 'react'
import { PolaroidArena, PolaroidCard, PolaroidGallery, type PolaroidCardProps, type PolaroidGalleryProps } from './polaroid-table'

type Point = [number, number]

// ---- 现画的三张「照片」 ----

function DreamScene() {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="A pale moon over violet hills at dusk">
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5f63c0" />
          <stop offset="0.55" stopColor="#c3a2de" />
          <stop offset="1" stopColor="#f8cbd3" />
        </linearGradient>
        <radialGradient id={`${id}glow`}>
          <stop offset="0" stopColor="#fff4e2" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff4e2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}sky)`} />
      <circle cx="68" cy="31" r="24" fill={`url(#${id}glow)`} />
      <circle cx="68" cy="31" r="8.5" fill="#fff5e6" />
      {[
        [14, 12, 0.7],
        [26, 24, 0.5],
        [40, 9, 0.6],
        [86, 14, 0.45],
        [52, 20, 0.4],
        [9, 33, 0.35],
      ].map(([cx, cy, o]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.7" fill="#fff" opacity={o} />
      ))}
      <ellipse cx="30" cy="50" rx="22" ry="3.2" fill="#fff" opacity="0.28" />
      <ellipse cx="78" cy="56" rx="18" ry="2.6" fill="#fff" opacity="0.22" />
      <path d="M0 70 C 18 60 34 61 50 67 S 82 58 100 64 V100 H0Z" fill="#8f7cc6" />
      <path d="M0 80 C 24 71 44 84 68 77 S 92 72 100 76 V100 H0Z" fill="#5f509f" />
      <path d="M0 90 C 28 85 60 95 100 87 V100 H0Z" fill="#372f6d" />
    </svg>
  )
}

function GardenScene() {
  const id = useId()
  return (
    <svg viewBox="0 0 75 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Wildflowers on a dune above a calm sea">
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fbedb" />
          <stop offset="1" stopColor="#f6e3c6" />
        </linearGradient>
        <linearGradient id={`${id}sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f86ad" />
          <stop offset="1" stopColor="#76c3cf" />
        </linearGradient>
        <linearGradient id={`${id}sand`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1d6aa" />
          <stop offset="1" stopColor="#ddb27c" />
        </linearGradient>
      </defs>
      <rect width="75" height="100" fill={`url(#${id}sky)`} />
      <circle cx="52" cy="40" r="11" fill="#fff6e0" opacity="0.45" />
      <circle cx="52" cy="40" r="6.5" fill="#fff3d9" />
      <rect y="55" width="75" height="20" fill={`url(#${id}sea)`} />
      <path d="M6 60 h10 M30 63 h14 M54 59 h9 M14 68 h12 M46 70 h16" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M0 74 C 20 68 46 70 75 66 V100 H0Z" fill={`url(#${id}sand)`} />
      <g stroke="#4e7d45" strokeWidth="0.9" strokeLinecap="round" fill="none">
        <path d="M8 100 C 9 90 7 84 4 78" />
        <path d="M12 100 C 12 90 14 84 17 79" />
        <path d="M22 100 C 21 92 24 86 26 82" />
        <path d="M50 100 C 51 90 49 85 46 80" />
        <path d="M58 100 C 58 91 61 86 64 82" />
        <path d="M66 100 C 66 93 68 88 71 85" />
      </g>
      {[
        [4, 78, '#f08b8b'],
        [17, 79, '#ffd36e'],
        [26, 82, '#f6a6c8'],
        [46, 80, '#ffd36e'],
        [64, 82, '#f08b8b'],
        [71, 85, '#fff1f1'],
      ].map(([cx, cy, fill]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.1" fill={fill as string} />
      ))}
    </svg>
  )
}

function SeaScene() {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="A lighthouse on a headland over a grey-green sea">
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8c3cf" />
          <stop offset="1" stopColor="#e4ece9" />
        </linearGradient>
        <linearGradient id={`${id}sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d7383" />
          <stop offset="1" stopColor="#1d4250" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}sky)`} />
      <ellipse cx="24" cy="22" rx="20" ry="3" fill="#fff" opacity="0.4" />
      <ellipse cx="70" cy="30" rx="16" ry="2.4" fill="#fff" opacity="0.3" />
      <path d="M52 58 C 60 46 70 44 78 45 C 86 46 92 50 100 49 V60 H52Z" fill="#5f808c" />
      <rect x="73" y="35" width="3.2" height="10.5" fill="#f4f1ea" />
      <rect x="73" y="38.5" width="3.2" height="2" fill="#c8524a" />
      <path d="M72.4 35 h4.4 l-0.8 -2 h-2.8Z" fill="#3e5560" />
      <rect y="58" width="100" height="42" fill={`url(#${id}sea)`} />
      <g stroke="#e6f0ee" strokeWidth="0.8" strokeLinecap="round" fill="none">
        <path d="M6 66 q 4 -2 8 0 t 8 0" opacity="0.45" />
        <path d="M40 70 q 4 -2 8 0 t 8 0 t 8 0" opacity="0.35" />
        <path d="M14 80 q 5 -2.4 10 0 t 10 0" opacity="0.4" />
        <path d="M60 84 q 5 -2.4 10 0 t 10 0 t 10 0" opacity="0.35" />
        <path d="M0 93 q 6 -3 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0" opacity="0.55" />
      </g>
      <path d="M30 63 l6 -9 v9Z" fill="#f4f1ea" />
      <path d="M28.5 63.4 h9 l-1.4 1.6 h-6.4Z" fill="#2b3f48" />
    </svg>
  )
}

const PRINTS: (PolaroidCardProps & { id: string; scene: ComponentType })[] = [
  { id: 'card-1', caption: 'Lucidity of dreams', aspectRatio: 'square', rotate: -6, textColor: 'rgb(51, 28, 46)', scene: DreamScene },
  { id: 'card-2', caption: 'The garden of memories', aspectRatio: 'portrait', rotate: 6, textColor: 'rgb(51, 51, 51)', scene: GardenScene },
  { id: 'card-3', caption: 'Whispers of the sea', aspectRatio: 'square', rotate: -2, textColor: 'rgb(44, 53, 64)', scene: SeaScene },
]

// ---- 布局：一排放得下就照上游排成一排，否则缩小；再窄就叠成一摞 ----

const CARD_WIDTH = { sm: 230, md: 280, lg: 330 } as const
type Size = keyof typeof CARD_WIDTH

interface Layout {
  pile: boolean
  size: Size
  gapClass: string
  /** 相邻两张卡中心的距离，用来按比例缩放自动播放的位移。 */
  spacing: number
}

function layoutFor(width: number, size: Size): Layout {
  const gap = width >= 768 ? 56 : 32
  // 3 张卡 + 间隙 + 画廊左右 16px 内边距，再留一点给旋转出来的角。
  if (width >= 3 * CARD_WIDTH[size] + 2 * gap + 56) return { pile: false, size, gapClass: '', spacing: CARD_WIDTH[size] + gap }
  if (width >= 3 * CARD_WIDTH.sm + 2 * 16 + 56) return { pile: false, size: 'sm', gapClass: 'gap-4 md:gap-4', spacing: CARD_WIDTH.sm + 16 }
  return { pile: true, size: 'sm', gapClass: '', spacing: 0 }
}

// ---- 自动播放：依次把三张照片拖到桌子中间，再依次拖回原位；拿起的顺序两轮相同，所以一轮结束层叠也复原 ----

const LOOP = 9.6
const LIFT = 0.18
const MOVE = 0.7
const SETTLE = 0.22
const THROW = LIFT + MOVE + SETTLE
const OUT = [0.5, 1.8, 3.1]
const BACK = [5.0, 6.3, 7.6]

// 一排时的去向（以 336px 的卡间距为单位）和叠成一摞时的原位 / 去向（px）。
const ROW_TARGET: Point[] = [
  [170, 40],
  [200, -30],
  [-380, 20],
]
const PILE_HOME: Point[] = [
  [-34, -46],
  [30, 6],
  [-12, 52],
]
const PILE_TARGET: Point[] = [
  [40, 34],
  [-38, -42],
  [26, -10],
]

const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

function scripted(time: number, layout: Layout): { points: Point[]; active: number | null } {
  const t = ((time % LOOP) + LOOP) % LOOP
  const scale = layout.spacing / 336
  let active: number | null = null
  const points = PRINTS.map((_, index): Point => {
    const home: Point = layout.pile ? PILE_HOME[index]! : [0, 0]
    const target: Point = layout.pile ? PILE_TARGET[index]! : [ROW_TARGET[index]![0] * scale, ROW_TARGET[index]![1] * scale]
    const legs: [number, Point, Point][] = [
      [OUT[index]!, home, target],
      [BACK[index]!, target, home],
    ]
    let point = home
    for (const [start, from, to] of legs) {
      if (t < start) break
      if (t >= start + THROW) {
        point = to
        continue
      }
      active = index
      const u = ease(Math.min(Math.max((t - start - LIFT) / MOVE, 0), 1))
      // 拖动时手会微微抬高，路径带一点弧度。
      const arc = -Math.sin(Math.PI * u) * (layout.pile ? 14 : 30)
      point = [from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u + arc]
      break
    }
    return point
  })
  return { points, active }
}

// ---- 桌面上文字的颜色：按桌面颜色的亮度选深 / 浅墨水 ----

function luminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1, 7), 16)
  const channel = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel((value >> 16) & 255) + 0.7152 * channel((value >> 8) & 255) + 0.0722 * channel(value & 255)
}

function inkFor(hex: string): { ink: string; muted: number } {
  const l = luminance(hex)
  const dark = (l + 0.05) / 0.05
  const light = 1.05 / (l + 0.05)
  const contrast = Math.max(dark, light)
  return { ink: dark >= light ? '#1c1917' : '#fafaf9', muted: contrast > 9 ? 0.68 : 0.88 }
}

export function Demo(props: PolaroidGalleryProps) {
  const host = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(1280)
  const [manual, setManual] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const [values] = useState(() => PRINTS.map(() => ({ x: motionValue(0), y: motionValue(0) })))

  useLayoutEffect(() => {
    const element = host.current
    if (!element) return
    const observer = new ResizeObserver(() => setWidth(element.clientWidth))
    observer.observe(element)
    setWidth(element.clientWidth)
    return () => observer.disconnect()
  }, [])

  const size: Size = props.size === 'sm' || props.size === 'lg' ? props.size : 'md'
  const layout = layoutFor(width, size)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const { points, active: next } = scripted(time, layout)
      // 在 motion 自己的帧批次里写入：useVelocity 只认 30ms 内的更新，30fps 录屏时在外部写会读到 0，照片就不会歪。
      frame.update(() => {
        points.forEach(([px, py], index) => {
          values[index]!.x.set(px)
          values[index]!.y.set(py)
        })
      })
      setActive((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 4.4 },
  )

  const { ink, muted } = inkFor(props.tableColor ?? '#f6f4f6')

  return (
    <div ref={host} className="h-full w-full" onPointerDownCapture={() => setManual(true)} onKeyDownCapture={() => setManual(true)}>
      <PolaroidGallery {...props} className="h-full min-h-0">
        <div className="pointer-events-none absolute top-5 left-5 z-0 sm:top-7 sm:left-8" style={{ color: ink }}>
          <p className="text-[11px] tracking-[0.18em] uppercase" style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", opacity: muted }}>
            Roll 07 · Coast road
          </p>
          <p className="mt-1 text-2xl leading-tight italic sm:text-[28px]" style={{ fontFamily: "'Instrument Serif', ui-serif, Georgia, serif" }}>
            Three keepers from August
          </p>
        </div>
        <PolaroidArena className={layout.pile ? 'grid min-h-0 place-items-center [&>*]:[grid-area:1/1]' : layout.gapClass}>
          {PRINTS.map(({ scene: Scene, ...print }, index) => (
            <PolaroidCard key={print.id} {...print} size={layout.size} x={values[index]!.x} y={values[index]!.y} dragging={!manual && active === index}>
              <Scene />
            </PolaroidCard>
          ))}
        </PolaroidArena>
        <p className="pointer-events-none absolute right-0 bottom-4 left-0 z-0 px-4 text-center text-xs sm:bottom-6" style={{ color: ink, opacity: muted }}>
          Drag a print to move it. The one you pick up lands on top.
        </p>
      </PolaroidGallery>
    </div>
  )
}
