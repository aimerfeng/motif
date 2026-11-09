// SPDX-License-Identifier: MIT
// Copyright (c) Mark Mead
// Source: https://github.com/markmead/hyperui/blob/2b5aebb/public/examples/templates/support-inbox/1.html
// Source: https://github.com/markmead/hyperui/blob/2b5aebb/public/examples/templates/support-inbox/2.html
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  brand: 'Orbitly',
  accent: '#4f46e5',
  view: 'queue',
  density: 'comfortable',
  showRail: true,
  tone: 'light',
}
/* @motif:end */

export type StatusFilter = 'All' | 'Open' | 'Pending' | 'Closed'
export type ComposerMode = 'reply' | 'note'

export type HelpdeskInboxProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控状态（演示自动播放用）；不传时用内部状态。 */
  filter?: StatusFilter
  onFilterChange?: (filter: StatusFilter) => void
  mode?: ComposerMode
  onModeChange?: (mode: ComposerMode) => void
  draft?: string
  onDraftChange?: (draft: string) => void
}

type Status = 'Open' | 'Pending' | 'Closed'
type Priority = 'Low' | 'High' | 'Urgent'
type TagId = 'billing' | 'bug' | 'onboarding'
type QueueId = 'mine' | 'unassigned' | 'open' | 'closed'
type Entry = { kind: 'customer' | 'agent' | 'note'; author: string; time: string; text?: string }
type Ticket = {
  id: string
  title: string
  requester: string
  email: string
  status: Status
  priority: Priority
  updated: string
  assignee: string
  tags: TagId[]
  plan: string
  since: string
  thread: Entry[]
}

const QUEUES: { id: QueueId; label: string }[] = [
  { id: 'mine', label: 'My tickets' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'open', label: 'All open' },
  { id: 'closed', label: 'Closed' },
]

const TAGS: { id: TagId; label: string; dot: string }[] = [
  { id: 'billing', label: 'Billing', dot: 'bg-rose-500' },
  { id: 'bug', label: 'Bug', dot: 'bg-amber-500' },
  { id: 'onboarding', label: 'Onboarding', dot: 'bg-emerald-500' },
]

const FILTERS: StatusFilter[] = ['All', 'Open', 'Pending', 'Closed']
const STATUSES: Status[] = ['Open', 'Pending', 'Closed']
const PRIORITIES: Priority[] = ['Low', 'High', 'Urgent']
const ASSIGNEES = ['You', 'Jun Park', 'Unassigned']

// 虚构的工单；#4819 的对话沿用上游。
const TICKETS: Ticket[] = [
  {
    id: '4821',
    title: "Can't export invoices as CSV",
    requester: 'Marcus Boyle',
    email: 'marcus@tallowworks.com',
    status: 'Open',
    priority: 'High',
    updated: '12 minutes ago',
    assignee: 'You',
    tags: ['billing', 'bug'],
    plan: 'Business, 20 seats',
    since: 'Aug 2023',
    thread: [
      { kind: 'customer', author: 'Marcus Boyle', time: 'Today at 10:31', text: 'The Export button on the Invoices page spins for a few seconds and then nothing downloads. Same in Chrome and Firefox; PDF export still works.' },
    ],
  },
  {
    id: '4819',
    title: 'Team seats not syncing after upgrade',
    requester: 'Priya Natarajan',
    email: 'priya@fernhill.io',
    status: 'Open',
    priority: 'High',
    updated: '41 minutes ago',
    assignee: 'You',
    tags: ['bug', 'billing'],
    plan: 'Team, 5 seats',
    since: 'Feb 2024',
    thread: [
      { kind: 'customer', author: 'Priya Natarajan', time: 'Today at 09:12', text: 'We upgraded to the Team plan yesterday but two of the five seats we paid for still show as pending. Tried removing and re-inviting one person, still stuck.' },
      { kind: 'agent', author: 'You', time: 'Today at 09:41', text: "Thanks for flagging — looks like the seat sync job is stuck on your account specifically. I'm re-running it manually now and will confirm once both seats show as active." },
      { kind: 'note', author: 'You', time: 'Today at 09:42' },
    ],
  },
  {
    id: '4812',
    title: 'Question about annual billing discount',
    requester: 'Owen Baptiste',
    email: 'owen@saltmarsh.co',
    status: 'Pending',
    priority: 'Low',
    updated: '3 hours ago',
    assignee: 'You',
    tags: ['billing'],
    plan: 'Starter, 3 seats',
    since: 'Nov 2024',
    thread: [
      { kind: 'customer', author: 'Owen Baptiste', time: 'Today at 07:48', text: 'If we switch to annual billing halfway through the month, does the discount apply to the current invoice or from the next one?' },
      { kind: 'agent', author: 'You', time: 'Today at 08:05', text: 'From the next invoice. The rest of this month is prorated at the monthly rate, then annual pricing starts. Want me to switch it over for you?' },
    ],
  },
  {
    id: '4790',
    title: 'Feature request: dark mode for reports',
    requester: 'Freya Lindqvist',
    email: 'freya@nordlys.studio',
    status: 'Pending',
    priority: 'Low',
    updated: '1 day ago',
    assignee: 'You',
    tags: [],
    plan: 'Team, 8 seats',
    since: 'Jun 2024',
    thread: [
      { kind: 'customer', author: 'Freya Lindqvist', time: 'Yesterday at 16:20', text: 'Our analysts keep reports open on a wall display all day. A dark theme for the report viewer would help a lot.' },
    ],
  },
  {
    id: '4786',
    title: 'SSO login loops back to the sign-in page',
    requester: 'Tomás Rivera',
    email: 'tomas@quillandco.com',
    status: 'Open',
    priority: 'High',
    updated: '1 day ago',
    assignee: 'Unassigned',
    tags: ['bug'],
    plan: 'Business, 40 seats',
    since: 'Jan 2023',
    thread: [
      { kind: 'customer', author: 'Tomás Rivera', time: 'Yesterday at 14:02', text: 'Since this morning everyone who signs in with SSO lands back on the sign-in page. Password logins still work.' },
    ],
  },
  {
    id: '4774',
    title: 'Help importing contacts from a spreadsheet',
    requester: 'Hana Kobayashi',
    email: 'hana@kitecraft.jp',
    status: 'Open',
    priority: 'Low',
    updated: '2 days ago',
    assignee: 'Unassigned',
    tags: ['onboarding'],
    plan: 'Starter, 2 seats',
    since: 'Oct 2025',
    thread: [
      { kind: 'customer', author: 'Hana Kobayashi', time: 'Nov 7 at 11:15', text: 'We just signed up and have about 900 contacts in a spreadsheet. Which columns does the importer expect?' },
    ],
  },
  {
    id: '4765',
    title: 'Refund for a duplicate charge in October',
    requester: 'Elif Demir',
    email: 'elif@harborline.co',
    status: 'Closed',
    priority: 'High',
    updated: '3 days ago',
    assignee: 'You',
    tags: ['billing'],
    plan: 'Team, 12 seats',
    since: 'Mar 2024',
    thread: [
      { kind: 'customer', author: 'Elif Demir', time: 'Nov 6 at 09:30', text: 'Our card was charged twice for the October invoice. Could you refund one of them?' },
      { kind: 'agent', author: 'You', time: 'Nov 6 at 10:12', text: 'Sorry about that. The duplicate charge is refunded and should reach your card in 5 to 10 business days.' },
    ],
  },
  {
    id: '4752',
    title: 'Webhook retries arrive out of order',
    requester: 'Jonas Weber',
    email: 'jonas@brightmill.dev',
    status: 'Closed',
    priority: 'Low',
    updated: '4 days ago',
    assignee: 'You',
    tags: ['bug'],
    plan: 'Business, 25 seats',
    since: 'Jul 2022',
    thread: [
      { kind: 'customer', author: 'Jonas Weber', time: 'Nov 5 at 15:44', text: 'When our endpoint is down for a minute, the retried events arrive in a different order than they were sent. Is that expected?' },
      { kind: 'agent', author: 'You', time: 'Nov 5 at 16:20', text: 'Yes, retries are delivered independently. Each event carries a sequence number you can sort on before processing.' },
    ],
  },
]

// 上游的 gray-* 色阶，按明暗各一套；组件内只引用这些变量，不依赖页面的主题。
const TONES = {
  light: { page: '#f9fafb', panel: '#ffffff', line: '#e5e7eb', hover: '#f3f4f6', ink: '#111827', body: '#374151', sub: '#4b5563', muted: '#6b7280', faint: '#9ca3af', dot: '#d1d5db', scrim: 'rgb(17 24 39 / 0.5)' },
  dark: { page: '#0b0d12', panel: '#12151b', line: '#252a33', hover: '#1c2028', ink: '#f3f4f6', body: '#d1d5db', sub: '#b6bcc7', muted: '#9ca3af', faint: '#7c8390', dot: '#4b5563', scrim: 'rgb(0 0 0 / 0.6)' },
}

// 状态、优先级徽章：浅色沿用上游的 *-100 / *-700，深色换成半透明底 + 浅字。
const BADGE = {
  light: {
    Open: 'bg-blue-100 text-blue-700',
    Pending: 'bg-amber-100 text-amber-700',
    Closed: 'bg-gray-100 text-gray-600',
    High: 'bg-red-100 text-red-700',
    Low: 'bg-gray-100 text-gray-600',
    Urgent: 'bg-red-600 text-white',
  },
  dark: {
    Open: 'bg-blue-500/15 text-blue-300',
    Pending: 'bg-amber-500/15 text-amber-300',
    Closed: 'bg-white/8 text-gray-300',
    High: 'bg-red-500/15 text-red-300',
    Low: 'bg-white/8 text-gray-300',
    Urgent: 'bg-red-600 text-white',
  },
}

const NOTE = {
  light: {
    field: 'data-[mode=note]:border-amber-200 data-[mode=note]:bg-amber-50',
    bubble: 'border-amber-200 bg-amber-50',
  },
  dark: {
    field: 'data-[mode=note]:border-amber-500/30 data-[mode=note]:bg-amber-500/10',
    bubble: 'border-amber-500/30 bg-amber-500/10',
  },
}

const DENSITY = {
  compact: { head: '*:px-4 *:py-2', cell: 'px-4 py-2', rail: 'py-1.5', tag: 'py-1', thread: 'space-y-4', bubble: 'p-3' },
  comfortable: { head: '*:px-4 *:py-3', cell: 'px-4 py-3', rail: 'py-2', tag: 'py-1.5', thread: 'space-y-6', bubble: 'p-4' },
  spacious: { head: '*:px-5 *:py-4', cell: 'px-5 py-4', rail: 'py-2.5', tag: 'py-2', thread: 'space-y-8', bubble: 'p-5' },
}

// ---- 颜色：任意主色都要保证文字可读 ----
type RGB = [number, number, number]
const BLACK: RGB = [11, 11, 15]
const WHITE: RGB = [255, 255, 255]

function parseHex(hex: string): RGB {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [79, 70, 229]
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const toHex = (c: RGB) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
function luminance(c: RGB) {
  const lin = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
}
function contrast(a: RGB, b: RGB) {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
/** 从主色出发逐步混向黑（浅底）或白（深底），直到在 bg 上的对比度达到 4.5。 */
function readable(fg: RGB, bg: RGB, toward: RGB, start: number) {
  for (let t = start; t <= 1; t += 0.05) {
    const c = mix(fg, toward, t)
    if (contrast(c, bg) >= 4.5) return c
  }
  return toward
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

function Avatar({ name, className }: { name: string; className?: string }) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  return (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center rounded-full font-semibold text-white', className)}
      style={{ background: `linear-gradient(135deg, hsl(${h} 62% 50%), hsl(${(h + 48) % 360} 62% 38%))` }}
    >
      {initials(name)}
    </span>
  )
}

const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--hd-acc)'
const field = 'rounded-md border border-(--hd-line) bg-(--hd-panel) text-sm text-(--hd-ink) shadow-xs outline-none focus:border-(--hd-acc) focus:ring-1 focus:ring-(--hd-acc)'

/** 客服工作台：队列栏 + 工单表格，点开工单是对话时间线和「回复 / 内部备注」输入框。 */
export function HelpdeskInbox({ className, style, filter: filterProp, onFilterChange, mode: modeProp, onModeChange, draft: draftProp, onDraftChange, ...props }: HelpdeskInboxProps) {
  const { brand, accent, view, density, showRail, tone: toneKey } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const uid = useId()
  const tone = toneKey === 'dark' ? 'dark' : 'light'
  const p = TONES[tone]
  const d = DENSITY[density as keyof typeof DENSITY] ?? DENSITY.comfortable
  const badge = BADGE[tone]
  const note = NOTE[tone]

  // 主色派生：按钮上的字按亮度选黑白；浅色底上的主色文字逐步加深到可读。
  const acc = parseHex(accent)
  const panel = parseHex(p.panel)
  const dark = tone === 'dark'
  const onAcc = contrast(WHITE, acc) >= contrast(BLACK, acc) ? WHITE : BLACK
  const tint = mix(panel, acc, dark ? 0.16 : 0.09)
  const vars = cssVars(
    {
      '--hd-page': p.page,
      '--hd-panel': p.panel,
      '--hd-line': p.line,
      '--hd-hover': p.hover,
      '--hd-ink': p.ink,
      '--hd-body': p.body,
      '--hd-sub': p.sub,
      '--hd-muted': p.muted,
      '--hd-faint': p.faint,
      '--hd-dot': p.dot,
      '--hd-scrim': p.scrim,
      '--hd-pill': p.ink,
      '--hd-on-pill': p.panel,
      '--hd-acc': toHex(acc),
      '--hd-acc-hover': toHex(mix(acc, dark ? WHITE : BLACK, 0.14)),
      '--hd-on-acc': toHex(onAcc),
      '--hd-tint': toHex(tint),
      '--hd-tint-line': toHex(mix(panel, acc, dark ? 0.32 : 0.2)),
      '--hd-row': toHex(mix(panel, acc, dark ? 0.08 : 0.05)),
      '--hd-acc-text': toHex(readable(acc, tint, dark ? WHITE : BLACK, dark ? 0 : 0.15)),
    },
    { colorScheme: tone, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style },
  )

  // 初始界面跟随参数；之后点行 / 返回在内部切换。
  const [screen, setScreen] = useState(view)
  const [seenView, setSeenView] = useState(view)
  if (seenView !== view) {
    setSeenView(view)
    setScreen(view)
  }
  const [queue, setQueue] = useState<QueueId>('mine')
  const [tag, setTag] = useState<TagId | null>(null)
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState('4819')
  const [edits, setEdits] = useState<Record<string, Partial<Pick<Ticket, 'status' | 'priority' | 'assignee'>>>>({})
  const [added, setAdded] = useState<Record<string, Entry[]>>({})
  const [railOpen, setRailOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const [ownFilter, setOwnFilter] = useState<StatusFilter>('All')
  const [ownMode, setOwnMode] = useState<ComposerMode>('reply')
  const [ownDraft, setOwnDraft] = useState('')
  const filter = filterProp ?? ownFilter
  const mode = modeProp ?? ownMode
  const draft = draftProp ?? ownDraft
  const setFilter = (next: StatusFilter) => {
    setOwnFilter(next)
    onFilterChange?.(next)
  }
  const setMode = (next: ComposerMode) => {
    setOwnMode(next)
    onModeChange?.(next)
  }
  const setDraft = (next: string) => {
    setOwnDraft(next)
    onDraftChange?.(next)
  }

  const tickets = TICKETS.map((t) => ({ ...t, ...edits[t.id] }))
  const inQueue = (t: Ticket, q: QueueId) =>
    q === 'mine' ? t.assignee === 'You' : q === 'unassigned' ? t.assignee === 'Unassigned' : q === 'open' ? t.status !== 'Closed' : t.status === 'Closed'
  const count = (q: QueueId) => (q === 'closed' ? null : tickets.filter((t) => inQueue(t, q) && t.status !== 'Closed').length)
  const inView = tickets.filter((t) => inQueue(t, queue))
  const needle = query.trim().toLowerCase()
  const rows = inView.filter(
    (t) =>
      (filter === 'All' || t.status === filter) &&
      (!tag || t.tags.includes(tag)) &&
      (!needle || `${t.title} ${t.requester} #${t.id}`.toLowerCase().includes(needle)),
  )
  const queueLabel = QUEUES.find((q) => q.id === queue)?.label ?? 'My tickets'
  const ticket = tickets.find((t) => t.id === openId) ?? tickets[1]
  const thread = [...ticket.thread, ...(added[ticket.id] ?? [])]
  const first = ticket.requester.split(' ')[0]
  const isNote = mode === 'note'

  const railId = `${uid}-rail`
  const detailsId = `${uid}-details`
  const composerId = `${uid}-composer`
  const messageId = `${uid}-message`

  const openTicket = (id: string) => {
    setOpenId(id)
    setScreen('ticket')
    setDetailsOpen(false)
  }
  const pickQueue = (id: QueueId) => {
    setQueue(id)
    setScreen('queue')
    setRailOpen(false)
  }
  const edit = (patch: Partial<Pick<Ticket, 'status' | 'priority' | 'assignee'>>) => setEdits((all) => ({ ...all, [ticket.id]: { ...all[ticket.id], ...patch } }))
  const send = () => {
    const text = draft.trim()
    if (!text) return
    setAdded((all) => ({ ...all, [ticket.id]: [...(all[ticket.id] ?? []), { kind: isNote ? 'note' : 'agent', author: 'You', time: 'Just now', text }] }))
    setDraft('')
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    setRailOpen(false)
    setDetailsOpen(false)
  }
  const enter = (i: number) => (reduced ? { initial: false as const } : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.28, delay: i * 0.035, ease: [0.22, 1, 0.36, 1] as const } })

  return (
    <div className={cn('flex h-full min-h-[560px] w-full flex-col overflow-hidden bg-(--hd-page) text-(--hd-ink) antialiased', className)} style={vars} onKeyDown={onKeyDown}>
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-(--hd-line) bg-(--hd-panel) px-4 sm:px-6">
        <button
          type="button"
          aria-expanded={railOpen}
          aria-controls={railId}
          onClick={() => setRailOpen((open) => !open)}
          className={cn('cursor-pointer rounded-md p-2 text-(--hd-sub) transition-colors hover:bg-(--hd-hover)', showRail && 'lg:hidden', ring)}
        >
          <span className="sr-only">Toggle queues</span>
          <svg aria-hidden className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {screen === 'ticket' ? (
          <button type="button" onClick={() => setScreen('queue')} className={cn('flex min-w-0 items-center gap-1 rounded-sm text-sm text-(--hd-muted) transition-colors hover:text-(--hd-ink)', ring)}>
            <svg aria-hidden fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 shrink-0 rtl:rotate-180">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span className="truncate">{queueLabel}</span>
          </button>
        ) : (
          <>
            <p className="min-w-0 truncate text-sm font-semibold text-(--hd-ink)">
              {brand} <span className="font-normal text-(--hd-faint)">/ Support</span>
            </p>

            <label htmlFor={`${uid}-search`} className="ml-4 hidden max-w-sm flex-1 sm:block">
              <span className="sr-only">Search tickets</span>
              <div className="relative">
                <svg aria-hidden fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--hd-faint)">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="search"
                  id={`${uid}-search`}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tickets"
                  className={cn('w-full py-1.5 pr-3 pl-9 placeholder:text-(--hd-faint)', field)}
                />
              </div>
            </label>
          </>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {screen === 'ticket' ? (
            <button
              type="button"
              title="Toggle ticket details"
              aria-expanded={detailsOpen}
              aria-controls={detailsId}
              onClick={() => setDetailsOpen((open) => !open)}
              className={cn('cursor-pointer rounded-md p-2 text-(--hd-sub) transition-colors hover:bg-(--hd-hover) xl:hidden', ring)}
            >
              <span className="sr-only">Toggle ticket details</span>
              <svg aria-hidden fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
            </button>
          ) : (
            <button type="button" className={cn('hidden rounded-md bg-(--hd-acc) px-3 py-1.5 text-xs font-medium text-(--hd-on-acc) transition-colors hover:bg-(--hd-acc-hover) sm:block', ring)}>
              New ticket
            </button>
          )}

          <span aria-hidden className="grid size-8 place-items-center rounded-full bg-(--hd-acc) text-xs font-semibold text-(--hd-on-acc)">
            AK
          </span>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <div aria-hidden onClick={() => setRailOpen(false)} className={cn('absolute inset-0 z-30 bg-(--hd-scrim)', railOpen ? 'block' : 'hidden', showRail && 'lg:hidden')} />

        <nav
          id={railId}
          aria-label="Queues"
          className={cn(
            'absolute inset-y-0 start-0 z-40 w-56 shrink-0 overflow-y-auto border-e border-(--hd-line) bg-(--hd-panel) p-3 transition-[translate,visibility] duration-300 motion-reduce:transition-none',
            railOpen ? 'visible translate-x-0' : 'invisible -translate-x-full rtl:translate-x-full',
            showRail && 'lg:visible lg:static lg:translate-x-0 rtl:lg:translate-x-0',
          )}
        >
          <ul className="space-y-1">
            {QUEUES.map((q) => {
              const on = q.id === queue
              const n = count(q.id)
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    aria-current={on ? 'page' : undefined}
                    onClick={() => pickQueue(q.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 text-sm',
                      d.rail,
                      on ? 'bg-(--hd-tint) font-medium text-(--hd-acc-text)' : 'text-(--hd-sub) transition-colors hover:bg-(--hd-hover) hover:text-(--hd-ink)',
                      ring,
                    )}
                  >
                    {q.label}
                    {n !== null && <span className={cn('rounded-full px-2 py-0.5 text-xs tabular-nums', on ? 'bg-(--hd-panel) text-(--hd-acc-text)' : 'bg-(--hd-hover) text-(--hd-sub)')}>{n}</span>}
                  </button>
                </li>
              )
            })}
          </ul>

          {screen === 'queue' && (
            <>
              <p className="mt-6 px-3 text-xs font-medium tracking-wide text-(--hd-muted) uppercase">Tags</p>
              <ul className="mt-2 space-y-1">
                {TAGS.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      aria-pressed={tag === t.id}
                      onClick={() => setTag((current) => (current === t.id ? null : t.id))}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-3 text-sm transition-colors hover:bg-(--hd-hover)',
                        d.tag,
                        tag === t.id ? 'bg-(--hd-hover) font-medium text-(--hd-ink)' : 'text-(--hd-sub)',
                        ring,
                      )}
                    >
                      <span className={cn('size-2 rounded-full', t.dot)} />
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        {screen === 'queue' ? (
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="border-b border-(--hd-line) bg-(--hd-panel) px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-(--hd-ink)">{queueLabel}</h2>

              <div className="mt-3 flex gap-1" role="group" aria-label="Filter by status">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={f === filter}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                      f === filter ? 'bg-(--hd-pill) text-(--hd-on-pill)' : 'text-(--hd-sub) hover:bg-(--hd-hover)',
                      ring,
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="overflow-hidden rounded-lg border border-(--hd-line) bg-(--hd-panel)">
                <table className="min-w-full divide-y divide-(--hd-line)">
                  <thead className="bg-(--hd-page)">
                    <tr className={cn('*:text-left *:text-xs *:font-medium *:text-(--hd-muted)', d.head)}>
                      <th scope="col">Ticket</th>
                      <th scope="col" className="hidden sm:table-cell">
                        Requester
                      </th>
                      <th scope="col">Status</th>
                      <th scope="col" className="hidden md:table-cell">
                        Priority
                      </th>
                      <th scope="col" className="hidden md:table-cell">
                        Updated
                      </th>
                    </tr>
                  </thead>

                  <tbody key={`${queue}:${filter}:${tag ?? ''}`} className="divide-y divide-(--hd-line)">
                    {rows.map((t, i) => (
                      <motion.tr
                        key={t.id}
                        {...enter(i)}
                        onClick={() => openTicket(t.id)}
                        className={cn('cursor-pointer transition-colors', t.id === openId ? 'bg-(--hd-row) hover:bg-(--hd-tint)' : 'hover:bg-(--hd-page)')}
                      >
                        <td className={d.cell}>
                          <button type="button" onClick={() => openTicket(t.id)} className={cn('rounded-sm text-left text-sm font-medium text-(--hd-ink)', ring)}>
                            {t.title}
                          </button>
                          <p className="text-xs text-(--hd-muted)">#{t.id}</p>
                        </td>
                        <td className={cn('hidden text-sm whitespace-nowrap text-(--hd-sub) sm:table-cell', d.cell)}>{t.requester}</td>
                        <td className={d.cell}>
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap', badge[t.status])}>{t.status}</span>
                        </td>
                        <td className={cn('hidden md:table-cell', d.cell)}>
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap', badge[t.priority])}>{t.priority}</span>
                        </td>
                        <td className={cn('hidden text-sm whitespace-nowrap text-(--hd-muted) md:table-cell', d.cell)}>{t.updated}</td>
                      </motion.tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-(--hd-muted)">
                          No tickets match this view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-(--hd-muted)">
                  Showing {rows.length} of {inView.length} tickets
                </p>

                <div className="flex gap-1">
                  {(['Previous', 'Next'] as const).map((label) => (
                    <button key={label} type="button" disabled className="inline-flex size-8 items-center justify-center rounded-md border border-(--hd-line) text-(--hd-faint)">
                      <span className="sr-only">{label}</span>
                      <svg aria-hidden className={cn('size-3 rtl:rotate-180', label === 'Next' && 'rotate-180 rtl:rotate-0')} viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </main>
        ) : (
          <>
            <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
              <div className="border-b border-(--hd-line) bg-(--hd-panel) px-4 py-4 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-(--hd-muted)">Ticket #{ticket.id}</p>
                    <h2 className="mt-0.5 text-lg font-semibold text-(--hd-ink)">{ticket.title}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs', badge[ticket.status])}>{ticket.status}</span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs', badge[ticket.priority])}>{ticket.priority} priority</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 sm:p-6">
                <ol className={cn('relative before:absolute before:-ms-px before:h-full before:w-0.5 before:rounded-full before:bg-(--hd-line)', d.thread)}>
                  {thread.map((entry, i) => (
                    <motion.li
                      key={`${ticket.id}-${i}`}
                      initial={i >= ticket.thread.length && !reduced ? { opacity: 0, y: 8 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="relative -ms-1.5 flex items-start gap-4"
                    >
                      <span className={cn('size-3 shrink-0 rounded-full', entry.kind === 'customer' ? 'bg-(--hd-faint)' : entry.kind === 'agent' ? 'bg-(--hd-acc)' : 'bg-(--hd-dot)')} />

                      {entry.kind === 'note' ? (
                        <div className="-mt-2 w-full min-w-0">
                          <p className="text-xs text-(--hd-muted)">
                            <time>{entry.time}</time> &middot; Internal note added by you
                          </p>
                          {entry.text && (
                            <div className={cn('mt-1.5 rounded-lg rounded-tl-none border', note.bubble, d.bubble)}>
                              <p className="text-sm break-words text-(--hd-body)">{entry.text}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="-mt-2 w-full min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-(--hd-ink)">{entry.author}</p>
                            <time className="text-xs text-(--hd-muted)">{entry.time}</time>
                          </div>

                          <div
                            className={cn(
                              'mt-1.5 rounded-lg rounded-tl-none border',
                              entry.kind === 'agent' ? 'border-(--hd-tint-line) bg-(--hd-tint)' : 'border-(--hd-line) bg-(--hd-panel)',
                              d.bubble,
                            )}
                          >
                            <p className="text-sm break-words text-(--hd-body)">{entry.text}</p>
                          </div>
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ol>
              </div>

              <div className="border-t border-(--hd-line) bg-(--hd-panel) p-4 sm:p-6">
                <div className="flex gap-1">
                  {(['reply', 'note'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={mode === m}
                      aria-controls={composerId}
                      onClick={() => setMode(m)}
                      className={cn(
                        'rounded-t-md border border-b-0 border-transparent px-3 py-1.5 text-xs font-medium transition-colors aria-pressed:border-(--hd-line) aria-pressed:bg-(--hd-panel) aria-pressed:text-(--hd-ink) aria-[pressed=false]:text-(--hd-muted) aria-[pressed=false]:hover:text-(--hd-body)',
                        ring,
                      )}
                    >
                      {m === 'reply' ? 'Reply' : 'Internal note'}
                    </button>
                  ))}
                </div>

                <div id={composerId}>
                  <label htmlFor={messageId} className="sr-only">
                    {isNote ? 'Internal note' : `Reply to ${first}`}
                  </label>
                  <textarea
                    id={messageId}
                    rows={3}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) send()
                    }}
                    placeholder={isNote ? 'Add an internal note…' : 'Type your reply…'}
                    data-mode={mode}
                    className={cn(
                      'block w-full resize-none rounded-tr-md rounded-b-md border px-3 py-2 text-sm text-(--hd-ink) shadow-xs outline-none transition-[background-color,border-color] placeholder:text-(--hd-faint) focus:ring-1',
                      'data-[mode=reply]:border-(--hd-line) data-[mode=reply]:bg-(--hd-panel) data-[mode=reply]:focus:border-(--hd-acc) data-[mode=reply]:focus:ring-(--hd-acc)',
                      'data-[mode=note]:focus:border-amber-500 data-[mode=note]:focus:ring-amber-500',
                      note.field,
                    )}
                  />

                  <div className="mt-3 flex items-center justify-end gap-3">
                    <p className="text-xs text-(--hd-muted)" aria-live="polite">
                      {isNote ? `Only visible to your team, not sent to ${first}.` : `${first} will see this by email.`}
                    </p>

                    <button
                      type="button"
                      onClick={send}
                      data-mode={mode}
                      className={cn(
                        'shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                        'data-[mode=note]:bg-amber-700 data-[mode=note]:text-white data-[mode=note]:hover:bg-amber-800',
                        'data-[mode=reply]:bg-(--hd-acc) data-[mode=reply]:text-(--hd-on-acc) data-[mode=reply]:hover:bg-(--hd-acc-hover)',
                        ring,
                      )}
                    >
                      {isNote ? 'Add note' : 'Send reply'}
                    </button>
                  </div>
                </div>
              </div>
            </main>

            <div aria-hidden onClick={() => setDetailsOpen(false)} className={cn('absolute inset-0 z-30 bg-(--hd-scrim) xl:hidden', detailsOpen ? 'block' : 'hidden')} />

            <aside
              id={detailsId}
              aria-label="Ticket details"
              className={cn(
                'absolute inset-y-0 end-0 z-40 w-72 shrink-0 space-y-6 overflow-y-auto border-s border-(--hd-line) bg-(--hd-panel) p-4 transition-[translate,visibility] duration-300 motion-reduce:transition-none xl:visible xl:static xl:translate-x-0 rtl:xl:translate-x-0',
                detailsOpen ? 'visible translate-x-0' : 'invisible translate-x-full rtl:-translate-x-full',
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar name={ticket.requester} className="size-10 text-sm" />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-(--hd-ink)">{ticket.requester}</p>
                  <p className="truncate text-xs text-(--hd-muted)">{ticket.email}</p>
                </div>
              </div>

              <dl className="space-y-3 border-t border-(--hd-line) pt-4 text-sm">
                {[
                  ['Plan', ticket.plan],
                  ['Customer since', ticket.since],
                  ['Open tickets', String(tickets.filter((t) => t.requester === ticket.requester && t.status !== 'Closed').length)],
                ].map(([term, value]) => (
                  <div key={term} className="flex items-center justify-between gap-3">
                    <dt className="text-(--hd-muted)">{term}</dt>
                    <dd className="text-right font-medium text-(--hd-ink)">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="space-y-3 border-t border-(--hd-line) pt-4">
                {[
                  { key: 'status', label: 'Status', options: STATUSES, value: ticket.status, set: (v: string) => edit({ status: v as Status }) },
                  { key: 'priority', label: 'Priority', options: PRIORITIES, value: ticket.priority, set: (v: string) => edit({ priority: v as Priority }) },
                  { key: 'assignee', label: 'Assignee', options: ASSIGNEES, value: ticket.assignee, set: (v: string) => edit({ assignee: v }) },
                ].map(({ key, label, options, value, set }) => (
                  <div key={key} className="space-y-1.5">
                    <label htmlFor={`${uid}-${key}`} className="block text-xs font-medium text-(--hd-body)">
                      {label}
                    </label>
                    <select id={`${uid}-${key}`} value={value} onChange={(event) => set(event.target.value)} className={cn('w-full px-2.5 py-2', field)}>
                      {options.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="border-t border-(--hd-line) pt-4">
                <p className="text-xs font-medium text-(--hd-body)">Tags</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ticket.tags.length === 0 && <span className="text-xs text-(--hd-muted)">No tags</span>}
                  {ticket.tags.map((id) => {
                    const t = TAGS.find((x) => x.id === id)!
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-(--hd-hover) px-2.5 py-0.5 text-xs text-(--hd-sub)">
                        <span className={cn('size-1.5 rounded-full', t.dot)} />
                        {t.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
