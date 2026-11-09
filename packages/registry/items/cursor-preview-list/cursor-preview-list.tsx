// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/cursor.tsx
// Modified by Motif; see the item's provenance.
'use client'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from 'motion/react'
import { cn } from '@motif/runtime'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  previewWidth: 160,
  aspect: 1,
  follow: {
    visualDuration: 0.5,
    bounce: 0.01,
  },
  pop: {
    visualDuration: 0.3,
    bounce: 0.1,
  },
  enterScale: 0.3,
  tilt: 6,
  offsetX: 0,
  offsetY: 0,
}
/* @motif:end */

export type CursorProps = Partial<typeof defaults> & {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** 只在父元素里显示（并隐藏系统光标）；关闭时整页都跟随。 */
  attachToParent?: boolean
  onPositionChange?: (x: number, y: number) => void
}

export function Cursor({ children, className, style, attachToParent = true, onPositionChange, ...props }: CursorProps) {
  const { previewWidth, aspect, follow, pop, enterScale, tilt, offsetX, offsetY } = { ...defaults, ...props }
  const reducedMotion = useReducedMotion() ?? false
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(!attachToParent)
  const callbackRef = useRef(onPositionChange)
  callbackRef.current = onPositionChange

  useEffect(() => {
    const parent = cursorRef.current?.parentElement
    if (!parent) return
    const previousPosition = parent.style.position
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative'
    const rect = parent.getBoundingClientRect()
    cursorX.set(rect.width / 2)
    cursorY.set(rect.height / 2)

    if (!attachToParent) document.body.style.cursor = 'none'

    const updatePosition = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const box = parent.getBoundingClientRect()
      cursorX.set(e.clientX - box.left)
      cursorY.set(e.clientY - box.top)
      callbackRef.current?.(e.clientX, e.clientY)
    }
    const onEnter = () => {
      parent.style.cursor = 'none'
      setIsVisible(true)
    }
    const onLeave = () => {
      parent.style.cursor = ''
      setIsVisible(false)
    }

    document.addEventListener('pointermove', updatePosition)
    if (attachToParent) {
      parent.addEventListener('pointerenter', onEnter)
      parent.addEventListener('pointerleave', onLeave)
    }
    return () => {
      document.removeEventListener('pointermove', updatePosition)
      parent.removeEventListener('pointerenter', onEnter)
      parent.removeEventListener('pointerleave', onLeave)
      parent.style.cursor = ''
      parent.style.position = previousPosition
      if (!attachToParent) document.body.style.cursor = ''
    }
  }, [attachToParent, cursorX, cursorY])

  const springConfig = reducedMotion ? { duration: 0 } : { visualDuration: follow.visualDuration, bounce: follow.bounce }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)
  const velocityX = useVelocity(cursorXSpring)
  const rotate = useTransform(velocityX, (v) => (reducedMotion ? 0 : Math.max(-1, Math.min(1, v / 1500)) * tilt))

  const variants = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { height: 0, opacity: 0, scale: enterScale },
        animate: { height: 'auto', opacity: 1, scale: 1 },
        exit: { height: 0, opacity: 0, scale: enterScale },
      }
  const transition = reducedMotion ? { duration: 0.12 } : { type: 'spring' as const, visualDuration: pop.visualDuration, bounce: pop.bounce }

  return (
    <motion.div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-50"
      style={{ x: cursorXSpring, y: cursorYSpring, translateX: `calc(-50% + ${offsetX}px)`, translateY: `calc(-50% + ${offsetY}px)`, rotate }}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div initial="initial" animate="animate" exit="exit" variants={variants} transition={transition} className={cn('overflow-hidden', className)} style={style}>
            <div style={{ width: previewWidth, aspectRatio: String(aspect) }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
