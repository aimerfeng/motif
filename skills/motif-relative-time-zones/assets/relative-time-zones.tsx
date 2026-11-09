// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/relative-time/index.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { createContext, useContext, useId, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'popover',
  zones: 'team',
  hour12: false,
  showSeconds: true,
  showDayNight: true,
  accent: '#38bdf8',
  radius: 10,
}
/* @motif:end */

const formatDate = (date: Date, timeZone: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'long', ...options, timeZone }).format(date)

const formatTime = (date: Date, timeZone: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', options ? { ...options, timeZone } : { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone }).format(date)

const hourIn = (date: Date, timeZone: string) =>
  Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone }).format(date)) % 24

type RelativeTimeContextType = {
  time: Date
  dateFormatOptions?: Intl.DateTimeFormatOptions
  timeFormatOptions?: Intl.DateTimeFormatOptions
}

const RelativeTimeContext = createContext<RelativeTimeContextType>({
  time: new Date(),
  dateFormatOptions: { dateStyle: 'long' },
  timeFormatOptions: { hour: '2-digit', minute: '2-digit' },
})

export type RelativeTimeProps = HTMLAttributes<HTMLDivElement> & {
  time?: Date
  defaultTime?: Date
  onTimeChange?: (time: Date) => void
  dateFormatOptions?: Intl.DateTimeFormatOptions
  timeFormatOptions?: Intl.DateTimeFormatOptions
}

/** Uncontrolled: ticks every second from the frame loop. Controlled: renders `time`. */
export const RelativeTime = ({ time: controlledTime, defaultTime, onTimeChange, dateFormatOptions, timeFormatOptions, className, ...props }: RelativeTimeProps) => {
  const host = useRef<HTMLDivElement>(null)
  const [internal, setInternal] = useState<Date>(() => defaultTime ?? new Date())
  const lastSecond = useRef(Math.floor(internal.getTime() / 1000))

  useFrameLoop(
    host,
    () => {
      if (controlledTime) return
      const now = new Date()
      const second = Math.floor(now.getTime() / 1000)
      if (second === lastSecond.current) return
      lastSecond.current = second
      setInternal(now)
      onTimeChange?.(now)
    },
    // A clock is information, not decoration: it keeps ticking with reduced motion.
    { reducedMotion: 'slowed' },
  )

  return (
    <RelativeTimeContext.Provider value={{ time: controlledTime ?? internal, dateFormatOptions, timeFormatOptions }}>
      <div ref={host} className={cn('grid gap-2', className)} {...props} />
    </RelativeTimeContext.Provider>
  )
}

export type RelativeTimeZoneProps = HTMLAttributes<HTMLDivElement> & { zone: string }

type RelativeTimeZoneContextType = { zone: string }

const RelativeTimeZoneContext = createContext<RelativeTimeZoneContextType>({ zone: 'UTC' })

export const RelativeTimeZone = ({ zone, className, ...props }: RelativeTimeZoneProps) => (
  <RelativeTimeZoneContext.Provider value={{ zone }}>
    <div className={cn('flex items-center justify-between gap-1.5 text-xs', className)} {...props} />
  </RelativeTimeZoneContext.Provider>
)

export type RelativeTimeZoneDisplayProps = HTMLAttributes<HTMLDivElement>

export const RelativeTimeZoneDisplay = ({ className, ...props }: RelativeTimeZoneDisplayProps) => {
  const { time, timeFormatOptions } = useContext(RelativeTimeContext)
  const { zone } = useContext(RelativeTimeZoneContext)
  return (
    <div className={cn('pl-8 text-muted-foreground tabular-nums', className)} {...props}>
      {formatTime(time, zone, timeFormatOptions)}
    </div>
  )
}

export type RelativeTimeZoneDateProps = HTMLAttributes<HTMLDivElement>

export const RelativeTimeZoneDate = ({ className, ...props }: RelativeTimeZoneDateProps) => {
  const { time, dateFormatOptions } = useContext(RelativeTimeContext)
  const { zone } = useContext(RelativeTimeZoneContext)
  return (
    <div className={className} {...props}>
      {formatDate(time, zone, dateFormatOptions)}
    </div>
  )
}

export type RelativeTimeZoneLabelProps = HTMLAttributes<HTMLDivElement>

export const RelativeTimeZoneLabel = ({ className, ...props }: RelativeTimeZoneLabelProps) => (
  <div className={cn('flex h-4 items-center justify-center rounded-xs bg-secondary px-1.5 font-mono', className)} {...props} />
)

/** Motif addition: a sun or moon for the hour in the row's zone. */
export const RelativeTimeZoneDayNight = ({ className, color }: { className?: string; color?: string }) => {
  const { time } = useContext(RelativeTimeContext)
  const { zone } = useContext(RelativeTimeZoneContext)
  const hour = hourIn(time, zone)
  const day = hour >= 6 && hour < 18
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-label={day ? 'Daytime' : 'Night'} role="img" className={cn('shrink-0', className)} style={{ color: day ? color : undefined }}>
      {day ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
        </g>
      ) : (
        <path d="M13.5 9.8A5.6 5.6 0 0 1 6.2 2.5a5.6 5.6 0 1 0 7.3 7.3Z" fill="currentColor" className="text-muted-foreground" />
      )}
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/* Motif preset component: a world-clock list, or a relative timestamp that  */
/* opens the same list on hover / focus.                                     */
/* ------------------------------------------------------------------------ */

export const ZONE_SETS: Record<string, { label: string; zone: string }[]> = {
  team: [
    { label: 'UTC', zone: 'UTC' },
    { label: 'EST', zone: 'America/New_York' },
    { label: 'GMT', zone: 'Europe/London' },
    { label: 'JST', zone: 'Asia/Tokyo' },
  ],
  americas: [
    { label: 'PST', zone: 'America/Los_Angeles' },
    { label: 'CST', zone: 'America/Chicago' },
    { label: 'EST', zone: 'America/New_York' },
    { label: 'BRT', zone: 'America/Sao_Paulo' },
  ],
  apac: [
    { label: 'IST', zone: 'Asia/Kolkata' },
    { label: 'SGT', zone: 'Asia/Singapore' },
    { label: 'CST', zone: 'Asia/Shanghai' },
    { label: 'AET', zone: 'Australia/Sydney' },
  ],
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
export function formatRelative(date: Date, now: Date) {
  const s = Math.round((date.getTime() - now.getTime()) / 1000)
  const abs = Math.abs(s)
  if (abs < 45) return rtf.format(s, 'second')
  if (abs < 2700) return rtf.format(Math.round(s / 60), 'minute')
  if (abs < 79200) return rtf.format(Math.round(s / 3600), 'hour')
  return rtf.format(Math.round(s / 86400), 'day')
}

export type RelativeTimeZonesProps = Partial<typeof defaults> & {
  /** The moment shown in the popover variant (e.g. when a deploy happened). Defaults to now. */
  date?: Date
  /** "Now": controlled clock. Omit to tick live. */
  time?: Date
  /** Custom zones; overrides the `zones` set. */
  zoneList?: { label: string; zone: string }[]
  /** Controlled popover state (popover variant). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Which edge of the trigger the popover lines up with. */
  align?: 'start' | 'end'
  className?: string
  style?: CSSProperties
}

function ZoneRows({ list, dayNight, accent }: { list: { label: string; zone: string }[]; dayNight: boolean; accent: string }) {
  return (
    <>
      {list.map(({ zone, label }) => (
        <RelativeTimeZone key={zone + label} zone={zone}>
          <RelativeTimeZoneLabel>{label}</RelativeTimeZoneLabel>
          <RelativeTimeZoneDate />
          <div className="flex items-center gap-1.5">
            {dayNight && <RelativeTimeZoneDayNight color={accent} />}
            <RelativeTimeZoneDisplay className={dayNight ? 'pl-2' : undefined} />
          </div>
        </RelativeTimeZone>
      ))}
    </>
  )
}

export function RelativeTimeZones({ date, time, zoneList, align = 'start', open: openProp, onOpenChange, className, style, ...props }: RelativeTimeZonesProps) {
  const o = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const id = useId()
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const setOpen = (v: boolean) => {
    setOpenState(v)
    onOpenChange?.(v)
  }
  const list = zoneList ?? ZONE_SETS[o.zones] ?? ZONE_SETS.team!
  const timeFormatOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', ...(o.showSeconds ? { second: '2-digit' } : {}), hour12: o.hour12 }
  const panelStyle = { borderRadius: o.radius } as CSSProperties

  if (o.variant === 'list') {
    return (
      <div className={cn('rounded-md border bg-background p-4', className)} style={{ ...panelStyle, ...style }}>
        <RelativeTime time={time} timeFormatOptions={timeFormatOptions}>
          <ZoneRows list={list} dayNight={o.showDayNight} accent={o.accent} />
        </RelativeTime>
      </div>
    )
  }

  return (
    <RelativeTime time={time} timeFormatOptions={timeFormatOptions} className={cn('relative inline-grid', className)} style={style}>
      <Trigger date={date} accent={o.accent} id={id} open={open} setOpen={setOpen} />
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="tooltip"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: 'spring', visualDuration: 0.18, bounce: 0 }}
            className={cn('absolute top-full z-20 mt-2 w-[min(320px,calc(100vw-32px))] border bg-popover p-3 text-popover-foreground shadow-xl shadow-black/30', align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left')}
            style={panelStyle}
          >
            <DatedRows date={date} list={list} dayNight={o.showDayNight} accent={o.accent} />
          </motion.div>
        )}
      </AnimatePresence>
    </RelativeTime>
  )
}

function Trigger({ date, accent, id, open, setOpen }: { date?: Date; accent: string; id: string; open: boolean; setOpen: (v: boolean) => void }) {
  const { time } = useContext(RelativeTimeContext)
  const at = date ?? time
  return (
    <time
      dateTime={at.toISOString()}
      tabIndex={0}
      aria-describedby={open ? id : undefined}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      className="cursor-default justify-self-start rounded-sm text-sm underline decoration-dotted underline-offset-4 outline-none tabular-nums focus-visible:ring-2 focus-visible:ring-ring"
      style={{ textDecorationColor: accent }}
    >
      {formatRelative(at, time)}
    </time>
  )
}

/** The popover shows the event moment (`date`), not the ticking clock. */
function DatedRows({ date, list, dayNight, accent }: { date?: Date; list: { label: string; zone: string }[]; dayNight: boolean; accent: string }) {
  const ctx = useContext(RelativeTimeContext)
  return (
    <RelativeTimeContext.Provider value={{ ...ctx, time: date ?? ctx.time }}>
      <div className="grid gap-2">
        <ZoneRows list={list} dayNight={dayNight} accent={accent} />
      </div>
    </RelativeTimeContext.Provider>
  )
}
