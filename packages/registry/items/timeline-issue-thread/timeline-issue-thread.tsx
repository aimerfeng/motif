// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-536.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@motif/runtime'
import { createContext, useContext, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  mode: 'thread',
  bubbleStyle: 'outline',
  avatarSize: 24,
  railStyle: 'solid',
  accent: '#a1a1aa',
  showTimestamps: true,
  relativeTime: true,
}
/* @motif:end */

/* ---------- Timeline primitives (ported from ui/timeline.tsx, vertical only) ---------- */

const TimelineContext = createContext<{ activeStep: number }>({ activeStep: 0 })

function Timeline({ activeStep, className, ...props }: HTMLAttributes<HTMLOListElement> & { activeStep: number }) {
  return (
    <TimelineContext.Provider value={{ activeStep }}>
      <ol className={cn('group/timeline flex flex-col', className)} data-orientation="vertical" data-slot="timeline" {...props} />
    </TimelineContext.Provider>
  )
}

function TimelineItem({ step, className, ...props }: HTMLAttributes<HTMLLIElement> & { step: number }) {
  const { activeStep } = useContext(TimelineContext)
  return (
    <li
      className={cn('group/timeline-item relative flex flex-1 flex-col gap-0.5', className)}
      data-completed={step <= activeStep || undefined}
      data-slot="timeline-item"
      {...props}
    />
  )
}

function TimelineContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-sm text-muted-foreground', className)} data-slot="timeline-content" {...props} />
}

function TimelineDate({ className, ...props }: HTMLAttributes<HTMLTimeElement>) {
  return <time className={cn('mb-1 block text-xs font-medium text-muted-foreground', className)} data-slot="timeline-date" {...props} />
}

/* ---------- Data ---------- */

export type ThreadAction = 'post' | 'reply' | 'edit' | 'create' | 'open' | 'assign' | 'close'

export type ThreadEntry = {
  id: number
  user: string
  action: ThreadAction
  /** Header text in thread mode (e.g. "opened a new issue"). */
  actionText?: string
  description?: string
  /** Seconds before `now`. */
  ago: number
}

export const sampleThread: ThreadEntry[] = [
  { id: 1, user: 'Hannah Kandell', action: 'open', actionText: 'opened a new issue', ago: 900, description: "I'm having trouble with the new component library. It's not rendering properly." },
  { id: 2, user: 'Chris Tompson', action: 'reply', actionText: 'commented on', ago: 600, description: 'Hey Hannah, I can reproduce it on 2.4.1. The popover renders before its anchor is measured.' },
  { id: 3, user: 'Emma Davis', action: 'assign', actionText: 'assigned you to', ago: 300, description: 'The new component library is not rendering properly. Can you take a look?' },
  { id: 4, user: 'Alex Morgan', action: 'close', actionText: 'closed the issue', ago: 120, description: 'The issue has been fixed. Please review the changes.' },
]

export const sampleLog: ThreadEntry[] = [
  { id: 1, user: 'Matt', action: 'post', ago: 59 },
  { id: 2, user: 'Matt', action: 'reply', ago: 180 },
  { id: 3, user: 'Matt', action: 'edit', ago: 300 },
  { id: 4, user: 'Matt', action: 'create', ago: 600 },
]

const ACTION_TEXT: Record<ThreadAction, string> = {
  create: 'created a new project',
  edit: 'edited a post',
  post: 'wrote a new post',
  reply: 'replied to a comment',
  open: 'opened a new issue',
  assign: 'assigned an issue',
  close: 'closed an issue',
}

function getRelativeTimeString(diffInSeconds: number): string {
  const s = Math.max(0, Math.floor(diffInSeconds))
  if (s < 60) return `${s} ${s === 1 ? 'second' : 'seconds'} ago`
  if (s < 3600) {
    const minutes = Math.floor(s / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }
  if (s < 86400) {
    const hours = Math.floor(s / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  const days = Math.floor(s / 86400)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

/** Absolute clock time relative to a fixed 14:20 reference (no locale / timezone dependence). */
function getClockString(diffInSeconds: number): string {
  const total = ((14 * 3600 + 20 * 60 - Math.floor(diffInSeconds)) % 86400 + 86400) % 86400
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  return `Today at ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/* ---------- Avatars (gradient initials instead of photos) ---------- */

const GRADIENTS: [string, string][] = [
  ['#7c3aed', '#db2777'],
  ['#0369a1', '#0891b2'],
  ['#b45309', '#dc2626'],
  ['#047857', '#0d9488'],
  ['#4338ca', '#2563eb'],
]

function hash(text: string) {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h)
}

function Avatar({ name, className }: { name: string; className?: string }) {
  const [a, b] = GRADIENTS[hash(name) % GRADIENTS.length]
  const initials = name
    .split(/\s+/)
    .map((p) => p[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <span
      role="img"
      aria-label={name}
      className={cn('inline-flex size-[var(--tl-av)] shrink-0 items-center justify-center rounded-full font-semibold text-white select-none', className)}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})`, fontSize: 'calc(var(--tl-av) * 0.4)' }}
    >
      {initials}
    </span>
  )
}

/* ---------- Icons (inline lucide-style SVGs) ---------- */

function ActionIcon({ action }: { action: ThreadAction }) {
  let path: ReactNode
  switch (action) {
    case 'create':
      path = <path d="M5 12h14M12 5v14" />
      break
    case 'edit':
      path = <path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5zM15 5l4 4" />
      break
    case 'post':
      path = <path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      break
    case 'reply':
      path = <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      break
    case 'open':
      path = (
        <>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="1" />
        </>
      )
      break
    case 'assign':
      path = (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6M22 11h-6" />
        </>
      )
      break
    case 'close':
      path = (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </>
      )
      break
  }
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground/80">
      {path}
    </svg>
  )
}

/* ---------- Component ---------- */

export type IssueThreadProps = Partial<typeof defaults> & {
  items?: ThreadEntry[]
  /** Items with step <= activeStep get the accent rail and avatar ring. */
  activeStep?: number
  /** Seconds added to every item's age (lets a page or demo tick relative times). */
  elapsed?: number
  label?: string
  className?: string
  style?: CSSProperties
}

export function IssueThread({ items, activeStep, elapsed = 0, label, className, style, ...props }: IssueThreadProps) {
  const options = { ...defaults, ...props } as {
    mode: string
    bubbleStyle: string
    avatarSize: number
    showTimestamps: boolean
    relativeTime: boolean
    railStyle: string
    accent: string
  }
  const isLog = options.mode === 'log'
  const list = items ?? (isLog ? sampleLog : sampleThread)
  const step = activeStep ?? list.length
  const when = (ago: number) => (options.relativeTime ? getRelativeTimeString(ago + elapsed) : getClockString(ago))

  const vars = cssVars({ '--tl-av': `${options.avatarSize}px`, '--tl-accent': options.accent }, style)

  if (isLog) {
    return (
      <div className={cn('space-y-3', className)} style={vars}>
        <div className="text-xs font-medium text-muted-foreground">{label ?? 'Activity'}</div>
        <Timeline activeStep={step} aria-label={label ?? 'Activity'}>
          {list.map((item) => (
            <TimelineItem className="m-0 flex-row items-center gap-3 py-2.5" key={item.id} step={item.id}>
              <ActionIcon action={item.action} />
              <Avatar name={item.user} />
              <TimelineContent className="min-w-0 text-foreground">
                <a className="rounded-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tl-accent)]" href="#">
                  {item.user}
                </a>
                <span className="font-normal">
                  {' '}
                  {ACTION_TEXT[item.action]}
                  {options.showTimestamps ? (
                    <>
                      {' '}
                      <a className="rounded-sm text-muted-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tl-accent)]" href="#">
                        <time>{when(item.ago)}</time>
                      </a>
                    </>
                  ) : null}
                </span>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    )
  }

  const rail =
    options.railStyle === 'dashed'
      ? 'bg-[repeating-linear-gradient(to_bottom,currentColor_0_4px,transparent_4px_8px)] text-[color-mix(in_oklab,var(--tl-accent)_25%,transparent)] group-data-completed/timeline-item:text-[var(--tl-accent)]'
      : 'bg-[color-mix(in_oklab,var(--tl-accent)_12%,transparent)] group-data-completed/timeline-item:bg-[var(--tl-accent)]'

  const bubble =
    options.bubbleStyle === 'filled'
      ? 'mt-2 rounded-lg bg-muted px-4 py-3 text-foreground'
      : options.bubbleStyle === 'plain'
        ? 'mt-1 text-foreground/90'
        : 'mt-2 rounded-lg border px-4 py-3 text-foreground'

  return (
    <Timeline activeStep={step} className={className} style={vars} aria-label={label ?? 'Issue thread'}>
      {list.map((item) => (
        <TimelineItem className="ms-[calc(var(--tl-av)+1rem)] not-last:pb-8" key={item.id} step={item.id}>
          <div data-slot="timeline-header">
            <div
              aria-hidden="true"
              data-slot="timeline-separator"
              className={cn(
                'absolute left-[calc(var(--tl-av)*-0.5-1rem)] h-[calc(100%-var(--tl-av)-0.25rem)] w-0.5 -translate-x-1/2 translate-y-[calc(var(--tl-av)+0.125rem)] self-start transition-[background-color,color] duration-500 group-last/timeline-item:hidden motion-reduce:transition-none',
                rail,
              )}
            />
            <h3 className="mt-0.5 text-sm font-medium text-foreground" style={{ minHeight: `calc(var(--tl-av) - 0.25rem)` }}>
              {item.user}{' '}
              <span className="text-sm font-normal text-muted-foreground">{item.actionText ?? ACTION_TEXT[item.action]}</span>
            </h3>
            <div
              aria-hidden="true"
              data-slot="timeline-indicator"
              className="absolute top-0 left-[calc(var(--tl-av)*-0.5-1rem)] flex size-[var(--tl-av)] -translate-x-1/2 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--tl-accent)_10%,transparent)] ring-2 ring-transparent ring-offset-2 ring-offset-background transition-[box-shadow] duration-500 group-data-completed/timeline-item:ring-[var(--tl-accent)] motion-reduce:transition-none"
            >
              <Avatar name={item.user} />
            </div>
          </div>
          <TimelineContent className={bubble}>
            {item.description}
            {options.showTimestamps ? <TimelineDate className="mt-1 mb-0">{when(item.ago)}</TimelineDate> : null}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}
