// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/scroll-progress.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion, useScroll, useSpring, type SpringOptions } from 'motion/react'
import { cn } from '@/lib/motif-runtime'
import type { CSSProperties, RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  color: '#0090ff',
  variant: 'solid',
  thickness: 4,
  stiffness: 200,
  damping: 50,
}
/* @motif:end */

export type ScrollProgressProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  springOptions?: SpringOptions
  containerRef?: RefObject<HTMLElement | null>
}

export function ScrollProgress({ className, style, springOptions, containerRef, ...props }: ScrollProgressProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    container: containerRef,
  })

  const spring = useSpring(scrollYProgress, {
    stiffness: options.stiffness,
    damping: options.damping,
    restDelta: 0.001,
    ...(springOptions ?? {}),
  })
  const scaleX = reduced ? scrollYProgress : spring

  const background =
    options.variant === 'fade'
      ? `linear-gradient(to right, transparent, ${options.color} 75%, ${options.color} 100%)`
      : options.color

  return (
    <motion.div
      role="progressbar"
      aria-label="Reading progress"
      className={cn('inset-x-0 top-0 h-1 origin-left', className)}
      style={{
        height: options.thickness,
        background,
        ...style,
        scaleX,
      }}
    />
  )
}
