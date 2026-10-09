// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/time-machine-stack/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition } from 'motion/react'
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  height: 340,
  radius: 18,
  visibleCount: 5,
  offsetY: 34,
  depth: 56,
  scaleStep: 0.05,
  perspective: 1400,
  spring: {
    visualDuration: 0.3,
    bounce: 0.1,
  },
}
/* @motif:end */

export interface TimeMachineStackItem {
  id: string
  content: ReactNode
}

export type TimeMachineStackProps = Partial<typeof defaults> & {
  items: TimeMachineStackItem[]
  /** 受控：最前面那一张的序号。 */
  index?: number
  onIndexChange?: (index: number) => void
  className?: string
  style?: CSSProperties
}

const WHEEL_THRESHOLD = 12
const WHEEL_COOLDOWN_MS = 220
const DRAG_THRESHOLD = 48
const FORWARD = 1
const BACKWARD = -1
const EXIT_ENTER = { duration: 0.25, ease: [0.23, 1, 0.32, 1] as const }

type PanelState = TargetAndTransition & { opacity: number; transform: string }

const clampIndex = (value: number, max: number) => Math.min(Math.max(value, 0), max)

// 用一个 transform 字符串而不是 y / z / scale 简写：简写走 CSS 变量，合成器加速不了
const toTransform = (y: number, z: number, scale: number) => `translateY(${y}px) translateZ(${z}px) scale(${scale})`

/** 时光机卡堆：后面的面板向上、向远处退去，滚轮、拖拽或方向键把最前面的一张推过镜头。 */
export function TimeMachineStack({ items, index, onIndexChange, className, style, ...props }: TimeMachineStackProps) {
  const { height, depth, offsetY, scaleStep, visibleCount, perspective, radius, spring } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const listboxId = useId()
  const lastIndex = Math.max(items.length - 1, 0)
  const controlled = index !== undefined
  const [inner, setInner] = useState(0)
  const current = clampIndex(controlled ? (index as number) : inner, lastIndex)

  const container = useRef<HTMLDivElement>(null)
  const wheelLock = useRef(false)
  const dragOrigin = useRef<number | null>(null)

  // 前进时最前面那张飞过镜头，后退时从前方落回；方向由序号变化推出，受控时也正确
  const previous = useRef(current)
  const directionRef = useRef(FORWARD)
  if (previous.current !== current) {
    directionRef.current = current > previous.current ? FORWARD : BACKWARD
    previous.current = current
  }
  const direction = directionRef.current

  const goTo = useCallback(
    (next: number) => {
      const clamped = clampIndex(next, lastIndex)
      if (clamped === current) return
      if (!controlled) setInner(clamped)
      onIndexChange?.(clamped)
    },
    [controlled, current, lastIndex, onIndexChange],
  )

  useEffect(() => {
    const el = container.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD || wheelLock.current) return
      const next = current + (event.deltaY > 0 ? FORWARD : BACKWARD)
      // 到头时把滚轮还给页面，不拦截文档滚动
      if (next < 0 || next > lastIndex) return
      event.preventDefault()
      wheelLock.current = true
      goTo(next)
      setTimeout(() => {
        wheelLock.current = false
      }, WHEEL_COOLDOWN_MS)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [current, goTo, lastIndex])

  const onKeyDown = (event: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowDown: current + FORWARD, ArrowRight: current + FORWARD, ArrowUp: current + BACKWARD, ArrowLeft: current + BACKWARD, Home: 0, End: lastIndex }
    if (event.key in map) {
      event.preventDefault()
      goTo(map[event.key])
    }
  }

  const onPointerUp = (event: PointerEvent) => {
    const origin = dragOrigin.current
    dragOrigin.current = null
    if (origin === null) return
    const delta = origin - event.clientY
    if (Math.abs(delta) < DRAG_THRESHOLD) return
    goTo(current + (delta > 0 ? FORWARD : BACKWARD))
  }

  // 深度靠缩放、位移、z 和阴影表达，不用透明度：透明的面板不挡后面的，叠起来就成了一堆幽灵。
  // 透明度只留给可见窗口之外的两个位置——那里的淡出描述的是面板进出窗口。
  const panelState = useCallback(
    (pos: number): PanelState => {
      if (reduced) return { opacity: pos === 0 ? 1 : 0, transform: toTransform(0, 0, 1) }
      if (pos < 0) return { opacity: 0, transform: toTransform(offsetY * 2, depth * 2, 1 + scaleStep * 2) }
      return { opacity: pos >= visibleCount ? 0 : 1, transform: toTransform(-pos * offsetY, -pos * depth, 1 - pos * scaleStep) }
    },
    [depth, offsetY, reduced, scaleStep, visibleCount],
  )

  const visible = items.slice(current, current + visibleCount).map((item, pos) => ({ item, pos }))
  const front = visible[0]?.item
  // 后退的面板向上平移，所以顶部预留出这么多空间，所有面板贴底对齐
  const reservedTop = reduced ? 0 : Math.max(visibleCount - 1, 0) * offsetY
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const exitState = direction === FORWARD ? panelState(-1) : panelState(visibleCount)

  return (
    <div className={cn('flex w-full flex-col items-center gap-4', className)} style={style}>
      <div
        ref={container}
        id={listboxId}
        role="listbox"
        aria-label="Time machine stack"
        aria-activedescendant={front ? `${listboxId}-${front.id}` : undefined}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          dragOrigin.current = event.clientY
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragOrigin.current = null
        }}
        className="relative w-full touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ height, borderRadius: radius, perspective: reduced ? undefined : perspective }}
      >
        <AnimatePresence initial={false}>
          {visible
            .slice()
            .reverse()
            .map(({ item, pos }) => {
              const state = panelState(pos)
              return (
                <motion.div
                  key={item.id}
                  id={`${listboxId}-${item.id}`}
                  role="option"
                  aria-selected={pos === 0}
                  animate={{ opacity: state.opacity, transform: state.transform }}
                  // 面板只会从两个地方进场：前进时在最深一层后面，后退时在最前面
                  initial={direction === FORWARD ? panelState(visibleCount) : panelState(-1)}
                  exit={{ opacity: 0, transform: exitState.transform, transition: reduced ? { duration: 0 } : EXIT_ENTER }}
                  transition={transition}
                  className="absolute inset-x-0 bottom-0 overflow-hidden border border-foreground/10 bg-card shadow-[0_18px_45px_-20px_rgba(0,0,0,0.45)]"
                  style={{ top: reservedTop, zIndex: visibleCount - pos, borderRadius: radius }}
                >
                  {item.content}
                </motion.div>
              )
            })}
        </AnimatePresence>
      </div>
      <div aria-live="polite" className="sr-only">
        {front ? `Item ${current + 1} of ${items.length}` : 'No items'}
      </div>
    </div>
  )
}
