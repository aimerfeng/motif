// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Gonzalo Chalé
// Source: https://github.com/gonzalochale/saas-landing-template/blob/7bc36b2/components/pricing.tsx
// Modified by Motif; see the item's provenance.
import { MeshGradient } from '@paper-design/shaders-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { cn, usePrefersReducedMotion } from '@motif/runtime'
import { ReportMock, RuleMock } from './mockups'
import { Avatar, BrandMark, Button, Heading, Icon, Kicker, mix, Partners } from './parts'

const NAV = ['Product', 'Customers', 'Pricing', 'Help center']

export function Navbar({ brand }: { brand: string }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="mx-auto max-w-5xl rounded-[calc(var(--radius)*2)] border border-border bg-card/80 shadow-[0_8px_30px_-16px_rgb(0_0_0/0.25)] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between pl-4 pr-2.5">
          <BrandMark name={brand} />
          <nav className="hidden items-center gap-1 text-sm font-medium text-muted-foreground @3xl:flex" aria-label="Primary">
            {NAV.map((item) => (
              <a key={item} href="#" onClick={(e) => e.preventDefault()} className="rounded-full px-3.5 py-1.5 transition-colors duration-200 hover:bg-muted hover:text-foreground">
                {item}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 @3xl:flex">
            <a href="#" onClick={(e) => e.preventDefault()} className="px-3 text-sm font-medium text-foreground">
              Log in
            </a>
            <Button variant="dark">Try it free</Button>
          </div>
          <button type="button" className="grid size-10 place-items-center rounded-full text-foreground @3xl:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <Icon name={open ? 'close' : 'menu'} className="size-5" />
          </button>
        </div>
        {open && (
          <div className="border-t border-border px-4 pb-4 pt-2 @3xl:hidden">
            {NAV.map((item) => (
              <a key={item} href="#" onClick={(e) => e.preventDefault()} className="block border-b border-border py-3 text-[15px] font-medium text-foreground last:border-0">
                {item}
              </a>
            ))}
            <Button variant="dark" className="mt-3 w-full">
              Try it free
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

/** 首屏：标题在上，下面一块流动渐变（着色器）托着收件箱界面。 */
export function Hero({ headline, subhead, dark, accent, children }: { headline: string; subhead: string; dark: boolean; accent: string; children: ReactNode }) {
  const reduced = useReducedMotion()
  const still = usePrefersReducedMotion()
  const colors = dark
    ? [mix('#0b0f12', accent, 0.55), mix('#0b0f12', accent, 0.22), '#10231f', mix('#0b0f12', '#7a5cff', 0.3)]
    : [mix('#ffffff', accent, 0.55), mix('#ffffff', accent, 0.22), '#fff1d6', mix('#ffffff', '#8fb8ff', 0.6)]
  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  })
  return (
    <section className="px-4 pb-6 pt-12 @3xl:pt-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.a {...rise(0)} href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[13px] font-medium text-foreground shadow-sm">
          <span className="rounded-full bg-primary px-2 py-px text-[11px] font-bold text-primary-foreground">New</span>
          Suggested replies, drafted from your own macros
          <Icon name="arrow" className="size-3.5 text-muted-foreground" />
        </motion.a>
        <motion.div {...rise(0.08)} className="mt-6">
          <Heading level={1}>{headline}</Heading>
        </motion.div>
        <motion.p {...rise(0.16)} className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground @2xl:text-lg">
          {subhead}
        </motion.p>
        <motion.div {...rise(0.24)} className="mt-7 flex flex-wrap justify-center gap-3">
          <Button size="lg">
            Start a 14-day trial
            <Icon name="arrow" className="size-4" />
          </Button>
          <Button size="lg" variant="outline">
            Watch the 2-minute tour
          </Button>
        </motion.div>
        <motion.p {...rise(0.3)} className="mt-4 text-[13px] text-muted-foreground">
          No credit card. Import from your old helpdesk in one click.
        </motion.p>
      </div>
      <motion.div {...rise(0.4)} className="relative mx-auto mt-10 max-w-6xl overflow-hidden rounded-[calc(var(--radius)*2.2)] border border-border px-3 pt-8 @2xl:px-10 @2xl:pt-14">
        <MeshGradient className="absolute inset-0" style={{ width: '100%', height: '100%' }} colors={colors} distortion={0.85} swirl={0.3} speed={still ? 0 : 0.35} frame={still ? 3000 : 0} />
        <div className="relative mx-auto max-w-4xl translate-y-1">{children}</div>
      </motion.div>
    </section>
  )
}

export function PartnersBand() {
  return (
    <section className="px-4 py-14">
      <div className="mx-auto max-w-5xl">
        <p className="mb-8 text-center text-sm font-medium text-muted-foreground">Support teams at 3,200 companies answer from one inbox</p>
        <Partners />
      </div>
    </section>
  )
}

function FeatureRow({ kicker, title, body, points, flip, children }: { kicker: string; title: string; body: string; points: string[]; flip?: boolean; children: ReactNode }) {
  return (
    <div className="grid items-center gap-10 @4xl:grid-cols-2 @4xl:gap-16">
      <div className={cn(flip && '@4xl:order-2')}>
        <Kicker>{kicker}</Kicker>
        <Heading className="mt-3">{title}</Heading>
        <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">{body}</p>
        <ul className="mt-6 space-y-2.5 text-[15px] text-foreground">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <Icon name="check" className="size-3" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[calc(var(--radius)*2)] bg-[var(--tint)] p-4 @2xl:p-8">{children}</div>
    </div>
  )
}

export function Features() {
  return (
    <section id="product" className="px-4 py-16 @3xl:py-24">
      <div className="mx-auto max-w-6xl space-y-20 @3xl:space-y-28">
        <FeatureRow
          kicker="Automation"
          title="Let the boring routing run itself"
          body="Describe a rule in plain terms and it applies to every new message. No scripts, no separate workflow tool."
          points={['Route by keyword, plan, language or sender', 'Attach macros so replies start half-written', 'Every rule shows how many conversations it touched']}
        >
          <RuleMock />
        </FeatureRow>
        <FeatureRow
          flip
          kicker="Reports"
          title="Watch first-response time fall, week by week"
          body="A single page shows where conversations wait. Filter by mailbox, tag or teammate, then export to CSV for the Monday review."
          points={['Median and 90th-percentile response times', 'Backlog by age, not just by count', 'Scheduled email summaries for managers']}
        >
          <ReportMock />
        </FeatureRow>
      </div>
    </section>
  )
}

const STEPS = [
  ['mail', 'Forward your address', 'Point support@ at Harbor or connect Gmail and Outlook. Existing threads import in the background.'],
  ['users', 'Invite the team', 'Assign mailboxes, set working hours and add the first three macros. Most teams finish in twenty minutes.'],
  ['send', 'Answer together', 'Replies go out from your own domain. Notes, assignments and collisions are handled in the thread.'],
] as const

export function Steps({ brand }: { brand: string }) {
  return (
    <section className="px-4 py-16 @3xl:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Kicker>Getting started</Kicker>
          <Heading className="mt-3">Live before lunch, with your old threads intact</Heading>
        </div>
        <div className="relative mt-14 grid gap-6 @3xl:grid-cols-3">
          <div className="absolute left-[16.6%] right-[16.6%] top-7 hidden border-t border-dashed border-border @3xl:block" aria-hidden />
          {STEPS.map(([icon, title, body], i) => (
            <div key={title} className="relative text-center">
              <span className="relative mx-auto grid size-14 place-items-center rounded-full border border-border bg-card text-primary shadow-sm">
                <Icon name={icon} className="size-6" />
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">{i + 1}</span>
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{body.replace('Harbor', brand)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const REVIEWS = [
  ['Lena Marchetti', 'Head of Support, Waverly', 'We closed our old helpdesk in a weekend. First-response time dropped from three hours to twenty-two minutes and nobody has asked to go back.'],
  ['Omar Haddad', 'Founder, lumen/row', 'It feels like email, which is the point. Our two-person team stopped stepping on each other because you can see who is typing.'],
  ['Grace Whitlock', 'Ops Lead, Northfold', 'The routing rules replaced a spreadsheet and a very tired intern. Billing questions land with billing and get a reply before I see them.'],
  ['Yuki Nakamura', 'CX Manager, Pinecrest', 'Reports finally answer the question I get every Monday: where are people waiting, and why. I export one CSV and I am done.'],
  ['Tomás Reyes', 'Support Engineer, Alderbank', 'Internal notes inside the thread mean engineering gets context without a second Slack conversation. Small thing, huge saving.'],
  ['Ada Okafor', 'COO, Duet & Co', 'Pricing is per agent, no surprise tiers for the features we need. Finance approved it in one email.'],
] as const

export function Testimonials() {
  return (
    <section className="px-4 py-16 @3xl:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Kicker>Customers</Kicker>
          <Heading className="mt-3">Small teams, fewer dropped messages</Heading>
        </div>
        <div className="mt-12 gap-5 @2xl:columns-2 @5xl:columns-3">
          {REVIEWS.map(([name, role, quote]) => (
            <figure key={name} className="mb-5 break-inside-avoid rounded-[calc(var(--radius)*1.6)] border border-border bg-card p-6 shadow-sm">
              <div className="flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Icon key={i} name="star" className="size-4" />
                ))}
              </div>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-foreground/90">{quote}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar name={name} />
                <span className="text-sm">
                  <span className="block font-semibold text-foreground">{name}</span>
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

const STATS = [
  ['3,200+', 'teams answering from one inbox'],
  ['22 min', 'median first response after switching'],
  ['41M', 'conversations handled last year'],
  ['99.98%', 'uptime, measured monthly'],
] as const

export function Stats() {
  return (
    <section className="px-4 py-6">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 rounded-[calc(var(--radius)*2.2)] bg-primary px-6 py-12 text-primary-foreground @3xl:grid-cols-4 @3xl:px-10">
        {STATS.map(([value, label]) => (
          <div key={label} className="text-center">
            <p className="text-4xl @3xl:text-5xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>
              {value}
            </p>
            <p className="mx-auto mt-2 max-w-[13rem] text-sm leading-snug opacity-80">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const TIERS = [
  { name: 'Starter', blurb: 'One shared mailbox for a small team.', monthly: 19, yearly: 15, features: ['Up to 3 agents', '1 shared mailbox', 'Macros and internal notes', '30-day search history'] },
  {
    name: 'Growth',
    blurb: 'Routing, reports and every channel.',
    monthly: 39,
    yearly: 31,
    featured: true,
    features: ['Unlimited agents', '5 mailboxes and live chat', 'Automation rules', 'Reports and CSV export', 'Suggested replies'],
  },
  { name: 'Scale', blurb: 'For multi-brand and regulated teams.', monthly: 79, yearly: 63, features: ['Everything in Growth', 'SSO and audit log', 'Sandbox workspace', 'Priority support, 1-hour SLA'] },
] as const

export function Pricing() {
  const [yearly, setYearly] = useState(true)
  return (
    <section id="pricing" className="px-4 py-16 @3xl:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Kicker>Pricing</Kicker>
          <Heading className="mt-3">Per agent, per month, nothing hidden</Heading>
          <div className="mt-8 inline-flex rounded-full border border-border bg-card p-1 text-sm font-medium shadow-sm" role="group" aria-label="Billing period">
            {[
              ['Monthly', false],
              ['Yearly · 2 months free', true],
            ].map(([label, value]) => (
              <button key={label as string} type="button" aria-pressed={yearly === value} onClick={() => setYearly(value as boolean)} className={cn('rounded-full px-4 py-1.5 transition-[background-color,color] duration-200', yearly === value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>
                {label as string}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-12 grid gap-5 @3xl:grid-cols-3">
          {TIERS.map((tier) => {
            const featured = 'featured' in tier && tier.featured
            return (
              <div key={tier.name} className={cn('relative flex flex-col rounded-[calc(var(--radius)*1.8)] border bg-card p-7', featured ? 'border-primary shadow-[0_24px_60px_-28px_var(--primary)] ring-1 ring-primary' : 'border-border shadow-sm')}>
                {featured && <span className="absolute right-5 top-5 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">Popular</span>}
                <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.blurb}</p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-5xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>
                    ${yearly ? tier.yearly : tier.monthly}
                  </span>
                  <span className="text-sm text-muted-foreground">/ agent / mo</span>
                </p>
                <Button variant={featured ? 'primary' : 'outline'} className="mt-6 w-full" size="lg">
                  Choose {tier.name}
                </Button>
                <ul className="mt-7 space-y-3 text-sm text-foreground/85">
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
  ['Can we move over from our current helpdesk?', 'Yes. Connect the old account and we import conversations, customers and tags in the background. Most teams cut over within a day.'],
  ['Do replies come from our own domain?', 'They do. You add two DNS records and messages are signed with your domain, so nothing says "via" in the recipient inbox.'],
  ['What happens to a conversation two people open?', 'Both see the other typing and the second person is warned before sending. Nothing is ever sent twice.'],
  ['Is there a limit on conversations?', 'No. Plans are priced per agent. Fair-use applies to automated mail only, at 50,000 messages a month.'],
  ['How is customer data handled?', 'Data is encrypted at rest, stored in the EU or US per workspace, and deleted 30 days after you cancel. We do not train models on your conversations.'],
] as const

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const reduced = useReducedMotion()
  return (
    <section className="px-4 py-16 @3xl:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Kicker>FAQ</Kicker>
          <Heading className="mt-3">Before you switch</Heading>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map(([question, answer], i) => {
            const isOpen = open === i
            return (
              <div key={question} className="rounded-[calc(var(--radius)*1.4)] border border-border bg-card shadow-sm">
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-foreground">
                  {question}
                  <span className={cn('grid size-7 shrink-0 place-items-center rounded-full bg-muted transition-transform duration-300', isOpen && 'rotate-180')}>
                    <Icon name="chevron" className="size-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</p>
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
    <section className="px-4 py-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[calc(var(--radius)*2.2)] bg-foreground px-6 py-16 text-center text-background @3xl:py-24">
        <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-primary/50 blur-[90px]" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-primary/30 blur-[100px]" aria-hidden />
        <div className="relative mx-auto max-w-2xl">
          <Heading className="!text-background">Give your customers one conversation to keep</Heading>
          <p className="mx-auto mt-4 max-w-md opacity-75">Try {brand} with your real mailbox for 14 days. If it does not save you an hour a day, we will help you export everything.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg">Start a 14-day trial</Button>
            <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex h-12 items-center rounded-full border border-background/25 px-6 text-[15px] font-semibold text-background transition-colors duration-200 hover:bg-background/10">
              Talk to a human
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

const FOOTER = [
  ['Product', ['Shared inbox', 'Live chat', 'Automation', 'Reports', 'Changelog']],
  ['Company', ['About', 'Careers', 'Press kit', 'Contact']],
  ['Resources', ['Help center', 'Migration guides', 'API reference', 'Status']],
  ['Legal', ['Privacy', 'Terms', 'Security', 'DPA']],
] as const

export function Footer({ brand }: { brand: string }) {
  return (
    <footer className="overflow-hidden px-4 pt-14">
      <div className="mx-auto grid max-w-6xl gap-10 @3xl:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div>
          <BrandMark name={brand} />
          <p className="mt-4 max-w-[15rem] text-sm leading-relaxed text-muted-foreground">Shared inbox for support teams who answer with a name, not a ticket number.</p>
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
      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>© 2026 {brand} Software Ltd.</span>
        <span>Made in Rotterdam and Lisbon</span>
      </div>
      <p aria-hidden className="pointer-events-none mx-auto mt-6 max-w-6xl select-none text-center leading-[0.8] text-foreground/[0.05] [font-size:clamp(4rem,22cqw,17rem)]" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: '-0.05em' }}>
        {brand}
      </p>
    </footer>
  )
}
