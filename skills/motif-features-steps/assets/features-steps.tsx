// SPDX-License-Identifier: MIT
// Copyright (c) Mark Mead
// Source: https://github.com/markmead/hyperui/blob/2b5aebb/public/examples/application/steps/1.html
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  font: 'serif',
  layout: 'tour',
  steps: 4,
  heading: 'From raw data to a shared dashboard in an afternoon',
  subheading: 'Four steps, no consultants, no pipeline to babysit.',
  showMocks: true,
  autoplay: true,
  interval: 4,
  animate: true,
}
/* @motif:end */

export type FeaturesStepsProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const STEPS = [
  { title: 'Connect your data', body: 'Point Halcyon at your warehouse or drop in a CSV. Schemas are detected in seconds, not sprints.' },
  { title: 'Define metrics once', body: 'Write revenue, activation or retention as a formula. Every chart and export reuses the same definition.' },
  { title: 'Compose dashboards', body: 'Drag charts onto a canvas, link filters together and pin the numbers that matter to your team.' },
  { title: 'Share with the team', body: 'Schedule a weekly digest, embed a view, or send a link with row-level permissions attached.' },
]

const FONT: Record<string, { family: string; weight: number; tracking: string }> = {
  serif: { family: "'Instrument Serif', ui-serif, Georgia, serif", weight: 400, tracking: '-0.005em' },
  sans: { family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em' },
}
const mono = "'Geist Mono Variable', ui-monospace, monospace"

function Hex({ tone }: { tone?: string }) {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke={tone ?? 'currentColor'} strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <path d="m10 2.500 6.500 3.750v7.500L10 17.500l-6.500-3.750v-7.500z" />
    </svg>
  )
}

/** 每一步的自绘示意窗：纯 div / SVG，不含位图。 */
function Mock({ index }: { index: number }) {
  const body: ReactNode[] = [
    <div key="0" className="space-y-2.5 p-4">
      {[
        ['warehouse-prod', 'Connected', 100],
        ['orders-2026.csv', 'Connected', 100],
        ['events-stream', 'Syncing', 64],
      ].map(([name, state, pct]) => (
        <div key={name as string} className="rounded-lg border bg-background/60 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 whitespace-nowrap" style={{ fontFamily: mono }}>
              <span style={{ color: 'var(--acc)' }}>
                <Hex />
              </span>
              {name}
            </span>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', state === 'Connected' ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/12 text-amber-600 dark:text-amber-400')}>{state}</span>
          </div>
          {state === 'Syncing' && (
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--acc)' }} />
            </div>
          )}
        </div>
      ))}
      <p className="pt-0.5 text-[11px] text-muted-foreground">38 tables · 412 columns detected</p>
    </div>,
    <div key="1" className="p-4">
      <div className="rounded-lg border bg-background/60 p-3 text-[11.5px] leading-6" style={{ fontFamily: mono }}>
        <p>
          <span className="text-muted-foreground/60 select-none">1 </span>
          <span style={{ color: 'var(--acc)' }}>metric</span> revenue
        </p>
        <p>
          <span className="text-muted-foreground/60 select-none">2 </span>
          {'  '}= <span className="text-sky-500 dark:text-sky-400">sum</span>(invoice.amount)
        </p>
        <p>
          <span className="text-muted-foreground/60 select-none">3 </span>
          {'  '}<span style={{ color: 'var(--acc)' }}>where</span> status = <span className="text-emerald-600 dark:text-emerald-400">"paid"</span>
        </p>
        <p>
          <span className="text-muted-foreground/60 select-none">4 </span>
          {'  '}<span style={{ color: 'var(--acc)' }}>by</span> month
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg border bg-background/60 px-3 py-2">
        <span className="text-xs text-muted-foreground">Preview</span>
        <span className="text-sm font-semibold tabular-nums">$482,190</span>
        <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">+12.4%</span>
      </div>
    </div>,
    <div key="2" className="grid grid-cols-3 gap-2.5 p-4">
      <div className="rounded-lg border bg-background/60 p-3">
        <p className="text-[10px] text-muted-foreground">Active users</p>
        <p className="mt-1 text-lg font-semibold tabular-nums">12,480</p>
      </div>
      <div className="col-span-2 rounded-lg border bg-background/60 p-3">
        <div className="flex h-12 items-end gap-1">
          {[40, 55, 35, 62, 48, 74, 58, 88].map((h, i) => (
            <span key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 7 ? 'var(--acc)' : 'color-mix(in oklab, var(--acc) 30%, transparent)' }} />
          ))}
        </div>
      </div>
      <div className="col-span-3 rounded-lg border bg-background/60 p-3">
        <svg viewBox="0 0 240 56" className="h-14 w-full" fill="none" preserveAspectRatio="none" aria-hidden>
          <path d="M0 42C24 40 32 20 60 24S104 46 132 30 176 8 200 16 228 22 240 10V56H0Z" fill="var(--acc)" opacity=".16" />
          <path d="M0 42C24 40 32 20 60 24S104 46 132 30 176 8 200 16 228 22 240 10" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>,
    <div key="3" className="space-y-3 p-4">
      <div className="flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 text-xs" style={{ fontFamily: mono }}>
        <span className="truncate text-muted-foreground">halcyon.app/v/q3-revenue</span>
        <span className="ml-auto rounded-md border px-1.5 py-0.5 text-[10px]" style={{ color: 'var(--acc)' }}>
          Copy
        </span>
      </div>
      <div className="flex items-center justify-between rounded-lg border bg-background/60 px-3 py-2.5">
        <div>
          <p className="text-xs font-medium">Weekly digest</p>
          <p className="text-[11px] text-muted-foreground">Mondays at 9:00 · 14 recipients</p>
        </div>
        <span className="flex h-5 w-9 items-center justify-end rounded-full px-0.5" style={{ background: 'var(--acc)' }}>
          <span className="size-4 rounded-full bg-white" />
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {[210, 320, 40, 150].map((h) => (
            <span key={h} className="size-6 rounded-full ring-2 ring-card" style={{ background: `linear-gradient(135deg, hsl(${h} 70% 58%), hsl(${h + 50} 68% 42%))` }} />
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground">Viewers can filter, not edit</span>
      </div>
    </div>,
  ]
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-lg shadow-black/10">
      <div className="flex items-center gap-1.5 border-b bg-muted/40 px-3.5 py-2.5">
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="ml-3 text-[10px] text-muted-foreground" style={{ fontFamily: mono }}>
          step-0{index + 1}
        </span>
      </div>
      {body[index % body.length]}
    </div>
  )
}

/** 步骤区块：横排、产品导览、交错三种版式；当前步骤按时间自动推进，点击可跳转。 */
export function FeaturesSteps({ className, style, ...props }: FeaturesStepsProps) {
  const { accent, font, layout, steps, interval, autoplay, heading, subheading, showMocks, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const f = FONT[font] ?? FONT.serif
  const n = Math.max(3, Math.min(4, steps))
  const list = STEPS.slice(0, n)
  const root = useRef<HTMLElement>(null)
  const timeRef = useRef(0)
  const origin = useRef(0)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const ease = [0.22, 1, 0.36, 1] as const

  useFrameLoop(
    root,
    ({ time }) => {
      timeRef.current = time
      const el = root.current
      if (!el) return
      const t = autoplay ? Math.max(0, time - origin.current) / Math.max(1, interval) : activeRef.current
      const idx = autoplay ? Math.floor(t) % n : activeRef.current
      const frac = autoplay ? t - Math.floor(t) : 1
      if (idx !== activeRef.current) {
        activeRef.current = idx
        setActive(idx)
      }
      el.style.setProperty('--p', frac.toFixed(3))
      el.style.setProperty('--fill', Math.min(1, (idx + (autoplay ? frac : 0)) / (n - 1)).toFixed(3))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const pick = (i: number) => {
    origin.current = timeRef.current - i * interval
    activeRef.current = i
    setActive(i)
  }
  const current = Math.min(active, n - 1)
  const enter = (d: number) => ({ initial: run ? { opacity: 0, y: 18 } : (false as const), animate: { opacity: 1, y: 0 }, transition: { duration: 0.65, delay: d, ease } })

  const header = (
    <motion.header {...enter(0)} className={cn('max-w-2xl', layout === 'horizontal' && 'mx-auto text-center')}>
      <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--acc)' }}>
        How it works
      </p>
      <h2 className="mt-3 text-balance text-4xl sm:text-5xl" style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: 1.05 }}>
        {heading}
      </h2>
      <p className="mt-4 text-pretty text-base text-muted-foreground">{subheading}</p>
    </motion.header>
  )

  return (
    <section ref={root} className={cn('w-full text-foreground', className)} style={{ ['--acc' as string]: accent, ['--p' as string]: 0, ['--fill' as string]: 0, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style }}>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        {header}

        {layout === 'horizontal' && (
          <div className="relative mt-16">
            <div className="absolute top-[1.15rem] hidden h-px bg-border lg:block" style={{ left: `${50 / n}%`, right: `${50 / n}%` }}>
              <div className="h-full origin-left" style={{ background: 'var(--acc)', transform: 'scaleX(var(--fill))' }} />
            </div>
            <ol className={cn('grid gap-10 lg:gap-6', n === 3 ? 'lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4')}>
              {list.map((s, i) => {
                const on = i === current
                const done = i < current
                return (
                  <motion.li key={s.title} {...enter(0.15 + i * 0.1)}>
                    <button type="button" onClick={() => pick(i)} className="group block w-full text-left outline-none">
                      <span
                        className="relative z-10 mx-auto grid size-9 place-items-center rounded-full border bg-background text-sm font-semibold transition-[background-color,color,border-color,box-shadow] duration-300 lg:mx-auto"
                        style={on ? { background: 'var(--acc)', color: '#fff', borderColor: 'var(--acc)', boxShadow: '0 0 0 6px color-mix(in oklab, var(--acc) 20%, transparent)' } : done ? { borderColor: 'var(--acc)', color: 'var(--acc)' } : undefined}
                      >
                        {done ? (
                          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="m3.500 8.500 3 3 6-7" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <h3 className={cn('mt-5 text-center text-base font-medium transition-colors', !on && 'text-foreground/70 group-hover:text-foreground')}>{s.title}</h3>
                      <p className="mx-auto mt-2 max-w-64 text-center text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                    </button>
                    {showMocks && (
                      <div className={cn('mx-auto mt-6 max-w-72 transition-[opacity,transform] duration-500', on ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-45')}>
                        <Mock index={i} />
                      </div>
                    )}
                  </motion.li>
                )
              })}
            </ol>
          </div>
        )}

        {layout === 'tour' && (
          <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <ol className="space-y-1">
              {list.map((s, i) => {
                const on = i === current
                return (
                  <motion.li key={s.title} {...enter(0.15 + i * 0.08)}>
                    <button
                      type="button"
                      onClick={() => pick(i)}
                      aria-current={on ? 'step' : undefined}
                      className={cn('relative block w-full rounded-xl border border-transparent p-4 text-left outline-none transition-[background-color,border-color] duration-300 focus-visible:ring-2 focus-visible:ring-ring sm:p-5', on ? 'bg-card' : 'hover:bg-muted/40')}
                      style={on ? { borderColor: 'color-mix(in oklab, var(--acc) 30%, var(--border))' } : undefined}
                    >
                      <span className="flex items-center gap-3.5">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular-nums transition-colors duration-300" style={on ? { background: 'var(--acc)', color: '#fff', borderColor: 'var(--acc)' } : undefined}>
                          {i + 1}
                        </span>
                        <span className={cn('text-base font-medium transition-colors', !on && 'text-foreground/70')}>{s.title}</span>
                      </span>
                      <span className={cn('grid transition-[grid-template-rows,opacity] duration-500', on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                        <span className="overflow-hidden">
                          <span className="block pt-3 pl-[2.625rem] text-sm leading-relaxed text-muted-foreground">{s.body}</span>
                          <span className="mt-4 ml-[2.625rem] block h-0.5 overflow-hidden rounded-full bg-muted">
                            <span className="block h-full origin-left rounded-full" style={{ background: 'var(--acc)', transform: on ? 'scaleX(var(--p))' : 'scaleX(0)' }} />
                          </span>
                        </span>
                      </span>
                    </button>
                  </motion.li>
                )
              })}
            </ol>
            <motion.div {...enter(0.25)} className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-[2rem] opacity-60 blur-2xl" style={{ background: 'radial-gradient(60% 60% at 50% 40%, color-mix(in oklab, var(--acc) 26%, transparent), transparent)' }} />
              <div className="relative">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={current} initial={run ? { opacity: 0, y: 12, scale: 0.985 } : false} animate={{ opacity: 1, y: 0, scale: 1 }} exit={run ? { opacity: 0, y: -8 } : undefined} transition={{ duration: 0.35, ease }}>
                    <Mock index={current} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}

        {layout === 'zigzag' && (
          <ol className="mt-14 space-y-14 sm:space-y-20">
            {list.map((s, i) => (
              <motion.li key={s.title} {...enter(0.15 + i * 0.1)} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                <div className={cn(i % 2 === 1 && 'md:order-2')}>
                  <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--acc)', fontFamily: mono }}>
                    0{i + 1}
                  </span>
                  <h3 className="mt-2 text-balance text-2xl sm:text-[1.9rem]" style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: 1.12 }}>
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
                {showMocks && (
                  <div className={cn('mx-auto w-full max-w-md', i % 2 === 1 && 'md:order-1')}>
                    <Mock index={i} />
                  </div>
                )}
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
