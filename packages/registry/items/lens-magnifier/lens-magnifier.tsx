// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/lens.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useMotionTemplate, useReducedMotion } from 'motion/react'
import { cn } from '@motif/runtime'
import { useCallback, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  zoomFactor: 1.3,
  lensSize: 170,
  duration: 0.1,
  isStatic: false,
  lensColor: '#000000',
  ariaLabel: 'Zoom Area',
}
/* @motif:end */

interface Position {
  /** The x coordinate of the lens */
  x: number
  /** The y coordinate of the lens */
  y: number
}

export type LensProps = Partial<typeof defaults> & {
  /** The children of the lens */
  children: ReactNode
  /** The position of the lens (used when isStatic) */
  position?: Position
  /** The default position of the lens */
  defaultPosition?: Position
  className?: string
  style?: CSSProperties
}

export function Lens({ children, position = { x: 0, y: 0 }, defaultPosition, className, style, ...props }: LensProps) {
  const { zoomFactor: rawZoom, lensSize: rawSize, isStatic, duration, lensColor, ariaLabel } = { ...defaults, ...props }
  const zoomFactor = Math.max(1, rawZoom)
  const lensSize = Math.max(0, rawSize)
  const reducedMotion = useReducedMotion()

  const [isHovering, setIsHovering] = useState(false)
  const [mousePosition, setMousePosition] = useState<Position>(position)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentPosition = useMemo(() => {
    if (isStatic) return position
    if (defaultPosition && !isHovering) return defaultPosition
    return mousePosition
  }, [isStatic, position, defaultPosition, isHovering, mousePosition])

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsHovering(false)
  }, [])

  const maskImage = useMotionTemplate`radial-gradient(circle ${lensSize / 2}px at ${currentPosition.x}px ${currentPosition.y}px, ${lensColor} 100%, transparent 100%)`

  const LensContent = useMemo(() => {
    const { x, y } = currentPosition

    return (
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.58 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration }}
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          transformOrigin: `${x}px ${y}px`,
          zIndex: 50,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${zoomFactor})`,
            transformOrigin: `${x}px ${y}px`,
          }}
        >
          {children}
        </div>
      </motion.div>
    )
  }, [currentPosition, maskImage, zoomFactor, children, duration, reducedMotion])

  return (
    <div
      ref={containerRef}
      className={cn('relative z-20 overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring', className)}
      style={style}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {children}
      {isStatic || defaultPosition ? LensContent : <AnimatePresence mode="popLayout">{isHovering && LensContent}</AnimatePresence>}
    </div>
  )
}
