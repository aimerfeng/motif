// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/packages/smoothui/components/ai-approval/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  question: 'How many flavours should we launch?',
  options: 'Three flavours | core line; Five flavours | full case; Just one hero',
  accent: '#fafafa',
  destructiveTone: '#f0524f',
  spring: {
    visualDuration: 0.25,
    bounce: 0.1,
  },
}
/* @motif:end */

const EASE_OUT = [0.23, 1, 0.32, 1] as const
const CHOICE_STAGGER = 0.03

export type AIApprovalOption = {
  /** Marks the option as the destructive one, e.g. "Delete everything". */
  destructive?: boolean
  /** Secondary line under the label. */
  detail?: string
  id: string
  label: string
}

export type AiApprovalCardProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Extra context under the question. */
  children?: ReactNode
  /** Called once, with the chosen option. */
  onDecide?: (option: AIApprovalOption) => void
  /** Structured options; overrides the `options` text param when given. */
  items?: AIApprovalOption[]
  /** Render already-resolved, e.g. when replaying a transcript. */
  resolvedId?: string
  /** Controlled chosen id (null = still undecided). */
  value?: string | null
}

/** Parses "Label | detail; !Destructive label | detail" into options. */
export function parseOptions(text: string): AIApprovalOption[] {
  return text
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((part, index) => {
      const destructive = part.startsWith('!')
      const [label = '', detail] = part.replace(/^!\s*/, '').split('|').map((s) => s.trim())
      return { id: `option-${index}`, label, detail: detail || undefined, destructive }
    })
}

function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0a0a0a'
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#0a0a0a' : '#fafafa'
}

/**
 * The card an agent puts up before it acts.
 *
 * Choosing does not tick a radio button — the chosen option expands to fill the
 * card and the alternatives collapse out of existence.
 */
export function AiApprovalCard({ className, style, children, onDecide, items, resolvedId, value, ...props }: AiApprovalCardProps) {
  const { question, options: optionsText, accent, destructiveTone, spring } = { ...defaults, ...props }
  const shouldReduceMotion = useReducedMotion()
  const [innerId, setInnerId] = useState<string | null>(resolvedId ?? null)
  const chosenId = value !== undefined ? value : innerId
  const options = items ?? parseOptions(optionsText)

  const chosen = options.find((option) => option.id === chosenId) ?? null
  const SPRING_DEFAULT = { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const toneText = `color-mix(in oklab, ${destructiveTone} 70%, var(--foreground))`

  const decide = (option: AIApprovalOption) => {
    if (chosenId) return
    if (value === undefined) setInnerId(option.id)
    onDecide?.(option)
  }

  return (
    <motion.div
      className={cn('w-full rounded-xl border border-border bg-background p-3.5', className)}
      style={{ ...style, '--tone': destructiveTone } as CSSProperties}
      layout={!shouldReduceMotion}
      transition={shouldReduceMotion ? { duration: 0 } : SPRING_DEFAULT}
      role="group"
      aria-label={question}
    >
      <motion.div layout={!shouldReduceMotion}>
        <p className="text-sm font-medium text-foreground">{question}</p>
        {children ? <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{children}</div> : null}
      </motion.div>

      <div className="mt-3" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          {chosen ? (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-sm"
              style={
                chosen.destructive
                  ? { backgroundColor: 'color-mix(in oklab, var(--tone) 12%, transparent)', color: toneText }
                  : { backgroundColor: accent, color: inkFor(accent) }
              }
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
              key="resolved"
              transition={shouldReduceMotion ? { duration: 0 } : SPRING_DEFAULT}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                <svg aria-hidden="true" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span className="truncate font-medium">{chosen.label}</span>
              {chosen.detail ? <span className="ml-auto shrink-0 text-xs opacity-70">{chosen.detail}</span> : null}
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col gap-1.5"
              exit={shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.98 }}
              key="options"
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.16, ease: EASE_OUT }}
            >
              {options.map((option, index) => (
                <motion.button
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    option.destructive
                      ? 'border-[color-mix(in_oklab,var(--tone)_30%,transparent)] hover:bg-[color-mix(in_oklab,var(--tone)_10%,transparent)]'
                      : 'border-border text-foreground hover:bg-muted',
                  )}
                  style={option.destructive ? { color: toneText } : undefined}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                  key={option.id}
                  onClick={() => decide(option)}
                  transition={shouldReduceMotion ? { duration: 0 } : { ...SPRING_DEFAULT, delay: index * CHOICE_STAGGER }}
                  type="button"
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                >
                  <span className="truncate font-medium">{option.label}</span>
                  {option.detail ? <span className="ml-auto shrink-0 text-xs text-muted-foreground">{option.detail}</span> : null}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
