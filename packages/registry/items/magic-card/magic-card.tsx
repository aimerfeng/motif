// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/magic-card.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@motif/runtime'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  mode: 'gradient',
  gradientSize: 260,
  gradientColor: '#3b3577',
  gradientOpacity: 0.9,
  gradientFrom: '#9e7aff',
  gradientTo: '#fe8bbb',
  glowFrom: '#ee4f27',
  glowTo: '#6b21ef',
  glowSize: 360,
  glowBlur: 60,
}
/* @motif:end */

export type MagicCardProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

type ResetReason = 'enter' | 'leave' | 'global' | 'init'

/** 指针经过时在卡片里亮起聚光（或光球），边框跟着点亮。圆角用 className 设置，如 rounded-2xl。 */
export function MagicCard({ className, style, children, ...props }: MagicCardProps) {
  const { mode, gradientSize, gradientColor, gradientOpacity, gradientFrom, gradientTo, glowFrom, glowTo, glowSize, glowBlur } = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()

  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)
  const springX = useSpring(mouseX, { stiffness: 250, damping: 30, mass: 0.6 })
  const springY = useSpring(mouseY, { stiffness: 250, damping: 30, mass: 0.6 })
  const orbVisible = useSpring(0, { stiffness: 300, damping: 35 })
  const orbX = reduced ? mouseX : springX
  const orbY = reduced ? mouseY : springY

  // 事件回调里要读最新参数，又不想因参数变化重新绑定全局监听。
  const latest = useRef({ mode, gradientSize, gradientOpacity })
  latest.current = { mode, gradientSize, gradientOpacity }

  const reset = useCallback(
    (reason: ResetReason = 'leave') => {
      const { mode: current, gradientSize: size, gradientOpacity: intensity } = latest.current
      if (current === 'orb') {
        orbVisible.set(reason === 'enter' ? intensity : 0)
        return
      }
      mouseX.set(-size)
      mouseY.set(-size)
    },
    [mouseX, mouseY, orbVisible],
  )

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    mouseX.set(event.clientX - rect.left)
    mouseY.set(event.clientY - rect.top)
  }

  useEffect(() => {
    reset('init')
  }, [reset, mode, gradientSize])

  // 光球的强度随参数变化时，正在显示的光球也要跟着更新。
  useEffect(() => {
    if (orbVisible.get() > 0) orbVisible.set(gradientOpacity)
  }, [gradientOpacity, orbVisible])

  useEffect(() => {
    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) reset('global')
    }
    const onBlur = () => reset('global')
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') reset('global')
    }
    window.addEventListener('pointerout', onOut)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pointerout', onOut)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reset])

  const border = useMotionTemplate`linear-gradient(var(--color-background) 0 0) padding-box, radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientFrom}, ${gradientTo}, var(--color-border) 100%) border-box`
  const spotlight = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`

  return (
    <motion.div
      className={cn('group relative isolate overflow-hidden rounded-xl border border-transparent', className)}
      onPointerMove={onPointerMove}
      onPointerLeave={() => reset('leave')}
      onPointerEnter={() => reset('enter')}
      style={{ background: border, ...style }}
    >
      <div className="absolute inset-px z-20 rounded-[inherit] bg-background" />

      {mode === 'gradient' && <motion.div aria-hidden className="pointer-events-none absolute inset-px z-30 rounded-[inherit]" style={{ background: spotlight, opacity: gradientOpacity }} />}

      {mode === 'orb' && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute z-30 rounded-full mix-blend-multiply will-change-transform dark:mix-blend-screen"
          style={{
            width: glowSize,
            height: glowSize,
            x: orbX,
            y: orbY,
            translateX: '-50%',
            translateY: '-50%',
            filter: `blur(${glowBlur}px)`,
            opacity: orbVisible,
            background: `linear-gradient(90deg, ${glowFrom}, ${glowTo})`,
          }}
        />
      )}
      <div className="relative z-40">{children}</div>
    </motion.div>
  )
}
