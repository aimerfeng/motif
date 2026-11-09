// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/scroll-split-cards.tsx
// Modified by Motif; see the item's provenance.
'use client'

import { cn } from '@/lib/motif-runtime'
import { type MotionValue, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { type CSSProperties, type RefObject, useRef } from 'react'

/* @motif:defaults */
export const defaults = {
  panelGap: 48,
  flipStagger: 0,
  radius: 16,
  artwork: 'strait',
  backColors: ['#ead9c4', '#c4452d', '#2c3033'],
  titles: 'Fort Point / The Span / Marin Head',
}
/* @motif:end */

export type SplitCard = {
  title: string
  description: string
  kicker?: string
}

export type ScrollSplitCardsProps = Partial<typeof defaults> & {
  items?: SplitCard[]
  className?: string
  style?: CSSProperties
  /** Scrollport to track. Omit to follow the page. */
  containerRef?: RefObject<HTMLElement | null>
}

export const DEFAULT_CARDS: SplitCard[] = [
  {
    title: 'Fort Point',
    kicker: 'Presidio',
    description: 'A Civil War battery under the south tower. The fog hits the brick before it hits the city.',
  },
  {
    title: 'The Span',
    kicker: '1.7 miles',
    description: 'International Orange, mixed to cut through fog. The deck hangs 220 feet over the strait.',
  },
  {
    title: 'Marin Head',
    kicker: 'North tower',
    description: 'The walk from Battery Spencer. On a thick day the city is only a smear of lights.',
  },
]

export function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

export function remap(progress: number, from: number, to: number) {
  if (to === from) return progress >= to ? 1 : 0
  return clamp01((progress - from) / (to - from))
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Left/right panels peak at `peak` px, then close in a little for the flip. */
export function panelShiftX(progress: number, index: number, peak = 48) {
  const dir = index === 0 ? -1 : index === 2 ? 1 : 0
  const out = remap(progress, 0, 0.4)
  const settle = remap(progress, 0.4, 0.8)
  return dir * lerp(0, peak, out) * (1 - settle * 0.5) || 0
}

export function panelRotateY(progress: number, index = 1, stagger = 0) {
  const shift = (index - 1) * stagger
  return lerp(0, 180, remap(progress, 0.4 + shift, 0.8 + shift))
}

export function panelScale(progress: number) {
  return lerp(1, 0.92, remap(progress, 0, 0.4))
}

export function panelRadius(progress: number, index: number, outer = 16) {
  const inner = lerp(0, outer, remap(progress, 0, 0.2))
  if (index === 0) return `${outer}px ${inner}px ${inner}px ${outer}px`
  if (index === 2) return `${inner}px ${outer}px ${outer}px ${inner}px`
  return `${inner}px`
}

/** Dark ink on light backs, light ink on dark backs. */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#fff4ec'
  const n = Number.parseInt(m[1] ?? '000000', 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return L > 0.22 ? '#2a1810' : '#fff4ec'
}

/** Generated stand-in for the upstream photo: one wide picture, sliced by the panels. */
function Artwork({ variant }: { variant: string }) {
  if (variant === 'dunes') {
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="ssp-dunes-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7d9a8" />
            <stop offset="1" stopColor="#eaa66b" />
          </linearGradient>
        </defs>
        <rect width="1200" height="420" fill="url(#ssp-dunes-sky)" />
        <circle cx="820" cy="150" r="54" fill="#fff1d6" opacity="0.9" />
        <path d="M0 260 C200 200 340 230 520 250 S860 190 1200 240 V420 H0Z" fill="#d98a4f" />
        <path d="M0 310 C180 270 380 330 600 290 S980 260 1200 320 V420 H0Z" fill="#b8652f" />
        <path d="M0 370 C260 330 460 390 720 350 S1040 340 1200 380 V420 H0Z" fill="#7a3d1e" />
      </svg>
    )
  }
  if (variant === 'tide') {
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="ssp-tide-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d1f2b" />
            <stop offset="0.55" stopColor="#1f6f78" />
            <stop offset="1" stopColor="#9fd3c7" />
          </linearGradient>
        </defs>
        <rect width="1200" height="420" fill="url(#ssp-tide-sky)" />
        <circle cx="300" cy="110" r="38" fill="#e8f4f1" opacity="0.85" />
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 230 + i * 40
          return (
            <path
              key={i}
              d={`M0 ${y} C150 ${y - 20} 300 ${y + 20} 450 ${y} S750 ${y - 20} 900 ${y} S1100 ${y + 20} 1200 ${y} V420 H0Z`}
              fill="#0d1f2b"
              opacity={0.18 + i * 0.14}
            />
          )
        })}
      </svg>
    )
  }
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ssp-strait-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3550" />
          <stop offset="0.5" stopColor="#c86b4f" />
          <stop offset="1" stopColor="#f2c48d" />
        </linearGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#ssp-strait-sky)" />
      <circle cx="600" cy="300" r="70" fill="#ffe3b8" opacity="0.85" />
      <path d="M0 300 C120 250 220 260 330 300 L330 420 H0Z" fill="#2c3033" />
      <path d="M880 300 C980 240 1100 250 1200 280 V420 H880Z" fill="#2c3033" />
      <rect y="320" width="1200" height="100" fill="#4a3f4f" />
      <rect y="320" width="1200" height="100" fill="#c4452d" opacity="0.18" />
      <path d="M300 300 Q450 255 450 120 M450 120 Q600 285 750 120 M750 120 Q750 255 900 300" fill="none" stroke="#c4452d" strokeWidth="3" />
      <g fill="#c4452d">
        <rect x="440" y="110" width="20" height="210" />
        <rect x="740" y="110" width="20" height="210" />
        <rect x="290" y="296" width="620" height="8" />
      </g>
    </svg>
  )
}

function Panel({
  card,
  index,
  progress,
  artwork,
  backColor,
  peak,
  stagger,
  outer,
}: {
  card: SplitCard
  index: number
  progress: MotionValue<number>
  artwork: string
  backColor: string
  peak: number
  stagger: number
  outer: number
}) {
  const x = useTransform(progress, (p) => panelShiftX(p, index, peak))
  const rotateY = useTransform(progress, (p) => panelRotateY(p, index, stagger))
  const radius = useTransform(progress, (p) => panelRadius(p, index, outer))

  return (
    <motion.div
      className={cn('relative h-full min-w-0 flex-[1_1_0] [transform-style:preserve-3d]', index > 0 && '-ml-px')}
      style={{ x, rotateY, zIndex: index }}
    >
      <motion.div className="absolute inset-0 overflow-hidden [backface-visibility:hidden]" style={{ borderRadius: radius }}>
        <div className="absolute inset-0 h-full w-[300%]" style={{ left: `${-100 * index}%` }}>
          <Artwork variant={artwork} />
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex flex-col justify-between overflow-hidden p-4 antialiased [backface-visibility:hidden] sm:p-6"
        style={{
          backgroundColor: backColor,
          color: inkFor(backColor),
          borderRadius: radius,
          transform: 'rotateY(180deg)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16)',
        }}
      >
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] tabular-nums opacity-55">
          <span>{String(index + 1).padStart(2, '0')}</span>
          {card.kicker ? <span className="hidden truncate sm:inline">{card.kicker}</span> : null}
        </div>
        <div className="min-w-0">
          <div className="mb-4 h-px w-7 opacity-50" style={{ backgroundColor: 'currentColor' }} />
          <h3 className="text-[17px] font-semibold leading-[1.12] tracking-tight text-balance break-words sm:text-[26px]">{card.title}</h3>
          <p className="mt-2.5 hidden text-[13px] leading-relaxed text-pretty opacity-80 sm:block sm:text-sm">{card.description}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ScrollSplitCards({ items = DEFAULT_CARDS, className, style, containerRef, ...props }: ScrollSplitCardsProps) {
  const options = { ...defaults, ...props }
  const titles = String(options.titles ?? '')
    .split('/')
    .map((t) => t.trim())
  const cards = items.slice(0, 3).map((card, i) => ({ ...card, title: titles[i] || card.title }))
  const backColors = Array.isArray(options.backColors) ? options.backColors : defaults.backColors
  const trackRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: trackRef,
    ...(containerRef ? { container: containerRef } : {}),
    offset: ['start start', 'end end'],
  })
  // Reduced motion: hold the settled, flipped state instead of following scroll.
  const settled = useMotionValue(0.96)
  const progress = reduceMotion ? settled : scrollYProgress
  const scale = useTransform(progress, panelScale)
  const lift = useTransform(progress, (p) => lerp(0, -72, remap(p, 0.85, 1)))

  return (
    <div ref={trackRef} className={cn('relative h-[400vh] w-full bg-neutral-950', className)} style={style}>
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden [perspective:1400px]">
        <motion.div className="flex h-[min(420px,56vh)] w-full max-w-4xl px-4 [transform-style:preserve-3d]" style={{ scale, y: lift }}>
          {cards.map((card, index) => (
            <Panel
              key={index}
              card={card}
              index={index}
              progress={progress}
              artwork={String(options.artwork)}
              backColor={String(backColors[index] ?? '#2c3033')}
              peak={Number(options.panelGap)}
              stagger={Number(options.flipStagger)}
              outer={Number(options.radius)}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default ScrollSplitCards
