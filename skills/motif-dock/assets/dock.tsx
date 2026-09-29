// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/dock.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import { createContext, useContext, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  iconSize: 48,
  iconMagnification: 80,
  iconDistance: 150,
  gap: 8,
  spring: {
    visualDuration: 0.28,
    bounce: 0.25,
  },
  direction: 'bottom',
  disableMagnification: false,
}
/* @motif:end */

export type DockProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

interface DockContext {
  mouseX: MotionValue<number>
  iconSize: number
  magnified: number
  distance: number
  spring: { visualDuration: number; bounce: number }
}

const Context = createContext<DockContext | null>(null)

/** 一排会被指针放大的图标。图标要用 DockIcon 包起来。 */
export function Dock({ className, style, children, ...props }: DockProps) {
  const { iconSize, iconMagnification, iconDistance, gap, spring, direction, disableMagnification } = { ...defaults, ...props }
  const mouseX = useMotionValue(Infinity)
  // 减少动态效果时不再放大，图标保持原尺寸。
  const reduced = usePrefersReducedMotion()
  const magnified = disableMagnification || reduced ? iconSize : Math.max(iconMagnification, iconSize)

  return (
    <Context.Provider value={{ mouseX, iconSize, magnified, distance: iconDistance, spring }}>
      <motion.div
        role="toolbar"
        onPointerMove={(event) => mouseX.set(event.clientX)}
        onPointerLeave={() => mouseX.set(Infinity)}
        className={cn(
          'mx-auto flex w-max justify-center rounded-2xl border bg-foreground/5 p-2 backdrop-blur-xl',
          direction === 'top' ? 'items-start' : direction === 'middle' ? 'items-center' : 'items-end',
          className,
        )}
        style={{ gap, height: iconSize + 18, ...style }}
      >
        {children}
      </motion.div>
    </Context.Provider>
  )
}

export type DockIconProps = {
  className?: string
  children?: ReactNode
}

/** Dock 里的一个图标：尺寸随指针距离变化，children 填满整个图标区域。 */
export function DockIcon({ className, children }: DockIconProps) {
  const context = useContext(Context)
  if (!context) throw new Error('DockIcon must be used inside <Dock>')
  const { mouseX, iconSize, magnified, distance, spring } = context
  const ref = useRef<HTMLDivElement>(null)

  const offset = useTransform(mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect()
    return bounds ? x - (bounds.left + bounds.width / 2) : Infinity
  })
  const target = useTransform(offset, [-distance, 0, distance], [iconSize, magnified, iconSize])
  const size = useSpring(target, { visualDuration: spring.visualDuration, bounce: spring.bounce })

  return (
    <motion.div ref={ref} style={{ width: size, height: size }} className={cn('flex aspect-square shrink-0 items-center justify-center', className)}>
      {children}
    </motion.div>
  )
}
