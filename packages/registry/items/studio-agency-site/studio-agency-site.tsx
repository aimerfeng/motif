// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2026 Mateusz Wyrębek
// Source: https://github.com/matt765/Tailcast/blob/85843e5/src/pages/index.astro
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@motif/runtime'

/* @motif:defaults */
export const defaults = {
  name: 'Halftone',
  headline: 'A small studio for products that need to feel finished.',
  accent: '#6d5efc',
  fontPair: 'bricolage',
  radius: 20,
  dark: true,
  animate: true,
}
/* @motif:end */

export type StudioAgencySiteProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

// ---------------------------------------------------------------------------
// 主题
// ---------------------------------------------------------------------------

const SANS = ', ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
const MONO = ', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

const FONT_PAIRS: Record<string, { head: string; body: string }> = {
  bricolage: { head: `'Bricolage Grotesque Variable'${SANS}`, body: `'Inter Tight Variable'${SANS}` },
  grotesk: { head: `'Space Grotesk Variable'${SANS}`, body: `'Geist Variable'${SANS}` },
  outfit: { head: `'Outfit Variable'${SANS}`, body: `'Manrope Variable'${SANS}` },
  syne: { head: `'Syne Variable'${SANS}`, body: `'Plus Jakarta Sans Variable'${SANS}` },
}

function readableOn(hex: string): string {
  const value = hex.replace('#', '').slice(0, 6)
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.42 ? '#0b0d10' : '#ffffff'
}

function themeVars(dark: boolean, accent: string, radius: number, fontPair: string): CSSProperties {
  const fonts = FONT_PAIRS[fontPair] ?? FONT_PAIRS.bricolage!
  const vars: Record<string, string> = dark
    ? {
        '--bg': `color-mix(in oklab, ${accent} 5%, #07080b)`,
        '--bg-2': `color-mix(in oklab, ${accent} 7%, #0d0f14)`,
        '--card': `color-mix(in oklab, ${accent} 6%, #11131a)`,
        '--card-2': `color-mix(in oklab, ${accent} 9%, #171a23)`,
        '--fg': '#f3f4f8',
        '--soft': '#c5c8d3',
        '--mut': '#8a8fa0',
        '--line': 'rgb(255 255 255 / 0.08)',
        '--line-2': 'rgb(255 255 255 / 0.14)',
        '--accent-text': `color-mix(in oklab, ${accent} 70%, white)`,
      }
    : {
        '--bg': `color-mix(in oklab, ${accent} 2%, #fcfcfd)`,
        '--bg-2': `color-mix(in oklab, ${accent} 5%, #f3f3f7)`,
        '--card': '#ffffff',
        '--card-2': `color-mix(in oklab, ${accent} 5%, #f6f6fa)`,
        '--fg': '#12131a',
        '--soft': '#3b3e4b',
        '--mut': '#6b6f80',
        '--line': 'rgb(18 19 26 / 0.09)',
        '--line-2': 'rgb(18 19 26 / 0.16)',
        '--accent-text': `color-mix(in oklab, ${accent} 85%, black)`,
      }
  return {
    ...vars,
    '--accent': accent,
    '--on-accent': readableOn(accent),
    '--r': `${radius}px`,
    '--font-head': fonts.head,
    '--font-body': fonts.body,
    '--font-mono': `'Geist Mono Variable'${MONO}`,
    fontFamily: 'var(--font-body)',
    backgroundColor: 'var(--bg)',
    color: 'var(--fg)',
  } as CSSProperties
}

// ---------------------------------------------------------------------------
// 小部件
// ---------------------------------------------------------------------------

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={cn('size-5', className)} aria-hidden>
      {children}
    </svg>
  )
}

const G = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  arrowUR: <path d="M7 17 17 7M8 7h9v9" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  compass: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  layers: <><path d="m12 4 8.5 4.5L12 13 3.5 8.5z" /><path d="m3.5 12.5 8.5 4.500 8.500-4.500M3.500 16.500l8.500 4.500 8.500-4.500" /></>,
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5 10.5 19" />,
  wave: <path d="M3 12c2.500-6 4.500-6 7 0s4.500 6 7 0c1-2.300 2-3.500 4-4" />,
  spark: <path d="M12 3.500 13.800 10 20.500 12 13.800 14 12 20.500 10.200 14 3.500 12 10.200 10z" />,
}

function Reveal({ children, delay = 0, on, className }: { children: ReactNode; delay?: number; on: boolean; className?: string }) {
  if (!on) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-4 font-(family-name:--font-mono) text-[11px] tracking-[0.22em] text-(--accent-text) uppercase">{children}</p>
}

function SectionHead({ eyebrow, title, sub, center = true }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={cn('mb-14 max-w-2xl', center && 'mx-auto text-center')}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-(family-name:--font-head) text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">{title}</h2>
      {sub && <p className="mt-5 text-lg leading-relaxed text-pretty text-(--mut)">{sub}</p>}
    </div>
  )
}

const Container = ({ children, className, id }: { children: ReactNode; className?: string; id?: string }) => (
  <div id={id} className={cn('mx-auto w-full max-w-[1200px] px-5 sm:px-8', className)}>
    {children}
  </div>
)

/** 品牌的字标：一个小图形 + 文字，虚构。 */
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="sa-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="color-mix(in oklab, var(--accent) 50%, #ff7ad9)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#sa-mark)" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={9 + c * 7} cy={9 + r * 7} r={1 + ((r + c) % 3) * 0.9} fill="var(--on-accent)" />))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// 内容
// ---------------------------------------------------------------------------

const NAV = [
  { href: '#work', label: 'Work' },
  { href: '#services', label: 'Services' },
  { href: '#process', label: 'Process' },
  { href: '#pricing', label: 'Engagements' },
  { href: '#journal', label: 'Journal' },
]

const BRANDS: { name: string; style: string; glyph: ReactNode }[] = [
  { name: 'Quillon', style: 'font-(family-name:--font-head) text-xl font-semibold tracking-tight', glyph: <path d="M4 20 20 4M9 20l11-11M4 15 15 4" /> },
  { name: 'FERNWOOD', style: 'font-(family-name:--font-mono) text-sm font-semibold tracking-[0.28em]', glyph: <><circle cx="12" cy="12" r="8" /><path d="M12 4v16M4 12h16" /></> },
  { name: 'tallow', style: 'font-(family-name:--font-head) text-2xl font-bold lowercase tracking-[-0.06em]', glyph: <path d="M5 19V9l7-5 7 5v10z" /> },
  { name: 'Brightwell', style: 'font-(family-name:--font-body) text-xl font-medium italic', glyph: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="2.500" /></> },
  { name: 'Orbitary', style: 'font-(family-name:--font-head) text-xl font-medium tracking-wide', glyph: <><ellipse cx="12" cy="12" rx="9" ry="4" /><circle cx="12" cy="12" r="2" /></> },
  { name: 'LUMENARY', style: 'font-(family-name:--font-head) text-lg font-bold tracking-[0.12em]', glyph: <path d="M12 3 21 20H3z" /> },
]

const WORK = [
  { name: 'Ledgerline', kind: 'Fintech · Web app', result: '+38% activation in the first 60 days', hue: 0, art: 'chart' },
  { name: 'Marrow', kind: 'Health · iOS and web', result: '4.8 App Store rating, up from 3.9', hue: 35, art: 'rings' },
  { name: 'Parcelworks', kind: 'Logistics · Design system', result: '212 components, adopted by 9 teams', hue: -35, art: 'blocks' },
  { name: 'Fieldday', kind: 'Events · Marketing site', result: 'Lighthouse 100, launch-day sell-out', hue: 70, art: 'bars' },
] as const

const SERVICES = [
  { title: 'Product strategy', body: 'Two weeks of interviews, teardown and a written point of view. You leave with a roadmap the whole team can argue with.', icon: G.compass },
  { title: 'Interface design', body: 'Flows, systems and the last-mile details. Every screen is designed in the browser with real data.', icon: G.layers },
  { title: 'Front-end engineering', body: 'React, TypeScript and accessible markup, reviewed like production code from day one.', icon: G.code },
  { title: 'Design systems', body: 'Tokens, components and documentation that survive a re-org.', icon: G.spark },
  { title: 'Motion & prototyping', body: 'Interactions specified as running code, not as a video nobody can inspect.', icon: G.wave },
]

const STEPS = [
  { n: '01', title: 'Listen', body: 'A paid discovery week: stakeholder calls, analytics review and five customer conversations.' },
  { n: '02', title: 'Sketch', body: 'Rough options in days. We argue about direction while it is still cheap to change.' },
  { n: '03', title: 'Build', body: 'Design and engineering in one squad, shipping every Friday to a staging link you can click.' },
  { n: '04', title: 'Hand over', body: 'Documentation, a recorded walkthrough and thirty days of support after launch.' },
]

const STATS = [
  { value: '86', label: 'products shipped since 2019' },
  { value: '9 wk', label: 'median engagement length' },
  { value: '94%', label: 'clients who book us again' },
  { value: '11', label: 'people, all senior' },
]

const QUOTES = [
  { quote: 'They rebuilt our onboarding in six weeks and told us which half of our roadmap to delete. Activation is up by a third and support tickets fell.', name: 'Marta Sørensen', role: 'Head of Product, Ledgerline', hue: 262 },
  { quote: 'The design system they left behind is the first one at our company that engineers actually enjoy using. It was in the docs on day one.', name: 'Idris Vale', role: 'Engineering Director, Parcelworks', hue: 190 },
  { quote: 'Calm, precise and quick to say no. We hired Halftone for a launch page and kept them for the product.', name: 'Yuki Aldana', role: 'Founder, Fieldday', hue: 20 },
]

const PLANS = [
  { name: 'Sprint', price: '$18k', unit: 'fixed, 2 weeks', blurb: 'A focused answer to one hard question.', features: ['Design review or prototype', 'Written recommendation', 'One live working session', 'Source files and notes'], featured: false },
  { name: 'Build', price: '$64k', unit: 'fixed, 8–10 weeks', blurb: 'From first sketch to a shipped release.', features: ['Design and engineering squad', 'Weekly staging releases', 'Component library and docs', '30 days of launch support', 'Accessibility audit'], featured: true },
  { name: 'Retainer', price: '$9k', unit: 'per month', blurb: 'A senior team on call, month to month.', features: ['Up to 60 hours of work', 'Priority scheduling', 'Monthly roadmap review', 'Pause or stop any month'], featured: false },
]

const POSTS = [
  { tag: 'Design systems', title: 'Nine components you can delete from your library', date: 'Sep 12, 2026', read: '7 min', hue: 0 },
  { tag: 'Engineering', title: 'How we review design work in a pull request', date: 'Aug 21, 2026', read: '5 min', hue: 40 },
  { tag: 'Studio', title: 'Why we cap every project at eleven weeks', date: 'Jul 30, 2026', read: '6 min', hue: -40 },
]

const FAQS = [
  { q: 'How do you price projects?', a: 'Fixed scope and fixed fee for sprints and builds. If we underestimate, that is our problem, not yours. Retainers are billed monthly and can be paused.' },
  { q: 'Do you work with early-stage teams?', a: 'Yes, when there is a real product and a decision maker on the call. We say so upfront if a smaller scope will serve you better.' },
  { q: 'Who will I actually work with?', a: 'The people on the proposal. We do not staff juniors behind a senior name; the squad is two to four people from start to finish.' },
  { q: 'Can you work with our engineers?', a: 'That is most of our work. We ship pull requests into your repository, follow your conventions and pair with your team.' },
  { q: 'What does the first call cover?', a: 'Thirty minutes: your goal, your deadline and what has been tried. We reply within two working days with a yes, a no or a suggestion.' },
]

const FOOTER_LINKS = [
  { title: 'Studio', links: ['Work', 'Services', 'Process', 'Journal'] },
  { title: 'Engage', links: ['Sprint', 'Build', 'Retainer', 'Book a call'] },
  { title: 'Elsewhere', links: ['Newsletter', 'Source', 'Fediverse', 'Colophon'] },
]

// ---------------------------------------------------------------------------
// 区块
// ---------------------------------------------------------------------------

function Navbar({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="mx-auto max-w-[1200px] rounded-full border border-(--line) bg-[color-mix(in_oklab,var(--bg)_72%,transparent)] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between pr-2 pl-4 sm:pl-5">
          <a href="#top" className="flex items-center gap-2.5 font-(family-name:--font-head) text-lg font-semibold tracking-tight">
            <LogoMark />
            {name}
          </a>
          <nav className="hidden items-center md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm text-(--mut) transition-colors hover:text-(--fg)">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#contact" className="hidden h-10 items-center gap-2 rounded-full bg-(--fg) px-5 text-sm font-medium text-(--bg) transition-opacity hover:opacity-85 sm:inline-flex">
              Book a call
            </a>
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle menu" className="grid size-10 place-items-center rounded-full border border-(--line) md:hidden">
              <Icon>{open ? G.close : G.menu}</Icon>
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-(--line) p-3 md:hidden" aria-label="Mobile">
            {[...NAV, { href: '#contact', label: 'Book a call' }].map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-(--soft) hover:bg-(--card)">
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}

/** 首屏下方的“产品截图”：完全用 div 和 SVG 画出来，替代上游的仪表盘图片。 */
function MockApp() {
  const bars = [38, 52, 44, 66, 58, 74, 62, 88, 70, 96, 84, 108]
  return (
    <div className="overflow-hidden rounded-[calc(var(--r)*0.9)] border border-(--line-2) bg-(--card) text-left shadow-[0_50px_120px_-30px_color-mix(in_oklab,var(--accent)_45%,transparent)]">
      <div className="flex items-center gap-2 border-b border-(--line) bg-(--card-2) px-4 py-3">
        <span className="size-2.5 rounded-full bg-(--line-2)" />
        <span className="size-2.5 rounded-full bg-(--line-2)" />
        <span className="size-2.5 rounded-full bg-(--line-2)" />
        <span className="mx-auto rounded-md bg-(--bg) px-16 py-1 font-(family-name:--font-mono) text-[10px] text-(--mut) max-sm:px-6">ledgerline / overview</span>
      </div>
      <div className="flex">
        <aside className="hidden w-48 shrink-0 border-r border-(--line) p-4 md:block">
          <div className="mb-5 flex items-center gap-2">
            <span className="size-6 rounded-lg bg-(--accent)" />
            <span className="h-2.5 w-16 rounded-full bg-(--fg)/70" />
          </div>
          {['Overview', 'Payments', 'Customers', 'Reports', 'Settings'].map((item, i) => (
            <div key={item} className={cn('mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs', i === 0 ? 'bg-(--accent)/15 text-(--accent-text)' : 'text-(--mut)')}>
              <span className="size-3.5 rounded bg-current opacity-50" />
              {item}
            </div>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-(--mut)">Net revenue · last 12 weeks</p>
              <p className="mt-1 font-(family-name:--font-head) text-3xl font-semibold tracking-tight sm:text-4xl">$1,284,600</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">+12.4% vs previous</span>
          </div>
          <div className="mt-6 flex h-32 items-end gap-2 sm:h-40 sm:gap-3">
            {bars.map((height, index) => (
              <div key={index} className="flex-1 rounded-t-md" style={{ height: `${(height / 108) * 100}%`, background: index === bars.length - 1 ? 'var(--accent)' : 'color-mix(in oklab, var(--accent) 28%, transparent)' }} />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[['Active accounts', '18,240'], ['Churn', '1.8%'], ['Avg. invoice', '$412']].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-(--line) bg-(--bg-2) p-3 sm:p-4">
                <p className="text-[10px] text-(--mut) sm:text-xs">{label}</p>
                <p className="mt-1 font-(family-name:--font-head) text-base font-semibold sm:text-xl">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero({ name, headline, animate }: { name: string; headline: string; animate: boolean }) {
  const enter = (delay: number) => (animate ? { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const } } : {})
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 900px 520px at 50% -5%, color-mix(in oklab, var(--accent) 34%, transparent), transparent 70%), radial-gradient(ellipse 500px 300px at 90% 30%, color-mix(in oklab, #ff5fc4 10%, transparent), transparent 70%)' }} />
      <svg aria-hidden className="absolute inset-0 -z-10 size-full [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]">
        <defs>
          <pattern id="sa-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M64 0H0V64" fill="none" stroke="var(--line)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sa-grid)" />
      </svg>
      <Container className="pt-32 pb-6 text-center sm:pt-28">
        <motion.a {...enter(0)} href="#work" className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-(--line-2) bg-(--card)/70 py-1.5 pr-4 pl-1.5 text-sm text-(--soft) backdrop-blur transition-colors hover:border-(--accent)">
          <span className="rounded-full bg-(--accent) px-2.5 py-0.5 text-[11px] font-semibold text-(--on-accent)">New</span>
          {name} × Ledgerline case study
          <Icon className="size-3.5">{G.arrow}</Icon>
        </motion.a>
        <motion.h1 {...enter(0.04)} className="mx-auto max-w-4xl font-(family-name:--font-head) text-[clamp(2.6rem,6.6vw,5rem)] leading-[0.98] font-semibold tracking-[-0.04em] text-balance">
          {headline}
        </motion.h1>
        <motion.p {...enter(0.08)} className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-(--mut) sm:text-xl">
          {name} is eleven designers and engineers in Lisbon and Rotterdam. We take a product from first sketch to shipped release, together, in weeks not quarters.
        </motion.p>
        <motion.div {...enter(0.12)} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#contact" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-(--accent) px-7 text-sm font-semibold text-(--on-accent) shadow-[0_10px_40px_-8px_var(--accent)] transition-transform hover:-translate-y-0.5 sm:w-auto">
            Book a call
            <Icon className="size-4">{G.arrow}</Icon>
          </a>
          <a href="#work" className="inline-flex h-12 w-full items-center justify-center rounded-full border border-(--line-2) bg-(--card) px-7 text-sm font-medium transition-colors hover:bg-(--card-2) sm:w-auto">
            See selected work
          </a>
        </motion.div>
      </Container>
      <Container className="mt-14 pb-20 sm:mt-12">
        <motion.div {...enter(0.16)} className="relative mx-auto max-w-[1040px] [perspective:1800px]">
          <div className="relative rounded-[calc(var(--r)*1.05)] p-px lg:[transform:rotateX(6deg)]">
            <motion.div aria-hidden className="absolute inset-0 overflow-hidden rounded-[inherit]">
              <motion.div
                className="absolute top-1/2 left-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2"
                style={{ background: 'conic-gradient(from 0deg, transparent 0 55%, var(--accent) 75%, #ff7ad9 88%, transparent 100%)' }}
                animate={animate ? { rotate: 360 } : undefined}
                transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
            <div className="relative rounded-[inherit] bg-(--bg)">
              <MockApp />
            </div>
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-(--bg) to-transparent" />
        </motion.div>
      </Container>
    </section>
  )
}

function Brands({ animate }: { animate: boolean }) {
  return (
    <section aria-label="Clients" className="border-y border-(--line) bg-(--bg-2)">
      <Container className="py-12">
        <Reveal on={animate}>
          <p className="mb-8 text-center font-(family-name:--font-mono) text-[11px] tracking-[0.22em] text-(--mut) uppercase">Product teams we have shipped with</p>
          <ul className="grid grid-cols-2 items-center gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {BRANDS.map((brand) => (
              <li key={brand.name} className="flex items-center justify-center gap-2.5 text-(--mut) transition-colors hover:text-(--fg)">
                <Icon className="size-6">{brand.glyph}</Icon>
                <span className={brand.style}>{brand.name}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  )
}

function BentoArt({ index }: { index: number }) {
  if (index === 0)
    return (
      <div className="relative flex h-full items-center justify-center">
        {['Discovery', 'Bets', 'Roadmap'].map((label, i) => (
          <span key={label} className="absolute rounded-full border border-(--line-2) bg-(--card-2) px-4 py-2 text-xs text-(--soft) shadow-lg" style={{ transform: `translate(${(i - 1) * 74}px, ${(i % 2 ? 1 : -1) * 22}px) rotate(${(i - 1) * 4}deg)` }}>
            {label}
          </span>
        ))}
      </div>
    )
  if (index === 1)
    return (
      <div className="grid h-full grid-cols-3 gap-2 p-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={cn('rounded-lg border border-(--line)', i === 1 || i === 4 ? 'bg-(--accent)/25' : 'bg-(--card-2)', i === 0 && 'col-span-2')} />
        ))}
      </div>
    )
  if (index === 2)
    return (
      <pre className="overflow-hidden rounded-xl border border-(--line) bg-(--bg) p-4 font-(family-name:--font-mono) text-[11px] leading-[1.8] text-(--mut)">
        <span className="text-(--accent-text)">export function</span> Button({'{'} tone {'}'}) {'{'}
        {'\n  '}
        <span className="text-(--accent-text)">return</span> &lt;button data-tone={'{'}tone{'}'} /&gt;
        {'\n}'}
      </pre>
    )
  if (index === 3)
    return (
      <div className="flex h-full items-center justify-center gap-2">
        {[0.25, 0.4, 0.55, 0.7, 0.85, 1].map((o, i) => (
          <span key={i} className="size-9 rounded-xl border border-(--line)" style={{ background: `color-mix(in oklab, var(--accent) ${o * 100}%, transparent)` }} />
        ))}
      </div>
    )
  return (
    <svg viewBox="0 0 240 90" className="h-full w-full" aria-hidden>
      <path d="M8 78 C 60 78, 70 14, 120 14 S 180 78, 232 12" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 78 C 60 78, 70 14, 120 14 S 180 78, 232 12" fill="none" stroke="var(--line-2)" strokeWidth="1" strokeDasharray="3 5" transform="translate(0 8)" />
      <circle cx="120" cy="14" r="5" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2" />
    </svg>
  )
}

function Services({ animate }: { animate: boolean }) {
  const spans = ['lg:col-span-2', 'lg:col-span-4', 'lg:col-span-3', 'lg:col-span-3', 'lg:col-span-6']
  return (
    <section id="services" className="scroll-mt-24 py-24 sm:py-32">
      <Container>
        <SectionHead eyebrow="Services" title="Everything a product needs, from a single team" sub="No hand-offs between agencies. The people who design it also build it, so nothing gets lost in translation." />
        <div className="grid gap-4 lg:grid-cols-6">
          {SERVICES.map((service, index) => (
            <Reveal key={service.title} on={animate} delay={(index % 3) * 0.05} className={cn(spans[index], index === 4 && 'lg:col-span-6')}>
              <article className={cn('group flex h-full flex-col overflow-hidden rounded-(--r) border border-(--line) bg-(--card) transition-colors duration-300 hover:border-(--line-2)', index === 4 && 'lg:flex-row')}>
                <div className={cn('relative min-h-44 flex-1 border-b border-(--line) bg-[radial-gradient(60%_80%_at_50%_0%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent)] p-6', index === 4 && 'lg:min-h-0 lg:border-r lg:border-b-0')}>
                  <BentoArt index={index} />
                </div>
                <div className={cn('p-7', index === 4 && 'lg:flex lg:w-[46%] lg:flex-col lg:justify-center')}>
                  <span className="mb-4 grid size-10 place-items-center rounded-xl bg-(--accent)/15 text-(--accent-text)">
                    <Icon>{service.icon}</Icon>
                  </span>
                  <h3 className="font-(family-name:--font-head) text-xl font-semibold tracking-tight">{service.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-(--mut)">{service.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function WorkArt({ art, hue }: { art: (typeof WORK)[number]['art']; hue: number }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden" style={{ background: `linear-gradient(${135 + hue}deg, color-mix(in oklab, var(--accent) 90%, black), color-mix(in oklab, var(--accent) 45%, oklch(0.7 0.18 ${(hue + 330 + 360) % 360})))` }}>
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <radialGradient id={`wg-${art}`} cx="20%" cy="0%" r="80%">
            <stop offset="0" stopColor="#fff" stopOpacity=".35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="250" fill={`url(#wg-${art})`} />
        {art === 'chart' && (
          <>
            <rect x="60" y="50" width="280" height="170" rx="14" fill="#0b0c12" fillOpacity=".55" stroke="#fff" strokeOpacity=".25" />
            <path d="M80 190 L130 150 L170 168 L220 110 L270 128 L320 76" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M80 190 L130 150 L170 168 L220 110 L270 128 L320 76 V205 H80Z" fill="#fff" fillOpacity=".12" />
          </>
        )}
        {art === 'rings' && [30, 58, 88, 120].map((r, i) => <circle key={r} cx="200" cy="125" r={r} fill="none" stroke="#fff" strokeOpacity={0.85 - i * 0.18} strokeWidth={i === 0 ? 10 : 2} />)}
        {art === 'blocks' && (
          <>
            {[[70, 60, 110, 70], [194, 60, 136, 34], [194, 106, 60, 24], [268, 106, 62, 24], [70, 144, 82, 50], [166, 144, 164, 50]].map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} rx="10" fill="#fff" fillOpacity={i % 3 === 0 ? 0.92 : 0.35} />
            ))}
          </>
        )}
        {art === 'bars' && Array.from({ length: 18 }, (_, i) => <rect key={i} x={36 + i * 19} y={200 - (30 + ((i * 53) % 110))} width="11" height={30 + ((i * 53) % 110)} rx="5.5" fill="#fff" fillOpacity={0.3 + (i % 5) * 0.15} />)}
      </svg>
    </div>
  )
}

function Work({ animate }: { animate: boolean }) {
  return (
    <section id="work" className="scroll-mt-24 border-t border-(--line) bg-(--bg-2) py-24 sm:py-32">
      <Container>
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <Eyebrow>Selected work</Eyebrow>
            <h2 className="font-(family-name:--font-head) text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">Four launches we are still proud of</h2>
          </div>
          <a href="#contact" className="inline-flex items-center gap-2 text-sm font-medium text-(--accent-text) hover:underline">
            View all 86 projects
            <Icon className="size-4">{G.arrow}</Icon>
          </a>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {WORK.map((project, index) => (
            <Reveal key={project.name} on={animate} delay={(index % 2) * 0.07}>
              <a href="#work" className="group block overflow-hidden rounded-(--r) border border-(--line) bg-(--card) transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-(--line-2)">
                <WorkArt art={project.art} hue={project.hue} />
                <div className="flex items-start justify-between gap-4 p-6">
                  <div>
                    <p className="font-(family-name:--font-mono) text-[11px] tracking-[0.14em] text-(--mut) uppercase">{project.kind}</p>
                    <h3 className="mt-2 font-(family-name:--font-head) text-2xl font-semibold tracking-tight">{project.name}</h3>
                    <p className="mt-2 text-[15px] text-(--mut)">{project.result}</p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-(--line-2) transition-colors group-hover:bg-(--accent) group-hover:text-(--on-accent)">
                    <Icon className="size-4.5">{G.arrowUR}</Icon>
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Process({ animate }: { animate: boolean }) {
  return (
    <section id="process" className="relative isolate scroll-mt-24 py-24 sm:py-36">
      <div aria-hidden className="absolute inset-x-0 top-0 bottom-0 -z-10 bg-(--card)" style={{ clipPath: 'polygon(0 clamp(24px,5vw,72px), 100% 0, 100% calc(100% - clamp(24px,5vw,72px)), 0 100%)', backgroundImage: 'radial-gradient(60% 50% at 80% 20%, color-mix(in oklab, var(--accent) 14%, transparent), transparent)' }} />
      <Container>
        <SectionHead eyebrow="Process" title="Four steps, no surprises" sub="The same rhythm on every project, so you always know what happens next and who is doing it." />
        <ol className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <span aria-hidden className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-(--line-2) to-transparent lg:block" />
          {STEPS.map((step, index) => (
            <li key={step.n}>
              <Reveal on={animate} delay={index * 0.07} className="h-full">
                <div className="relative h-full rounded-(--r) border border-(--line) bg-(--bg) p-7">
                  <span className="mb-6 grid size-14 place-items-center rounded-full border border-(--line-2) bg-(--card-2) font-(family-name:--font-mono) text-sm text-(--accent-text)">{step.n}</span>
                  <h3 className="font-(family-name:--font-head) text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-(--mut)">{step.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
        <dl className="mt-20 grid grid-cols-2 gap-y-10 border-t border-(--line) pt-12 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col px-2 text-center">
              <dt className="order-2 mt-2 text-sm text-(--mut)">{stat.label}</dt>
              <dd className="font-(family-name:--font-head) text-5xl font-semibold tracking-tight sm:text-6xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}

function Testimonials({ animate }: { animate: boolean }) {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHead eyebrow="Kind words" title="What clients say once the launch is behind them" />
        <div className="grid gap-5 lg:grid-cols-3">
          {QUOTES.map((item, index) => (
            <Reveal key={item.name} on={animate} delay={index * 0.07} className="h-full">
              <figure className="flex h-full flex-col justify-between rounded-(--r) border border-(--line) bg-(--card) p-7">
                <blockquote className="text-[17px] leading-relaxed text-pretty text-(--soft)">&ldquo;{item.quote}&rdquo;</blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: `linear-gradient(140deg, oklch(0.7 0.15 ${item.hue}), oklch(0.46 0.16 ${item.hue + 30}))` }}>
                    {item.name.split(' ').map((w) => w[0]).join('')}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{item.name}</span>
                    <span className="block text-sm text-(--mut)">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Pricing({ animate }: { animate: boolean }) {
  return (
    <section id="pricing" className="scroll-mt-24 border-t border-(--line) bg-(--bg-2) py-24 sm:py-32">
      <Container>
        <SectionHead eyebrow="Engagements" title="Three ways to work together" sub="Fixed prices, written scope. Rates are in US dollars and exclude tax." />
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.name} on={animate} delay={index * 0.07} className="h-full">
              <article className={cn('relative flex h-full flex-col rounded-(--r) border p-8', plan.featured ? 'border-(--accent) bg-(--card) shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--accent)_55%,transparent)]' : 'border-(--line) bg-(--card)')}>
                {plan.featured && <span className="absolute -top-3 left-8 rounded-full bg-(--accent) px-3 py-1 text-[11px] font-semibold tracking-wide text-(--on-accent) uppercase">Most booked</span>}
                <h3 className="font-(family-name:--font-head) text-xl font-semibold">{plan.name}</h3>
                <p className="mt-2 text-sm text-(--mut)">{plan.blurb}</p>
                <p className="mt-7 flex items-baseline gap-2">
                  <span className="font-(family-name:--font-head) text-5xl font-semibold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-(--mut)">{plan.unit}</span>
                </p>
                <ul className="mt-8 flex-1 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-[15px] text-(--soft)">
                      <Icon className="mt-0.5 size-4.5 shrink-0 text-(--accent-text)">{G.check}</Icon>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className={cn('mt-9 inline-flex h-12 items-center justify-center rounded-full text-sm font-semibold transition-transform hover:-translate-y-0.5', plan.featured ? 'bg-(--accent) text-(--on-accent)' : 'border border-(--line-2) hover:bg-(--card-2)')}>
                  Start with {plan.name.toLowerCase()}
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Journal({ animate }: { animate: boolean }) {
  return (
    <section id="journal" className="scroll-mt-24 py-24 sm:py-32">
      <Container>
        <SectionHead eyebrow="Journal" title="Notes from the studio" />
        <div className="grid gap-5 md:grid-cols-3">
          {POSTS.map((post, index) => (
            <Reveal key={post.title} on={animate} delay={index * 0.06} className="h-full">
              <a href="#journal" className="group flex h-full flex-col overflow-hidden rounded-(--r) border border-(--line) bg-(--card) transition-colors hover:border-(--line-2)">
                <div aria-hidden className="relative h-40 overflow-hidden" style={{ background: `linear-gradient(${120 + post.hue * 2}deg, color-mix(in oklab, var(--accent) 80%, black), color-mix(in oklab, var(--accent) 35%, oklch(0.75 0.14 ${(post.hue + 300 + 360) % 360})))` }}>
                  <svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
                    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M-10 ${30 + i * 14} C 80 ${i * 10}, 160 ${90 + i * 8}, 320 ${20 + i * 14}`} fill="none" stroke="#fff" strokeOpacity={0.1 + (i % 3) * 0.08} />)}
                  </svg>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="font-(family-name:--font-mono) text-[11px] tracking-[0.14em] text-(--accent-text) uppercase">{post.tag}</p>
                  <h3 className="mt-3 font-(family-name:--font-head) text-xl leading-snug font-semibold tracking-tight text-balance">{post.title}</h3>
                  <p className="mt-auto pt-6 text-sm text-(--mut)">{post.date} · {post.read}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Faq({ animate }: { animate: boolean }) {
  const [open, setOpen] = useState<number | null>(0)
  const reduce = useReducedMotion()
  return (
    <section className="border-t border-(--line) bg-(--bg-2) py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="font-(family-name:--font-head) text-[clamp(2rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">Questions we hear on the first call</h2>
          <p className="mt-5 text-(--mut)">Something missing? Write to <a className="text-(--fg) underline decoration-(--accent) underline-offset-4" href="mailto:hello@example.com">hello@example.com</a>.</p>
        </div>
        <Reveal on={animate}>
          <div className="divide-y divide-(--line) rounded-(--r) border border-(--line) bg-(--card)">
            {FAQS.map((item, index) => {
              const isOpen = open === index
              return (
                <div key={item.q}>
                  <button type="button" onClick={() => setOpen(isOpen ? null : index)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left">
                    <span className="font-(family-name:--font-head) text-lg font-medium tracking-tight">{item.q}</span>
                    <Icon className={cn('size-5 shrink-0 text-(--mut) transition-transform duration-300', isOpen && 'rotate-45 text-(--accent-text)')}>{G.plus}</Icon>
                  </button>
                  <motion.div initial={false} animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }} transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <p className="px-6 pb-6 leading-relaxed text-(--mut)">{item.a}</p>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

function Cta({ name, animate }: { name: string; animate: boolean }) {
  return (
    <section id="contact" className="scroll-mt-24 px-3 py-16 sm:px-5 sm:py-24">
      <Reveal on={animate}>
        <div className="relative isolate mx-auto max-w-[1200px] overflow-hidden rounded-[calc(var(--r)*1.4)] border border-(--line-2) bg-(--card) px-6 py-20 text-center sm:py-28">
          <div aria-hidden className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 600px 320px at 50% 110%, color-mix(in oklab, var(--accent) 45%, transparent), transparent 70%), radial-gradient(ellipse 400px 240px at 10% 0%, color-mix(in oklab, #ff5fc4 12%, transparent), transparent 70%)' }} />
          <Eyebrow>Now booking for January</Eyebrow>
          <h2 className="mx-auto max-w-3xl font-(family-name:--font-head) text-[clamp(2.2rem,5.4vw,4.2rem)] leading-[1.03] font-semibold tracking-[-0.035em] text-balance">Have something that needs to ship? Let&rsquo;s talk.</h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-(--mut)">Tell us the goal and the deadline. {name} replies within two working days.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="mailto:hello@example.com" className="inline-flex h-13 items-center gap-2 rounded-full bg-(--fg) px-8 text-sm font-semibold text-(--bg) transition-transform hover:-translate-y-0.5">
              hello@example.com
              <Icon className="size-4">{G.arrowUR}</Icon>
            </a>
            <a href="#pricing" className="inline-flex h-13 items-center rounded-full border border-(--line-2) px-8 text-sm font-medium hover:bg-(--card-2)">
              See engagements
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-(--line)">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <a href="#top" className="flex items-center gap-2.5 font-(family-name:--font-head) text-xl font-semibold tracking-tight">
            <LogoMark size={32} />
            {name}
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-(--mut)">Independent design and engineering studio. Lisbon, Rotterdam and everywhere in between.</p>
        </div>
        {FOOTER_LINKS.map((column) => (
          <div key={column.title}>
            <h3 className="font-(family-name:--font-mono) text-[11px] tracking-[0.2em] text-(--mut) uppercase">{column.title}</h3>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#top" className="text-sm text-(--soft) transition-colors hover:text-(--fg)">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="flex flex-col justify-between gap-2 border-t border-(--line) py-6 text-xs text-(--mut) sm:flex-row">
        <p>&copy; 2026 {name} Studio. All rights reserved.</p>
        <p>Company no. 000 000 000 · Privacy · Terms</p>
      </Container>
    </footer>
  )
}

export function StudioAgencySite({ className, style, ...props }: StudioAgencySiteProps) {
  const options = { ...defaults, ...props }
  const reduce = useReducedMotion()
  const animate = options.animate && !reduce
  return (
    <div className={cn('min-h-full w-full overflow-x-clip antialiased', className)} style={{ ...themeVars(options.dark, options.accent, options.radius, options.fontPair), ...style }}>
      <Navbar name={options.name} />
      <main className="-mt-[72px]">
        <Hero name={options.name} headline={options.headline} animate={animate} />
        <Brands animate={animate} />
        <Services animate={animate} />
        <Work animate={animate} />
        <Process animate={animate} />
        <Testimonials animate={animate} />
        <Pricing animate={animate} />
        <Journal animate={animate} />
        <Faq animate={animate} />
        <Cta name={options.name} animate={animate} />
      </main>
      <Footer name={options.name} />
    </div>
  )
}

