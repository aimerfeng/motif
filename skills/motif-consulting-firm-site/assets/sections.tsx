// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Emil Gulamov
// Source: https://github.com/mearashadowfax/ScrewFast/blob/aa9da9a/src/components/ui/blocks/AlternatingSections.astro
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'
import { FOOTER_SECTIONS, INDUSTRIES, INSIGHTS, NAV, OFFICES, PRACTICES, RESULTS, type Article } from './content'
import { Art, BrandMark, focusRing, Heading, Icon, PrimaryCTA, SecondaryCTA, type IconName } from './parts'

// 上游各区块的 max-w-[85rem] 容器；上下留白乘以 density（--d）。
const WRAP = 'mx-auto max-w-[85rem] px-4 sm:px-6 lg:px-8'
const PAD = 'py-[calc(2.5rem*var(--d))] lg:py-[calc(3.5rem*var(--d))]'

/** 页内的占位链接（# 开头的锚点照常跳转，其余不跳）。 */
const stay = (event: MouseEvent<HTMLAnchorElement>) => event.preventDefault()

// ---------------------------------------------------------------------------
// Navbar.astro + NavLink.astro + NavbarToggle.astro
// ---------------------------------------------------------------------------

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="mt-5 flex flex-col gap-x-0 gap-y-4 lg:mt-0 lg:flex-row lg:items-center lg:justify-end lg:gap-x-6 lg:gap-y-0 lg:ps-7 xl:gap-x-7">
      {NAV.map((link) => (
        <a key={link.href} href={link.href} onClick={onNavigate} className={cn('rounded-(--r) text-base font-medium text-(--soft) transition-colors duration-300 hover:text-(--ink) lg:py-3 lg:text-sm 2xl:text-base', focusRing)}>
          {link.label}
        </a>
      ))}
      <PrimaryCTA title="Contact us" href="#contact" onClick={onNavigate} noArrow className="py-2.5 lg:my-2" />
    </div>
  )
}

export function Navbar({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const collapseId = useId()
  return (
    <header className="sticky inset-x-0 top-4 z-50 flex w-full flex-wrap px-2 text-sm lg:flex-nowrap lg:justify-start">
      <nav
        className="relative mx-auto w-full max-w-[85rem] rounded-[calc(var(--r)*3)] border border-[color-mix(in_srgb,var(--line)_70%,transparent)] bg-[color-mix(in_srgb,var(--surface)_78%,transparent)] px-4 py-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)] backdrop-blur-md lg:flex lg:items-center lg:justify-between lg:px-6 lg:py-0"
        aria-label="Global"
      >
        <div className="flex items-center justify-between">
          <a className={cn('flex-none rounded-(--r)', focusRing)} href="#top" aria-label={`${name}, home`}>
            <BrandMark name={name} />
          </a>
          <div className="ml-auto lg:hidden">
            <button
              type="button"
              className={cn('flex size-9 items-center justify-center rounded-full text-sm font-bold text-(--soft) transition-colors duration-300 hover:bg-(--bg-2)', focusRing)}
              aria-controls={collapseId}
              aria-expanded={open}
              aria-label="Toggle navigation"
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name={open ? 'close' : 'menu'} className="size-5 shrink-0" />
            </button>
          </div>
        </div>
        <div className="hidden grow basis-full lg:block">
          <NavLinks />
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={collapseId}
              key="collapse"
              className="overflow-hidden lg:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: [0.165, 0.84, 0.44, 1] }}
            >
              <div className="pb-2">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}

// ---------------------------------------------------------------------------
// MainSection.astro：克制的首屏，右侧配一块 SVG 图
// ---------------------------------------------------------------------------

export function Hero({ headline }: { headline: string }) {
  const reduce = useReducedMotion()
  const enter = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay, ease: [0.165, 0.84, 0.44, 1] as const } })
  return (
    <section id="top" className={cn(WRAP, 'mt-10 scroll-mt-28 py-[calc(2.5rem*var(--d))] sm:py-[calc(4rem*var(--d))] lg:py-[calc(3.5rem*var(--d))]')}>
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <motion.div {...enter(0)} className="max-w-3xl">
          <p className="mb-5 text-sm font-medium text-(--brand-ink)">Independent strategy advisers since 1998</p>
          <Heading as="h1" className="mb-4 text-4xl leading-[1.1] md:text-5xl lg:text-[3.3rem]">
            {headline}
          </Heading>
          <p className="mb-8 max-w-prose font-normal text-pretty text-(--soft) sm:text-xl">
            We work with boards and executive teams on growth, cost, transactions and organisation design. Small teams, senior people, and results measured a year after we leave.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <PrimaryCTA title="Discuss a mandate" href="#contact" />
            <SecondaryCTA title="Read our insights" href="#insights" />
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-(--line) pt-6">
            {[
              ['Consultants', '122'],
              ['Offices', '3'],
              ['Founded', '1998'],
            ].map(([term, value]) => (
              <div key={term}>
                <dt className="text-sm text-(--mut)">{term}</dt>
                <dd className="mt-1 font-(family-name:--font-head) text-2xl [font-weight:var(--head-weight)] text-(--ink)">{value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
        <motion.figure {...enter(0.08)} className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(var(--r)*1.5)] border border-(--line) shadow-sm">
            <Art kind="contour" label="Contour map of network cost by region" />
            <figcaption className="absolute top-4 left-4 rounded-(--r) bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-2.5 py-1 text-xs font-medium text-(--soft)">Fig. 1 · Network cost by region, indexed</figcaption>
            <div className="absolute right-4 bottom-4 left-4 rounded-(--r) border border-(--line) bg-(--surface) p-4 shadow-lg sm:right-auto sm:w-80">
              <p className="text-xs font-medium tracking-wide text-(--mut) uppercase">Engagement snapshot</p>
              <p className="mt-1 text-sm font-semibold text-(--ink)">Cost programme, European logistics group</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="font-(family-name:--font-head) text-3xl leading-none [font-weight:var(--head-weight)] text-(--brand-ink)">+4.1 pts</p>
                <p className="text-right text-xs text-(--soft)">EBITDA margin
                  <br />
                  month 14 of 18
                </p>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-(--bg-2)" role="progressbar" aria-valuemin={0} aria-valuemax={18} aria-valuenow={14} aria-label="Programme progress">
                <div className="h-full w-[78%] rounded-full bg-(--brand)" />
              </div>
            </div>
          </div>
        </motion.figure>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// AlternatingSections.astro：业务领域
// ---------------------------------------------------------------------------

function SectionIntro({ title, subTitle, id }: { title: string; subTitle?: string; id?: string }) {
  return (
    <div className="max-w-3xl">
      <Heading id={id} className="mb-4 text-3xl">
        {title}
      </Heading>
      {subTitle && <p className="max-w-prose font-normal text-pretty text-(--soft) sm:text-xl">{subTitle}</p>}
    </div>
  )
}

function Picture({ art, alt, className }: { art: Article['images'][number]['art']; alt: string; className?: string }) {
  return (
    <div className={cn('w-full overflow-hidden rounded-[calc(var(--r)*1.5)] border border-(--line)', className)}>
      <Art kind={art} label={alt} />
    </div>
  )
}

export function Practices() {
  return (
    <div id="practices" className="scroll-mt-28">
      <div className={cn(WRAP, 'pt-[calc(2.5rem*var(--d))] lg:pt-[calc(3.5rem*var(--d))]')}>
        <SectionIntro title="Practice areas" subTitle="Four practices, one way of working: a partner who stays on the engagement and a small team that has done the work before." />
      </div>
      {PRACTICES.map((article, index) => {
        const textFirst = index % 2 === 0
        const [first, second] = article.images
        const copy = (
          <div className={textFirst ? '' : 'mt-4 md:mt-0'}>
            <p className="mb-3 text-sm font-medium text-(--brand-ink)">{String(index + 1).padStart(2, '0')} / {String(PRACTICES.length).padStart(2, '0')}</p>
            <Heading className="mb-4 text-3xl sm:text-4xl">{article.title}</Heading>
            <p className="mb-4 max-w-prose font-normal text-pretty text-(--soft) sm:text-lg">{article.subTitle}</p>
            {article.cta ? <PrimaryCTA title={article.cta} href="#contact" /> : null}
          </div>
        )
        if (!first) return null
        return textFirst ? (
          <section key={article.title} className={cn(WRAP, PAD, 'items-center gap-16 lg:grid lg:grid-cols-2')}>
            {copy}
            {second ? (
              <div className="mt-8 grid grid-cols-2 gap-4">
                <Picture art={first.art} alt={first.alt} className="aspect-[3/4]" />
                <Picture art={second.art} alt={second.alt} className="mt-4 aspect-[3/4] lg:mt-10" />
              </div>
            ) : (
              <div className="mt-8">
                <Picture art={first.art} alt={first.alt} className="aspect-[4/3]" />
              </div>
            )}
          </section>
        ) : (
          <section key={article.title} className={cn(WRAP, PAD, 'items-center gap-8 md:grid md:grid-cols-2 xl:gap-16')}>
            <Picture art={first.art} alt={first.alt} className="aspect-[4/3]" />
            {copy}
          </section>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FeaturesGeneral.astro + IconBlock.astro：行业
// ---------------------------------------------------------------------------

function IconBlock({ heading, content, icon }: { heading: string; content: string; icon: IconName }) {
  return (
    <div className="flex gap-x-5">
      <Icon name={icon} className="mt-1 size-8 shrink-0 text-(--brand-ink)" />
      <div className="grow">
        <h3 className="text-lg font-bold text-balance text-(--ink)">{heading}</h3>
        <p className="mt-1 text-pretty text-(--body)">{content}</p>
      </div>
    </div>
  )
}

export function Industries() {
  return (
    <section id="industries" className="scroll-mt-28 border-y border-(--line) bg-(--surface)">
      <div className={cn(WRAP, PAD)}>
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-1">
            <Heading className="text-2xl md:text-3xl">Industries we know from the inside</Heading>
            <p className="mt-2 text-pretty text-(--soft) md:mt-4">Most of our partners ran a business unit or a finance function before they advised one. We stay in sectors where that experience still counts.</p>
          </div>
          <div className="lg:col-span-2">
            <div className="grid gap-8 sm:grid-cols-2 md:gap-x-12 md:gap-y-10">
              {INDUSTRIES.map((item) => (
                <IconBlock key={item.heading} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// FeaturesStats.astro + StatsBig / StatsSmall：案例结果
// ---------------------------------------------------------------------------

export function Results() {
  return (
    <section id="results" className={cn(WRAP, PAD, 'scroll-mt-28')}>
      <div className="max-w-3xl">
        <Heading className="mb-4 text-3xl">{RESULTS.title}</Heading>
        <p className="mb-[calc(4rem*var(--d))] max-w-prose font-normal text-pretty text-(--soft) sm:text-xl">{RESULTS.subTitle}</p>
      </div>
      <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:pe-6 xl:pe-12">
            <p className="font-(family-name:--font-head) text-6xl leading-none [font-weight:var(--head-weight)] text-(--brand-ink)">{RESULTS.mainStatTitle}</p>
            <p className="mt-2 text-(--soft) sm:mt-3">{RESULTS.mainStatSubTitle}</p>
          </div>
        </div>
        <div className="relative lg:col-span-8 lg:before:absolute lg:before:-start-12 lg:before:top-0 lg:before:h-full lg:before:w-px lg:before:bg-(--line)">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3">
            {RESULTS.stats.map((stat) => (
              <div key={stat.stat}>
                <p className="font-(family-name:--font-head) text-3xl whitespace-nowrap [font-weight:var(--head-weight)] text-(--brand-ink)">{stat.stat}</p>
                <p className="mt-1 text-(--soft)">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// BlogIndexView.astro 的 insights 区 + CardInsight.astro
// ---------------------------------------------------------------------------

function CardInsight({ index, onOpen }: { index: number; onOpen: (index: number, opener: HTMLElement) => void }) {
  const insight = INSIGHTS[index]!
  return (
    <a
      className={cn('group rounded-[calc(var(--r)*1.5)] transition duration-300', focusRing)}
      href={`#insight-${index + 1}`}
      aria-haspopup="dialog"
      onClick={(event) => {
        event.preventDefault()
        onOpen(index, event.currentTarget)
      }}
    >
      <div className="relative overflow-hidden rounded-[calc(var(--r)*1.5)] border border-(--line) pt-[50%] sm:pt-[70%]">
        <div className="absolute start-0 top-0 size-full transition-transform duration-500 ease-in-out group-hover:scale-105">
          <Art kind={insight.art} />
        </div>
      </div>
      <div className="mt-7">
        <p className="mb-2 text-sm text-(--mut)">
          {insight.practice} · {insight.minutes} min read
        </p>
        <h3 className="font-(family-name:--font-head) text-xl [font-weight:var(--head-weight)] text-(--ink) transition-colors duration-300 group-hover:text-(--soft)">{insight.title}</h3>
        <p className="mt-3 text-(--soft)">{insight.description}</p>
        <p className="mt-5 inline-flex items-center gap-x-1 font-medium text-(--brand-ink) decoration-2 underline-offset-4 group-hover:underline">
          Read more
          <Icon name="arrowRight" className="size-4 shrink-0" />
        </p>
      </div>
    </a>
  )
}

export function Insights({ onOpen }: { onOpen: (index: number, opener: HTMLElement) => void }) {
  return (
    <section id="insights" className={cn(WRAP, PAD, 'scroll-mt-28')}>
      <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
        <Heading className="text-2xl md:text-4xl md:leading-tight">Insights</Heading>
        <p className="mt-1 text-pretty text-(--soft)">Research and points of view from our partners, published when we have something to say. Roughly once a month.</p>
      </div>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {INSIGHTS.map((insight, index) => (
          <CardInsight key={insight.title} index={index} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// ContactSection.astro + DemoForm + 输入框 + ContactIconBlock：办公室与联系表单
// ---------------------------------------------------------------------------

const FIELD = 'block w-full rounded-(--r) border border-(--line) bg-(--field) px-4 py-3 text-sm text-(--ink) placeholder:text-(--mut) focus:border-(--line) focus:ring-3 focus:ring-[color-mix(in_srgb,var(--brand)_35%,transparent)] focus:outline-hidden'

function TextInput({ id, label, type = 'text', autoComplete }: { id: string; label: string; type?: string; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input type={type} name={id} id={id} required className={FIELD} placeholder={label} autoComplete={autoComplete} />
    </div>
  )
}

/** DemoForm.astro + demoForms.ts：拦截提交、显示成功提示、重置，不发网络请求。 */
function DemoForm({ successMessage, children, statusClass, className }: { successMessage: string; children: ReactNode; statusClass?: string; className?: string }) {
  const [status, setStatus] = useState('')
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    setStatus(successMessage)
    form.reset()
  }
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
      <p className={cn(status ? '' : 'hidden', statusClass ?? 'mt-2 text-sm text-(--soft)')} aria-live="polite">
        {status}
      </p>
    </form>
  )
}

function ContactIconBlock({ heading, content, address, link, icon }: { heading: string; content: string; address?: string; link?: string; icon: IconName }) {
  return (
    <div className="flex gap-x-7 py-6">
      <Icon name={icon} className="mt-1.5 size-6 shrink-0 text-(--soft)" />
      <div className="grow">
        <h3 className="font-bold text-(--body)">{heading}</h3>
        <p className="mt-1 text-sm text-(--soft)">{content}</p>
        {address ? <p className="mt-1 text-sm text-(--mut) italic">{address}</p> : null}
        {link ? (
          <a className={cn('group mt-2 inline-flex items-center gap-x-2 rounded-(--r) text-sm font-medium break-all text-(--soft) transition-colors duration-300 hover:text-(--ink)', focusRing)} href="#contact" onClick={stay}>
            {link}
            <Icon name="arrowRightLong" className="size-4 shrink-0 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
          </a>
        ) : null}
      </div>
    </div>
  )
}

export function Contact({ domain }: { domain: string }) {
  const id = useId()
  return (
    <section id="contact" className={cn(WRAP, PAD, 'scroll-mt-28')}>
      <div className="mx-auto max-w-2xl lg:max-w-5xl">
        <div className="text-center">
          <Heading className="text-2xl md:text-4xl md:leading-tight">Start a conversation</Heading>
          <p className="mt-1 text-pretty text-(--soft)">Tell us about the decision in front of you. A partner reads every message.</p>
        </div>
        <div className="mt-12 grid items-center gap-6 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col rounded-[calc(var(--r)*1.5)] border border-(--line) bg-(--surface) p-4 sm:p-6 lg:p-8">
            <h3 className="mb-8 text-xl font-bold text-(--body)">Brief us on a mandate</h3>
            <DemoForm successMessage="Thank you. A partner will reply within two working days." statusClass="mt-3 text-center text-sm font-medium text-(--brand-ink)">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextInput id={`${id}-first`} label="First name" autoComplete="given-name" />
                  <TextInput id={`${id}-last`} label="Last name" autoComplete="family-name" />
                </div>
                <TextInput id={`${id}-email`} label="Work email" type="email" autoComplete="email" />
                <TextInput id={`${id}-company`} label="Company and role" autoComplete="organization" />
                <div>
                  <label htmlFor={`${id}-details`} className="sr-only">
                    What would you like to discuss?
                  </label>
                  <textarea id={`${id}-details`} name="details" rows={4} required className={FIELD} placeholder="What would you like to discuss?" />
                </div>
              </div>
              <div className="mt-4 grid">
                <PrimaryCTA title="Send message" type="submit" noArrow className="w-full" />
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm text-(--soft)">We reply within two working days, and never share your details.</p>
              </div>
            </DemoForm>
          </div>
          <div id="offices" className="scroll-mt-28 divide-y divide-(--line)">
            {OFFICES.map((office) => (
              <ContactIconBlock key={office.heading} icon="mapPin" heading={office.heading} content={office.content} address={office.address} />
            ))}
            <ContactIconBlock icon="envelope" heading="Email" content="New mandates, press and alumni enquiries." link={`partners@${domain}`} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// FooterSection.astro + EmailFooterInput.astro
// ---------------------------------------------------------------------------

export function Footer({ name }: { name: string }) {
  const inputId = useId()
  return (
    <footer className="w-full bg-(--bg-2)">
      <div className="mx-auto w-full max-w-[85rem] px-4 py-10 sm:px-6 lg:px-16 lg:pt-20">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-full lg:col-span-1">
            <BrandMark name={name} />
          </div>
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="font-bold text-(--ink)">{section.title}</h3>
              <ul className="mt-3 grid space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#top" onClick={stay} className={cn('inline-flex gap-x-2 rounded-(--r) text-(--soft) transition-colors duration-300 hover:text-(--ink)', focusRing)}>
                      {link}
                    </a>
                    {link === 'Careers' ? <span className="ms-1 inline rounded-(--r) bg-(--brand) px-2 py-1 text-xs font-bold text-(--on-brand)">Hiring</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2">
            <h3 className="font-bold text-(--ink)">Stay up to date</h3>
            <DemoForm successMessage="Subscribed. The next briefing arrives on the first Monday of the month.">
              <div className="mt-4 flex flex-col items-center gap-2 rounded-(--r) bg-(--bg) p-2 sm:flex-row sm:gap-3">
                <div className="w-full">
                  <label htmlFor={inputId} className="sr-only">
                    Email address
                  </label>
                  <input type="email" id={inputId} name="email" required autoComplete="email" className={cn(FIELD, 'border-transparent bg-(--surface)')} placeholder="Enter your email" />
                </div>
                <PrimaryCTA title="Subscribe" type="submit" noArrow className="w-full p-3 whitespace-nowrap sm:w-auto" />
              </div>
              <p className="mt-3 text-sm text-(--soft)">One briefing a month from our partners. No marketing, unsubscribe in one click.</p>
            </DemoForm>
          </div>
        </div>
        <div className="mt-9 grid gap-y-2 sm:mt-12 sm:flex sm:items-center sm:justify-between sm:gap-y-0">
          <p className="text-sm text-(--soft)">
            © {new Date().getFullYear()} {name} LLP. Registered in England and Wales.
          </p>
          <div className="flex gap-x-5 text-sm">
            {['Privacy', 'Terms', 'Cookies'].map((label) => (
              <a key={label} href="#top" onClick={stay} className={cn('rounded-(--r) text-(--soft) underline-offset-2 transition-colors duration-300 hover:text-(--ink) hover:underline', focusRing)}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
