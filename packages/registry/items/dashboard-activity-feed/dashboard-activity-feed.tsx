// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/onboarding-feed/onboarding-feed-01.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  layout: 'timeline',
  density: 'comfortable',
  count: 6,
  seed: 3,
  title: 'Activity',
  live: true,
  animate: true,
}
/* @motif:end */

export type DashboardActivityFeedProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

type Kind = 'deploy' | 'merge' | 'comment' | 'review' | 'alert' | 'invite' | 'file'
type Group = 'code' | 'talk' | 'system'
type Event = { kind: Kind; who: string; body: ReactNode; extra?: ReactNode; ago: string }

const GROUP: Record<Kind, Group> = { deploy: 'code', merge: 'code', comment: 'talk', review: 'talk', alert: 'system', invite: 'system', file: 'system' }

const ICON: Record<Kind, { path: string; tone: string }> = {
  deploy: { path: 'M12 4c3 1 5 3.5 5 7l-2.5 3.5h-5L7 11c0-3.500 2-6 5-7ZM9.500 14.500 8 19M14.500 14.500 16 19M12 9.500v.01', tone: '#60a5fa' },
  merge: { path: 'M7 5.500a1.500 1.500 0 1 0 0 3 1.500 1.500 0 0 0 0-3ZM7 8.500v7M7 18.500a1.500 1.500 0 1 0 0-3 1.500 1.500 0 0 0 0 3ZM17 18.500a1.500 1.500 0 1 0 0-3 1.500 1.500 0 0 0 0 3ZM17 15.500V12c0-2-1-3-3-3h-2', tone: '#a78bfa' },
  comment: { path: 'M5 6.500A1.500 1.500 0 0 1 6.500 5h11A1.500 1.500 0 0 1 19 6.500v8a1.500 1.500 0 0 1-1.500 1.500H11l-4 3.500V16h-.5A1.500 1.500 0 0 1 5 14.500z', tone: '#38bdf8' },
  review: { path: 'm5 12.500 4.500 4.500L19 7.500', tone: '#34d399' },
  alert: { path: 'M12 4 3.500 19h17L12 4ZM12 10v4M12 16.500v.01', tone: '#fbbf24' },
  invite: { path: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.500 19c.4-3 2.600-4.500 5.500-4.500s5.100 1.500 5.500 4.500M18 8v6M15 11h6', tone: '#f472b6' },
  file: { path: 'M7 4h7l4 4v12H7zM14 4v4h4M10 13h5M10 16h3', tone: '#fb923c' },
}

const B = ({ children }: { children: ReactNode }) => <span className="font-medium text-foreground">{children}</span>
const Mono = ({ children }: { children: ReactNode }) => <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.78em] text-foreground">{children}</code>

function pool(): Event[] {
  return [
    { kind: 'deploy', who: 'Mara Okafor', body: (<><B>Mara Okafor</B> deployed <Mono>api-gateway</Mono> to production</>), extra: <Chips items={['v2.14.0', 'build #4821', '42s']} />, ago: '' },
    { kind: 'comment', who: 'Jonas Reyes', body: (<><B>Jonas Reyes</B> commented on <B>Rate limiting proposal</B></>), extra: <Quote>Can we cap bursts at 120 req/s per key and return a Retry-After header?</Quote>, ago: '' },
    { kind: 'merge', who: 'Iris Chen', body: (<><B>Iris Chen</B> merged <Mono>#312 Cache invalidation</Mono> into <Mono>main</Mono></>), extra: <Diff add={184} del={36} />, ago: '' },
    { kind: 'alert', who: 'Monitor', body: (<><B>Latency alert</B> resolved in <Mono>eu-west-1</Mono></>), extra: <Chips items={['p95 212ms', 'down 14 min']} />, ago: '' },
    { kind: 'invite', who: 'Devon Park', body: (<><B>Devon Park</B> joined the workspace as <B>Editor</B></>), ago: '' },
    { kind: 'file', who: 'Sana Malik', body: (<><B>Sana Malik</B> uploaded <Mono>q3-roadmap.pdf</Mono></>), extra: <Chips items={['2.4 MB', 'PDF']} />, ago: '' },
    { kind: 'review', who: 'Tomas Novak', body: (<><B>Tomas Novak</B> approved <Mono>#318 Webhook retries</Mono></>), ago: '' },
    { kind: 'deploy', who: 'Lucas Ferreira', body: (<><B>Lucas Ferreira</B> deployed <Mono>dashboard-web</Mono> to staging</>), extra: <Chips items={['v5.2.1', 'build #1907', '58s']} />, ago: '' },
  ]
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="rounded-md border bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground tabular-nums">
          {t}
        </span>
      ))}
    </div>
  )
}
function Quote({ children }: { children: ReactNode }) {
  return <blockquote className="mt-2 rounded-lg border-l-2 bg-muted/40 px-3 py-2 text-[13px] text-muted-foreground" style={{ borderColor: 'var(--acc)' }}>{children}</blockquote>
}
function Diff({ add, del }: { add: number; del: number }) {
  return (
    <div className="mt-2 flex items-center gap-2 text-[11px] tabular-nums">
      <span className="text-emerald-600 dark:text-emerald-400">+{add}</span>
      <span className="text-rose-600 dark:text-rose-400">−{del}</span>
      <span className="flex gap-px">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={cn('h-2 w-1.5 rounded-[1px]', i < Math.round((add / (add + del)) * 5) ? 'bg-emerald-500' : 'bg-rose-500')} />
        ))}
      </span>
    </div>
  )
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const AGO = ['just now', '4 min ago', '19 min ago', '48 min ago', '2 h ago', '3 h ago', '5 h ago', 'Yesterday']

function makeEvents(seed: number, count: number): Event[] {
  const rand = rng(seed * 59 + 1)
  const items = pool()
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items.slice(0, Math.max(3, Math.min(8, count))).map((e, i) => ({ ...e, ago: AGO[i] }))
}

function Avatar({ name }: { name: string }) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2)
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white" style={{ background: `linear-gradient(135deg, hsl(${h} 68% 56%), hsl(${(h + 48) % 360} 68% 42%))` }} aria-hidden>
      {initials}
    </span>
  )
}

const FILTERS: { id: 'all' | Group; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'code', label: 'Code' },
  { id: 'talk', label: 'Discussion' },
  { id: 'system', label: 'System' },
]
const GAP: Record<string, string> = { compact: 'pb-4', comfortable: 'pb-6', spacious: 'pb-8' }

/** 活动流：时间线或紧凑列表两种排法，按类别筛选，条目自上而下错峰进入。 */
export function DashboardActivityFeed({ className, style, ...props }: DashboardActivityFeedProps) {
  const { accent, layout, density, count, seed, title, live, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const events = useMemo(() => makeEvents(seed, count), [seed, count])
  const [filter, setFilter] = useState<'all' | Group>('all')
  const shown = events.filter((e) => filter === 'all' || GROUP[e.kind] === filter)
  const timeline = layout === 'timeline'

  return (
    <section className={cn('w-full rounded-xl border bg-card text-card-foreground shadow-sm', className)} style={{ ['--acc' as string]: accent, ...style }}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {live && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-emerald-500 opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          )}
        </div>
        <div className="flex gap-1" role="tablist" aria-label="Filter activity">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                filter === f.id ? 'bg-[color-mix(in_oklab,var(--acc)_16%,transparent)] text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <ol key={`${filter}${layout}`} className={cn('px-5 pt-5', !timeline && 'divide-y pt-1')}>
        {shown.map((e, i) => {
          const ic = ICON[e.kind]
          const last = i === shown.length - 1
          return (
            <motion.li
              key={`${e.kind}${e.who}${i}`}
              className={cn('relative flex gap-3.5', timeline ? (last ? 'pb-5' : GAP[density] ?? GAP.comfortable) : cn('py-4', density === 'compact' && 'py-3', density === 'spacious' && 'py-5'))}
              initial={run ? { opacity: 0, x: -10 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
            >
              {timeline && !last && (
                <motion.span
                  aria-hidden
                  className="absolute top-8 bottom-0 left-4 w-px -translate-x-1/2 bg-border"
                  style={{ transformOrigin: 'top' }}
                  initial={run ? { scaleY: 0 } : false}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.09 }}
                />
              )}
              {timeline ? (
                <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full border bg-card" style={{ color: ic.tone, boxShadow: `0 0 0 4px var(--card), inset 0 0 0 1px color-mix(in oklab, ${ic.tone} 30%, transparent)`, background: `color-mix(in oklab, ${ic.tone} 12%, var(--card))` }}>
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={ic.path} />
                  </svg>
                </span>
              ) : (
                <span className="relative block size-8 shrink-0">
                  <Avatar name={e.who} />
                  <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full border-2 border-card" style={{ background: ic.tone, color: '#0b0b10' }}>
                    <svg viewBox="0 0 24 24" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={ic.path} />
                    </svg>
                  </span>
                </span>
              )}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-6 text-muted-foreground">{e.body}</p>
                  <time className="shrink-0 pt-0.5 text-xs whitespace-nowrap text-muted-foreground/80">{e.ago}</time>
                </div>
                {e.extra}
              </div>
            </motion.li>
          )
        })}
        {shown.length === 0 && <li className="py-10 text-center text-sm text-muted-foreground">Nothing here yet.</li>}
      </ol>
    </section>
  )
}
