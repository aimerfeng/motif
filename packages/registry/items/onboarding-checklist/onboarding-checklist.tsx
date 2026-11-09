// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/accordion/c-accordion-11.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  title: 'Set up your store',
  accent: '#eab308',
  progressStyle: 'bar',
  radius: 10,
  showBadges: true,
  spring: {
    visualDuration: 0.35,
    bounce: 0.1,
  },
  autoAdvance: true,
}
/* @motif:end */

export type OnboardingChecklistProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Controlled number of finished steps. Leave undefined to let the card track it. */
  completed?: number
  onCompletedChange?: (completed: number) => void
}

type Status = 'done' | 'active' | 'pending'

function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0a0a0a'
  const n = parseInt(m[1]!, 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  const l = 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!
  return l > 0.22 ? '#0a0a0a' : '#ffffff'
}

function CircleCheck() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#22c55e" />
      <path d="m8 12.5 2.5 2.5L16 9.5" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 animate-spin opacity-60 motion-reduce:animate-none" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')} aria-hidden="true">
      <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Decorative, invented QR-like pattern (not a scannable code).
function QrCode() {
  const size = 21
  const cells: ReactNode[] = []
  const finder = (x: number, y: number) => {
    for (const [fx, fy] of [[0, 0], [14, 0], [0, 14]] as const) {
      const dx = x - fx
      const dy = y - fy
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        const edge = dx === 0 || dx === 6 || dy === 0 || dy === 6
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
        return edge || core ? 1 : 0
      }
    }
    return -1
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const f = finder(x, y)
      const on = f === -1 ? ((x * 7 + y * 13 + x * y * 3) % 5) < 2 : f === 1
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
    }
  }
  return (
    <svg viewBox="-1 -1 23 23" className="size-20 text-foreground" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
      {cells}
    </svg>
  )
}

function Badge({ children, tone }: { children: ReactNode; tone: 'success' | 'accent' }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[11px] font-medium whitespace-nowrap',
        tone === 'success' && 'bg-green-500/15 text-green-600 dark:text-green-400',
        tone === 'accent' && 'bg-[color-mix(in_oklab,var(--ob-accent)_18%,transparent)] text-foreground',
      )}
    >
      {children}
    </span>
  )
}

function ActionButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 shrink-0 items-center justify-center rounded-[calc(var(--ob-radius)*0.8)] bg-[var(--ob-accent)] px-3 text-sm font-medium text-[var(--ob-ink)] transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--ob-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
    </button>
  )
}

function Progress({ kind, done, total }: { kind: string; done: number; total: number }) {
  const reduce = useReducedMotion()
  const pct = total ? done / total : 0
  const t = reduce ? { duration: 0 } : { type: 'spring' as const, visualDuration: 0.5, bounce: 0 }
  if (kind === 'ring') {
    const r = 15
    const c = 2 * Math.PI * r
    return (
      <svg viewBox="0 0 36 36" className="size-10 shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="3.5" className="text-muted" />
        <motion.circle cx="18" cy="18" r={r} fill="none" stroke="var(--ob-accent)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={c} initial={false} animate={{ strokeDashoffset: c * (1 - pct) }} transition={t} />
      </svg>
    )
  }
  if (kind === 'segments') {
    return (
      <div className="flex w-full gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full origin-left bg-[var(--ob-accent)]" initial={false} animate={{ scaleX: i < done ? 1 : 0 }} transition={t} />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
      <motion.div className="h-full origin-left rounded-full bg-[var(--ob-accent)]" initial={false} animate={{ scaleX: pct }} transition={t} />
    </div>
  )
}

const Text = ({ children }: { children: ReactNode }) => <p className="text-muted-foreground text-sm leading-relaxed">{children}</p>

export function OnboardingChecklist({ className, style, completed: completedProp, onCompletedChange, ...props }: OnboardingChecklistProps) {
  const options = { ...defaults, ...props }
  const reduce = useReducedMotion()
  const uid = useId()
  const [innerCompleted, setInnerCompleted] = useState(1)
  const completed = completedProp ?? innerCompleted
  const [open, setOpen] = useState<number | null>(completed)
  const [email, setEmail] = useState('')
  const [seen, setSeen] = useState(completed)

  // Finishing a step (from inside or a controlled prop) opens the next one.
  if (seen !== completed) {
    setSeen(completed)
    if (options.autoAdvance) setOpen(completed)
  }

  const finish = (i: number) => {
    if (i !== completed) return
    const next = completed + 1
    if (completedProp === undefined) setInnerCompleted(next)
    onCompletedChange?.(next)
  }

  const steps: { id: string; label: string; badge: string; body: (s: Status) => ReactNode }[] = [
    {
      id: 'add-products',
      label: 'Add products',
      badge: 'Ready',
      body: (s) =>
        s === 'done' ? (
          <Text>Your products have been successfully added and are ready for sale.</Text>
        ) : (
          <div className="space-y-4">
            <Text>Import a CSV or add your first product by hand to start selling.</Text>
            <ActionButton onClick={() => finish(0)}>Add product</ActionButton>
          </div>
        ),
    },
    {
      id: 'pos-app',
      label: 'Get the point of sale application',
      badge: 'Installed',
      body: (s) =>
        s === 'done' ? (
          <Text>The app link was sent. Sign in on your phone to manage orders on the go.</Text>
        ) : (
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1 space-y-6">
              <Text>
                Scan the QR code or send yourself the link to get the app. The mobile app is where you&apos;ll manage orders, track inventory, and view analytics on the go.
              </Text>
              <form
                className="flex w-full min-w-0"
                onSubmit={(e) => {
                  e.preventDefault()
                  finish(1)
                }}
              >
                <label htmlFor={`${uid}-email`} className="sr-only">
                  Email
                </label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nora@fernhollow.shop"
                  className="h-9 min-w-0 flex-1 rounded-l-[calc(var(--ob-radius)*0.8)] border border-r-0 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-[var(--ob-accent)]"
                />
                <button
                  type="submit"
                  aria-label="Send link"
                  className="inline-flex h-9 shrink-0 items-center rounded-r-[calc(var(--ob-radius)*0.8)] border bg-background px-3 text-sm font-medium text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-[var(--ob-accent)]"
                >
                  Send link
                </button>
              </form>
            </div>
            <div className="bg-muted/30 border-border flex shrink-0 items-center justify-center self-start rounded-[var(--ob-radius)] border p-3">
              <QrCode />
            </div>
          </div>
        ),
    },
    {
      id: 'price-stock',
      label: 'Product price & stock',
      badge: 'Configured',
      body: (s) => (
        <div className="space-y-4">
          <Text>Configure your product pricing and manage stock levels across all locations.</Text>
          {s === 'active' && <ActionButton onClick={() => finish(2)}>Set prices</ActionButton>}
        </div>
      ),
    },
    {
      id: 'payouts',
      label: 'Connect payouts',
      badge: 'Connected',
      body: (s) => (
        <div className="space-y-4">
          <Text>Add a bank account so sales are paid out every two business days.</Text>
          {s === 'active' && <ActionButton onClick={() => finish(3)}>Connect account</ActionButton>}
        </div>
      ),
    },
  ]

  const total = steps.length
  const doneCount = Math.min(completed, total)
  const transition = reduce ? { duration: 0 } : { type: 'spring' as const, ...options.spring }

  return (
    <div
      className={cn('mx-auto mb-auto w-full max-w-lg', className)}
      style={{ '--ob-accent': options.accent, '--ob-ink': inkFor(options.accent), '--ob-radius': `${options.radius}px`, ...style } as CSSProperties}
    >
      <div className="border-border overflow-hidden rounded-[var(--ob-radius)] border bg-card text-card-foreground">
        <div className="flex items-center gap-4 border-b px-4 py-4">
          {options.progressStyle === 'ring' && <Progress kind="ring" done={doneCount} total={total} />}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="truncate text-base font-semibold text-foreground">{options.title}</h3>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums" role="status">
                {doneCount} of {total} done
              </span>
            </div>
            {options.progressStyle !== 'ring' && <Progress kind={options.progressStyle} done={doneCount} total={total} />}
          </div>
        </div>
        {steps.map((step, i) => {
          const status: Status = i < completed ? 'done' : i === completed ? 'active' : 'pending'
          const isOpen = open === i
          const panelId = `${uid}-${step.id}-panel`
          const triggerId = `${uid}-${step.id}-trigger`
          return (
            <div key={step.id} className="border-t bg-transparent px-4 first-of-type:border-t-0">
              <h4 className="m-0">
                <button
                  id={triggerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-2 rounded-sm py-4 text-left font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--ob-accent)]"
                >
                  <span className="flex w-full min-w-0 items-center justify-between gap-3 pr-2">
                    <span className="flex min-w-0 items-center gap-3">
                      {status === 'done' ? (
                        <span className="flex size-5 shrink-0 items-center justify-center">
                          <CircleCheck />
                        </span>
                      ) : status === 'active' ? (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--ob-accent)_22%,transparent)]">
                          <span className="size-2 rounded-full bg-[var(--ob-accent)]" />
                        </span>
                      ) : (
                        <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
                          <Spinner />
                        </span>
                      )}
                      <span className={cn('text-sm font-medium', status === 'pending' ? 'text-muted-foreground' : 'text-foreground')}>{step.label}</span>
                    </span>
                    {options.showBadges && status === 'done' && <Badge tone="success">{step.badge}</Badge>}
                    {options.showBadges && status === 'active' && <Badge tone="accent">Next up</Badge>}
                  </span>
                  <Chevron open={isOpen} />
                </button>
              </h4>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    key="panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={transition}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 pl-8">{step.body(status)}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
