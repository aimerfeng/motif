// SPDX-License-Identifier: MIT
// Copyright (c) 2019 Material-UI SAS
// Source: https://github.com/mui/base-ui/blob/6a29b4b/docs/src/app/(docs)/react/components/preview-card/demos/detached-triggers-full/css-modules/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  openDelay: 600,
  closeDelay: 300,
  side: 'bottom',
  width: 224,
  radius: 0,
  showArrow: true,
  spring: {
    visualDuration: 0.35,
    bounce: 0,
  },
}
/* @motif:end */

type Ctx = {
  active: string | null
  popupId: string
  enter: (name: string) => void
  leave: () => void
}

const PreviewContext = createContext<Ctx | null>(null)

export type LinkPreviewCardProps = Partial<typeof defaults> & {
  /** 每个链接名对应的卡片内容（上游的 payload）。 */
  contents: Record<string, ReactNode>
  children?: ReactNode
  /** 受控：当前打开的链接名，null 为关闭。 */
  active?: string | null
  onActiveChange?: (name: string | null) => void
  className?: string
  style?: CSSProperties
}

type Placement = { x: number; y: number; arrow: number; dir: 1 | -1 }

/** 上游 PreviewCard.Root + Positioner + Popup + Arrow + Viewport 的精简版：多个链接共用一张卡。 */
export function LinkPreviewCard({ contents, children, active: activeProp, onActiveChange, className, style, ...props }: LinkPreviewCardProps) {
  const { openDelay, closeDelay, side, width, radius, showArrow, spring } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const popupId = useId()
  const root = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const [inner, setInner] = useState<string | null>(null)
  const active = activeProp === undefined ? inner : activeProp
  const [place, setPlace] = useState<Placement | null>(null)
  const [height, setHeight] = useState(0)
  const lastX = useRef<number | null>(null)

  const popupWidth = width + 18 // PopupContent 的 0.5rem 内边距 + 1px 边框

  const commit = useCallback(
    (next: string | null) => {
      window.clearTimeout(timer.current)
      if (activeProp === undefined) setInner(next)
      onActiveChange?.(next)
    },
    [activeProp, onActiveChange],
  )

  const enter = (name: string) => {
    window.clearTimeout(timer.current)
    // 已经打开时直接换到新链接，卡片不关闭。
    if (active) commit(name)
    else if (openDelay <= 0) commit(name)
    else timer.current = window.setTimeout(() => commit(name), openDelay)
  }
  const leave = () => {
    window.clearTimeout(timer.current)
    if (closeDelay <= 0) commit(null)
    else timer.current = window.setTimeout(() => commit(null), closeDelay)
  }
  const hold = () => window.clearTimeout(timer.current)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') commit(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, commit])

  // 定位：水平居中对准链接，在视口内收拢，箭头始终指向链接中心。
  useLayoutEffect(() => {
    const host = root.current
    if (!active || !host) {
      lastX.current = null
      return
    }
    const measure = () => {
      const anchor = host.querySelector<HTMLElement>(`[data-preview-name="${CSS.escape(active)}"]`)
      if (!anchor) return
      const r = anchor.getBoundingClientRect()
      const h = host.getBoundingClientRect()
      const scale = host.offsetWidth > 0 ? h.width / host.offsetWidth : 1
      const vw = document.documentElement.clientWidth / scale
      const cx = (r.left + r.width / 2) / scale
      const left = Math.max(8, Math.min(cx - popupWidth / 2, vw - popupWidth - 8))
      const x = left - h.left / scale
      const y = ((side === 'top' ? r.top - 8 : r.bottom + 8) - h.top) / scale
      const arrow = Math.max(12, Math.min(cx - left, popupWidth - 12))
      const prev = lastX.current
      lastX.current = cx
      setPlace((p) => ({ x, y, arrow, dir: prev === null || prev === cx ? (p?.dir ?? 1) : cx > prev ? 1 : -1 }))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active, popupWidth, side])

  const observer = useRef<ResizeObserver | null>(null)
  const measureContent = useCallback((el: HTMLDivElement | null) => {
    observer.current?.disconnect()
    if (!el) return
    setHeight(el.offsetHeight)
    observer.current = new ResizeObserver(() => setHeight(el.offsetHeight))
    observer.current.observe(el)
  }, [])
  useEffect(() => () => observer.current?.disconnect(), [])

  const top = side === 'top'
  const move = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const ease = [0.22, 1, 0.36, 1] as const
  const dir = place?.dir ?? 1

  return (
    <PreviewContext.Provider value={{ active, popupId, enter, leave }}>
      <div ref={root} className={cn('relative', className)} style={style}>
        {children}
        <AnimatePresence>
          {active && place && (
            <motion.div
              key="positioner"
              className="absolute top-0 left-0 z-50"
              style={{ width: popupWidth }}
              initial={{ x: place.x, y: place.y }}
              animate={{ x: place.x, y: place.y }}
              transition={move}
              onPointerEnter={hold}
              onPointerLeave={(e) => {
                if (e.pointerType !== 'touch') leave()
              }}
            >
              <motion.div
                id={popupId}
                role="tooltip"
                data-side={side}
                className={cn(
                  'relative border border-foreground bg-popover text-popover-foreground shadow-[0.25rem_0.25rem_0_rgb(0_0_0/12%)]',
                  top && '-translate-y-full',
                )}
                style={{ borderRadius: radius, transformOrigin: `${place.arrow}px ${top ? '100%' : '0%'}` }}
                initial={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
              >
                {showArrow && (
                  <motion.span
                    aria-hidden
                    className={cn('absolute left-0 block h-[6px] w-[12px] overflow-clip', top ? 'top-full rotate-180' : 'bottom-full')}
                    initial={false}
                    animate={{ x: place.arrow - 6 }}
                    transition={move}
                  >
                    <span className="absolute bottom-0 left-1/2 box-border size-[8.49px] translate-x-[-50%] translate-y-[50%] rotate-45 border border-foreground bg-popover" />
                  </motion.span>
                )}
                {/* Viewport：裁掉滑入滑出的内容，高度随新内容过渡 */}
                <motion.div
                  className="relative overflow-clip"
                  style={{ borderRadius: Math.max(radius - 1, 0) }}
                  initial={false}
                  animate={{ height: height || 'auto' }}
                  transition={reduced ? { duration: 0 } : { duration: 0.35, ease }}
                >
                  <AnimatePresence initial={false} custom={dir} mode="popLayout">
                    <motion.div
                      key={active}
                      ref={measureContent}
                      custom={dir}
                      variants={{
                        enter: (d: number) => ({ x: reduced ? 0 : `${d * 30}%`, opacity: 0 }),
                        center: { x: 0, opacity: 1 },
                        exit: (d: number) => ({ x: reduced ? 0 : `${d * -30}%`, opacity: 0 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={reduced ? { duration: 0.12 } : { x: { duration: 0.35, ease }, opacity: { duration: 0.175, ease } }}
                      style={{ width: popupWidth - 2 }}
                    >
                      {contents[active]}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PreviewContext.Provider>
  )
}

export type PreviewLinkProps = {
  /** 对应 LinkPreviewCard contents 里的键。 */
  name: string
  href: string
  children: ReactNode
  className?: string
}

/** 上游的 PreviewCard.Trigger：悬停或聚焦打开，离开时延迟关闭。 */
export function PreviewLink({ name, href, children, className }: PreviewLinkProps) {
  const ctx = useContext(PreviewContext)
  const open = ctx?.active === name
  return (
    <a
      href={href}
      data-preview-name={name}
      data-popup-open={open ? '' : undefined}
      aria-describedby={open ? ctx?.popupId : undefined}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'touch') ctx?.enter(name)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'touch') ctx?.leave()
      }}
      onFocus={() => ctx?.enter(name)}
      onBlur={() => ctx?.leave()}
      className={cn(
        'text-foreground underline decoration-foreground/60 decoration-1 underline-offset-2 outline-0 transition-[text-decoration-color] hover:decoration-foreground focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-foreground data-[popup-open]:decoration-foreground',
        className,
      )}
    >
      {children}
    </a>
  )
}

export type PreviewContentProps = {
  /** 配图（上游是照片，这里传生成的 SVG）。 */
  image: ReactNode
  children: ReactNode
}

/** 上游的 PopupContent：配图 + 摘要。 */
export function PreviewContent({ image, children }: PreviewContentProps) {
  return (
    <div className="box-border flex w-full flex-col gap-2 p-2">
      <div className="block overflow-hidden">{image}</div>
      <p className="m-0 text-sm leading-5">{children}</p>
    </div>
  )
}
