// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/animated-tooltip/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cloneElement, createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'glass',
  color: '#8b5cf6',
  side: 'top',
  radius: 10,
  spring: {
    visualDuration: 0.3,
    bounce: 0.22,
  },
  arrow: true,
  delay: 0.35,
}
/* @motif:end */

type Options = typeof defaults

type Entry = { content: ReactNode; el: HTMLElement }
type GroupApi = {
  register: (id: string, entry: Entry | null) => void
  enter: (id: string) => void
  leave: (id: string) => void
  focus: (id: string) => void
  blur: (id: string) => void
  openId: string | null
  tipId: string
  options: Options
}

const GroupContext = createContext<GroupApi | null>(null)

export type TooltipGroupProps = Partial<Options> & {
  children: ReactNode
  /** 强制显示某个提示（演示自动播放用）。 */
  activeId?: string | null
  onPointerEnter?: () => void
  className?: string
  style?: CSSProperties
}

/**
 * 一组共用同一个气泡的提示：指针从一个触发器移到另一个时，气泡像磁铁一样滑过去、内容淡入淡出，
 * 而不是关掉再重开。触发器的 offsetParent 必须是这个容器（不要在中间放定位元素）。
 */
export function TooltipGroup({ children, activeId, onPointerEnter, className, style, ...props }: TooltipGroupProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const uid = useId()
  const box = useRef<HTMLDivElement>(null)
  const registry = useRef(new Map<string, Entry>())
  const timers = useRef<{ open?: number; close?: number }>({})
  const lastClosed = useRef(0)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [, bump] = useState(0)
  const [anchor, setAnchor] = useState<{ cx: number; top: number; bottom: number } | null>(null)
  const openId = activeId !== undefined ? activeId : (focusId ?? hoverId)
  const { variant, color, side, radius, spring, arrow, delay } = options

  const register = useCallback((id: string, entry: Entry | null) => {
    if (entry) registry.current.set(id, entry)
    else registry.current.delete(id)
  }, [])

  const enter = useCallback(
    (id: string) => {
      window.clearTimeout(timers.current.close)
      window.clearTimeout(timers.current.open)
      // 刚有提示打开过（或者正开着）时，切换到下一个不再等待。
      const warm = Date.now() - lastClosed.current < 400
      if (warm || delay === 0) setHoverId(id)
      else timers.current.open = window.setTimeout(() => setHoverId(id), delay * 1000)
    },
    [delay],
  )
  const leave = useCallback((id: string) => {
    window.clearTimeout(timers.current.open)
    window.clearTimeout(timers.current.close)
    timers.current.close = window.setTimeout(() => {
      lastClosed.current = Date.now()
      setHoverId((current) => (current === id ? null : current))
    }, 90)
  }, [])
  const focus = useCallback((id: string) => setFocusId(id), [])
  const blur = useCallback((id: string) => setFocusId((current) => (current === id ? null : current)), [])

  useEffect(() => () => {
    window.clearTimeout(timers.current.open)
    window.clearTimeout(timers.current.close)
  }, [])

  // Esc 关闭当前提示。
  useEffect(() => {
    if (!openId) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHoverId(null)
        setFocusId(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openId])

  const entry = openId ? registry.current.get(openId) : undefined
  useLayoutEffect(() => {
    if (!entry) return
    const measure = () => {
      const next = { cx: entry.el.offsetLeft + entry.el.offsetWidth / 2, top: entry.el.offsetTop, bottom: entry.el.offsetTop + entry.el.offsetHeight }
      // 值没变就保持引用不变，否则每次渲染都会触发新的渲染。
      setAnchor((prev) => (prev && prev.cx === next.cx && prev.top === next.top && prev.bottom === next.bottom ? prev : next))
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (box.current) observer.observe(box.current)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.el, openId])

  // 触发器的内容变化后需要重新渲染气泡。
  useEffect(() => {
    if (openId) bump((n) => n + 1)
  }, [openId])

  const tipId = `${uid}-tip`
  const transition = reduced ? { duration: 0.1 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const top = side === 'top'
  const surface =
    variant === 'dark' ? 'bg-foreground text-background' : variant === 'accent' ? 'text-white' : 'border bg-popover/80 text-popover-foreground backdrop-blur-xl'
  const target = anchor ? { x: anchor.cx, y: top ? anchor.top - 10 : anchor.bottom + 10 } : { x: 0, y: 0 }

  return (
    <GroupContext.Provider value={{ register, enter, leave, focus, blur, openId, tipId, options }}>
      <div ref={box} className={cn('relative', className)} style={style} onPointerEnter={(event) => event.pointerType === 'mouse' && onPointerEnter?.()}>
        {children}
        <AnimatePresence>
          {entry && anchor && (
            <motion.div
              key="tip"
              aria-hidden={false}
              className="pointer-events-none absolute top-0 left-0 z-50"
              initial={{ x: target.x, y: target.y }}
              animate={{ x: target.x, y: target.y }}
              transition={transition}
            >
              <motion.div
                id={tipId}
                role="tooltip"
                className={cn('relative w-max max-w-64 -translate-x-1/2 px-2.5 py-1.5 text-xs font-medium shadow-xl shadow-black/30', top && '-translate-y-full', surface)}
                style={{ borderRadius: radius, backgroundColor: variant === 'accent' ? color : undefined, transformOrigin: top ? 'bottom center' : 'top center' }}
                initial={{ opacity: 0, scale: reduced ? 1 : 0.82, filter: reduced ? 'blur(0px)' : 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: reduced ? 1 : 0.9, filter: reduced ? 'blur(0px)' : 'blur(2px)', transition: { duration: 0.12 } }}
                transition={transition}
              >
                <motion.div key={openId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.14 }} className="flex items-center gap-2 whitespace-nowrap">
                  {entry.content}
                </motion.div>
                {arrow && (
                  <span
                    aria-hidden
                    className={cn('absolute left-1/2 size-2 -translate-x-1/2 rotate-45', top ? '-bottom-1' : '-top-1', variant === 'dark' ? 'bg-foreground' : variant === 'accent' ? '' : 'bg-popover', variant === 'glass' && (top ? 'border-r border-b' : 'border-t border-l'))}
                    style={variant === 'accent' ? { backgroundColor: color } : variant === 'glass' ? { backgroundColor: 'color-mix(in oklab, var(--popover) 92%, transparent)' } : undefined}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GroupContext.Provider>
  )
}

export type TooltipSpringProps = Partial<Options> & {
  /** 气泡里显示的内容。 */
  content: ReactNode
  /** 唯一的触发元素（按钮、链接、图标）。 */
  children: ReactElement<{ 'aria-describedby'?: string }>
  /** 在同一个 TooltipGroup 里区分触发器的 id；不写会自动生成。 */
  id?: string
  className?: string
}

/** 弹簧提示：悬停（稍作延迟）或键盘聚焦时弹出，Esc 关闭，指针可以移到别处而不会闪烁。放进 TooltipGroup 后多个触发器共用一个滑动的气泡。 */
export function TooltipSpring({ content, children, id, className, ...props }: TooltipSpringProps) {
  const group = useContext(GroupContext)
  const auto = useId()
  const key = id ?? auto
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!group || !ref.current) return
    group.register(key, { content, el: ref.current })
    return () => group.register(key, null)
  })

  if (!group) {
    return (
      <TooltipGroup {...props} className="inline-block">
        <TooltipSpring content={content} id={key} className={className}>
          {children}
        </TooltipSpring>
      </TooltipGroup>
    )
  }

  const open = group.openId === key
  return (
    <span
      ref={ref}
      className={cn('inline-flex', className)}
      onPointerEnter={(event) => event.pointerType === 'mouse' && group.enter(key)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && group.leave(key)}
      onFocus={(event) => (event.target as HTMLElement).matches(':focus-visible') && group.focus(key)}
      onBlur={() => group.blur(key)}
    >
      {cloneElement(children, open ? { 'aria-describedby': group.tipId } : {})}
    </span>
  )
}
