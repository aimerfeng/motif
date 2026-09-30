// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Sat Naing
// Source: https://github.com/satnaing/astro-paper/blob/35cfa7f/src/pages/index.astro
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@motif/runtime'

/* @motif:defaults */
export const defaults = {
  name: 'Small Hours',
  headline: 'Notes on building software that stays out of the way.',
  accent: '#1c6fb8',
  fontPair: 'serif',
  radius: 8,
  dark: false,
  animate: true,
}
/* @motif:end */

export type PaperBlogSiteProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

// ---------------------------------------------------------------------------
// 主题
// ---------------------------------------------------------------------------

const SANS = ', ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
const SERIF = ', ui-serif, Georgia, "Songti SC", serif'
const MONO = ', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

const FONT_PAIRS: Record<string, { head: string; body: string; ui: string }> = {
  serif: { head: `'Newsreader Variable'${SERIF}`, body: `'Newsreader Variable'${SERIF}`, ui: `'Geist Variable'${SANS}` },
  mono: { head: `'JetBrains Mono Variable'${MONO}`, body: `'JetBrains Mono Variable'${MONO}`, ui: `'JetBrains Mono Variable'${MONO}` },
  sans: { head: `'Geist Variable'${SANS}`, body: `'Geist Variable'${SANS}`, ui: `'Geist Variable'${SANS}` },
  literary: { head: `'Fraunces Variable'${SERIF}`, body: `'Newsreader Variable'${SERIF}`, ui: `'Geist Mono Variable'${MONO}` },
}

function themeVars(dark: boolean, accent: string, radius: number, fontPair: string): CSSProperties {
  const fonts = FONT_PAIRS[fontPair] ?? FONT_PAIRS.serif!
  const vars: Record<string, string> = dark
    ? {
        '--bg': `color-mix(in oklab, ${accent} 8%, #14171f)`,
        '--card': `color-mix(in oklab, ${accent} 8%, #1a1e28)`,
        '--fg': '#e9ecf2',
        '--mut': '#9aa3b5',
        '--line': 'rgb(255 255 255 / 0.11)',
        '--accent-text': `color-mix(in oklab, ${accent} 62%, white)`,
      }
    : {
        '--bg': '#fdfdfc',
        '--card': `color-mix(in oklab, ${accent} 3%, #f6f6f3)`,
        '--fg': '#26262b',
        '--mut': '#6a6a73',
        '--line': 'rgb(38 38 43 / 0.14)',
        '--accent-text': `color-mix(in oklab, ${accent} 88%, black)`,
      }
  return {
    ...vars,
    '--accent': accent,
    '--r': `${radius}px`,
    '--font-head': fonts.head,
    '--font-body': fonts.body,
    '--font-ui': fonts.ui,
    fontFamily: 'var(--font-body)',
    backgroundColor: 'var(--bg)',
    color: 'var(--fg)',
  } as CSSProperties
}

// ---------------------------------------------------------------------------
// 内容
// ---------------------------------------------------------------------------

type Post = { id: string; title: string; date: string; read: number; tags: string[]; featured?: boolean; blurb: string; cover: 'arcs' | 'lines' | 'dots' }

const POSTS: Post[] = [
  { id: 'latency', title: 'Latency budgets for humans', date: '2026-08-14', read: 9, tags: ['performance', 'craft'], featured: true, cover: 'arcs', blurb: 'Under 100 ms feels instant, under a second keeps your train of thought. How to spend those milliseconds on purpose.' },
  { id: 'migrations', title: 'The case for boring migrations', date: '2026-07-02', read: 7, tags: ['process'], featured: true, cover: 'lines', blurb: 'We moved four services off a database in a quarter with no incident. The plan was a spreadsheet and a lot of patience.' },
  { id: 'tokens', title: 'What a design token actually is', date: '2026-06-19', read: 6, tags: ['design-systems', 'css'], cover: 'dots', blurb: 'A token is a decision with a name. Everything else, including the JSON file, is plumbing.' },
  { id: 'changelog', title: 'Write the changelog first', date: '2026-05-28', read: 4, tags: ['writing', 'process'], cover: 'lines', blurb: 'Drafting the release note before the code exposes vague scope faster than any planning meeting.' },
  { id: 'shortcuts', title: 'Keyboard shortcuts are an API', date: '2026-04-30', read: 5, tags: ['craft', 'design-systems'], cover: 'dots', blurb: 'Once someone learns a shortcut you own it forever. Treat renames like breaking changes.' },
  { id: 'small-releases', title: 'A year of small releases', date: '2026-03-12', read: 8, tags: ['process', 'writing'], cover: 'arcs', blurb: 'Fifty-one releases, none larger than a day of work. What changed in how we plan, review and talk to users.' },
  { id: 'empty', title: 'On empty states', date: '2026-02-05', read: 3, tags: ['craft'], cover: 'arcs', blurb: 'The first screen of every new account is empty. It is the most-read page you never designed.' },
  { id: 'settings', title: 'Why we deleted the settings page', date: '2025-11-21', read: 6, tags: ['craft', 'process'], cover: 'lines', blurb: 'Forty toggles, three used. Defaults are a product decision, not a compromise.' },
  { id: 'spinners', title: 'A field guide to loading spinners', date: '2025-09-09', read: 5, tags: ['performance', 'css'], cover: 'dots', blurb: 'When a spinner helps, when a skeleton lies, and when the honest answer is to show nothing at all.' },
  { id: 'type-scale', title: 'A type scale in twelve lines of CSS', date: '2025-06-17', read: 4, tags: ['css', 'design-systems'], cover: 'arcs', blurb: 'Custom properties, clamp() and one ratio. No plugin, no build step, and it holds up from phone to 4K.' },
]

const TAGS = ['craft', 'performance', 'process', 'design-systems', 'css', 'writing']

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fmtDate = (iso: string) => `${iso.slice(8, 10)} ${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`

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

const G = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" /></>,
  moon: <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />,
  rss: <><path d="M5 5a14 14 0 0 1 14 14M5 11a8 8 0 0 1 8 8" /><circle cx="6" cy="18" r="1.3" /></>,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5 10.5 19" />,
  mail: <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m4.5 7.5 7.5 6 7.5-6" /></>,
  at: <><circle cx="12" cy="12" r="3.5" /><path d="M15.5 12v1.500a2.500 2.500 0 0 0 5 0V12a8.500 8.500 0 1 0-3.500 6.900" /></>,
  up: <path d="M12 19V6m-6 6 6-6 6 6" />,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4.500l3 1.500" /></>,
}

function Cover({ kind, index }: { kind: Post['cover']; index: number }) {
  return (
    <div className="relative aspect-[16/8] overflow-hidden rounded-t-(--r)" aria-hidden style={{ background: `linear-gradient(${140 + index * 40}deg, color-mix(in oklab, var(--accent) 70%, black), color-mix(in oklab, var(--accent) 40%, oklch(0.75 0.13 ${60 + index * 50})))` }}>
      <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        {kind === 'arcs' && [30, 56, 84, 114, 146].map((r, i) => <circle key={r} cx="260" cy="140" r={r} fill="none" stroke="#fff" strokeOpacity={0.55 - i * 0.08} strokeWidth="1.2" />)}
        {kind === 'lines' && Array.from({ length: 14 }, (_, i) => <path key={i} d={`M-10 ${20 + i * 12} Q 90 ${-10 + i * 12}, 170 ${30 + i * 10} T 340 ${10 + i * 12}`} fill="none" stroke="#fff" strokeOpacity={0.14 + (i % 4) * 0.08} />)}
        {kind === 'dots' && Array.from({ length: 6 }, (_, r) => Array.from({ length: 14 }, (_, c) => <circle key={`${r}-${c}`} cx={20 + c * 22} cy={20 + r * 24} r={1.5 + ((r * c) % 4) * 0.7} fill="#fff" fillOpacity={0.6} />))}
      </svg>
    </div>
  )
}

function Reveal({ children, delay = 0, on, className }: { children: ReactNode; delay?: number; on: boolean; className?: string }) {
  if (!on) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function TagPill({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  const cls = cn(
    'inline-flex items-center rounded-(--r) px-2 py-0.5 font-(family-name:--font-ui) text-xs transition-colors',
    active ? 'bg-(--accent) text-white' : 'bg-(--line)/60 text-(--mut) hover:text-(--accent-text)',
  )
  if (!onClick) return <span className={cls}>#{tag}</span>
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cls}>
      #{tag}
    </button>
  )
}

function Meta({ post }: { post: Post }) {
  return (
    <p className="flex items-center gap-2 font-(family-name:--font-ui) text-xs text-(--mut)">
      <time dateTime={post.date}>{fmtDate(post.date)}</time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Icon className="size-3.5">{G.clock}</Icon>
        {post.read} min read
      </span>
    </p>
  )
}

// ---------------------------------------------------------------------------
// 区块
// ---------------------------------------------------------------------------

const NAV = ['Posts', 'Tags', 'About', 'Archives']

function Header({ name, dark, onToggle, onSearch }: { name: string; dark: boolean; onToggle: () => void; onSearch: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="mx-auto w-full max-w-3xl px-4">
      <div className="flex items-center justify-between border-b border-(--line) py-5 sm:py-6">
        <a href="#top" className="font-(family-name:--font-head) text-2xl font-semibold tracking-tight whitespace-nowrap sm:text-3xl">
          {name}
        </a>
        <div className="flex items-center gap-1 font-(family-name:--font-ui) text-sm">
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
            {NAV.map((item, index) => (
              <a key={item} href={index === 0 ? '#recent' : index === 1 ? '#tags' : index === 2 ? '#about' : '#archive'} className={cn('rounded-(--r) px-2.5 py-1.5 transition-colors hover:text-(--accent-text)', index === 0 ? 'text-(--accent-text) underline decoration-dashed underline-offset-8' : 'text-(--fg)')}>
                {item}
              </a>
            ))}
          </nav>
          <button type="button" onClick={onSearch} aria-label="Search posts" className="grid size-9 place-items-center rounded-(--r) hover:bg-(--card)">
            <Icon>{G.search}</Icon>
          </button>
          <button type="button" onClick={onToggle} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} className="grid size-9 place-items-center rounded-(--r) hover:bg-(--card)">
            <Icon>{dark ? G.sun : G.moon}</Icon>
          </button>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle menu" className="grid size-9 place-items-center rounded-(--r) hover:bg-(--card) sm:hidden">
            <Icon>{open ? G.close : G.menu}</Icon>
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-b border-(--line) py-3 font-(family-name:--font-ui) text-sm sm:hidden" aria-label="Mobile">
          {NAV.map((item) => (
            <a key={item} href="#recent" onClick={() => setOpen(false)} className="rounded-(--r) px-2 py-2 hover:bg-(--card) hover:text-(--accent-text)">
              {item}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

function Socials() {
  const items = [
    { label: 'Source', glyph: G.code },
    { label: 'Handle', glyph: G.at },
    { label: 'Mail', glyph: G.mail },
    { label: 'RSS', glyph: G.rss },
  ]
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => (
        <li key={item.label}>
          <a href="#about" aria-label={item.label} title={item.label} className="grid size-9 place-items-center rounded-(--r) text-(--fg) transition-colors hover:bg-(--card) hover:text-(--accent-text)">
            <Icon>{item.glyph}</Icon>
          </a>
        </li>
      ))}
    </ul>
  )
}

function Hero({ headline, animate }: { headline: string; animate: boolean }) {
  const enter = (delay: number) => (animate ? { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const } } : {})
  return (
    <section id="top" className="border-b border-(--line) pt-8 pb-8">
      <motion.p {...enter(0)} className="font-(family-name:--font-ui) text-xs tracking-[0.16em] text-(--accent-text) uppercase">
        A weblog by Elin Okafor
      </motion.p>
      <motion.h1 {...enter(0.04)} className="my-4 max-w-2xl font-(family-name:--font-head) text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:my-6 sm:text-6xl">
        {headline}
      </motion.h1>
      <motion.div {...enter(0.08)} className="max-w-xl space-y-3 text-lg leading-relaxed text-(--mut)">
        <p>
          Essays on interface performance, design systems and the unglamorous parts of shipping. New posts roughly every three weeks, never with a tracking pixel.
        </p>
        <p>
          Start with the <a href="#featured" className="text-(--fg) underline decoration-(--accent) decoration-dashed underline-offset-4 hover:text-(--accent-text)">featured essays</a>, or subscribe by feed.
        </p>
      </motion.div>
      <motion.div {...enter(0.12)} className="mt-6 flex flex-col gap-1 font-(family-name:--font-ui) text-sm sm:flex-row sm:items-center sm:gap-3">
        <span className="whitespace-nowrap text-(--mut)">Social links:</span>
        <Socials />
      </motion.div>
    </section>
  )
}

function Featured({ animate }: { animate: boolean }) {
  const featured = POSTS.filter((p) => p.featured)
  return (
    <section id="featured" className="border-b border-(--line) pt-12 pb-10">
      <h2 className="font-(family-name:--font-head) text-2xl font-semibold tracking-wide">Featured</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {featured.map((post, index) => (
          <Reveal key={post.id} on={animate} delay={index * 0.06} className="h-full">
            <a href="#featured" className="group flex h-full flex-col overflow-hidden rounded-(--r) border border-(--line) bg-(--card) transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgb(0_0_0/0.35)]">
              <Cover kind={post.cover} index={index} />
              <div className="flex flex-1 flex-col gap-2 p-5">
                <Meta post={post} />
                <h3 className="font-(family-name:--font-head) text-xl leading-snug font-medium text-(--accent-text) decoration-dashed underline-offset-4 group-hover:underline">{post.title}</h3>
                <p className="text-[15px] leading-relaxed text-(--mut)">{post.blurb}</p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Recent({ animate, query, setQuery, tag, setTag }: { animate: boolean; query: string; setQuery: (v: string) => void; tag: string | null; setTag: (v: string | null) => void }) {
  const rest = useMemo(() => POSTS.filter((p) => !p.featured), [])
  const results = rest.filter((post) => {
    if (tag && !post.tags.includes(tag)) return false
    const q = query.trim().toLowerCase()
    return !q || `${post.title} ${post.blurb}`.toLowerCase().includes(q)
  })
  return (
    <section id="recent" className="pt-12 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-(family-name:--font-head) text-2xl font-semibold tracking-wide">Recent posts</h2>
        <label className="relative block sm:w-64">
          <span className="sr-only">Search posts</span>
          <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--mut)">{G.search}</Icon>
          <input
            id="pb-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts…"
            className="h-10 w-full rounded-(--r) border border-(--line) bg-(--card) pr-3 pl-9 font-(family-name:--font-ui) text-sm outline-none placeholder:text-(--mut) focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/25"
          />
        </label>
      </div>
      <div id="tags" className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setTag(null)} aria-pressed={tag === null} className={cn('rounded-(--r) px-2.5 py-1 font-(family-name:--font-ui) text-xs transition-colors', tag === null ? 'bg-(--accent) text-white' : 'bg-(--line)/60 text-(--mut) hover:text-(--accent-text)')}>
          all
        </button>
        {TAGS.map((t) => (
          <TagPill key={t} tag={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)} />
        ))}
      </div>
      <ul className="mt-4">
        {results.length === 0 && <li className="py-10 text-(--mut)">Nothing matches that yet. Try a shorter search.</li>}
        {results.map((post, index) => (
          <li key={post.id} className="border-b border-dashed border-(--line) last:border-0">
            <Reveal on={animate} delay={Math.min(index, 3) * 0.04} className="py-6">
              <a href="#recent" className="group block">
                <h3 className="inline-block font-(family-name:--font-head) text-xl leading-snug font-medium text-(--accent-text) decoration-dashed underline-offset-4 group-hover:underline sm:text-2xl">{post.title}</h3>
                <div className="mt-1.5">
                  <Meta post={post} />
                </div>
                <p className="mt-2 max-w-2xl leading-relaxed text-(--mut)">{post.blurb}</p>
              </a>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <TagPill key={t} tag={t} />
                ))}
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
      <div className="my-8 text-center">
        <a href="#archive" className="inline-flex items-center gap-2 rounded-(--r) border border-(--line) px-5 py-2.5 font-(family-name:--font-ui) text-sm transition-colors hover:border-(--accent) hover:text-(--accent-text)">
          All posts
          <Icon className="size-4">{G.arrow}</Icon>
        </a>
      </div>
    </section>
  )
}

function Archive() {
  const byYear = POSTS.reduce<Record<string, Post[]>>((acc, post) => {
    const year = post.date.slice(0, 4)
    ;(acc[year] ??= []).push(post)
    return acc
  }, {})
  const years = Object.keys(byYear).sort().reverse()
  return (
    <section id="archive" className="border-t border-(--line) pt-12 pb-10">
      <h2 className="font-(family-name:--font-head) text-2xl font-semibold tracking-wide">Archives</h2>
      <p className="mt-2 text-(--mut)">{POSTS.length} essays since June 2025.</p>
      <div className="mt-8 space-y-8">
        {years.map((year) => (
          <div key={year} className="grid gap-3 sm:grid-cols-[6rem_1fr]">
            <h3 className="font-(family-name:--font-ui) text-sm text-(--mut) tabular-nums">
              {year} <span className="opacity-60">({byYear[year]!.length})</span>
            </h3>
            <ul className="space-y-2">
              {byYear[year]!.map((post) => (
                <li key={post.id} className="flex items-baseline justify-between gap-4">
                  <a href="#archive" className="decoration-dashed underline-offset-4 hover:text-(--accent-text) hover:underline">
                    {post.title}
                  </a>
                  <time dateTime={post.date} className="shrink-0 font-(family-name:--font-ui) text-xs text-(--mut)">
                    {fmtDate(post.date).slice(0, 6)}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="border-t border-(--line) pt-12 pb-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <span className="grid size-20 shrink-0 place-items-center rounded-full font-(family-name:--font-head) text-2xl font-semibold text-white" style={{ background: 'linear-gradient(140deg, color-mix(in oklab, var(--accent) 80%, white), color-mix(in oklab, var(--accent) 60%, black))' }}>
          EO
        </span>
        <div>
          <h2 className="font-(family-name:--font-head) text-2xl font-semibold tracking-wide">About the author</h2>
          <p className="mt-3 max-w-xl leading-relaxed text-(--mut)">
            Elin Okafor is a front-end engineer who has spent eleven years on design systems and performance work, most recently for a logistics platform. She writes here about the parts of software that rarely make a roadmap: naming, defaults, and how fast things feel.
          </p>
          <p className="mt-3 max-w-xl leading-relaxed text-(--mut)">Replies to every email, usually within a day.</p>
        </div>
      </div>
    </section>
  )
}

function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-(--line) pt-6 pb-10">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Socials />
        <a href="#top" className="inline-flex items-center gap-1.5 rounded-(--r) px-3 py-1.5 font-(family-name:--font-ui) text-sm text-(--mut) hover:bg-(--card) hover:text-(--accent-text)">
          <Icon className="size-4">{G.up}</Icon>
          Back to top
        </a>
      </div>
      <p className="mt-4 text-center font-(family-name:--font-ui) text-xs text-(--mut) sm:text-left">
        Copyright &copy; 2026 {name}. All rights reserved.
      </p>
    </footer>
  )
}

export function PaperBlogSite({ className, style, ...props }: PaperBlogSiteProps) {
  const options = { ...defaults, ...props }
  const reduce = useReducedMotion()
  const animate = options.animate && !reduce
  const [dark, setDark] = useState(options.dark)
  useEffect(() => setDark(options.dark), [options.dark])
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState<string | null>(null)

  return (
    <div className={cn('min-h-full w-full overflow-x-clip antialiased', className)} style={{ ...themeVars(dark, options.accent, options.radius, options.fontPair), ...style }}>
      <Header
        name={options.name}
        dark={dark}
        onToggle={() => setDark((v) => !v)}
        onSearch={() => {
          const input = document.getElementById('pb-search') as HTMLInputElement | null
          input?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
          input?.focus({ preventScroll: true })
        }}
      />
      <main className="mx-auto w-full max-w-3xl px-4">
        <Hero headline={options.headline} animate={animate} />
        <Featured animate={animate} />
        <Recent animate={animate} query={query} setQuery={setQuery} tag={tag} setTag={setTag} />
        <Archive />
        <About />
      </main>
      <div className="mx-auto w-full max-w-3xl px-4">
        <Footer name={options.name} />
      </div>
    </div>
  )
}
