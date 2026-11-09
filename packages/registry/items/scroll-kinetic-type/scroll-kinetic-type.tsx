// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/kinetic-type-scroll/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { type MotionValue, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import type { CSSProperties, RefObject } from 'react'
import { useRef } from 'react'

/* @motif:defaults */
export const defaults = {
  words: 'Design moves with intent and breathes on scroll',
  scaleRange: [0.92, 1.18],
  trackingRange: [-0.5, 2.5],
  weightRange: [380, 800],
  liftRange: [0, -12],
  dimRange: [0.45, 1],
  stagger: 0.12,
  align: 'center',
  font: 'sans',
}
/* @motif:end */

export type KineticTypeScrollAlign = 'start' | 'center' | 'end'

type UseScrollOptions = Parameters<typeof useScroll>[0]
export type ScrollOffsetTuple = NonNullable<UseScrollOptions>['offset']

export type KineticTypeScrollProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Scrollable ancestor whose progress drives the effect. */
  container?: RefObject<HTMLElement | null>
  /** Motion scroll offset tuple, forwarded to `useScroll`. */
  offset?: ScrollOffsetTuple
}

interface KineticWordProps {
  dimRange: [number, number]
  index: number
  liftRange: [number, number]
  progress: MotionValue<number>
  scaleRange: [number, number]
  shouldReduceMotion: boolean
  stagger: number
  total: number
  trackingRange: [number, number]
  weightRange: [number, number]
  word: string
}

const ALIGN_ROW_CLASS: Record<KineticTypeScrollAlign, string> = {
  center: 'justify-center',
  end: 'justify-end',
  start: 'justify-start',
}

const FONT_FAMILY: Record<string, string> = {
  sans: "'Inter Tight Variable', 'PingFang SC', sans-serif",
  grotesk: "'Bricolage Grotesque Variable', 'PingFang SC', sans-serif",
  serif: "'Fraunces Variable', 'Songti SC', serif",
}

/**
 * Head- and tail-room at both ends of the scroll range: the wave starts after
 * the phrase has settled into view and ends before it leaves.
 */
const WAVE_MARGIN = 0.14
/** Each word's active window as a multiple of the gap between peaks. */
const WINDOW_OVERLAP = 1.2
const MIN_WINDOW = 0.09
const INTENSITY_MIDPOINT = 1
const INTENSITY_SCALE = 2
// A soft, near-critically-damped spring: the wave should read as one moving crest.
const SPRING_TRANSITION = {
  bounce: 0,
  duration: 0.32,
  type: 'spring' as const,
}

/** Opens as the phrase enters the lower part of the viewport and closes around the middle. */
const DEFAULT_OFFSET = ['start 0.9', 'end 0.45'] as ScrollOffsetTuple

const asRange = (value: unknown, fallback: [number, number]): [number, number] =>
  Array.isArray(value) && value.length === 2 ? [Number(value[0]), Number(value[1])] : fallback

function KineticWord({
  word,
  dimRange,
  index,
  liftRange,
  progress,
  scaleRange,
  shouldReduceMotion,
  stagger,
  total,
  trackingRange,
  weightRange,
}: KineticWordProps) {
  const gaps = Math.max(1, total - 1)
  // Peaks are evenly spaced and the whole wave is centred in the range.
  const spacing = Math.min(stagger, (1 - 2 * WAVE_MARGIN) / gaps)
  const waveStart = (1 - spacing * gaps) / 2
  const center = waveStart + spacing * index
  const halfWindow = Math.max(spacing * WINDOW_OVERLAP, MIN_WINDOW)
  const start = center - halfWindow
  const end = center + halfWindow

  const localProgress = useTransform(progress, [start, end], [0, 1], { clamp: true })
  const intensity = useTransform(localProgress, (value) => INTENSITY_MIDPOINT - Math.abs(value * INTENSITY_SCALE - 1))
  const rawScale = useTransform(intensity, [0, 1], scaleRange)
  const rawTracking = useTransform(intensity, [0, 1], trackingRange)
  const rawWeight = useTransform(intensity, [0, 1], weightRange)
  const rawLift = useTransform(intensity, [0, 1], liftRange)
  const rawOpacity = useTransform(intensity, [0, 1], dimRange)
  const scale = useSpring(rawScale, SPRING_TRANSITION)
  const trackingValue = useSpring(rawTracking, SPRING_TRANSITION)
  const weight = useSpring(rawWeight, SPRING_TRANSITION)
  const y = useSpring(rawLift, SPRING_TRANSITION)
  const opacity = useSpring(rawOpacity, SPRING_TRANSITION)
  const letterSpacing = useTransform(trackingValue, (value) => `${value}px`)
  const fontVariationSettings = useTransform(weight, (value) => `"wght" ${Math.round(value)}`)

  if (shouldReduceMotion) {
    // No travel and no dimming: the phrase simply reads at its peak weight.
    return (
      <span aria-hidden="true" className="inline-block" style={{ fontVariationSettings: `"wght" ${weightRange[1]}` }}>
        {word}
      </span>
    )
  }

  return (
    <motion.span aria-hidden="true" className="inline-block will-change-transform" style={{ fontVariationSettings, letterSpacing, opacity, scale, y }}>
      {word}
    </motion.span>
  )
}

/**
 * KineticTypeScroll: editorial kinetic typography driven by scroll.
 * Each word maps a slice of scroll progress to its own scale, tracking
 * and weight curve so the phrase breathes as the section scrolls.
 */
export function KineticTypeScroll({ className, style, container, offset = DEFAULT_OFFSET, ...props }: KineticTypeScrollProps) {
  const options = { ...defaults, ...props } as Record<string, unknown>
  const words = String(options.words ?? '')
    .split(/\s+/)
    .filter(Boolean)
  const align = (options.align as KineticTypeScrollAlign) ?? 'center'
  const scaleRange = asRange(options.scaleRange, [0.92, 1.18])
  const trackingRange = asRange(options.trackingRange, [-0.5, 2.5])
  const weightRange = asRange(options.weightRange, [380, 800])
  const liftRange = asRange(options.liftRange, [0, -12])
  const dimRange = asRange(options.dimRange, [0.45, 1])
  const stagger = Number(options.stagger ?? 0.12)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ container, offset, target: wrapperRef })

  return (
    <div
      className={cn(
        // Gaps are in `em` and sized to clear the peak scale.
        'flex flex-wrap gap-x-[0.4em] gap-y-[0.18em]',
        ALIGN_ROW_CLASS[align] ?? ALIGN_ROW_CLASS.center,
        className,
      )}
      ref={wrapperRef}
      style={{ fontFamily: FONT_FAMILY[String(options.font)] ?? FONT_FAMILY.sans, ...style }}
    >
      {/* Every glyph below is aria-hidden, so the readable copy lives here. */}
      <span className="sr-only">{words.join(' ')}</span>
      {words.map((word, index) => (
        <KineticWord
          dimRange={dimRange}
          index={index}
          key={index}
          liftRange={liftRange}
          progress={scrollYProgress}
          scaleRange={scaleRange}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          stagger={stagger}
          total={words.length}
          trackingRange={trackingRange}
          weightRange={weightRange}
          word={word}
        />
      ))}
    </div>
  )
}
