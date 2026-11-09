// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/hover-card/c-hover-card-8.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@motif/runtime'
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#60a5fa',
  width: 288,
  radius: 10,
  openOn: 'hover',
  pageTransition: 'slide',
  showDot: true,
  spring: {
    visualDuration: 0.25,
    bounce: 0.1,
  },
}
/* @motif:end */

export type Release = {
  version: string
  date: string
  tag: string
  tagVariant: 'success' | 'destructive' | 'info' | 'warning'
  description: string
}

export const releases: Release[] = [
  {
    version: 'v3.2.0',
    date: 'Feb 5, 2026',
    tag: 'Latest',
    tagVariant: 'success',
    description: 'Added real-time collaboration cursors, improved markdown editor performance, and fixed PDF export layout issues.',
  },
  {
    version: 'v3.1.4',
    date: 'Jan 22, 2026',
    tag: 'Patch',
    tagVariant: 'destructive',
    description: 'Resolved a memory leak in the dashboard widgets, patched a security vulnerability in file uploads.',
  },
  {
    version: 'v3.1.0',
    date: 'Jan 10, 2026',
    tag: 'Minor',
    tagVariant: 'info',
    description: 'Introduced API rate limiting dashboard, added webhook retry configuration, and new audit log filters.',
  },
  {
    version: 'v3.0.0',
    date: 'Dec 15, 2025',
    tag: 'Major',
    tagVariant: 'warning',
    description: 'Complete UI redesign with new component library, migrated to edge runtime, and added multi-tenant workspace support.',
  },
]

// 上游 Badge 的实心配色（白字）。
const TAG_CLASS: Record<Release['tagVariant'], string> = {
  success: 'bg-[#15803d] text-white',
  destructive: 'bg-[#dc2626] text-white',
  info: 'bg-[#2563eb] text-white',
  warning: 'bg-[#b45309] text-white',
}

function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 1
  const n = parseInt(m[1], 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

export type WhatsNewPopoverProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  label?: string
  items?: Release[]
  changelogHref?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  page?: number
  onPageChange?: (page: number) => void
}

export function WhatsNewPopover({
  className,
  style,
  label = "What's new?",
  items = releases,
  changelogHref,
  open: openProp,
  onOpenChange,
  page: pageProp,
  onPageChange,
  ...props
}: WhatsNewPopoverProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const [openState, setOpenState] = useState(false)
  const [pageState, setPageState] = useState(0)
  const [pageInfo, setPageInfo] = useState({ last: 0, direction: 1 })
  const open = openProp ?? openState
  const current = Math.min(Math.max(pageProp ?? pageState, 0), items.length - 1)
  if (pageInfo.last !== current) setPageInfo({ last: current, direction: current > pageInfo.last ? 1 : -1 })
  const direction = pageInfo.direction

  const setOpen = (next: boolean) => {
    window.clearTimeout(timer.current)
    if (openProp === undefined) setOpenState(next)
    onOpenChange?.(next)
  }
  const setPage = (next: number) => {
    if (pageProp === undefined) setPageState(next)
    onPageChange?.(next)
  }
  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(next), delay)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const setOpenRef = useRef(setOpen)
  useEffect(() => {
    setOpenRef.current = setOpen
  })
  useEffect(() => {
    if (!open) return
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenRef.current(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenRef.current(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleNext = () => {
    if (current < items.length - 1) setPage(current + 1)
  }
  const handlePrev = () => {
    if (current > 0) setPage(current - 1)
  }

  const isFirst = current === 0
  const isLast = current === items.length - 1
  const release = items[current]
  // 强调色太暗时文字退回前景色，只用强调色画下划线和圆点。
  const ink = luminance(options.accent) > 0.12 ? options.accent : 'var(--color-foreground)'
  const hover = options.openOn === 'hover'
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, ...options.spring }
  const pageMotion =
    reduced || options.pageTransition === 'none'
      ? { initial: false as const, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, transition: { duration: 0 } } }
      : options.pageTransition === 'fade'
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : { initial: { opacity: 0, x: 16 * direction }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 * direction } }

  return (
    <div
      ref={rootRef}
      className={cn('relative inline-flex', className)}
      style={style}
      onPointerEnter={hover ? () => schedule(true, 100) : undefined}
      onPointerLeave={hover ? () => schedule(false, 200) : undefined}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-card`}
        aria-haspopup="dialog"
        onClick={() => setOpen(!open)}
        className="relative cursor-default rounded-sm text-sm font-medium underline decoration-dashed decoration-1 underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ color: ink, textDecorationColor: options.accent }}
      >
        {label}
        {options.showDot && (
          <span className="absolute -top-1 -right-2.5 flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full rounded-full opacity-75 motion-safe:animate-ping" style={{ backgroundColor: options.accent }} />
            <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: options.accent }} />
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-card`}
            role="dialog"
            aria-label="Release notes"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4, transition: { duration: reduced ? 0 : 0.12 } }}
            transition={transition}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') handleNext()
              if (event.key === 'ArrowLeft') handlePrev()
            }}
            className="absolute top-full right-0 z-50 mt-2 max-w-[calc(100vw-32px)] origin-top-right space-y-1 overflow-hidden border bg-popover px-3 pt-3 pb-2 text-xs text-popover-foreground shadow-lg shadow-black/20"
            style={{ width: options.width, borderRadius: options.radius }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={current} {...pageMotion} transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{release.version}</span>
                    <span className={cn('inline-flex h-4 min-w-4 items-center rounded-[4px] px-1 text-[0.6rem] leading-none font-medium', TAG_CLASS[release.tagVariant])}>
                      {release.tag}
                    </span>
                  </div>
                  <span className="text-muted-foreground">{release.date}</span>
                </div>
                <p className="leading-relaxed text-muted-foreground">{release.description}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1" role="img" aria-label={`Release ${current + 1} of ${items.length}`}>
                  {items.map((item, i) => (
                    <span
                      key={item.version}
                      className={cn('size-1.5 rounded-full transition-colors', i !== current && 'bg-muted-foreground/30')}
                      style={i === current ? { backgroundColor: options.accent } : undefined}
                    />
                  ))}
                </div>
                {changelogHref && (
                  <a href={changelogHref} className="rounded-sm font-medium underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring" style={{ color: ink }}>
                    Full changelog
                  </a>
                )}
              </div>
              <div className="flex gap-0.5">
                {[
                  { label: 'Previous release', disabled: isFirst, onClick: handlePrev, d: 'M12.5 8h-9M7 4.5 3.5 8 7 11.5' },
                  { label: 'Next release', disabled: isLast, onClick: handleNext, d: 'M3.5 8h9M9 4.5 12.5 8 9 11.5' },
                ].map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    aria-label={b.label}
                    disabled={b.disabled}
                    onClick={b.onClick}
                    className="grid size-6 place-items-center rounded-md text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={b.d} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
