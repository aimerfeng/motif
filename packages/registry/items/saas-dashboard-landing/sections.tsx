// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Mikolaj Dobrucki
// Source: https://github.com/launch-ui/launch-ui/blob/b0d4d5b/components/sections/items/default.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { cn } from '@motif/runtime'
import { StepArt } from './mockup'
import { Avatar, BrandMark, Button, Eyebrow, Heading, Icon, LogoWall } from './parts'

const NAV = ['Product', 'How it works', 'Pricing', 'FAQ']

export function Navbar({ brand }: { brand: string }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <BrandMark name={brand} />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground @3xl:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item} href="#" onClick={(e) => e.preventDefault()} className="transition-colors duration-200 hover:text-foreground">
              {item}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-1.5 @3xl:flex">
          <Button variant="ghost">Sign in</Button>
          <Button>Start free</Button>
        </div>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg border border-border text-foreground @3xl:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? 'close' : 'menu'} className="size-4" />
        </button>
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-background px-5 pb-5 pt-2 @3xl:hidden">
          {NAV.map((item) => (
            <a key={item} href="#" onClick={(e) => e.preventDefault()} className="block border-b border-border py-3 text-[15px] text-foreground last:border-0">
              {item}
            </a>
          ))}
          <Button className="mt-4 w-full">Start free</Button>
        </div>
      )}
    </header>
  )
}

export function Hero({ headline, subhead, children }: { headline: string; subhead: string; children: ReactNode }) {
  const reduced = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  })
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-10 @3xl:pb-24 @3xl:pt-14">
      {/* 顶部光晕 + 细网格，光晕颜色跟随主色 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] [mask-image:radial-gradient(60%_70%_at_50%_0%,#000,transparent)]" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[-14rem] h-[30rem] w-[62rem] max-w-[160%] -translate-x-1/2 rounded-full bg-primary/30 blur-[110px]" aria-hidden />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div {...rise(0)}>
          <Eyebrow>Rollback policies are live</Eyebrow>
        </motion.div>
        <motion.div {...rise(0.08)} className="mt-5">
          <Heading level={1} className="bg-gradient-to-b from-foreground to-foreground/65 bg-clip-text text-transparent">
            {headline}
          </Heading>
        </motion.div>
        <motion.p {...rise(0.16)} className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground @2xl:text-lg">
          {subhead}
        </motion.p>
        <motion.div {...rise(0.24)} className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg">
            Start free
            <Icon name="arrow" className="size-4" />
          </Button>
          <Button size="lg" variant="outline">
            Book a 20-minute demo
          </Button>
        </motion.div>
        <motion.p {...rise(0.3)} className="mt-4 text-xs text-muted-foreground">
          Free up to 50k sessions a month. No card, no sales call.
        </motion.p>
      </div>
      <motion.div {...rise(0.42)} className="relative mx-auto mt-12 max-w-5xl @3xl:mt-12">
        <div className="absolute -inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" aria-hidden />
        {children}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background to-transparent" aria-hidden />
      </motion.div>
    </section>
  )
}

export function Logos() {
  return (
    <section className="border-y border-border px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="mb-8 text-center text-sm text-muted-foreground">Release teams at 1,400 companies ship with a safety net</p>
        <LogoWall />
      </div>
    </section>
  )
}

const FEATURES = [
  ['pulse', 'Release health at a glance', 'Crash-free sessions, latency and adoption per build, refreshed every ten seconds.'],
  ['rollback', 'Automatic rollback', 'Set an error budget per release. The ramp halts by itself when it burns too fast.'],
  ['trace', 'Session-level traces', 'Jump from a spiking error to the twenty sessions that actually hit it.'],
  ['flag', 'Deploy markers', 'Deploys, flag flips and config changes drawn on the same timeline.'],
  ['route', 'Ownership routing', 'Alerts go to the team that owns the failing path, not a channel of forty people.'],
  ['moon', 'Quiet by default', 'Pages fire on budget burn, not on every blip. Teams average three a month.'],
  ['plug', 'Bring your stack', 'iOS, Android, web and Node SDKs. OpenTelemetry in, webhooks out.'],
  ['shield', 'Audit-ready', 'SSO, SCIM, 13-month retention and exportable audit logs on Team and above.'],
] as const

export function Features({ brand }: { brand: string }) {
  return (
    <section id="product" className="px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Heading>Everything a release needs. Nothing it doesn&apos;t.</Heading>
          <p className="mt-4 text-muted-foreground">{brand} replaces a dashboard, a pager rule and a spreadsheet with one page per release.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 overflow-hidden rounded-[calc(var(--radius)*1.4)] border border-border @2xl:grid-cols-2 @5xl:grid-cols-4">
          {FEATURES.map(([icon, title, body], i) => (
            <div key={title} className="group relative border-b border-border p-6 transition-colors duration-200 hover:bg-foreground/[0.03] @2xl:border-r @2xl:[&:nth-child(2n)]:border-r-0 @5xl:[&:nth-child(2n)]:border-r @5xl:[&:nth-child(4n)]:border-r-0 @5xl:[&:nth-last-child(-n+4)]:border-b-0 @2xl:[&:nth-last-child(-n+2)]:border-b-0 [&:last-child]:border-b-0">
              <span className="grid size-9 place-items-center rounded-lg border border-border bg-foreground/[0.04] text-primary transition-transform duration-300 group-hover:scale-105">
                <Icon name={icon} className="size-[18px]" />
              </span>
              <h3 className="mt-5 text-[15px] font-medium text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              <span className="absolute right-5 top-5 text-[11px] text-muted-foreground/60" style={{ fontFamily: 'var(--font-mono)' }}>
                0{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  ['Connect a build', 'Add the SDK and point CI at us. First data arrives in about four minutes.'],
  ['Set a budget', 'Pick crash-free and latency targets per channel. Defaults come from your last 30 days.'],
  ['Ship with a safety net', 'Roll out to 5%, 25%, 100%. The ramp advances, or pulls itself back, without a meeting.'],
] as const

export function Steps({ brand }: { brand: string }) {
  return (
    <section id="how-it-works" className="border-t border-border px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <Eyebrow>How it works</Eyebrow>
          <Heading className="mt-5">From first deploy to first automatic rollback in an afternoon.</Heading>
        </div>
        <div className="mt-12 grid gap-5 @3xl:grid-cols-3">
          {STEPS.map(([title, body], i) => (
            <div key={title} className="flex flex-col rounded-[calc(var(--radius)*1.2)] border border-border bg-card p-5">
              <div className="h-[7rem] [&>*]:h-full">
                <StepArt step={(i + 1) as 1 | 2 | 3} brand={brand} />
              </div>
              <p className="mt-6 text-xs text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                Step {i + 1}
              </p>
              <h3 className="mt-1.5 text-lg font-medium text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const STATS = [
  ['4.1', ' min', 'median time to detect a bad release'],
  ['62', '%', 'fewer hotfix deploys in the first quarter'],
  ['1.9', 'B', 'sessions monitored every day'],
  ['99.99', '%', 'ingest uptime over the last 12 months'],
] as const

export function Stats() {
  return (
    <section className="border-t border-border px-5 py-16 @3xl:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 @3xl:grid-cols-4">
        {STATS.map(([value, suffix, label]) => (
          <div key={label} className="flex flex-col gap-2">
            <p className="flex items-baseline gap-0.5 text-4xl text-foreground @3xl:text-5xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>
              {value}
              <span className="text-primary">{suffix}</span>
            </p>
            <p className="max-w-[16rem] text-sm leading-snug text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const QUOTES = [
  ['Priya Raman', 'Head of Mobile, Brightloom', 'We used to learn about bad builds from store reviews. Now the ramp stops itself at 5% and I read about it over coffee.'],
  ['Tomas Lindqvist', 'Staff Engineer, Halvorsen', 'The deploy markers alone paid for it. Every regression review starts with the same timeline instead of four screenshots.'],
  ['Amara Osei', 'VP Engineering, Corvid', 'Our on-call rotation went from twenty pages a month to three. Nobody asked us to. It just got quieter.'],
] as const

export function Testimonials() {
  return (
    <section className="border-t border-border px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading className="max-w-2xl">Quieter pagers, calmer release days.</Heading>
        <div className="mt-12 grid gap-5 @3xl:grid-cols-3">
          {QUOTES.map(([name, role, quote]) => (
            <figure key={name} className="flex flex-col justify-between gap-8 rounded-[calc(var(--radius)*1.2)] border border-border bg-card p-6">
              <blockquote className="text-[15px] leading-relaxed text-foreground/90">&ldquo;{quote}&rdquo;</blockquote>
              <figcaption className="flex items-center gap-3">
                <Avatar name={name} />
                <span className="text-sm">
                  <span className="block font-medium text-foreground">{name}</span>
                  <span className="text-muted-foreground">{role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

const TIERS = [
  { name: 'Hobby', blurb: 'For side projects and a first look.', monthly: 0, yearly: 0, cta: 'Start free', features: ['50k sessions / month', '1 project', '7-day retention', 'Community support'] },
  {
    name: 'Team',
    blurb: 'For product teams shipping weekly.',
    monthly: 24,
    yearly: 19,
    cta: 'Start 14-day trial',
    featured: true,
    features: ['5M sessions / month', 'Unlimited projects', 'Automatic rollback', '13-month retention', 'SSO and SCIM'],
  },
  { name: 'Enterprise', blurb: 'For regulated and high-volume orgs.', monthly: null, yearly: null, cta: 'Talk to us', features: ['Volume pricing', 'Dedicated ingest region', 'Audit log export', '99.99% uptime SLA', 'Named support engineer'] },
] as const

export function Pricing() {
  const [yearly, setYearly] = useState(true)
  return (
    <section id="pricing" className="border-t border-border px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Heading>Pricing that follows your team, not your traffic spikes.</Heading>
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-foreground/[0.03] p-1 text-sm" role="group" aria-label="Billing period">
            {[
              ['Monthly', false],
              ['Yearly · save 20%', true],
            ].map(([label, value]) => (
              <button
                key={label as string}
                type="button"
                aria-pressed={yearly === value}
                onClick={() => setYearly(value as boolean)}
                className={cn('rounded-full px-4 py-1.5 transition-[background-color,color] duration-200', yearly === value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
              >
                {label as string}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-12 grid gap-5 @3xl:grid-cols-3">
          {TIERS.map((tier) => {
            const price = yearly ? tier.yearly : tier.monthly
            const featured = 'featured' in tier && tier.featured
            return (
              <div key={tier.name} className={cn('relative flex flex-col rounded-[calc(var(--radius)*1.4)] border p-6', featured ? 'border-primary/60 bg-card shadow-[0_0_80px_-30px_var(--primary)]' : 'border-border bg-card')}>
                {featured && <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-[11px] font-medium text-primary-foreground">Most teams pick this</span>}
                <h3 className="text-base font-medium text-foreground">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.blurb}</p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>
                    {price === null ? 'Custom' : `$${price}`}
                  </span>
                  {price !== null && <span className="text-sm text-muted-foreground">{price === 0 ? 'forever' : 'per seat / month'}</span>}
                </p>
                <Button variant={featured ? 'primary' : 'outline'} className="mt-6 w-full" size="lg">
                  {tier.cta}
                </Button>
                <ul className="mt-6 space-y-2.5 border-t border-border pt-6 text-sm text-muted-foreground">
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
  ['How much overhead does the SDK add?', 'Under 40 KB on web and roughly 0.3% CPU on a mid-range phone. Events are batched and sent on idle, so nothing blocks a frame.'],
  ['Can it roll back without our CI?', 'Yes, for feature flags and staged rollouts on the store tracks. For everything else it calls a webhook and your pipeline does the work.'],
  ['Where does the data live?', 'EU or US, your choice per project. Enterprise plans can pin a dedicated ingest region. Nothing is sold or used to train models.'],
  ['What counts as a session?', 'One app launch or one browser tab visit, up to 30 minutes of inactivity. Background pings and health checks are free.'],
  ['Do you support self-hosting?', 'Not today. We do offer a private-cloud deployment on Enterprise if your security team needs it in your own account.'],
] as const

export function Faq({ brand }: { brand: string }) {
  const [open, setOpen] = useState<number | null>(0)
  const reduced = useReducedMotion()
  return (
    <section id="faq" className="border-t border-border px-5 py-20 @3xl:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 @5xl:grid-cols-[1fr_1.6fr]">
        <div>
          <Heading>Questions we get before the first call.</Heading>
          <p className="mt-4 text-muted-foreground">Still unsure? Write to hello@{brand.toLowerCase().replace(/[^a-z0-9]+/g, '')}.dev and a human answers within a working day.</p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {FAQS.map(([question, answer], i) => {
            const isOpen = open === i
            return (
              <div key={question}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-[15px] font-medium text-foreground">
                  {question}
                  <Icon name="chevron" className={cn('size-4 text-muted-foreground transition-transform duration-300', isOpen && 'rotate-180')} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-xl pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</p>
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

export function Cta() {
  return (
    <section className="relative overflow-hidden border-t border-border px-5 py-24 @3xl:py-32">
      <div className="pointer-events-none absolute bottom-[-18rem] left-1/2 h-[26rem] w-[56rem] max-w-[150%] -translate-x-1/2 rounded-full bg-primary/30 blur-[110px]" aria-hidden />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <Heading>Your next release should be the boring one.</Heading>
        <p className="mt-5 max-w-lg text-muted-foreground">Connect a build this afternoon. If it isn&apos;t catching things by Friday, delete the project and owe us nothing.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg">
            Start free
            <Icon name="arrow" className="size-4" />
          </Button>
          <Button size="lg" variant="outline">
            Read the docs
          </Button>
        </div>
      </div>
    </section>
  )
}

const FOOTER = [
  ['Product', ['Release health', 'Rollback', 'Sessions', 'Integrations', 'Changelog']],
  ['Company', ['About', 'Customers', 'Careers', 'Contact']],
  ['Resources', ['Documentation', 'SDK reference', 'Status', 'Security']],
  ['Legal', ['Privacy', 'Terms', 'DPA', 'Subprocessors']],
] as const

export function Footer({ brand }: { brand: string }) {
  return (
    <footer className="border-t border-border px-5 pb-10 pt-14">
      <div className="mx-auto grid max-w-6xl gap-10 @3xl:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="col-span-full @3xl:col-span-1">
          <BrandMark name={brand} />
          <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">Release health for teams who would rather ship than watch dashboards.</p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            All systems normal
          </span>
        </div>
        <div className="col-span-full grid grid-cols-2 gap-8 @3xl:col-span-4 @3xl:grid-cols-4">
          {FOOTER.map(([title, links]) => (
            <div key={title}>
              <p className="text-sm font-medium text-foreground">{title}</p>
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
      </div>
      <div className="mx-auto mt-14 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>© 2026 {brand} Labs, Inc. All rights reserved.</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>v4.12 · built in Lisbon and Toronto</span>
      </div>
    </footer>
  )
}
