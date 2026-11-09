// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/blocks/testimonials/testimonials-1/index.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  interval: 5,
  easing: [0.22, 1, 0.36, 1],
  accent: '#7c8cff',
  quoteSize: 36,
  avatarSize: 48,
  barWidth: 50,
}
/* @motif:end */

const CIRCLE_SIZE = 12
const BORDER_RADIUS_ACTIVE = 8
const BORDER_RADIUS_INACTIVE = 999

export interface Testimonial {
  name: string
  role: string
  quote: string
  /** Two colors for the initials avatar (dark enough for white initials). */
  colors: [string, string]
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Maya Lindqvist',
    role: 'Head of Design, Fernpath',
    quote: 'We shipped the redesign two weeks early. The handoff stopped being a meeting and became a link.',
    colors: ['#4f46e5', '#9333ea'],
  },
  {
    name: 'Daniel Okafor',
    role: 'CTO, Ledgerwise',
    quote: 'Our on-call pages dropped by half in the first month. I did not expect a tool to change our sleep.',
    colors: ['#0369a1', '#1d4ed8'],
  },
  {
    name: 'Priya Raman',
    role: 'Product Lead, Northwind Labs',
    quote: 'It is the first thing new hires ask about, and the last thing anyone would give up.',
    colors: ['#c2410c', '#be185d'],
  },
  {
    name: 'Tomás Herrera',
    role: 'Founder, Quietbox',
    quote: 'We replaced three dashboards and a spreadsheet nobody trusted. Now the numbers just agree.',
    colors: ['#047857', '#0f766e'],
  },
]

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

export type TestimonialsRotatingQuoteProps = Partial<typeof defaults> & {
  testimonials?: Testimonial[]
  className?: string
  style?: CSSProperties
}

export function TestimonialsRotatingQuote({ testimonials = TESTIMONIALS, className, style, ...props }: TestimonialsRotatingQuoteProps) {
  const { interval, easing, accent, quoteSize, avatarSize, barWidth } = { ...defaults, ...props }
  const shouldReduceMotion = useReducedMotion()
  const root = useRef<HTMLElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const origin = useRef(0)
  const timeRef = useRef(0)
  const indexRef = useRef(0)
  const [index, setIndex] = useState(0)
  const count = testimonials.length
  const duration = Math.max(1, interval)

  useFrameLoop(
    root,
    ({ time }) => {
      timeRef.current = time
      const t = Math.max(0, time - origin.current) / duration
      const next = Math.floor(t) % count
      if (next !== indexRef.current) {
        indexRef.current = next
        setIndex(next)
      }
      if (fillRef.current && !shouldReduceMotion) fillRef.current.style.transform = `scaleX(${(t - Math.floor(t)).toFixed(4)})`
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const pick = (i: number) => {
    origin.current = timeRef.current - i * duration
    indexRef.current = i
    setIndex(i)
  }

  const current = testimonials[Math.min(index, count - 1)]
  const ease = [...easing] as [number, number, number, number]
  const fontSize = `clamp(22px, 6.4vw, ${quoteSize}px)`

  return (
    <section
      ref={root}
      className={cn('relative flex flex-col items-center bg-background py-16 text-foreground', className)}
      style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", ...style }}
    >
      <div className="flex w-full max-w-5xl flex-col items-center justify-center px-4">
        <div className="w-full" style={{ minHeight: `calc(${fontSize} * 3.6)` }} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.blockquote
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              className="mb-8 text-center font-semibold leading-tight text-balance text-foreground"
              exit={shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -30 }}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
              key={index}
              style={{ fontSize, letterSpacing: '-0.02em' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease }}
            >
              &ldquo;{current.quote}&rdquo;
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="flex w-full max-w-lg items-center justify-center gap-8 pt-8">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={shouldReduceMotion ? { opacity: 1 } : { filter: 'blur(0px)', opacity: 1 }}
              className="flex min-w-0 items-center gap-4"
              exit={shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { filter: 'blur(8px)', opacity: 0 }}
              initial={shouldReduceMotion ? { opacity: 1 } : { filter: 'blur(8px)', opacity: 0 }}
              key={index}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, type: 'spring' as const }}
            >
              <span
                aria-hidden
                className="grid shrink-0 select-none place-items-center rounded-full border font-semibold text-white"
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  fontSize: avatarSize * 0.36,
                  background: `linear-gradient(135deg, ${current.colors[0]}, ${current.colors[1]})`,
                }}
              >
                {initials(current.name)}
              </span>
              <div className="mx-2 h-8 shrink-0 border-l border-muted-foreground/30 sm:mx-4" />
              <div className="min-w-0 text-left">
                <div className="text-lg font-medium italic text-foreground">{current.name}</div>
                <div className="text-base text-muted-foreground">{current.role}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Progress Bar & Circles Indicator */}
        <div className="mx-auto mt-8 flex w-full max-w-lg justify-center gap-3" role="tablist" aria-label="Testimonials">
          {testimonials.map((testimonial, i) => {
            const isActive = i === index
            return (
              <motion.button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Quote from ${testimonial.name}`}
                onClick={() => pick(i)}
                animate={{
                  borderRadius: isActive ? BORDER_RADIUS_ACTIVE : BORDER_RADIUS_INACTIVE,
                  height: CIRCLE_SIZE,
                  width: isActive ? barWidth : CIRCLE_SIZE,
                }}
                className="relative block cursor-pointer overflow-hidden bg-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                initial={false}
                key={`testimonial-${testimonial.name}-${i}`}
                style={{ border: 'none', padding: 0, maxWidth: barWidth, minWidth: CIRCLE_SIZE }}
                transition={shouldReduceMotion ? { duration: 0 } : { damping: 30, stiffness: 300, type: 'spring' as const }}
              >
                {isActive && (
                  <span
                    ref={fillRef}
                    className="absolute left-0 top-0 h-full w-full origin-left rounded-lg"
                    style={{ background: accent, transform: shouldReduceMotion ? 'scaleX(1)' : 'scaleX(0)' }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsRotatingQuote
