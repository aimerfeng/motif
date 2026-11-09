// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/widgets/Countdown.astro
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/widgets/Timeline.astro
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/widgets/Team.astro
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/widgets/Pricing.astro
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { cn, useFrameLoop } from '@motif/runtime'
import { Button, Headline, Icon, PatternAvatar, WidgetWrapper, headingStyle } from './parts'

/* ---------- 页眉 ---------- */

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <path d="M9 9h8v6h6v8h-8v-6H9z" fill="var(--primary-foreground)" />
      <path d="M17 9h6v6h-6z" fill="var(--primary-foreground)" opacity="0.45" />
    </svg>
  )
}

const NAV = [
  { href: '#schedule', label: 'Schedule' },
  { href: '#speakers', label: 'Speakers' },
  { href: '#venue', label: 'Venue' },
  { href: '#tickets', label: 'Tickets' },
]

export function Header({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-[color-mix(in_oklab,var(--background)_90%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-2.5 rounded-lg text-xl text-foreground outline-none focus-visible:ring-2 focus-visible:ring-(--primary)" style={headingStyle}>
          <Mark />
          <span className="truncate">{name}</span>
        </a>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 text-[15px] font-medium">
            {NAV.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="rounded-lg px-3 py-2 text-(--text) outline-none transition-colors duration-200 hover:text-(--primary-text) focus-visible:ring-2 focus-visible:ring-(--primary)">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Button variant="primary" href="#tickets" className="shrink-0 px-5 py-2 text-sm md:px-5">
          Get tickets
        </Button>
      </div>
    </header>
  )
}

/* ---------- 首屏 + 倒计时（Countdown.astro） ---------- */

const LABELS = { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' } as const
type Unit = keyof typeof LABELS

function split(seconds: number): Record<Unit, string> {
  return {
    days: String(Math.floor(seconds / 86400)),
    hours: String(Math.floor((seconds % 86400) / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((seconds % 3600) / 60)).padStart(2, '0'),
    seconds: String(seconds % 60).padStart(2, '0'),
  }
}

/**
 * 倒计时：上游用 setInterval 每秒读 Date.now()；这里由 useFrameLoop 驱动，只在秒数变化时重新渲染。
 * 传了 now（毫秒时间戳）就从那一刻按帧时间往下数，海报和录屏每次都一样；不传就读真实时钟。
 */
function Countdown({ startsAt, now, expiredText }: { startsAt: string; now?: number; expiredText: string }) {
  const host = useRef<HTMLDivElement>(null)
  const target = Date.parse(startsAt)
  const [left, setLeft] = useState<number | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (Number.isNaN(target)) return
      const clock = now === undefined ? Date.now() : now + time * 1000
      const seconds = Math.max(0, Math.floor((target - clock) / 1000))
      setLeft((prev) => (prev === seconds ? prev : seconds))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const iso = Number.isNaN(target) ? undefined : new Date(target).toISOString()
  const formatted = Number.isNaN(target) ? startsAt : `${new Intl.DateTimeFormat('en', { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' }).format(target)} UTC`
  const units = left === null ? null : split(left)

  return (
    <div ref={host} className="block text-center">
      {left === null || units === null ? (
        <p className="text-lg text-muted-foreground">
          <time dateTime={iso}>{formatted}</time>
        </p>
      ) : left === 0 ? (
        <p className="text-2xl font-bold text-foreground">{expiredText}</p>
      ) : (
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4" role="timer" aria-live="off" aria-label={`Starts in ${units.days} days, ${units.hours} hours and ${units.minutes} minutes`}>
          {(Object.keys(LABELS) as Unit[]).map((unit) => (
            <div key={unit} className="rounded-2xl border border-border bg-card p-4">
              <span className="block text-4xl tabular-nums text-foreground md:text-5xl" style={headingStyle}>
                {units[unit]}
              </span>
              <span className="mt-1 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">{LABELS[unit]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** 首屏背景：按格子哈希出来的几何图块，中间留空给标题。 */
function HeroPattern() {
  const tiles = []
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 20; c++) {
      const h = (r * 73856093) ^ (c * 19349663)
      const kind = Math.abs(h) % 7
      const x = c * 60
      const y = r * 60
      const color = (r + c) % 3 === 0 ? 'var(--accent2)' : 'var(--primary)'
      const rot = (Math.abs(h >> 4) % 4) * 90
      const t = `rotate(${rot} ${x + 30} ${y + 30})`
      if (kind === 0) tiles.push(<path key={`${r}-${c}`} d={`M${x} ${y + 60}a60 60 0 0 1 60 -60v60z`} fill={color} transform={t} />)
      else if (kind === 1) tiles.push(<path key={`${r}-${c}`} d={`M${x} ${y + 60}a30 30 0 0 1 60 0z`} fill={color} transform={t} />)
      else if (kind === 2) tiles.push(<circle key={`${r}-${c}`} cx={x + 30} cy={y + 30} r="9" fill={color} />)
      else if (kind === 3) tiles.push(<rect key={`${r}-${c}`} x={x + 12} y={y + 12} width="36" height="36" fill="none" stroke={color} strokeWidth="3" />)
    }
  }
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(60%_70%_at_50%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]" />
      <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMin slice" className="absolute inset-x-0 top-0 h-full w-full opacity-[0.22] [mask-image:radial-gradient(ellipse_48%_52%_at_50%_42%,transparent_45%,black_100%)]">
        {tiles}
      </svg>
    </div>
  )
}

export function Hero({ name, dates, city, startsAt, now }: { name: string; dates: string; city: string; startsAt: string; now?: number }) {
  return (
    <WidgetWrapper id="top" containerClass="max-w-4xl mx-auto pt-16 md:pt-24 lg:pt-28" bg={<HeroPattern />}>
      <Headline
        as="h1"
        tagline={
          <span className="inline-flex flex-wrap items-center justify-center gap-x-2">
            <span>{dates}</span>
            <span aria-hidden="true">·</span>
            <span>{city}</span>
          </span>
        }
        title={name}
        titleClass="mt-3 text-5xl [overflow-wrap:anywhere] md:text-7xl"
        subtitle="Two days for people who design in code and code with taste: design systems, motion, prototyping and the tools that ship them. 28 talks, 6 workshops, 600 seats."
      />
      <Countdown startsAt={startsAt} now={now} expiredText="Doors are open. See you in the Main Hall." />
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="primary" href="#tickets">
          Get tickets
          <Icon name="arrow" className="-mr-1.5 ml-1 inline-block" />
        </Button>
        <Button href="#schedule">See the schedule</Button>
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 日程（Timeline.astro + 日期选项卡、分会场筛选） ---------- */

type Track = 'main' | 'design' | 'engineering' | 'workshop' | 'break'
type Session = { time: string; label: string; title: string; meta: string; description: string; track: Track }

const DAYS: { id: string; tab: string; date: string; sessions: Session[] }[] = [
  {
    id: 'day-1',
    tab: 'Day 1',
    date: 'Thu',
    sessions: [
      { time: '08:30', label: 'Doors open', title: 'Registration and coffee', meta: 'Foyer', description: 'Pick up your badge at the river entrance. Breakfast is served until 09:15.', track: 'break' },
      { time: '09:30', label: 'Keynote', title: 'The interface is the spec', meta: 'Ines Carvalho · Main Hall', description: 'Why the teams that ship the best products stopped handing off mockups, and what they hand over instead.', track: 'main' },
      { time: '10:30', label: 'Design', title: 'Tokens that survive a rebrand', meta: 'Mara Lindqvist · Studio A', description: 'Naming, aliasing and the three-tier structure that let one team swap brand colours across 14 apps in a week.', track: 'design' },
      { time: '10:30', label: 'Engineering', title: 'Layout without breakpoints', meta: 'Tomás Reyes · Studio B', description: 'Container queries, intrinsic sizing and clamp(): a component library that never asks for the viewport.', track: 'engineering' },
      { time: '11:30', label: 'Workshop · 3 h', title: 'Prototyping with springs', meta: 'Kenji Okafor · Workshop Loft', description: 'Build a gesture-driven card stack by hand, tune it on a phone and leave with the code. Bring a laptop.', track: 'workshop' },
      { time: '12:45', label: 'Lunch', title: 'Lunch on the terrace', meta: 'River terrace', description: 'Vegetarian by default; tell us about allergies when you register.', track: 'break' },
      { time: '14:00', label: 'Design', title: 'Motion is a design material', meta: 'Aurélie Dubois · Studio A', description: 'Easing curves as brand assets: how a motion spec gets written, reviewed and kept consistent.', track: 'design' },
      { time: '14:00', label: 'Engineering', title: 'Shipping a design system to 40 teams', meta: 'Hana Takeda · Studio B', description: 'Versioning, codemods and the deprecation policy that kept adoption above 90% for three years.', track: 'engineering' },
      { time: '16:30', label: 'Panel', title: 'Who owns the last 10%?', meta: 'Four speakers · Main Hall', description: 'Designers and engineers on polish, review culture and the details nobody puts in a ticket.', track: 'main' },
      { time: '18:30', label: 'Social', title: 'Rooftop drinks', meta: 'Level 3 terrace', description: 'Badge required. Soft drinks and a quiet corner for anyone who has had enough talking.', track: 'break' },
    ],
  },
  {
    id: 'day-2',
    tab: 'Day 2',
    date: 'Fri',
    sessions: [
      { time: '09:00', label: 'Doors open', title: 'Coffee and pastries', meta: 'Foyer', description: 'The Main Hall opens at 09:20. Live captions run on the side screens all day.', track: 'break' },
      { time: '09:30', label: 'Keynote', title: 'Accessibility is a layout problem', meta: 'Priya Raman · Main Hall', description: 'Focus order, reading order and reflow: the bugs that start in the grid, long before anyone writes ARIA.', track: 'main' },
      { time: '10:30', label: 'Design', title: 'Prototypes that answer one question', meta: 'Lea Novak · Studio A', description: 'A throwaway prototype is a research tool. How to scope it to one question and stop before it turns into a product.', track: 'design' },
      { time: '10:30', label: 'Engineering', title: 'Sixty frames on a budget phone', meta: 'Noor Haddad · Studio B', description: 'Profiling a design-heavy app on a four-year-old Android: what to measure, what to cut and what people notice.', track: 'engineering' },
      { time: '11:30', label: 'Workshop · 3 h', title: 'Accessible components from scratch', meta: 'Priya Raman · Workshop Loft', description: 'Build a combobox, a dialog and a tab set with keyboard support, then test them with a screen reader.', track: 'workshop' },
      { time: '12:45', label: 'Lunch', title: 'Lunch on the terrace', meta: 'River terrace', description: 'Speakers host tables by topic; sign-up sheets are at the coffee bar.', track: 'break' },
      { time: '14:00', label: 'Design', title: 'Critique without the theatre', meta: 'Jonas Weber · Studio A', description: 'A review format that gets to useful feedback in twenty minutes, with the templates to run it.', track: 'design' },
      { time: '14:00', label: 'Engineering', title: 'Your design tool is a compiler', meta: 'Leo Mbeki · Studio B', description: 'Generating typed components from design files, and where the round trip breaks down.', track: 'engineering' },
      { time: '16:30', label: 'Closing keynote', title: 'Make the tool you wish you had', meta: 'Samuel Achterberg · Main Hall', description: 'Small, personal software as a design practice: six tools built in a weekend and still in use years later.', track: 'main' },
    ],
  },
]

const TRACKS: { id: Exclude<Track, 'main' | 'break'>; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'workshop', label: 'Workshops' },
]

const TRACK_STYLE: Record<Track, { icon: string; color: string; text: string }> = {
  main: { icon: 'mic', color: 'var(--primary)', text: 'var(--primary-text)' },
  design: { icon: 'pen', color: 'var(--primary)', text: 'var(--primary-text)' },
  engineering: { icon: 'code', color: 'var(--accent2)', text: 'var(--accent2-text)' },
  workshop: { icon: 'tool', color: 'var(--text)', text: 'var(--text)' },
  break: { icon: 'coffee', color: 'var(--text)', text: 'var(--muted-foreground)' },
}

export function Schedule({ layout }: { layout: string }) {
  const reduced = useReducedMotion()
  const [day, setDay] = useState(0)
  const [track, setTrack] = useState<'all' | Track>('all')
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const alternate = layout === 'alternate'
  const current = DAYS[day]!
  // 主会场和茶歇属于所有分会场：筛选时始终保留。
  const items = current.sessions.filter((s) => track === 'all' || s.track === track || s.track === 'main' || s.track === 'break')

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? DAYS.length - 1 : (day + (event.key === 'ArrowRight' ? 1 : -1) + DAYS.length) % DAYS.length
    setDay(next)
    tabs.current[next]?.focus()
  }

  const chip = 'rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-[background-color,border-color,color] duration-200 focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 focus-visible:ring-offset-background'

  return (
    <WidgetWrapper id="schedule" containerClass="max-w-5xl mx-auto">
      <Headline tagline="Schedule" title="Two days, three rooms" subtitle="Talks run in two studios in parallel; keynotes, the panel and every break happen together." />

      <div className="mb-10 flex flex-col items-center gap-4 md:mb-12">
        <div role="tablist" aria-label="Conference day" className="inline-flex rounded-full border border-border bg-card p-1 text-sm font-medium">
          {DAYS.map((d, i) => (
            <button
              key={d.id}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${d.id}-tab`}
              aria-selected={i === day}
              aria-controls={`${d.id}-panel`}
              tabIndex={i === day ? 0 : -1}
              onClick={() => setDay(i)}
              onKeyDown={onTabKey}
              data-active={i === day ? '' : undefined}
              className="rounded-full px-4 py-1.5 text-(--text) outline-none transition-[background-color,color] duration-200 focus-visible:ring-2 focus-visible:ring-(--primary) data-[active]:bg-(--primary) data-[active]:text-(--primary-foreground)"
            >
              {d.tab} <span className="opacity-70">· {d.date}</span>
            </button>
          ))}
        </div>
        <div role="group" aria-label="Filter by track" className="flex flex-wrap justify-center gap-2">
          {[{ id: 'all' as const, label: 'All tracks' }, ...TRACKS].map((t) => {
            const active = track === t.id
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => setTrack(t.id)}
                className={cn(chip, active ? 'border-foreground bg-foreground text-background' : 'border-border bg-transparent text-(--text) hover:border-[color-mix(in_oklab,var(--text)_45%,transparent)]')}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div role="tabpanel" id={`${current.id}-panel`} aria-labelledby={`${current.id}-tab`} className={cn('relative', alternate ? '' : 'mx-auto max-w-3xl')}>
        {/* 上游把竖线放在 <ol> 里；挪到外面，列表里只剩 <li>。 */}
        <div className={cn('absolute top-0 bottom-0 w-px bg-[color-mix(in_oklab,var(--text)_14%,transparent)]', alternate ? 'left-5 lg:left-1/2 lg:-translate-x-px' : 'left-5')} aria-hidden="true" />
        <ol className={cn('relative list-none', alternate ? 'lg:grid lg:grid-cols-2' : '')}>
          {items.map((item, index) => {
            const ghost = item.track === 'break'
            const highlight = item.track === 'main'
            const style = TRACK_STYLE[item.track]
            return (
              <motion.li
                key={`${current.id}-${track}-${item.time}-${item.title}`}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.04, ease: 'easeOut' }}
                style={{ '--track': style.color, '--track-text': style.text } as CSSProperties}
                className={cn(
                  'relative pb-10 pl-14 last:pb-0',
                  ghost ? 'opacity-80' : '',
                  alternate ? (index % 2 === 0 ? 'lg:col-start-1 lg:pr-16 lg:pl-0 lg:text-right' : 'lg:col-start-2 lg:pl-16') : '',
                  alternate && index % 2 === 1 ? 'lg:mt-24' : '',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background',
                    ghost
                      ? 'border-dashed border-[color-mix(in_oklab,var(--text)_40%,transparent)] text-muted-foreground'
                      : highlight
                        ? 'border-(--track) bg-(--track) text-(--primary-foreground)'
                        : 'border-[color-mix(in_oklab,var(--track)_45%,transparent)] text-(--track-text)',
                    alternate ? (index % 2 === 0 ? 'lg:-right-5 lg:left-auto' : 'lg:-left-5') : '',
                  )}
                  aria-hidden="true"
                >
                  <Icon name={style.icon} />
                </span>
                <time className={cn('block text-sm font-semibold tracking-wide uppercase', ghost ? 'text-muted-foreground' : 'text-(--track-text)')}>
                  {item.time} · {item.label}
                </time>
                <h3 className={cn('mt-1 text-xl font-bold', ghost ? 'text-muted-foreground italic' : 'text-foreground')}>{item.title}</h3>
                <p className="mt-1 text-sm font-medium text-(--text)">{item.meta}</p>
                <p className="mt-2 text-pretty text-muted-foreground">{item.description}</p>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 讲者（Team.astro） ---------- */

const SPEAKERS = [
  { name: 'Ines Carvalho', role: 'Design Director, Fieldnote', bio: 'Opening keynote on replacing handoff with working interfaces.' },
  { name: 'Tomás Reyes', role: 'Staff Engineer, Quillstack', bio: 'Builds layout primitives that hold up from a watch to a wall.' },
  { name: 'Mara Lindqvist', role: 'Design Systems Lead, Halden', bio: 'Ran the token migration behind a 14-app rebrand.' },
  { name: 'Kenji Okafor', role: 'Prototyper, Loomwork', bio: 'Tunes springs for a living; hosts the Day 1 workshop.' },
  { name: 'Priya Raman', role: 'Accessibility Engineer, Openfold', bio: 'Day 2 keynote, and the components-from-scratch workshop.' },
  { name: 'Aurélie Dubois', role: 'Motion Designer, Studio Brume', bio: 'Writes motion specs that engineers actually read.' },
  { name: 'Hana Takeda', role: 'Engineering Manager, Tessellate', bio: 'Leads the design system used by 40 product teams.' },
  { name: 'Samuel Achterberg', role: 'Creative Technologist, Kiln', bio: 'Closing keynote on small software you build for yourself.' },
]

export function Speakers({ accent, secondaryAccent }: { accent: string; secondaryAccent: string }) {
  return (
    <WidgetWrapper id="speakers" containerClass="max-w-6xl mx-auto" bg={<div className="absolute inset-0 bg-[color-mix(in_oklab,var(--primary)_5%,var(--background))]" />}>
      <Headline tagline="Speakers" title="People who ship interfaces" subtitle="Eight of the 24 speakers. Every talk is 30 minutes plus questions, and every slide deck is published afterwards." />
      <ul className="grid list-none gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-10 lg:grid-cols-4">
        {SPEAKERS.map(({ name, role, bio }) => (
          <li key={name} className="text-center">
            <PatternAvatar name={name} accent={accent} secondary={secondaryAccent} className="mx-auto h-32 w-32 shadow-md md:h-36 md:w-36" />
            <h3 className="mt-4 text-lg font-bold text-foreground">{name}</h3>
            <p className="text-sm font-medium text-(--primary-text)">{role}</p>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">{bio}</p>
            <ul className="mt-3 flex justify-center gap-1">
              {[
                { icon: 'globe', label: `${name}'s website` },
                { icon: 'at', label: `${name}'s social profile` },
              ].map((social) => (
                <li key={social.icon}>
                  <a
                    href="#"
                    onClick={(event) => event.preventDefault()}
                    aria-label={social.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground outline-none transition-[background-color,color] duration-150 hover:bg-(--soft) hover:text-(--primary-text) focus-visible:ring-2 focus-visible:ring-(--primary)"
                  >
                    <Icon name={social.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </WidgetWrapper>
  )
}

/* ---------- 场地 ---------- */

const ROOMS = [
  { n: 1, name: 'Main Hall', note: 'Keynotes and the panel, 600 seats', color: 'var(--primary)', ink: 'var(--primary-foreground)', x: 56, y: 56, w: 250, h: 140 },
  { n: 2, name: 'Studio A', note: 'Design track', color: 'var(--primary)', ink: 'var(--primary-foreground)', x: 318, y: 56, w: 186, h: 66 },
  { n: 3, name: 'Studio B', note: 'Engineering track', color: 'var(--accent2)', ink: 'var(--accent2-foreground)', x: 318, y: 130, w: 186, h: 66 },
  { n: 4, name: 'Workshop Loft', note: 'Workshops, 40 seats each', color: 'var(--text)', ink: 'var(--background)', x: 56, y: 208, w: 150, h: 66 },
  { n: 5, name: 'Registration', note: 'Badges, cloakroom, help desk', color: 'var(--text)', ink: 'var(--background)', x: 218, y: 208, w: 140, h: 66 },
  { n: 6, name: 'Coffee bar', note: 'Open all day, terrace access', color: 'var(--text)', ink: 'var(--background)', x: 370, y: 208, w: 134, h: 66 },
]

function VenueMap() {
  return (
    <svg viewBox="0 0 560 380" className="block h-auto w-full" role="img" aria-label="Floor plan of Pier 7: the Main Hall, two studios, the workshop loft, registration and the coffee bar, with the entrance on the river side.">
      <rect x="0" y="0" width="560" height="380" fill="var(--soft)" />
      {/* 街道 */}
      <rect x="0" y="10" width="560" height="14" fill="color-mix(in oklab, var(--text) 8%, transparent)" />
      <text x="20" y="21" fontSize="10" fill="var(--muted-foreground)" letterSpacing="2">HARBOUR ROAD</text>
      {/* 河 */}
      <rect x="0" y="318" width="560" height="62" fill="color-mix(in oklab, var(--accent2) 16%, transparent)" />
      {[334, 350, 366].map((y) => (
        <path key={y} d={`M0 ${y} q 20 -6 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0`} fill="none" stroke="var(--accent2)" strokeOpacity="0.35" strokeWidth="1.5" />
      ))}
      {/* 建筑 */}
      <rect x="40" y="40" width="480" height="250" rx="14" fill="var(--card)" stroke="color-mix(in oklab, var(--text) 30%, transparent)" strokeWidth="2" />
      {ROOMS.map((room) => (
        <g key={room.n}>
          <rect x={room.x} y={room.y} width={room.w} height={room.h} rx="8" fill={`color-mix(in oklab, ${room.color} ${room.n <= 3 ? 16 : 7}%, var(--card))`} stroke={`color-mix(in oklab, ${room.color} 40%, transparent)`} strokeWidth="1.5" />
          <circle cx={room.x + 22} cy={room.y + 22} r="13" fill={room.color} />
          <text x={room.x + 22} y={room.y + 27} textAnchor="middle" fontSize="14" fontWeight="700" fill={room.ink}>
            {room.n}
          </text>
          <text x={room.x + 40} y={room.y + 27} fontSize="14" fontWeight="600" fill="var(--foreground)" className="max-sm:hidden">
            {room.name}
          </text>
        </g>
      ))}
      {/* 主会场的座位排 */}
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M${96 + i * 4} ${112 + i * 15} h${170 - i * 8}`} stroke="color-mix(in oklab, var(--primary) 45%, transparent)" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 9" />
      ))}
      {/* 入口 */}
      <rect x="268" y="284" width="40" height="12" rx="3" fill="var(--soft)" />
      <path d="M288 312v-26M280 294l8-8 8 8" fill="none" stroke="var(--foreground)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="320" y="310" fontSize="12" fontWeight="600" fill="var(--foreground)">
        Entrance
      </text>
      {/* 指北针 */}
      <g transform="translate(528 58)">
        <circle r="14" fill="var(--card)" stroke="color-mix(in oklab, var(--text) 30%, transparent)" />
        <path d="M0 -9l5 12-5-3-5 3z" fill="var(--foreground)" />
      </g>
    </svg>
  )
}

export function Venue({ city }: { city: string }) {
  const details = [
    { icon: 'pin', title: 'Pier 7, Harbour Road 12', text: `${city}. A restored 1920s cargo shed on the river, five minutes from the old town.` },
    { icon: 'train', title: 'Getting there', text: 'Tram 15 stops at Harbour Road, two minutes on foot. Bike racks and EV chargers at the east gate.' },
    { icon: 'access', title: 'Access', text: 'Step-free entrance, lifts to every level, live captions in the Main Hall and a quiet room on level 1.' },
    { icon: 'calendar', title: 'Where to stay', text: 'Attendee rates at three hotels within a ten-minute walk, bookable until May 20.' },
  ]
  return (
    <WidgetWrapper id="venue" containerClass="max-w-6xl mx-auto">
      <Headline tagline="Venue" title="A warehouse on the river" subtitle="Three rooms, one terrace, step-free throughout. Every session is a short walk from the coffee." />
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-12">
        <figure className="overflow-hidden rounded-2xl border border-border bg-card">
          <VenueMap />
          <figcaption className="grid gap-x-6 gap-y-3 border-t border-border p-5 sm:grid-cols-2">
            {ROOMS.map((room) => (
              <div key={room.n} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold" style={{ background: room.color, color: room.ink }} aria-hidden="true">
                  {room.n}
                </span>
                <span>
                  <span className="font-semibold text-foreground">{room.name}</span>
                  <span className="block text-muted-foreground">{room.note}</span>
                </span>
              </div>
            ))}
          </figcaption>
        </figure>
        <ul className="grid list-none gap-6">
          {details.map((d) => (
            <li key={d.title} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-card text-(--primary-text)" aria-hidden="true">
                <Icon name={d.icon} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-foreground">{d.title}</h3>
                <p className="mt-1 text-pretty text-muted-foreground">{d.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 门票（Pricing.astro） ---------- */

type Billing = 'single' | 'team'

const TICKETS = [
  {
    title: 'Online',
    subtitle: 'Watch from anywhere',
    price: { single: 89, team: 69 },
    seats: null,
    items: ['Livestream of every Main Hall and studio talk', 'Recordings within 48 hours', 'Live Q&A in the attendee chat'],
    cta: 'Get online pass',
  },
  {
    title: 'Conference',
    subtitle: 'Both days in person',
    price: { single: 549, team: 469 },
    seats: { left: 142, total: 600 },
    items: ['All talks in the Main Hall and both studios', 'Lunch, coffee and the rooftop social', 'Recordings and slides after the event'],
    cta: 'Get conference pass',
    highlight: true,
    ribbon: 'Popular',
  },
  {
    title: 'Conference + Workshop',
    subtitle: 'Talks plus a hands-on morning',
    price: { single: 849, team: 739 },
    seats: { left: 18, total: 120 },
    items: ['Everything in Conference', 'One 3-hour workshop, chosen at checkout', 'Workshop materials and a reserved seat'],
    cta: 'Get workshop pass',
  },
]

export function Tickets() {
  const [billing, setBilling] = useState<Billing>('single')
  const labels: Record<Billing, string> = { single: 'Individual', team: 'Team of 4+' }
  return (
    <WidgetWrapper id="tickets" containerClass="max-w-7xl mx-auto" bg={<div className="absolute inset-0 bg-[color-mix(in_oklab,var(--primary)_5%,var(--background))]" />}>
      <Headline tagline="Tickets" title="Pick a pass" subtitle="Prices include VAT. Team pricing applies from four people on one order; names can be changed until June 1." />
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm font-medium" role="group" aria-label="Ticket type">
          {(['single', 'team'] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBilling(b)}
              data-active={billing === b ? '' : undefined}
              aria-pressed={billing === b}
              className="rounded-full px-4 py-1.5 text-(--text) outline-none transition-[background-color,color] duration-200 focus-visible:ring-2 focus-visible:ring-(--primary) data-[active]:bg-(--primary) data-[active]:text-(--primary-foreground)"
            >
              {labels[b]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-stretch justify-center">
        <div className="grid w-full grid-cols-3 gap-4 text-(--text) sm:grid-cols-2 lg:grid-cols-3">
          {TICKETS.map((ticket) => (
            <div key={ticket.title} className="col-span-3 mx-auto flex w-full sm:col-span-1">
              <div className={cn('relative mx-auto flex w-full max-w-sm flex-col justify-between rounded-lg border bg-card px-6 py-8 text-center shadow', ticket.highlight ? 'border-(--primary) ring-1 ring-(--primary)' : 'border-border')}>
                {ticket.ribbon && (
                  <div className="absolute top-[-5px] right-[-5px] z-[1] h-[100px] w-[100px] overflow-hidden text-right">
                    <span className="absolute top-[19px] right-[-21px] block w-full rotate-45 bg-(--accent2) text-center text-[10px] leading-5 font-bold text-(--accent2-foreground) uppercase shadow-[0_3px_10px_-5px_rgba(0,0,0,0.3)] before:absolute before:top-full before:left-0 before:z-[-1] before:border-[3px] before:border-t-[color-mix(in_oklab,var(--accent2)_70%,black)] before:border-r-transparent before:border-b-transparent before:border-l-[color-mix(in_oklab,var(--accent2)_70%,black)] before:content-[''] after:absolute after:top-full after:right-0 after:z-[-1] after:border-[3px] after:border-t-[color-mix(in_oklab,var(--accent2)_70%,black)] after:border-r-[color-mix(in_oklab,var(--accent2)_70%,black)] after:border-b-transparent after:border-l-transparent after:content-['']">
                      {ticket.ribbon}
                    </span>
                  </div>
                )}
                <div className="px-2 py-0">
                  <h3 className="mb-2 text-center text-xl leading-6 font-semibold tracking-wider text-foreground uppercase">{ticket.title}</h3>
                  <p className="font-light text-muted-foreground sm:text-lg">{ticket.subtitle}</p>
                  <div className="my-8">
                    <div className="mb-1 flex items-center justify-center text-center text-foreground">
                      <span className="text-5xl">€</span>
                      <span className="text-6xl font-extrabold tabular-nums">{ticket.price[billing]}</span>
                    </div>
                    <span className="text-base leading-6 text-muted-foreground lowercase">per person</span>
                    {ticket.seats ? (
                      <div className="mx-auto mt-4 max-w-[220px]">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{ticket.seats.left}</span> of {ticket.seats.total} seats left
                        </p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--soft)" aria-hidden="true">
                          <div className="h-full rounded-full bg-(--primary)" style={{ width: `${(1 - ticket.seats.left / ticket.seats.total) * 100}%` }} />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-muted-foreground">No seat limit</p>
                    )}
                  </div>
                  <ul className="my-8 space-y-2 text-left md:my-10">
                    {ticket.items.map((description) => (
                      <li key={description} className="mb-1.5 flex items-start gap-3 leading-7">
                        <div className="mt-1 rounded-full bg-(--primary)">
                          <Icon name="check" className="h-5 w-5 p-1 text-(--primary-foreground)" />
                        </div>
                        <span>{description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center">
                  <Button variant={ticket.highlight ? 'primary' : 'secondary'}>{ticket.cta}</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 赞助商（虚构字标） ---------- */

export function Sponsors() {
  const logo = 'flex h-12 items-center justify-center gap-2 text-muted-foreground transition-colors duration-200 hover:text-foreground'
  return (
    <WidgetWrapper id="sponsors" containerClass="max-w-6xl mx-auto">
      <Headline tagline="Sponsors" title="Made possible by" titleClass="text-2xl md:text-3xl" className="md:mb-10" />
      <ul className="grid list-none grid-cols-2 items-center gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
        <li className={logo}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3 7h-6zM5 11h14l-2 11H7z" />
          </svg>
          <span className="text-xl font-bold tracking-tight">Kiln</span>
        </li>
        <li className={logo}>
          <span className="text-xl font-black tracking-tighter lowercase">
            open<span className="text-(--primary-text)">/</span>fold
          </span>
        </li>
        <li className={logo}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M2 4l5 8-5 8zM9 4h6l-3 8zM12 12l3 8H9zM22 4v16l-5-8z" />
          </svg>
          <span className="text-base font-semibold tracking-[0.12em] uppercase sm:text-lg">Tessellate</span>
        </li>
        <li className={logo}>
          <span className="text-2xl italic" style={{ fontFamily: 'var(--font-heading)' }}>
            Halden
          </span>
        </li>
        <li className={logo}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M4 20L20 4M9 20l11-11M4 15L15 4" />
          </svg>
          <span className="text-xl font-bold tracking-tight">Quillstack</span>
        </li>
        <li className={logo}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h4" />
          </svg>
          <span className="text-xl font-semibold tracking-tight">Fieldnote</span>
        </li>
      </ul>
      <p className="mt-10 text-center text-sm text-muted-foreground">
        Sponsors get a table in the foyer, never a keynote slot.{' '}
        <a href="#" onClick={(event) => event.preventDefault()} className="font-medium text-(--primary-text) underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-(--primary)">
          Sponsorship prospectus
        </a>
      </p>
    </WidgetWrapper>
  )
}

/* ---------- 页脚 ---------- */

export function Footer({ name, dates, city }: { name: string; dates: string; city: string }) {
  const columns = [
    { title: 'Conference', links: ['Schedule', 'Speakers', 'Venue', 'Tickets'] },
    { title: 'Attend', links: ['Code of conduct', 'Accessibility', 'Scholarships', 'Visa letters'] },
    { title: 'Contact', links: ['Email the organisers', 'Press kit', 'Volunteer'] },
  ]
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-6">
        <div>
          <span className="flex items-center gap-2.5 text-xl text-foreground" style={headingStyle}>
            <Mark />
            <span className="min-w-0 [overflow-wrap:anywhere]">{name}</span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {dates} · {city}. An independent, volunteer-run conference on design engineering.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#" onClick={(event) => event.preventDefault()} className="rounded text-muted-foreground outline-none transition-colors duration-150 [overflow-wrap:anywhere] hover:text-foreground focus-visible:ring-2 focus-visible:ring-(--primary)">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl border-t border-border px-4 py-6 text-sm text-muted-foreground md:px-6">© 2027 {name}. All times on this page are local to the venue.</div>
    </footer>
  )
}
