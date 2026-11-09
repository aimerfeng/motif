// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/pages/landing/lead-generation.astro
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { cn } from '@/lib/motif-runtime'
import { CoverageMap, PaybackChart, RoofIllustration, estimate, money } from './art'
import { ContactForm, QuoteForm } from './quote-form'
import { Avatar, BrandMark, Button, Headline, Icon, WidgetWrapper, headingStyle, scrollToId } from './parts'

const PHONE = '(555) 014-2290'

/* ---------- 页头：落地页只留标志和一个按钮 ---------- */

export function Header({ brand }: { brand: string }) {
  const reduced = useReducedMotion()
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 @3xl:px-6">
        <BrandMark name={brand} className="min-w-0" />
        <div className="flex shrink-0 items-center gap-5">
          <a href="#" onClick={(e) => e.preventDefault()} className="hidden items-center gap-2 text-sm font-medium text-foreground transition-colors duration-200 hover:text-[var(--accent-ink)] @2xl:inline-flex">
            <Icon name="phone" className="size-4" />
            {PHONE}
          </a>
          <Button variant="primary" className="px-5 py-2.5 text-sm @3xl:px-5" onClick={() => scrollToId('quote', reduced)}>
            Get my quote
          </Button>
        </div>
      </div>
    </header>
  )
}

/* ---------- 1. Hero：一个承诺、一个动作；图片位换成插图 + 报价表单 ---------- */

export function Hero({ headline, brand, formSteps, rate, sunHours }: { headline: string; brand: string; formSteps: string; rate: number; sunHours: number }) {
  const reduced = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: 'easeOut' as const },
  })
  return (
    <section className="relative" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--tint)] to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 @2xl:px-6">
        <div className="py-12 @3xl:py-20">
          <div className="mx-auto max-w-5xl pb-10 text-center @3xl:pb-16">
            <motion.p {...rise(0)} className="text-base font-bold tracking-wide text-[var(--accent-ink)] uppercase">
              Home solar, quoted online
            </motion.p>
            <motion.h1 {...rise(0.06)} id="hero-title" className="mt-2 mb-4 text-4xl leading-[1.08] text-balance @2xl:text-5xl @3xl:text-6xl" style={headingStyle}>
              {headline}
            </motion.h1>
            <div className="mx-auto max-w-3xl">
              <motion.p {...rise(0.12)} className="mb-6 text-xl text-pretty text-muted-foreground">
                Tell us where you live, what your roof is made of and what you pay each month. {brand} sends a panel layout and a fixed price by email, usually the next morning.
              </motion.p>
              <motion.ul {...rise(0.18)} className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-foreground">
                {['Licensed and insured crews', '25-year workmanship warranty', 'No sales visit until you ask'].map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <Icon name="check" className="size-4 text-[var(--accent-ink)]" />
                    {item}
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>
          <motion.div {...rise(0.24)} id="quote" className="relative mx-auto grid max-w-5xl scroll-mt-24 items-center gap-8 @4xl:grid-cols-[1fr_1.05fr] @4xl:gap-10">
            <div className="@4xl:order-2">
              <QuoteForm mode={formSteps} rate={rate} sunHours={sunHours} brand={brand} />
            </div>
            <div className="overflow-hidden rounded-[var(--radius)] border border-border shadow-lg">
              <RoofIllustration className="block h-auto w-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ---------- 2. Note：为什么划算 ---------- */

export function Note() {
  return (
    <section className="bg-[var(--tint)]">
      <div className="mx-auto max-w-6xl px-4 py-4 text-center font-medium text-foreground @2xl:px-6">
        <Icon name="info" className="mr-1.5 inline-block size-5 align-text-bottom text-[var(--accent-ink)]" />
        <span className="mr-1 font-bold">Why it pays:</span>
        panels produce most while you are at work, and net metering credits that surplus against your evening use.
      </div>
    </section>
  )
}

/* ---------- 3. Content：省钱估算，滑块重画回本曲线 ---------- */

export function Savings({ rate, sunHours }: { rate: number; sunHours: number }) {
  const [bill, setBill] = useState(160)
  const id = useId()
  const data = estimate(bill, rate, sunHours)
  const items = [
    {
      title: `${data.size} kW system, ${data.panels} panels`,
      description: `Sized to cover about 90% of the ${Math.round(data.usage).toLocaleString('en-US')} kWh you use each month.`,
    },
    {
      title: `Installed price: ${money(data.price)}`,
      description: 'Fixed in writing after the site visit. Permits, inspection and the meter swap are included.',
    },
    {
      title: data.payback === null ? 'Payback: longer than 25 years' : `Pays for itself in ${data.payback.toFixed(1)} years`,
      description:
        data.payback === null
          ? 'At this bill a smaller system or a battery-only setup may suit you better. We will say so in the quote.'
          : `Then about ${money(data.firstYear * 1.03 ** Math.ceil(data.payback))} a year stays with you, rising with utility rates.`,
    },
  ]
  return (
    <WidgetWrapper id="savings" className="bg-[var(--tint)]" label={`${id}-title`}>
      <Headline
        id={`${id}-title`}
        tagline="Savings estimator"
        title="What your bill turns into"
        subtitle={`Move the slider to your average monthly bill. We assume ${rate}¢ per kWh and ${sunHours} peak sun hours a day.`}
        className="max-w-xl @xl:mx-auto @5xl:max-w-2xl"
        titleClass="mb-4 text-4xl @3xl:text-5xl"
        subtitleClass="mx-auto max-w-3xl text-xl @xl:text-center"
      />
      <div className="mx-auto max-w-7xl px-0 py-4 @3xl:px-2">
        <div className="@3xl:flex @3xl:flex-row-reverse @3xl:gap-16">
          <div className="self-center @3xl:basis-1/2">
            <div className="mb-10 rounded-[var(--radius)] border border-border bg-card p-5">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={`${id}-bill`} className="font-medium text-foreground">
                  Average monthly bill
                </label>
                <output htmlFor={`${id}-bill`} className="text-3xl font-bold text-foreground tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>
                  ${bill}
                </output>
              </div>
              <input
                id={`${id}-bill`}
                type="range"
                min={40}
                max={450}
                step={10}
                value={bill}
                onChange={(event) => setBill(Number(event.target.value))}
                aria-valuetext={`$${bill} a month`}
                className="mt-4 h-2 w-full cursor-pointer accent-[var(--primary)]"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground" aria-hidden>
                <span>$40</span>
                <span>$450</span>
              </div>
            </div>
            <div className="mx-auto grid gap-8 gap-y-4 @3xl:gap-y-8" aria-live="polite">
              {items.map((item) => (
                <div key={item.description} className="flex max-w-none flex-row">
                  <div className="flex justify-center">
                    <span className="mr-2 flex size-7 items-center justify-center rounded-full bg-green-600 p-1 text-gray-50">
                      <Icon name="check" className="size-5" />
                    </span>
                  </div>
                  <div className="mt-0.5">
                    <h3 className="ml-2 text-lg leading-6 font-medium text-foreground">{item.title}</h3>
                    <p className="mt-3 ml-2 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 @3xl:mt-0 @3xl:basis-1/2">
            <figure className="relative m-auto max-w-4xl rounded-[var(--radius)] border border-border bg-card p-4 shadow-lg @xl:p-6">
              <figcaption className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-semibold text-foreground">Cumulative savings over 25 years</span>
                <span className="text-sm text-muted-foreground tabular-nums">{money(data.total)} by year 25</span>
              </figcaption>
              <PaybackChart data={data} />
              <p className="mt-4 text-xs text-muted-foreground">Estimate only. Assumes 0.5% yearly panel degradation and 3% yearly utility price rises.</p>
            </figure>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 4. Steps：从报价到并网的四步，图片位换成服务范围图 ---------- */

const STEPS = [
  { when: 'Day 1', title: 'Remote roof survey', icon: 'scan', body: 'We measure your roof from aerial and elevation data, then email a panel layout and a fixed price. Nobody climbs a ladder yet.' },
  { when: 'Week 1', title: 'Site visit', icon: 'clipboard', body: 'A designer checks the rafters, the main panel and the meter in a 45-minute visit and confirms the price in writing.' },
  { when: 'Weeks 2–5', title: 'Permits and the utility', icon: 'stamp', body: 'We file the building permit and the interconnection application and chase both. You sign twice.' },
  { when: 'Week 6', title: 'Install day', icon: 'bolt', body: 'A crew of four mounts the racking, panels and inverter in one day. The inspector visits, then the utility swaps your meter.' },
] as const

export function Steps({ brand }: { brand: string }) {
  const id = useId()
  return (
    <WidgetWrapper id="process" containerClass="max-w-5xl" label={`${id}-title`}>
      <div className="flex flex-col gap-8 @3xl:flex-row @3xl:gap-12">
        <div className="@3xl:basis-1/2 @3xl:self-center @3xl:py-4">
          <Headline
            id={`${id}-title`}
            tagline="How it works"
            title="From quote to switch-on in about six weeks"
            className="mx-0 text-left"
            titleClass="text-3xl @5xl:text-4xl"
          />
          <div>
            {STEPS.map((step, index) => (
              <div key={step.title} className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <div>
                    <div className="flex items-center justify-center">
                      <span className="grid size-10 place-items-center rounded-full border-2 border-[var(--primary)]/50 p-2 text-[var(--accent-ink)]">
                        <Icon name={step.icon} className="size-5" />
                      </span>
                    </div>
                  </div>
                  {index !== STEPS.length - 1 && <div className="h-full w-px bg-border" />}
                </div>
                <div className={cn('pt-1', index !== STEPS.length - 1 && 'pb-8')}>
                  <p className="text-xl font-bold text-foreground">
                    {step.when}: <span className="font-medium">{step.title}</span>
                  </p>
                  <p className="mt-2 text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex flex-col justify-center @3xl:basis-1/2">
          <p className="mb-3 text-sm font-semibold text-foreground">Where we install</p>
          <CoverageMap brand={brand} />
        </div>
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 5. Testimonials：真实感的评价卡 ---------- */

const REVIEWS = [
  {
    rating: 5,
    testimonial: 'Our July bill went from $212 to $14. The crew was off the roof by three and left the gutters cleaner than they found them.',
    name: 'Dana Whitfield',
    job: 'Alder Creek · 8.4 kW, installed 2025',
  },
  {
    rating: 5,
    testimonial: 'They told us the north slope was not worth covering and quoted six fewer panels than the other installer. That honesty is why we signed.',
    name: 'Marcus Ortiz',
    job: 'Marlow · 6.2 kW, installed 2024',
  },
  {
    rating: 4,
    testimonial: 'The permit took three weeks longer than quoted, but I got a text every time something moved.',
    name: 'Priya Raman',
    job: 'Easton Bay · 10.1 kW, installed 2025',
  },
]

export function Testimonials({ dark }: { dark: boolean }) {
  const id = useId()
  return (
    <WidgetWrapper id="reviews" containerClass="mx-auto max-w-6xl" label={`${id}-title`}>
      <Headline
        id={`${id}-title`}
        tagline="Reviews"
        title="Homeowners, one full year of bills later"
        subtitle="We ask for a review twelve months after switch-on, once the numbers are in. These are three of them."
      />
      <div className="grid gap-6 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {REVIEWS.map((review) => (
          <div key={review.name} className="flex h-auto">
            <div className={cn('flex w-full flex-col rounded-[var(--radius)] bg-card p-4 @3xl:p-6', dark ? 'border border-border' : 'shadow-xl')}>
              <div className="flex items-center justify-between gap-4 pb-4">
                <div className="flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon key={star} name="star" className={cn('size-4', star <= review.rating ? 'text-amber-400' : dark ? 'text-slate-600' : 'text-gray-300')} />
                  ))}
                </div>
              </div>
              <blockquote className="flex-auto">
                <p className="text-muted-foreground before:content-['“'] after:content-['”']">{review.testimonial}</p>
              </blockquote>
              <hr className="my-4 border-border" />
              <div className="flex items-center">
                <Avatar name={review.name} />
                <div className="ml-3 grow">
                  <p className="text-base font-semibold text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.job}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 6. Contact：不想填表就约电话 ---------- */

export function Contact({ brand }: { brand: string }) {
  const id = useId()
  return (
    <WidgetWrapper id="call" containerClass="mx-auto max-w-7xl" className="bg-[var(--tint)]" label={`${id}-title`}>
      <Headline
        id={`${id}-title`}
        tagline="Prefer to talk?"
        title="Book a call with a solar designer"
        subtitle="Fifteen minutes, on your schedule. We go through your bill and your roof together and you decide if a visit makes sense."
      />
      <div className="mx-auto flex w-full max-w-xl flex-col rounded-[var(--radius)] border border-border bg-card p-4 shadow @xl:p-6 @5xl:p-8">
        <ContactForm brand={brand} />
      </div>
    </WidgetWrapper>
  )
}

/* ---------- 7. FAQs：原生 <details name> 互斥手风琴 ---------- */

const FAQS = [
  {
    title: 'How accurate is the online quote?',
    description: 'The layout and price come from aerial measurements of your roof and your bill. The site visit confirms them; if anything changes we explain why before you sign, and most quotes do not move at all.',
  },
  {
    title: 'What if my roof needs replacing soon?',
    description: 'Tell us its age in the form or on the call. If it has less than ten years left we will say so, and we can quote the reroof and the panels together so the work happens once.',
  },
  {
    title: 'Do panels still work on cloudy days?',
    description: 'Yes, at a lower output. The estimate already uses local weather averages, so cloudy months are counted in the payback figure rather than hidden from it.',
  },
  {
    title: 'What happens if I sell the house?',
    description: 'An owned system transfers with the house and usually adds to its value. We hand you the warranty documents, monitoring login and permit history to give to the buyer.',
  },
  {
    title: 'Is a battery included?',
    description: 'Not by default. A battery makes sense if your utility pays little for exported power or you want backup during outages; the quote shows both options side by side.',
  },
  {
    title: 'What does the warranty cover?',
    description: 'Panels carry a 25-year performance warranty from the manufacturer. Our workmanship warranty covers the roof penetrations, wiring and racking for 25 years, labour included.',
  },
]

export function FAQs() {
  const id = useId()
  const group = `faq-${id.replace(/:/g, '')}`
  return (
    <WidgetWrapper id="faq" containerClass="mx-auto max-w-7xl" label={`${id}-title`}>
      <Headline id={`${id}-title`} tagline="FAQ" title="Questions people ask before they get a quote" subtitle="If yours is not here, the call above is the fastest way to an answer." />
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

/* ---------- 8. CallToAction：同一个动作再给一次 ---------- */

export function CallToAction({ dark }: { dark: boolean }) {
  const reduced = useReducedMotion()
  const id = useId()
  return (
    <WidgetWrapper id="get-quote" containerClass="mx-auto max-w-6xl" label={`${id}-title`}>
      <div className={cn('mx-auto max-w-3xl rounded-[var(--radius)] bg-card p-6 text-center', dark ? 'border border-border' : 'shadow-xl')}>
        <Headline
          id={`${id}-title`}
          title="See what your roof could produce"
          subtitle="Three questions, two minutes, one fixed-price quote in your inbox. No sales call unless you ask for one."
          className="mb-0 @3xl:mb-0"
          titleClass="mb-4 text-4xl @3xl:text-4xl"
          subtitleClass="text-xl text-muted-foreground"
        />
        <div className="m-auto mt-6 flex max-w-xs flex-col flex-nowrap gap-4 @xl:max-w-md @xl:flex-row @xl:justify-center">
          <div className="flex w-full @xl:w-auto">
            <Button variant="primary" className="w-full" onClick={() => scrollToId('quote', reduced)}>
              Start my quote
              <Icon name="arrow" className="-mr-1.5 ml-1 size-5" />
            </Button>
          </div>
          <div className="flex w-full @xl:w-auto">
            <Button className="w-full">
              <Icon name="phone" className="size-4" />
              Call {PHONE}
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
          <BrandMark name={brand} className="min-w-0 text-base" />
          <span>Licensed electrical contractor no. 1047881</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {['Privacy', 'Terms', 'Warranty', 'Careers'].map((link) => (
            <a key={link} href="#" onClick={(e) => e.preventDefault()} className="transition-colors duration-200 hover:text-foreground">
              {link}
            </a>
          ))}
          <span>© 2026 {brand}</span>
        </nav>
      </div>
    </footer>
  )
}
