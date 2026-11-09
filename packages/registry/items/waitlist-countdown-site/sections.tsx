// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/pages/landing/pre-launch.astro
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/widgets/Countdown.astro
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/widgets/Timeline.astro
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/widgets/Stats.astro
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { useId, useRef, useState } from 'react'
import { cn, useFrameLoop } from '@motif/runtime'
import { SunriseLamp } from './lamp'
import { BrandMark, Button, Headline, Icon, WidgetWrapper, headingStyle, scrollToId } from './parts'
import { WaitlistForm, WAITLIST_COUNT } from './waitlist-form'

const NAV = [
  { to: 'coming', label: 'The lamp' },
  { to: 'roadmap', label: 'Build log' },
  { to: 'faq', label: 'FAQ' },
] as const

/* ---------- 页头：标志、三个锚点、一个按钮 ---------- */

export function Header({ brand }: { brand: string }) {
  const reduced = useReducedMotion()
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 @3xl:px-6">
        <BrandMark name={brand} />
        <div className="flex shrink-0 items-center gap-6">
          <nav aria-label="Sections" className="hidden items-center gap-6 @3xl:flex">
            {NAV.map((item) => (
              <a
                key={item.to}
                href={`#${item.to}`}
                onClick={(event) => {
                  event.preventDefault()
                  scrollToId(item.to, reduced)
                }}
                className="rounded-sm text-sm font-medium text-foreground transition-colors duration-200 outline-none hover:text-[var(--accent-ink)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Button variant="primary" to="notify" reduced={reduced} className="px-5 py-2.5 text-sm @3xl:px-5">
            Join the waitlist
          </Button>
        </div>
      </div>
    </header>
  )
}

/* ---------- 1. Hero2：承诺和动作在左，图片位换成会日出的灯 ---------- */

export function Hero({ headline, brand, speed }: { headline: string; brand: string; speed: number }) {
  const reduced = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: 'easeOut' as const },
  })
  return (
    <section className="relative" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_75%_30%,var(--tint),transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 @xl:px-6">
        <div className="py-12 @3xl:py-20 @5xl:flex @5xl:items-center @5xl:gap-8 @5xl:py-16">
          <div className="mx-auto basis-1/2 pb-10 text-center @3xl:pb-16 @5xl:text-left">
            <motion.span {...rise(0)} className="mb-4 inline-block rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[var(--accent-ink)] uppercase">
              Waitlist open · batch one is 500 lamps
            </motion.span>
            <motion.p {...rise(0.04)} className="text-base font-bold tracking-wide text-[var(--accent-ink)] uppercase">
              Sunrise lamp
            </motion.p>
            <motion.h1 {...rise(0.08)} id="hero-title" className="mb-4 text-4xl leading-[1.06] text-balance @md:text-5xl @3xl:text-6xl" style={headingStyle}>
              {headline}
            </motion.h1>
            <div className="mx-auto max-w-3xl @5xl:max-w-none">
              <motion.p {...rise(0.14)} className="mb-6 text-xl text-pretty text-muted-foreground">
                {brand} turns on 30 minutes before your alarm and climbs from deep red to 300 lux of warm white, so the light wakes you before the sound has to.
              </motion.p>
              <motion.div {...rise(0.2)} className="m-auto flex max-w-xs flex-col flex-nowrap gap-4 @xl:max-w-md @xl:flex-row @xl:justify-center @5xl:m-0 @5xl:max-w-7xl @5xl:justify-start">
                <div className="flex w-full @xl:w-auto">
                  <Button variant="primary" to="notify" reduced={reduced} className="w-full">
                    Join the waitlist
                    <Icon name="arrow" className="-mr-1.5 ml-1 size-5" />
                  </Button>
                </div>
                <div className="flex w-full @xl:w-auto">
                  <Button to="coming" reduced={reduced} className="w-full">
                    What is coming
                  </Button>
                </div>
              </motion.div>
              <motion.p {...rise(0.26)} className="mt-5 text-sm text-muted-foreground">
                No deposit, no card. {WAITLIST_COUNT.toLocaleString('en-US')} people are already in line.
              </motion.p>
            </div>
          </div>
          <motion.div {...rise(0.18)} className="basis-1/2">
            <div className="relative m-auto max-w-5xl">
              <SunriseLamp speed={speed} brand={brand} className="rounded-[var(--radius)] border border-border shadow-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------- 2. Countdown：上游 aw-countdown 用 setInterval 读 Date.now()，这里由 useFrameLoop 驱动 ---------- */

const LABELS = { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' } as const
type Unit = keyof typeof LABELS
const DAY = 86_400_000

function split(seconds: number): Record<Unit, string> {
  return {
    days: String(Math.floor(seconds / 86400)),
    hours: String(Math.floor((seconds % 86400) / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((seconds % 3600) / 60)).padStart(2, '0'),
    seconds: String(seconds % 60).padStart(2, '0'),
  }
}

/** launchInDays 天之后那天的 09:00 UTC（和上游示例的发布时刻一样落在整点）。 */
function targetFrom(anchor: number, days: number) {
  const day = new Date(anchor + days * DAY)
  return Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 9)
}

export function Countdown({ days, launchAt, now }: { days: number; launchAt?: string; now?: number }) {
  const host = useRef<HTMLDivElement>(null)
  const anchor = useRef<number | null>(null)
  const [state, setState] = useState<{ target: number; left: number } | null>(null)

  // 只在秒数变化时重新渲染。传了 now 就从那一刻按帧时间往下数（海报和录屏每次一样），否则读真实时钟。
  useFrameLoop(
    host,
    ({ time }) => {
      if (anchor.current === null) anchor.current = now ?? Date.now()
      const fixed = launchAt ? Date.parse(launchAt) : Number.NaN
      const target = Number.isNaN(fixed) ? targetFrom(anchor.current, days) : fixed
      const clock = now === undefined ? Date.now() : now + time * 1000
      const left = Math.max(0, Math.floor((target - clock) / 1000))
      setState((prev) => (prev && prev.left === left && prev.target === target ? prev : { target, left }))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const id = useId()
  const units = state ? split(state.left) : null
  const iso = state ? new Date(state.target).toISOString() : undefined
  const formatted = state ? `${new Intl.DateTimeFormat('en', { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' }).format(state.target)} UTC` : 'Launch day'

  return (
    <WidgetWrapper id="launch" containerClass="max-w-4xl mx-auto" className="bg-[var(--tint)]" label={`${id}-title`}>
      <Headline
        id={`${id}-title`}
        tagline="Launch day"
        title="The first batch ships in"
        subtitle={
          <>
            Invitations go out on <time dateTime={iso}>{formatted}</time>, in the order people joined. If the date moves, this page and your inbox say why.
          </>
        }
      />
      <div ref={host} className="block text-center">
        {state && state.left === 0 ? (
          <p className="text-2xl font-bold text-foreground">It launched. Invitations are going out in queue order.</p>
        ) : (
          <div
            className="mx-auto grid max-w-2xl grid-cols-2 gap-4 @xl:grid-cols-4"
            role="timer"
            aria-live="off"
            aria-label={units ? `Ships in ${units.days} days, ${units.hours} hours and ${units.minutes} minutes` : 'Countdown to launch day'}
          >
            {(Object.keys(LABELS) as Unit[]).map((unit) => (
              <div key={unit} className="rounded-[calc(var(--radius)*2)] border border-border bg-card p-4">
                <span className="block text-4xl font-bold tabular-nums @3xl:text-5xl" style={headingStyle}>
                  {units ? units[unit] : '--'}
                </span>
                <span className="mt-1 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">{LABELS[unit]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 3. Contact：表单放在第一位，这一页就是为了它 ---------- */

export function Waitlist({ brand, showReferral }: { brand: string; showReferral: boolean }) {
  const id = useId()
  return (
    <WidgetWrapper id="notify" containerClass="max-w-7xl mx-auto" label={`${id}-title`}>
      <Headline
        id={`${id}-title`}
        tagline="Early access"
        title="Get in line for the first batch"
        subtitle="One field. You get your place in the queue now and the founder price at launch. Nothing else."
      />
      <div className="mx-auto flex w-full max-w-xl flex-col rounded-[var(--radius)] border border-border bg-card p-4 shadow @xl:p-6 @5xl:p-8">
        <WaitlistForm brand={brand} showReferral={showReferral} />
      </div>
    </WidgetWrapper>
  )
}

/* ---------- Note：为什么现在留邮箱 ---------- */

export function Note() {
  return (
    <section className="bg-[var(--tint)]">
      <div className="mx-auto max-w-6xl px-4 py-4 text-center font-medium text-foreground @xl:px-6">
        <Icon name="info" className="mr-1.5 inline-block size-5 align-text-bottom text-[var(--accent-ink)]" />
        <span className="mr-1 font-bold">Why now:</span>
        batch one is 500 lamps, and invitations go out in the order people joined.
      </div>
    </section>
  )
}

/* ---------- 4. Features2：是什么、什么时候、为什么现在 ---------- */

export function Coming({ brand, days }: { brand: string; days: number }) {
  const id = useId()
  const items = [
    {
      title: 'What: light that wakes you',
      description: `${brand} ramps from a dim red glow to 300 lux of warm white over 30 minutes, then plays a soft chime only if you are still asleep.`,
      icon: 'sun',
    },
    {
      title: `When: in ${days} ${days === 1 ? 'day' : 'days'}`,
      description: 'The first 500 lamps are in production. Waitlist members are invited in queue order; batch two follows about six weeks later.',
      icon: 'calendar',
    },
    {
      title: 'Why now: the founder price',
      description: 'Everyone on the list pays $89 instead of $129 and picks the walnut or ash base first. No deposit, no card until you order.',
      icon: 'gift',
    },
  ]
  return (
    <WidgetWrapper id="coming" containerClass="max-w-7xl mx-auto" label={`${id}-title`}>
      <Headline
        id={`${id}-title`}
        tagline="What is coming"
        title="One lamp, one job: a gentler morning"
        subtitle="No app, no account, no subscription. A dial on the back sets the alarm; the light does the rest."
      />
      <div className="grid gap-4 gap-x-12 @xl:grid-cols-2 @3xl:gap-6 @5xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.icon} className="relative flex flex-col rounded-[var(--radius)] border border-border bg-card p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <Icon name={item.icon} className="mb-6 size-12 text-[var(--accent-ink)]" />
            <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
            <p className="mt-2 text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 5. Timeline：竖排的开发日志，highlight 实心，ghost 虚线 ---------- */

const LOG = [
  { date: 'March 2026', title: 'First prototype on the bench', icon: 'bulb', description: 'A 3D-printed shell, a 96-LED ring and a 30-minute ramp to 300 lux. It woke us up. It also flickered on camera.' },
  { date: 'June 2026', title: 'A flicker-free driver', icon: 'bolt', description: 'We swapped PWM dimming for a constant-current driver. The slow-motion test shows no banding down to 1% brightness.' },
  { date: 'September 2026', title: 'Diffuser tooling cut', icon: 'tool', description: 'The opal diffuser mould is finished. The first 200 shots are on our desks and the glow is even from edge to edge.' },
  { date: 'Now', title: 'The waitlist opens', icon: 'bell', highlight: true, description: 'This page goes live. Places are numbered in the order people join, and every update goes to the list first.' },
  { date: 'Launch day', title: 'Batch one ships', icon: 'truck', description: '500 lamps, invited in queue order at the founder price. Each invitation holds your place for 72 hours.' },
  { date: 'After launch', title: 'Sunset mode', icon: 'moon', ghost: true, description: 'A slow fade to dark for falling asleep. It works on the prototype; we will ship it as a free update if it passes testing.' },
] as const

export function Roadmap() {
  const id = useId()
  return (
    <WidgetWrapper id="roadmap" containerClass="max-w-5xl mx-auto" label={`${id}-title`}>
      <Headline
        id={`${id}-title`}
        tagline="Build log"
        title="From a bench prototype to your nightstand"
        subtitle="Every step so far, with dates. Each one was an email to the list before it was a line on this page."
      />
      <ol className="relative mx-auto max-w-3xl list-none before:absolute before:top-0 before:bottom-0 before:left-5 before:w-px before:bg-border">
        {LOG.map((entry) => {
          const ghost = 'ghost' in entry && entry.ghost
          const highlight = 'highlight' in entry && entry.highlight
          return (
            <li key={entry.title} className={cn('relative pb-10 pl-14 last:pb-0', ghost && 'opacity-80')}>
              <span
                className={cn(
                  'absolute top-0 left-0 flex size-10 items-center justify-center rounded-full border-2 bg-[var(--background)]',
                  ghost
                    ? 'border-dashed border-[var(--border)] text-muted-foreground'
                    : highlight
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-[var(--primary)]/40 text-[var(--accent-ink)]',
                )}
                aria-hidden
              >
                <Icon name={entry.icon} className="size-5" />
              </span>
              <p className={cn('block text-sm font-semibold tracking-wide uppercase', ghost ? 'text-muted-foreground' : 'text-[var(--accent-ink)]')}>{entry.date}</p>
              <h3 className={cn('mt-1 text-xl font-bold', ghost ? 'text-muted-foreground italic' : 'text-foreground')}>{entry.title}</h3>
              <p className="mt-2 text-pretty text-muted-foreground">{entry.description}</p>
            </li>
          )
        })}
      </ol>
    </WidgetWrapper>
  )
}

/* ---------- 6. Stats：发布前能如实说的数字 ---------- */

export function Facts({ dark }: { dark: boolean }) {
  const id = useId()
  const stats = [
    { amount: WAITLIST_COUNT.toLocaleString('en-US'), title: 'people in line' },
    { amount: '500', title: 'lamps in batch one' },
    { amount: '30', title: 'minute sunrise ramp' },
    { amount: '0', title: 'apps or accounts' },
  ]
  return (
    <WidgetWrapper id="facts" containerClass="max-w-6xl mx-auto" className="bg-[var(--tint)]" label={`${id}-title`}>
      <Headline
        id={`${id}-title`}
        tagline="Launch facts"
        title="Numbers we can stand behind before launch"
        subtitle="No customers yet, so no testimonials. These are true today."
      />
      <div className="-m-4 flex flex-wrap justify-center text-center">
        {stats.map((stat) => (
          <div key={stat.title} className="w-full min-w-[220px] p-4 text-center @xl:w-1/2 @3xl:w-1/4 @3xl:border-r @3xl:border-border @3xl:last:border-none">
            <div className={cn('text-[2.6rem] font-bold tabular-nums @5xl:text-5xl @6xl:text-6xl', dark ? 'text-[var(--heading)]' : 'text-[var(--accent-ink)]')} style={{ fontFamily: 'var(--font-heading)', letterSpacing: 'var(--heading-tracking)' }}>
              {stat.amount}
            </div>
            <div className="text-sm font-medium tracking-widest text-muted-foreground uppercase @5xl:text-base">{stat.title}</div>
          </div>
        ))}
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 7. FAQs：原生 <details name> 互斥手风琴 ---------- */

const FAQS = [
  {
    title: 'What does joining the waitlist commit me to?',
    description: 'Nothing. No deposit and no card. When your place comes up you get an invitation email that holds the founder price for 72 hours.',
  },
  {
    title: 'How does the referral link work?',
    description: 'Each friend who joins with your link moves you 25 places up the queue, for up to ten friends. They keep their own place and their own founder price.',
  },
  {
    title: 'Will the launch date move?',
    description: 'If it does, the list hears it first, with the reason. The countdown always shows the current date; we will never reset it quietly.',
  },
  {
    title: 'Is 300 lux bright enough to wake me?',
    description: 'At 40 cm from your pillow it matches the light outside about twenty minutes after sunrise. In our test group, 9 of 11 people woke before the chime.',
  },
  {
    title: 'Does it need Wi-Fi or an app?',
    description: 'No. The alarm is set with the dial on the back, and the clock keeps time through a power cut on a coin cell. Nothing is sent anywhere.',
  },
  {
    title: 'Where do you ship?',
    description: 'Batch one ships to the US, Canada, the UK and the EU, with a plug for each region in the box. Other countries join with batch two.',
  },
]

export function FAQs() {
  const id = useId()
  const group = `faq-${id.replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <WidgetWrapper id="faq" containerClass="max-w-7xl mx-auto" label={`${id}-title`}>
      <Headline id={`${id}-title`} tagline="FAQ" title="Questions people ask before joining" subtitle="Short answers. If yours is missing, reply to any email from us." />
      <div className="mx-auto max-w-3xl divide-y divide-[var(--border)]">
        {FAQS.map((item, index) => (
          <details key={item.title} className="group" name={group} open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)] [&::-webkit-details-marker]:hidden">
              <h3 className="text-lg font-semibold text-foreground @3xl:text-xl">{item.title}</h3>
              <Icon name="chevron" className="size-6 shrink-0 text-[var(--accent-ink)] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="pr-10 pb-5">
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          </details>
        ))}
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 8. CallToAction：回到表单 ---------- */

export function CallToAction({ dark }: { dark: boolean }) {
  const reduced = useReducedMotion()
  const id = useId()
  return (
    <WidgetWrapper id="join" containerClass="max-w-6xl mx-auto" label={`${id}-title`}>
      <div className={cn('mx-auto max-w-3xl rounded-[var(--radius)] bg-card p-6 text-center', dark ? 'border border-border' : 'shadow-xl')}>
        <Headline
          id={`${id}-title`}
          title="Wake up before your alarm does"
          subtitle="One email address holds your place and the founder price. You can leave the list with one click."
          className="mb-0 @3xl:mb-0"
          titleClass="mb-4 text-4xl @3xl:text-4xl"
          subtitleClass="text-xl text-muted-foreground"
        />
        <div className="m-auto mt-6 flex max-w-xs flex-col flex-nowrap gap-4 @xl:max-w-md @xl:flex-row @xl:justify-center">
          <div className="flex w-full @xl:w-auto">
            <Button variant="primary" to="notify" reduced={reduced} className="w-full">
              Join the waitlist
              <Icon name="up" className="-mr-1.5 ml-1 size-5" />
            </Button>
          </div>
          <div className="flex w-full @xl:w-auto">
            <Button to="roadmap" reduced={reduced} className="w-full">
              Read the build log
            </Button>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 页脚 ---------- */

export function Footer({ brand }: { brand: string }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          <BrandMark name={brand} className="text-base" />
          <span>Designed and assembled in small batches.</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {['Privacy', 'Press kit', 'Contact'].map((link) => (
            <a key={link} href="#" onClick={(e) => e.preventDefault()} className="rounded-sm transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
              {link}
            </a>
          ))}
          <span>© 2026 {brand}</span>
        </nav>
      </div>
    </footer>
  )
}
