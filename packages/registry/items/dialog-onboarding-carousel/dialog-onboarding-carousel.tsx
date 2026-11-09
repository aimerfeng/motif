// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-332.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  steps: 4,
  artStyle: 'glow',
  transition: 'slide',
  indicator: 'dots',
  showSkip: true,
  radius: 12,
  accent: '#6366f1',
  finishLabel: 'Okay',
}
/* @motif:end */

export type OnboardingStep = { title: string; description: string }

export type DialogOnboardingCarouselProps = Partial<typeof defaults> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Controlled step (1-based). */
  step?: number
  onStepChange?: (step: number) => void
  /** Called when the last step's button is pressed. */
  onComplete?: () => void
  stepContent?: OnboardingStep[]
  /** true: overlay is limited to the nearest positioned ancestor (previews, embeds). */
  contained?: boolean
  className?: string
  style?: CSSProperties
}

const STEP_CONTENT: OnboardingStep[] = [
  { title: 'Welcome to Lumen', description: 'Discover a powerful collection of components designed to enhance your development workflow.' },
  { title: 'Customizable Components', description: 'Each component is fully customizable and built with modern web standards in mind.' },
  { title: 'Ready to Start?', description: 'Begin building amazing interfaces with our comprehensive component library.' },
  { title: 'Get Support', description: 'Access our documentation and community resources to make the most of Lumen.' },
]

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'

function isLight(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return false
  const n = parseInt(m[1]!, 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return (l + 0.05) / 0.05 > 1.05 / (l + 0.05)
}

/** Generated artwork for each step (stands in for the upstream PNG). */
function StepArt({ index, artStyle, accent }: { index: number; artStyle: string; accent: string }) {
  const id = useId().replace(/:/g, '')
  const shapes = [
    // 0: welcome — a rising sun
    <g key="0">
      <circle cx="191" cy="128" r="54" fill="#fff" fillOpacity="0.9" />
      <circle cx="191" cy="128" r="80" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="191" cy="128" r="108" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5" />
    </g>,
    // 1: customizable — stacked cards
    <g key="1">
      <rect x="112" y="70" width="140" height="88" rx="12" fill="#fff" fillOpacity="0.25" transform="rotate(-8 182 114)" />
      <rect x="128" y="62" width="140" height="88" rx="12" fill="#fff" fillOpacity="0.9" />
      <rect x="144" y="80" width="60" height="8" rx="4" fill={accent} fillOpacity="0.8" />
      <rect x="144" y="96" width="96" height="6" rx="3" fill={accent} fillOpacity="0.35" />
      <rect x="144" y="108" width="80" height="6" rx="3" fill={accent} fillOpacity="0.35" />
      <circle cx="244" cy="132" r="8" fill={accent} />
    </g>,
    // 2: ready — a launch arrow
    <g key="2">
      <path d="M121 150 L191 70 L261 150" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      <path d="M141 176 L191 120 L241 176" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.35" />
    </g>,
    // 3: support — speech bubbles
    <g key="3">
      <rect x="110" y="62" width="120" height="64" rx="18" fill="#fff" fillOpacity="0.9" />
      <path d="M134 122 l-6 22 l24 -18 z" fill="#fff" fillOpacity="0.9" />
      <rect x="168" y="104" width="104" height="54" rx="16" fill="#fff" fillOpacity="0.3" />
      <circle cx="146" cy="94" r="6" fill={accent} />
      <circle cx="170" cy="94" r="6" fill={accent} fillOpacity="0.7" />
      <circle cx="194" cy="94" r="6" fill={accent} fillOpacity="0.45" />
    </g>,
  ]
  const shape = shapes[index % shapes.length]
  return (
    <svg viewBox="0 0 382 216" className="block h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-bg`} x1={index % 2 ? 1 : 0} y1="0" x2={index % 2 ? 0 : 1} y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx={0.2 + (index % 3) * 0.3} cy="0.15" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-grid`} width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0H0V22" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="382" height="216" fill={accent} />
      <rect width="382" height="216" fill={`url(#${id}-bg)`} />
      {artStyle === 'grid' ? <rect width="382" height="216" fill={`url(#${id}-grid)`} /> : <rect width="382" height="216" fill={`url(#${id}-glow)`} />}
      {artStyle === 'grid' ? null : (
        <>
          <circle cx={40 + index * 90} cy="200" r="90" fill="#fff" fillOpacity="0.08" />
          <circle cx={340 - index * 40} cy="20" r="60" fill="#000" fillOpacity="0.12" />
        </>
      )}
      {shape}
    </svg>
  )
}

/** Onboarding dialog (Origin UI comp-332): artwork on top, title + text per step, dots, Skip and Next / Okay. */
export function DialogOnboardingCarousel({
  open,
  defaultOpen = false,
  onOpenChange,
  step: stepProp,
  onStepChange,
  onComplete,
  stepContent: contentProp,
  contained = false,
  className,
  style,
  ...props
}: DialogOnboardingCarouselProps) {
  const { steps, artStyle, transition, indicator, showSkip, radius, accent, finishLabel } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const uid = useId()
  const popupRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const [innerStep, setInnerStep] = useState(1)
  const [dir, setDir] = useState(1)
  const isOpen = open ?? innerOpen
  const stepContent = (contentProp ?? STEP_CONTENT).slice(0, Math.max(1, steps))
  const totalSteps = stepContent.length
  const step = Math.min(Math.max(1, stepProp ?? innerStep), totalSteps)
  const ink = isLight(accent) ? '#0a0a0a' : '#ffffff'

  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next)
    onOpenChange?.(next)
    if (next) setStep(1)
  }
  const setStep = (next: number) => {
    setDir(next >= step ? 1 : -1)
    if (stepProp === undefined) setInnerStep(next)
    onStepChange?.(next)
  }

  const handleContinue = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  // Keep the slide direction in sync with controlled steps.
  const prevStep = useRef(step)
  useEffect(() => {
    if (prevStep.current !== step) setDir(step > prevStep.current ? 1 : -1)
    prevStep.current = step
  }, [step])

  useEffect(() => {
    if (!isOpen) return
    returnFocus.current = document.activeElement as HTMLElement | null
    nextRef.current?.focus({ preventScroll: true })
    return () => returnFocus.current?.focus?.({ preventScroll: true })
  }, [isOpen])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setOpen(false)
      return
    }
    if (event.key === 'ArrowRight' && step < totalSteps) setStep(step + 1)
    if (event.key === 'ArrowLeft' && step > 1) setStep(step - 1)
    if (event.key !== 'Tab') return
    const nodes = Array.from(popupRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    if (nodes.length === 0) return
    const first = nodes[0]!
    const last = nodes[nodes.length - 1]!
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const slide = transition === 'slide' && !reduced
  const offset = slide ? 24 : 0
  const variants = {
    enter: (d: number) => ({ opacity: 0, x: offset * d }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: -offset * d }),
  }
  const stepTransition = reduced ? { duration: 0.12 } : { type: 'spring' as const, visualDuration: 0.35, bounce: 0.1 }
  const current = stepContent[step - 1]!
  const layer = contained ? 'absolute' : 'fixed'
  const inner = Math.max(radius - 8, 4)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={cn(layer, 'inset-0 isolate z-50 grid place-items-center p-4', className)} style={{ '--accent-c': accent, ...style } as CSSProperties}>
          <motion.div
            data-slot="dialog-overlay"
            aria-hidden
            className="absolute inset-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={popupRef}
            data-slot="dialog-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-title`}
            aria-describedby={`${uid}-desc`}
            onKeyDown={onKeyDown}
            className="relative grid max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] gap-0 overflow-y-auto border bg-background p-0 shadow-lg outline-none sm:max-w-100"
            style={{ borderRadius: radius }}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              <div className="relative aspect-[382/216] w-full overflow-hidden" style={{ borderRadius: inner }}>
                <AnimatePresence initial={false} custom={dir}>
                  <motion.div
                    key={step}
                    className="absolute inset-0"
                    custom={dir}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0.12 : 0.4 }}
                  >
                    <StepArt index={step - 1} artStyle={artStyle} accent={accent} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="space-y-6 px-6 pt-3 pb-6">
              <div className="relative grid overflow-hidden" data-slot="dialog-header" aria-live="polite">
                <AnimatePresence initial={false} custom={dir} mode="popLayout">
                  <motion.div
                    key={step}
                    className="col-start-1 row-start-1 flex flex-col gap-1 text-center sm:text-left"
                    custom={dir}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={stepTransition}
                  >
                    <h2 id={`${uid}-title`} className="text-lg leading-none font-semibold">
                      {current.title}
                    </h2>
                    <p id={`${uid}-desc`} className="text-sm text-muted-foreground">
                      {current.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex justify-center space-x-1.5 max-sm:order-1" role="tablist" aria-label="Steps">
                  {stepContent.map((item, index) => {
                    const active = index + 1 === step
                    return (
                      <button
                        key={item.title}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-label={`Step ${index + 1} of ${totalSteps}`}
                        tabIndex={active ? 0 : -1}
                        onClick={() => setStep(index + 1)}
                        className={cn(
                          'h-1.5 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                          indicator === 'pill' ? 'transition-[width,opacity] duration-300 motion-reduce:transition-none' : 'size-1.5 transition-opacity duration-200',
                          indicator === 'pill' && (active ? 'w-5' : 'w-1.5'),
                          active ? '' : 'opacity-20',
                        )}
                        style={{ backgroundColor: accent }}
                      />
                    )
                  })}
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end" data-slot="dialog-footer">
                  {showSkip && (
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-[color,background-color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    ref={nextRef}
                    type="button"
                    onClick={() => {
                      if (step < totalSteps) handleContinue()
                      else {
                        onComplete?.()
                        setOpen(false)
                      }
                    }}
                    className="group inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap shadow-sm transition-[color,box-shadow,filter] outline-none hover:brightness-110 focus-visible:ring-[3px] focus-visible:ring-(--accent-c)/40"
                    style={{ backgroundColor: accent, color: ink }}
                  >
                    {step < totalSteps ? (
                      <>
                        Next
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    ) : (
                      finishLabel
                    )}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="group absolute top-3 right-3 flex size-7 items-center justify-center rounded text-white transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60 transition-opacity group-hover:opacity-100">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
