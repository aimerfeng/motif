// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/example/pricing-card.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Select a Plan',
  plans: 3,
  popularIndex: 2,
  showSeats: true,
  yearlyDiscount: 20,
  currency: 'USD',
  accent: '#7c6cff',
  radius: 16,
}
/* @motif:end */

export type BillingCycle = 'monthly' | 'yearly'

export type PricingPlanPickerProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Optional controlled state. */
  billingCycle?: BillingCycle
  onBillingCycleChange?: (cycle: BillingCycle) => void
  selectedPlan?: string
  onSelectedPlanChange?: (id: string) => void
  userCount?: number
  onUserCountChange?: (count: number) => void
}

// Change Here
export const PLANS = [
  { id: 'plus', name: 'Plus', description: 'solo', monthlyPrice: 8.99, features: ['1TB of Space', '30 days of file recovery', '256-bit AES and SSL/TLS'] },
  { id: 'standard', name: 'Standard', description: 'startup', monthlyPrice: 12.99, features: ['1TB of Space', '30 days of file recovery', '256-bit AES and SSL/TLS'] },
  { id: 'advanced', name: 'Advanced', description: 'teams', monthlyPrice: 24.99, features: ['1TB of Space', '30 days of file recovery', '256-bit AES and SSL/TLS'] },
]

const TRANSITION = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.8 }

/** 8.99 at 20% off -> 6.99: apply the discount, round to the dollar, end in .99. */
function yearlyFrom(monthly: number, discount: number) {
  return Math.max(0.99, Math.round(monthly * (1 - discount / 100)) - 0.01)
}

function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#ffffff'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#0b0b0f' : '#ffffff'
}

/** Hand-rolled stand-in for NumberFlow: every digit is a 0-9 column that rolls into place. */
function RollingNumber({ value, format, reduced }: { value: number; format: Intl.NumberFormatOptions; reduced: boolean }) {
  const text = new Intl.NumberFormat('en-US', format).format(value)
  const chars = text.split('')
  return (
    <span className="inline-flex tabular-nums" role="img" aria-label={text}>
      {chars.map((ch, i) => {
        const key = chars.length - i
        if (!/\d/.test(ch)) {
          return (
            <span key={`s${key}`} aria-hidden>
              {ch}
            </span>
          )
        }
        const d = Number(ch)
        return (
          <span key={`d${key}`} aria-hidden className="relative inline-block h-[1.2em] overflow-hidden leading-[1.2em]">
            <span className="invisible">0</span>
            <motion.span
              className="absolute inset-x-0 top-0 flex flex-col"
              initial={false}
              animate={{ y: `${-d * 1.2}em` }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28, mass: 0.7 }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} className="block h-[1.2em] text-center">
                  {n}
                </span>
              ))}
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}

function Tick() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ color: 'var(--acc)' }} className="shrink-0">
      <path d="M5 14.5s1.5 0 3.5 3.5c0 0 5.56-9.17 10.5-11" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden className="text-muted-foreground">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5.5 19c.9-3 3.4-4.5 6.5-4.5s5.6 1.5 6.5 4.5" />
    </svg>
  )
}

function Glyph({ plus }: { plus?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={plus ? 16 : 14} height={plus ? 16 : 14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <path d="M5 12h14" />
      {plus && <path d="M12 5v14" />}
    </svg>
  )
}

const stepBtn =
  'rounded-lg p-1.5 text-muted-foreground/60 outline-none transition-[background-color,color,box-shadow,transform] hover:bg-background hover:text-foreground hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring active:scale-95'

export function PricingPlanPicker({
  className,
  style,
  billingCycle: cycleProp,
  onBillingCycleChange,
  selectedPlan: selectedProp,
  onSelectedPlanChange,
  userCount: countProp,
  onUserCountChange,
  ...props
}: PricingPlanPickerProps) {
  const { plans, yearlyDiscount, accent, radius, currency, showSeats, popularIndex, heading } = { ...defaults, ...props }
  const reduced = Boolean(useReducedMotion())
  const [cycleState, setCycleState] = useState<BillingCycle>('monthly')
  const [selectedState, setSelectedState] = useState('standard')
  const [countState, setCountState] = useState(3)
  const billingCycle = cycleProp ?? cycleState
  const selectedPlan = selectedProp ?? selectedState
  const userCount = countProp ?? countState
  const setBillingCycle = (c: BillingCycle) => {
    setCycleState(c)
    onBillingCycleChange?.(c)
  }
  const setSelectedPlan = (id: string) => {
    setSelectedState(id)
    onSelectedPlanChange?.(id)
  }
  const setUserCount = (n: number) => {
    setCountState(n)
    onUserCountChange?.(n)
  }

  const list = PLANS.slice(0, Math.max(2, Math.min(3, Math.round(plans))))
  const ink = inkFor(accent)
  const r = Math.max(4, Math.min(28, radius))
  const inner = Math.round(r * 0.75)
  const tab = Math.max(4, Math.round(r * 0.5))
  const spring = reduced ? { duration: 0 } : TRANSITION
  const fmt: Intl.NumberFormatOptions = { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }

  const onRowKey = (e: KeyboardEvent<HTMLDivElement>, i: number) => {
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) {
      e.preventDefault()
      const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1
      const j = (i + dir + list.length) % list.length
      setSelectedPlan(list[j].id)
      const group = e.currentTarget.closest('[role="radiogroup"]')
      group?.querySelectorAll<HTMLElement>('[role="radio"]')[j]?.focus()
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      setSelectedPlan(list[i].id)
    }
  }

  return (
    <div
      className={cn('not-prose flex w-full max-w-[450px] flex-col gap-6 border border-border bg-background p-5 px-4 shadow-sm transition-colors duration-300 sm:p-6', className)}
      style={{ ['--acc' as string]: accent, borderRadius: r, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style }}
    >
      <div className="mb-2 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{heading}</h2>

        <div className="flex h-10 w-full bg-muted p-1 ring-1 ring-border" style={{ borderRadius: inner }} role="group" aria-label="Billing cycle">
          {(['monthly', 'yearly'] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={billingCycle === c}
              onClick={() => setBillingCycle(c)}
              className={cn(
                'relative flex h-full flex-1 items-center justify-center gap-2 text-base font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring',
                billingCycle === c ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              style={{ borderRadius: tab }}
            >
              {billingCycle === c && <motion.div layoutId="plan-picker-tab-bg" className="absolute inset-0 bg-background shadow-sm ring-1 ring-border" style={{ borderRadius: tab }} transition={spring} />}
              <span className="relative z-10">{c === 'monthly' ? 'Monthly' : 'Yearly'}</span>
              {c === 'yearly' && (
                <span className="relative z-10 rounded-full px-1.5 py-0.5 text-xs font-light tracking-tight whitespace-nowrap uppercase" style={{ background: 'var(--acc)', color: ink }}>
                  {Math.round(yearlyDiscount)}% OFF
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3" role="radiogroup" aria-label="Plan">
        {list.map((plan, i) => {
          const isSelected = selectedPlan === plan.id
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : yearlyFrom(plan.monthlyPrice, yearlyDiscount)
          const popular = popularIndex === i + 1

          return (
            <div key={plan.id} className="relative cursor-pointer" onClick={() => setSelectedPlan(plan.id)}>
              <div
                className={cn('relative border bg-card transition-[border-color,box-shadow] duration-300', isSelected ? 'z-10' : 'border-foreground/10')}
                style={{ borderRadius: inner, ...(isSelected ? { borderColor: 'var(--acc)', boxShadow: '0 0 0 1px var(--acc)' } : null) }}
              >
                {popular && (
                  <span className="absolute -top-2.5 right-5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase" style={{ background: 'var(--acc)', color: ink }}>
                    Popular
                  </span>
                )}
                <div className="p-5 max-[380px]:p-4">
                  <div
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onKeyDown={(e) => onRowKey(e, i)}
                    className="flex items-start justify-between gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-card"
                  >
                    <div className="flex gap-4 max-[380px]:gap-3">
                      <div className="mt-1 shrink-0">
                        <div
                          className={cn('flex h-6 w-6 items-center justify-center rounded-full border-2 transition-[border-color] duration-300', !isSelected && 'border-muted-foreground/15')}
                          style={isSelected ? { borderColor: 'var(--acc)' } : undefined}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="h-4 w-4 rounded-full"
                                style={{ background: 'var(--acc)' }}
                                transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25, duration: 0.2 }}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg leading-tight font-medium text-foreground">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground lowercase">{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-medium text-foreground">
                        <RollingNumber value={price} format={fmt} reduced={reduced} />
                      </div>
                      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">{billingCycle === 'monthly' ? 'Month' : 'Year'}</div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={reduced ? { duration: 0 } : { duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                        className="w-full overflow-hidden"
                      >
                        <div className="flex flex-col gap-6 pt-6">
                          <div className="flex flex-col gap-3.5">
                            {plan.features.map((feature, idx) => (
                              <motion.div
                                initial={reduced ? false : { opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.3 }}
                                key={idx}
                                className="flex items-center gap-3 text-sm text-foreground/80"
                              >
                                <Tick />
                                {feature}
                              </motion.div>
                            ))}
                          </div>

                          {showSeats && (
                            <>
                              <div className="h-px bg-muted" />

                              <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted max-[380px]:hidden">
                                    <UserIcon />
                                  </div>
                                  <div className="flex min-w-0 flex-col">
                                    <span className="text-base leading-none font-medium text-foreground">Users</span>
                                    <span className="mt-0.5 text-sm text-muted-foreground">Starting at {userCount} users</span>
                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-4 border border-border bg-muted p-1.5" style={{ borderRadius: inner }} onClick={(e) => e.stopPropagation()}>
                                  <button type="button" aria-label="Remove a user" onClick={() => setUserCount(Math.max(1, userCount - 1))} className={stepBtn}>
                                    <Glyph />
                                  </button>
                                  <span className="min-w-4 text-center text-sm text-foreground/80 tabular-nums" aria-live="polite">
                                    <RollingNumber value={userCount} format={{}} reduced={reduced} />
                                  </span>
                                  <button type="button" aria-label="Add a user" onClick={() => setUserCount(Math.min(99, userCount + 1))} className={stepBtn}>
                                    <Glyph plus />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
