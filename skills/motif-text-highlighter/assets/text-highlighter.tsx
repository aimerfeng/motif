// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/highlighter.tsx
// Modified by Motif; see the item's provenance.
'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'

/* @motif:defaults */
export const defaults = {
  action: 'highlight',
  color: '#ffd1dc',
  strokeWidth: 1.5,
  animationDuration: 600,
  iterations: 2,
  padding: 2,
  roughness: 1,
  multiline: true,
}
/* @motif:end */

type AnnotationAction = 'highlight' | 'underline' | 'box' | 'circle' | 'strike-through' | 'crossed-off' | 'bracket'

export type HighlighterProps = Partial<typeof defaults> & {
  children: ReactNode
  /** Delay before drawing starts, in ms. */
  delay?: number
  className?: string
  style?: CSSProperties
}

type Options = typeof defaults
type Box = { x: number; y: number; w: number; h: number }
type Stroke = { d: string; width: number; cap: 'round' | 'butt' }

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const fx = (n: number) => Math.round(n * 10) / 10

/** A slightly bowed line with jittered ends, like one pen swipe. */
function roughLine(x1: number, y1: number, x2: number, y2: number, rough: number, rand: () => number, move = true) {
  const j = (s: number) => (rand() - 0.5) * 2 * s
  const len = Math.hypot(x2 - x1, y2 - y1) || 1
  const end = Math.min(2, len * 0.02 + 0.5) * rough
  const bow = Math.min(len * 0.04, 3) * rough
  const nx = -(y2 - y1) / len
  const ny = (x2 - x1) / len
  const b = j(bow)
  const cx = (x1 + x2) / 2 + nx * b + j(end)
  const cy = (y1 + y2) / 2 + ny * b + j(end)
  const head = move ? `M${fx(x1 + j(end))} ${fx(y1 + j(end))}` : ` L${fx(x1 + j(end * 0.5))} ${fx(y1 + j(end * 0.5))}`
  return `${head} Q${fx(cx)} ${fx(cy)} ${fx(x2 + j(end))} ${fx(y2 + j(end))}`
}

/** An ellipse that overshoots its start a little, the way a hand-drawn circle does. */
function roughEllipse(cx: number, cy: number, rx: number, ry: number, rough: number, rand: () => number) {
  const steps = 14
  const start = -Math.PI / 2 - 0.5 + rand() * 0.4
  const sweep = Math.PI * 2 + 0.35 + rand() * 0.3
  const pts: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const a = start + (sweep * i) / steps
    const wob = 1 + (rand() - 0.5) * 0.06 * rough
    const grow = 1 + (i / steps) * 0.05 * rough
    pts.push([cx + Math.cos(a) * rx * wob * grow, cy + Math.sin(a) * ry * wob * grow])
  }
  const [x0, y0] = pts[0]!
  let d = `M${fx(x0)} ${fx(y0)}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i]!
    const [nx, ny] = pts[i + 1]!
    d += ` Q${fx(x)} ${fx(y)} ${fx((x + nx) / 2)} ${fx((y + ny) / 2)}`
  }
  const [xl, yl] = pts[pts.length - 1]!
  return `${d} L${fx(xl)} ${fx(yl)}`
}

function buildStrokes(boxes: Box[], o: Options): Stroke[] {
  const out: Stroke[] = []
  const p = o.padding
  const r = o.roughness
  const sw = o.strokeWidth
  const action = o.action as AnnotationAction
  boxes.forEach((b, bi) => {
    for (let it = 0; it < o.iterations; it++) {
      const rand = rng(bi * 7919 + it * 104729 + action.length * 31 + 17)
      const left = b.x - p
      const right = b.x + b.w + p
      const top = b.y - p
      const bottom = b.y + b.h + p
      const midY = b.y + b.h / 2
      switch (action) {
        case 'highlight':
          out.push({ d: roughLine(left, midY, right, midY, r * 0.6, rand), width: b.h, cap: 'butt' })
          break
        case 'underline':
          out.push({ d: roughLine(b.x, bottom, b.x + b.w, bottom, r, rand), width: sw, cap: 'round' })
          break
        case 'strike-through':
          out.push({ d: roughLine(b.x, midY, b.x + b.w, midY, r, rand), width: sw, cap: 'round' })
          break
        case 'crossed-off':
          out.push({ d: roughLine(b.x, b.y, b.x + b.w, b.y + b.h, r, rand), width: sw, cap: 'round' })
          out.push({ d: roughLine(b.x + b.w, b.y, b.x, b.y + b.h, r, rand), width: sw, cap: 'round' })
          break
        case 'box':
          out.push({
            d:
              roughLine(left, top, right, top, r, rand) +
              roughLine(right, top, right, bottom, r, rand, false) +
              roughLine(right, bottom, left, bottom, r, rand, false) +
              roughLine(left, bottom, left, top, r, rand, false),
            width: sw,
            cap: 'round',
          })
          break
        case 'circle':
          out.push({ d: roughEllipse(b.x + b.w / 2, midY, b.w / 2 + p + b.w * 0.06, b.h / 2 + p + b.h * 0.18, r, rand), width: sw, cap: 'round' })
          break
        case 'bracket': {
          const arm = Math.min(8, b.w * 0.15 + 2)
          out.push({
            d:
              roughLine(right - arm, top, right, top, r * 0.5, rand) +
              roughLine(right, top, right, bottom, r, rand, false) +
              roughLine(right, bottom, right - arm, bottom, r * 0.5, rand, false),
            width: sw,
            cap: 'round',
          })
          break
        }
      }
    }
  })
  return out
}

/** Dark or light ink for text sitting on the highlight color. */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})/i.exec(hex)
  if (!m) return undefined
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.2 ? '#16120f' : '#ffffff'
}

export function Highlighter({ children, delay = 0, className, style, ...props }: HighlighterProps) {
  const o: Options = { ...defaults, ...props }
  const elementRef = useRef<HTMLSpanElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()
  const [boxes, setBoxes] = useState<Box[]>([])

  useLayoutEffect(() => {
    const element = elementRef.current
    const svg = svgRef.current
    if (!element || !svg) return
    const measure = () => {
      const origin = svg.getBoundingClientRect()
      const rects = o.multiline ? Array.from(element.getClientRects()) : [element.getBoundingClientRect()]
      const next = rects
        .filter((rc) => rc.width > 0 && rc.height > 0)
        .map((rc) => ({ x: rc.left - origin.left, y: rc.top - origin.top, w: rc.width, h: rc.height }))
      setBoxes((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    }
    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(element)
    resizeObserver.observe(document.body)
    return () => resizeObserver.disconnect()
  }, [o.multiline])

  const strokes = buildStrokes(boxes, o)
  const step = o.animationDuration / 1000 / Math.max(1, strokes.length)
  const isHighlight = o.action === 'highlight'

  return (
    <span
      ref={elementRef}
      className={cn('relative bg-transparent', o.multiline ? 'inline' : 'inline-block', isHighlight && 'isolate', className)}
      style={{ ...(isHighlight ? { color: inkFor(o.color) } : null), ...style }}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 overflow-visible"
        width={1}
        height={1}
        style={{ zIndex: isHighlight ? -1 : 1, overflow: 'visible' }}
      >
        {strokes.map((s, i) => (
          <motion.path
            key={`${o.action}-${i}`}
            d={s.d}
            fill="none"
            stroke={o.color}
            strokeWidth={s.width}
            strokeLinecap={s.cap}
            strokeLinejoin="round"
            initial={reduced ? false : { pathLength: 0, strokeOpacity: 0 }}
            animate={{ pathLength: 1, strokeOpacity: 1 }}
            transition={{
              pathLength: { duration: step, delay: delay / 1000 + i * step, ease: 'easeOut' },
              strokeOpacity: { duration: 0.01, delay: delay / 1000 + i * step },
            }}
          />
        ))}
      </svg>
      {children}
    </span>
  )
}
