// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/perspective-text-3d/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Signals from the far side',
  split: 'words',
  driver: 'pointer',
  rotateX: 8,
  rotateY: 10,
  depth: 40,
  perspective: 800,
  fontSize: 64,
  color: '#f4f1ea',
  font: 'grotesk',
}
/* @motif:end */

export type PerspectiveTextDriver = 'scroll' | 'pointer' | 'static'
export type PerspectiveTextSplit = 'lines' | 'words'

export type PerspectiveText3DProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Scrollable ancestor observed when `driver` is "scroll". */
  container?: RefObject<HTMLElement | null>
  /** Externally driven pointer position (-0.5..0.5 on each axis); overrides real pointer tracking when set. */
  pointer?: { x: number; y: number } | null
}

const POINTER_RANGE_MULTIPLIER = 2
const SPRING_TRANSITION = {
  bounce: 0.1,
  duration: 0.25,
  type: 'spring' as const,
}

const FONT_STACKS: Record<string, string> = {
  grotesk: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif",
  serif: "'Instrument Serif', ui-serif, Georgia, serif",
  black: "'Archivo Black', ui-sans-serif, system-ui, sans-serif",
}

const splitContent = (content: string, split: string): string[] => {
  if (split === 'words') {
    return content.split(/\s+/).filter((segment) => segment.length > 0)
  }
  const lines = content.split('\n').filter((line) => line.length > 0)
  return lines.length > 0 ? lines : [content]
}

/**
 * PerspectiveText3D — text on a 3D plane that tilts and separates in
 * depth. Lines or words are pushed along the Z axis and the whole plane
 * reacts to scroll progress or the pointer.
 */
export function PerspectiveText3D({ className, style, container, pointer, ...props }: PerspectiveText3DProps) {
  const { text, split, driver, rotateX, rotateY, depth, perspective, fontSize, color, font } = { ...defaults, ...props }
  const content = text
  const wrapperRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [pointerTilt, setPointerTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || driver !== 'pointer' || shouldReduceMotion) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect()
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5
      setPointerTilt({
        x: -relativeY * rotateX * POINTER_RANGE_MULTIPLIER,
        y: relativeX * rotateY * POINTER_RANGE_MULTIPLIER,
      })
    }
    const handlePointerLeave = () => setPointerTilt({ x: 0, y: 0 })

    wrapper.addEventListener('pointermove', handlePointerMove)
    wrapper.addEventListener('pointerleave', handlePointerLeave)
    return () => {
      wrapper.removeEventListener('pointermove', handlePointerMove)
      wrapper.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [driver, rotateX, rotateY, shouldReduceMotion])

  const { scrollYProgress } = useScroll({ container, target: wrapperRef })
  const scrollRotateXRaw = useTransform(scrollYProgress, [0, 1], [rotateX, -rotateX])
  const scrollRotateYRaw = useTransform(scrollYProgress, [0, 1], [-rotateY, rotateY])
  const scrollRotateX = useSpring(scrollRotateXRaw, SPRING_TRANSITION)
  const scrollRotateY = useSpring(scrollRotateYRaw, SPRING_TRANSITION)

  const typeStyle: CSSProperties = {
    color,
    fontFamily: FONT_STACKS[font] ?? FONT_STACKS.grotesk,
    fontSize: `min(${fontSize}px, 13vw)`,
    lineHeight: 1.05,
    ...style,
  }

  if (shouldReduceMotion) {
    return (
      <p className={className} style={{ whiteSpace: 'pre-line', ...typeStyle }}>
        {content}
      </p>
    )
  }

  const segments = splitContent(content, split)
  const midIndex = (segments.length - 1) / 2
  const tilt = pointer
    ? { x: -pointer.y * rotateX * POINTER_RANGE_MULTIPLIER, y: pointer.x * rotateY * POINTER_RANGE_MULTIPLIER }
    : pointerTilt
  const planeAnimate =
    driver === 'pointer' ? { rotateX: tilt.x, rotateY: tilt.y } : driver === 'static' ? { rotateX, rotateY } : undefined
  const planeInitial = driver === 'scroll' ? undefined : { rotateX: 0, rotateY: 0 }

  return (
    <div className={cn('inline-block', className)} ref={wrapperRef} style={{ perspective, ...typeStyle }}>
      {/* Every segment below is aria-hidden, so the readable copy lives here.
          An aria-label on this plain div would be dropped by assistive tech. */}
      <span className="sr-only">{content}</span>
      <motion.div
        animate={planeAnimate}
        initial={planeInitial}
        style={{
          transformStyle: 'preserve-3d',
          ...(driver === 'scroll' ? { rotateX: scrollRotateX, rotateY: scrollRotateY } : {}),
        }}
        transition={SPRING_TRANSITION}
      >
        {segments.map((segment, index) => (
          <div
            aria-hidden="true"
            key={index}
            style={{
              display: split === 'lines' ? 'block' : 'inline-block',
              transform: `translateZ(${(index - midIndex) * depth}px)`,
            }}
          >
            {segment}
            {split === 'words' && index < segments.length - 1 ? ' ' : null}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
