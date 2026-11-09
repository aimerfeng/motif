// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/timeline-block.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#a78bfa',
  variant: 'journey',
  layout: 'alternate',
  cardStyle: 'solid',
  drawRail: true,
  badge: 'Our Journey',
  heading: 'The Story of Our Growth',
  subheading: 'From a small startup to a global platform trusted by thousands',
}
/* @motif:end */

export type AboutJourneyTimelineProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

type Status = 'done' | 'now' | 'next'
type TimelineEvent = { year: string; title: string; description: string; status: Status }

// 公司历程：上游 timeline-block 的五个里程碑。
const JOURNEY: TimelineEvent[] = [
  { year: '2020', title: 'Company Founded', description: 'Started with a vision to transform how businesses operate digitally.', status: 'done' },
  { year: '2021', title: 'First 1,000 Customers', description: 'Reached our first major milestone with customers across 20 countries.', status: 'done' },
  { year: '2022', title: 'Series A Funding', description: 'Raised $10M to accelerate product development and expand our team.', status: 'done' },
  { year: '2023', title: 'Global Expansion', description: 'Opened offices in 5 new countries and launched multilingual support.', status: 'done' },
  { year: '2024', title: 'AI Integration', description: 'Launched AI-powered features to help businesses scale faster.', status: 'done' },
]

// 路线图：上游 glassmorphism-launch-timeline-block 的四个阶段，加上 done / now / next 状态。
const ROADMAP: TimelineEvent[] = [
  { year: 'Week 1', title: 'Discovery & Strategy', description: 'Align your team around a bold yet achievable product vision in just one workshop.', status: 'done' },
  { year: 'Week 2', title: 'Design Sprint', description: 'Translate insights into polished flows with daily feedback loops and rapid iteration.', status: 'done' },
  { year: 'Week 3', title: 'Beta Launch', description: 'Ship a confident release backed by telemetry and real user validation.', status: 'now' },
  { year: 'Week 4', title: 'Scale & Learn', description: 'Capture momentum with automation, growth playbooks, and purposeful analytics.', status: 'next' },
]

const STATUS_LABEL: Record<Status, string> = { done: 'Done', now: 'In progress', next: 'Up next' }

/** 按亮度挑主色上的文字颜色，保证任意主色都可读。 */
function inkOn(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0b0b10'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.18 ? '#0b0b10' : '#ffffff'
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function DotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="5" />
    </svg>
  )
}

export function AboutJourneyTimeline({ className, style, ...props }: AboutJourneyTimelineProps) {
  const { accent, layout, variant, drawRail, cardStyle, badge, heading, subheading } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const events = variant === 'roadmap' ? ROADMAP : JOURNEY
  const alternate = layout === 'alternate'
  const glass = cardStyle === 'glass'
  const ink = inkOn(accent)

  const ref = useRef<HTMLElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLLIElement | null)[]>([])
  const [lit, setLit] = useState(0)
  const litRef = useRef(-1)

  // 上游用 useInView 触发竖轴动画；这里改由帧循环的时间驱动（截图时可控），节点在竖轴经过时点亮。
  useFrameLoop(
    ref,
    ({ time }) => {
      const rail = railRef.current
      const list = listRef.current
      if (!rail || !list) return
      const h = list.offsetHeight || 1
      const raw = drawRail && !reduced ? Math.min(1, Math.max(0, (time - 0.2) / 1.5)) : 1
      const eased = 1 - (1 - raw) ** 3
      // 路线图只画到「进行中」节点，后面的阶段保持暗色。
      const nowIndex = events.findIndex((e) => e.status === 'now')
      const nowNode = nowIndex >= 0 ? rowRefs.current[nowIndex] : null
      // 节点垂直居中于每一行，所以行的中线就是节点中心。
      const nodeCenter = (row: HTMLLIElement) => row.offsetTop + row.offsetHeight / 2
      const limit = nowNode ? nodeCenter(nowNode) / h : 1
      const p = eased * limit
      rail.style.transform = `scaleY(${p.toFixed(4)})`
      let count = 0
      for (let i = 0; i < events.length; i++) {
        const node = rowRefs.current[i]
        if (node && nodeCenter(node) <= p * h + 1) count = i + 1
      }
      if (count !== litRef.current) {
        litRef.current = count
        setLit(count)
      }
    },
    { reducedMotion: 'static', staticTime: 10 },
  )

  const entrance = !reduced

  return (
    <section
      ref={ref}
      className={cn('w-full bg-background px-4 py-16 text-foreground md:py-24', className)}
      style={{ ...style, ['--acc' as string]: accent, ['--acc-ink' as string]: ink }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={entrance ? { opacity: 0, y: -20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center md:mb-16"
        >
          <span className="mb-4 inline-flex items-center rounded-md border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            <CalendarIcon className="mr-1 h-3 w-3" />
            {badge}
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-5xl">{heading}</h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">{subheading}</p>
        </motion.div>

        {/* Timeline */}
        <div ref={listRef} className="relative">
          {/* Vertical line：底轨 + 主色填充 */}
          <div aria-hidden className={cn('absolute top-0 left-4 h-full w-0.5 -translate-x-1/2 bg-border/60', alternate && 'md:left-1/2')} />
          <div aria-hidden className={cn('absolute top-0 left-4 h-full w-0.5 -translate-x-1/2', alternate && 'md:left-1/2')}>
            <div
              ref={railRef}
              className="h-full w-full"
              style={{
                transformOrigin: 'top',
                transform: 'scaleY(0)',
                background:
                  variant === 'roadmap'
                    ? 'var(--acc)'
                    : 'linear-gradient(to bottom, var(--acc), color-mix(in oklab, var(--acc) 50%, transparent), color-mix(in oklab, var(--acc) 20%, transparent))',
              }}
            />
          </div>

          <ol className="space-y-12 md:space-y-16" aria-label={heading}>
            {events.map((event, index) => {
              const isEven = index % 2 === 0
              const on = index < lit
              const isNow = event.status === 'now'
              const Icon = event.status === 'done' ? CheckCircleIcon : DotIcon
              const pulse = on && !reduced && (variant === 'journey' || isNow)

              return (
                <motion.li
                  key={event.year}
                  initial={entrance ? { opacity: 0, y: 30 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5, ease: 'easeOut' }}
                  className={cn('relative flex items-center', alternate && (isEven ? 'md:flex-row' : 'md:flex-row-reverse'))}
                  aria-current={isNow ? 'step' : undefined}
                  ref={(el) => {
                    rowRefs.current[index] = el
                  }}
                >
                  {/* Timeline node */}
                  <div
                    className={cn('absolute top-1/2 left-4 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center', alternate && 'md:left-1/2')}
                  >
                    {pulse && (
                      <motion.div
                        className="absolute h-8 w-8 rounded-full"
                        style={{ background: 'color-mix(in oklab, var(--acc) 20%, transparent)' }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      />
                    )}
                    <motion.div
                      className="relative flex h-8 w-8 items-center justify-center rounded-full border-4 border-background transition-colors duration-300"
                      initial={false}
                      animate={{ scale: on ? 1 : 0.75 }}
                      transition={reduced ? { duration: 0 } : { type: 'spring', visualDuration: 0.35, bounce: 0.4 }}
                      style={{ background: on ? 'var(--acc)' : 'var(--muted)', color: on ? 'var(--acc-ink)' : 'var(--muted-foreground)' }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>
                  </div>

                  {/* Content card */}
                  <div className={cn('ml-12 w-full min-w-0', alternate ? cn('md:ml-0 md:w-5/12', isEven ? 'md:pr-12' : 'md:pl-12') : 'md:ml-16')}>
                    <motion.div whileHover={reduced ? undefined : { scale: 1.02, y: -5 }} transition={{ duration: 0.2 }}>
                      <div
                        className={cn(
                          'relative overflow-hidden border p-4 md:p-6',
                          glass ? 'rounded-3xl border-border/50 bg-background/45 backdrop-blur-2xl' : 'rounded-xl border-border/50 bg-card text-card-foreground shadow-lg',
                          event.status === 'next' && 'opacity-80',
                        )}
                      >
                        <motion.div
                          className="absolute inset-0 opacity-0"
                          style={{ background: 'linear-gradient(to bottom right, color-mix(in oklab, var(--acc) 8%, transparent), transparent)' }}
                          whileHover={{ opacity: 1 }}
                        />
                        <div className="relative z-10">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold text-foreground">{event.year}</span>
                            {variant === 'roadmap' && (
                              <span
                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-[0.14em] uppercase"
                                style={
                                  isNow
                                    ? { background: 'var(--acc)', color: 'var(--acc-ink)' }
                                    : event.status === 'done'
                                      ? { background: 'color-mix(in oklab, var(--acc) 14%, transparent)', color: 'var(--foreground)' }
                                      : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
                                }
                              >
                                {STATUS_LABEL[event.status]}
                              </span>
                            )}
                          </div>
                          <h3 className="mb-2 text-lg font-bold md:text-xl">{event.title}</h3>
                          <p className="text-sm text-muted-foreground md:text-base">{event.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Spacer for alternating layout */}
                  {alternate && <div className="hidden w-5/12 md:block" />}
                </motion.li>
              )
            })}
          </ol>
        </div>

        {/* Future indicator */}
        <motion.div
          initial={entrance ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: events.length * 0.2 + 0.5 }}
          className="mt-12 text-center md:mt-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3">
            <motion.div
              animate={reduced ? undefined : { scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full"
              style={{ background: 'var(--acc)' }}
            />
            <span className="text-sm font-medium">{variant === 'roadmap' ? 'Next review on Friday' : 'And the journey continues...'}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
