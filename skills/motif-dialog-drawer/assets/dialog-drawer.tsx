// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Emil Kowalski
// Source: https://github.com/emilkowalski/vaul/blob/3e97aac/src/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { animate, motion, useDragControls, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  color: '#8b5cf6',
  radius: 26,
  snapMode: 'two',
  spring: {
    visualDuration: 0.5,
    bounce: 0.12,
  },
  dim: 0.55,
  scaleBackground: true,
  maxWidth: 460,
}
/* @motif:end */

export type DialogDrawerProps = Partial<typeof defaults> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** 当前停靠的吸附点序号（受控）。 */
  snap?: number
  onSnapChange?: (snap: number) => void
  title: string
  description?: string
  /** 抽屉背后的页面：打开时它会缩小并后退（scaleBackground），同时变为 inert。 */
  page?: ReactNode
  /** true：抽屉限制在最近的定位容器里（预览、嵌入）；false：铺满视口。 */
  contained?: boolean
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * 底部抽屉（bottom sheet）：拖动手柄或标题栏，松手时按速度投射到最近的吸附点，或者被甩出去关闭。
 * 打开时背后的页面缩小后退，焦点被困在抽屉里，Esc 或点击遮罩关闭，关闭后焦点回到触发它的元素。
 */
export function DialogDrawer({ open, defaultOpen = false, onOpenChange, snap, onSnapChange, title, description, page, contained = false, children, className, style, ...props }: DialogDrawerProps) {
  const { color, radius, snapMode, spring, dim, scaleBackground, maxWidth } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const uid = useId()
  const frameRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const controls = useDragControls()
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const [innerSnap, setInnerSnap] = useState(0)
  const [visible, setVisible] = useState(false)
  const [frameH, setFrameH] = useState(0)
  const isOpen = open ?? innerOpen
  const snapIndex = snap ?? innerSnap

  // 吸附点 = 抽屉露出的高度。
  const snaps = snapMode === 'two' ? [Math.round(frameH * 0.48), Math.round(frameH * 0.9)] : [Math.round(Math.min(frameH * 0.66, 620))]
  const sheetH = Math.max(...snaps, 1)
  const index = Math.min(snapIndex, snaps.length - 1)
  const targetY = (i: number) => sheetH - (snaps[i] ?? sheetH)
  const y = useMotionValue(10000)

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const measure = () => setFrameH(el.clientHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const transition = reduced ? { duration: 0.16, ease: 'easeOut' as const } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }

  // 打开 / 切换吸附点 / 关闭：所有位移都走同一个 motion value。
  useEffect(() => {
    if (frameH === 0) return
    if (isOpen) {
      if (!visible) {
        y.jump(sheetH + 8)
        setVisible(true)
      }
      const controlsAnim = animate(y, targetY(index), transition)
      return () => controlsAnim.stop()
    }
    if (visible) {
      const controlsAnim = animate(y, sheetH + 8, transition)
      void controlsAnim.then(() => setVisible(false))
      return () => controlsAnim.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, index, frameH, snapMode, visible])

  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next)
    onOpenChange?.(next)
  }
  const setSnap = (next: number) => {
    if (snap === undefined) setInnerSnap(next)
    onSnapChange?.(next)
  }

  // 焦点：打开时进入抽屉，关闭后回到之前的元素；非 contained 时锁住页面滚动。
  useEffect(() => {
    if (!isOpen || !visible) return
    returnFocus.current = document.activeElement as HTMLElement | null
    sheetRef.current?.focus({ preventScroll: true })
    const lock = !contained
    const previous = document.body.style.overflow
    if (lock) document.body.style.overflow = 'hidden'
    return () => {
      if (lock) document.body.style.overflow = previous
      returnFocus.current?.focus?.({ preventScroll: true })
    }
  }, [isOpen, visible, contained])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setOpen(false)
      return
    }
    if (event.key !== 'Tab') return
    const nodes = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    if (nodes.length === 0) {
      event.preventDefault()
      return
    }
    const first = nodes[0]!
    const last = nodes[nodes.length - 1]!
    if (event.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const projected = y.get() + info.velocity.y * 0.2
    const points = [...snaps.map((_, i) => targetY(i)), sheetH + 8]
    const nearest = points.reduce((best, p, i) => (Math.abs(p - projected) < Math.abs(points[best]! - projected) ? i : best), 0)
    if (nearest === points.length - 1) setOpen(false)
    else {
      setSnap(nearest)
      animate(y, points[nearest]!, transition)
    }
  }

  const first = Math.max(snaps[0] ?? 1, 1)
  const progress = useTransform(y, (v) => clamp((sheetH - v) / first))
  const overlay = useTransform(progress, (p) => p * dim)
  const pageScale = useTransform(progress, (p) => 1 - (scaleBackground ? 0.05 : 0) * p)
  const pageY = useTransform(progress, (p) => (scaleBackground ? 10 : 0) * p)
  const pageRadius = useTransform(progress, (p) => (scaleBackground ? 16 : 0) * p)

  const layer = contained ? 'absolute' : 'fixed'

  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-black', className)} style={{ '--c': color, ...style } as CSSProperties}>
      <motion.div
        className="h-full w-full origin-top overflow-hidden bg-background"
        style={{ scale: pageScale, y: pageY, borderRadius: pageRadius }}
        inert={isOpen}
        aria-hidden={isOpen || undefined}
      >
        {page}
      </motion.div>

      <div ref={frameRef} className={cn(layer, 'inset-0 z-50', !visible && 'pointer-events-none')} style={{ visibility: visible ? 'visible' : 'hidden' }}>
        {visible && (
          <>
            <motion.div aria-hidden className="absolute inset-0 bg-black" style={{ opacity: overlay }} onClick={() => setOpen(false)} />
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${uid}-title`}
              aria-describedby={description ? `${uid}-desc` : undefined}
              tabIndex={-1}
              onKeyDown={onKeyDown}
              drag="y"
              dragControls={controls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: sheetH }}
              dragElastic={{ top: 0.04, bottom: 0.1 }}
              dragMomentum={false}
              onDragEnd={onDragEnd}
              className="absolute inset-x-0 bottom-0 mx-auto flex w-full flex-col overflow-hidden border border-b-0 bg-popover text-popover-foreground shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.55)] outline-none"
              style={{ y, height: sheetH, maxWidth, borderTopLeftRadius: radius, borderTopRightRadius: radius }}
            >
              <div onPointerDown={(event) => controls.start(event)} className="shrink-0 cursor-grab touch-none px-5 pt-2.5 pb-3 active:cursor-grabbing">
                <div aria-hidden className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-foreground/20" />
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 id={`${uid}-title`} className="text-[17px] leading-6 font-semibold tracking-tight">{title}</h2>
                    {description && <p id={`${uid}-desc`} className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{description}</p>}
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => setOpen(false)}
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground/[0.07] text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-(--c)"
                  >
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="m4 4 8 8M12 4l-8 8" /></svg>
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">{children}</div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
