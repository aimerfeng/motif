// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/stats-counter-block.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { animate, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  font: 'serif',
  variant: 'row',
  density: 'comfortable',
  heading: 'Numbers we’re quietly proud of',
  subheading: 'Measured across every workspace on Halcyon, refreshed each morning.',
  duration: 1.8,
  showTrend: true,
  animate: true,
}
/* @motif:end */

export type StatsCountersProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const STATS = [
  { value: 2.4, decimals: 1, suffix: 'B', label: 'Events processed each month', trend: '+18%', ring: 0.82, bars: [30, 42, 38, 55, 50, 66, 78] },
  { value: 99.99, decimals: 2, suffix: '%', label: 'Uptime over the last 12 months', trend: '+0.02', ring: 0.9999, bars: [88, 92, 90, 95, 93, 97, 99] },
  { value: 38, decimals: 0, suffix: 'ms', label: 'Median query time', trend: '−12%', ring: 0.64, bars: [80, 74, 70, 62, 58, 50, 44] },
  { value: 12400, decimals: 0, suffix: '', label: 'Teams shipping with Halcyon', trend: '+1.9k', ring: 0.91, bars: [28, 34, 40, 47, 56, 66, 80] },
]

const FONT: Record<string, { family: string; weight: number; tracking: string }> = {
  serif: { family: "'Instrument Serif', ui-serif, Georgia, serif", weight: 400, tracking: '-0.01em' },
  sans: { family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.04em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.04em' },
}

function Count({ stat, run, duration, delay }: { stat: (typeof STATS)[number]; run: boolean; duration: number; delay: number }) {
  const [v, setV] = useState(run ? 0 : stat.value)
  useEffect(() => {
    if (!run) {
      setV(stat.value)
      return
    }
    const controls = animate(0, stat.value, { duration, delay, ease: [0.16, 1, 0.3, 1], onUpdate: setV })
    return () => controls.stop()
  }, [run, stat.value, duration, delay])
  return (
    <span className="tabular-nums">
      {v.toLocaleString('en-US', { minimumFractionDigits: stat.decimals, maximumFractionDigits: stat.decimals })}
      {stat.suffix}
    </span>
  )
}

function Trend({ text }: { text: string }) {
  const down = text.startsWith('−')
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums', 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400')}>
      <svg viewBox="0 0 12 12" className={cn('size-3', down && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 9.500v-7M3 5.500l3-3 3 3" />
      </svg>
      {text.replace('−', '')}
    </span>
  )
}

function Ring({ value, run, delay, size = 64 }: { value: number; run: boolean; delay: number; size?: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeOpacity=".1" strokeWidth="5" />
      <motion.circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="var(--acc)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: run ? c : c * (1 - value) }}
        animate={{ strokeDashoffset: c * (1 - value) }}
        transition={{ duration: 1.6, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

const PAD: Record<string, string> = { compact: 'py-10 sm:py-14', comfortable: 'py-14 sm:py-20', spacious: 'py-20 sm:py-28' }

/** 数据条：横排分隔、卡片（带迷你柱图）、左文右环形进度三种；数字自零滚到目标值。 */
export function StatsCounters({ className, style, ...props }: StatsCountersProps) {
  const { accent, font, variant, density, heading, subheading, duration, showTrend, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const f = FONT[font] ?? FONT.serif
  const ease = [0.22, 1, 0.36, 1] as const
  const enter = (d: number) => ({ initial: run ? { opacity: 0, y: 16 } : (false as const), animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: d, ease } })
  const num = (size: string) => ({ className: cn('leading-none', size), style: { fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking } })

  const head = (center: boolean) => (
    <motion.header {...enter(0)} className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--acc)' }}>
        By the numbers
      </p>
      <h2 className="mt-3 text-balance text-4xl sm:text-5xl" style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: 1.05 }}>
        {heading}
      </h2>
      <p className={cn('mt-4 text-pretty text-base text-muted-foreground', center && 'mx-auto max-w-xl')}>{subheading}</p>
    </motion.header>
  )

  return (
    <section className={cn('relative w-full overflow-hidden text-foreground', className)} style={{ ['--acc' as string]: accent, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60" style={{ background: 'radial-gradient(45% 45% at 50% 55%, color-mix(in oklab, var(--acc) 14%, transparent), transparent)' }} />
      <div className={cn('relative mx-auto max-w-6xl px-5 sm:px-8', PAD[density] ?? PAD.comfortable)}>
        {variant === 'row' && (
          <>
            {head(true)}
            <dl className="mt-14 grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:gap-y-0 lg:divide-x">
              {STATS.map((s, i) => (
                <motion.div key={s.label} {...enter(0.15 + i * 0.09)} className="flex flex-col items-center px-4 text-center lg:px-6">
                  <dd {...num('text-5xl sm:text-6xl')}>
                    <Count stat={s} run={run} duration={duration} delay={0.2 + i * 0.1} />
                  </dd>
                  <dt className="mt-3 max-w-44 text-sm text-muted-foreground">{s.label}</dt>
                  {showTrend && (
                    <div className="mt-3">
                      <Trend text={s.trend} />
                    </div>
                  )}
                </motion.div>
              ))}
            </dl>
          </>
        )}

        {variant === 'tiles' && (
          <>
            {head(false)}
            <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((s, i) => (
                <motion.div key={s.label} {...enter(0.15 + i * 0.09)} className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-colors hover:border-[color-mix(in_oklab,var(--acc)_40%,var(--border))]">
                  <div className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-[0.14] blur-2xl transition-opacity duration-500 group-hover:opacity-30" style={{ background: 'var(--acc)' }} />
                  <div className="relative flex items-start justify-between gap-3">
                    <dd {...num('text-5xl')}>
                      <Count stat={s} run={run} duration={duration} delay={0.2 + i * 0.1} />
                    </dd>
                    {showTrend && <Trend text={s.trend} />}
                  </div>
                  <dt className="relative mt-3 text-sm text-muted-foreground">{s.label}</dt>
                  {showTrend && (
                    <div className="relative mt-6 flex h-10 items-end gap-1.5" aria-hidden>
                      {s.bars.map((h, k) => (
                        <motion.span
                          key={k}
                          className="flex-1 rounded-sm"
                          style={{ height: `${h}%`, transformOrigin: 'bottom', background: k === s.bars.length - 1 ? 'var(--acc)' : 'color-mix(in oklab, var(--acc) 28%, transparent)' }}
                          initial={run ? { scaleY: 0 } : false}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.6, delay: 0.5 + i * 0.09 + k * 0.05, ease }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </dl>
          </>
        )}

        {variant === 'split' && (
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            {head(false)}
            <dl className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
              {STATS.map((s, i) => (
                <motion.div key={s.label} {...enter(0.15 + i * 0.09)} className="flex items-center gap-4">
                  <span className="relative shrink-0 text-foreground">
                    <Ring value={s.ring} run={run} delay={i * 0.1} />
                  </span>
                  <div className="min-w-0">
                    <dd {...num('text-4xl sm:text-[2.6rem]')}>
                      <Count stat={s} run={run} duration={duration} delay={0.2 + i * 0.1} />
                    </dd>
                    <dt className="mt-1.5 text-sm leading-snug text-muted-foreground">{s.label}</dt>
                  </div>
                </motion.div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  )
}
