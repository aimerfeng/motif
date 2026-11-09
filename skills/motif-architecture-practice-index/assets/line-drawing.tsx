import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'
import type { Drawing, Pen } from './drawings'

/** 一张图从第一笔到最后一笔的时长（秒）。 */
const DURATION = 1.9

// 每种笔在进度 0–1 里的起笔时刻、整组铺开的跨度、单笔时长：先剖到的墙，再隔墙，最后家具和植物。
const TIMING: Record<Pen, [number, number, number]> = {
  cut: [0, 0.28, 0.34],
  wall: [0.18, 0.36, 0.3],
  fine: [0.38, 0.42, 0.2],
}
const PEN_ORDER: Pen[] = ['fine', 'wall', 'cut']

// 所有画线都由同一个 CSS 变量 --p 驱动：每帧只改一个值，几百条路径各自按 --d / --l 算出自己的 dashoffset。
const drawStyle = (d: number, l: number): CSSProperties => ({
  strokeDasharray: '1.01 1.01',
  strokeDashoffset: `calc((1 - clamp(0, (var(--p) - ${d.toFixed(3)}) / ${l}, 1)) * 1.01px)`,
})
const fadeStyle = (d: number, l: number): CSSProperties => ({ opacity: `clamp(0, (var(--p) - ${d}) / ${l}, 1)` })

/** 文字底下描一圈底色（制图和地图上的常规做法）：轴线、填充线从字后面穿过时字仍然清楚。 */
const halo = (k: number) => ({ stroke: 'var(--halo, var(--bg))', strokeWidth: 3 * k, strokeLinejoin: 'round' as const, paintOrder: 'stroke' as const })

export function viewBoxOf(drawing: Drawing, framed: boolean): [number, number, number, number] {
  const { box } = drawing
  const m = drawing.kind === 'plan' ? Math.max(box.w, box.h) * (framed ? 0.13 : 0.035) : 0.4
  return [box.x - m, box.y - m, box.w + 2 * m, box.h + 2 * m]
}

function ppuOf(vb: [number, number, number, number], size: [number, number]): number {
  return size[0] > 0 && size[1] > 0 ? Math.min(size[0] / vb[2], size[1] / vb[3]) : 5
}

interface LayerOptions {
  weight: number
  grid: boolean
  labels: boolean
  marks: boolean
}

function Layer({ drawing, size, options, mode, title, style }: { drawing: Drawing; size: [number, number]; options: LayerOptions; mode: 'draw' | 'still'; title?: string; style?: CSSProperties }) {
  const framed = options.grid || options.marks
  const vb = viewBoxOf(drawing, framed)
  const k = 1 / ppuOf(vb, size)
  const { box } = drawing
  const m = (vb[2] - box.w) / 2
  const draw = mode === 'draw'
  const width: Record<Pen, number> = {
    cut: options.weight * 2.1 * k,
    wall: options.weight * k,
    fine: Math.max(0.5, options.weight * 0.55) * k,
  }
  const counts: Record<Pen, number> = { cut: 0, wall: 0, fine: 0 }
  for (const stroke of drawing.strokes) counts[stroke.pen]++
  const late = draw ? fadeStyle(0.62, 0.3) : undefined
  const last = draw ? fadeStyle(0.8, 0.2) : undefined

  const paths: ReactNode[] = []
  for (const pen of PEN_ORDER) {
    const [start, spread, length] = TIMING[pen]
    const n = counts[pen]
    let i = 0
    for (const stroke of drawing.strokes) {
      if (stroke.pen !== pen) continue
      const at = start + spread * (n > 1 ? i / (n - 1) : 0)
      paths.push(
        <path
          key={`${pen}${i}`}
          d={stroke.d}
          pathLength={1}
          strokeWidth={width[pen]}
          strokeOpacity={pen === 'fine' ? 0.72 : 1}
          strokeLinejoin="miter"
          style={draw ? drawStyle(at, length) : undefined}
        />,
      )
      i++
    }
  }

  const accentSize = Math.min(m * 0.26, 9 * k)
  const markWidth = options.weight * 1.6 * k
  const bubble = Math.min(m * 0.2, 7.5 * k)

  return (
    <svg
      viewBox={vb.map((v) => Number(v.toFixed(2))).join(' ')}
      className="absolute inset-0 h-full w-full overflow-visible"
      style={style}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {options.grid && drawing.axes && (
        <g style={late} stroke="var(--muted)" strokeWidth={0.7 * k} fill="none" strokeDasharray={`${9 * k} ${3 * k} ${1.5 * k} ${3 * k}`}>
          {drawing.axes.x.map((x) => (
            <path key={`ax${x}`} d={`M${x} ${box.y - m * 0.42}V${box.y + box.h + m * 0.12}`} strokeOpacity={0.55} />
          ))}
          {drawing.axes.y.map((y) => (
            <path key={`ay${y}`} d={`M${box.x - m * 0.42} ${y}H${box.x + box.w + m * 0.12}`} strokeOpacity={0.55} />
          ))}
        </g>
      )}
      {options.grid && drawing.axes && (
        <g style={late} fontFamily="var(--font-mono)" fontSize={7.5 * k} textAnchor="middle" dominantBaseline="central">
          {drawing.axes.x.map((x, i) => (
            <g key={`bx${x}`}>
              <circle cx={x} cy={box.y - m * 0.42 - bubble} r={bubble} fill="none" stroke="var(--muted)" strokeWidth={0.8 * k} />
              <text x={x} y={box.y - m * 0.42 - bubble} fill="var(--muted)">
                {String.fromCharCode(65 + i)}
              </text>
            </g>
          ))}
          {drawing.axes.y.map((y, i) => (
            <g key={`by${y}`}>
              <circle cx={box.x - m * 0.42 - bubble} cy={y} r={bubble} fill="none" stroke="var(--muted)" strokeWidth={0.8 * k} />
              <text x={box.x - m * 0.42 - bubble} y={y} fill="var(--muted)">
                {i + 1}
              </text>
            </g>
          ))}
        </g>
      )}

      {drawing.hidden.length > 0 && (
        <g style={late} stroke="currentColor" strokeOpacity={0.45} strokeWidth={width.fine} fill="none" strokeDasharray={`${4 * k} ${3 * k}`}>
          {drawing.hidden.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      )}

      <g stroke="currentColor" fill="none" strokeLinecap="butt">
        {paths}
      </g>

      {options.labels && drawing.labels.length > 0 && (
        <g style={{ ...late, ...halo(k) }} fontSize={8.6 * k} fill="var(--muted)" dominantBaseline="central" letterSpacing="0.02em">
          {drawing.labels.map((label) => (
            <text key={`${label.text}${label.x}`} x={label.x} y={label.y} textAnchor={label.anchor ?? 'middle'}>
              {label.text}
            </text>
          ))}
        </g>
      )}

      {options.marks && <Marks drawing={drawing} m={m} k={k} size={accentSize} stroke={markWidth} bubble={options.grid ? bubble : 0} style={last} />}
    </svg>
  )
}

/**
 * 剖切号 A 的两个候选位置里挑离轴号圆圈远的那个：默认位置被圆圈挡住时（剖切线紧挨着一根轴线）换到另一侧。
 * 候选是 [x, y, 文字锚点]，x、y 为字的中心。
 */
function clearOf(candidates: [number, number, 'start' | 'middle' | 'end'][], bubbles: [number, number][], r: number, need: number) {
  const clearance = ([x, y]: [number, number, unknown]) => Math.min(Infinity, ...bubbles.map(([bx, by]) => Math.hypot(x - bx, y - by) - r))
  const [first, ...rest] = candidates
  if (!first || clearance(first) >= need) return first
  return rest.reduce((best, c) => (clearance(c) > clearance(best) ? c : best), first)
}

/** 标记色画的东西：剖切线 A–A、入口三角、指北针、剖面标高。 */
function Marks({ drawing, m, k, size: s, stroke, bubble, style }: { drawing: Drawing; m: number; k: number; size: number; stroke: number; bubble: number; style?: CSSProperties }) {
  const { box, cut, entrance, levels, axes } = drawing
  const items: ReactNode[] = []
  const glyph = 8.5 * k
  // 字的中心 → text 的 x（按锚点退回半个字宽）
  const letter = ([cx, cy, anchor]: [number, number, 'start' | 'middle' | 'end']) => (
    <text
      x={anchor === 'end' ? cx + glyph * 0.32 : anchor === 'start' ? cx - glyph * 0.32 : cx}
      y={cy}
      textAnchor={anchor}
      dominantBaseline="central"
      fontFamily="var(--font-mono)"
      fontSize={glyph}
      fontWeight={600}
      fill="var(--accent-ink)"
      {...halo(k)}
    >
      A
    </text>
  )
  const bubbleTop = (axes?.x ?? []).map((x): [number, number] => [x, box.y - m * 0.42 - bubble])
  const bubbleLeft = (axes?.y ?? []).map((y): [number, number] => [box.x - m * 0.42 - bubble, y])
  const need = glyph * 0.55 + 1.5 * k
  if (cut && drawing.kind === 'plan') {
    if (cut.axis === 'y') {
      for (const [x1, x2, ax] of [
        [box.x - m * 0.8, box.x - m * 0.08, box.x - m * 0.62],
        [box.x + box.w + m * 0.08, box.x + box.w + m * 0.8, box.x + box.w + m * 0.62],
      ] as const) {
        items.push(
          <g key={`c${ax}`}>
            <path d={`M${x1} ${cut.at}H${x2}`} />
            <path d={`M${ax - s * 0.5} ${cut.at}L${ax} ${cut.at - s}L${ax + s * 0.5} ${cut.at}Z`} fill="var(--accent-line)" stroke="none" />
            {letter(
              clearOf(
                [
                  [ax, cut.at + s * 0.45 + glyph * 0.55, 'middle'],
                  [ax, cut.at - s - glyph * 0.6, 'middle'],
                ],
                bubble > 0 && ax < box.x ? bubbleLeft : [],
                bubble,
                need,
              )!,
            )}
          </g>,
        )
      }
    } else {
      for (const [y1, y2, ay] of [
        [box.y - m * 0.8, box.y - m * 0.08, box.y - m * 0.62],
        [box.y + box.h + m * 0.08, box.y + box.h + m * 0.8, box.y + box.h + m * 0.62],
      ] as const) {
        items.push(
          <g key={`c${ay}`}>
            <path d={`M${cut.at} ${y1}V${y2}`} />
            <path d={`M${cut.at} ${ay - s * 0.5}L${cut.at + s} ${ay}L${cut.at} ${ay + s * 0.5}Z`} fill="var(--accent-line)" stroke="none" />
            {letter(
              clearOf(
                [
                  [cut.at - s * 0.45 - glyph * 0.55, ay, 'end'],
                  [cut.at + s * 1.3 + glyph * 0.5, ay, 'start'],
                ],
                bubble > 0 && ay < box.y ? bubbleTop : [],
                bubble,
                need,
              )!,
            )}
          </g>,
        )
      }
    }
  }
  if (entrance) {
    const v = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[entrance.dir] as [number, number]
    const e = s * 1.1
    const apex = [entrance.x - v[0] * e * 0.35, entrance.y - v[1] * e * 0.35]
    const base = [entrance.x - v[0] * e * 1.3, entrance.y - v[1] * e * 1.3]
    const p = [-v[1] * e * 0.55, v[0] * e * 0.55]
    items.push(<path key="entrance" d={`M${apex[0]} ${apex[1]}L${base[0]! + p[0]!} ${base[1]! + p[1]!}L${base[0]! - p[0]!} ${base[1]! - p[1]!}Z`} fill="var(--accent-line)" stroke="none" />)
  }
  if (drawing.kind === 'plan') {
    const r = Math.min(m * 0.26, 10 * k)
    const cx = box.x + box.w + m * 0.55
    const cy = box.y + box.h + m * 0.55
    items.push(
      <g key="north" stroke="currentColor" strokeWidth={0.8 * k}>
        <circle cx={cx} cy={cy} r={r} fill="none" />
        <path d={`M${cx} ${cy - r * 1.3}L${cx + r * 0.42} ${cy + r * 0.6}L${cx} ${cy + r * 0.25}L${cx - r * 0.42} ${cy + r * 0.6}Z`} fill="currentColor" stroke="none" />
      </g>,
    )
  }
  for (const level of levels ?? []) {
    const t = 7 * k
    const left = level.side === 'left'
    items.push(
      <g key={`l${level.x}${level.y}`}>
        <path d={`M${level.x - t * 0.55} ${level.y - t * 0.9}L${level.x + t * 0.55} ${level.y - t * 0.9}L${level.x} ${level.y}Z`} fill="var(--accent-line)" stroke="none" />
        <text x={level.x + (left ? -t : t) * 0.95} y={level.y - t * 0.95} textAnchor={left ? 'end' : 'start'} fontFamily="var(--font-mono)" fontSize={8.5 * k} fill="var(--accent-ink)" {...halo(k)}>
          {level.text}
        </text>
      </g>,
    )
  }
  return (
    <g style={style} stroke="var(--accent-line)" strokeWidth={stroke} fill="none">
      {items}
    </g>
  )
}

export interface LineDrawingProps {
  drawing: Drawing
  weight: number
  /** 给读屏的说明；省略时整张图对辅助技术隐藏。 */
  title?: string
  grid?: boolean
  labels?: boolean
  marks?: boolean
  /** 换图时逐笔画出（减少动态效果时直接显示完整的图）。 */
  animated?: boolean
  /** 当前图的像素/米，用来画比例尺。 */
  onScale?: (pixelsPerMetre: number) => void
  className?: string
  style?: CSSProperties
}

/**
 * 线稿图：按容器尺寸换算线宽和字号，线宽始终是屏幕像素；animated 时换图会逐笔重画，旧图在新图起笔时淡出。
 */
export function LineDrawing({ drawing, weight, title, grid = false, labels = false, marks = false, animated = false, onScale, className, style }: LineDrawingProps) {
  const reduced = useReducedMotion() ?? false
  const live = animated && !reduced
  const wrap = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<[number, number]>([0, 0])
  const [view, setView] = useState<{ current: Drawing; prev: Drawing | null; drawing: boolean }>({ current: drawing, prev: null, drawing: live })
  // 换图：在渲染期间同步派生状态（React 推荐的「根据上一次的 props 调整 state」写法）
  if (view.current !== drawing) setView({ current: drawing, prev: live ? view.current : null, drawing: live })

  useLayoutEffect(() => {
    const element = wrap.current
    if (!element) return
    const update = () => setSize((prev) => (prev[0] === element.clientWidth && prev[1] === element.clientHeight ? prev : [element.clientWidth, element.clientHeight]))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const active = view.drawing && live
  const current = view.current
  useLayoutEffect(() => {
    const element = wrap.current
    if (!element || !active) return
    element.style.setProperty('--p', '0')
    const controls = animate(0, 1, {
      duration: DURATION,
      ease: [0.4, 0, 0.3, 1],
      onUpdate: (value) => element.style.setProperty('--p', value.toFixed(4)),
      onComplete: () => setView((v) => ({ ...v, prev: null, drawing: false })),
    })
    return () => controls.stop()
  }, [current, active])

  const options: LayerOptions = { weight, grid, labels, marks }
  const ppu = ppuOf(viewBoxOf(current, grid || marks), size)
  useEffect(() => {
    if (size[0] > 0) onScale?.(ppu)
  }, [ppu, size, onScale])

  return (
    <div ref={wrap} className={cn('relative h-full w-full', className)} style={style}>
      {active && view.prev && <Layer drawing={view.prev} size={size} options={options} mode="still" style={{ opacity: 'calc(1 - clamp(0, var(--p) * 3, 1))' }} />}
      <Layer drawing={current} size={size} options={options} mode={active ? 'draw' : 'still'} title={title} />
    </div>
  )
}
