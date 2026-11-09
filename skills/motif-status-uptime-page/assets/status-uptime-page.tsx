// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/status-monitoring/tracker-08.tsx
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/status-monitoring/tracker-04.tsx
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/status-monitoring/tracker-05.tsx
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/status-monitoring/tracker-07.tsx
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/status-monitoring/tracker-06.tsx
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/status-monitoring/tracker-03.tsx
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/components/Tracker.tsx
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/components/Accordion.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'services',
  services: 3,
  days: 90,
  okColor: '#10b981',
  degradedColor: '#f59e0b',
  downColor: '#ef4444',
  tone: 'dark',
  blockGap: 2,
  blockRadius: 1,
}
/* @motif:end */

export type StatusUptimePageProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 强制打开某一格的悬浮卡（演示自动播放用）：[第几行, 几天前]；null 表示不强制。 */
  highlight?: readonly [number, number] | null
}

type Status = 'ok' | 'degraded' | 'down' | 'maintenance' | 'none'
type Incident = { ago: number; status: 'degraded' | 'down' | 'maintenance'; minutes: number; note: string }
type Monitor = {
  name: string
  incidents: Incident[]
  /** [从几天前, 到几天前] 这段时间没有数据（服务还没接入 / 任务还没排期）。 */
  unmeasured?: [number, number]
}
type Pipeline = Monitor & {
  region: string
  destination: string
  lastRun: string
  state: 'running' | 'idle' | 'retrying'
  next: string
}
type Day = { ago: number; date: string; status: Status; incident?: Incident }
type Variant = 'services' | 'pipeline'

const WINDOW = 90

const LABELS: Record<Variant, Record<Status, string>> = {
  services: { ok: 'Operational', degraded: 'Degraded', down: 'Downtime', maintenance: 'Maintenance', none: 'Not measured' },
  pipeline: { ok: 'Synced', degraded: 'Partial sync', down: 'Failed', maintenance: 'Paused', none: 'Not scheduled' },
}

const SERVICES: Monitor[] = [
  {
    name: 'Halyard API',
    incidents: [
      { ago: 76, status: 'down', minutes: 4, note: 'Certificate renewal hiccup' },
      { ago: 71, status: 'down', minutes: 9, note: 'Upstream storage outage' },
      { ago: 45, status: 'down', minutes: 3, note: 'DNS propagation delay' },
      { ago: 33, status: 'down', minutes: 22, note: 'Bad deploy, rolled back' },
      { ago: 22, status: 'degraded', minutes: 18, note: 'Slow token refresh' },
      { ago: 9, status: 'degraded', minutes: 42, note: 'Search queries timing out' },
      { ago: 5, status: 'down', minutes: 6, note: 'Connection pool exhausted' },
      { ago: 3, status: 'down', minutes: 14, note: 'Elevated 5xx on writes' },
    ],
  },
  {
    name: 'Dashboard',
    unmeasured: [59, 57],
    incidents: [
      { ago: 71, status: 'maintenance', minutes: 30, note: 'Scheduled database upgrade' },
      { ago: 16, status: 'down', minutes: 26, note: 'Login loop after session migration' },
      { ago: 15, status: 'down', minutes: 8, note: 'Stale assets after CDN purge' },
      { ago: 2, status: 'degraded', minutes: 35, note: 'Charts loading slowly' },
    ],
  },
  {
    name: 'Webhooks',
    incidents: [
      { ago: 64, status: 'degraded', minutes: 20, note: 'Delivery retries backed up' },
      { ago: 27, status: 'down', minutes: 11, note: 'Queue consumer crashed' },
      { ago: 1, status: 'degraded', minutes: 51, note: 'Deliveries delayed up to 4 min' },
    ],
  },
  {
    name: 'Data export',
    incidents: [
      { ago: 40, status: 'down', minutes: 31, note: 'Export workers out of memory' },
      { ago: 12, status: 'maintenance', minutes: 45, note: 'Storage migration' },
      { ago: 7, status: 'degraded', minutes: 16, note: 'CSV exports queued' },
    ],
  },
]

const PIPELINES: Pipeline[] = [
  {
    name: 'Warehouse sync',
    region: 'US-East 1',
    destination: 'Lakehouse',
    lastRun: '27/12/23 01:00',
    state: 'running',
    next: 'Next run: 1 hour and 2 minutes',
    unmeasured: [89, 70],
    incidents: [
      { ago: 61, status: 'degraded', minutes: 12, note: '2 of 14 tables skipped' },
      { ago: 52, status: 'down', minutes: 3, note: 'Source API rate limited' },
      { ago: 44, status: 'degraded', minutes: 19, note: 'Schema drift on orders' },
      { ago: 18, status: 'degraded', minutes: 15, note: '1 of 14 tables skipped' },
      { ago: 9, status: 'degraded', minutes: 22, note: 'Late-arriving events' },
      { ago: 4, status: 'down', minutes: 6, note: 'Warehouse credentials expired' },
      { ago: 3, status: 'degraded', minutes: 13, note: 'Backfill throttled' },
    ],
  },
  {
    name: 'CRM contacts import',
    region: 'EU-West 1',
    destination: 'Warehouse',
    lastRun: '27/12/23 00:30',
    state: 'idle',
    next: 'Next run: in 23 hours',
    incidents: [
      { ago: 41, status: 'maintenance', minutes: 60, note: 'Paused for a schema change' },
      { ago: 26, status: 'down', minutes: 1, note: 'OAuth token revoked' },
      { ago: 11, status: 'degraded', minutes: 9, note: '312 rows rejected' },
    ],
  },
  {
    name: 'Billing export',
    region: 'US-West 2',
    destination: 'Object storage',
    lastRun: '27/12/23 02:10',
    state: 'retrying',
    next: 'Retrying in 4 minutes',
    incidents: [
      { ago: 33, status: 'down', minutes: 8, note: 'Invoice table locked' },
      { ago: 15, status: 'down', minutes: 2, note: 'Bucket quota reached' },
      { ago: 0, status: 'degraded', minutes: 7, note: '1 of 3 files written' },
    ],
  },
  {
    name: 'Search reindex',
    region: 'AP-South 1',
    destination: 'Search cluster',
    lastRun: '26/12/23 22:00',
    state: 'idle',
    next: 'Next run: in 19 hours',
    unmeasured: [89, 50],
    incidents: [
      { ago: 30, status: 'degraded', minutes: 41, note: 'Index swap took 3 retries' },
      { ago: 8, status: 'down', minutes: 5, note: 'Cluster out of disk' },
    ],
  },
]

// 上游的数据是 2023-09-29 到 2023-12-27 的 90 天；这里按「几天前」生成同一段日期。
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const TODAY = Date.UTC(2023, 11, 27)

function dateOf(ago: number): string {
  const d = new Date(TODAY - ago * 86_400_000)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${d.getUTCFullYear()}`
}

function timeline(monitor: Monitor): Day[] {
  const days: Day[] = []
  for (let ago = WINDOW - 1; ago >= 0; ago--) {
    const incident = monitor.incidents.find((item) => item.ago === ago)
    const [from, to] = monitor.unmeasured ?? [-1, -1]
    const status: Status = incident ? incident.status : ago <= from && ago >= to ? 'none' : 'ok'
    days.push({ ago, date: dateOf(ago), status, incident })
  }
  return days
}

const SERVICE_DAYS = SERVICES.map(timeline)
const PIPELINE_DAYS = PIPELINES.map(timeline)

/** 演示自动播放要经过的格子：最近 30 天里的事件（手机宽度也看得到），按时间从旧到新，从第一行开始。 */
export function autoplayDays(variant: string, rows: number): [number, number][] {
  const monitors = variant === 'pipeline' ? PIPELINES : SERVICES
  const list = monitors
    .slice(0, rows)
    .flatMap((monitor, row) => monitor.incidents.filter((item) => item.ago < 30).map((item): [number, number] => [row, item.ago]))
    .sort((a, b) => b[1] - a[1])
  const start = Math.max(0, list.findIndex(([row]) => row === 0))
  return [...list.slice(start), ...list.slice(0, start)]
}

function uptime(days: Day[]): string {
  const measured = days.filter((day) => day.status !== 'none').length
  const down = days.reduce((sum, day) => sum + (day.status === 'down' ? (day.incident?.minutes ?? 0) : 0), 0)
  return measured === 0 ? '100.00' : (100 - (down / (measured * 1440)) * 100).toFixed(2)
}

function duration(variant: Variant, incident: Incident): string {
  const m = `${incident.minutes} min`
  if (variant === 'pipeline') return incident.status === 'down' ? `Failed after ${m}` : incident.status === 'degraded' ? `Partial, ${m} run` : `Paused for ${m}`
  return incident.status === 'down' ? `Down for ${m}` : incident.status === 'degraded' ? `Degraded for ${m}` : `Maintenance, ${m}`
}

/** 图标里的白色 / 黑色笔画按状态色的亮度挑，任何颜色参数下都看得清。 */
function inkOn(hex: string): string {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.6 ? '#0b0f19' : '#ffffff'
}

function palette(o: typeof defaults): CSSProperties {
  const dark = o.tone !== 'light'
  // Tremor 的 gray 色阶：浅色 gray-50…900，深色以 #090E1A 为卡片底；深色的次要文字用 gray-400 保证对比度。
  return cssVars({
    '--sp-bg': dark ? '#030712' : '#f9fafb',
    '--sp-card': dark ? '#090E1A' : '#ffffff',
    '--sp-card-ln': dark ? '#111827' : '#e5e7eb',
    '--sp-ln': dark ? '#1f2937' : '#e5e7eb',
    '--sp-fg': dark ? '#f9fafb' : '#111827',
    '--sp-fg2': dark ? '#d1d5db' : '#374151',
    '--sp-mu': dark ? '#9ca3af' : '#6b7280',
    '--sp-icon': dark ? '#4b5563' : '#9ca3af',
    '--sp-chip': dark ? '#1f2937' : '#f3f4f6',
    '--sp-chip-fg': dark ? '#d1d5db' : '#4b5563',
    '--sp-link': dark ? '#60a5fa' : '#2563eb',
    '--sp-ok': o.okColor,
    '--sp-degraded': o.degradedColor,
    '--sp-down': o.downColor,
    '--sp-maintenance': '#6b7280',
    '--sp-none': dark ? '#374151' : '#d1d5db',
    '--sp-ok-ink': inkOn(o.okColor),
    '--sp-degraded-ink': inkOn(o.degradedColor),
    '--sp-down-ink': inkOn(o.downColor),
    '--sp-maintenance-ink': '#ffffff',
    '--sp-gap': `${o.blockGap}px`,
    '--sp-r': `${o.blockRadius}px`,
  })
}

// ---- icons（替代 @remixicon/react，手绘）----

function StatusIcon({ status, className }: { status: Status; className?: string }) {
  const fill = `var(--sp-${status})`
  const ink = `var(--sp-${status}-ink)`
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {status === 'none' ? (
        <circle cx="12" cy="12" r="8.5" fill="none" stroke={fill} strokeWidth="2" strokeDasharray="3 2.6" />
      ) : status === 'degraded' ? (
        <>
          <path d="M10.27 3.5a2 2 0 0 1 3.46 0l8.1 14.03A2 2 0 0 1 20.1 20.5H3.9a2 2 0 0 1-1.73-2.97z" fill={fill} />
          <path d="M12 9v4.6" stroke={ink} strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1.15" fill={ink} />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10" fill={fill} />
          {status === 'ok' && <path d="m7.6 12.3 3 3 5.8-6.2" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
          {status === 'down' && (
            <>
              <path d="M12 6.8v6" stroke={ink} strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16.6" r="1.2" fill={ink} />
            </>
          )}
          {status === 'maintenance' && <path d="M9.6 8.4v7.2M14.4 8.4v7.2" stroke={ink} strokeWidth="2" strokeLinecap="round" />}
        </>
      )}
    </svg>
  )
}

function Glyph({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  )
}

const PIN = 'M12 2.5a7 7 0 0 0-7 7c0 5 7 12 7 12s7-7 7-12a7 7 0 0 0-7-7Zm0 9.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Z'
const CLOUD = 'M17.5 19.5H7a5 5 0 0 1-.9-9.92A6.5 6.5 0 0 1 18.6 8.6a5.5 5.5 0 0 1-1.1 10.9Z'
const CLOCK = 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.6V7h-2v6.4l4.3 2.6 1-1.7Z'

// ---- Card（上游 Card 组件，去掉了 Slot）----

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('relative w-full rounded-lg border border-(--sp-card-ln) bg-(--sp-card) p-6 text-left shadow-sm', className)}>{children}</div>
}

// ---- Tracker（替代 Tremor Tracker + @radix-ui/react-hover-card）----

function Tracker({
  data,
  labels,
  label,
  forcedAgo,
  className,
}: {
  data: Day[]
  labels: Record<Status, string>
  label: string
  forcedAgo: number | null
  className?: string
}) {
  const id = useId()
  const reduced = useReducedMotion()
  const [hover, setHover] = useState<number | null>(null)
  const [focusIndex, setFocusIndex] = useState(data.length - 1)
  const blocks = useRef<(HTMLButtonElement | null)[]>([])
  const forced = forcedAgo === null ? -1 : data.findIndex((day) => day.ago === forcedAgo)
  const active = hover ?? (forced >= 0 ? forced : null)
  const roving = Math.min(focusIndex, data.length - 1)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowLeft: roving - 1, ArrowRight: roving + 1, Home: 0, End: data.length - 1 }
    if (event.key === 'Escape') {
      setHover(null)
      return
    }
    if (!(event.key in keys)) return
    event.preventDefault()
    const next = Math.max(0, Math.min(data.length - 1, keys[event.key] ?? roving))
    setFocusIndex(next)
    blocks.current[next]?.focus()
  }

  const day = active === null ? null : data[active]

  return (
    <div
      role="group"
      aria-label={label}
      className={cn('group relative flex h-8 w-full items-center', className)}
      onPointerLeave={(event) => event.pointerType !== 'touch' && setHover(null)}
      onKeyDown={onKeyDown}
    >
      {data.map((item, index) => (
        <button
          key={item.ago}
          ref={(node) => {
            blocks.current[index] = node
          }}
          type="button"
          tabIndex={index === roving ? 0 : -1}
          aria-label={`${item.date}: ${labels[item.status]}`}
          aria-describedby={active === index ? `${id}-card` : undefined}
          onPointerEnter={() => setHover(index)}
          onClick={() => setHover(index)}
          onFocus={() => {
            setFocusIndex(index)
            setHover(index)
          }}
          onBlur={() => setHover(null)}
          className="relative size-full cursor-default overflow-hidden px-[calc(var(--sp-gap)/4)] transition first:rounded-l-[4px] first:pl-0 last:rounded-r-[4px] last:pr-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sp-fg) sm:px-[calc(var(--sp-gap)/2)]"
        >
          <span
            className={cn('block size-full rounded-(--sp-r) transition-opacity duration-100', active === index && 'opacity-50')}
            style={{ background: `var(--sp-${item.status})` }}
          />
        </button>
      ))}
      <AnimatePresence>
        {day !== null && active !== null && (
          <motion.div
            key="card"
            id={`${id}-card`}
            role="tooltip"
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="pointer-events-none absolute bottom-full z-20 mb-2.5 w-max min-w-44 max-w-52 rounded-lg border border-(--sp-card-ln) bg-(--sp-card) text-(--sp-fg) shadow-md"
            style={{ left: `clamp(104px, ${((active + 0.5) / data.length) * 100}%, calc(100% - 104px))`, x: '-50%' }}
          >
            <p className="flex items-center gap-2 px-3 py-2 text-sm font-medium">
              <StatusIcon status={day.status} className="size-5 shrink-0" />
              {labels[day.status]}
            </p>
            <div className="h-px w-full bg-(--sp-ln)" aria-hidden="true" />
            <p className="px-3 py-2 text-xs text-(--sp-mu)">{day.date}</p>
            {day.incident && (
              <p className="-mt-1 px-3 pb-2 text-xs text-(--sp-fg2)">
                {day.incident.note} · {day.incident.minutes} min
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** 上游每条都渲染三份 Tracker，分别在 lg / sm / 手机宽度显示最近 90 / 60 / 30 天。 */
function Strip({ data, days, labels, name, forcedAgo, first }: { data: Day[]; days: number; labels: Record<Status, string>; name: string; forcedAgo: number | null; first: string }) {
  const lg = days
  const sm = Math.min(days, 60)
  const xs = Math.min(days, 30)
  return (
    <>
      <Tracker data={data.slice(WINDOW - lg)} labels={labels} label={`${name}, last ${lg} days`} forcedAgo={forcedAgo} className={cn(first, 'hidden w-full lg:flex')} />
      <Tracker data={data.slice(WINDOW - sm)} labels={labels} label={`${name}, last ${sm} days`} forcedAgo={forcedAgo} className={cn(first, 'hidden w-full sm:flex lg:hidden')} />
      <Tracker data={data.slice(WINDOW - xs)} labels={labels} label={`${name}, last ${xs} days`} forcedAgo={forcedAgo} className={cn(first, 'flex w-full sm:hidden')} />
      <div className="mt-3 flex items-center justify-between text-sm text-(--sp-mu)">
        <span className="hidden lg:block">{lg} days ago</span>
        <span className="hidden sm:block lg:hidden">{sm} days ago</span>
        <span className="sm:hidden">{xs} days ago</span>
        <span>Today</span>
      </div>
    </>
  )
}

// ---- legend（tracker-04）与可折叠的故障记录（tracker-05 + Tremor Accordion）----

function Legend({ labels }: { labels: Record<Status, string> }) {
  const shown: Status[] = ['ok', 'degraded', 'down', 'maintenance']
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Legend">
      {shown.map((status) => (
        <span key={status} className="inline-flex items-center gap-x-2 rounded-md bg-(--sp-chip) px-2 py-0.5 text-sm text-(--sp-chip-fg)">
          <span className="size-2 rounded-full" style={{ background: `var(--sp-${status})` }} aria-hidden="true" />
          {labels[status]}
        </span>
      ))}
    </div>
  )
}

function History({ title, rows, variant }: { title: string; rows: { name: string; incident: Incident }[]; variant: Variant }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const reduced = useReducedMotion()
  return (
    <div className="overflow-hidden rounded-md border border-(--sp-ln) px-4">
      <h3 className="flex">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          data-state={open ? 'open' : 'closed'}
          onClick={() => setOpen((value) => !value)}
          className="group flex flex-1 cursor-pointer items-center justify-between py-3 text-left text-sm font-medium leading-none text-(--sp-fg) focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--sp-link) focus-visible:ring-inset"
        >
          {title} ({rows.length})
          <svg
            viewBox="0 0 24 24"
            className="size-5 shrink-0 text-(--sp-icon) transition-transform duration-150 ease-[cubic-bezier(0.87,0,0.13,1)] group-data-[state=open]:-rotate-45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            id={id}
            role="region"
            aria-label={title}
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: [0.87, 0, 0.13, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm">
              <ul role="list" className="mt-2 w-full divide-y divide-(--sp-ln) text-sm text-(--sp-mu)">
                {rows.map(({ name, incident }) => (
                  <li key={`${name}-${incident.ago}`} className="flex w-full items-center justify-between gap-3 py-2">
                    <span className="min-w-0">
                      <span className="block sm:inline">{dateOf(incident.ago)}</span>
                      <span className="text-xs text-(--sp-fg2) sm:ml-2 sm:text-sm">{name}</span>
                    </span>
                    <span className="shrink-0 text-right">{duration(variant, incident)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function historyRows(monitors: Monitor[], days: number, statuses: Status[]) {
  return monitors
    .flatMap((monitor) => monitor.incidents.filter((item) => item.ago < days && statuses.includes(item.status)).map((incident) => ({ name: monitor.name, incident })))
    .sort((a, b) => b.incident.ago - a.incident.ago)
}

// ---- 主体 ----

export function StatusUptimePage({ className, style, highlight = null, ...props }: StatusUptimePageProps) {
  const o = { ...defaults, ...props }
  const variant: Variant = o.variant === 'pipeline' ? 'pipeline' : 'services'
  const rows = Math.max(1, Math.min(4, Math.round(o.services)))
  const days = Math.max(30, Math.min(WINDOW, Math.round(o.days / 30) * 30))
  const labels = LABELS[variant]
  const forcedFor = (row: number) => (highlight && highlight[0] === row ? highlight[1] : null)

  return (
    <section
      className={cn('w-full bg-(--sp-bg) px-4 py-12 text-(--sp-fg) sm:px-6 sm:py-16', className)}
      style={{ ...palette(o), fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style }}
    >
      <div className="mx-auto w-full max-w-3xl">
        {variant === 'services' ? <ServicesView rows={rows} days={days} labels={labels} forcedFor={forcedFor} /> : <PipelineView rows={rows} days={days} labels={labels} forcedFor={forcedFor} />}
      </div>
    </section>
  )
}

type ViewProps = { rows: number; days: number; labels: Record<Status, string>; forcedFor: (row: number) => number | null }

/** tracker-08：居中的「所有服务在线」+ 每个服务一条可用性色块；图例和故障记录取自 tracker-04 / 05。 */
function ServicesView({ rows, days, labels, forcedFor }: ViewProps) {
  const monitors = SERVICES.slice(0, rows)
  return (
    <>
      <div className="flex flex-col items-center text-center">
        <span className="mx-auto inline-flex items-center justify-center rounded-full p-1" style={{ background: 'color-mix(in srgb, var(--sp-ok) 18%, transparent)' }}>
          <StatusIcon status="ok" className="size-10" />
        </span>
        <h1 className="mt-3 text-lg font-semibold text-(--sp-fg)">All services are online</h1>
        <p className="text-sm text-(--sp-fg2)">Last updated on Dec 27 at 01:05am PST</p>
      </div>
      <Card className="mt-10 space-y-6">
        {monitors.map((monitor, row) => {
          const data = SERVICE_DAYS[row] ?? []
          return (
            <div key={monitor.name} className="space-y-6">
              {row > 0 && <div className="h-px w-full bg-(--sp-ln)" aria-hidden="true" />}
              <div>
                <p className="flex justify-between gap-3 text-sm font-medium">
                  <span className="flex min-w-0 items-center gap-2 font-medium">
                    <StatusIcon status={data[WINDOW - 1]?.status ?? 'ok'} className="size-5 shrink-0" />
                    <span className="truncate text-(--sp-fg)">{monitor.name}</span>
                  </span>
                  <span className="shrink-0 text-(--sp-fg)">{uptime(data.slice(WINDOW - days))}% uptime</span>
                </p>
                <Strip data={data} days={days} labels={labels} name={monitor.name} forcedAgo={forcedFor(row)} first="mt-3" />
              </div>
            </div>
          )
        })}
        <Legend labels={labels} />
        <History title="Downtime overview" rows={historyRows(monitors, days, ['down', 'degraded', 'maintenance'])} variant="services" />
      </Card>
    </>
  )
}

const STATE: Record<Pipeline['state'], { label: string; status: Status; pulse: boolean }> = {
  running: { label: 'Running', status: 'ok', pulse: true },
  retrying: { label: 'Retrying', status: 'degraded', pulse: true },
  idle: { label: 'Idle', status: 'maintenance', pulse: false },
}

/** tracker-07 的标题 + 每个同步任务一张 tracker-06 卡片，底部是 tracker-03 的运行状态。 */
function PipelineView({ rows, days, labels, forcedFor }: ViewProps) {
  const monitors = PIPELINES.slice(0, rows)
  return (
    <>
      <h1 className="text-lg font-semibold text-(--sp-fg)">Pipeline status</h1>
      <p className="text-sm text-(--sp-fg2)">Last updated on Dec 27 at 03:12am PST</p>
      <div className="mt-6 space-y-4">
        {monitors.map((pipeline, row) => {
          const data = PIPELINE_DAYS[row] ?? []
          const last = data[WINDOW - 1]?.status ?? 'ok'
          const state = STATE[pipeline.state]
          return (
            <Card key={pipeline.name}>
              <div className="flex space-x-3">
                <span className="w-1 shrink-0 rounded" style={{ background: `var(--sp-${last})` }} aria-hidden="true" />
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <StatusIcon status={last} className="size-5 shrink-0" />
                    <span className="text-sm font-medium text-(--sp-fg)">{labels[last]}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-(--sp-fg)">{pipeline.name}</h3>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {[
                      { icon: PIN, text: pipeline.region },
                      { icon: CLOUD, text: pipeline.destination },
                      { icon: CLOCK, text: `Last run: ${pipeline.lastRun}` },
                    ].map((chip) => (
                      <span key={chip.text} className="inline-flex items-center gap-1.5 rounded-md bg-(--sp-chip) px-2.5 py-1 text-xs font-medium text-(--sp-chip-fg)">
                        <Glyph d={chip.icon} className="-ml-0.5 size-4 shrink-0" />
                        {chip.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Strip data={data} days={days} labels={labels} name={pipeline.name} forcedAgo={forcedFor(row)} first="mt-6" />
              <div className="mt-6 items-center justify-between gap-4 sm:flex">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn('shrink-0 rounded-full p-1', state.pulse && 'animate-pulse motion-reduce:animate-none')}
                      style={{ background: `color-mix(in srgb, var(--sp-${state.status}) 30%, transparent)` }}
                      aria-hidden="true"
                    >
                      <span className="block size-2 rounded-full" style={{ background: `var(--sp-${state.status})` }} />
                    </span>
                    <span className="text-sm font-medium text-(--sp-fg)">{state.label}</span>
                  </div>
                  <span className="text-sm text-(--sp-mu)">/</span>
                  <span className="truncate text-sm text-(--sp-fg2)">{pipeline.next}</span>
                </div>
                <button type="button" className="mt-4 block shrink-0 rounded-sm text-sm font-medium text-(--sp-link) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sp-link) sm:mt-0">
                  View more &#8594;
                </button>
              </div>
            </Card>
          )
        })}
      </div>
      <div className="mt-6 space-y-6">
        <Legend labels={labels} />
        <History title="Failed and partial runs" rows={historyRows(monitors, days, ['down', 'degraded'])} variant="pipeline" />
      </div>
    </>
  )
}
