// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Dillion Verma
// Source: https://github.com/magicuidesign/portfolio/blob/5ef12e4/src/app/page.tsx
// Modified by Motif; see the item's provenance.
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@motif/runtime'

/* @motif:defaults */
export const defaults = {
  name: 'Noa Lindqvist',
  headline: 'Product engineer who sweats the last ten percent of every interface.',
  accent: '#e0672a',
  fontPair: 'geist',
  radius: 16,
  dark: false,
  animate: true,
}
/* @motif:end */

export type DockfolioSiteProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

// ---------------------------------------------------------------------------
// 主题
// ---------------------------------------------------------------------------

const SANS = ', ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
const SERIF = ', ui-serif, Georgia, "Songti SC", serif'

const FONT_PAIRS: Record<string, { head: string; body: string }> = {
  geist: { head: `'Geist Variable'${SANS}`, body: `'Geist Variable'${SANS}` },
  manrope: { head: `'Manrope Variable'${SANS}`, body: `'Manrope Variable'${SANS}` },
  jakarta: { head: `'Plus Jakarta Sans Variable'${SANS}`, body: `'Inter Tight Variable'${SANS}` },
  editorial: { head: `'Instrument Serif'${SERIF}`, body: `'Geist Variable'${SANS}` },
}

function readableOn(hex: string): string {
  const value = hex.replace('#', '').slice(0, 6)
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.42 ? '#0b0d10' : '#ffffff'
}

function themeVars(dark: boolean, accent: string, radius: number, fontPair: string): CSSProperties {
  const fonts = FONT_PAIRS[fontPair] ?? FONT_PAIRS.geist!
  const vars: Record<string, string> = dark
    ? {
        '--bg': '#0b0b0c',
        '--card': '#131315',
        '--fg': '#f4f4f5',
        '--mut': '#a1a1aa',
        '--line': 'rgb(255 255 255 / 0.1)',
        '--ring': 'rgb(255 255 255 / 0.06)',
        '--shadow': '0 10px 40px -12px rgb(0 0 0 / 0.6)',
      }
    : {
        '--bg': '#ffffff',
        '--card': '#fbfbfa',
        '--fg': '#0d0d0f',
        '--mut': '#63636b',
        '--line': 'rgb(13 13 15 / 0.1)',
        '--ring': 'rgb(13 13 15 / 0.05)',
        '--shadow': '0 10px 40px -12px rgb(13 13 15 / 0.18)',
      }
  return {
    ...vars,
    '--accent': accent,
    '--on-accent': readableOn(accent),
    '--r': `${radius}px`,
    '--font-head': fonts.head,
    '--font-body': fonts.body,
    fontFamily: 'var(--font-body)',
    backgroundColor: 'var(--bg)',
    color: 'var(--fg)',
  } as CSSProperties
}

// ---------------------------------------------------------------------------
// 动效：模糊淡入（整块 / 逐词）
// ---------------------------------------------------------------------------

function BlurFade({ children, delay = 0, className, on }: { children: ReactNode; delay?: number; className?: string; on: boolean }) {
  if (!on) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** 逐词模糊淡入，挂载即播放（首屏用）。 */
function BlurWords({ text, className, on, delay = 0, step = 0.025, as: Tag = 'p' }: { text: string; className?: string; on: boolean; delay?: number; step?: number; as?: 'p' | 'h1' }) {
  const words = text.split(' ')
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} aria-hidden className="inline-block whitespace-pre">
          {on ? (
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.35, delay: delay + index * step, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ) : (
            word
          )}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}

// ---------------------------------------------------------------------------
// 图标与内容
// ---------------------------------------------------------------------------

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={cn('size-5', className)} aria-hidden>
      {children}
    </svg>
  )
}

const GLYPHS = {
  home: <><path d="M4 11.5 12 5l8 6.5" /><path d="M6 10.5V19h12v-8.5" /><path d="M10 19v-5h4v5" /></>,
  work: <><rect x="4" y="7.5" width="16" height="11" rx="2" /><path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M4 12.5h16" /></>,
  grid: <><rect x="4.5" y="4.5" width="6" height="6" rx="1.5" /><rect x="13.5" y="4.5" width="6" height="6" rx="1.5" /><rect x="4.5" y="13.5" width="6" height="6" rx="1.5" /><rect x="13.5" y="13.5" width="6" height="6" rx="1.5" /></>,
  pen: <><path d="M5 19l1-4L16.5 4.5a1.8 1.8 0 0 1 2.5 0l.5.5a1.8 1.8 0 0 1 0 2.5L9 18z" /><path d="M14.5 6.5l3 3" /></>,
  mail: <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m4.5 7.5 7.5 6 7.5-6" /></>,
  sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" /></>,
  moon: <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  arrow: <path d="M7 17 17 7M8 7h9v9" />,
  globe: <><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c2.5 2.3 3.5 5 3.5 8s-1 5.7-3.5 8c-2.5-2.3-3.5-5-3.5-8s1-5.7 3.5-8z" /></>,
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5 10.5 19" />,
}

const DOCK_LINKS = [
  { href: '#top', label: 'Home', glyph: GLYPHS.home },
  { href: '#work', label: 'Work', glyph: GLYPHS.work },
  { href: '#projects', label: 'Projects', glyph: GLYPHS.grid },
  { href: '#sprints', label: 'Writing', glyph: GLYPHS.pen },
  { href: '#contact', label: 'Contact', glyph: GLYPHS.mail },
]

const JOBS = [
  {
    org: 'Fernhill',
    role: 'Product Engineer',
    range: '2024 — Present',
    hue: 152,
    badge: 'Now',
    body: 'Lead the collaboration surface of a planning tool used by 60k teams. Shipped multiplayer cursors, offline drafts and a keyboard-first command layer; input latency on large boards fell from 180 ms to 40 ms.',
  },
  {
    org: 'Lanternfish',
    role: 'Founding Engineer',
    range: '2021 — 2024',
    hue: 28,
    body: 'First engineer at a seed-stage analytics start-up. Built the web app, the design system and the ingestion API, and hired the next five people. Acquired in 2024.',
  },
  {
    org: 'Pixelbarn',
    role: 'Front-end Developer',
    range: '2019 — 2021',
    hue: 265,
    body: 'Delivered marketing sites and product prototypes for a 12-person studio. Introduced component-driven workflow and cut hand-off rework by half.',
  },
]

const SCHOOLS = [
  { org: 'Halvard University', degree: 'B.Sc. Interaction Design & Computing', range: '2015 — 2019', hue: 205 },
  { org: 'Open Type Academy', degree: 'Certificate, Variable Type in Practice', range: '2022', hue: 340 },
]

const SKILLS = ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'WebGL', 'Swift', 'Design systems', 'Accessibility', 'Prototyping', 'Motion design']

type CoverKind = 'mesh' | 'rings' | 'bars' | 'grid' | 'wave' | 'blocks'
const PROJECTS: { name: string; date: string; blurb: string; tags: string[]; cover: CoverKind; hue: number }[] = [
  { name: 'Softlanding', date: 'Jan 2026', blurb: 'An onboarding checklist builder for SaaS teams. Drag steps, preview as a new user, ship without a deploy.', tags: ['React', 'tRPC', 'Postgres'], cover: 'mesh', hue: 0 },
  { name: 'Fieldnotes', date: 'Sep 2025', blurb: 'Voice memos that turn into structured documents, with speaker labels and action items you can edit.', tags: ['Swift', 'Whisper', 'CRDT'], cover: 'wave', hue: 16 },
  { name: 'Groove', date: 'Jun 2025', blurb: 'A browser step sequencer built on Web Audio. Sixteen steps, swing and shareable patterns in one URL.', tags: ['Web Audio', 'TypeScript'], cover: 'bars', hue: -18 },
  { name: 'Tidepool', date: 'Mar 2025', blurb: 'A habit tracker that asks for a five-minute weekly review instead of streaks and guilt.', tags: ['Next.js', 'SQLite'], cover: 'rings', hue: 30 },
  { name: 'Marginalia', date: 'Nov 2024', blurb: 'Reading highlights from e-ink devices, synced into a searchable notebook with backlinks.', tags: ['Rust', 'WASM'], cover: 'grid', hue: -30 },
  { name: 'Paperplane', date: 'Aug 2024', blurb: 'Weekly email digests for small teams. Pulls from your tools, writes in your voice, sends on Friday.', tags: ['Node.js', 'MJML'], cover: 'blocks', hue: 8 },
]

const SPRINTS = [
  { title: 'Northwind Hack 2025', place: 'Bergen, Norway', range: 'Oct 2025', body: 'Placed first with Softlanding’s prototype: a checklist that rewrites itself from support tickets.' },
  { title: 'Tidewater Jam', place: 'Online', range: 'Apr 2025', body: 'Built Groove in 48 hours; it now has 9k weekly players and no marketing budget.' },
  { title: 'Front-of-Front conference', place: 'Lisbon, Portugal', range: 'Feb 2025', body: 'Talk: “Latency budgets for humans” on making collaborative UI feel instant.' },
]

// ---------------------------------------------------------------------------
// 区块
// ---------------------------------------------------------------------------

function Monogram({ name, hue, size = 'md' }: { name: string; hue: number; size?: 'md' | 'lg' }) {
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-full font-(family-name:--font-head) font-semibold text-white shadow ring-2 ring-(--line)', size === 'lg' ? 'size-32 text-4xl' : 'size-10 text-sm md:size-11')}
      style={{ background: `linear-gradient(140deg, oklch(0.72 0.16 ${hue}), oklch(0.5 0.17 ${(hue + 40) % 360}))` }}
    >
      {name
        .split(/\s+/)
        .map((word) => word[0])
        .join('')
        .slice(0, 2)}
    </span>
  )
}

function Hero({ name, headline, animate }: { name: string; headline: string; animate: boolean }) {
  return (
    <section id="top" className="flex flex-col-reverse gap-6 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-3">
        <BlurWords as="h1" on={animate} text={`Hi, I’m ${name.split(' ')[0]}`} className="font-(family-name:--font-head) text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl" />
        <BlurWords on={animate} delay={0.1} text={headline} className="max-w-[34rem] text-lg text-pretty text-(--mut) md:text-xl" />
        <motion.div
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-(--line) bg-(--card) py-1 pr-3 pl-2.5 text-xs text-(--mut)"
        >
          <span className="size-1.5 rounded-full bg-(--accent)" />
          Currently at Fernhill · Stockholm, UTC+1
        </motion.div>
      </div>
      <motion.div initial={animate ? { opacity: 0, scale: 0.94 } : false} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <div className="relative w-fit rounded-full ring-4 ring-(--ring)">
          <Monogram name={name} hue={28} size="lg" />
          <span className="absolute right-1.5 bottom-1.5 size-5 rounded-full border-4 border-(--bg) bg-(--accent)" title="Available" />
        </div>
      </motion.div>
    </section>
  )
}

function Heading({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div>
      <h2 className="font-(family-name:--font-head) text-xl font-bold tracking-tight">{children}</h2>
      {sub && <p className="mt-1 text-sm text-(--mut)">{sub}</p>}
    </div>
  )
}

function ResumeRow({ org, title, range, hue, body, badge, defaultOpen }: { org: string; title: string; range: string; hue: number; body?: string; badge?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  const reduce = useReducedMotion()
  const expandable = Boolean(body)
  return (
    <div
      role={expandable ? 'button' : undefined}
      tabIndex={expandable ? 0 : undefined}
      aria-expanded={expandable ? open : undefined}
      onClick={() => expandable && setOpen((v) => !v)}
      onKeyDown={(event) => {
        if (expandable && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          setOpen((v) => !v)
        }
      }}
      className={cn('group -mx-3 block rounded-(--r) px-3 py-3 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--accent)', expandable && 'cursor-pointer hover:bg-(--card)')}
    >
      <div className="flex items-center gap-x-3">
        <Monogram name={org} hue={hue} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-(family-name:--font-head) text-[15px] font-semibold leading-none">
            {org}
            {badge && (
              <span className="rounded-full bg-(--accent) px-2 py-0.5 text-[10px] font-medium tracking-wide text-(--on-accent) uppercase">{badge}</span>
            )}
            {expandable && (
              <Icon className={cn('size-3.5 text-(--mut) transition-transform duration-200', open ? 'rotate-90' : 'opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100')}>{GLYPHS.chevron}</Icon>
            )}
          </div>
          <p className="mt-1 text-sm text-(--mut)">{title}</p>
        </div>
        <p className="text-right text-xs tabular-nums text-(--mut)">{range}</p>
      </div>
      {expandable && (
        <motion.div
          initial={false}
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <p className="pt-3 pl-[52px] text-sm leading-relaxed text-(--mut)">{body}</p>
        </motion.div>
      )}
    </div>
  )
}

function Cover({ kind, hue, id }: { kind: CoverKind; hue: number; id: number }) {
  const a = `color-mix(in oklab, var(--accent) 85%, white)`
  return (
    <div className="relative h-44 w-full overflow-hidden" aria-hidden style={{ background: `linear-gradient(${130 + hue}deg, color-mix(in oklab, var(--accent) 92%, black), color-mix(in oklab, var(--accent) 55%, oklch(0.62 0.16 ${(hue + 320) % 360})))`, filter: `hue-rotate(${hue}deg)` }}>
      <svg viewBox="0 0 400 176" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        {kind === 'mesh' && (
          <>
            <defs>
              <radialGradient id={`m${id}a`} cx="25%" cy="30%"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
              <radialGradient id={`m${id}b`} cx="78%" cy="75%"><stop offset="0" stopColor="#000" stopOpacity=".45" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
            </defs>
            <rect width="400" height="176" fill={`url(#m${id}a)`} />
            <rect width="400" height="176" fill={`url(#m${id}b)`} />
            <rect x="120" y="52" width="160" height="72" rx="12" fill="#fff" fillOpacity=".92" />
            <rect x="136" y="70" width="70" height="8" rx="4" fill={a} />
            <rect x="136" y="88" width="110" height="6" rx="3" fill="#000" fillOpacity=".12" />
            <rect x="136" y="100" width="90" height="6" rx="3" fill="#000" fillOpacity=".12" />
          </>
        )}
        {kind === 'rings' && [20, 42, 66, 92, 120].map((r) => <circle key={r} cx="290" cy="88" r={r} fill="none" stroke="#fff" strokeOpacity={0.15 + r / 400} />)}
        {kind === 'bars' &&
          Array.from({ length: 16 }, (_, i) => {
            const h = 30 + ((i * 37) % 90)
            return <rect key={i} x={28 + i * 22} y={150 - h} width="12" height={h} rx="6" fill="#fff" fillOpacity={0.35 + (i % 4) * 0.15} />
          })}
        {kind === 'grid' &&
          Array.from({ length: 5 }, (_, r) =>
            Array.from({ length: 12 }, (_, c) => <circle key={`${r}-${c}`} cx={40 + c * 30} cy={28 + r * 30} r={(r + c) % 5 === 0 ? 5 : 2.2} fill="#fff" fillOpacity={(r + c) % 5 === 0 ? 0.95 : 0.4} />),
          )}
        {kind === 'wave' && [0, 1, 2, 3].map((i) => <path key={i} d={`M0 ${90 + i * 8} C 80 ${30 + i * 10}, 140 ${150 - i * 6}, 220 ${88 + i * 4} S 360 ${40 + i * 12}, 400 ${80 + i * 6}`} fill="none" stroke="#fff" strokeOpacity={0.9 - i * 0.2} strokeWidth="2" />)}
        {kind === 'blocks' && (
          <>
            <rect x="60" y="40" width="110" height="100" rx="14" fill="#fff" fillOpacity=".9" />
            <rect x="184" y="40" width="70" height="46" rx="14" fill="#fff" fillOpacity=".55" />
            <rect x="184" y="96" width="156" height="44" rx="14" fill="#000" fillOpacity=".25" />
            <rect x="268" y="40" width="72" height="46" rx="14" fill="#fff" fillOpacity=".35" />
          </>
        )}
      </svg>
    </div>
  )
}

function ProjectCard({ project, index }: { project: (typeof PROJECTS)[number]; index: number }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-(--r) border border-(--line) bg-(--card) transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-(--shadow)">
      <Cover kind={project.cover} hue={project.hue} id={index} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-(family-name:--font-head) text-base font-semibold tracking-tight">{project.name}</h3>
          <time className="text-xs text-(--mut)">{project.date}</time>
        </div>
        <p className="text-sm leading-relaxed text-pretty text-(--mut)">{project.blurb}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-(--fg)/[0.06] px-2 py-1 text-[11px] font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-2 border-t border-(--line) px-5 py-3">
        <a href="#projects" className="inline-flex items-center gap-1.5 rounded-md bg-(--fg) px-2.5 py-1.5 text-[11px] font-medium text-(--bg) transition-opacity hover:opacity-80">
          <Icon className="size-3">{GLYPHS.globe}</Icon>
          Website
        </a>
        <a href="#projects" className="inline-flex items-center gap-1.5 rounded-md bg-(--fg) px-2.5 py-1.5 text-[11px] font-medium text-(--bg) transition-opacity hover:opacity-80">
          <Icon className="size-3">{GLYPHS.code}</Icon>
          Source
        </a>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// 放大坞（沿用 magicui 的按距离放大逻辑，图标为通用线条图标）
// ---------------------------------------------------------------------------

function DockItem({ mouseX, label, href, children, onClick }: { mouseX: MotionValue<number>; label: string; href?: string; children: ReactNode; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return value - bounds.x - bounds.width / 2
  })
  const size = useSpring(useTransform(distance, [-130, 0, 130], [40, 66, 40]), { stiffness: 320, damping: 22, mass: 0.15 })
  const inner = (
    <>
      <span className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 rounded-lg bg-(--fg) px-3 py-1.5 text-xs font-medium whitespace-nowrap text-(--bg) opacity-0 shadow-lg transition-opacity duration-150 group-hover/dock:opacity-100">
        {label}
      </span>
      <span className="grid size-full place-items-center rounded-full border border-(--line) bg-(--bg) p-[22%] text-(--mut) transition-colors group-hover/dock:bg-(--card) group-hover/dock:text-(--fg)">{children}</span>
    </>
  )
  return (
    <motion.div ref={ref} style={{ width: size, height: size }} className="group/dock relative aspect-square">
      {href ? (
        <a href={href} aria-label={label} className="block size-full">
          {inner}
        </a>
      ) : (
        <button type="button" aria-label={label} onClick={onClick} className="block size-full">
          {inner}
        </button>
      )}
    </motion.div>
  )
}

function FloatingDock({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const mouseX = useMotionValue(Infinity)
  const reduce = useReducedMotion()
  return (
    <div className="pointer-events-none sticky bottom-4 z-30 h-0">
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-3">
        <motion.div
          onPointerMove={(event) => !reduce && mouseX.set(event.clientX)}
          onPointerLeave={() => mouseX.set(Infinity)}
          role="toolbar"
          aria-label="Site navigation"
          className="pointer-events-auto flex h-14 items-end gap-1.5 rounded-full border border-(--line) bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] p-2 shadow-(--shadow) backdrop-blur-2xl"
        >
          {DOCK_LINKS.map((link) => (
            <DockItem key={link.label} mouseX={mouseX} label={link.label} href={link.href}>
              <Icon className="size-full">{link.glyph}</Icon>
            </DockItem>
          ))}
          <span className="mx-1 mb-[10px] h-6 w-px self-end bg-(--line)" />
          <DockItem mouseX={mouseX} label={dark ? 'Light mode' : 'Dark mode'} onClick={onToggle}>
            <Icon className="size-full">{dark ? GLYPHS.sun : GLYPHS.moon}</Icon>
          </DockItem>
        </motion.div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export function DockfolioSite({ className, style, ...props }: DockfolioSiteProps) {
  const options = { ...defaults, ...props }
  const reduce = useReducedMotion()
  const animate = options.animate && !reduce
  const [dark, setDark] = useState(options.dark)
  useEffect(() => setDark(options.dark), [options.dark])

  return (
    <div className={cn('relative min-h-full w-full overflow-x-clip antialiased', className)} style={{ ...themeVars(dark, options.accent, options.radius, options.fontPair), ...style }}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px] [mask-image:linear-gradient(to_bottom,black,transparent)]" style={{ background: 'radial-gradient(600px 300px at 50% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)' }} />
      <main className="relative mx-auto flex w-full max-w-2xl flex-col gap-14 px-6 pt-16 pb-40 sm:pt-24">
        <Hero name={options.name} headline={options.headline} animate={animate} />

        <section id="about" className="flex flex-col gap-4">
          <BlurFade on={animate}><Heading>About</Heading></BlurFade>
          <BlurFade on={animate} delay={0.05}>
            <p className="leading-relaxed text-pretty text-(--mut)">
              I began as a designer who kept opening the inspector, and ended up as an engineer who keeps opening the design file. Today I build product interfaces where speed, typography and small moments of motion carry as much weight as the feature list. I like small teams, long-lived codebases and people who write things down.
            </p>
          </BlurFade>
        </section>

        <section id="work" className="flex flex-col gap-3">
          <BlurFade on={animate}><Heading>Work Experience</Heading></BlurFade>
          <BlurFade on={animate} delay={0.05} className="flex flex-col">
            {JOBS.map((job, index) => (
              <ResumeRow key={job.org} org={job.org} title={job.role} range={job.range} hue={job.hue} body={job.body} badge={job.badge} defaultOpen={index === 0} />
            ))}
          </BlurFade>
        </section>

        <section id="education" className="flex flex-col gap-3">
          <BlurFade on={animate}><Heading>Education</Heading></BlurFade>
          <BlurFade on={animate} delay={0.05} className="flex flex-col">
            {SCHOOLS.map((school) => (
              <ResumeRow key={school.org} org={school.org} title={school.degree} range={school.range} hue={school.hue} />
            ))}
          </BlurFade>
        </section>

        <section id="skills" className="flex flex-col gap-4">
          <BlurFade on={animate}><Heading>Skills</Heading></BlurFade>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((skill, index) => (
              <BlurFade key={skill} on={animate} delay={index * 0.03}>
                <span className="flex h-8 items-center rounded-xl border border-(--line) bg-(--bg) px-4 text-sm font-medium ring-2 ring-(--ring)">{skill}</span>
              </BlurFade>
            ))}
          </div>
        </section>

        <section id="projects" className="flex flex-col gap-8">
          <BlurFade on={animate} className="flex flex-col items-center gap-3 text-center">
            <span className="rounded-lg bg-(--fg) px-3 py-1 text-sm font-medium text-(--bg)">My Projects</span>
            <h2 className="font-(family-name:--font-head) text-3xl font-bold tracking-tight sm:text-5xl">Things I made on weekends</h2>
            <p className="max-w-[34rem] text-pretty text-(--mut) md:text-lg">Six small products, each started to scratch one itch. Some grew into something real; all of them taught me something.</p>
          </BlurFade>
          <div className="grid gap-4 sm:grid-cols-2">
            {PROJECTS.map((project, index) => (
              <BlurFade key={project.name} on={animate} delay={(index % 2) * 0.06}>
                <ProjectCard project={project} index={index} />
              </BlurFade>
            ))}
          </div>
        </section>

        <section id="sprints" className="flex flex-col gap-8">
          <BlurFade on={animate} className="flex flex-col items-center gap-3 text-center">
            <span className="rounded-lg bg-(--fg) px-3 py-1 text-sm font-medium text-(--bg)">Sprints &amp; Talks</span>
            <h2 className="font-(family-name:--font-head) text-3xl font-bold tracking-tight sm:text-5xl">Building in public, briefly</h2>
          </BlurFade>
          <ol className="relative ml-4 border-l border-(--line)">
            {SPRINTS.map((item, index) => (
              <li key={item.title} className="mb-8 ml-6 last:mb-0">
                <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-(--accent) ring-4 ring-(--bg)" />
                <BlurFade on={animate} delay={index * 0.05}>
                  <time className="text-xs text-(--mut)">{item.range}</time>
                  <h3 className="mt-1 font-(family-name:--font-head) text-base font-semibold">{item.title}</h3>
                  <p className="text-sm text-(--mut)">{item.place}</p>
                  <p className="mt-2 text-sm leading-relaxed text-(--mut)">{item.body}</p>
                </BlurFade>
              </li>
            ))}
          </ol>
        </section>

        <section id="contact" className="pb-4">
          <BlurFade on={animate} className="flex flex-col items-center gap-4 text-center">
            <span className="rounded-lg bg-(--fg) px-3 py-1 text-sm font-medium text-(--bg)">Contact</span>
            <h2 className="font-(family-name:--font-head) text-3xl font-bold tracking-tight sm:text-5xl">Get in touch</h2>
            <p className="max-w-[34rem] text-pretty text-(--mut) md:text-lg">
              Want to chat about a product, a prototype or a job? Write to{' '}
              <a href="mailto:hello@example.com" className="font-medium text-(--fg) underline decoration-(--accent) decoration-2 underline-offset-4">
                hello@example.com
              </a>{' '}
              and I will answer within two days.
            </p>
          </BlurFade>
        </section>
        <p className="text-center text-xs text-(--mut)">&copy; 2026 {options.name}. Built with React, Tailwind and motion.</p>
      </main>
      <FloatingDock dark={dark} onToggle={() => setDark((v) => !v)} />
    </div>
  )
}
