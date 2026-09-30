// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Ryan Fitzgerald
// Source: https://github.com/RyanFitzgerald/devportfolio/blob/852d650/src/pages/index.astro
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'

/* @motif:defaults */
export const defaults = {
  name: 'Iris Calder',
  headline: 'Systems engineer building fast, quiet developer tools.',
  accent: '#0f9d6e',
  fontPair: 'grotesk',
  radius: 14,
  dark: false,
  animate: true,
}
/* @motif:end */

export type DevfolioSiteProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

// ---------------------------------------------------------------------------
// 主题：所有颜色都从 accent 和 dark 推出来，整页只有这一处调色。
// ---------------------------------------------------------------------------

const FALLBACK_SANS = ', ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
const FALLBACK_MONO = ', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

const FONT_PAIRS: Record<string, { head: string; body: string; mono: string }> = {
  grotesk: { head: `'Space Grotesk Variable'${FALLBACK_SANS}`, body: `'Inter Tight Variable'${FALLBACK_SANS}`, mono: `'JetBrains Mono Variable'${FALLBACK_MONO}` },
  geist: { head: `'Geist Variable'${FALLBACK_SANS}`, body: `'Geist Variable'${FALLBACK_SANS}`, mono: `'Geist Mono Variable'${FALLBACK_MONO}` },
  plex: { head: `'IBM Plex Sans Variable'${FALLBACK_SANS}`, body: `'IBM Plex Sans Variable'${FALLBACK_SANS}`, mono: `'IBM Plex Mono'${FALLBACK_MONO}` },
  bricolage: { head: `'Bricolage Grotesque Variable'${FALLBACK_SANS}`, body: `'Manrope Variable'${FALLBACK_SANS}`, mono: `'Geist Mono Variable'${FALLBACK_MONO}` },
}

/** 在主色上放文字时用黑还是白。 */
function readableOn(hex: string): string {
  const value = hex.replace('#', '').slice(0, 6)
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.42 ? '#0b0d10' : '#ffffff'
}

function themeVars(dark: boolean, accent: string, radius: number, fontPair: string): CSSProperties {
  const fonts = FONT_PAIRS[fontPair] ?? FONT_PAIRS.grotesk!
  const vars: Record<string, string> = dark
    ? {
        '--bg': `color-mix(in oklab, ${accent} 5%, #0a0b0e)`,
        '--bg-alt': `color-mix(in oklab, ${accent} 7%, #101217)`,
        '--card': `color-mix(in oklab, ${accent} 5%, #14161c)`,
        '--fg': '#f2f4f7',
        '--soft': '#c3c8d2',
        '--mut': '#8a92a1',
        '--line': 'rgb(255 255 255 / 0.09)',
        '--grid': 'rgb(255 255 255 / 0.06)',
        '--shadow': '0 24px 60px -24px rgb(0 0 0 / 0.7)',
      }
    : {
        '--bg': `color-mix(in oklab, ${accent} 2%, #fbfbf9)`,
        '--bg-alt': `color-mix(in oklab, ${accent} 5%, #f3f3ef)`,
        '--card': '#ffffff',
        '--fg': '#15171c',
        '--soft': '#3a3f4a',
        '--mut': '#6b7280',
        '--line': 'rgb(20 23 28 / 0.09)',
        '--grid': 'rgb(20 23 28 / 0.06)',
        '--shadow': '0 24px 60px -28px rgb(20 23 28 / 0.28)',
      }
  return {
    ...vars,
    '--accent': accent,
    '--on-accent': readableOn(accent),
    '--r': `${radius}px`,
    '--font-head': fonts.head,
    '--font-body': fonts.body,
    '--font-mono': fonts.mono,
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={cn('size-5', className)} aria-hidden>
      {children}
    </svg>
  )
}

const ArrowUpRight = () => (
  <Icon className="size-4">
    <path d="M7 17 17 7M8 7h9v9" />
  </Icon>
)

/** 进入视口时淡入；关闭动画或减少动态效果时直接显示。 */
function Reveal({ children, delay = 0, className, on }: { children: ReactNode; delay?: number; className?: string; on: boolean }) {
  if (!on) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function SectionTitle({ children, kicker }: { children: ReactNode; kicker: string }) {
  return (
    <div className="lg:sticky lg:top-28">
      <p className="mb-3 font-(family-name:--font-mono) text-xs tracking-[0.18em] text-(--mut) uppercase">{kicker}</p>
      <h2 className="font-(family-name:--font-head) text-4xl font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">{children}</h2>
      <div className="mt-4 h-[5px] w-[72px] rounded-full bg-(--accent)" />
    </div>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-(--line) bg-(--bg-alt) px-3 py-1 font-(family-name:--font-mono) text-xs text-(--soft)">{children}</span>
  )
}

// ---------------------------------------------------------------------------
// 内容：虚构人物与公司，仅用于演示版式
// ---------------------------------------------------------------------------

const NAV = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#education', label: 'Education' },
]

const STATS = [
  { value: '9', unit: 'yrs', label: 'shipping infrastructure software' },
  { value: '14', unit: '', label: 'open-source packages maintained' },
  { value: '2.1M', unit: '', label: 'weekly installs across them' },
]

const JOBS = [
  {
    role: 'Staff Engineer, Build Systems',
    org: 'Norvane',
    range: 'Mar 2023 — Now',
    points: [
      'Cut median CI time from 19 to 6 minutes by moving the monorepo to a content-addressed remote cache.',
      'Own the internal task runner used by 240 engineers; wrote the migration guide and the codemod that moved 80 repos.',
      'Run the on-call rotation for developer tooling. Pages per week down from 11 to 2 over four quarters.',
    ],
  },
  {
    role: 'Senior Software Engineer',
    org: 'Brindle Works',
    range: 'Jun 2020 — Feb 2023',
    points: [
      'Designed the event pipeline behind usage-based billing: 40k events per second, exactly-once by construction.',
      'Introduced contract tests between services; production rollbacks dropped by two thirds in the first year.',
    ],
  },
  {
    role: 'Software Engineer',
    org: 'Osmara Labs',
    range: 'Aug 2017 — May 2020',
    points: [
      'Built the first version of the CLI and local dev environment that new hires still start with.',
      'Wrote the rendering service for report exports; p95 fell from 14 seconds to 900 ms.',
    ],
  },
]

const PROJECTS = [
  {
    name: 'Kilnwright',
    blurb: 'A content-addressed build cache with a single static binary and a readable manifest format. Drop-in for most task runners.',
    stack: ['Rust', 'gRPC', 'SQLite'],
    hue: 0,
  },
  {
    name: 'Patchbay',
    blurb: 'Local API mocking that records real traffic once, then replays it deterministically in tests and previews.',
    stack: ['TypeScript', 'Node', 'HTTP/2'],
    hue: 24,
  },
  {
    name: 'Tidemark',
    blurb: 'A terminal log viewer that folds repeated lines, follows request ids across services and stays fast at 5 GB.',
    stack: ['Go', 'TUI', 'mmap'],
    hue: -24,
  },
  {
    name: 'Plainform',
    blurb: 'Schema-first forms for internal tools: one JSON file in, accessible validation and keyboard flow out.',
    stack: ['React', 'Zod', 'Vite'],
    hue: 48,
  },
]

const SCHOOLS = [
  { degree: 'B.Sc. Computer Science', place: 'Northgate University', range: '2013 — 2017', note: 'Distributed systems thesis, graduated with distinction.' },
  { degree: 'Certificate, Systems Programming', place: 'Open Systems Institute', range: '2019', note: 'Evening program on memory models and concurrency.' },
]

// ---------------------------------------------------------------------------
// 区块
// ---------------------------------------------------------------------------

function Header({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <header className="sticky top-0 z-40 border-b border-(--line) bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5 font-(family-name:--font-head) text-lg font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-[calc(var(--r)*0.6)] bg-(--accent) text-xs font-bold text-(--on-accent)">{initials}</span>
          <span className="hidden sm:inline">{name}</span>
        </a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="rounded-full px-3.5 py-2 text-sm text-(--soft) transition-colors hover:bg-(--bg-alt) hover:text-(--fg)">
              {item.label}
            </a>
          ))}
          <a href="#contact" className="ml-2 rounded-full bg-(--fg) px-4 py-2 text-sm font-medium text-(--bg) transition-opacity hover:opacity-85">
            Get in touch
          </a>
        </nav>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle menu" className="grid size-10 place-items-center rounded-full border border-(--line) md:hidden">
          <Icon>{open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}</Icon>
        </button>
      </div>
      {open && (
        <nav className="border-t border-(--line) px-5 py-3 md:hidden" aria-label="Mobile">
          {[...NAV, { href: '#contact', label: 'Contact' }].map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-base text-(--soft) hover:bg-(--bg-alt)">
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

function CodeCard({ live }: { live: boolean }) {
  const tk = {
    kw: 'text-(--accent)',
    fn: 'text-[#5b8def]',
    str: 'text-[#d9822b]',
    com: 'text-(--mut)',
  }
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <motion.div
        animate={live ? { y: [0, -7, 0] } : undefined}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="overflow-hidden rounded-[calc(var(--r)*1.4)] border border-(--line) bg-(--card) shadow-(--shadow)"
      >
        <div className="flex items-center gap-2 border-b border-(--line) px-4 py-3">
          <span className="size-2.5 rounded-full bg-(--line)" />
          <span className="size-2.5 rounded-full bg-(--line)" />
          <span className="size-2.5 rounded-full bg-(--line)" />
          <span className="ml-3 rounded-md bg-(--bg-alt) px-2.5 py-1 font-(family-name:--font-mono) text-[11px] text-(--mut)">plan.ts</span>
          <span className="rounded-md px-2.5 py-1 font-(family-name:--font-mono) text-[11px] text-(--mut)/70">cache.ts</span>
        </div>
        <pre className="overflow-hidden px-5 pt-5 pb-10 font-(family-name:--font-mono) text-[12.5px] leading-[1.8] text-(--soft)">
          <code>
            <span className={tk.com}>{'// resolve the smallest set of steps to re-run'}</span>
            {'\n'}
            <span className={tk.kw}>export async function</span> <span className={tk.fn}>plan</span>(graph: Graph) {'{'}
            {'\n  '}
            <span className={tk.kw}>const</span> order = <span className={tk.fn}>topo</span>(graph.nodes)
            {'\n  '}
            <span className={tk.kw}>for</span> (<span className={tk.kw}>const</span> step <span className={tk.kw}>of</span> order) {'{'}
            {'\n    '}
            <span className={tk.kw}>const</span> hit = <span className={tk.kw}>await</span> cache.<span className={tk.fn}>restore</span>(step.key)
            {'\n    '}
            <span className={tk.kw}>if</span> (hit) <span className={tk.kw}>continue</span>
            {'\n    '}
            <span className={tk.kw}>await</span> <span className={tk.fn}>run</span>(step, {'{'} label: <span className={tk.str}>'cold'</span> {'}'})
            {'\n  }\n  '}
            <span className={tk.kw}>return</span> order.<span className={tk.fn}>length</span>
            {'\n}'}
          </code>
        </pre>
      </motion.div>
      <motion.div
        animate={live ? { y: [0, 6, 0] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute -bottom-6 -left-3 flex items-center gap-3 rounded-[var(--r)] border border-(--line) bg-(--card) px-4 py-3 shadow-(--shadow) sm:-left-10"
      >
        <span className="grid size-9 place-items-center rounded-full bg-(--accent)/15 text-(--accent)">
          <Icon className="size-4.5">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </Icon>
        </span>
        <div>
          <p className="text-sm font-medium">Build passed</p>
          <p className="font-(family-name:--font-mono) text-[11px] text-(--mut)">6m 02s · 94% cache hit</p>
        </div>
      </motion.div>
      <motion.div
        animate={live ? { y: [0, -5, 0] } : undefined}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="absolute -top-5 -right-2 hidden rounded-full border border-(--line) bg-(--card) px-3.5 py-2 font-(family-name:--font-mono) text-[11px] text-(--soft) shadow-(--shadow) sm:block"
      >
        <span className="mr-2 inline-block size-1.5 rounded-full bg-(--accent)" />
        v2.4.0 released
      </motion.div>
    </div>
  )
}

function Hero({ name, headline, animate }: { name: string; headline: string; animate: boolean }) {
  const enter = (delay: number) =>
    animate
      ? { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const } }
      : {}
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 900px 700px at 0% 0%, color-mix(in oklab, var(--accent) 22%, transparent) 0%, color-mix(in oklab, var(--accent) 8%, transparent) 45%, transparent 75%)' }}
      />
      <svg aria-hidden className="absolute inset-0 -z-10 size-full [mask-image:radial-gradient(90%_90%_at_70%_10%,black,transparent)]">
        <defs>
          <pattern id="df-grid" x="0" y="-1" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M.5 72V.5H72" fill="none" stroke="var(--grid)" />
          </pattern>
          <pattern id="df-symbols" width="360" height="300" patternUnits="userSpaceOnUse">
            {[
              ['</>', 30, 50, -12],
              ['{}', 150, 110, 8],
              ['=>', 250, 60, -6],
              ['[]', 90, 210, 12],
              ['::', 300, 230, -9],
              ['()', 200, 270, 6],
            ].map(([glyph, x, y, r]) => (
              <text key={String(glyph)} x={x as number} y={y as number} transform={`rotate(${r} ${x} ${y})`} fill="var(--accent)" fontFamily="var(--font-mono)" fontSize="20">
                {glyph}
              </text>
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#df-symbols)" opacity="0.16" />
        <rect width="100%" height="100%" fill="url(#df-grid)" />
      </svg>
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-16 px-5 pt-16 pb-24 sm:px-8 md:pt-24 lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
        <div>
          <motion.div {...enter(0)} className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-(--line) bg-(--card) py-1.5 pr-4 pl-2 text-sm text-(--soft) shadow-sm">
            <span className="relative grid size-5 place-items-center">
              <span className="absolute size-5 animate-ping rounded-full bg-(--accent)/30 motion-reduce:hidden" />
              <span className="size-2 rounded-full bg-(--accent)" />
            </span>
            Open to staff-level roles from January
          </motion.div>
          <motion.p {...enter(0.03)} className="font-(family-name:--font-head) text-xl font-medium text-(--soft) sm:text-2xl">
            Hello, I&rsquo;m
          </motion.p>
          <motion.h1 {...enter(0.06)} className="mt-2 font-(family-name:--font-head) text-[clamp(2.75rem,8vw,6.25rem)] leading-[0.98] font-semibold tracking-[-0.035em] text-balance text-(--accent)">
            {name}
          </motion.h1>
          <motion.p {...enter(0.09)} className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-(--soft) sm:text-xl">
            {headline}
          </motion.p>
          <motion.div {...enter(0.12)} className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#projects" className="inline-flex h-12 items-center gap-2 rounded-full bg-(--accent) px-6 text-sm font-semibold text-(--on-accent) shadow-[0_10px_30px_-10px_var(--accent)] transition-transform hover:-translate-y-0.5">
              See my work
              <Icon className="size-4">
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </Icon>
            </a>
            <a href="#contact" className="inline-flex h-12 items-center rounded-full border border-(--line) bg-(--card) px-6 text-sm font-medium transition-colors hover:bg-(--bg-alt)">
              Contact me
            </a>
          </motion.div>
          <motion.ul {...enter(0.15)} className="mt-10 flex items-center gap-2 text-(--mut)">
            {[
              { label: 'Source', d: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5 10.5 19" /> },
              { label: 'Writing', d: <><path d="M5 5h14v14H5z" /><path d="M8.5 9.5h7M8.5 13h7M8.5 16h4" /></> },
              { label: 'Mail', d: <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m4.5 7.5 7.5 6 7.5-6" /></> },
            ].map((social) => (
              <li key={social.label}>
                <a href="#contact" aria-label={social.label} className="grid size-11 place-items-center rounded-full border border-(--line) transition-colors hover:border-(--accent) hover:text-(--accent)">
                  <Icon>{social.d}</Icon>
                </a>
              </li>
            ))}
          </motion.ul>
        </div>
        <motion.div {...enter(0.1)} className="lg:pl-6">
          <CodeCard live={animate} />
        </motion.div>
      </div>
    </section>
  )
}

function About({ animate }: { animate: boolean }) {
  return (
    <section id="about" className="border-t border-(--line)">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionTitle kicker="01 — About">About</SectionTitle>
        </div>
        <div className="lg:col-span-8">
          <Reveal on={animate}>
            <p className="font-(family-name:--font-head) text-2xl leading-snug tracking-tight text-pretty sm:text-3xl">
              I make the tools other engineers reach for without thinking about them: build systems, caches, CLIs and the small pieces of glue in between.
            </p>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-(--soft)">
              <p>
                I started on the product side of a payments company and slowly moved down the stack, because the slowest part of shipping was never the feature. It was
                waiting for a build, a deploy or a flaky test to tell me what I already suspected.
              </p>
              <p>
                These days I work on developer experience for large monorepos. I care about latency you can feel, errors that say what to do next, and documentation short
                enough to be read. Outside work I maintain a handful of open-source tools, and I write about what breaks.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {STATS.map((stat, index) => (
              <Reveal key={stat.label} on={animate} delay={index * 0.06}>
                <div className="h-full rounded-(--r) border border-(--line) bg-(--card) p-6">
                  <p className="font-(family-name:--font-head) text-5xl font-semibold tracking-tight">
                    {stat.value}
                    {stat.unit && <span className="ml-1 text-2xl text-(--accent)">{stat.unit}</span>}
                  </p>
                  <p className="mt-3 text-sm leading-snug text-(--mut)">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Experience({ animate }: { animate: boolean }) {
  return (
    <section id="experience" className="border-t border-(--line) bg-(--bg-alt)">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionTitle kicker="02 — Experience">Experience</SectionTitle>
        </div>
        <ol className="relative lg:col-span-8">
          <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-(--line)" />
          {JOBS.map((job, index) => (
            <li key={job.org} className="relative pb-10 pl-9 last:pb-0">
              <span className="absolute top-1.5 left-0 grid size-[15px] place-items-center rounded-full border-2 border-(--accent) bg-(--bg-alt)">
                {index === 0 && <span className="size-1.5 rounded-full bg-(--accent)" />}
              </span>
              <Reveal on={animate} delay={index * 0.05}>
                <article className="rounded-(--r) border border-(--line) bg-(--card) p-6 transition-shadow hover:shadow-(--shadow) sm:p-7">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h3 className="font-(family-name:--font-head) text-xl font-semibold tracking-tight">{job.role}</h3>
                      <p className="mt-0.5 text-base font-medium text-(--accent)">{job.org}</p>
                    </div>
                    <p className="font-(family-name:--font-mono) text-xs text-(--mut)">{job.range}</p>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {job.points.map((point) => (
                      <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-(--soft)">
                        <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-(--mut)/60" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** 项目封面：用主色的色相偏移生成一块渐变 + 网点，不用任何图片。 */
function Cover({ hue, index }: { hue: number; index: number }) {
  return (
    <div
      aria-hidden
      className="relative h-28 overflow-hidden rounded-[calc(var(--r)*0.75)] sm:h-full sm:min-h-32"
      style={{
        background: `linear-gradient(${125 + hue}deg, color-mix(in oklab, var(--accent) 88%, black) 0%, color-mix(in oklab, var(--accent) 55%, #6d5bff) 55%, color-mix(in oklab, var(--accent) 35%, #ffb36b) 100%)`,
        filter: `hue-rotate(${hue}deg)`,
      }}
    >
      <svg viewBox="0 0 200 120" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={`dots-${index}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="white" opacity="0.28" />
          </pattern>
        </defs>
        <rect width="200" height="120" fill={`url(#dots-${index})`} />
        {index % 2 === 0 ? (
          <>
            <circle cx="140" cy="60" r="44" fill="none" stroke="white" strokeOpacity="0.5" />
            <circle cx="140" cy="60" r="26" fill="none" stroke="white" strokeOpacity="0.5" />
            <circle cx="140" cy="60" r="8" fill="white" fillOpacity="0.85" />
          </>
        ) : (
          <>
            <path d="M20 90 70 50l32 24 60-46" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="70" cy="50" r="4" fill="white" />
            <circle cx="102" cy="74" r="4" fill="white" />
            <circle cx="162" cy="28" r="4" fill="white" />
          </>
        )}
      </svg>
    </div>
  )
}

function Projects({ animate }: { animate: boolean }) {
  return (
    <section id="projects" className="border-t border-(--line)">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionTitle kicker="03 — Projects">Projects</SectionTitle>
          <p className="mt-6 max-w-xs text-(--mut)">Small, sharp tools. Each one replaced something I was tired of waiting for.</p>
        </div>
        <div className="space-y-6 lg:col-span-8">
          {PROJECTS.map((project, index) => (
            <Reveal key={project.name} on={animate} delay={index * 0.04}>
              <a href="#projects" className="group relative grid gap-5 rounded-(--r) border border-(--line) bg-(--card) p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-(--shadow) sm:grid-cols-[200px_1fr] sm:p-5">
                <Cover hue={project.hue} index={index} />
                <div className="pr-12 sm:py-2">
                  <span className="font-(family-name:--font-mono) text-sm text-(--accent)">0{index + 1}</span>
                  <h3 className="mt-1 font-(family-name:--font-head) text-2xl font-semibold tracking-tight">{project.name}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-(--soft)">{project.blurb}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.stack.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                </div>
                <span className="absolute top-[152px] right-5 grid size-10 place-items-center rounded-full bg-(--fg) text-(--bg) transition-transform duration-300 group-hover:rotate-12 sm:top-6 sm:right-6">
                  <ArrowUpRight />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Education({ animate }: { animate: boolean }) {
  return (
    <section id="education" className="border-t border-(--line) bg-(--bg-alt)">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionTitle kicker="04 — Education">Education</SectionTitle>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          {SCHOOLS.map((school, index) => (
            <Reveal key={school.degree} on={animate} delay={index * 0.06}>
              <article className="h-full rounded-(--r) border border-(--line) bg-(--card) p-6">
                <p className="font-(family-name:--font-mono) text-xs text-(--mut)">{school.range}</p>
                <h3 className="mt-4 font-(family-name:--font-head) text-xl font-semibold tracking-tight">{school.degree}</h3>
                <p className="mt-1 font-medium text-(--accent)">{school.place}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-(--soft)">{school.note}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact({ animate, name }: { animate: boolean; name: string }) {
  return (
    <section id="contact" className="relative isolate overflow-hidden border-t border-(--line)">
      <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 700px 420px at 50% 100%, color-mix(in oklab, var(--accent) 20%, transparent), transparent 70%)' }} />
      <div className="mx-auto w-full max-w-[1200px] px-5 py-24 text-center sm:px-8 md:py-32">
        <Reveal on={animate}>
          <p className="font-(family-name:--font-mono) text-xs tracking-[0.18em] text-(--mut) uppercase">05 — Contact</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-(family-name:--font-head) text-4xl font-semibold tracking-tight text-balance sm:text-6xl">Have a slow build or a sharp idea? Write to me.</h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-(--soft)">I reply within two working days, usually sooner. Short notes are welcome.</p>
          <a href="mailto:hello@example.com" className="mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-(--accent) px-8 text-base font-semibold text-(--on-accent) shadow-[0_14px_40px_-12px_var(--accent)] transition-transform hover:-translate-y-0.5">
            hello@example.com
            <ArrowUpRight />
          </a>
        </Reveal>
      </div>
      <footer className="border-t border-(--line)">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-(--mut) sm:flex-row sm:px-8">
          <p>&copy; 2026 {name}. Built with React and Tailwind.</p>
          <p className="font-(family-name:--font-mono) text-xs">No analytics. No cookies.</p>
        </div>
      </footer>
    </section>
  )
}

export function DevfolioSite({ className, style, ...props }: DevfolioSiteProps) {
  const options = { ...defaults, ...props }
  const reduce = useReducedMotion()
  const animate = options.animate && !reduce
  return (
    <div className={cn('relative min-h-full w-full overflow-x-clip antialiased', className)} style={{ ...themeVars(options.dark, options.accent, options.radius, options.fontPair), ...style }}>
      <Header name={options.name} />
      <main>
        <Hero name={options.name} headline={options.headline} animate={animate} />
        <About animate={animate} />
        <Experience animate={animate} />
        <Projects animate={animate} />
        <Education animate={animate} />
        <Contact animate={animate} name={options.name} />
      </main>
    </div>
  )
}
