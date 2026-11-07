// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/smooth-cursor.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion, useSpring, useTransform, useVelocity } from 'motion/react'
import { cn } from '@motif/runtime'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  size: 28,
  color: '#ffffff',
  outlineColor: '#18181b',
  spring: {
    visualDuration: 0.3,
    bounce: 0.15,
  },
  turn: true,
  shrink: 0.12,
}
/* @motif:end */

export type SmoothCursorProps = Partial<typeof defaults> & {
  /** 自定义光标图形，替换默认的箭头；以图形中心对准指针。 */
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** 不转向时（以及第一次移动之前）箭头的朝向：指向左上，像系统光标。 */
const REST_ANGLE = -45
/** 至少移动这么远（像素）才更新朝向，细小的抖动不会让箭头乱转。 */
const HEADING_STEP = 6
/** 速度达到这个值（像素 / 秒）时收缩到最小。 */
const FULL_SPEED = 1800
/** 宿主元素上的标记：带着它的元素及其所有子元素都隐藏系统光标。 */
const ACTIVE_ATTRIBUTE = 'data-smooth-cursor-active'
const HIDE_SYSTEM_CURSOR = `[${ACTIVE_ATTRIBUTE}], [${ACTIVE_ATTRIBUTE}] * { cursor: none !important; }`

/** 上游的圆润箭头（尖朝上）：内层填充，外圈描边。 */
function Arrow({ size, color, outlineColor }: { size: number; color: string; outlineColor: string }) {
  return (
    <svg width={size} height={(size * 54) / 50} viewBox="0 0 50 54" fill="none" className="block" style={{ filter: 'drop-shadow(0 2px 3px rgb(0 0 0 / 0.25))' }}>
      <path
        d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
        fill={color}
      />
      <path
        d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
        stroke={outlineColor}
        strokeWidth={2.25825}
      />
    </svg>
  )
}

/**
 * 把它放进想换光标的容器里（作为子元素）：在这个容器里，系统光标换成一枚弹性跟随、转向前进方向的箭头。
 * 容器的 position 为 static 时会改成 relative；箭头画在一层裁剪到容器边界的覆盖层里。
 */
export function SmoothCursor({ children, className, style, ...props }: SmoothCursorProps) {
  const { spring } = { ...defaults, ...props }
  // 弹簧参数变化后重建弹簧，保证调参面板里的改动立即生效。
  return (
    <SmoothCursorInner key={`${spring.visualDuration}-${spring.bounce}`} className={className} style={style} {...props}>
      {children}
    </SmoothCursorInner>
  )
}

function SmoothCursorInner({ children, className, style, ...props }: SmoothCursorProps) {
  const { size, color, outlineColor, spring, turn, shrink } = { ...defaults, ...props }
  const reducedMotion = useReducedMotion() ?? false
  const layerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const turnRef = useRef(turn)
  turnRef.current = turn

  const x = useSpring(0, spring)
  const y = useSpring(0, spring)
  // 转向要比位置跟得快：掉头时箭头若还朝着来路，看起来像在倒着走。
  const rotate = useSpring(REST_ANGLE, { visualDuration: Math.max(0.12, spring.visualDuration * 0.6), bounce: 0 })
  const vx = useVelocity(x)
  const vy = useVelocity(y)
  // 跟着平滑后位置的速度收缩：停稳时自然回到原大小，不需要计时器。
  const scale = useTransform(() => (reducedMotion ? 1 : 1 - shrink * Math.min(1, Math.hypot(vx.get(), vy.get()) / FULL_SPEED)))

  useEffect(() => {
    const layer = layerRef.current
    const host = layer?.parentElement
    if (!layer || !host) return
    const previousPosition = host.style.position
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative'

    let shown = false
    // 上一次更新朝向时的位置，以及累计的角度（不回绕，转向时总走最短的一边）。
    const heading = { x: 0, y: 0, angle: REST_ANGLE }

    const show = (value: boolean) => {
      shown = value
      setVisible(value)
      // 只在自定义光标显示时隐藏系统光标：任何时候都不会让指针凭空消失。
      if (value) host.setAttribute(ACTIVE_ATTRIBUTE, '')
      else host.removeAttribute(ACTIVE_ATTRIBUTE)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = layer.getBoundingClientRect()
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      if (!shown || reducedMotion) {
        // 从隐藏到出现时直接跳到指针处，不从上次离开的地方滑过来。
        x.jump(px)
        y.jump(py)
        heading.x = px
        heading.y = py
        if (!shown) show(true)
      }
      x.set(px)
      y.set(py)

      if (reducedMotion || !turnRef.current) {
        if (heading.angle !== REST_ANGLE) {
          heading.angle = REST_ANGLE
          if (reducedMotion) rotate.jump(REST_ANGLE)
          else rotate.set(REST_ANGLE)
        }
        return
      }
      const dx = px - heading.x
      const dy = py - heading.y
      if (dx * dx + dy * dy < HEADING_STEP * HEADING_STEP) return
      const target = (Math.atan2(dy, dx) * 180) / Math.PI + 90
      heading.angle += ((((target - heading.angle) % 360) + 540) % 360) - 180
      heading.x = px
      heading.y = py
      rotate.set(heading.angle)
    }
    const onLeave = () => show(false)

    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeAttribute(ACTIVE_ATTRIBUTE)
      host.style.position = previousPosition
    }
  }, [reducedMotion, x, y, rotate])

  return (
    <div ref={layerRef} aria-hidden className={cn('pointer-events-none absolute inset-0 z-50 overflow-hidden', className)} style={style}>
      <style>{HIDE_SYSTEM_CURSOR}</style>
      {/* 零尺寸的定位点正好落在指针上，旋转和缩放都绕着它。 */}
      <motion.div
        className="absolute top-0 left-0 size-0"
        style={{ x, y, rotate, scale }}
        initial={false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.15 }}
      >
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
          {children ?? <Arrow size={size} color={color} outlineColor={outlineColor} />}
        </div>
      </motion.div>
    </div>
  )
}
