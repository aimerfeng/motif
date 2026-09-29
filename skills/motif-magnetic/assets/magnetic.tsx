// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/magnetic.tsx
// Modified by Motif; see the item's provenance.
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { cn } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  intensity: 0.5,
  range: 120,
  actionArea: 'parent',
  spring: {
    visualDuration: 0.45,
    bounce: 0.3,
  },
}
/* @motif:end */

export type MagneticProps = Partial<typeof defaults> & {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

type ActionArea = 'self' | 'parent' | 'global'

/**
 * 让子元素被指针吸引。外层 div 不参与位移，用它的位置计算距离，
 * 这样位移不会反过来改变距离，也就不会抖动。
 */
export function Magnetic({ children, className, style, ...props }: MagneticProps) {
  const { spring } = { ...defaults, ...props }
  // 弹簧参数变化后重建弹簧，保证调参面板里的改动立即生效。
  return (
    <MagneticInner key={`${spring.visualDuration}-${spring.bounce}`} className={className} style={style} {...props}>
      {children}
    </MagneticInner>
  )
}

function MagneticInner({ children, className, style, ...props }: MagneticProps) {
  const { intensity, range, actionArea, spring } = { ...defaults, ...props }
  const area = actionArea as ActionArea
  const reducedMotion = useReducedMotion()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, spring)
  const springY = useSpring(y, spring)

  useEffect(() => {
    if (reducedMotion) {
      x.set(0)
      y.set(0)
      return
    }
    const reset = () => {
      x.set(0)
      y.set(0)
    }
    const onMove = (event: PointerEvent) => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const rect = wrapper.getBoundingClientRect()
      const region = area === 'parent' ? (wrapper.parentElement?.getBoundingClientRect() ?? rect) : rect
      const inside = area === 'global' || (event.clientX >= region.left && event.clientX <= region.right && event.clientY >= region.top && event.clientY <= region.bottom)
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      const distance = Math.hypot(dx, dy)
      if (!inside || distance > range) return reset()
      // 越靠近中心吸力越强，边缘处平滑过渡到 0。
      const pull = intensity * (1 - distance / range)
      x.set(dx * pull)
      y.set(dy * pull)
    }
    window.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', reset)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', reset)
    }
  }, [reducedMotion, area, intensity, range, x, y])

  return (
    <div ref={wrapperRef} className={cn('inline-block', className)} style={style}>
      <motion.div style={{ x: springX, y: springY }}>{children}</motion.div>
    </div>
  )
}
