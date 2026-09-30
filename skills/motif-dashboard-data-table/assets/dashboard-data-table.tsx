// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/tables/table-01.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  badge: 'soft',
  density: 'comfortable',
  rows: 7,
  seed: 4,
  title: 'Recent invoices',
  subtitle: 'Payments across every workspace, newest first.',
  showAvatars: true,
  animate: true,
}
/* @motif:end */

export type DashboardDataTableProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

type Status = 'Paid' | 'Pending' | 'Failed' | 'Refunded'
type Row = { id: string; name: string; email: string; status: Status; plan: string; amount: number; date: number }

const NAMES = [
  'Amara Osei', 'Lucas Ferreira', 'Mika Tanaka', 'Priya Raman', 'Noah Lindqvist', 'Sofia Marchetti', 'Ibrahim Yusuf', 'Chloe Beaumont',
  'Tomas Novak', 'Yara Haddad', 'Elias Berg', 'Nia Thompson', 'Kenji Watanabe', 'Isla McAllister', 'Rafael Duarte', 'Anya Petrova',
  'Omar Khalil', 'Hana Kowalski', 'Mateo Vargas', 'Freya Nilsen',
]
const DOMAINS = ['northwind.dev', 'lattice.so', 'brightloop.io', 'fjord.studio', 'tallypay.co', 'oakhouse.app']
const PLANS = [
  { name: 'Starter', price: 29 },
  { name: 'Team', price: 79 },
  { name: 'Scale', price: 249 },
]
const STATUS_STYLE: Record<Status, { soft: string; dot: string; outline: string }> = {
  Paid: { soft: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', outline: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400' },
  Pending: { soft: 'bg-amber-500/12 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', outline: 'border-amber-500/40 text-amber-600 dark:text-amber-400' },
  Failed: { soft: 'bg-rose-500/12 text-rose-600 dark:text-rose-400', dot: 'bg-rose-500', outline: 'border-rose-500/40 text-rose-600 dark:text-rose-400' },
  Refunded: { soft: 'bg-sky-500/12 text-sky-600 dark:text-sky-400', dot: 'bg-sky-500', outline: 'border-sky-500/40 text-sky-600 dark:text-sky-400' },
}
const ANCHOR = Date.UTC(2026, 8, 28)

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

function makeRows(seed: number, count: number): Row[] {
  const rand = rng(seed * 313 + 9)
  const pool = [...NAMES]
  const rows: Row[] = []
  for (let i = 0; i < count; i++) {
    const name = pool.splice(Math.floor(rand() * pool.length), 1)[0]
    const plan = PLANS[Math.floor(rand() * PLANS.length)]
    const r = rand()
    const status: Status = r < 0.55 ? 'Paid' : r < 0.75 ? 'Pending' : r < 0.87 ? 'Failed' : 'Refunded'
    const seats = 1 + Math.floor(rand() * 4)
    const handle = name.toLowerCase().replace(/[^a-z]+/g, '.')
    rows.push({
      id: `INV-${String(2841 - i * 3 - Math.floor(rand() * 3)).padStart(4, '0')}`,
      name,
      email: `${handle}@${DOMAINS[Math.floor(rand() * DOMAINS.length)]}`,
      status,
      plan: plan.name,
      amount: plan.price * seats + (rand() < 0.4 ? Math.round(rand() * 900) / 100 : 0),
      date: ANCHOR - (i * 0.9 + rand() * 0.8) * 86400000,
    })
  }
  return rows
}

function Avatar({ name, className }: { name: string; className?: string }) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
  return (
    <span
      className={cn('grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white', className)}
      style={{ background: `linear-gradient(135deg, hsl(${h} 68% 56%), hsl(${(h + 48) % 360} 68% 42%))` }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

const money = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtDate = (t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

const FILTERS = ['All', 'Paid', 'Pending', 'Failed'] as const
type SortKey = 'date' | 'amount'
const CELL: Record<string, string> = { compact: 'px-4 py-2', comfortable: 'px-4 py-3', spacious: 'px-5 py-4' }

function Sort({ dir }: { dir: 'asc' | 'desc' | null }) {
  return (
    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 4.5 6 2l2.5 2.5" opacity={dir === 'desc' ? 0.3 : 1} />
      <path d="M3.5 7.5 6 10l2.5-2.5" opacity={dir === 'asc' ? 0.3 : 1} />
    </svg>
  )
}

/** 带状态徽章、筛选、搜索与排序的数据表；行进入时错峰淡入。 */
export function DashboardDataTable({ className, style, ...props }: DashboardDataTableProps) {
  const { accent, density, badge, rows: rowCount, seed, title, subtitle, showAvatars, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const all = useMemo(() => makeRows(seed, Math.max(4, Math.min(12, rowCount))), [seed, rowCount])
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'date', dir: 'desc' })

  const counts = (f: string) => (f === 'All' ? all.length : all.filter((r) => r.status === f).length)
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = all.filter((r) => (filter === 'All' || r.status === filter) && (!q || r.name.toLowerCase().includes(q) || r.email.includes(q) || r.id.toLowerCase().includes(q)))
    return [...list].sort((a, b) => (sort.dir === 'asc' ? 1 : -1) * (a[sort.key] - b[sort.key]))
  }, [all, filter, query, sort])

  const toggle = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))
  const cell = CELL[density] ?? CELL.comfortable

  return (
    <section className={cn('w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm', className)} style={{ ['--acc' as string]: accent, ...style }}>
      <header className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <label className="relative block sm:w-56">
          <span className="sr-only">Search invoices</span>
          <svg viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
            <circle cx="7" cy="7" r="4.5" />
            <path d="m10.5 10.5 3 3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer or ID"
            className="h-9 w-full rounded-lg border bg-background/60 pr-3 pl-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-[color-mix(in_oklab,var(--acc)_60%,var(--border))] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--acc)_30%,transparent)]"
          />
        </label>
      </header>

      <div className="flex gap-1 overflow-x-auto border-y bg-muted/30 px-3 py-2" role="tablist" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
              filter === f ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
            <span className={cn('rounded px-1 text-[10px] tabular-nums', filter === f ? 'bg-[color-mix(in_oklab,var(--acc)_18%,transparent)] text-foreground' : 'bg-muted text-muted-foreground')}>{counts(f)}</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className={cn('font-medium', cell)}>Customer</th>
              <th className={cn('font-medium', cell)}>Status</th>
              <th className={cn('hidden font-medium md:table-cell', cell)}>Plan</th>
              <th className={cn('font-medium', cell)}>
                <button type="button" onClick={() => toggle('amount')} className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
                  Amount <Sort dir={sort.key === 'amount' ? sort.dir : null} />
                </button>
              </th>
              <th className={cn('hidden font-medium sm:table-cell', cell)}>
                <button type="button" onClick={() => toggle('date')} className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
                  Date <Sort dir={sort.key === 'date' ? sort.dir : null} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody key={`${filter}${sort.key}${sort.dir}${query}`} className="divide-y">
            {visible.map((row, i) => (
              <motion.tr
                key={row.id}
                className="transition-colors hover:bg-muted/40"
                initial={run ? { opacity: 0, y: 6 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
              >
                <td className={cell}>
                  <div className="flex items-center gap-3">
                    {showAvatars && <Avatar name={row.name} />}
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className={cell}>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                      badge === 'outline' ? `border ${STATUS_STYLE[row.status].outline}` : badge === 'dot' ? 'text-foreground' : STATUS_STYLE[row.status].soft,
                    )}
                  >
                    {(badge === 'dot' || badge === 'soft') && <span className={cn('size-1.5 rounded-full', STATUS_STYLE[row.status].dot)} />}
                    {row.status}
                  </span>
                </td>
                <td className={cn('hidden text-muted-foreground md:table-cell', cell)}>{row.plan}</td>
                <td className={cn('font-medium tabular-nums', cell)}>{money(row.amount)}</td>
                <td className={cn('hidden text-muted-foreground tabular-nums sm:table-cell', cell)}>{fmtDate(row.date)}</td>
              </motion.tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No invoices match “{query || filter}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
        <span className="tabular-nums">
          Showing {visible.length} of {all.length} invoices
        </span>
        <span className="tabular-nums">Total {money(visible.reduce((a, r) => a + r.amount, 0))}</span>
      </footer>
    </section>
  )
}
