// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Mikolaj Dobrucki
// Source: https://github.com/launch-ui/launch-ui/blob/b0d4d5b/components/sections/pricing/default.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@motif/runtime'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Pricing that scales with the work, not the seats',
  subline: 'Start free, upgrade when a project goes live. No per-seat fees on any plan.',
  currency: '$',
  billing: 'monthly',
  discount: 20,
  highlight: 'pro',
  accent: '#6d7dff',
  tone: 'dark',
  font: 'geist',
  radius: 22,
}
/* @motif:end */

export type PricingThreeTierProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const FONTS = {
  geist: { family: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.04em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.045em' },
  serif: { family: "'Instrument Serif', 'Times New Roman', 'Songti SC', serif", weight: 400, tracking: '-0.02em' },
} as const

const BODY = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"

function onColor(hex: string) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.56 ? '#0a0a0d' : '#ffffff'
}

function palette(tone: string, accent: string): CSSProperties {
  const dark = tone === 'dark'
  return {
    '--s-bg': dark ? '#08090c' : '#f7f6f2',
    '--s-sf': dark ? '#101218' : '#ffffff',
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.6)' : 'rgba(12,13,16,0.6)',
    '--s-ln': dark ? 'rgba(255,255,255,0.1)' : 'rgba(12,13,16,0.11)',
    '--s-cd': dark ? 'rgba(255,255,255,0.04)' : 'rgba(12,13,16,0.035)',
    '--s-ac': accent,
    '--s-on': onColor(accent),
  } as CSSProperties
}

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    base: 0,
    blurb: 'For side projects and trying things out.',
    cta: 'Start for free',
    features: ['3 active projects', '10k requests a month', '7-day log retention', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    base: 24,
    blurb: 'For small teams shipping every week.',
    cta: 'Start 14-day trial',
    features: ['Unlimited projects', '2M requests a month', '90-day log retention', 'Preview environments', 'Email support in 1 business day'],
  },
  {
    id: 'team',
    name: 'Team',
    base: 79,
    blurb: 'For teams that need control and a paper trail.',
    cta: 'Talk to sales',
    features: ['Everything in Pro', '20M requests a month', 'SSO and audit log', 'Role-based access', 'Shared Slack channel'],
  },
] as const

function Check({ strong }: { strong?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0" fill="none" stroke={strong ? 'var(--s-ac)' : 'var(--s-mu)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  )
}

export function PricingThreeTier({ className, style, ...props }: PricingThreeTierProps) {
  const o = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const font = FONTS[o.font as keyof typeof FONTS] ?? FONTS.geist
  const [yearlyState, setYearly] = useState<boolean | null>(null)
  const yearly = yearlyState ?? o.billing === 'yearly'
  const price = (base: number) => (yearly ? Math.round(base * (1 - o.discount / 100)) : base)

  return (
    <section
      className={cn('relative w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: BODY, ...style }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px]" aria-hidden style={{ background: 'radial-gradient(50% 100% at 50% 0%, color-mix(in oklab, var(--s-ac) 20%, transparent), transparent)' }} />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-[clamp(2.1rem,4.8vw,3.6rem)] leading-[1.03]" style={{ fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking }}>
            {o.heading}
          </h2>
          <p className="mt-5 text-pretty text-[16px] leading-relaxed" style={{ color: 'var(--s-mu)' }}>
            {o.subline}
          </p>

          <div className="mt-9 inline-flex items-center gap-1 rounded-full border p-1 text-[13px] font-medium" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)' }} role="group" aria-label="Billing period">
            {[false, true].map((isYear) => {
              const on = yearly === isYear
              return (
                <button
                  key={String(isYear)}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setYearly(isYear)}
                  className="relative rounded-full px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ color: on ? 'var(--s-on)' : 'var(--s-mu)', outlineColor: 'var(--s-ac)' }}
                >
                  {on && <motion.span layoutId="billing-thumb" className="absolute inset-0 rounded-full" style={{ background: 'var(--s-ac)' }} transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: 0.35, bounce: 0.2 }} />}
                  <span className="relative flex items-center gap-2">
                    {isYear ? 'Yearly' : 'Monthly'}
                    {isYear && (
                      <span className="rounded-full px-1.5 py-px text-[10px] font-semibold" style={{ background: on ? 'rgba(255,255,255,0.22)' : 'color-mix(in oklab, var(--s-ac) 18%, transparent)', color: on ? 'var(--s-on)' : 'var(--s-ac)' }}>
                        -{o.discount}%
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {TIERS.map((t) => {
            const hot = o.highlight === t.id
            const p = price(t.base)
            return (
              <article
                key={t.id}
                className={cn('relative flex flex-col p-7', hot && 'lg:-my-3 lg:py-10')}
                style={{
                  borderRadius: `${o.radius}px`,
                  border: hot ? '1px solid transparent' : '1px solid var(--s-ln)',
                  background: hot
                    ? `linear-gradient(var(--s-sf), var(--s-sf)) padding-box, linear-gradient(160deg, var(--s-ac), color-mix(in oklab, var(--s-ac) 10%, transparent) 55%, var(--s-ac)) border-box`
                    : 'var(--s-cd)',
                  boxShadow: hot ? '0 30px 80px -30px color-mix(in oklab, var(--s-ac) 60%, transparent)' : undefined,
                }}
              >
                {hot && (
                  <span className="absolute top-5 right-5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: 'color-mix(in oklab, var(--s-ac) 18%, transparent)', color: 'var(--s-ac)' }}>
                    Most popular
                  </span>
                )}
                <h3 className="text-[15px] font-semibold">{t.name}</h3>
                <p className="mt-1.5 min-h-[40px] text-[13.5px] leading-snug" style={{ color: 'var(--s-mu)' }}>
                  {t.blurb}
                </p>
                <div className="mt-6 flex items-end gap-1.5">
                  <span className="relative flex h-[58px] items-end overflow-hidden text-[52px] leading-none font-semibold tabular-nums" style={{ letterSpacing: '-0.04em', fontFamily: font.family }}>
                    <span className="mb-1.5 mr-0.5 text-[24px] opacity-60">{o.currency}</span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={p} initial={reduced ? false : { y: '70%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-70%', opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                        {p}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="mb-1.5 text-[13px]" style={{ color: 'var(--s-mu)' }}>
                    {t.base === 0 ? 'forever' : '/ month'}
                  </span>
                </div>
                <div className="mt-1 h-4 text-[11.5px]" style={{ color: 'var(--s-mu)' }}>
                  {t.base > 0 && yearly ? `Billed ${o.currency}${p * 12} a year` : t.base > 0 ? 'Billed monthly' : 'No card needed'}
                </div>
                <span
                  className="mt-6 inline-flex items-center justify-center px-5 py-3 text-[14px] font-medium"
                  style={{
                    borderRadius: `${Math.min(o.radius, 16)}px`,
                    background: hot ? 'var(--s-ac)' : 'var(--s-cd)',
                    color: hot ? 'var(--s-on)' : 'var(--s-fg)',
                    boxShadow: hot ? '0 10px 28px -10px var(--s-ac)' : 'inset 0 0 0 1px var(--s-ln)',
                  }}
                >
                  {t.cta}
                </span>
                <ul className="mt-7 space-y-3 border-t pt-6" style={{ borderColor: 'var(--s-ln)' }}>
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13.5px] leading-snug">
                      <Check strong={hot} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
        <p className="mt-10 text-center text-[13px]" style={{ color: 'var(--s-mu)' }}>
          Prices exclude local taxes. Cancel any time, and we prorate the unused days.
        </p>
      </div>
    </section>
  )
}
