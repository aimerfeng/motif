// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/components/core/text-loop.tsx
// Modified by Motif; see the item's provenance.
import { cn, useIsActive } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from 'motion/react'
import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  items: 'barbers, physios, piano teachers, dog groomers',
  interval: 2.4,
  variant: 'slide-up',
  spring: {
    visualDuration: 0.45,
    bounce: 0.15,
  },
  distance: 50,
  blur: 4,
  clip: true,
  pauseOnHover: true,
}
/* @motif:end */

export type TextLoopProps = Partial<typeof defaults> & {
  /** 直接写子元素时优先于 items，每个子元素是一项（与上游用法一致）。 */
  children?: ReactNode
  /** 为 false 时停在当前项。 */
  trigger?: boolean
  /** 换到新的一项时调用。 */
  onIndexChange?: (index: number) => void
  className?: string
  style?: CSSProperties
}

/** items 用逗号或换行分隔。 */
function splitItems(items: string): string[] {
  return items
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

/** 四种进出方式。distance 是相对自身行高的百分比，blur 单位 px。 */
function variantsFor(variant: string, distance: number, blur: number): Variants {
  const soft = `blur(${blur}px)`
  const sharp = 'blur(0px)'
  switch (variant) {
    case 'slide-down':
      return {
        initial: { y: `${-distance}%`, opacity: 0, filter: soft },
        animate: { y: '0%', opacity: 1, filter: sharp },
        exit: { y: `${distance}%`, opacity: 0, filter: soft },
      }
    case 'flip':
      return {
        initial: { rotateX: 90, y: `${distance * 0.5}%`, opacity: 0, filter: soft },
        animate: { rotateX: 0, y: '0%', opacity: 1, filter: sharp },
        exit: { rotateX: -90, y: `${-distance * 0.5}%`, opacity: 0, filter: soft },
      }
    case 'blur':
      return {
        initial: { opacity: 0, filter: `blur(${Math.max(blur, 2) * 1.5}px)` },
        animate: { opacity: 1, filter: sharp },
        exit: { opacity: 0, filter: `blur(${Math.max(blur, 2) * 1.5}px)` },
      }
    default:
      return {
        initial: { y: `${distance}%`, opacity: 0, filter: soft },
        animate: { y: '0%', opacity: 1, filter: sharp },
        exit: { y: `${-distance}%`, opacity: 0, filter: soft },
      }
  }
}

const FADE: Variants = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

/**
 * 裁切边缘：上下各留 0.15em 的渐隐带，进出的词在行的边缘淡出，而不是压到上下文的文字上。
 * 左右也留一点不渐隐的余量，字形的外伸和翻转时的透视放大不会被切掉；内外边距相互抵消，排版不变。
 */
const EDGE = '0.15em'
const CLIP_STYLE: CSSProperties = {
  paddingBlock: EDGE,
  marginBlock: `-${EDGE}`,
  paddingInline: '0.1em',
  marginInline: '-0.1em',
  maskImage: `linear-gradient(to bottom, transparent, #000 ${EDGE}, #000 calc(100% - ${EDGE}), transparent)`,
}

/**
 * 在同一个位置轮换一组词。计时用 requestAnimationFrame 累加：离屏、切到后台、悬停（可选）时暂停，
 * 截图时的手动时钟也能驱动。减少动态效果时照常换词，但只做淡入淡出。
 */
export function TextLoop({ children, trigger = true, onIndexChange, className, style, ...props }: TextLoopProps) {
  const { items, interval, variant, spring, distance, blur, clip, pauseOnHover } = { ...defaults, ...props }
  const list: ReactNode[] = children !== undefined ? Children.toArray(children) : splitItems(items)
  const count = list.length
  const reduced = useReducedMotion()
  const hostRef = useRef<HTMLSpanElement>(null)
  const active = useIsActive(hostRef)
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const elapsed = useRef(0)
  const onIndexChangeRef = useRef(onIndexChange)
  onIndexChangeRef.current = onIndexChange
  const running = trigger && active && count > 1 && !(pauseOnHover && hovered)

  useEffect(() => {
    if (!running) return
    let frame = 0
    let last: number | null = null
    const tick = (now: number) => {
      // 单帧最多计 0.1 秒：从后台切回来不会连跳几项。
      if (last !== null) elapsed.current += Math.min((now - last) / 1000, 0.1)
      last = now
      if (elapsed.current >= interval) {
        elapsed.current -= interval
        setIndex((current) => (current + 1) % count)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running, interval, count])

  // 和上一次的序号比较，而不是「跳过第一次」：StrictMode 下 effect 会在挂载时跑两遍。
  const previous = useRef(index)
  useEffect(() => {
    if (previous.current === index) return
    previous.current = index
    onIndexChangeRef.current?.(index)
  }, [index])

  const current = count > 0 ? index % count : 0
  // 弹簧负责位移和翻转；透明度和模糊用不回弹的缓动，避免模糊半径冲过 0。
  const fade = { duration: Math.max(spring.visualDuration * 0.8, 0.12), ease: 'easeOut' } as const
  const transition: Transition = reduced
    ? { duration: 0.3, ease: 'easeInOut' }
    : { type: 'spring', visualDuration: spring.visualDuration, bounce: spring.bounce, opacity: fade, filter: fade }

  return (
    <span
      ref={hostRef}
      className={cn('relative inline-block whitespace-nowrap', variant === 'flip' && 'perspective-[600px]', className)}
      style={clip ? { ...CLIP_STYLE, ...style } : style}
      onPointerEnter={pauseOnHover ? () => setHovered(true) : undefined}
      onPointerLeave={pauseOnHover ? () => setHovered(false) : undefined}
    >
      {/* 读屏软件一次读到全部候选项，而不是只读到此刻那一个。 */}
      <span className="sr-only">
        {list.map((item, position) => (
          <span key={position}>
            {item}
            {position < count - 1 ? ', ' : ''}
          </span>
        ))}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={current}
          aria-hidden
          className="inline-block origin-[50%_50%_-0.3em]"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={reduced ? FADE : variantsFor(variant, distance, blur)}
          transition={transition}
        >
          {list[current]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
