// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/animated-grid-pattern.tsx
// Also: grid-pattern.tsx, dot-pattern.tsx, hexagon-pattern.tsx, striped-pattern.tsx (same directory and sha)
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  pattern: 'grid',
  cellSize: 40,
  strokeWidth: 1,
  dashed: false,
  color: '#9ca3af',
  mask: 'radial',
  glow: false,
  highlightCount: 30,
  highlightDuration: 4,
}
/* @motif:end */

export type PatternBackdropProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type Direction = 'horizontal' | 'vertical'
type HexPoint = readonly [number, number]

// ---- Hexagon geometry, from upstream hexagon-pattern.tsx ----

function hexVertexList(cx: number, cy: number, r: number, direction: Direction): HexPoint[] {
  const startAngle = direction === 'horizontal' ? 0 : 30
  return Array.from({ length: 6 }, (_, i) => {
    const angle = ((startAngle + i * 60) * Math.PI) / 180
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const
  })
}

function hexPoints(cx: number, cy: number, r: number, direction: Direction): string {
  return hexVertexList(cx, cy, r, direction)
    .map(([px, py]) => `${px},${py}`)
    .join(' ')
}

function edgeLexKey(a: HexPoint, b: HexPoint): string {
  const [p, q] = a[0] < b[0] || (a[0] === b[0] && a[1] <= b[1]) ? [a, b] : [b, a]
  return `${p[0].toFixed(6)},${p[1].toFixed(6)}|${q[0].toFixed(6)},${q[1].toFixed(6)}`
}

function collectUniqueHexEdges(centers: [number, number][], r: number, direction: Direction): [HexPoint, HexPoint][] {
  const seen = new Set<string>()
  const edges: [HexPoint, HexPoint][] = []
  for (const [cx, cy] of centers) {
    const verts = hexVertexList(cx, cy, r, direction)
    for (let i = 0; i < 6; i++) {
      const a = verts[i]!
      const b = verts[(i + 1) % 6]!
      const key = edgeLexKey(a, b)
      if (!seen.has(key)) {
        seen.add(key)
        edges.push([a, b])
      }
    }
  }
  return edges
}

function getHexSpacing(r: number, direction: Direction, gap: number) {
  const sqrt3 = Math.sqrt(3)
  if (direction === 'horizontal') {
    const colStep = (3 * r) / 2 + (sqrt3 * gap) / 2
    const rowStep = sqrt3 * r + gap
    return { colStep, rowStep, tileW: colStep * 2, tileH: rowStep }
  }
  const colStep = sqrt3 * r + gap
  const rowStep = (3 * r) / 2 + (sqrt3 * gap) / 2
  return { colStep, rowStep, tileW: colStep, tileH: rowStep * 2 }
}

function getTileGeometry(r: number, direction: Direction, gap: number) {
  const { colStep, rowStep, tileW, tileH } = getHexSpacing(r, direction, gap)
  const canonical: [number, number][] =
    direction === 'horizontal'
      ? [
          [colStep / 2, rowStep / 2],
          [(colStep * 3) / 2, rowStep],
        ]
      : [
          [colStep / 2, rowStep / 2],
          [colStep, (rowStep * 3) / 2],
        ]
  const centers: [number, number][] = []
  for (const [cx, cy] of canonical) {
    centers.push([cx, cy])
    if (cy - r < 0) centers.push([cx, cy + tileH])
    if (cy + r > tileH) centers.push([cx, cy - tileH])
    if (cx - r < 0) centers.push([cx + tileW, cy])
    if (cx + r > tileW) centers.push([cx - tileW, cy])
    if (cy - r < 0 && cx - r < 0) centers.push([cx + tileW, cy + tileH])
    if (cy - r < 0 && cx + r > tileW) centers.push([cx - tileW, cy + tileH])
    if (cy + r > tileH && cx - r < 0) centers.push([cx + tileW, cy - tileH])
    if (cy + r > tileH && cx + r > tileW) centers.push([cx - tileW, cy - tileH])
  }
  return { tileW, tileH, centers }
}

function hexCenter(col: number, row: number, r: number, direction: Direction, gap: number): [number, number] {
  const { colStep, rowStep } = getHexSpacing(r, direction, gap)
  if (direction === 'horizontal') {
    return [col * colStep + colStep / 2, row * rowStep + rowStep / 2 + (col % 2 !== 0 ? rowStep / 2 : 0)]
  }
  return [col * colStep + colStep / 2 + (row % 2 !== 0 ? colStep / 2 : 0), row * rowStep + rowStep / 2]
}

// ---- Highlight timing (upstream AnimatedGridPattern: fade in, hold repeatDelay, fade out, move) ----

const REPEAT_DELAY = 0.5
const MAX_OPACITY = 0.5
const HEX_DIRECTION: Direction = 'horizontal'
/** Pattern origin offset, as upstream (x = y = -1). */
const OFFSET = -1

/** Deterministic 0–1 hash (replaces Math.random so every run is reproducible). */
function hash(a: number, b: number): number {
  const value = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return value - Math.floor(value)
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

export function PatternBackdrop({ className, style, children, ...props }: PatternBackdropProps) {
  const options = { ...defaults, ...props }
  const id = useId().replace(/:/g, '')
  const hostRef = useRef<HTMLDivElement>(null)
  const highlightRefs = useRef<(SVGElement | null)[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = hostRef.current
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions((current) => (current.width === width && current.height === height ? current : { width, height }))
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const pattern = options.pattern
  const size = Math.max(4, options.cellSize)
  const sw = options.strokeWidth
  const dash = options.dashed ? `${Math.max(2, sw * 4)} ${Math.max(2, sw * 3)}` : '0'
  const hexRadius = size * 0.6
  const hasHighlights = pattern !== 'stripes'
  const count = hasHighlights ? Math.round(options.highlightCount) : 0

  // Grid geometry used to place highlights.
  let cols: number
  let rows: number
  if (pattern === 'hexagon') {
    const { colStep, rowStep } = getHexSpacing(hexRadius, HEX_DIRECTION, 0)
    cols = Math.max(1, Math.ceil(dimensions.width / colStep) + 1)
    rows = Math.max(1, Math.ceil(dimensions.height / rowStep) + 1)
  } else {
    cols = Math.max(1, Math.ceil(dimensions.width / size))
    rows = Math.max(1, Math.ceil(dimensions.height / size))
  }

  const geometry = { pattern, size, sw, hexRadius, cols, rows, duration: options.highlightDuration }
  const geometryRef = useRef(geometry)
  geometryRef.current = geometry

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const g = geometryRef.current
      const fade = Math.max(0.2, g.duration)
      highlightRefs.current.forEach((el, i) => {
        if (!el) return
        const delay = i * 0.1
        const cycle = delay + fade * 2 + REPEAT_DELAY
        const iteration = Math.floor(time / cycle)
        const t = time - iteration * cycle - delay
        let level = 0
        if (t > 0) {
          if (t < fade) level = easeInOut(t / fade)
          else if (t < fade + REPEAT_DELAY) level = 1
          else level = easeInOut(Math.max(0, 1 - (t - fade - REPEAT_DELAY) / fade))
        }
        const col = Math.floor(hash(i, iteration) * g.cols)
        const row = Math.floor(hash(iteration + 17.3, i) * g.rows)
        el.setAttribute('opacity', (level * MAX_OPACITY).toFixed(3))
        if (g.pattern === 'grid') {
          el.setAttribute('x', String(OFFSET + col * g.size + 1))
          el.setAttribute('y', String(OFFSET + row * g.size + 1))
        } else if (g.pattern === 'dots') {
          el.setAttribute('cx', String(col * g.size + 1))
          el.setAttribute('cy', String(row * g.size + 1))
          // upstream glow dots also scale 1 → 1.5
          el.setAttribute('r', String(Math.max(1, g.sw) * (2 + level)))
        } else if (g.pattern === 'hexagon') {
          const [cx, cy] = hexCenter(col, row, g.hexRadius, HEX_DIRECTION, 0)
          el.setAttribute('points', hexPoints(cx + OFFSET, cy + OFFSET, g.hexRadius - 1, HEX_DIRECTION))
        }
      })
    },
    { reducedMotion: 'static', staticTime: 5 },
  )

  const mask =
    options.mask === 'radial'
      ? 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 20%, transparent 100%)'
      : options.mask === 'linear'
        ? 'linear-gradient(to bottom, #000 0%, transparent 85%)'
        : undefined

  const highlightFill = options.glow ? `url(#${id}-glow)` : 'currentColor'

  let tile: ReactNode
  let tileW = size
  let tileH = size
  if (pattern === 'grid') {
    tile = <path d={`M.5 ${size}V.5H${size}`} fill="none" strokeDasharray={dash} />
  } else if (pattern === 'dots') {
    tile = <circle cx={1} cy={1} r={Math.max(0.5, sw)} fill="currentColor" stroke="none" fillOpacity={0.8} />
  } else if (pattern === 'hexagon') {
    const geo = getTileGeometry(hexRadius, HEX_DIRECTION, 0)
    tileW = geo.tileW
    tileH = geo.tileH
    tile = !options.dashed
      ? geo.centers.map(([cx, cy]) => <polygon fill="none" key={`${cx}-${cy}`} points={hexPoints(cx, cy, hexRadius, HEX_DIRECTION)} />)
      : collectUniqueHexEdges(geo.centers, hexRadius, HEX_DIRECTION).map(([a, b]) => (
          <line fill="none" key={edgeLexKey(a, b)} x1={a[0]} x2={b[0]} y1={a[1]} y2={b[1]} strokeDasharray={dash} />
        ))
  } else {
    const w = Math.max(4, size / 4)
    tileW = w
    tileH = w
    tile = (
      <>
        <line x1="0" y1={w} x2={w} y2="0" strokeDasharray={dash} />
        <line x1={-w} y1={w} x2="0" y2="0" strokeDasharray={dash} />
        <line x1={w} y1={w} x2={w * 2} y2="0" strokeDasharray={dash} />
      </>
    )
  }

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ color: options.color, ...style }}>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth={sw}
      >
        <defs>
          <pattern id={id} width={tileW} height={tileH} patternUnits="userSpaceOnUse" x={pattern === 'dots' ? 0 : OFFSET} y={pattern === 'dots' ? 0 : OFFSET}>
            {tile}
          </pattern>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
        <g fill={highlightFill} stroke="none">
          {Array.from({ length: count }, (_, i) => {
            const ref = (el: SVGElement | null) => {
              highlightRefs.current[i] = el
            }
            if (pattern === 'grid') return <rect key={`g-${i}`} ref={ref} width={size - 1} height={size - 1} opacity={0} />
            if (pattern === 'dots') return <circle key={`d-${i}`} ref={ref} r={Math.max(1, sw) * 2} opacity={0} fill={options.glow ? highlightFill : 'currentColor'} />
            return <polygon key={`h-${i}`} ref={ref} opacity={0} />
          })}
        </g>
      </svg>
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}
