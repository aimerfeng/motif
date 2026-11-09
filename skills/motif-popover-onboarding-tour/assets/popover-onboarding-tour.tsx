// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-389.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/motif-runtime'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  steps: 4,
  showArrow: true,
  showCounter: true,
  navStyle: 'text',
  highlightTarget: true,
  width: 280,
  radius: 6,
  accent: '#a1a1aa',
}
/* @motif:end */

export interface TourStep {
  title: string
  description: string
}

export const tourSteps: TourStep[] = [
  {
    description: "This is your new workspace. Here you'll find all your projects, recent activities, settings, and more.",
    title: 'Heart',
  },
  {
    description: 'Use the toolbar above to create new projects, invite team members, or access settings.',
    title: 'Diamond',
  },
  {
    description: 'Click the support icon in the top right corner to access our help center and documentation.',
    title: 'Club',
  },
  {
    description: 'Press ⌘K to open the command palette. Use arrow keys to navigate and Enter to select an action.',
    title: 'Spade',
  },
]

type Side = 'left' | 'right' | 'bottom'
type Placement = { x: number; y: number; side: Side; arrow: number; width: number }

const OFFSET = 4 + 6 // upstream sideOffset + arrow height
const MARGIN = 8

export type PopoverOnboardingTourProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  items?: TourStep[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  step?: number
  onStepChange?: (step: number) => void
}

export function PopoverOnboardingTour({
  className,
  style,
  items = tourSteps,
  open: openProp,
  onOpenChange,
  step: stepProp,
  onStepChange,
  ...props
}: PopoverOnboardingTourProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const id = useId()
  const steps = items.slice(0, Math.max(1, Math.round(options.steps)))
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [openState, setOpenState] = useState(false)
  const [stepState, setStepState] = useState(0)
  const [placement, setPlacement] = useState<Placement | null>(null)
  const open = openProp ?? openState
  const currentTip = Math.min(Math.max(stepProp ?? stepState, 0), steps.length - 1)

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next)
    onOpenChange?.(next)
    // upstream: onOpenChange={(open) => { if (open) setCurrentTip(0) }}
    if (next) setStep(0)
  }
  const setStep = (next: number) => {
    if (stepProp === undefined) setStepState(next)
    onStepChange?.(next)
  }

  const handleNavigation = () => setStep(currentTip === steps.length - 1 ? 0 : currentTip + 1)
  const handleNext = () => currentTip < steps.length - 1 && setStep(currentTip + 1)
  const handlePrev = () => currentTip > 0 && setStep(currentTip - 1)

  // Hand-rolled replacement for Radix's anchored positioning.
  const place = useCallback(() => {
    const root = rootRef.current
    const card = cardRefs.current[currentTip]
    const content = contentRef.current
    if (!root || !card || !content) return
    const r = root.getBoundingClientRect()
    const c = card.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const width = Math.min(options.width, vw - MARGIN * 2)
    const h = content.offsetHeight
    const need = width + OFFSET + MARGIN
    const preferred: Side = currentTip % 2 === 0 ? 'left' : 'right'
    const fits = (s: Side) => (s === 'left' ? c.left >= need : vw - c.right >= need)
    const side: Side = fits(preferred) ? preferred : fits(preferred === 'left' ? 'right' : 'left') ? (preferred === 'left' ? 'right' : 'left') : 'bottom'
    let x: number
    let y: number
    let arrow: number
    if (side === 'bottom') {
      const cx = c.left + c.width / 2
      const left = Math.min(Math.max(cx - width / 2, MARGIN), vw - MARGIN - width)
      x = left - r.left
      y = c.bottom + OFFSET - r.top
      arrow = cx - left
    } else {
      x = side === 'left' ? c.left - OFFSET - width - r.left : c.right + OFFSET - r.left
      y = c.top + c.height / 2 - h / 2 - r.top
      arrow = h / 2
    }
    setPlacement((p) =>
      p && p.x === x && p.y === y && p.side === side && p.arrow === arrow && p.width === width ? p : { x, y, side, arrow, width },
    )
  }, [currentTip, options.width])

  useLayoutEffect(() => {
    if (!open) {
      setPlacement(null)
      return
    }
    place()
  }, [open, place])

  useEffect(() => {
    if (!open) return
    const ro = new ResizeObserver(() => place())
    if (rootRef.current) ro.observe(rootRef.current)
    if (contentRef.current) ro.observe(contentRef.current)
    window.addEventListener('resize', place)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', place)
    }
  }, [open, place])

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
      if (event.key === 'Escape') {
        setOpenRef.current(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const tip = steps[currentTip]
  const side = placement?.side ?? (currentTip % 2 === 0 ? 'left' : 'right')
  const spring = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: 0.35, bounce: 0.12 }
  const enterOffset = side === 'left' ? { x: 8, y: 0 } : side === 'right' ? { x: -8, y: 0 } : { x: 0, y: -8 }
  // 上游用 Radix Arrow；这里按所在边直接画三角，外侧两条边描上边框色。
  const at = placement?.arrow ?? 0
  const arrow =
    side === 'left'
      ? { box: { left: '100%', top: at - 5, marginLeft: -1, width: 6, height: 10 }, fill: '0,0 5,5 0,10', edge: 'M0 0 5 5 0 10' }
      : side === 'right'
        ? { box: { right: '100%', top: at - 5, marginRight: -1, width: 6, height: 10 }, fill: '6,0 1,5 6,10', edge: 'M6 0 1 5 6 10' }
        : { box: { bottom: '100%', left: at - 5, marginBottom: -1, width: 10, height: 6 }, fill: '0,6 5,1 10,6', edge: 'M0 6 5 1 10 6' }

  return (
    <div ref={rootRef} className={cn('relative flex flex-col gap-4', className)} style={style}>
      <div className="grid grid-cols-2 place-items-center gap-4">
        {steps.map((s, index) => {
          const active = open && currentTip === index
          return (
            <div
              key={s.title}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex size-10 items-center justify-center rounded-md bg-secondary font-medium text-muted-foreground text-sm transition-[box-shadow,color] duration-200 motion-reduce:transition-none',
                active && options.highlightTarget && 'text-foreground',
              )}
              style={active && options.highlightTarget ? { boxShadow: `0 0 0 2px var(--color-background), 0 0 0 4px ${options.accent}` } : undefined}
            >
              {index + 1}
            </div>
          )
        })}
      </div>

      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={`${id}-tour`}
        onClick={() => setOpen(!open)}
        className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        Start tour
      </button>

      <AnimatePresence>
        {open && tip && (
          <motion.div
            key="tour"
            id={`${id}-tour`}
            ref={contentRef}
            role="dialog"
            aria-label={`Tour step ${currentTip + 1} of ${steps.length}: ${tip.title}`}
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') handleNext()
              if (event.key === 'ArrowLeft') handlePrev()
            }}
            initial={{ opacity: 0, scale: 0.95, x: (placement?.x ?? 0) + enterOffset.x, y: (placement?.y ?? 0) + enterOffset.y }}
            animate={{ opacity: placement ? 1 : 0, scale: 1, x: placement?.x ?? 0, y: placement?.y ?? 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: reduced ? 0 : 0.15 } }}
            transition={{ x: placement ? spring : { duration: 0 }, y: placement ? spring : { duration: 0 }, opacity: { duration: reduced ? 0 : 0.15 }, scale: { duration: reduced ? 0 : 0.15 } }}
            className="absolute top-0 left-0 z-50 border bg-popover px-4 py-3 text-popover-foreground outline-hidden"
            style={{ width: placement?.width ?? options.width, borderRadius: options.radius }}
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="font-medium text-[13px]">{tip.title}</p>
                <p className="text-muted-foreground text-xs">{tip.description}</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs" aria-hidden={!options.showCounter}>
                  {options.showCounter ? `${currentTip + 1}/${steps.length}` : ''}
                </span>
                {options.navStyle === 'arrows' ? (
                  <div className="flex gap-0.5">
                    {[
                      { label: 'Previous tip', disabled: currentTip === 0, onClick: handlePrev, d: 'M12.5 8h-9M7 4.5 3.5 8 7 11.5' },
                      { label: 'Next tip', disabled: currentTip === steps.length - 1, onClick: handleNext, d: 'M3.5 8h9M9 4.5 12.5 8 9 11.5' },
                    ].map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        aria-label={b.label}
                        disabled={b.disabled}
                        onClick={b.onClick}
                        className="grid size-6 place-items-center rounded-md text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                      >
                        <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={b.d} />
                        </svg>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    className="rounded-sm font-medium text-xs outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onClick={handleNavigation}
                    type="button"
                  >
                    {currentTip === steps.length - 1 ? 'Start over' : 'Next'}
                  </button>
                )}
              </div>
            </div>
            {options.showArrow && (
              <svg aria-hidden="true" viewBox={`0 0 ${arrow.box.width} ${arrow.box.height}`} className="pointer-events-none absolute block overflow-visible" style={arrow.box}>
                <polygon points={arrow.fill} className="fill-popover" />
                <path d={arrow.edge} fill="none" className="stroke-border" strokeWidth="1" />
              </svg>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
