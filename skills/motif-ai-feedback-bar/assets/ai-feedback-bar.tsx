// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Julien Thibeaut
// Source: https://github.com/ibelick/prompt-kit/blob/5a94966/components/prompt-kit/feedback-bar.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  title: 'Was this response helpful?',
  reasons: 'Inaccurate, Not what I asked, Too long, Outdated',
  accent: '#a78bfa',
  radius: 12,
  allowComment: true,
  dismissible: true,
  celebrate: true,
}
/* @motif:end */

export type FeedbackStep = 'idle' | 'helpful' | 'reasons' | 'done' | 'closed'

export type AiFeedbackBarProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  icon?: ReactNode
  /** Controlled step (used by the demo autoplay); leave undefined to let the bar manage itself. */
  step?: FeedbackStep
  /** Controlled selected reasons (demo). */
  selectedReasons?: string[]
  /** Controlled comment text (demo). */
  comment?: string
  onHelpful?: () => void
  onNotHelpful?: () => void
  onSubmit?: (feedback: { reasons: string[]; comment: string }) => void
  onClose?: () => void
}

function inkFor(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.4 ? '#0a0a0a' : '#ffffff'
}

function ThumbsUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}

function ThumbsDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-(--fb-accent)'
const iconButton = cn('text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors', focusRing)

/** "Was this helpful?" bar: thumbs up thanks the reader; thumbs down unfolds reason chips and an optional comment. */
export function AiFeedbackBar({ className, style, icon, step: stepProp, selectedReasons, comment: commentProp, onHelpful, onNotHelpful, onSubmit, onClose, ...props }: AiFeedbackBarProps) {
  const { title, accent, reasons, allowComment, dismissible, radius, celebrate } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const id = useId()
  const [innerStep, setInnerStep] = useState<FeedbackStep>('idle')
  const [innerPicked, setInnerPicked] = useState<string[]>([])
  const [innerComment, setInnerComment] = useState('')
  const step = stepProp ?? innerStep
  const picked = selectedReasons ?? innerPicked
  const comment = commentProp ?? innerComment
  const reasonList = reasons
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean)
    .slice(0, 6)
  const ink = inkFor(accent)

  const go = (next: FeedbackStep) => {
    if (stepProp === undefined) setInnerStep(next)
  }
  const toggleReason = (r: string) => setInnerPicked(picked.includes(r) ? picked.filter((x) => x !== r) : [...picked, r])

  const fade = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 } }

  if (step === 'closed') return null
  const thanked = step === 'helpful' || step === 'done'

  return (
    <div
      className={cn('bg-background border-border inline-flex flex-col overflow-hidden border text-sm', className)}
      style={{ '--fb-accent': accent, borderRadius: radius, ...style } as CSSProperties}
      role="group"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center justify-start gap-4 py-3 pl-4" aria-live="polite">
          {icon}
          <AnimatePresence mode="wait" initial={false}>
            {thanked ? (
              <motion.span key="thanks" id={`${id}-title`} className="text-foreground flex items-center gap-2 font-medium" {...fade} transition={{ duration: 0.18 }}>
                <span className="grid size-5 shrink-0 place-items-center rounded-full" style={{ backgroundColor: accent, color: ink }}>
                  <Check className="size-3" />
                </span>
                Thanks for your feedback
              </motion.span>
            ) : (
              <motion.span key={step} id={`${id}-title`} className="text-foreground font-medium" {...fade} transition={{ duration: 0.18 }}>
                {step === 'reasons' ? 'What went wrong?' : title}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {step === 'idle' && (
          <div className="flex items-center justify-center gap-0.5 px-3 py-0">
            <button
              type="button"
              className={iconButton}
              aria-label="Helpful"
              onClick={() => {
                go('helpful')
                onHelpful?.()
              }}
            >
              <ThumbsUp className="size-4" />
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label="Not helpful"
              onClick={() => {
                go('reasons')
                onNotHelpful?.()
              }}
            >
              <ThumbsDown className="size-4" />
            </button>
          </div>
        )}
        {step === 'helpful' && celebrate && (
          <motion.span
            aria-hidden
            className="mr-3 grid size-8 place-items-center rounded-md"
            style={{ color: accent }}
            initial={reduced ? { opacity: 0 } : { scale: 0.4, rotate: -20 }}
            animate={reduced ? { opacity: 1 } : { scale: [0.4, 1.3, 1], rotate: [-20, 8, 0] }}
            transition={{ duration: 0.45 }}
          >
            <ThumbsUp className="size-4" />
          </motion.span>
        )}
        {dismissible && (
          <div className="border-border flex items-center justify-center self-stretch border-l">
            <button
              type="button"
              onClick={() => {
                go('closed')
                onClose?.()
              }}
              className={cn('text-muted-foreground hover:text-foreground flex items-center justify-center rounded-md p-3 transition-colors', focusRing)}
              aria-label="Close"
            >
              <XIcon className="size-5" />
            </button>
          </div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {step === 'reasons' && (
          <motion.div
            key="reasons"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-border flex flex-col gap-3 border-t px-4 py-3">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Reasons">
                {reasonList.map((r) => {
                  const on = picked.includes(r)
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleReason(r)}
                      className={cn('rounded-full border px-2.5 py-1 text-xs transition-colors', focusRing, on ? 'border-transparent' : 'border-border text-muted-foreground hover:text-foreground')}
                      style={on ? { backgroundColor: accent, color: ink } : undefined}
                    >
                      {r}
                    </button>
                  )
                })}
              </div>
              {allowComment && (
                <textarea
                  aria-label="Comment (optional)"
                  placeholder="Anything else? (optional)"
                  rows={2}
                  value={comment}
                  onChange={(e) => setInnerComment(e.target.value)}
                  className={cn('border-border bg-background text-foreground placeholder:text-muted-foreground w-full resize-none rounded-md border px-2.5 py-2 text-xs', focusRing)}
                />
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    go('done')
                    onSubmit?.({ reasons: picked, comment })
                  }}
                  className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 focus-visible:ring-offset-2 focus-visible:ring-offset-background', focusRing)}
                  style={{ backgroundColor: accent, color: ink }}
                >
                  Send feedback
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
