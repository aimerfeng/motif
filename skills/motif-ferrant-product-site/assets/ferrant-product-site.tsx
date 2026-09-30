// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Emil Gulamov
// Source: https://github.com/mearashadowfax/ScrewFast/blob/aa9da9a/src/views/HomeView.astro
// Modified by Motif; see the item's provenance.
import { AnimatePresence, animate as animateValue, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'

/* @motif:defaults */
export const defaults = {
  name: 'Ferrant',
  headline: 'Cordless tools built for the ninth hour of the day.',
  accent: '#ee7a14',
  fontPair: 'industrial',
  radius: 16,
  dark: false,
  animate: true,
}
/* @motif:end */

export type FerrantProductSiteProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

// ---------------------------------------------------------------------------
// 主题
// ---------------------------------------------------------------------------

const SANS = ', ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
const MONO = ', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

const FONT_PAIRS: Record<string, { head: string; body: string; mono: string; headWeight: number; headTrack: string }> = {
  industrial: { head: `'Archivo Black'${SANS}`, body: `'Inter Tight Variable'${SANS}`, mono: `'IBM Plex Mono'${MONO}`, headWeight: 400, headTrack: '-0.02em' },
  plex: { head: `'IBM Plex Sans Variable'${SANS}`, body: `'IBM Plex Sans Variable'${SANS}`, mono: `'IBM Plex Mono'${MONO}`, headWeight: 700, headTrack: '-0.03em' },
  jakarta: { head: `'Plus Jakarta Sans Variable'${SANS}`, body: `'Plus Jakarta Sans Variable'${SANS}`, mono: `'Geist Mono Variable'${MONO}`, headWeight: 800, headTrack: '-0.035em' },
  geist: { head: `'Geist Variable'${SANS}`, body: `'Geist Variable'${SANS}`, mono: `'Geist Mono Variable'${MONO}`, headWeight: 700, headTrack: '-0.04em' },
}

function readableOn(hex: string): string {
  const value = hex.replace('#', '').slice(0, 6)
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.3 ? '#141414' : '#ffffff'
}

function themeVars(dark: boolean, accent: string, radius: number, fontPair: string): CSSProperties {
  const fonts = FONT_PAIRS[fontPair] ?? FONT_PAIRS.industrial!
  const vars: Record<string, string> = dark
    ? {
        '--bg': '#0f0f0e',
        '--bg-2': '#161615',
        '--card': '#1b1b19',
        '--card-2': '#242421',
        '--fg': '#f5f4f0',
        '--soft': '#cfcdc5',
        '--mut': '#94928a',
        '--line': 'rgb(255 255 255 / 0.09)',
        '--line-2': 'rgb(255 255 255 / 0.16)',
        '--panel': `color-mix(in oklab, ${accent} 10%, #1b1b19)`,
      }
    : {
        '--bg': '#faf9f6',
        '--bg-2': '#f2f0ea',
        '--card': '#ffffff',
        '--card-2': '#f7f5f0',
        '--fg': '#171716',
        '--soft': '#3d3c38',
        '--mut': '#6e6c64',
        '--line': 'rgb(23 23 22 / 0.1)',
        '--line-2': 'rgb(23 23 22 / 0.18)',
        '--panel': `color-mix(in oklab, ${accent} 12%, #f2f0ea)`,
      }
  return {
    ...vars,
    '--accent': accent,
    '--accent-text': dark ? `color-mix(in oklab, ${accent} 80%, white)` : `color-mix(in oklab, ${accent} 78%, black)`,
    '--on-accent': readableOn(accent),
    '--r': `${radius}px`,
    '--font-head': fonts.head,
    '--font-body': fonts.body,
    '--font-mono': fonts.mono,
    '--head-weight': String(fonts.headWeight),
    '--head-track': fonts.headTrack,
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

const G = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  bolt: <path d="M13 3 5 13.500h6L10 21l8-10.500h-6z" />,
  battery: <><rect x="3" y="8" width="16" height="9" rx="2" /><path d="M21 11v3M7 11.500v2M11 11.500v2" /></>,
  shield: <path d="M12 3.500 19 6v5.500c0 4.200-2.800 7.200-7 9-4.200-1.800-7-4.800-7-9V6z" />,
  wrench: <path d="M14.500 6.500a4 4 0 0 0 4.800 4.800l-9.300 9.300a2.100 2.100 0 0 1-3-3L16.300 8.300A4 4 0 0 0 14.500 6.500z" />,
  gauge: <><path d="M4.500 17a8.500 8.500 0 1 1 15 0" /><path d="m12 13 3.500-4" /></>,
  signal: <path d="M5 18v-4M10 18v-8M15 18V7M20 18V4" />,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M5.600 18.400l2.100-2.100M16.300 7.700l2.100-2.100" /></>,
  drop: <path d="M12 3.500c3 3.700 5.500 6.500 5.500 9.500a5.500 5.500 0 0 1-11 0c0-3 2.500-5.800 5.500-9.500z" />,
}

const Star = () => (
  <svg viewBox="0 0 20 20" className="size-4 text-(--accent)" fill="currentColor" aria-hidden>
    <path d="m10 1.800 2.400 5 5.500.7-4 3.800 1 5.400L10 14.100 5.100 16.700l1-5.400-4-3.800 5.500-.7z" />
  </svg>
)

function Reveal({ children, delay = 0, on, className }: { children: ReactNode; delay?: number; on: boolean; className?: string }) {
  if (!on) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

const Container = ({ children, className, id }: { children: ReactNode; className?: string; id?: string }) => (
  <div id={id} className={cn('mx-auto w-full max-w-[1240px] px-5 sm:px-8', className)}>
    {children}
  </div>
)

const H = ({ children, className, as: Tag = 'h2' }: { children: ReactNode; className?: string; as?: 'h1' | 'h2' | 'h3' }) => (
  <Tag className={cn('font-(family-name:--font-head) [font-weight:var(--head-weight)] [letter-spacing:var(--head-track)] text-balance', className)}>{children}</Tag>
)

function SectionHead({ eyebrow, title, sub, center = true }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={cn('mb-14 max-w-2xl', center && 'mx-auto text-center')}>
      <p className="mb-4 inline-flex items-center gap-2 font-(family-name:--font-mono) text-xs font-medium tracking-[0.16em] text-(--accent-text) uppercase">
        <span className="h-px w-6 bg-(--accent)" />
        {eyebrow}
      </p>
      <H className="text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.05]">{title}</H>
      {sub && <p className="mt-5 text-lg leading-relaxed text-pretty text-(--mut)">{sub}</p>}
    </div>
  )
}

function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path d="M9 9h14v4.500H14.500v2.200H21v4.300h-6.500V24H9z" fill="var(--on-accent)" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// 产品插图（SVG 绘制，没有位图）
// ---------------------------------------------------------------------------

function Driver({ id = 'd' }: { id?: string }) {
  return (
    <svg viewBox="0 0 540 360" className="size-full" role="img" aria-label="Cordless impact driver, side view">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in oklab, var(--accent) 82%, white)" />
          <stop offset=".55" stopColor="var(--accent)" />
          <stop offset="1" stopColor="color-mix(in oklab, var(--accent) 65%, black)" />
        </linearGradient>
        <linearGradient id={`${id}-dark`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a3c" />
          <stop offset="1" stopColor="#1a1a1c" />
        </linearGradient>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f2f2" />
          <stop offset=".5" stopColor="#a9abb0" />
          <stop offset="1" stopColor="#5f6166" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor="#000" stopOpacity=".38" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="290" cy="336" rx="190" ry="14" fill={`url(#${id}-shadow)`} />
      {/* bit */}
      <rect x="10" y="151" width="60" height="9" rx="2" fill={`url(#${id}-steel)`} />
      <path d="M10 151h10v9H10z" fill="#5f6166" />
      {/* chuck + nose */}
      <rect x="64" y="132" width="52" height="46" rx="8" fill={`url(#${id}-steel)`} />
      <path d="M78 132v46M92 132v46M106 132v46" stroke="#4a4c50" strokeOpacity=".5" />
      <rect x="112" y="118" width="70" height="74" rx="14" fill={`url(#${id}-dark)`} />
      <circle cx="140" cy="112" r="4" fill="color-mix(in oklab, var(--accent) 60%, white)" />
      {/* motor housing */}
      <path d="M170 100h150c46 0 88 14 100 44 8 20 8 44 0 60-12 24-54 34-100 34H170a18 18 0 0 1-18-18v-102a18 18 0 0 1 18-18z" fill={`url(#${id}-body)`} />
      <path d="M170 100h150c46 0 88 14 100 44H152v-26a18 18 0 0 1 18-18z" fill="#fff" fillOpacity=".22" />
      <path d="M196 128h190" stroke="#000" strokeOpacity=".18" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={214 + i * 22} y="160" width="10" height="34" rx="5" fill="#000" fillOpacity=".22" />
      ))}
      <text x="372" y="182" fontSize="15" fontWeight="700" fill="var(--on-accent)" fillOpacity=".9" fontFamily="var(--font-mono)" textAnchor="end">
        FX-4
      </text>
      {/* handle */}
      <path d="M300 226h74l16 96a14 14 0 0 1-14 16h-58a14 14 0 0 1-14-16z" fill={`url(#${id}-dark)`} transform="translate(-6 -8)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${306 + i * 0} ${250 + i * 12}h${64 + i * 2}`} stroke="var(--accent)" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" transform="translate(-6 -8)" />
      ))}
      <rect x="252" y="212" width="26" height="40" rx="9" fill="#111" />
      {/* battery */}
      <rect x="248" y="298" width="200" height="38" rx="10" fill={`url(#${id}-dark)`} />
      <rect x="248" y="298" width="200" height="8" rx="4" fill="var(--accent)" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={272 + i * 18} y="316" width="12" height="8" rx="2" fill={i < 3 ? 'var(--accent)' : '#555'} />
      ))}
      <text x="426" y="326" fontSize="11" fontWeight="600" fill="#bbb" fontFamily="var(--font-mono)" textAnchor="end">
        5.0Ah
      </text>
    </svg>
  )
}

function Battery({ id = 'b' }: { id?: string }) {
  return (
    <svg viewBox="0 0 320 220" className="size-full" role="img" aria-label="Battery pack">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3b3d" />
          <stop offset="1" stopColor="#19191b" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="194" rx="110" ry="10" fill="#000" fillOpacity=".22" />
      <rect x="40" y="60" width="240" height="118" rx="18" fill={`url(#${id}-g)`} />
      <rect x="40" y="60" width="240" height="20" rx="10" fill="var(--accent)" />
      <rect x="112" y="34" width="96" height="30" rx="8" fill="#2a2a2c" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={70 + i * 34} y="118" width="24" height="28" rx="5" fill={i < 4 ? 'var(--accent)' : '#555'} fillOpacity={i < 4 ? 0.9 - i * 0.08 : 1} />
      ))}
      <text x="70" y="106" fontSize="12" fill="#aaa" fontFamily="var(--font-mono)">
        18V · 5.0Ah
      </text>
    </svg>
  )
}

function Saw({ id = 's' }: { id?: string }) {
  return (
    <svg viewBox="0 0 320 220" className="size-full" role="img" aria-label="Circular saw">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in oklab, var(--accent) 80%, white)" />
          <stop offset="1" stopColor="color-mix(in oklab, var(--accent) 70%, black)" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="196" rx="120" ry="9" fill="#000" fillOpacity=".2" />
      <circle cx="160" cy="118" r="80" fill="#c9cbd0" />
      {Array.from({ length: 24 }, (_, i) => (
        <path key={i} d="M160 30l5 11h-10z" fill="#c9cbd0" transform={`rotate(${i * 15} 160 118)`} />
      ))}
      <circle cx="160" cy="118" r="56" fill="none" stroke="#8b8e95" strokeDasharray="3 6" />
      <path d="M80 118a80 80 0 0 1 160 0v6H80z" fill={`url(#${id}-g)`} />
      <rect x="150" y="64" width="90" height="26" rx="13" fill="#232325" />
      <circle cx="160" cy="118" r="12" fill="#5c5e63" />
      <circle cx="160" cy="118" r="5" fill="#d8d8d8" />
    </svg>
  )
}

function Charger({ id = 'c' }: { id?: string }) {
  return (
    <svg viewBox="0 0 320 220" className="size-full" role="img" aria-label="Rapid charger">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3b3d" />
          <stop offset="1" stopColor="#19191b" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="192" rx="110" ry="9" fill="#000" fillOpacity=".2" />
      <path d="M50 170V100c0-14 10-24 24-24h172c14 0 24 10 24 24v70z" fill={`url(#${id}-g)`} />
      <rect x="86" y="60" width="148" height="30" rx="8" fill="#2c2c2e" />
      <rect x="106" y="44" width="108" height="20" rx="6" fill="#222" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={84 + i * 32} y="132" width="22" height="8" rx="4" fill={i < 3 ? 'var(--accent)' : '#4a4a4c'} />
      ))}
      <circle cx="238" cy="112" r="6" fill="var(--accent)" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// 内容
// ---------------------------------------------------------------------------

const NAV = [
  { href: '#products', label: 'Products' },
  { href: '#platform', label: 'Platform' },
  { href: '#care', label: 'Care plans' },
  { href: '#faq', label: 'Support' },
]

const CLIENTS: { name: string; cls: string; glyph: ReactNode }[] = [
  { name: 'Ironvale', cls: 'font-(family-name:--font-head) [font-weight:var(--head-weight)] text-xl tracking-tight', glyph: <path d="M4 20V8l8-4 8 4v12z" /> },
  { name: 'HARROWGATE', cls: 'font-(family-name:--font-mono) text-sm font-semibold tracking-[0.24em]', glyph: <><circle cx="12" cy="12" r="8" /><path d="M8 12h8" /></> },
  { name: 'Coldwater Build', cls: 'text-lg font-semibold italic', glyph: <path d="M4 16c3-6 5-6 8 0s5 6 8 0" /> },
  { name: 'TRESTLE&CO', cls: 'text-base font-black tracking-tight', glyph: <path d="M3 20 12 4l9 16zM7 14h10" /> },
  { name: 'Kilnworth', cls: 'font-(family-name:--font-head) [font-weight:var(--head-weight)] text-xl lowercase tracking-tight', glyph: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 9l6 6M15 9l-6 6" /></> },
  { name: 'Marrowfield', cls: 'text-lg font-medium tracking-wide', glyph: <path d="M12 3v18M5 8l7 4 7-4M5 16l7-4 7 4" /> },
]

const PLATFORM = [
  { title: 'Brushless, and quiet about it', body: 'A 42 mm brushless motor delivers 220 Nm without the whine, and runs 30 percent cooler than our previous generation.', icon: G.gear },
  { title: 'Tool-free bit changes', body: 'A one-hand collar swaps any hex bit in under two seconds, even with gloves on.', icon: G.wrench },
  { title: 'Drop-tested from 3 metres', body: 'Every housing survives 60 drops onto concrete before it leaves the line. We publish the test logs.', icon: G.shield },
  { title: 'One battery, 41 tools', body: 'The 18V Ferrant pack fits the whole range, and reports its health to the app before it fails on site.', icon: G.battery },
]

const TABS = [
  { id: 'power', label: 'Power', icon: G.bolt, heading: 'Torque that holds at the end of a shift', body: 'Electronic clutch control keeps output within 3 percent from a full pack to the last bar, so the fortieth deck screw is as clean as the first.', points: ['220 Nm peak, 4 selectable modes', 'Auto-stop when the fastener seats', 'Thermal guard, no derating below 60 °C'], viz: 'power' },
  { id: 'endurance', label: 'Endurance', icon: G.battery, heading: 'A full day on two packs', body: 'The 5.0 Ah pack is built from cells we rate at 1,500 cycles, and the charger brings it to 80 percent in 32 minutes. Swap on the way to the next room.', points: ['32 min to 80 percent', '1,500 cycle cell rating', 'Cold-weather chemistry to −20 °C'], viz: 'endurance' },
  { id: 'control', label: 'Control', icon: G.gauge, heading: 'Set it once, for the whole crew', body: 'Pair tools with the Ferrant app to lock torque presets, log every fastening for the punch list, and see which packs need service before they fail.', points: ['Torque presets per job', 'Fastening log exports to CSV', 'Tool-lock if a case goes missing'], viz: 'control' },
]

const STATS = [
  { to: 220, unit: 'Nm', label: 'peak torque, verified by an independent lab' },
  { to: 32, unit: 'min', label: 'to charge a 5.0 Ah pack to 80 percent' },
  { to: 3, unit: 'm', label: 'drop test onto concrete, 60 times over' },
  { to: 5, unit: 'yr', label: 'warranty on every tool and battery' },
]

const PRODUCTS = [
  { name: 'FX-4 Impact Driver', spec: '220 Nm · 1.2 kg', price: '$229', art: 'driver', tag: 'New' },
  { name: 'FS-7 Circular Saw', spec: '184 mm · 5,800 rpm', price: '$279', art: 'saw' },
  { name: 'FB-50 Battery', spec: '18V · 5.0 Ah', price: '$99', art: 'battery' },
  { name: 'FC-2 Rapid Charger', spec: '80% in 32 min', price: '$79', art: 'charger' },
] as const

const QUOTES = [
  { quote: 'We moved a forty-person framing crew to Ferrant in one winter. Battery swaps stopped being an argument and rework on loose screws basically disappeared.', name: 'Dana Whitlock', role: 'Site Manager, Ironvale', hue: 45 },
  { quote: 'The app shows me which tools are on which site. The first month it found six drivers in a van that had been sold. Paid for itself before the trial ended.', name: 'Tomasz Reyes', role: 'Operations Lead, Coldwater Build', hue: 200 },
  { quote: 'I have dropped the saw off a second-storey deck twice. It has a dent and cuts as straight as it did in the box.', name: 'Priya Nandakumar', role: 'Owner, Kilnworth Carpentry', hue: 320 },
]

const PLANS = [
  { name: 'Solo', price: '$29', unit: '/ month', blurb: 'For one tradesperson and a small kit.', features: ['Up to 8 tools registered', '5-year warranty, no paperwork', 'Free battery health checks', 'Email support in one day'], featured: false },
  { name: 'Crew', price: '$89', unit: '/ month', blurb: 'For crews that share tools between sites.', features: ['Up to 40 tools registered', 'Torque presets and fastening logs', 'Loaner tool within 24 hours', 'Phone support 7am to 7pm', 'Tool-lock and location history'], featured: true },
  { name: 'Site', price: '$240', unit: '/ month', blurb: 'For contractors running several projects.', features: ['Unlimited tools and users', 'Fleet dashboard and CSV export', 'On-site service twice a year', 'Named account manager'], featured: false },
]

const FAQS = [
  { q: 'Do the batteries fit my existing tools?', a: 'The 18V Ferrant pack fits all 41 Ferrant tools. An adapter for two popular third-party platforms is on the roadmap; we will announce dates on the Support page.' },
  { q: 'What does the five-year warranty cover?', a: 'Manufacturing defects and normal wear on tools and batteries, including the motor and the drivetrain. Drops are covered too; we call that the site clause.' },
  { q: 'Can I try a tool before I buy the kit?', a: 'Yes. Book a demo day at any of our 62 partner depots and use the full range on real material for a morning.' },
  { q: 'How does fleet tracking work?', a: 'Each tool has a low-energy radio that reports to the app through any phone on site. Nothing is tracked outside your registered job sites.' },
  { q: 'Do you ship outside the EU and UK?', a: 'Currently to the EU, UK, Norway and Switzerland. North America opens in spring, with a local service centre in Ohio.' },
]

const FOOTER_LINKS = [
  { title: 'Products', links: ['Drivers', 'Saws', 'Batteries', 'Chargers', 'Accessories'] },
  { title: 'Company', links: ['About', 'Careers', 'Press', 'Sustainability'] },
  { title: 'Support', links: ['Service centres', 'Warranty', 'Manuals', 'Contact'] },
]

// ---------------------------------------------------------------------------
// 区块
// ---------------------------------------------------------------------------

function Banner({ name }: { name: string }) {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return (
    <div className="relative bg-(--fg) text-(--bg)">
      <Container className="flex items-center justify-center gap-3 py-2.5 pr-12 text-center text-[13px] sm:text-sm">
        <span className="rounded-full bg-(--accent) px-2 py-0.5 text-[10px] font-bold tracking-wider text-(--on-accent) uppercase">New</span>
        <a href="#products" className="hover:underline">
          The {name} FX-4 Impact Driver ships in October
          <span className="ml-1.5 hidden sm:inline">— reserve yours</span>
        </a>
      </Container>
      <button type="button" onClick={() => setOpen(false)} aria-label="Dismiss announcement" className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full opacity-70 hover:opacity-100 sm:right-6">
        <Icon className="size-4">{G.close}</Icon>
      </button>
    </div>
  )
}

function Navbar({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-(--line) bg-[color-mix(in_oklab,var(--bg)_86%,transparent)] backdrop-blur-xl">
      <Container className="flex h-[68px] items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="font-(family-name:--font-head) text-xl [font-weight:var(--head-weight)] tracking-tight uppercase">{name}</span>
        </a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="rounded-lg px-3.5 py-2 text-sm font-medium text-(--soft) transition-colors hover:bg-(--bg-2) hover:text-(--fg)">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#quote" className="hidden h-10 items-center rounded-(--r) bg-(--accent) px-5 text-sm font-semibold text-(--on-accent) transition-[transform,filter] hover:-translate-y-px hover:brightness-105 sm:inline-flex">
            Get a quote
          </a>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle menu" className="grid size-10 place-items-center rounded-lg border border-(--line) md:hidden">
            <Icon>{open ? G.close : G.menu}</Icon>
          </button>
        </div>
      </Container>
      {open && (
        <nav className="border-t border-(--line) px-5 py-3 md:hidden" aria-label="Mobile">
          {[...NAV, { href: '#quote', label: 'Get a quote' }].map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium text-(--soft) hover:bg-(--bg-2)">
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

function Hero({ headline, animate }: { headline: string; animate: boolean }) {
  const enter = (delay: number) => (animate ? { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const } } : {})
  const avatars = [
    ['DW', 45],
    ['TR', 200],
    ['PN', 320],
    ['JO', 130],
  ] as const
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 800px 500px at 85% 20%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)' }} />
      <svg aria-hidden className="absolute inset-0 -z-10 size-full [mask-image:linear-gradient(to_bottom,black,transparent_85%)]">
        <defs>
          <pattern id="fp-hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 0v14" stroke="var(--line)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fp-hatch)" opacity="0.6" />
      </svg>
      <Container className="grid items-center gap-12 py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:py-20">
        <div>
          <motion.p {...enter(0)} className="mb-5 inline-flex items-center gap-2 font-(family-name:--font-mono) text-xs font-medium tracking-[0.16em] text-(--accent-text) uppercase">
            <span className="size-2 rounded-full bg-(--accent)" />
            Professional cordless tools
          </motion.p>
          <motion.div {...enter(0.04)}>
            <H as="h1" className="text-[clamp(2.4rem,4.7vw,4rem)] leading-[1.04]">
              {headline}
            </H>
          </motion.div>
          <motion.p {...enter(0.08)} className="mt-6 max-w-lg text-lg leading-relaxed text-pretty text-(--mut)">
            Brushless drivers, saws and one battery that fits them all. Engineered with framers, electricians and roofers, and covered for five years, drops included.
          </motion.p>
          <motion.div {...enter(0.12)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#products" className="inline-flex h-13 items-center justify-center gap-2 rounded-(--r) bg-(--accent) px-7 text-[15px] font-semibold text-(--on-accent) shadow-[0_12px_30px_-12px_var(--accent)] transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-105">
              Browse products
              <Icon className="size-4">{G.arrow}</Icon>
            </a>
            <a href="#quote" className="inline-flex h-13 items-center justify-center rounded-(--r) border border-(--line-2) bg-(--card) px-7 text-[15px] font-semibold transition-colors hover:bg-(--bg-2)">
              Talk to sales
            </a>
          </motion.div>
          <motion.div {...enter(0.16)} className="mt-9 flex items-center gap-4">
            <div className="flex -space-x-1.5">
              {avatars.map(([initials, hue]) => (
                <span key={initials} className="grid size-10 place-items-center rounded-full text-xs font-semibold text-white ring-2 ring-(--bg)" style={{ background: `linear-gradient(140deg, oklch(0.72 0.14 ${hue}), oklch(0.48 0.15 ${hue + 30}))` }}>
                  {initials}
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1" aria-label="Rated 4.8 out of 5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} />
                ))}
                <span className="ml-1.5 text-sm font-semibold">4.8</span>
              </div>
              <p className="text-sm text-(--mut)">from 1,240 verified site reviews</p>
            </div>
          </motion.div>
        </div>
        <motion.div {...enter(0.1)} className="relative">
          <div className="relative aspect-[6/5] overflow-hidden rounded-[calc(var(--r)*1.6)] border border-(--line) bg-(--panel)">
            <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 45%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 75%)' }} />
            <svg aria-hidden className="absolute inset-0 size-full opacity-60">
              <defs>
                <pattern id="fp-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.1" fill="var(--line-2)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#fp-dots)" />
            </svg>
            <motion.div className="absolute inset-[7%]" initial={{ rotate: -1 }} animate={animate ? { y: [0, -8, 0], rotate: [-1.5, -0.5, -1.5] } : { y: 0, rotate: -1 }} transition={animate ? { duration: 7, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}>
              <Driver id="hero" />
            </motion.div>
            {[
              { label: 'Peak torque', value: '220 Nm', pos: 'left-4 top-5 sm:left-6 sm:top-6' },
              { label: 'Weight', value: '1.2 kg', pos: 'right-4 top-[38%] sm:right-6' },
              { label: 'Charge to 80%', value: '32 min', pos: 'bottom-5 left-4 sm:bottom-6 sm:left-6' },
            ].map((chip, i) => (
              <motion.div
                key={chip.label}
                className={cn('absolute rounded-xl border border-(--line-2) bg-[color-mix(in_oklab,var(--card)_88%,transparent)] px-3.5 py-2.5 shadow-lg backdrop-blur', chip.pos)}
                animate={animate ? { y: [0, i % 2 ? 6 : -6, 0] } : { y: 0 }}
                transition={animate ? { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
              >
                <p className="font-(family-name:--font-mono) text-[10px] tracking-wider text-(--mut) uppercase">{chip.label}</p>
                <p className="font-(family-name:--font-head) text-lg [font-weight:var(--head-weight)] tracking-tight">{chip.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  )
}

function Clients({ animate }: { animate: boolean }) {
  return (
    <section aria-label="Clients" className="border-y border-(--line) bg-(--bg-2)">
      <Container className="py-12">
        <Reveal on={animate}>
          <p className="mb-8 text-center text-sm text-(--mut)">Trusted on more than 4,000 active job sites</p>
          <ul className="grid grid-cols-2 items-center gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {CLIENTS.map((client) => (
              <li key={client.name} className="flex items-center justify-center gap-2 text-(--mut) transition-colors hover:text-(--fg)">
                <Icon className="size-6">{client.glyph}</Icon>
                <span className={client.cls}>{client.name}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  )
}

function Platform({ animate }: { animate: boolean }) {
  return (
    <section id="platform" className="scroll-mt-20 py-24 sm:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <Reveal on={animate}>
          <div className="relative aspect-square overflow-hidden rounded-[calc(var(--r)*1.6)] border border-(--line) bg-(--panel) sm:aspect-[5/4]">
            <div aria-hidden className="absolute -right-10 -bottom-10 size-[70%] rounded-full bg-(--accent)/25 blur-3xl" />
            <div className="absolute inset-[9%] grid grid-cols-2 grid-rows-[1.1fr_1fr] gap-4">
              <div className="col-span-2 rounded-2xl border border-(--line) bg-(--card) p-5">
                <p className="font-(family-name:--font-mono) text-[10px] tracking-wider text-(--mut) uppercase">Pack health</p>
                <div className="mt-3 flex items-end gap-1.5">
                  {[62, 74, 68, 82, 90, 78, 94, 88, 100].map((h, i) => (
                    <span key={i} className="flex-1 rounded-sm" style={{ height: `${h * 0.6}px`, background: i === 8 ? 'var(--accent)' : 'color-mix(in oklab, var(--accent) 35%, transparent)' }} />
                  ))}
                </div>
              </div>
              <div className="grid place-items-center rounded-2xl border border-(--line) bg-(--card) p-4">
                <div className="w-4/5">
                  <Battery id="plat" />
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-2xl bg-(--accent) p-5 text-(--on-accent)">
                <Icon className="size-7">{G.bolt}</Icon>
                <div>
                  <p className="font-(family-name:--font-head) text-3xl [font-weight:var(--head-weight)] tracking-tight">98%</p>
                  <p className="text-xs opacity-80">cell health, pack #4</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        <div>
          <SectionHead center={false} eyebrow="Platform" title="One battery, one motor, and no weak link" sub="Every Ferrant tool shares the same drivetrain and pack, so parts, chargers and knowledge carry across the whole range." />
          <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {PLATFORM.map((item, index) => (
              <Reveal key={item.title} on={animate} delay={index * 0.06}>
                <div>
                  <dt className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-(--accent)/15 text-(--accent-text)">
                      <Icon>{item.icon}</Icon>
                    </span>
                    <span className="font-(family-name:--font-head) text-[17px] leading-snug [font-weight:var(--head-weight)] tracking-tight">{item.title}</span>
                  </dt>
                  <dd className="mt-3 text-[15px] leading-relaxed text-(--mut)">{item.body}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}

function TabViz({ kind }: { kind: string }) {
  if (kind === 'power')
    return (
      <div className="flex h-full flex-col justify-center gap-5 p-8">
        {[['Mode 1 · Drive', 62], ['Mode 2 · Fastening', 78], ['Mode 3 · Torque', 94], ['Mode 4 · Max', 100]].map(([label, value]) => (
          <div key={label}>
            <div className="mb-1.5 flex justify-between font-(family-name:--font-mono) text-xs text-(--mut)">
              <span>{label}</span>
              <span>{Math.round(Number(value) * 2.2)} Nm</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-(--line)">
              <div className="h-full rounded-full bg-(--accent)" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    )
  if (kind === 'endurance')
    return (
      <div className="flex h-full items-center justify-center p-8">
        <svg viewBox="0 0 320 180" className="w-full max-w-sm" aria-hidden>
          <path d="M20 150H300M20 110H300M20 70H300M20 30H300" stroke="var(--line)" />
          <path d="M20 40 C 90 42, 120 60, 170 96 S 260 140, 300 148" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
          <path d="M20 40 C 90 42, 120 60, 170 96 S 260 140, 300 148V150H20z" fill="var(--accent)" fillOpacity=".15" />
          <circle cx="170" cy="96" r="6" fill="var(--bg)" stroke="var(--accent)" strokeWidth="3" />
          <text x="182" y="88" fontSize="12" fill="var(--soft)" fontFamily="var(--font-mono)">80% · 32 min</text>
        </svg>
      </div>
    )
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-8">
      {[['Deck screws · 65 mm', '412 fastened', 'A-12'], ['Joist hangers', '96 fastened', 'A-12'], ['Ledger bolts', '38 fastened', 'B-03']].map(([what, count, zone]) => (
        <div key={what} className="flex items-center justify-between rounded-xl border border-(--line) bg-(--card) px-4 py-3">
          <div>
            <p className="text-sm font-semibold">{what}</p>
            <p className="font-(family-name:--font-mono) text-xs text-(--mut)">Zone {zone}</p>
          </div>
          <span className="rounded-full bg-(--accent)/15 px-3 py-1 font-(family-name:--font-mono) text-xs text-(--accent-text)">{count}</span>
        </div>
      ))}
    </div>
  )
}

function FeatureTabs({ animate }: { animate: boolean }) {
  const [active, setActive] = useState('power')
  const tab = TABS.find((t) => t.id === active)!
  const reduce = useReducedMotion()
  return (
    <section className="border-y border-(--line) bg-(--bg-2) py-24 sm:py-32">
      <Container>
        <SectionHead eyebrow="Built for the job" title="Three things tradespeople asked us to get right" />
        <Reveal on={animate}>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <div role="tablist" aria-label="Product strengths" className="flex flex-col gap-3">
              {TABS.map((item) => {
                const selected = item.id === active
                return (
                  <button
                    key={item.id}
                    role="tab"
                    id={`tab-${item.id}`}
                    aria-selected={selected}
                    aria-controls="tab-panel"
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={cn('flex gap-4 rounded-(--r) border p-5 text-left transition-[background-color,border-color,box-shadow] duration-200', selected ? 'border-(--accent) bg-(--card) shadow-[0_18px_40px_-24px_var(--accent)]' : 'border-(--line) hover:bg-(--card)/60')}
                  >
                    <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl transition-colors', selected ? 'bg-(--accent) text-(--on-accent)' : 'bg-(--bg) text-(--mut)')}>
                      <Icon>{item.icon}</Icon>
                    </span>
                    <span>
                      <span className="block font-(family-name:--font-head) text-lg [font-weight:var(--head-weight)] tracking-tight">{item.label}</span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-(--mut)">{item.heading}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="overflow-hidden rounded-[calc(var(--r)*1.4)] border border-(--line) bg-(--card)">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={tab.id} initial={reduce ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, x: -18 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="grid sm:grid-cols-2">
                  <div className="min-h-64 border-b border-(--line) bg-(--panel) sm:border-r sm:border-b-0">
                    <TabViz kind={tab.viz} />
                  </div>
                  <div className="p-7 sm:p-8">
                    <p className="text-[15px] leading-relaxed text-(--soft)">{tab.body}</p>
                    <ul className="mt-6 space-y-3">
                      {tab.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-[15px]">
                          <Icon className="mt-0.5 size-4.5 shrink-0 text-(--accent-text)">{G.check}</Icon>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

function Count({ to, on }: { to: number; on: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const value = useMotionValue(on ? 0 : to)
  const rounded = useTransform(value, (v) => Math.round(v).toString())
  useEffect(() => {
    if (!on || !inView) return
    const controls = animateValue(value, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [inView, on, to, value])
  return <motion.span ref={ref}>{rounded}</motion.span>
}

function Stats({ animate }: { animate: boolean }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <dl className="grid grid-cols-2 gap-y-12 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <div key={stat.label} className={cn('flex flex-col px-4 sm:px-8', index > 0 && 'lg:border-l lg:border-(--line)', index % 2 === 1 && 'border-l border-(--line) lg:border-l')}>
              <dd className="order-1 font-(family-name:--font-head) text-6xl [font-weight:var(--head-weight)] tracking-tight sm:text-7xl">
                <Count to={stat.to} on={animate} />
                <span className="ml-1.5 text-3xl text-(--accent)">{stat.unit}</span>
              </dd>
              <dt className="order-2 mt-3 max-w-[16rem] text-[15px] leading-snug text-(--mut)">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}

function ProductArt({ art, id }: { art: (typeof PRODUCTS)[number]['art']; id: string }) {
  if (art === 'driver') return <Driver id={id} />
  if (art === 'saw') return <Saw id={id} />
  if (art === 'battery') return <Battery id={id} />
  return <Charger id={id} />
}

function Products({ animate }: { animate: boolean }) {
  return (
    <section id="products" className="scroll-mt-20 border-t border-(--line) bg-(--bg-2) py-24 sm:py-32">
      <Container>
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="mb-4 inline-flex items-center gap-2 font-(family-name:--font-mono) text-xs font-medium tracking-[0.16em] text-(--accent-text) uppercase">
              <span className="h-px w-6 bg-(--accent)" />
              The range
            </p>
            <H className="text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.05]">Start with the tool you reach for most</H>
          </div>
          <a href="#quote" className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent-text) hover:underline">
            See all 41 tools
            <Icon className="size-4">{G.arrow}</Icon>
          </a>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product, index) => (
            <Reveal key={product.name} on={animate} delay={index * 0.06} className="h-full">
              <a href="#products" className="group flex h-full flex-col overflow-hidden rounded-(--r) border border-(--line) bg-(--card) transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgb(0_0_0/0.4)]">
                <div className="relative aspect-[4/3] bg-(--panel) p-5">
                  {'tag' in product && <span className="absolute top-4 left-4 rounded-full bg-(--accent) px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-(--on-accent) uppercase">{product.tag}</span>}
                  <div className="size-full transition-transform duration-500 group-hover:scale-105">
                    <ProductArt art={product.art} id={`p${index}`} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-(family-name:--font-head) text-lg leading-snug [font-weight:var(--head-weight)] tracking-tight">{product.name}</h3>
                  <p className="mt-1 font-(family-name:--font-mono) text-xs text-(--mut)">{product.spec}</p>
                  <div className="mt-auto flex items-center justify-between pt-5">
                    <span className="text-lg font-semibold">{product.price}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-(--accent-text)">
                      Details
                      <Icon className="size-4 transition-transform group-hover:translate-x-0.5">{G.arrow}</Icon>
                    </span>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Testimonials({ animate }: { animate: boolean }) {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHead eyebrow="From the job site" title="Crews that switched, and stayed" />
        <div className="grid gap-5 lg:grid-cols-3">
          {QUOTES.map((item, index) => (
            <Reveal key={item.name} on={animate} delay={index * 0.07} className="h-full">
              <figure className="flex h-full flex-col justify-between rounded-(--r) border border-(--line) bg-(--card) p-7">
                <div>
                  <div className="mb-5 flex gap-1" aria-hidden>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} />
                    ))}
                  </div>
                  <blockquote className="text-[17px] leading-relaxed text-pretty">&ldquo;{item.quote}&rdquo;</blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: `linear-gradient(140deg, oklch(0.72 0.14 ${item.hue}), oklch(0.48 0.15 ${item.hue + 30}))` }}>
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
    <section id="care" className="scroll-mt-20 border-t border-(--line) bg-(--bg-2) py-24 sm:py-32">
      <Container>
        <SectionHead eyebrow="Care plans" title="Keep every tool working, on every site" sub="Warranty, service and fleet tracking in one monthly plan. Cancel any month; the five-year tool warranty stays." />
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.name} on={animate} delay={index * 0.07} className="h-full">
              <article className={cn('relative flex h-full flex-col rounded-(--r) border p-8', plan.featured ? 'border-(--accent) bg-(--card) shadow-[0_30px_70px_-34px_var(--accent)]' : 'border-(--line) bg-(--card)')}>
                {plan.featured && <span className="absolute -top-3 left-8 rounded-full bg-(--accent) px-3 py-1 text-[11px] font-bold tracking-wider text-(--on-accent) uppercase">Most crews pick this</span>}
                <h3 className="font-(family-name:--font-head) text-xl [font-weight:var(--head-weight)] tracking-tight">{plan.name}</h3>
                <p className="mt-2 text-sm text-(--mut)">{plan.blurb}</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="font-(family-name:--font-head) text-5xl [font-weight:var(--head-weight)] tracking-tight">{plan.price}</span>
                  <span className="text-sm text-(--mut)">{plan.unit}</span>
                </p>
                <ul className="mt-7 flex-1 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-[15px] text-(--soft)">
                      <Icon className="mt-0.5 size-4.5 shrink-0 text-(--accent-text)">{G.check}</Icon>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href="#quote" className={cn('mt-8 inline-flex h-12 items-center justify-center rounded-(--r) text-[15px] font-semibold transition-[transform,filter,background-color] hover:-translate-y-0.5', plan.featured ? 'bg-(--accent) text-(--on-accent) hover:brightness-105' : 'border border-(--line-2) hover:bg-(--bg-2)')}>
                  Choose {plan.name}
                </a>
              </article>
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
    <section id="faq" className="scroll-mt-20 py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 font-(family-name:--font-mono) text-xs font-medium tracking-[0.16em] text-(--accent-text) uppercase">
            <span className="h-px w-6 bg-(--accent)" />
            Support
          </p>
          <H className="text-[clamp(2rem,4vw,3rem)] leading-[1.05]">Answers before you ask</H>
          <p className="mt-5 max-w-sm text-(--mut)">Still stuck? Our service team answers the phone from 7am to 7pm, Monday to Saturday.</p>
        </div>
        <Reveal on={animate}>
          <div className="divide-y divide-(--line) rounded-(--r) border border-(--line) bg-(--card)">
            {FAQS.map((item, index) => {
              const isOpen = open === index
              return (
                <div key={item.q}>
                  <button type="button" onClick={() => setOpen(isOpen ? null : index)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left">
                    <span className="text-[17px] font-semibold tracking-tight">{item.q}</span>
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
    <section id="quote" className="scroll-mt-20 px-3 pb-20 sm:px-5 sm:pb-28">
      <Reveal on={animate}>
        <div className="relative isolate mx-auto max-w-[1240px] overflow-hidden rounded-[calc(var(--r)*1.6)] bg-(--accent) px-6 py-16 text-(--on-accent) sm:px-14 sm:py-20">
          <svg aria-hidden className="absolute inset-0 -z-10 size-full opacity-25">
            <defs>
              <pattern id="fp-cta" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M0 0v16" stroke="currentColor" strokeOpacity=".5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#fp-cta)" />
          </svg>
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <H className="text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.02]">Outfit your crew before the next job starts</H>
              <p className="mt-5 max-w-lg text-lg opacity-85">Tell us how many people and how many sites. A {name} specialist sends a fitted quote within one working day.</p>
            </div>
            <form onSubmit={(event) => event.preventDefault()} className="rounded-2xl bg-[color-mix(in_oklab,var(--on-accent)_12%,transparent)] p-5 backdrop-blur-sm">
              <label htmlFor="fp-email" className="text-sm font-semibold">
                Work email
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input id="fp-email" type="email" placeholder="you@company.com" className="h-12 min-w-0 flex-1 rounded-(--r) border-0 bg-white px-4 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-neutral-900" />
                <button type="submit" className="h-12 rounded-(--r) bg-neutral-950 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800">
                  Get a quote
                </button>
              </div>
              <p className="mt-3 text-xs opacity-75">No sales calls unless you ask for one.</p>
            </form>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-(--line) bg-(--bg-2)">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <a href="#top" className="flex items-center gap-2.5">
            <LogoMark size={34} />
            <span className="font-(family-name:--font-head) text-xl [font-weight:var(--head-weight)] tracking-tight uppercase">{name}</span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-(--mut)">Professional cordless tools, designed in Gothenburg and assembled in Poland. Serviced in 62 depots across Europe.</p>
        </div>
        {FOOTER_LINKS.map((column) => (
          <div key={column.title}>
            <h3 className="font-(family-name:--font-mono) text-xs font-medium tracking-[0.16em] text-(--mut) uppercase">{column.title}</h3>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#top" className="text-sm text-(--soft) transition-colors hover:text-(--accent-text)">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="flex flex-col justify-between gap-2 border-t border-(--line) py-6 text-xs text-(--mut) sm:flex-row">
        <p>&copy; 2026 {name} Tools AB. All rights reserved.</p>
        <p>Privacy · Terms · Cookie settings</p>
      </Container>
    </footer>
  )
}

export function FerrantProductSite({ className, style, ...props }: FerrantProductSiteProps) {
  const options = { ...defaults, ...props }
  const reduce = useReducedMotion()
  const animate = options.animate && !reduce
  return (
    <div className={cn('min-h-full w-full overflow-x-clip antialiased', className)} style={{ ...themeVars(options.dark, options.accent, options.radius, options.fontPair), ...style }}>
      <Banner name={options.name} />
      <Navbar name={options.name} />
      <main>
        <Hero headline={options.headline} animate={animate} />
        <Clients animate={animate} />
        <Platform animate={animate} />
        <FeatureTabs animate={animate} />
        <Stats animate={animate} />
        <Products animate={animate} />
        <Testimonials animate={animate} />
        <Pricing animate={animate} />
        <Faq animate={animate} />
        <Cta name={options.name} animate={animate} />
      </main>
      <Footer name={options.name} />
    </div>
  )
}
