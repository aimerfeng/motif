// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Bohdan (https://bohd4n.dev/)
// Source: https://github.com/bohd4nx/app-landing/blob/8bd0798/src/components/Features/index.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'
import { PlanScreen, Phone, RunScreen, SummaryScreen, TodayScreen } from './phones'
import { AppIcon, Avatar, BrandMark, Button, Heading, Icon, Label, Stars } from './parts'

const NAV = ['Features', 'Screens', 'Reviews', 'Pricing', 'FAQ']

export function Header({ brand }: { brand: string }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <BrandMark name={brand} />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground @3xl:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item} href="#" onClick={(e) => e.preventDefault()} className="transition-colors duration-200 hover:text-foreground">
              {item}
            </a>
          ))}
        </nav>
        <Button className="hidden @3xl:inline-flex">Get the app</Button>
        <button type="button" className="grid size-10 place-items-center rounded-full border border-border text-foreground @3xl:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <Icon name={open ? 'close' : 'menu'} className="size-[18px]" />
        </button>
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-background px-5 pb-5 @3xl:hidden">
          {NAV.map((item) => (
            <a key={item} href="#" onClick={(e) => e.preventDefault()} className="block border-b border-border py-3.5 text-[15px] text-foreground last:border-0">
              {item}
            </a>
          ))}
          <Button className="mt-4 w-full">Get the app</Button>
        </div>
      )}
    </header>
  )
}

function FloatChip({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={cn('absolute z-20 flex items-center gap-2.5 rounded-2xl border border-border bg-card/90 px-3.5 py-2.5 text-xs shadow-[0_20px_40px_-18px_rgb(0_0_0/0.5)] backdrop-blur', className)}
      animate={reduced ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  )
}

export function Hero({ brand, headline, subhead }: { brand: string; headline: string; subhead: string }) {
  const reduced = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  })
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-12 @3xl:pb-24 @3xl:pt-20">
      {/* 背景：跑道式椭圆线 + 主色光晕 */}
      <svg viewBox="0 0 1200 700" className="pointer-events-none absolute left-1/2 top-0 h-[44rem] w-[75rem] max-w-none -translate-x-1/2 text-foreground/[0.07] [mask-image:radial-gradient(60%_60%_at_70%_40%,#000,transparent)]" fill="none" stroke="currentColor" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={140 + i * 46} y={90 + i * 46} width={920 - i * 92} height={520 - i * 92} rx={260 - i * 46} />
        ))}
      </svg>
      <div className="pointer-events-none absolute right-[-10rem] top-[-6rem] size-[34rem] rounded-full bg-primary/25 blur-[120px]" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 @4xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div {...rise(0)} className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card/70 py-1 pl-1 pr-3.5 text-[13px] text-muted-foreground">
            <AppIcon className="size-6" />
            <Stars value={5} className="[&_svg]:size-3.5" />
            <span>
              <b className="font-semibold text-foreground">4.8</b> · 12,400 ratings
            </span>
          </motion.div>
          <motion.div {...rise(0.08)} className="mt-6">
            <Heading level={1}>{headline}</Heading>
          </motion.div>
          <motion.p {...rise(0.16)} className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            {subhead}
          </motion.p>
          <motion.div {...rise(0.24)} className="mt-9 flex flex-wrap gap-3">
            <Button size="lg">
              <Icon name="phone" className="size-5" />
              Get {brand} free
            </Button>
            <Button size="lg" variant="outline">
              See a sample week
            </Button>
          </motion.div>
          <motion.dl {...rise(0.32)} className="mt-10 grid max-w-md grid-cols-4 gap-4 border-t border-border pt-6 text-sm">
            {[
              ['Age', '4+'],
              ['Version', '3.2'],
              ['Needs', 'iOS 17'],
              ['Updated', 'Mar 2026'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-semibold text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                  {v}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
        <motion.div {...rise(0.2)} className="relative mx-auto flex h-[560px] w-full max-w-[34rem] items-center justify-center">
          <div className="absolute left-[2%] top-[9%] hidden -rotate-[7deg] opacity-90 @6xl:block">
            <Phone scale={0.86}>
              <PlanScreen />
            </Phone>
          </div>
          <div className="absolute right-[2%] top-[9%] hidden rotate-[7deg] opacity-90 @6xl:block">
            <Phone scale={0.86}>
              <RunScreen />
            </Phone>
          </div>
          <div className="relative z-10">
            <Phone>
              <TodayScreen brand={brand} />
            </Phone>
          </div>
          <FloatChip className="-left-1 top-4 hidden @2xl:flex @4xl:-left-6" delay={0.4}>
            <span className="grid size-8 place-items-center rounded-full bg-emerald-500/20 text-emerald-500">
              <Icon name="check" className="size-4" />
            </span>
            <span>
              <b className="block text-foreground">Long run done</b>
              <span className="text-muted-foreground">16.1 km · 1:37:12</span>
            </span>
          </FloatChip>
          <FloatChip className="-right-1 bottom-24 hidden @2xl:flex @4xl:-right-6" delay={1.4}>
            <span className="grid size-8 place-items-center rounded-full bg-primary/20 text-primary">
              <Icon name="bolt" className="size-4" />
            </span>
            <span>
              <b className="block text-foreground">New 5K best</b>
              <span className="text-muted-foreground">24:08 · -47 s</span>
            </span>
          </FloatChip>
        </motion.div>
      </div>
    </section>
  )
}

const STATS = [
  ['380k', 'runners follow a Cadence plan'],
  ['11 min', 'average marathon time saved'],
  ['92%', 'finish their first race'],
  ['4.8', 'rating from 12,400 reviews'],
] as const

export function Stats() {
  return (
    <section className="border-y border-border bg-[var(--tint)] px-5 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 @3xl:grid-cols-4">
        {STATS.map(([value, label]) => (
          <div key={label}>
            <p className="text-4xl text-foreground @3xl:text-5xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>
              {value}
            </p>
            <p className="mt-1.5 max-w-[14rem] text-sm leading-snug text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Card({ className, title, body, children }: { className?: string; title: string; body: string; children?: ReactNode }) {
  return (
    <div className={cn('group flex flex-col overflow-hidden rounded-[calc(var(--radius)*1.8)] border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/40', className)}>
      <div className="min-h-[9rem] flex-1">{children}</div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}

export function Features() {
  const wave = [8, 14, 22, 12, 30, 18, 38, 24, 14, 34, 20, 10, 26, 16, 9, 20, 12]
  const R = 38
  const C = 2 * Math.PI * R
  return (
    <section id="features" className="px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Label>Features</Label>
          <Heading className="mt-4">A coach that reads your last run, not a template</Heading>
        </div>
        <div className="mt-12 grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
          <Card className="@5xl:col-span-2" title="Plans that adapt every morning" body="Sleep, heart-rate variability and yesterday's effort reshape today's session. Miss a run and the week rebalances itself.">
            <div className="flex h-full items-end gap-2 rounded-2xl border border-border bg-muted/50 p-4">
              {[
                [40, 44],
                [55, 52],
                [30, 34],
                [62, 58],
                [0, 0],
                [48, 30],
                [90, 86],
              ].map(([plan, actual], i) => (
                <div key={i} className="flex h-32 flex-1 items-end justify-center gap-1">
                  <div className="w-full max-w-3.5 rounded-t bg-foreground/15" style={{ height: `${plan}%` }} />
                  <div className={cn('w-full max-w-3.5 rounded-t', i === 5 ? 'bg-amber-400' : 'bg-primary')} style={{ height: `${actual}%` }} />
                </div>
              ))}
            </div>
          </Card>
          <Card title="A voice in your ears" body="Pace, splits and encouragement spoken over your music. Tell it to be quiet and it is.">
            <div className="flex h-full items-center justify-center gap-[3px] rounded-2xl border border-border bg-muted/50 p-4" aria-hidden>
              {wave.map((h, i) => (
                <span key={i} className={cn('w-1 rounded-full', i > 6 && i < 11 ? 'bg-primary' : 'bg-foreground/25')} style={{ height: h * 2 }} />
              ))}
            </div>
          </Card>
          <Card title="Recovery you can trust" body="One score from sleep, resting heart rate and load. Green means go, amber means easy.">
            <div className="grid h-full place-items-center rounded-2xl border border-border bg-muted/50 p-4">
              <div className="relative size-28">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
                  <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="9" />
                  <circle cx="50" cy="50" r={R} fill="none" stroke="#34d399" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${C * 0.84} ${C}`} />
                </svg>
                <span className="absolute inset-0 grid place-items-center text-2xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)' }}>
                  84
                </span>
              </div>
            </div>
          </Card>
          <Card title="Routes that fit the plan" body="Loops of the exact length you need, from where you are, avoiding the road with no pavement.">
            <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-muted/50" aria-hidden>
              <svg viewBox="0 0 240 150" className="size-full" preserveAspectRatio="xMidYMid slice">
                <path d="M20 120C40 100 50 60 90 70S140 120 170 90 200 30 150 30 70 40 90 15" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="10" strokeLinecap="round" />
                <path d="M20 120C40 100 50 60 90 70S140 120 170 90 200 30 150 30" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="20" cy="120" r="5" fill="var(--primary)" />
                <circle cx="150" cy="30" r="5" fill="currentColor" />
              </svg>
            </div>
          </Card>
          <Card title="Works with the watch you own" body="Heart rate, cadence and GPS from any Bluetooth watch or strap. Workouts sync back in seconds.">
            <div className="flex h-full flex-col justify-center gap-2 rounded-2xl border border-border bg-muted/50 p-4 text-xs">
              {[
                ['watch', 'Wrist heart rate', 'Connected'],
                ['heart', 'Chest strap', 'Connected'],
                ['bolt', 'Foot pod cadence', 'Paired'],
              ].map(([icon, label, state]) => (
                <div key={label} className="flex items-center gap-3 rounded-xl bg-background px-3 py-2">
                  <Icon name={icon} className="size-4 text-primary" />
                  <span className="flex-1 font-medium text-foreground">{label}</span>
                  <span className="text-muted-foreground">{state}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="@2xl:col-span-2 @5xl:col-span-3" title="Race-day pacing, split by split" body="Upload the course and get a pace plan that respects the hills. Print it on a wristband or read it on the watch.">
            <div className="grid h-full grid-cols-4 items-center gap-2 rounded-2xl border border-border bg-muted/50 p-4 text-center text-xs @2xl:grid-cols-6" style={{ fontFamily: 'var(--font-mono)' }}>
              {['5 km 5:44', '10 km 5:41', '15 km 5:47', '20 km 5:39', '25 km 5:42', '30 km 5:38'].map((split, i) => {
                const [km, pace] = split.split(' km ')
                return (
                  <div key={split} className={cn('rounded-xl bg-background py-3', i === 2 && 'hidden @2xl:block', i === 3 && 'hidden @2xl:block')}>
                    <p className="text-muted-foreground">{km} km</p>
                    <p className={cn('mt-1 text-sm font-semibold', i === 2 ? 'text-amber-500' : 'text-foreground')}>{pace}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

export function Screens({ brand }: { brand: string }) {
  const items = [
    ['Today', 'One screen tells you what to run and why.', <TodayScreen key="t" brand={brand} />],
    ['Live run', 'Big numbers, a route, and controls you can hit with gloves on.', <RunScreen key="r" />],
    ['Plan', 'Sixteen weeks laid out, adjusted as you go.', <PlanScreen key="p" />],
    ['Summary', 'Weekly load, personal bests and how recovered you are.', <SummaryScreen key="s" />],
  ] as const
  return (
    <section id="screens" className="overflow-hidden border-y border-border bg-[var(--tint)] py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <Label>Screens</Label>
          <Heading className="mt-4">Built for one thumb and a lot of sweat</Heading>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 [scrollbar-width:none] @5xl:justify-between @5xl:overflow-visible">
        {items.map(([title, body, screen]) => (
          <figure key={title} className="w-[272px] shrink-0 snap-center">
            <Phone>{screen}</Phone>
            <figcaption className="mt-5">
              <p className="font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

const REVIEWS = [
  ['Finally ran my first half without walking', 'Hana K.', 'I have tried four plans. This is the first one that noticed I was tired and shortened the week. Crossed the line in 1:54 and cried a bit.', 5],
  ['The voice coaching is the good kind', 'marco_runs', 'It tells me my pace and then leaves me alone. No fake cheering. Battery lasts a whole long run on my old phone.', 5],
  ['Great, but wish it had a treadmill mode', 'Priya S.', 'Plans and recovery are excellent. I mostly run indoors in winter and the distance drifts. Support says treadmill calibration is next.', 4],
] as const

export function Reviews() {
  const bars = [82, 12, 4, 1, 1]
  return (
    <section id="reviews" className="px-5 py-20 @3xl:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 @5xl:grid-cols-[0.8fr_1.6fr]">
        <div>
          <Label>Reviews</Label>
          <Heading className="mt-4">Runners, in their own words</Heading>
          <div className="mt-8 flex items-end gap-4">
            <span className="text-7xl leading-none text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: '-0.03em' }}>
              4.8
            </span>
            <div className="pb-1.5 text-sm text-muted-foreground">
              <Stars />
              <p className="mt-1">12,400 ratings</p>
            </div>
          </div>
          <div className="mt-6 max-w-xs space-y-1.5">
            {bars.map((w, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2">{5 - i}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
                  <span className="block h-full rounded-full bg-amber-400" style={{ width: `${w}%` }} />
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 @3xl:grid-cols-2 @5xl:grid-cols-1">
          {REVIEWS.map(([title, name, body, stars], i) => (
            <figure key={title} className={cn('rounded-[calc(var(--radius)*1.8)] border border-border bg-card p-6', i === 2 && '@3xl:col-span-2 @5xl:col-span-1')}>
              <div className="flex items-center justify-between gap-4">
                <Stars value={stars} />
                <span className="text-xs text-muted-foreground">Verified runner</span>
              </div>
              <blockquote className="mt-4">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-sm text-foreground">
                <Avatar name={name} size={30} />
                {name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

const TIERS = [
  { name: 'Free', blurb: 'Track every run and try the basics.', monthly: 0, yearly: 0, cta: 'Download free', features: ['GPS run tracking', '1 starter plan', 'Weekly summary', 'Audio splits every km'] },
  { name: 'Plus', blurb: 'Adaptive plans for a goal race.', monthly: 7.99, yearly: 4.99, cta: 'Start 14-day trial', featured: true, features: ['Adaptive 5K to marathon plans', 'Daily recovery score', 'Voice coaching', 'Route builder', 'Watch and strap sync'] },
  { name: 'Coach', blurb: 'A human reviews your training.', monthly: 29, yearly: 24, cta: 'Meet the coaches', features: ['Everything in Plus', 'Weekly review with a coach', 'Unlimited messages', 'Race-day pace plans'] },
] as const

export function Pricing() {
  const [yearly, setYearly] = useState(true)
  return (
    <section id="pricing" className="border-t border-border px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Label>Pricing</Label>
          <Heading className="mt-4">Free to start. Pay when you have a race date.</Heading>
          <div className="mt-8 inline-flex rounded-full border border-border bg-card p-1 text-sm font-medium" role="group" aria-label="Billing period">
            {[
              ['Monthly', false],
              ['Yearly · save 37%', true],
            ].map(([label, value]) => (
              <button key={label as string} type="button" aria-pressed={yearly === value} onClick={() => setYearly(value as boolean)} className={cn('rounded-full px-4 py-1.5 transition-[background-color,color] duration-200', yearly === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                {label as string}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-12 grid gap-4 @3xl:grid-cols-3">
          {TIERS.map((tier) => {
            const featured = 'featured' in tier && tier.featured
            const price = yearly ? tier.yearly : tier.monthly
            return (
              <div key={tier.name} className={cn('relative flex flex-col rounded-[calc(var(--radius)*2)] border p-7', featured ? 'border-primary bg-card shadow-[0_30px_80px_-40px_var(--primary)]' : 'border-border bg-card')}>
                {featured && <span className="absolute right-6 top-6 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">Best value</span>}
                <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.blurb}</p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-5xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>
                    ${price === 0 ? '0' : price.toFixed(2).replace('.00', '')}
                  </span>
                  <span className="text-sm text-muted-foreground">{price === 0 ? 'forever' : '/ month'}</span>
                </p>
                <Button variant={featured ? 'primary' : 'outline'} size="lg" className="mt-6 w-full">
                  {tier.cta}
                </Button>
                <ul className="mt-7 space-y-3 border-t border-border pt-7 text-sm text-muted-foreground">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Icon name="check" className="mt-0.5 size-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const FAQS = [
  ['Do I need a watch to use it?', 'No. Your phone tracks GPS, pace and distance. A watch or chest strap adds heart rate, which sharpens the recovery score.'],
  ['What if I miss a week?', 'Tell the app, or let it notice. The plan slides forward or trims the build so you never have to catch up with a double session.'],
  ['Is it suitable for a first 5K?', 'Yes. The starter plans begin with run-walk intervals and are written with beginners in mind. Most people finish week 6 running 5K without stopping.'],
  ['Where is my data stored?', 'Runs are stored on your phone and synced, encrypted, to your account. We never sell location data, and you can delete everything from Settings.'],
  ['Can I cancel anytime?', 'Yes, from your phone settings. You keep Plus until the end of the billing period, and your run history stays on the free plan.'],
] as const

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const reduced = useReducedMotion()
  return (
    <section id="faq" className="border-t border-border px-5 py-20 @3xl:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 @5xl:grid-cols-[1fr_1.6fr]">
        <div>
          <Label>FAQ</Label>
          <Heading className="mt-4">Questions before the first mile</Heading>
          <p className="mt-4 max-w-sm text-muted-foreground">Anything else? Message us in the app and a person replies, usually within a few hours.</p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {FAQS.map(([question, answer], i) => {
            const isOpen = open === i
            return (
              <div key={question}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-[16px] font-semibold text-foreground">
                  {question}
                  <span className={cn('grid size-7 shrink-0 place-items-center rounded-full border border-border transition-[transform,background-color] duration-300', isOpen && 'rotate-45 border-primary bg-primary text-primary-foreground')}>
                    <Icon name="cross" className="size-3.5 rotate-45" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="overflow-hidden">
                      <p className="max-w-xl pb-5 text-[15px] leading-relaxed text-muted-foreground">{answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function Cta({ brand }: { brand: string }) {
  return (
    <section className="px-5 pb-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[calc(var(--radius)*2.4)] bg-primary px-6 py-16 text-primary-foreground @3xl:py-24">
        <svg viewBox="0 0 1200 400" className="pointer-events-none absolute inset-0 size-full opacity-[0.13]" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={-100 + i * 50} y={-60 + i * 50} width={1400 - i * 100} height={520 - i * 100} rx={260 - i * 50} />
          ))}
        </svg>
        <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
          <Heading className="!text-primary-foreground">Your next start line is closer than it looks</Heading>
          <p className="mt-5 max-w-md text-base opacity-80">Download {brand}, pick a goal and get your first plan in about two minutes. The first 14 days of Plus are on us.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex h-[52px] items-center gap-2.5 rounded-full bg-foreground px-7 text-[15px] font-semibold text-background transition-opacity duration-200 hover:opacity-90">
              <Icon name="phone" className="size-5" />
              Get it for iPhone
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex h-[52px] items-center gap-2.5 rounded-full border border-current/40 px-7 text-[15px] font-semibold transition-colors duration-200 hover:bg-black/10">
              <Icon name="phone" className="size-5" />
              Get it for Android
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

const FOOTER = [
  ['App', ['Features', 'Screens', 'Pricing', 'Release notes']],
  ['Support', ['Help center', 'Contact', 'Coaches', 'Status']],
  ['Legal', ['Privacy policy', 'Terms of service', 'Health data notice']],
] as const

export function Footer({ brand }: { brand: string }) {
  return (
    <footer className="border-t border-border px-5 pb-10 pt-14">
      <div className="mx-auto grid max-w-6xl gap-10 @3xl:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <BrandMark name={brand} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">Adaptive running plans, made by a small team of runners in Bristol and Porto.</p>
        </div>
        {FOOTER.map(([title, links]) => (
          <div key={title}>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors duration-200 hover:text-foreground">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>© 2026 {brand} Run Ltd.</span>
        <span>Not medical advice. Talk to a doctor before starting a new training plan.</span>
      </div>
    </footer>
  )
}
