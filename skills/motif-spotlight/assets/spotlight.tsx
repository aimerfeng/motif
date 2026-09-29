// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/spotlight.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { cn } from '@/lib/motif-runtime'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  size: 320,
  color: '#a5b4fc',
  intensity: 0.42,
  blur: 24,
  spring: {
    visualDuration: 0.3,
    bounce: 0,
  },
}
/* @motif:end */

export type SpotlightProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

/**
 * 一团跟随指针的光晕。把它放进想要打光的容器里：容器会被设为 overflow: hidden，
 * 位置为 static 时会改成 relative。
 */
export function Spotlight({ className, style, ...props }: SpotlightProps) {
  const { spring } = { ...defaults, ...props }
  // 弹簧参数变化后重建弹簧，保证调参面板里的改动立即生效。
  return <SpotlightInner key={`${spring.visualDuration}-${spring.bounce}`} className={className} style={style} {...props} />
}

function SpotlightInner({ className, style, ...props }: SpotlightProps) {
  const { size, color, intensity, blur, spring } = { ...defaults, ...props }
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const visibleRef = useRef(false)
  const x = useSpring(0, spring)
  const y = useSpring(0, spring)
  const sizeRef = useRef(size)
  sizeRef.current = size

  useEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return
    const previous = { position: parent.style.position, overflow: parent.style.overflow }
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative'
    parent.style.overflow = 'hidden'

    const show = (value: boolean) => {
      visibleRef.current = value
      setVisible(value)
    }
    const onMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect()
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      if (!visibleRef.current || reducedMotion) {
        // 从隐藏到出现时直接跳到指针处，不要从上次离开的位置滑过来。
        x.jump(px)
        y.jump(py)
        show(true)
      }
      x.set(px)
      y.set(py)
    }
    const onLeave = () => show(false)

    parent.addEventListener('pointermove', onMove)
    parent.addEventListener('pointerleave', onLeave)
    return () => {
      parent.removeEventListener('pointermove', onMove)
      parent.removeEventListener('pointerleave', onLeave)
      parent.style.position = previous.position
      parent.style.overflow = previous.overflow
    }
  }, [reducedMotion, x, y])

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={cn('pointer-events-none absolute top-0 left-0 rounded-full', className)}
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        x,
        y,
        background: `radial-gradient(circle at center, ${color} 0%, transparent 72%)`,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        willChange: 'transform, opacity',
        ...style,
      }}
      initial={false}
      animate={{ opacity: visible ? intensity : 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
    />
  )
}
