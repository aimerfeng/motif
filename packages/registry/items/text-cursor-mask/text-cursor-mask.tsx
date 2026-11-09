// SPDX-License-Identifier: MIT
// Copyright (c) Animata
// Source: https://github.com/codse/animata/blob/36674e4/animata/text/mask-text.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@motif/runtime'
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  frontText: 'We make websites.',
  hiddenText: 'We make them feel alive.',
  idleSize: 50,
  hoverSize: 500,
  maskColor: '#000000',
  hiddenColor: '#ffffff',
  softness: 0,
  duration: 0.5,
  easing: [0.34, 1.56, 0.64, 1],
}
/* @motif:end */

export type TextCursorMaskProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

type Point = { x: number; y: number; clientX: number; clientY: number }

function luminance(hex: string) {
  const n = parseInt(hex.slice(1, 7), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** 遮罩里的文字色：和遮罩底色对比度不够时，按底色亮度改用深色或浅色墨水。 */
function readableInk(ink: string, bg: string) {
  const a = luminance(ink)
  const b = luminance(bg)
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  if (ratio >= 4.5) return ink
  return b > 0.18 ? '#0a0a0a' : '#fafafa'
}

/** 上游的 useMousePosition：pointermove 里记下相对坐标，每帧最多回调一次。 */
function useMousePosition(ref: RefObject<HTMLElement | null>, callback?: (point: Point) => void) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const node = ref.current
    if (!node) return
    let frame: number | null = null
    let latest: Point | null = null
    const flush = () => {
      frame = null
      if (latest) callbackRef.current?.(latest)
    }
    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      latest = { x: event.clientX - rect.left, y: event.clientY - rect.top, clientX: event.clientX, clientY: event.clientY }
      if (frame === null) frame = requestAnimationFrame(flush)
    }
    node.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      node.removeEventListener('pointermove', onMove)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [ref])
}

/**
 * 一个圆形遮罩跟随指针，透出下面的另一句话；指针移到文字上时遮罩放大成大镜头。
 */
export function TextCursorMask({ className, style, ...props }: TextCursorMaskProps) {
  const { frontText, hiddenText, idleSize, hoverSize, maskColor, hiddenColor, softness, duration, easing } = { ...defaults, ...props }
  const reducedMotion = useReducedMotion()
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const [{ x, y }, setMousePosition] = useState({ x: -1000, y: -1000 })
  // 上游用 <p> 的 mouseenter/leave 判断悬停；这里在 pointermove 里做命中测试，合成的指针事件也能触发。
  useMousePosition(containerRef, (point) => {
    setMousePosition({ x: point.x, y: point.y })
    const rect = textRef.current?.getBoundingClientRect()
    setIsHovered(rect !== undefined && point.clientX >= rect.left && point.clientX <= rect.right && point.clientY >= rect.top && point.clientY <= rect.bottom)
  })
  const size = isHovered ? hoverSize : idleSize
  const solid = Math.max(0, Math.min(99, 100 - softness))
  const maskImage = `radial-gradient(circle closest-side, #000 ${solid}%, transparent 100%)`
  const ink = readableInk(hiddenColor, maskColor)

  const common = 'flex h-full w-full items-center justify-center px-6 text-center text-4xl font-bold leading-snug text-balance text-foreground sm:text-5xl'

  return (
    <div
      className={cn('relative h-full min-h-64 w-full overflow-hidden', className)}
      style={style}
      ref={containerRef}
      onPointerLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={cn(common, 'pointer-events-none absolute inset-0')}
        style={{
          backgroundColor: maskColor,
          color: ink,
          maskImage,
          WebkitMaskImage: maskImage,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
        initial={false}
        animate={
          {
            WebkitMaskPosition: `${x - size / 2}px ${y - size / 2}px`,
            WebkitMaskSize: `${size}px ${size}px`,
            maskPosition: `${x - size / 2}px ${y - size / 2}px`,
            maskSize: `${size}px ${size}px`,
          } as Record<string, string>
        }
        transition={reducedMotion ? { duration: 0 } : { type: 'tween', ease: easing as [number, number, number, number], duration }}
        aria-hidden
      >
        <p>{hiddenText}</p>
      </motion.div>

      <div className={common}>
        <p ref={textRef}>{frontText}</p>
        <span className="sr-only">{hiddenText}</span>
      </div>
    </div>
  )
}
