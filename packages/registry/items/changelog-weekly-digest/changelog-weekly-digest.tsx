import { cn, useFrameLoop } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#b4f05a',
  filterStyle: 'segmented',
  radius: 10,
  density: 'cozy',
  weeks: 4,
  showAuthors: true,
  collapseMinor: true,
  heading: 'Shipped, week by week',
}
/* @motif:end */

export type ChangeType = 'new' | 'improved' | 'fixed'
export type ChangeFilter = 'all' | ChangeType

export type ChangelogWeeklyDigestProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控的类型筛选；不传时组件自己管理。 */
  filter?: ChangeFilter
  onFilterChange?: (filter: ChangeFilter) => void
  /** 受控的「小修复」展开状态，键是周 id（如 w45）。 */
  expanded?: Record<string, boolean>
  onExpandedChange?: (weekId: string, open: boolean) => void
}

type Change = { type: ChangeType; text: string; area: string; day: string; by: string }
type Minor = { text: string; area: string; by: string }
type Week = { id: string; code: string; range: string; current?: boolean; changes: Change[]; minor: Minor[] }

const PEOPLE: Record<string, { name: string; hue: number }> = {
  MK: { name: 'Maya Kowalski', hue: 25 },
  AR: { name: 'Amir Rahimi', hue: 262 },
  JL: { name: 'June Lindqvist', hue: 165 },
  TS: { name: 'Tomás Sierra', hue: 318 },
  PN: { name: 'Priya Nair', hue: 75 },
  DO: { name: 'Dara Okafor', hue: 215 },
}

const WEEKS: Week[] = [
  {
    id: 'w45',
    code: 'W45',
    range: 'Nov 2 – 8',
    current: true,
    changes: [
      { type: 'new', text: 'Snooze a notification until a time, a date or the next status change', area: 'Inbox', day: 'Fri', by: 'MK' },
      { type: 'new', text: 'Command palette now searches every workspace you belong to', area: 'Search', day: 'Thu', by: 'AR' },
      { type: 'improved', text: 'Tables pasted from a spreadsheet keep their column widths', area: 'Editor', day: 'Thu', by: 'JL' },
      { type: 'improved', text: 'Offline edits merge line by line instead of last write wins', area: 'Sync', day: 'Wed', by: 'TS' },
      { type: 'improved', text: 'List endpoints accept cursor and limit on every resource', area: 'API', day: 'Tue', by: 'AR' },
      { type: 'fixed', text: 'Annual plans no longer show a monthly price on invoice PDFs', area: 'Billing', day: 'Tue', by: 'PN' },
      { type: 'fixed', text: 'Push notifications open the right thread after a cold start', area: 'Mobile', day: 'Mon', by: 'DO' },
    ],
    minor: [
      { text: 'Emoji picker remembers your skin tone between sessions', area: 'Editor', by: 'JL' },
      { text: 'CSV export escapes line breaks inside cells', area: 'Export', by: 'PN' },
      { text: 'Sidebar collapse tooltip no longer flickers on hover', area: 'UI', by: 'MK' },
      { text: 'Code blocks no longer flash white while dark mode loads', area: 'Editor', by: 'JL' },
      { text: 'Date picker starts weeks on Monday for en-GB', area: 'Dates', by: 'DO' },
      { text: 'Opening an archived project from search no longer 404s', area: 'Search', by: 'AR' },
      { text: 'Focus returns to the list after closing a dialog', area: 'A11y', by: 'MK' },
      { text: 'Long project names truncate in the share sheet', area: 'Mobile', by: 'DO' },
      { text: 'Webhook retries keep the original delivery ID', area: 'API', by: 'TS' },
    ],
  },
  {
    id: 'w44',
    code: 'W44',
    range: 'Oct 26 – Nov 1',
    changes: [
      { type: 'new', text: 'Webhooks for comment.created and comment.resolved', area: 'API', day: 'Thu', by: 'AR' },
      { type: 'new', text: 'Recurring issues that repeat daily, weekly or monthly', area: 'Projects', day: 'Wed', by: 'MK' },
      { type: 'improved', text: 'Search is 3× faster in workspaces with over 100k issues', area: 'Search', day: 'Tue', by: 'TS' },
      { type: 'improved', text: 'Guests can be limited to a single project', area: 'Access', day: 'Mon', by: 'PN' },
      { type: 'fixed', text: 'Undo after drag and drop restores the original order', area: 'Editor', day: 'Mon', by: 'JL' },
    ],
    minor: [
      { text: 'Unread count updates after marking a thread done on another device', area: 'Inbox', by: 'MK' },
      { text: 'Seat count on the receipt matches the plan page', area: 'Billing', by: 'PN' },
      { text: 'Checklist items keep their indentation when moved', area: 'Editor', by: 'JL' },
      { text: 'Pull to refresh no longer jumps to the top of the list', area: 'Mobile', by: 'DO' },
      { text: 'Avatar menu closes when you press Escape', area: 'UI', by: 'MK' },
      { text: 'Error responses include the request ID header', area: 'API', by: 'AR' },
      { text: 'Presence dots clear when a teammate closes the tab', area: 'Sync', by: 'TS' },
    ],
  },
  {
    id: 'w43',
    code: 'W43',
    range: 'Oct 19 – 25',
    changes: [
      { type: 'new', text: 'Embed a live burndown chart with /burndown', area: 'Editor', day: 'Thu', by: 'JL' },
      { type: 'new', text: 'Home screen widget for the issues assigned to you', area: 'Mobile', day: 'Wed', by: 'DO' },
      { type: 'improved', text: 'Bulk archive by sender or by project', area: 'Inbox', day: 'Tue', by: 'PN' },
      { type: 'improved', text: 'Haptics on swipe actions can be turned off', area: 'Mobile', day: 'Tue', by: 'DO' },
      { type: 'fixed', text: 'Duplicate comments after reconnecting on a slow network', area: 'Sync', day: 'Mon', by: 'TS' },
      { type: 'fixed', text: 'Rate limit headers report the correct reset time', area: 'API', day: 'Mon', by: 'AR' },
    ],
    minor: [
      { text: 'Pasting a link over selected text keeps the selection', area: 'Editor', by: 'JL' },
      { text: 'Filters containing an apostrophe return results again', area: 'Search', by: 'AR' },
      { text: 'Dropdowns stay inside the viewport on small screens', area: 'UI', by: 'MK' },
      { text: 'Tax ID field accepts lowercase country codes', area: 'Billing', by: 'PN' },
      { text: 'Cursor no longer jumps when a teammate edits the line above', area: 'Sync', by: 'TS' },
    ],
  },
  {
    id: 'w42',
    code: 'W42',
    range: 'Oct 12 – 18',
    changes: [
      { type: 'new', text: 'Usage-based seats with a monthly spending cap', area: 'Billing', day: 'Thu', by: 'PN' },
      { type: 'new', text: 'SCIM provisioning for workspace groups', area: 'Access', day: 'Wed', by: 'AR' },
      { type: 'improved', text: 'Markdown shortcuts for checklists and callouts', area: 'Editor', day: 'Tue', by: 'JL' },
      { type: 'improved', text: 'Collapsed board columns remember their state', area: 'Projects', day: 'Tue', by: 'MK' },
      { type: 'fixed', text: 'Removed members lose access to shared links immediately', area: 'Access', day: 'Mon', by: 'AR' },
    ],
    minor: [
      { text: 'PDF export keeps page breaks before headings', area: 'Export', by: 'PN' },
      { text: 'Keyboard no longer covers the comment box on small phones', area: 'Mobile', by: 'DO' },
      { text: 'Tooltips respect the reduced motion setting', area: 'UI', by: 'MK' },
      { text: 'Recent searches clear when you sign out', area: 'Search', by: 'TS' },
    ],
  },
]

const FILTERS: ChangeFilter[] = ['all', 'new', 'improved', 'fixed']
const LABEL: Record<ChangeFilter, string> = { all: 'All', new: 'New', improved: 'Improved', fixed: 'Fixed' }
const EMPTY: Record<ChangeType, string> = { new: 'No new features this week.', improved: 'No improvements this week.', fixed: 'No fixes this week.' }

const DENSITY: Record<string, { row: string; minor: string; text: string; tile: string; tileW: string; icon: string; gap: string; avatar: string }> = {
  compact: { row: 'py-1.5', minor: 'py-1', text: 'text-[13px]', tile: 'size-5', tileW: 'w-5', icon: 'size-3', gap: 'gap-2.5', avatar: 'size-5 text-[8.5px]' },
  cozy: { row: 'py-2.5', minor: 'py-1.5', text: 'text-[14px]', tile: 'size-6', tileW: 'w-6', icon: 'size-3.5', gap: 'gap-3', avatar: 'size-[22px] text-[9px]' },
  roomy: { row: 'py-3.5', minor: 'py-2', text: 'text-[15px]', tile: 'size-7', tileW: 'w-7', icon: 'size-4', gap: 'gap-3.5', avatar: 'size-6 text-[9.5px]' },
}

const sans = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"
const mono = "'Geist Mono Variable', ui-monospace, monospace"

type RGB = [number, number, number]

function parseHex(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1]!, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

const toHex = (c: RGB) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

// 主色当文字用时，按亮度往白（暗色主题）或往黑（亮色主题）推，直到对背景至少约 5:1；任何主色都可读
function tone(rgb: RGB, theme: 'dark' | 'light'): string {
  const target: RGB = theme === 'dark' ? [255, 255, 255] : [0, 0, 0]
  for (let t = 0; t <= 1.001; t += 0.04) {
    const c: RGB = [rgb[0] + (target[0] - rgb[0]) * t, rgb[1] + (target[1] - rgb[1]) * t, rgb[2] + (target[2] - rgb[2]) * t]
    const l = luminance(c)
    if (theme === 'dark' ? l >= 0.26 : l <= 0.15) return toHex(c)
  }
  return toHex(target)
}

// 主色填充上的文字：黑白两种字对比度相等的分界在亮度约 0.179，高于它用深字、低于它用白字
const inkOn = (rgb: RGB) => (luminance(rgb) > 0.179 ? '#0b0b0f' : '#ffffff')

function hueOf([r, g, b]: RGB): { hue: number; sat: number } {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d < 1) return { hue: 0, sat: 0 }
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { hue: (h * 60 + 360) % 360, sat: d / 255 }
}

function Glyph({ type, className }: { type: ChangeType; className?: string }) {
  if (type === 'new')
    return (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
        <path d="M8 1.6C8.5 5.5 10.5 7.5 14.4 8 10.5 8.5 8.5 10.5 8 14.4 7.5 10.5 5.5 8.5 1.6 8 5.5 7.5 7.5 5.5 8 1.6Z" />
      </svg>
    )
  if (type === 'improved')
    return (
      <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M8 12.5v-9M4.2 7.3 8 3.5l3.8 3.8" />
      </svg>
    )
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3.5 8.4 2.9 2.9 6.1-6.6" />
    </svg>
  )
}

const TYPE_STYLE: Record<ChangeType, { tint: string; ink: string; bar: string }> = {
  new: { tint: 'color-mix(in oklab, var(--acc) 16%, transparent)', ink: 'var(--acc-ink)', bar: 'var(--acc-ink)' },
  improved: { tint: 'color-mix(in oklab, var(--imp) 16%, transparent)', ink: 'var(--imp-ink)', bar: 'var(--imp)' },
  fixed: { tint: 'color-mix(in oklab, var(--foreground) 8%, transparent)', ink: 'color-mix(in oklab, var(--foreground) 66%, transparent)', bar: 'color-mix(in oklab, var(--foreground) 28%, transparent)' },
}

function Avatar({ id, className, ring, bare }: { id: string; className: string; ring?: boolean; bare?: boolean }) {
  const p = PEOPLE[id] ?? { name: id, hue: 250 }
  return (
    <span
      title={p.name}
      className={cn('grid shrink-0 place-items-center rounded-full font-semibold tracking-[0.02em] text-white select-none', ring && 'ring-2 ring-card', className)}
      style={{ background: `linear-gradient(140deg, oklch(0.58 0.12 ${p.hue}), oklch(0.43 0.11 ${p.hue + 40}))`, fontFamily: sans }}
    >
      {!bare && <span aria-hidden>{id}</span>}
      <span className="sr-only">{p.name}</span>
    </span>
  )
}

/** 按周分组的高密度更新日志：周标题吸顶、一行一条改动、小修复折叠、按类型筛选。 */
export function ChangelogWeeklyDigest({ className, style, filter: filterProp, onFilterChange, expanded: expandedProp, onExpandedChange, ...props }: ChangelogWeeklyDigestProps) {
  const { accent, filterStyle, radius, density, weeks, showAuthors, collapseMinor, heading } = { ...defaults, ...props }
  const reduced = useReducedMotion() === true
  const uid = useId()
  const root = useRef<HTMLElement>(null)
  const halo = useRef<HTMLSpanElement>(null)
  const radios = useRef<(HTMLButtonElement | null)[]>([])
  const touched = useRef(false)
  const [filterState, setFilterState] = useState<ChangeFilter>('all')
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({})
  const filter = filterProp ?? filterState
  const expanded = expandedProp ?? expandedState
  const d = DENSITY[density] ?? DENSITY.cozy!
  const list = WEEKS.slice(0, Math.max(2, Math.min(WEEKS.length, Math.round(weeks))))
  // 归档从列表里最早一周的前一周算起，周数变少时页脚跟着变
  const archiveEnd = parseInt(list[list.length - 1]!.code.slice(1), 10) - 1

  const rgb = parseHex(accent) ?? [180, 240, 90]
  const { hue, sat } = hueOf(rgb)
  // 「改进」默认用天蓝；主色本身落在蓝青区时换成琥珀，三种类型始终分得开
  const blueish = sat > 0.18 && hue > 165 && hue < 245
  const imp = blueish ? { base: '#f59e0b', dark: '#fcd34d', light: '#b45309' } : { base: '#38bdf8', dark: '#7dd3fc', light: '#0369a1' }

  // 「本周」小圆点的呼吸光圈：直接改这一个元素的样式，不触发整棵树重算
  useFrameLoop(
    root,
    ({ time }) => {
      const el = halo.current
      if (!el) return
      const p = (time % 2.2) / 2.2
      el.style.transform = `scale(${(1 + p * 1.9).toFixed(3)})`
      el.style.opacity = ((1 - p) * 0.55).toFixed(3)
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const setFilter = (next: ChangeFilter) => {
    touched.current = true
    if (filterProp === undefined) setFilterState(next)
    onFilterChange?.(next)
  }
  const toggle = (weekId: string) => {
    const next = !expanded[weekId]
    if (expandedProp === undefined) setExpandedState((s) => ({ ...s, [weekId]: next }))
    onExpandedChange?.(weekId, next)
  }

  const matches = (t: ChangeType) => filter === 'all' || filter === t
  const minorVisible = filter === 'all' || filter === 'fixed'
  const counts: Record<ChangeFilter, number> = { all: 0, new: 0, improved: 0, fixed: 0 }
  for (const w of list) {
    for (const c of w.changes) counts[c.type]++
    counts.fixed += w.minor.length
  }
  counts.all = counts.new + counts.improved + counts.fixed

  const onRadioKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = FILTERS.indexOf(filter)
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i + 1) % FILTERS.length : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i + FILTERS.length - 1) % FILTERS.length : e.key === 'Home' ? 0 : e.key === 'End' ? FILTERS.length - 1 : -1
    if (next < 0) return
    e.preventDefault()
    setFilter(FILTERS[next]!)
    radios.current[next]?.focus()
  }

  const ease = [0.22, 1, 0.36, 1] as const
  const spring = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: 0.32, bounce: 0.14 }
  const enter = (delay: number) => ({ initial: reduced ? (false as const) : { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay, ease } })
  // 焦点环和选中标记用对背景调过对比度的 --acc-ink：主色参数不受限，原色可能贴近背景
  const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-background'

  const dot = (f: ChangeFilter, on: boolean) =>
    f === 'all' ? null : <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ background: on && filterStyle === 'pills' ? 'currentColor' : TYPE_STYLE[f].bar }} />

  const filterControl = (
    <div
      role="radiogroup"
      aria-label="Filter changes by type"
      onKeyDown={onRadioKey}
      className={cn(
        filterStyle === 'segmented' && 'grid w-full grid-cols-4 gap-0.5 border bg-muted/40 p-1 sm:inline-flex sm:w-auto',
        filterStyle === 'pills' && 'flex flex-wrap gap-1.5',
        filterStyle === 'underline' && 'flex items-center gap-5 sm:gap-6',
      )}
      style={filterStyle === 'segmented' ? { borderRadius: 'calc(var(--r) + 3px)' } : undefined}
    >
      {FILTERS.map((f, i) => {
        const on = f === filter
        const count = (
          <span className={cn('hidden text-[11.5px] tabular-nums sm:inline', !on && 'text-muted-foreground')} style={{ fontFamily: mono, color: on && filterStyle !== 'pills' ? 'var(--acc-ink)' : undefined, opacity: on && filterStyle === 'pills' ? 0.72 : undefined }}>
            {counts[f]}
          </span>
        )
        return (
          <button
            key={f}
            ref={(el) => {
              radios.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => setFilter(f)}
            className={cn(
              'relative isolate inline-flex items-center justify-center gap-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-200',
              focusRing,
              filterStyle === 'segmented' && 'px-2 py-1.5 sm:px-3',
              filterStyle === 'pills' && 'border px-3 py-1.5 transition-[background-color,border-color,color]',
              filterStyle === 'underline' && '-mb-px py-3',
              on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              filterStyle === 'pills' && !on && 'hover:border-foreground/25',
            )}
            style={{
              borderRadius: filterStyle === 'underline' ? 4 : 'var(--r)',
              ...(filterStyle === 'pills' && on ? { background: 'var(--acc)', borderColor: 'var(--acc)', color: 'var(--acc-on)' } : null),
            }}
          >
            {on && filterStyle === 'segmented' && <motion.span layoutId={`${uid}-seg`} transition={spring} className="absolute inset-0 -z-10 border bg-background shadow-sm shadow-black/10" style={{ borderRadius: 'var(--r)' }} />}
            {on && filterStyle === 'underline' && <motion.span layoutId={`${uid}-tab`} transition={spring} className="absolute inset-x-0 bottom-0 h-0.5 rounded-full" style={{ background: 'var(--acc-ink)' }} />}
            {dot(f, on)}
            {LABEL[f]}
            {count}
          </button>
        )
      })}
    </div>
  )

  return (
    <section
      ref={root}
      aria-labelledby={`${uid}-h`}
      className={cn('w-full text-foreground [--acc-ink:var(--acc-l)] [--imp-ink:var(--imp-l)] dark:[--acc-ink:var(--acc-d)] dark:[--imp-ink:var(--imp-d)]', className)}
      style={{
        ['--acc' as string]: toHex(rgb),
        ['--acc-d' as string]: tone(rgb, 'dark'),
        ['--acc-l' as string]: tone(rgb, 'light'),
        ['--acc-on' as string]: inkOn(rgb),
        ['--imp' as string]: imp.base,
        ['--imp-d' as string]: imp.dark,
        ['--imp-l' as string]: imp.light,
        ['--r' as string]: `${Math.max(0, Math.min(16, radius))}px`,
        fontFamily: sans,
        ...style,
      }}
    >
      <div className="mx-auto max-w-[57rem] px-4 pt-10 pb-12 sm:px-8 sm:pt-12 sm:pb-16">
        <motion.header {...enter(0)} className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div className="max-w-xl">
            <p className="flex flex-wrap items-center gap-x-2 text-[12px] font-medium tracking-wide uppercase" style={{ fontFamily: mono }}>
              <span style={{ color: 'var(--acc-ink)' }}>Changelog</span>
              <span className="text-muted-foreground/70">/</span>
              <span className="text-muted-foreground normal-case tracking-normal">updated Fri, Nov 6</span>
            </p>
            <h2 id={`${uid}-h`} className="mt-3 text-[2rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-[2.6rem]">
              {heading}
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-pretty text-muted-foreground">Every change to Larkspur, grouped by the week it reached production. Small fixes are folded so the headlines stay readable.</p>
          </div>
          <button
            type="button"
            className={cn('inline-flex items-center gap-2 border bg-background px-3.5 py-2 text-[13px] font-medium shadow-sm shadow-black/5 transition-colors hover:bg-muted/60', focusRing)}
            style={{ borderRadius: 'var(--r)' }}
          >
            <svg viewBox="0 0 16 16" className="size-3.5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
              <rect x="2" y="3.5" width="12" height="9" rx="1.6" />
              <path d="m2.6 4.4 5.4 4.3 5.4-4.3" strokeLinecap="round" />
            </svg>
            Weekly email
          </button>
        </motion.header>

        <motion.div {...enter(0.08)} className={cn('mt-9 flex flex-wrap items-center justify-between gap-x-6 gap-y-3', filterStyle === 'underline' && 'border-b')}>
          {filterControl}
          <p className="hidden text-[12px] text-muted-foreground tabular-nums sm:block" style={{ fontFamily: mono }}>
            {counts.all} changes · {list.length} weeks
          </p>
        </motion.div>

        <div className="mt-6 space-y-8">
          {list.map((w, wi) => {
            const rows = w.changes.filter((c) => matches(c.type))
            const minorRows = minorVisible ? w.minor : []
            const total = w.changes.length + w.minor.length
            const shown = rows.length + minorRows.length
            const byType = (t: ChangeType) => w.changes.filter((c) => c.type === t).length
            const open = Boolean(expanded[w.id])
            const minorId = `${uid}-${w.id}-minor`
            const minorAuthors = [...new Set(w.minor.map((m) => m.by))].slice(0, 4)
            const areas = [...new Set(w.minor.map((m) => m.area))]
            const unit = filter === 'all' ? (shown === 1 ? 'change' : 'changes') : filter
            return (
              <motion.section key={w.id} {...enter(0.14 + wi * 0.07)} aria-labelledby={`${uid}-${w.id}`}>
                <div className="sticky top-0 z-10 bg-background/85 backdrop-blur-md">
                  <div className="flex items-center gap-2.5 py-3 sm:gap-3">
                    <span className="shrink-0 border px-1.5 py-px text-[11px] text-muted-foreground" style={{ fontFamily: mono, borderRadius: 'calc(var(--r) * 0.5)' }}>
                      {w.code}
                    </span>
                    <h3 id={`${uid}-${w.id}`} className="truncate text-[15px] font-medium tracking-[-0.01em]">
                      {w.range}
                    </h3>
                    {w.current && (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: 'color-mix(in oklab, var(--acc) 14%, transparent)', color: 'var(--acc-ink)' }}>
                        <span className="relative size-1.5">
                          <span ref={halo} className="absolute inset-0 rounded-full" style={{ background: 'var(--acc-ink)', opacity: 0.55 }} />
                          <span className="absolute inset-0 rounded-full" style={{ background: 'var(--acc-ink)' }} />
                        </span>
                        This week
                      </span>
                    )}
                    <div className="ml-auto flex shrink-0 items-center gap-3">
                      <span className="hidden h-1.5 w-[5.5rem] gap-0.5 overflow-hidden rounded-full sm:flex" aria-hidden>
                        {(['new', 'improved', 'fixed'] as const).map((t) => (
                          <span key={t} className="h-full" style={{ flexGrow: byType(t), background: TYPE_STYLE[t].bar }} />
                        ))}
                        <span className="h-full" style={{ flexGrow: w.minor.length, background: 'color-mix(in oklab, var(--foreground) 13%, transparent)' }} />
                      </span>
                      <span className="text-[12px] text-muted-foreground tabular-nums" style={{ fontFamily: mono }}>
                        {filter === 'all' ? total : shown} {unit}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.ul
                  key={filter}
                  initial={reduced || !touched.current ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease }}
                  className={cn('divide-y divide-border/70 overflow-hidden border bg-card/50', d.text)}
                  style={{ borderRadius: 'var(--r)' }}
                >
                  {shown === 0 && <li className="px-4 py-3 text-[13px] text-muted-foreground">{EMPTY[filter as ChangeType]}</li>}
                  {rows.map((c) => (
                    <Row key={c.text} change={c} d={d} showAuthors={showAuthors} />
                  ))}
                  {minorRows.length > 0 && !collapseMinor && minorRows.map((m) => <Row key={m.text} change={{ ...m, type: 'fixed', day: '' }} d={d} showAuthors={showAuthors} minor />)}
                  {minorRows.length > 0 && collapseMinor && (
                    <li>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={minorId}
                        onClick={() => toggle(w.id)}
                        className={cn('flex w-full items-center px-3 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground sm:px-4', d.gap, d.row, 'outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc-ink)] focus-visible:ring-inset')}
                      >
                        <span className={cn('grid shrink-0 place-items-center border border-dashed border-foreground/20', d.tile)} style={{ borderRadius: 'calc(var(--r) * 0.6)' }}>
                          <svg viewBox="0 0 16 16" className={cn('transition-transform duration-300 motion-reduce:transition-none', d.icon, open && 'rotate-90')} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="m6 3.5 4.5 4.5L6 12.5" />
                          </svg>
                        </span>
                        <span className="hidden w-[4.75rem] shrink-0 md:block" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="font-medium text-foreground/85">and {minorRows.length} smaller fixes</span>
                          <span className="ml-3 hidden truncate text-[11.5px] text-muted-foreground lg:inline" style={{ fontFamily: mono }}>
                            {areas.slice(0, 4).join(' · ')}
                            {areas.length > 4 ? ` +${areas.length - 4}` : ''}
                          </span>
                        </span>
                        {showAuthors && (
                          <span className="flex shrink-0 -space-x-2" aria-hidden>
                            {minorAuthors.map((a) => (
                              <Avatar key={a} id={a} ring bare className={d.avatar} />
                            ))}
                          </span>
                        )}
                      </button>
                      <div id={minorId}>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              key="minor"
                              initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                              transition={{ duration: reduced ? 0 : 0.34, ease }}
                              className="overflow-hidden"
                            >
                              <ul className="pb-2.5" aria-label={`Smaller fixes in ${w.range}`}>
                                {minorRows.map((m) => (
                                  <li key={m.text} className={cn('flex items-baseline px-3 sm:px-4', d.gap, d.minor)}>
                                    <span className={cn('shrink-0', d.tileW)} aria-hidden />
                                    <span className="hidden w-[4.75rem] shrink-0 md:block" aria-hidden />
                                    <span className="min-w-0 flex-1 text-[13px] leading-snug text-foreground/75">
                                      <span aria-hidden className="mr-2 text-muted-foreground/60">–</span>
                                      {m.text}
                                    </span>
                                    <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline" style={{ fontFamily: mono }}>
                                      {m.area}
                                    </span>
                                    {showAuthors && <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline sm:w-6 sm:text-right" style={{ fontFamily: mono }} title={PEOPLE[m.by]?.name}>{m.by}</span>}
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </li>
                  )}
                </motion.ul>
              </motion.section>
            )
          })}
        </div>

        <p className="mt-10 text-center text-[12px] text-muted-foreground" style={{ fontFamily: mono }}>
          Older weeks live in the archive · W1 – W{archiveEnd}
        </p>
      </div>
    </section>
  )
}

function Row({ change, d, showAuthors, minor }: { change: Change; d: (typeof DENSITY)[string]; showAuthors: boolean; minor?: boolean }) {
  const s = TYPE_STYLE[change.type]
  return (
    <li className={cn('flex items-start px-3 transition-colors hover:bg-muted/30 sm:items-center sm:px-4', d.gap, d.row)}>
      <span className={cn('mt-px grid shrink-0 place-items-center sm:mt-0', d.tile)} style={{ background: s.tint, color: s.ink, borderRadius: 'calc(var(--r) * 0.6)' }}>
        <Glyph type={change.type} className={d.icon} />
        <span className="sr-only">{LABEL[change.type]}</span>
      </span>
      <span aria-hidden className="hidden w-[4.75rem] shrink-0 text-[12px] font-medium md:block" style={{ color: s.ink }}>
        {minor ? 'Minor fix' : LABEL[change.type]}
      </span>
      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
        <p className={cn('min-w-0 leading-snug text-pretty sm:flex-1', minor ? 'text-foreground/75' : 'text-foreground/90')}>{change.text}</p>
        <div className="mt-1.5 flex items-center gap-2 sm:mt-0 sm:shrink-0">
          <span className="border px-1.5 py-px text-[11px] text-muted-foreground" style={{ fontFamily: mono, borderRadius: 'calc(var(--r) * 0.5)' }}>
            {change.area}
          </span>
          <span className="text-[11px] text-muted-foreground sm:w-7 sm:text-right" style={{ fontFamily: mono }}>
            {change.day}
          </span>
        </div>
      </div>
      {showAuthors && <Avatar id={change.by} className={d.avatar} />}
    </li>
  )
}
