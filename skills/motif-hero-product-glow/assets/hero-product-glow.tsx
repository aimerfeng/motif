// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Mikolaj Dobrucki
// Source: https://github.com/launch-ui/launch-ui/blob/b0d4d5b/components/sections/hero/default.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { motion } from 'motion/react'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  brand: 'Ledgerline',
  headline: 'Invoices that get paid before you follow up',
  subline: 'Ledgerline reconciles every payment as it lands and nudges late clients for you. Teams collect 9 days faster on average.',
  badge: 'Now syncing with 40+ banks',
  accent: '#7c6cff',
  tone: 'dark',
  font: 'geist',
  glow: 0.8,
  radius: 10,
  layout: 'centered',
}
/* @motif:end */

export type HeroProductGlowProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const FONTS = {
  geist: { family: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.045em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.05em' },
  serif: { family: "'Instrument Serif', 'Times New Roman', 'Songti SC', serif", weight: 400, tracking: '-0.025em' },
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
    '--s-bg': dark ? '#07080b' : '#f7f6f2',
    '--s-sf': dark ? '#0d0f14' : '#ffffff',
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.58)' : 'rgba(12,13,16,0.58)',
    '--s-ln': dark ? 'rgba(255,255,255,0.09)' : 'rgba(12,13,16,0.1)',
    '--s-cd': dark ? 'rgba(255,255,255,0.045)' : 'rgba(12,13,16,0.035)',
    '--s-ac': accent,
    '--s-on': onColor(accent),
  } as CSSProperties
}

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-6', className)} fill="none" aria-hidden>
      <rect width="24" height="24" rx="7" fill="var(--s-ac)" />
      <path d="M7 17V7h3.2a3 3 0 0 1 0 6H7" stroke="var(--s-on)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 17l3.5-5" stroke="var(--s-on)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** 把折线点平滑成三次贝塞尔路径。 */
function smooth(points: [number, number][]) {
  let d = `M${points[0]![0]},${points[0]![1]}`
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]!
    const [x1, y1] = points[i]!
    const mx = (x0 + x1) / 2
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`
  }
  return d
}

const REVENUE: [number, number][] = [
  [0, 78], [40, 70], [80, 74], [120, 58], [160, 62], [200, 44], [240, 50], [280, 32], [320, 36], [360, 20], [400, 24],
]
const PRIOR: [number, number][] = [
  [0, 84], [40, 80], [80, 82], [120, 72], [160, 74], [200, 64], [240, 66], [280, 56], [320, 58], [360, 48], [400, 50],
]

const NAV = ['Overview', 'Invoices', 'Customers', 'Payouts', 'Reports']

function Dashboard({ brand, reduced }: { brand: string; reduced: boolean }) {
  const line = smooth(REVENUE)
  const area = `${line} L400,100 L0,100 Z`
  return (
    <div className="overflow-hidden rounded-[18px] border shadow-2xl" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-sf)', boxShadow: '0 40px 120px -30px rgba(0,0,0,0.6), 0 0 0 1px var(--s-ln)' }}>
      <div className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: 'var(--s-ln)' }}>
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full" style={{ background: 'var(--s-ln)' }} />
          ))}
        </span>
        <span className="mx-auto rounded-md px-16 py-1 text-[11px]" style={{ background: 'var(--s-cd)', color: 'var(--s-mu)' }}>
          app.{brand.toLowerCase().replace(/[^a-z0-9]/g, '') || 'brand'}.dev/overview
        </span>
      </div>
      <div className="grid grid-cols-[168px_1fr] text-left max-md:grid-cols-1">
        <aside className="hidden border-r p-4 md:block" style={{ borderColor: 'var(--s-ln)' }}>
          <div className="mb-5 flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--s-fg)' }}>
            <Mark className="size-5" />
            {brand}
          </div>
          {NAV.map((n, i) => (
            <div key={n} className="mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px]" style={{ background: i === 0 ? 'var(--s-cd)' : undefined, color: i === 0 ? 'var(--s-fg)' : 'var(--s-mu)' }}>
              <span className="size-3.5 rounded-[5px]" style={{ background: i === 0 ? 'var(--s-ac)' : 'var(--s-ln)' }} />
              {n}
            </div>
          ))}
        </aside>
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold" style={{ color: 'var(--s-fg)' }}>
                Overview
              </div>
              <div className="text-[11.5px]" style={{ color: 'var(--s-mu)' }}>
                Sep 1 – Sep 28, all currencies
              </div>
            </div>
            <div className="flex gap-1 rounded-lg p-0.5 text-[11px]" style={{ background: 'var(--s-cd)', color: 'var(--s-mu)' }}>
              {['7d', '30d', '90d'].map((r, i) => (
                <span key={r} className="rounded-md px-2.5 py-1" style={i === 1 ? { background: 'var(--s-sf)', color: 'var(--s-fg)', boxShadow: '0 0 0 1px var(--s-ln)' } : undefined}>
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Collected', '$48,210', '+12.4%'],
              ['Open invoices', '1,284', '+3.1%'],
              ['Days to pay', '9.2', '-1.8d'],
            ].map(([k, v, d]) => (
              <div key={k} className="rounded-xl border p-3" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)' }}>
                <div className="text-[11px]" style={{ color: 'var(--s-mu)' }}>
                  {k}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[19px] font-semibold tabular-nums" style={{ color: 'var(--s-fg)', letterSpacing: '-0.02em' }}>
                    {v}
                  </span>
                  <span className="text-[10.5px] font-medium" style={{ color: '#34d399' }}>
                    {d}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border p-4" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)' }}>
            <div className="mb-2 flex items-center justify-between text-[11.5px]" style={{ color: 'var(--s-mu)' }}>
              <span>Revenue collected</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <i className="inline-block size-2 rounded-full" style={{ background: 'var(--s-ac)' }} /> This month
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="inline-block size-2 rounded-full" style={{ background: 'var(--s-ln)' }} /> Last month
                </span>
              </span>
            </div>
            <svg viewBox="0 0 400 100" className="h-32 w-full" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="hpg-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--s-ac)" stopOpacity="0.35" />
                  <stop offset="1" stopColor="var(--s-ac)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 50, 75].map((y) => (
                <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="var(--s-ln)" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
              ))}
              <path d={smooth(PRIOR)} fill="none" stroke="var(--s-mu)" strokeOpacity="0.5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <motion.path d={area} fill="url(#hpg-area)" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} />
              <motion.path
                d={line}
                fill="none"
                stroke="var(--s-ac)"
                strokeWidth="2.2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroProductGlow({ className, style, ...props }: HeroProductGlowProps) {
  const o = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const font = FONTS[o.font as keyof typeof FONTS] ?? FONTS.geist
  const split = o.layout === 'split'
  const fade = (delay: number, y = 14) => ({
    initial: reduced ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
  })
  const btn = { borderRadius: `${o.radius}px` }

  return (
    <section
      className={cn('relative isolate w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: BODY, ...style }}
    >
      {/* 顶部光晕：主色的两层径向渐变 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px]" aria-hidden style={{ opacity: o.glow }}>
        <div className="absolute top-[-8%] left-1/2 h-[520px] w-[92%] -translate-x-1/2 rounded-[50%] blur-2xl" style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--s-ac) 55%, transparent), transparent)' }} />
        <div className="absolute top-[4%] left-1/2 h-[300px] w-[52%] -translate-x-1/2 rounded-[50%] blur-2xl" style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--s-ac) 50%, white 10%), transparent)' }} />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]" aria-hidden style={{ backgroundImage: 'linear-gradient(var(--s-ln) 1px, transparent 1px), linear-gradient(90deg, var(--s-ln) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(70% 55% at 50% 0%, #000, transparent)' }} />

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        <nav className="flex items-center justify-between py-6">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold" style={{ letterSpacing: '-0.02em' }}>
            <Mark />
            {o.brand}
          </span>
          <div className="hidden items-center gap-7 text-[13px] md:flex" style={{ color: 'var(--s-mu)' }}>
            {['Features', 'Customers', 'Pricing', 'Changelog'].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <span className="px-4 py-1.5 text-[13px] font-medium" style={{ ...btn, background: 'var(--s-fg)', color: 'var(--s-bg)' }}>
            Get started
          </span>
        </nav>

        <div className={cn('pt-14', split ? 'grid items-center gap-14 lg:grid-cols-[0.9fr_1.3fr]' : 'text-center')}>
          <div className={cn('flex flex-col', split ? 'items-start' : 'items-center')}>
            <motion.span {...fade(0)} className="mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px]" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)', color: 'var(--s-mu)' }}>
              <span className="size-1.5 rounded-full" style={{ background: 'var(--s-ac)', boxShadow: '0 0 10px var(--s-ac)' }} />
              {o.badge}
              <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 3.5 10.5 8 6 12.5" />
              </svg>
            </motion.span>
            <motion.h1
              {...fade(0.07)}
              className={cn('text-balance', split ? 'max-w-lg text-[clamp(2.4rem,5vw,3.9rem)]' : 'max-w-4xl text-[clamp(2.6rem,6.6vw,5.4rem)]', o.font === 'serif' ? 'leading-[1.0]' : 'leading-[1.04]')}
              style={{
                fontFamily: font.family,
                fontWeight: font.weight,
                letterSpacing: font.tracking,
                backgroundImage: 'linear-gradient(180deg, var(--s-fg) 30%, color-mix(in oklab, var(--s-fg) 55%, transparent))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {o.headline}
            </motion.h1>
            <motion.p {...fade(0.14)} className={cn('mt-6 text-pretty text-[17px] leading-relaxed', split ? 'max-w-md' : 'max-w-2xl')} style={{ color: 'var(--s-mu)' }}>
              {o.subline}
            </motion.p>
            <motion.div {...fade(0.2)} className="mt-9 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center px-5 py-3 text-[14px] font-medium" style={{ ...btn, background: 'var(--s-ac)', color: 'var(--s-on)', boxShadow: '0 8px 30px -8px var(--s-ac)' }}>
                Start collecting
              </span>
              <span className="inline-flex items-center gap-2 border px-5 py-3 text-[14px] font-medium" style={{ ...btn, borderColor: 'var(--s-ln)', background: 'var(--s-cd)' }}>
                <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
                  <path d="M4.5 3v10l8-5z" />
                </svg>
                Watch 90s demo
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn('relative', split ? '' : 'mt-16')}
            style={split ? { perspective: 1600 } : undefined}
          >
            <div style={split ? { transform: 'rotateY(-9deg) rotateX(3deg)', transformOrigin: 'left center' } : undefined}>
              <Dashboard brand={o.brand} reduced={reduced} />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="h-24" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40" style={{ background: 'linear-gradient(to bottom, transparent, var(--s-bg))' }} aria-hidden />
    </section>
  )
}
