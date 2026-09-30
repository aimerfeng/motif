// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Next.js Templates
// Source: https://github.com/NextJSTemplates/startup-nextjs/blob/e730b6a/src/components/Features/index.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { cn } from '@motif/runtime'
import { LedgerMock, MatchMock, PlayButton, ReconcileMock } from './mockups'
import { Avatar, BrandMark, Button, Heading, Icon, Kicker, Partners } from './parts'

function SectionTitle({ kicker, title, body, center = true }: { kicker?: string; title: string; body?: string; center?: boolean }) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {kicker && <Kicker>{kicker}</Kicker>}
      <Heading className="mt-3">{title}</Heading>
      {body && <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground @2xl:text-lg">{body}</p>}
    </div>
  )
}

const NAV = ['Product', 'Customers', 'Pricing', 'Blog', 'Contact']

export function Header({ brand }: { brand: string }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
        <BrandMark name={brand} />
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-muted-foreground @3xl:flex" aria-label="Primary">
          {NAV.map((item, i) => (
            <a key={item} href="#" onClick={(e) => e.preventDefault()} className={cn('transition-colors duration-200 hover:text-primary', i === 0 && 'text-primary')}>
              {item}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 @3xl:flex">
          <a href="#" onClick={(e) => e.preventDefault()} className="px-3 text-[15px] font-medium text-foreground/80 transition-colors duration-200 hover:text-primary">
            Sign in
          </a>
          <Button>Sign up</Button>
        </div>
        <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)} className="grid size-10 place-items-center rounded-lg border border-border text-foreground @3xl:hidden">
          <Icon name={open ? 'close' : 'menu'} className="size-5" />
        </button>
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-background px-5 pb-5 @3xl:hidden">
          {NAV.map((item) => (
            <a key={item} href="#" onClick={(e) => e.preventDefault()} className="block border-b border-border py-3 text-[15px] font-medium text-foreground">
              {item}
            </a>
          ))}
          <Button className="mt-4 w-full">Sign up</Button>
        </div>
      )}
    </header>
  )
}

export function Hero({ headline, subhead }: { headline: string; subhead: string }) {
  const reduced = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  })
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-14 @3xl:pb-20 @3xl:pt-16">
      {/* 装饰：渐变大圆 + 细环，颜色来自主色 */}
      <div className="pointer-events-none absolute -right-40 -top-56 size-[36rem] rounded-full bg-gradient-to-b from-primary/25 to-transparent opacity-50 @5xl:opacity-100" aria-hidden />
      <div className="pointer-events-none absolute -right-10 top-32 size-[18rem] rounded-full border border-primary/25 opacity-40 @5xl:opacity-100" aria-hidden />
      <div className="pointer-events-none absolute -left-32 bottom-[-14rem] size-[30rem] rounded-full bg-gradient-to-t from-primary/20 to-transparent opacity-50 @5xl:opacity-100" aria-hidden />
      <div className="pointer-events-none absolute left-[8%] top-40 size-4 rounded-full bg-primary/40" aria-hidden />
      <div className="pointer-events-none absolute right-[14%] top-[26rem] size-8 rounded-full bg-primary/25" aria-hidden />
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.span {...rise(0)} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-[13px] font-semibold text-primary">
          <Icon name="sparkle" className="size-3.5" />
          Now reconciling 14 payment processors
        </motion.span>
        <motion.div {...rise(0.08)} className="mt-6">
          <Heading level={1}>{headline}</Heading>
        </motion.div>
        <motion.p {...rise(0.16)} className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground @2xl:text-xl @2xl:leading-relaxed">
          {subhead}
        </motion.p>
        <motion.div {...rise(0.24)} className="mt-8 flex flex-col items-center justify-center gap-4 @2xl:flex-row">
          <Button size="lg">Start free trial</Button>
          <Button size="lg" variant="dark">
            Book a walkthrough
          </Button>
        </motion.div>
        <motion.p {...rise(0.3)} className="mt-5 text-sm text-muted-foreground">
          30 days free. Connect a processor in under ten minutes.
        </motion.p>
      </div>
    </section>
  )
}

export function Brands() {
  return (
    <section className="border-y border-border bg-[var(--tint)] px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="mb-8 text-center text-sm font-medium text-muted-foreground">Marketplaces moving $9B a year reconcile with us</p>
        <Partners />
      </div>
    </section>
  )
}

const FEATURES = [
  ['wallet', 'Auto-match payouts', 'Every bank deposit is tied back to the orders inside it, including partial refunds and rolling reserves.'],
  ['split', 'Split-payout ledger', 'One buyer payment, many sellers. See each split, fee and hold on a single ledger line.'],
  ['chart', 'Fees and FX in one view', 'Processor fees, currency conversion and marketplace commission broken out by the day.'],
  ['alert', 'Exceptions queue', 'Only the 1% that does not match reaches a human, sorted by amount and age.'],
  ['shield', 'Dispute tracking', 'Chargebacks and evidence deadlines sit next to the orders they belong to.'],
  ['ledger', 'Audit-ready exports', 'Immutable history and one-click exports for your accountant, your auditor and your bank.'],
] as const

export function Features() {
  return (
    <section id="product" className="px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker="Main features" title="Close the month without a single spreadsheet" body="We sit between your payment processors and your books, and do the matching that used to take a finance analyst three days." />
        <div className="mt-14 grid gap-x-8 gap-y-10 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {FEATURES.map(([icon, title, body]) => (
            <div key={title} className="group">
              <span className="grid size-[70px] place-items-center rounded-[calc(var(--radius)*1.3)] bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon name={icon} className="size-8" />
              </span>
              <h3 className="mt-6 text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                {title}
              </h3>
              <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Video({ brand }: { brand: string }) {
  return (
    <section className="bg-[var(--tint)] px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker="See it in action" title={`A 90-second look at ${brand}`} body="From the first connected processor to a closed month, with the boring parts sped up." />
        <div className="relative mx-auto mt-12 max-w-4xl">
          <div className="pointer-events-none absolute -inset-4 rounded-[calc(var(--radius)*2)] bg-gradient-to-b from-primary/20 to-transparent" aria-hidden />
          <div className="relative">
            <ReconcileMock brand={brand} className="shadow-[0_30px_80px_-30px_rgb(9_14_52/0.35)]" />
            <div className="absolute inset-0 grid place-items-center rounded-[calc(var(--radius)*1.3)] bg-foreground/[0.06]">
              <PlayButton label="Play the 90-second walkthrough" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center gap-4 text-lg font-medium text-foreground/85">
      <span className="grid size-[30px] shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon name="check" className="size-4" />
      </span>
      {children}
    </li>
  )
}

export function About() {
  return (
    <section id="customers" className="px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl space-y-24 @3xl:space-y-32">
        <div className="grid items-center gap-12 @4xl:grid-cols-2 @4xl:gap-20">
          <div>
            <Heading>Built for marketplaces, not for a single shop</Heading>
            <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">Most reconciliation tools assume one seller and one bank account. We start from the other end: many sellers, many currencies, one deposit.</p>
            <ul className="mt-8 space-y-4">
              <Check>Exact and fuzzy matching, tuned on your data</Check>
              <Check>Multi-currency ledgers with daily rates</Check>
              <Check>Sub-ledger per seller, built in</Check>
            </ul>
          </div>
          <MatchMock />
        </div>
        <div className="grid items-center gap-12 @4xl:grid-cols-2 @4xl:gap-20">
          <div className="@4xl:order-2">
            <Heading>Pay every seller the right amount, on time</Heading>
            <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">Release payouts only when the money has actually landed and matched. Holds, reserves and clawbacks are applied for you.</p>
            <ul className="mt-8 space-y-4">
              <Check>Automatic holds for new sellers</Check>
              <Check>Fees applied per category and country</Check>
              <Check>Statements sent as PDFs, in seller language</Check>
            </ul>
          </div>
          <LedgerMock />
        </div>
      </div>
    </section>
  )
}

const QUOTES = [
  ['Naomi Fairweather', 'Finance Lead, Stallion.co', 'Month-end used to be four days and a lot of coffee. It is now an afternoon, and the exceptions queue tells me exactly where to look.'],
  ['Idris Kamara', 'CFO, Bricklane', 'Our auditors asked how we produced the seller ledger. I sent them the export. They had no follow-up questions, which has never happened before.'],
  ['Sofia Lindgren', 'Head of Payments, Plumline', 'We connected two processors and a bank feed on a Tuesday. By Thursday the unmatched pile had gone from 900 lines to 37.'],
] as const

export function Testimonials() {
  return (
    <section className="bg-[var(--tint)] px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker="Testimonials" title="What finance teams say after the first close" />
        <div className="mt-14 grid gap-7 @3xl:grid-cols-3">
          {QUOTES.map(([name, role, quote]) => (
            <figure key={name} className="flex flex-col rounded-[calc(var(--radius)*1.2)] bg-card p-8 shadow-[0_2px_24px_-8px_rgb(9_14_52/0.14)]">
              <div className="flex gap-1 text-amber-400" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Icon key={i} name="star" className="size-[18px]" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 border-b border-border pb-6 text-[16px] leading-relaxed text-foreground/85">{quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-4">
                <Avatar name={name} size={50} />
                <span>
                  <span className="block text-lg font-semibold text-foreground">{name}</span>
                  <span className="text-sm text-muted-foreground">{role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

const PLANS = [
  { name: 'Lite', blurb: 'For marketplaces under $1M a month.', monthly: 149, yearly: 119, unit: 'per month', rows: [['1 processor and 1 bank feed', true], ['Auto-match up to 5,000 orders', true], ['Exceptions queue', true], ['Split-payout ledger', false], ['Audit exports', false]] },
  { name: 'Team', blurb: 'For growing marketplaces with sellers.', monthly: 449, yearly: 359, unit: 'per month', popular: true, rows: [['5 processors and 3 bank feeds', true], ['Auto-match up to 60,000 orders', true], ['Exceptions queue', true], ['Split-payout ledger', true], ['Audit exports', false]] },
  { name: 'Plus', blurb: 'For platforms with multi-currency flows.', monthly: 1190, yearly: 949, unit: 'per month', rows: [['Unlimited processors and feeds', true], ['Unlimited orders', true], ['Exceptions queue', true], ['Split-payout ledger', true], ['Audit exports and SSO', true]] },
] as const

export function Pricing() {
  const [yearly, setYearly] = useState(true)
  return (
    <section id="pricing" className="px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker="Pricing" title="Simple pricing that scales with your volume" body="Flat monthly plans. No percentage of your payment volume, ever." />
        <div className="mt-10 flex items-center justify-center gap-4 text-base font-semibold" role="group" aria-label="Billing period">
          <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)} className={cn('transition-colors duration-200', yearly ? 'text-muted-foreground' : 'text-primary')}>
            Monthly
          </button>
          <button type="button" role="switch" aria-checked={yearly} aria-label="Bill yearly" onClick={() => setYearly((v) => !v)} className="relative h-7 w-14 rounded-full bg-foreground/85 outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className={cn('absolute left-1 top-1 size-5 rounded-full bg-primary transition-transform duration-200', yearly && 'translate-x-7')} />
          </button>
          <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)} className={cn('transition-colors duration-200', yearly ? 'text-primary' : 'text-muted-foreground')}>
            Yearly <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">-20%</span>
          </button>
        </div>
        <div className="mt-12 grid gap-8 @3xl:grid-cols-3">
          {PLANS.map((plan) => {
            const popular = 'popular' in plan && plan.popular
            return (
              <div key={plan.name} className={cn('relative overflow-hidden rounded-[calc(var(--radius)*1.2)] bg-card px-8 py-10 shadow-[0_2px_24px_-8px_rgb(9_14_52/0.16)]', popular && 'ring-2 ring-primary')}>
                {popular && <span className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Most popular</span>}
                <p className="text-sm font-semibold text-primary">{plan.name}</p>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>
                    ${yearly ? plan.yearly : plan.monthly}
                  </span>
                  <span className="text-base text-muted-foreground">{plan.unit}</span>
                </p>
                <p className="mt-3 border-b border-border pb-8 text-[15px] text-muted-foreground">{plan.blurb}</p>
                <ul className="mt-8 space-y-4">
                  {plan.rows.map(([label, on]) => (
                    <li key={label} className={cn('flex items-center gap-3 text-[15px]', on ? 'text-foreground/85' : 'text-muted-foreground/60')}>
                      <Icon name={on ? 'check' : 'cross'} className={cn('size-4', on ? 'text-primary' : 'text-muted-foreground/50')} />
                      {label}
                    </li>
                  ))}
                </ul>
                <Button variant={popular ? 'primary' : 'soft'} size="lg" className="mt-9 w-full">
                  Start {plan.name}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const POSTS = [
  ['Engineering', 'How we match a $12,480 deposit to 46 orders in 40 ms', 'Rahel Tesfaye', 'Mar 18, 2026', 8, 'linear-gradient(135deg, var(--primary), #8b5cf6)'],
  ['Finance ops', 'A month-end checklist for marketplaces with 500+ sellers', 'Jonah Feld', 'Mar 04, 2026', 6, 'linear-gradient(135deg, #0ea5a4, var(--primary))'],
  ['Product', 'Introducing rolling reserves and automatic seller holds', 'Mei Anders', 'Feb 20, 2026', 4, 'linear-gradient(135deg, #f59e0b, #ef4444 70%, var(--primary))'],
] as const

export function Blog() {
  return (
    <section id="blog" className="bg-[var(--tint)] px-5 py-20 @3xl:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker="Blog" title="Notes from the finance side of payments" body="Short, practical writing from the team that reconciles $9B a year." />
        <div className="mt-14 grid gap-8 @3xl:grid-cols-3">
          {POSTS.map(([tag, title, author, date, minutes, gradient]) => (
            <article key={title} className="group overflow-hidden rounded-[calc(var(--radius)*1.2)] bg-card shadow-[0_2px_24px_-8px_rgb(9_14_52/0.16)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-16px_rgb(9_14_52/0.3)]">
              <a href="#" onClick={(e) => e.preventDefault()} className="block">
                <div className="relative aspect-[37/22] overflow-hidden" style={{ background: gradient }}>
                  <svg viewBox="0 0 370 220" className="absolute inset-0 size-full text-white/25 transition-transform duration-500 group-hover:scale-105" preserveAspectRatio="xMidYMid slice" aria-hidden>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <circle key={i} cx="290" cy="30" r={30 + i * 28} fill="none" stroke="currentColor" strokeWidth="1.2" />
                    ))}
                    <path d="M0 190c40-30 60 20 110-8s70-40 120-6 90 10 140-14v58H0z" fill="currentColor" opacity="0.5" />
                  </svg>
                  <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{tag}</span>
                </div>
                <div className="p-7">
                  <h3 className="text-xl font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                    {title}
                  </h3>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-5 text-sm">
                    <Avatar name={author} size={34} />
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground">{author}</span>
                      <span className="text-muted-foreground">
                        {date} · {minutes} min read
                      </span>
                    </span>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const inputClass = 'w-full rounded-[calc(var(--radius)*0.6)] border border-border bg-background px-5 py-3.5 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15'

export function Contact({ brand }: { brand: string }) {
  const [sent, setSent] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSent(true)
  }
  return (
    <section id="contact" className="px-5 py-20 @3xl:py-28">
      <div className="mx-auto grid max-w-6xl gap-8 @5xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[calc(var(--radius)*1.2)] bg-card px-6 py-10 shadow-[0_2px_24px_-8px_rgb(9_14_52/0.16)] @2xl:px-11 @2xl:py-14">
          <Heading level={2}>Need a hand with your setup?</Heading>
          <p className="mt-3 text-base text-muted-foreground">Tell us which processors you use and we will reply within one working day.</p>
          <form onSubmit={submit} className="mt-8 grid gap-5 @2xl:grid-cols-2">
            <label className="block text-sm font-medium text-foreground">
              Your name
              <input className={cn(inputClass, 'mt-2')} placeholder="Enter your name" autoComplete="off" />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Work email
              <input type="email" className={cn(inputClass, 'mt-2')} placeholder="you@company.example" autoComplete="off" />
            </label>
            <label className="block text-sm font-medium text-foreground @2xl:col-span-2">
              Your message
              <textarea rows={4} className={cn(inputClass, 'mt-2 resize-none')} placeholder="Which processors and banks do you reconcile today?" />
            </label>
            <div className="@2xl:col-span-2">
              <button type="submit" className="h-[52px] rounded-[calc(var(--radius)*0.7)] bg-primary px-8 text-base font-semibold text-primary-foreground transition-[filter] duration-200 hover:brightness-110">
                {sent ? 'Thanks, we will be in touch' : 'Send message'}
              </button>
            </div>
          </form>
        </div>
        <div className="rounded-[calc(var(--radius)*1.2)] bg-card px-6 py-10 shadow-[0_2px_24px_-8px_rgb(9_14_52/0.16)] @2xl:px-10 @2xl:py-14">
          <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Get the {brand} field notes
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">One email a month with a reconciliation tip, a real customer number and nothing else.</p>
          <div className="mt-8 space-y-4">
            <input type="email" aria-label="Email address" className={inputClass} placeholder="Enter your email" autoComplete="off" />
            <Button variant="dark" className="w-full" size="lg">
              Subscribe
            </Button>
          </div>
          <p className="mt-5 text-center text-[13px] leading-relaxed text-muted-foreground">No spam. Unsubscribe with one click.</p>
        </div>
      </div>
    </section>
  )
}

const FOOTER = [
  ['Product', ['Auto-match', 'Split payouts', 'Exceptions', 'Integrations', 'Changelog']],
  ['Company', ['About', 'Customers', 'Careers', 'Press']],
  ['Resources', ['Guides', 'API docs', 'Security', 'Status']],
] as const

export function Footer({ brand }: { brand: string }) {
  return (
    <footer className="border-t border-border bg-[var(--tint)] px-5 pt-16">
      <div className="mx-auto grid max-w-6xl gap-10 border-b border-border pb-12 @3xl:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <BrandMark name={brand} />
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-muted-foreground">Payment reconciliation for marketplaces and platforms. Built in Amsterdam, used in 41 countries.</p>
        </div>
        {FOOTER.map(([title, links]) => (
          <div key={title}>
            <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              {title}
            </p>
            <ul className="mt-5 space-y-3 text-[15px] text-muted-foreground">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors duration-200 hover:text-primary">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 py-8 text-sm text-muted-foreground">
        <span>© 2026 {brand} B.V. All rights reserved.</span>
        <span className="flex gap-6">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">
            Privacy
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">
            Terms
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-primary">
            Cookies
          </a>
        </span>
      </div>
    </footer>
  )
}
