// SPDX-License-Identifier: MIT
// Copyright (c) 2025 kokonutUI
// Source: https://github.com/kokonut-labs/kokonutui/blob/83eec6d/components/kokonutui/scroll-text.tsx
// Modified by Motif; see the item's provenance.
'use client'

import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { type CSSProperties, type Ref, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/* @motif:defaults */
export const defaults = {
  items: 'Strategy, Research, Branding, Interfaces, Motion, Prototyping, Engineering, Content, Analytics, Support',
  size: 48,
  inactiveOpacity: 0.35,
  activeScale: 1.08,
  blur: 1.5,
  entranceTilt: 10,
  accent: '#f5a524',
  font: 'sans',
}
/* @motif:end */

export type ScrollFocusListProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Receives the scrolling element (e.g. to drive it programmatically). */
  scrollerRef?: Ref<HTMLDivElement>
}

const FONT_FAMILY: Record<string, string> = {
  sans: "'Inter Tight Variable', 'PingFang SC', sans-serif",
  grotesk: "'Space Grotesk Variable', 'PingFang SC', sans-serif",
  serif: "'Fraunces Variable', 'Songti SC', serif",
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as { current: T | null }).current = value
}

export function ScrollFocusList({ className, style, scrollerRef, ...props }: ScrollFocusListProps) {
  const opts = { ...defaults, ...props }
  const texts = opts.items
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  const reduce = useReducedMotion() ?? false

  const [activeIndex, setActiveIndex] = useState(0)
  const [inView, setInView] = useState<boolean[]>([])
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  const setContainer = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el
      assignRef(scrollerRef, el)
    },
    [scrollerRef],
  )

  // Scroll to top on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [])

  // Replaces the upstream IntersectionObservers with scroll-position math:
  // the item nearest the centre line is active; items inside the central 60% are "in view".
  const measure = useCallback(() => {
    const c = containerRef.current
    if (!c) return
    const h = c.clientHeight
    const centre = c.scrollTop + h / 2
    let best = 0
    let bestDist = Number.POSITIVE_INFINITY
    const next: boolean[] = []
    itemsRef.current.forEach((el, i) => {
      if (!el) {
        next[i] = false
        return
      }
      const top = el.offsetTop
      const mid = top + el.offsetHeight / 2
      const d = Math.abs(mid - centre)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
      const bandTop = c.scrollTop + h * 0.2
      const bandBottom = c.scrollTop + h * 0.8
      next[i] = top + el.offsetHeight > bandTop && top < bandBottom
    })
    setActiveIndex((prev) => (prev === best ? prev : best))
    setInView((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next))
  }, [])

  useLayoutEffect(() => {
    measure()
    const c = containerRef.current
    if (!c) return
    c.addEventListener('scroll', measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(c)
    return () => {
      c.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [measure, opts.items, opts.size, opts.font])

  // Animation variants for the reveal effect
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: (index: number) => ({
      opacity: 0,
      x: index % 2 === 0 ? -100 : 100,
      rotate: index % 2 === 0 ? -opts.entranceTilt : opts.entranceTilt,
    }),
    visible: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.5,
      },
    },
  }

  return (
    <div className={cn('mx-auto w-full max-w-3xl', className)} style={style}>
      <div
        className={cn(
          'scrollbar-none h-[300px] overflow-y-auto',
          'relative flex flex-col items-center',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
        ref={setContainer}
        role="list"
        tabIndex={0}
        aria-label="Scrollable list"
        style={{ fontFamily: FONT_FAMILY[opts.font] ?? FONT_FAMILY.sans }}
      >
        <div className="h-[150px] shrink-0" />
        <motion.div
          animate="visible"
          className="flex w-full flex-col items-center"
          initial={reduce ? false : 'hidden'}
          variants={containerVariants}
        >
          {texts.map((text, index) => {
            const active = activeIndex === index
            return (
              <motion.div
                className="max-w-full whitespace-nowrap px-4 py-8 font-bold leading-none"
                custom={index}
                initial={reduce ? false : 'hidden'}
                animate={reduce || inView[index] ? 'visible' : 'hidden'}
                key={`${index}-${text}`}
                ref={(el) => {
                  itemsRef.current[index] = el
                }}
                role="listitem"
                aria-current={active ? 'true' : undefined}
                variants={itemVariants}
                style={{ fontSize: `min(${opts.size}px, 11vw)` }}
              >
                <span
                  className="block text-foreground transition-[opacity,transform,filter] duration-300 motion-reduce:transition-none"
                  style={{
                    opacity: active ? 1 : opts.inactiveOpacity,
                    transform: `scale(${active ? opts.activeScale : 1})`,
                    filter: active || opts.blur <= 0 ? 'none' : `blur(${opts.blur}px)`,
                  }}
                >
                  {text}
                </span>
              </motion.div>
            )
          })}
        </motion.div>
        <div className="h-[150px] shrink-0" />
      </div>
      <div aria-hidden className="pointer-events-none relative -mt-[150px] mb-[150px] h-0">
        <span className="absolute left-0 top-0 h-px w-6 -translate-y-1/2" style={{ background: opts.accent }} />
        <span className="absolute right-0 top-0 h-px w-6 -translate-y-1/2" style={{ background: opts.accent }} />
      </div>
    </div>
  )
}
