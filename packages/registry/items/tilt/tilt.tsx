// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/tilt.tsx
// Modified by Motif; see the item's provenance.
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionStyle } from 'motion/react'
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  rotationFactor: 14,
  perspective: 1000,
  reverse: false,
  glare: 0.22,
  spring: {
    visualDuration: 0.5,
    bounce: 0.2,
  },
}
/* @motif:end */

export type TiltProps = Partial<typeof defaults> & {
  children: ReactNode
  className?: string
  style?: MotionStyle
}

/**
 * 卡片随指针倾斜。给子元素加 `translateZ(…)` 可以让它浮在卡片表面之上。
 * className 里要带上圆角，高光层会继承它。
 */
export function Tilt({ children, className, style, ...props }: TiltProps) {
  const { spring } = { ...defaults, ...props }
  // 弹簧参数变化后重建弹簧，保证调参面板里的改动立即生效。
  return (
    <TiltInner key={`${spring.visualDuration}-${spring.bounce}`} className={className} style={style} {...props}>
      {children}
    </TiltInner>
  )
}

function TiltInner({ children, className, style, ...props }: TiltProps) {
  const { rotationFactor, perspective, reverse, glare, spring } = { ...defaults, ...props }
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  // x / y 是指针相对卡片中心的位置，范围 -0.5 ~ 0.5。
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const xSpring = useSpring(x, spring)
  const ySpring = useSpring(y, spring)

  const sign = reverse ? -1 : 1
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [-rotationFactor * sign, rotationFactor * sign])
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [rotationFactor * sign, -rotationFactor * sign])
  const transform = useMotionTemplate`perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`

  // 高光跟着指针走，指针在中心时几乎看不见，越靠近边缘越亮。
  const glareX = useTransform(xSpring, (value) => `${(value + 0.5) * 100}%`)
  const glareY = useTransform(ySpring, (value) => `${(value + 0.5) * 100}%`)
  const glareOpacity = useTransform([xSpring, ySpring], ([px, py]: number[]) => Math.min(1, Math.hypot(px ?? 0, py ?? 0) * 2.4) * glare)
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.9), transparent 62%)`

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set(Math.min(0.5, Math.max(-0.5, (event.clientX - rect.left) / rect.width - 0.5)))
    y.set(Math.min(0.5, Math.max(-0.5, (event.clientY - rect.top) / rect.height - 0.5)))
  }
  const handlePointerLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transformStyle: 'preserve-3d', ...style, transform: reducedMotion ? 'none' : transform }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
      {glare > 0 && !reducedMotion && (
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: glareBackground, opacity: glareOpacity }} />
      )}
    </motion.div>
  )
}
