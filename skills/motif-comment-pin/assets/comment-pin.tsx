// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/figma-comment/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  author: 'Mira Okafor',
  message: 'What happens if we adjust this to handle a light and dark mode? I\'m not sure if we\'re ready to handle...',
  timestamp: 'Just now',
  width: 180,
  accent: '#8b5cf6',
  spring: {
    visualDuration: 0.3,
    bounce: 0.15,
  },
  openOnHover: false,
}
/* @motif:end */

export type CommentPinProps = Partial<typeof defaults> & {
  /** 受控的展开状态（演示自动播放用）。 */
  open?: boolean
  onOpenChange?: (isOpen: boolean) => void
  className?: string
  style?: CSSProperties
}

const CLOSED_SIZE = 32
const AVATAR_CLOSED_LEFT = 4
const AVATAR_CLOSED_TOP = 4
const AVATAR_OPEN_LEFT = 12
const AVATAR_OPEN_TOP = 12
const CONTENT_DELAY = 0.15
const INITIAL_BLUR_PX = 6
const EXIT_BLUR_PX = 3
const CONTAINER_CLOSE_DELAY = 0.08
const BLUR_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function useClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, handler: (event: Event) => void) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })
  useEffect(() => {
    function callback(event: Event) {
      const target = event.target as Node | null
      if (!target?.isConnected) return
      if (ref.current && !ref.current.contains(target)) handlerRef.current(event)
    }
    window.addEventListener('mousedown', callback)
    window.addEventListener('touchstart', callback)
    return () => {
      window.removeEventListener('mousedown', callback)
      window.removeEventListener('touchstart', callback)
    }
  }, [ref])
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? '?'
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

/** 相对亮度（sRGB），用来挑头像上的文字颜色。 */
function luminance(hex: string) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m?.[1]) return 0.2
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function Attribution({ author, timestamp, message }: { author: string; timestamp: string; message: string }) {
  return (
    <>
      {/* Attribution */}
      <div className="flex items-start gap-0.5">
        <p className="font-semibold text-[11px] text-foreground leading-4">{author}</p>
        <p className="font-medium text-[11px] text-muted-foreground leading-4">{timestamp}</p>
      </div>
      {/* Message */}
      <p className="text-left font-medium text-[11px] text-foreground leading-4">{message}</p>
    </>
  )
}

/** 设计工具式的评论钉：点开后弹成气泡，点外面或按 Esc 收起。 */
export function CommentPin({ open, onOpenChange, className, style, ...props }: CommentPinProps) {
  const { author, message, timestamp, width, accent, spring, openOnHover } = { ...defaults, ...props }
  const [innerOpen, setInnerOpen] = useState(false)
  const isOpen = open ?? innerOpen
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(CLOSED_SIZE)
  const shouldReduceMotion = useReducedMotion()

  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next)
    onOpenChange?.(next)
  }

  // Close comment when clicking outside
  useClickOutside(containerRef, () => {
    if (isOpen) setOpen(false)
  })

  // Measure content height (ResizeObserver instead of the upstream timeouts)
  useEffect(() => {
    const inner = contentRef.current?.firstElementChild as HTMLElement | null | undefined
    if (!inner) return
    const measure = () => {
      const height = inner.scrollHeight
      if (height > 0) setContentHeight(height)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [])

  const size = { height: isOpen ? contentHeight : CLOSED_SIZE, width: isOpen ? width : CLOSED_SIZE }
  const avatarPos = { left: isOpen ? AVATAR_OPEN_LEFT : AVATAR_CLOSED_LEFT, top: isOpen ? AVATAR_OPEN_TOP : AVATAR_CLOSED_TOP }
  const ink = luminance(accent) > 0.4 ? '#111827' : '#ffffff'

  return (
    <div className={cn('relative', className)} style={style}>
      <motion.div
        ref={containerRef}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label={isOpen ? `Comment by ${author}` : `Open comment by ${author}`}
        animate={shouldReduceMotion ? {} : size}
        className="absolute bottom-0 left-0 cursor-pointer overflow-hidden rounded-2xl rounded-bl-none bg-background shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.18),0px_3px_8px_0px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen(!isOpen)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen(!isOpen)
          } else if (event.key === 'Escape' && isOpen) {
            setOpen(false)
          }
        }}
        onPointerEnter={
          openOnHover
            ? (event) => {
                if (event.pointerType === 'mouse' && !isOpen) setOpen(true)
              }
            : undefined
        }
        onPointerLeave={
          openOnHover
            ? (event) => {
                if (event.pointerType === 'mouse' && isOpen) setOpen(false)
              }
            : undefined
        }
        style={shouldReduceMotion ? size : { width: CLOSED_SIZE, height: CLOSED_SIZE }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: 'spring', visualDuration: spring.visualDuration, bounce: spring.bounce, delay: isOpen ? 0 : CONTAINER_CLOSE_DELAY }
        }
      >
        {/* Avatar - animates position */}
        <motion.div
          animate={shouldReduceMotion ? {} : avatarPos}
          className="absolute z-10"
          style={shouldReduceMotion ? avatarPos : { left: AVATAR_CLOSED_LEFT, top: AVATAR_CLOSED_TOP }}
          transition={shouldReduceMotion ? { duration: 0 } : { damping: 25, stiffness: 300, type: 'spring' }}
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 select-none items-center justify-center overflow-hidden rounded-full font-semibold text-[9px] tracking-tight"
            style={{
              color: ink,
              background: `linear-gradient(135deg, color-mix(in oklab, ${accent} 70%, white), ${accent} 55%, color-mix(in oklab, ${accent} 75%, black))`,
            }}
          >
            {initials(author)}
          </span>
        </motion.div>

        {/* Content - always rendered but hidden when closed for measurement */}
        <div aria-hidden="true" className="pointer-events-none invisible absolute" ref={contentRef} style={{ left: 0, top: '-9999px', width: `${width}px` }}>
          <div className="flex flex-col items-start gap-0.5 py-3 pr-4 pl-11">
            <Attribution author={author} timestamp={timestamp} message={message} />
          </div>
        </div>

        {/* Content - visible when open */}
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              animate={shouldReduceMotion ? { opacity: 1 } : { filter: 'blur(0px)', opacity: 1 }}
              className="absolute inset-0 flex flex-col items-start gap-0.5 py-3 pr-4 pl-11"
              exit={
                shouldReduceMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { filter: `blur(${EXIT_BLUR_PX}px)`, opacity: 0, transition: { duration: 0.25, ease: BLUR_EASE } }
              }
              initial={shouldReduceMotion ? { opacity: 0 } : { filter: `blur(${INITIAL_BLUR_PX}px)`, opacity: 0 }}
              style={{ width: `${width}px` }}
              transition={(shouldReduceMotion ? { duration: 0 } : { duration: 0.25, delay: CONTENT_DELAY, ease: BLUR_EASE }) satisfies Transition}
            >
              <Attribution author={author} timestamp={timestamp} message={message} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
