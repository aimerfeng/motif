// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/pointer.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/motif-runtime'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'badge',
  label: 'View',
  color: '#f5f5f4',
  labelColor: '#0c0a09',
  size: 22,
  spring: {
    visualDuration: 0.32,
    bounce: 0.3,
  },
}
/* @motif:end */

export type CustomPointerProps = Partial<typeof defaults> & {
  /** 自定义指针图形，替换内置样式；以图形中心对准指针。 */
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

type Variant = 'badge' | 'tag' | 'arrow' | 'dot'

/** 宿主元素上的标记：带着它的元素及其所有子元素都隐藏系统光标。 */
const ACTIVE_ATTRIBUTE = 'data-custom-pointer-active'
const HIDE_SYSTEM_CURSOR = `[${ACTIVE_ATTRIBUTE}], [${ACTIVE_ATTRIBUTE}] * { cursor: none !important; }`

/** 上游的箭头（16×16 的图标，尖朝右上），和上游一样转 -70° 后朝左上。 */
const ARROW_PATH = 'M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z'
const ARROW_ROTATION = -70
/** 旋转后箭头尖相对图标中心的位置（图标单位）：上游把图标中心放在指针上，这里改成箭头尖对准指针。 */
const ARROW_TIP = (() => {
  const angle = (ARROW_ROTATION * Math.PI) / 180
  const x = 14.1 - 8
  const y = 2.3 - 8
  return { x: x * Math.cos(angle) - y * Math.sin(angle), y: x * Math.sin(angle) + y * Math.cos(angle) }
})()

function Arrow({ size, color, ink }: { size: number; color: string; ink: string }) {
  const unit = size / 16
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className="absolute overflow-visible"
      style={{
        left: -size / 2 - ARROW_TIP.x * unit,
        top: -size / 2 - ARROW_TIP.y * unit,
        transform: `rotate(${ARROW_ROTATION}deg)`,
        filter: 'drop-shadow(0 2px 3px rgb(0 0 0 / 0.3))',
      }}
    >
      <path d={ARROW_PATH} fill={color} stroke={ink} strokeWidth={1.1} strokeLinejoin="round" paintOrder="stroke" />
    </svg>
  )
}

/** 内置的几种样式，都以 (0, 0) 为指针位置画出来。 */
function Shape({ variant, label, color, ink, size }: { variant: Variant; label: string; color: string; ink: string; size: number }) {
  if (variant === 'badge') {
    const diameter = Math.round(size * 3.1)
    return (
      <div
        className="absolute grid place-items-center rounded-full font-medium tracking-tight whitespace-nowrap"
        style={{
          width: diameter,
          height: diameter,
          left: -diameter / 2,
          top: -diameter / 2,
          background: color,
          color: ink,
          fontSize: Math.max(11, Math.round(size * 0.62)),
          boxShadow: '0 10px 30px -6px rgb(0 0 0 / 0.45)',
        }}
      >
        {label}
      </div>
    )
  }
  if (variant === 'dot') {
    const diameter = Math.max(6, Math.round(size * 0.55))
    return (
      <div
        className="absolute rounded-full"
        style={{ width: diameter, height: diameter, left: -diameter / 2, top: -diameter / 2, background: color, boxShadow: `0 0 0 2px ${ink}, 0 2px 8px rgb(0 0 0 / 0.35)` }}
      />
    )
  }
  return (
    <>
      <Arrow size={size} color={color} ink={ink} />
      {variant === 'tag' && label && (
        <div
          className="absolute rounded-full px-2 py-0.5 font-medium whitespace-nowrap"
          style={{
            left: size * 0.5,
            top: size * 0.72,
            background: color,
            color: ink,
            fontSize: Math.max(11, Math.round(size * 0.56)),
            boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.4)',
          }}
        >
          {label}
        </div>
      )}
    </>
  )
}

/**
 * 把它放进想换指针的容器里（作为子元素）：指针在这个容器里换成自定义样式，离开时收起。
 * 容器的 position 为 static 时会改成 relative；指针画在一层裁剪到容器边界的覆盖层里。
 */
export function CustomPointer({ children, className, style, ...props }: CustomPointerProps) {
  const { variant, label, color, labelColor, size, spring } = { ...defaults, ...props }
  const reducedMotion = useReducedMotion() ?? false
  const layerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [pressed, setPressed] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    const layer = layerRef.current
    const host = layer?.parentElement
    if (!layer || !host) return
    const previousPosition = host.style.position
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative'

    let shown = false
    const show = (value: boolean) => {
      if (shown === value) return
      shown = value
      setActive(value)
      // 只在自定义指针显示时隐藏系统光标。
      if (value) host.setAttribute(ACTIVE_ATTRIBUTE, '')
      else host.removeAttribute(ACTIVE_ATTRIBUTE)
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = layer.getBoundingClientRect()
      x.set(event.clientX - rect.left)
      y.set(event.clientY - rect.top)
      show(true)
    }
    const onLeave = () => {
      show(false)
      setPressed(false)
    }
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') setPressed(true)
    }
    const onUp = () => setPressed(false)

    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      host.removeAttribute(ACTIVE_ATTRIBUTE)
      host.style.position = previousPosition
    }
  }, [x, y])

  const pop = reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }
  return (
    <div ref={layerRef} aria-hidden className={cn('pointer-events-none absolute inset-0 z-50 overflow-hidden', className)} style={style}>
      <style>{HIDE_SYSTEM_CURSOR}</style>
      <AnimatePresence>
        {active && (
          // 零尺寸的定位点正好落在指针上，弹出和按下的缩放都绕着它。
          <motion.div
            key="pointer"
            className="absolute top-0 left-0 size-0"
            style={{ x, y }}
            initial={pop}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: pressed ? 0.86 : 1 }}
            exit={pop}
            transition={reducedMotion ? { duration: 0.12 } : { scale: { type: 'spring', ...spring }, opacity: { duration: 0.15 } }}
          >
            {children ? (
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">{children}</div>
            ) : (
              <Shape variant={variant as Variant} label={label} color={color} ink={labelColor} size={size} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
