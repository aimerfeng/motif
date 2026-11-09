// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/pricing-sections/pricing-section-03.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  planName: 'Professional Plan Subscription',
  price: 29,
  monthlyPrice: 39,
  billing: 'annually',
  features: 5,
  showSalesLinks: true,
  accent: '#3b82f6',
  radius: 8,
  tone: 'dark',
}
/* @motif:end */

export type PricingSinglePlanProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** Controlled billing choice ('annually' | 'monthly'). */
  value?: string
  onValueChange?: (value: string) => void
}

const FEATURES = [
  { id: 1, name: 'Invite unlimited members' },
  { id: 2, name: 'Create unlimited workspaces' },
  { id: 3, name: '90 days of history' },
  { id: 4, name: '24/7 priority support' },
  { id: 5, name: 'Access to all enterprise plugins' },
]

function onColor(hex: string) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.6 ? '#030712' : '#ffffff'
}

function palette(tone: string, accent: string, radius: number): CSSProperties {
  const dark = tone !== 'light'
  return {
    '--t-bg': dark ? '#030712' : '#ffffff',
    '--t-card': dark ? '#111827' : '#f9fafb',
    '--t-item': dark ? '#030712' : '#ffffff',
    '--t-fg': dark ? '#f9fafb' : '#111827',
    '--t-body': dark ? '#d1d5db' : '#374151',
    '--t-mu': dark ? '#9ca3af' : '#6b7280',
    '--t-ln': dark ? '#1f2937' : '#e5e7eb',
    '--t-ln2': dark ? '#374151' : '#d1d5db',
    '--t-ac': accent,
    '--t-on': onColor(accent),
    '--t-r': `${radius}px`,
    '--t-r2': `${Math.max(0, radius - 2)}px`,
    fontFamily: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  } as CSSProperties
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Zm-.997-6 7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16Z" />
    </svg>
  )
}

function SalesLink({ title, text }: { title: string; text: string }) {
  return (
    <div className="relative border-l-2 border-[var(--t-ln)] pl-4">
      <h4 className="text-sm font-medium text-[var(--t-fg)]">
        <a href="#" onClick={(e) => e.preventDefault()} className="rounded-sm focus:outline-none focus-visible:underline">
          {/* Extend link to entire card */}
          <span className="absolute inset-0" aria-hidden={true} />
          {title} &#8594;
        </a>
      </h4>
      <p className="mt-1 text-sm text-[var(--t-mu)]">{text}</p>
    </div>
  )
}

export function PricingSinglePlan({ className, style, value, onValueChange, ...props }: PricingSinglePlanProps) {
  const o = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [inner, setInner] = useState(o.billing)
  const selected = value ?? inner
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const monthly = Math.max(o.monthlyPrice, o.price)
  const save = Math.round((1 - o.price / monthly) * 100)
  const plans = [
    { value: 'annually', name: 'Billed annually', price: `$${o.price}`, isRecommended: save > 0 },
    { value: 'monthly', name: 'Billed monthly', price: `$${monthly}`, isRecommended: false },
  ]
  const features = FEATURES.slice(0, Math.max(1, Math.min(FEATURES.length, Math.round(o.features))))

  const choose = (v: string) => {
    if (value === undefined) setInner(v)
    onValueChange?.(v)
  }
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (i + dir + plans.length) % plans.length
    choose(plans[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div className={cn('bg-[var(--t-bg)] px-4 py-12 sm:px-6', className)} style={{ ...palette(o.tone, o.accent, o.radius), ...style }}>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 lg:max-w-5xl lg:grid-cols-2">
        <div className="p-2 sm:p-6">
          <h3 className="font-semibold text-[var(--t-fg)]">Unlock all features</h3>
          <p className="mt-2 text-sm/6 text-[var(--t-mu)]">
            Get the full potential of your data with our enhanced features that enable advanced data analytics and informed decision-making.
          </p>
          {o.showSalesLinks && (
            <div className="mt-8 space-y-6">
              <SalesLink title="Talk to Sales" text="Schedule a call with one of our sales representative" />
              <SalesLink title="Book a demo" text="Try out our premium features in a demo" />
            </div>
          )}
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <fieldset className="min-w-0">
            <div className="rounded-[var(--t-r)] border border-[var(--t-ln)] bg-[var(--t-card)] p-4 sm:p-6">
              <legend className="font-semibold text-[var(--t-fg)]">{o.planName}</legend>
              <div role="radiogroup" aria-label="Billing cycle" className="mt-4 grid gap-3">
                {plans.map((plan, i) => {
                  const checked = selected === plan.value
                  return (
                    <button
                      key={plan.value}
                      ref={(el) => {
                        refs.current[i] = el
                      }}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      tabIndex={checked ? 0 : -1}
                      onClick={() => choose(plan.value)}
                      onKeyDown={(e) => onKey(e, i)}
                      className={cn(
                        'group relative flex w-full items-center justify-between gap-4 rounded-[var(--t-r2)] border bg-[var(--t-item)] p-4 text-left shadow-sm transition-[border-color,box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--t-ac)]/30 sm:px-6',
                        checked ? 'border-[var(--t-ac)]' : 'border-[var(--t-ln2)]',
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn(
                            'relative flex size-4 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors duration-150',
                            checked ? 'bg-[var(--t-ac)]' : 'border border-[var(--t-ln2)] bg-[var(--t-item)]',
                          )}
                        >
                          <AnimatePresence initial={false}>
                            {checked && (
                              <motion.div
                                key="dot"
                                className="size-1.5 shrink-0 rounded-full bg-[var(--t-on)]"
                                initial={reduced ? false : { scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={reduced ? { opacity: 0 } : { scale: 0 }}
                                transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.3 }}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="block items-center space-y-1 lg:flex lg:space-y-0 lg:space-x-3">
                          <span className="block text-sm font-semibold text-[var(--t-fg)]">{plan.name}</span>
                          {plan.isRecommended && (
                            <span className="inline-flex items-center rounded-md bg-[var(--t-ac)]/10 px-2 py-1 text-xs font-semibold text-[var(--t-fg)] ring-1 ring-[var(--t-ac)]/40 ring-inset">
                              Save {save}%
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="flex items-baseline">
                        <span className="font-semibold text-[var(--t-fg)] tabular-nums sm:text-lg">{plan.price}</span>
                        <span className="text-sm text-[var(--t-mu)]">/mo</span>
                      </p>
                    </button>
                  )
                })}
              </div>
              <ul role="list" className="mt-4 text-sm text-[var(--t-body)]">
                {features.map((item) => (
                  <li key={item.id} className="flex items-center space-x-2 py-2.5">
                    <CheckCircle className="size-5 shrink-0 text-[var(--t-ac)]" />
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
              <div className="my-6 h-px w-full bg-[var(--t-ln)]" role="separator" />
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-[var(--t-r2)] bg-[var(--t-ac)] px-3 text-sm font-semibold text-[var(--t-on)] shadow-sm transition-[filter] duration-100 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--t-ac)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--t-card)]"
              >
                Buy and upgrade
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  )
}
