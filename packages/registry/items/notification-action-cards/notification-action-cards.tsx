// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-298.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  type: 'update',
  showProgress: true,
  duration: 5,
  position: 'bottom-right',
  tone: 'success',
  elevation: 'raised',
  radius: 6,
}
/* @motif:end */

export type NotificationType = 'message' | 'invite' | 'reminder' | 'update' | 'action'
export type NotificationTone = 'success' | 'info' | 'warning' | 'error'

export type NotificationActionCardProps = Partial<typeof defaults> & {
  /** Controlled visibility. Omit to let the card manage itself (auto-dismiss + close button). */
  open?: boolean
  /** Controlled remaining time in seconds (drives the progress bar instead of the internal timer). */
  remaining?: number
  onDismiss?: () => void
  /** Called with the action label, e.g. "Undo", "Accept", "Install". */
  onAction?: (action: string) => void
  /** Override the body of the card. */
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

const TONES: Record<NotificationTone, { icon: string; bar: string }> = {
  success: { icon: 'text-emerald-500', bar: 'bg-emerald-500' },
  info: { icon: 'text-blue-500', bar: 'bg-blue-500' },
  warning: { icon: 'text-amber-500', bar: 'bg-amber-500' },
  error: { icon: 'text-red-500', bar: 'bg-red-500' },
}

const SHADOWS: Record<string, string> = { flat: 'shadow-xs', raised: 'shadow-lg', floating: 'shadow-2xl shadow-black/40' }

const POSITIONS: Record<string, string> = {
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
}

const svg = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function ToneIcon({ tone, className }: { tone: NotificationTone; className?: string }) {
  return (
    <svg {...svg} aria-hidden="true" className={className}>
      {tone === 'warning' ? (
        <>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10" />
          {tone === 'success' && <path d="m9 12 2 2 4-4" />}
          {tone === 'error' && <path d="M12 8v4M12 16h.01" />}
          {tone === 'info' && <path d="M12 16v-4M12 8h.01" />}
        </>
      )}
    </svg>
  )
}

const RefreshIcon = () => (
  <svg {...svg} aria-hidden="true" className="opacity-60">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
)

const RadioIcon = () => (
  <svg {...svg} aria-hidden="true" className="opacity-60">
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
  </svg>
)

const btn =
  'inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-xs font-medium outline-none transition-[color,background-color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50'
const btnPrimary = cn(btn, 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90')
const btnOutline = cn(btn, 'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground')
const btnLink = cn(btn, 'text-primary underline-offset-4 hover:underline')
const textBtn = 'rounded-sm text-sm font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50'

/** Actionable notification card (Origin UI comp-288/294/295/296/298): message, invite, reminder, update or action, with an optional auto-dismiss bar that pauses on hover/focus. */
export function NotificationActionCard({ open: openProp, remaining: remainingProp, onDismiss, onAction, children, className, style, ...props }: NotificationActionCardProps) {
  const { type, showProgress, duration, position, tone, elevation, radius } = { ...defaults, ...props } as {
    type: NotificationType
    showProgress: boolean
    duration: number
    position: string
    tone: NotificationTone
    elevation: string
    radius: number
  }
  const reduced = useReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [innerOpen, setInnerOpen] = useState(true)
  const open = openProp ?? innerOpen
  const paused = useRef(false)
  const left = useRef(duration)

  const dismiss = () => {
    if (openProp === undefined) setInnerOpen(false)
    onDismiss?.()
  }
  const act = (label: string) => {
    onAction?.(label)
    dismiss()
  }

  // Internal countdown on the shared frame clock (paused while hovered/focused; frozen under reduced motion).
  useFrameLoop(
    hostRef,
    ({ delta }) => {
      if (!open) return
      if (remainingProp === undefined && !paused.current && delta > 0) {
        left.current = Math.max(0, left.current - delta)
        if (left.current === 0) dismiss()
      }
      const value = remainingProp ?? left.current
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(0, Math.min(1, value / duration))})`
    },
    { reducedMotion: 'static' },
  )

  const t = TONES[tone] ?? TONES.success
  const fromTop = position.startsWith('top')
  const x = position.endsWith('left') ? -24 : position.endsWith('right') ? 24 : 0
  const initial = reduced ? { opacity: 0 } : { opacity: 0, x, y: x === 0 ? (fromTop ? -16 : 16) : 0, scale: 0.98 }

  const close = (
    <button
      type="button"
      aria-label="Close notification"
      onClick={dismiss}
      className="group -my-1.5 -me-2 inline-flex size-8 shrink-0 items-center justify-center rounded-md p-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <svg {...svg} aria-hidden="true" className="opacity-60 transition-opacity group-hover:opacity-100">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  )

  const body = (() => {
    if (children) return <div className="flex grow gap-3">{children}</div>
    switch (type) {
      case 'message':
        // comp-288
        return (
          <div className="flex grow gap-3">
            <ToneIcon tone={tone} className={cn('mt-0.5 shrink-0', t.icon)} />
            <div className="flex grow flex-wrap justify-between gap-x-12 gap-y-1">
              <p className="text-sm">Message sent</p>
              <div className="whitespace-nowrap text-sm">
                <button className={textBtn} type="button" onClick={() => act('View')}>
                  View
                </button>{' '}
                <span className="mx-1 text-muted-foreground">·</span>{' '}
                <button className={textBtn} type="button" onClick={() => act('Undo')}>
                  Undo
                </button>
              </div>
            </div>
          </div>
        )
      case 'invite':
        // comp-295 (photo avatar replaced by initials)
        return (
          <div className="flex grow gap-3">
            <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-sky-500 text-xs font-semibold text-white">
              MP
            </div>
            <div className="flex grow flex-col gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Mara Pell</span> shared <span className="font-medium text-foreground">q3-roadmap.fig</span> with you.
                </p>
                <p className="text-xs text-muted-foreground">2 min ago</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className={btnPrimary} onClick={() => act('Accept')}>
                  Accept
                </button>
                <button type="button" className={btnOutline} onClick={() => act('Decline')}>
                  Decline
                </button>
              </div>
            </div>
          </div>
        )
      case 'reminder':
        // comp-296
        return (
          <div className="flex grow items-center gap-3">
            <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border">
              <RadioIcon />
            </div>
            <div className="flex grow flex-wrap items-center justify-between gap-x-12 gap-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Live in 27 hours</p>
                <p className="text-xs text-muted-foreground">November 20 at 8:00 PM.</p>
              </div>
              <button type="button" className={btnPrimary} onClick={() => act('Notify me')}>
                Notify me
              </button>
            </div>
          </div>
        )
      case 'update':
        // comp-294
        return (
          <div className="flex grow gap-3">
            <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border">
              <RefreshIcon />
            </div>
            <div className="flex grow flex-col gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Version 1.4 is now available!</p>
                <p className="text-sm text-muted-foreground">This update contains several bug fixes and performance improvements.</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className={btnPrimary} onClick={() => act('Install')}>
                  Install
                </button>
                <button type="button" className={btnLink} onClick={() => act('Later')}>
                  Later
                </button>
              </div>
            </div>
          </div>
        )
      default:
        // comp-298
        return (
          <div className="flex grow gap-3">
            <ToneIcon tone={tone} className={cn('mt-0.5 shrink-0', t.icon)} />
            <div className="flex grow flex-col gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Your changes were saved</p>
                <p className="text-sm text-muted-foreground">Pricing page draft was published to the staging site.</p>
              </div>
              <div>
                <button type="button" className={btnPrimary} onClick={() => act('Undo changes')}>
                  Undo changes
                </button>
              </div>
            </div>
          </div>
        )
    }
  })()

  return (
    <div
      ref={hostRef}
      role="region"
      aria-label="Notifications"
      className={cn('pointer-events-none absolute z-50 flex w-[calc(100%-2rem)] max-w-[400px] flex-col', POSITIONS[position] ?? POSITIONS['bottom-right'], className)}
      style={style}
    >
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            role={tone === 'error' ? 'alert' : 'status'}
            aria-live={tone === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            initial={initial}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: x * 2, scale: 0.98 }}
            transition={reduced ? { duration: 0.15 } : { type: 'spring', visualDuration: 0.35, bounce: 0.15 }}
            onPointerEnter={() => (paused.current = true)}
            onPointerLeave={() => (paused.current = false)}
            onFocus={() => (paused.current = true)}
            onBlur={() => (paused.current = false)}
            className={cn('pointer-events-auto relative w-full overflow-hidden border bg-background p-4 text-foreground', SHADOWS[elevation] ?? SHADOWS.raised)}
            style={{ borderRadius: radius }}
          >
            <div className={cn('flex w-full justify-between gap-2', type === 'reminder' && 'items-center')}>
              {body}
              {close}
            </div>
            {showProgress && (
              <div aria-hidden="true" className="contents">
                <div ref={barRef} className={cn('pointer-events-none absolute bottom-0 left-0 h-1 w-full origin-left', t.bar)} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
