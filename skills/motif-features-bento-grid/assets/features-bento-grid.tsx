// SPDX-License-Identifier: MIT
// Copyright (c) Mudunuri Bhaskara Karthikeya Varma
// Source: https://github.com/karthikmudunuri/eldoraui/blob/6bb8fd2/apps/www/registry/blocks/bento-01/page.tsx
// Modified by Motif; see the item's provenance.
import { cn, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  eyebrow: 'Why teams switch',
  heading: 'One workspace for the whole decision trail',
  subline: 'Docs, comments and history live together, so nobody has to ask where that call was made.',
  accent: '#8b7bff',
  tone: 'dark',
  font: 'geist',
  radius: 22,
  layout: 'bento',
}
/* @motif:end */

export type FeaturesBentoGridProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const FONTS = {
  geist: { family: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.04em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.045em' },
  serif: { family: "'Instrument Serif', 'Times New Roman', 'Songti SC', serif", weight: 400, tracking: '-0.02em' },
} as const

const BODY = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"

function onColor(hex: string) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.56 ? '#0a0a0d' : '#ffffff'
}

function palette(tone: string, accent: string): CSSProperties {
  const dark = tone === 'dark'
  return {
    '--s-bg': dark ? '#08090c' : '#f7f6f2',
    '--s-sf': dark ? '#0e1016' : '#ffffff',
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.58)' : 'rgba(12,13,16,0.6)',
    '--s-ln': dark ? 'rgba(255,255,255,0.09)' : 'rgba(12,13,16,0.1)',
    '--s-cd': dark ? 'rgba(255,255,255,0.04)' : 'rgba(12,13,16,0.035)',
    '--s-ac': accent,
    '--s-on': onColor(accent),
  } as CSSProperties
}

/** 首字母 + 渐变的头像：色相由名字决定，不需要任何图片。 */
function Avatar({ name, className }: { name: string; className?: string }) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  return (
    <span
      className={cn('inline-grid size-7 place-items-center rounded-full text-[11px] font-semibold text-white ring-2', className)}
      style={{ background: `linear-gradient(135deg, hsl(${h} 80% 62%), hsl(${(h + 48) % 360} 75% 45%))`, ['--tw-ring-color' as string]: 'var(--s-sf)' }}
    >
      {name.slice(0, 1)}
    </span>
  )
}

function Cursor({ label, color, className }: { label: string; color: string; className?: string }) {
  return (
    <span className={cn('absolute flex items-start', className)} aria-hidden>
      <svg viewBox="0 0 16 16" className="size-4" fill={color} stroke="var(--s-sf)" strokeWidth="1">
        <path d="M2 1.5 13 7l-4.6 1.4L6.6 13z" />
      </svg>
      <span className="mt-3 -ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ background: color }}>
        {label}
      </span>
    </span>
  )
}

function DocVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative mt-6 flex-1 overflow-hidden rounded-xl border p-5" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-sf)' }}>
      <div className="absolute top-4 right-4 flex -space-x-2">
        {['Priya', 'Marcus', 'Jun'].map((n) => (
          <Avatar key={n} name={n} />
        ))}
      </div>
      <div className="h-3.5 w-2/5 rounded-full" style={{ background: 'var(--s-fg)', opacity: 0.85 }} />
      <div className="mt-5 space-y-2.5">
        <div className="h-2 w-[92%] rounded-full" style={{ background: 'var(--s-ln)' }} />
        <div className="h-2 w-[78%] rounded-full" style={{ background: 'color-mix(in oklab, var(--s-ac) 35%, transparent)' }} />
        <div className="h-2 w-[86%] rounded-full" style={{ background: 'var(--s-ln)' }} />
        <div className="h-2 w-[54%] rounded-full" style={{ background: 'var(--s-ln)' }} />
      </div>
      <motion.div animate={reduced ? undefined : { x: [0, 10, 0], y: [0, 4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[86px] left-[44%]">
        <Cursor label="Priya" color="#8b5cf6" />
      </motion.div>
      <motion.div animate={reduced ? undefined : { x: [0, -12, 0], y: [0, -3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[128px] left-[16%]">
        <Cursor label="Marcus" color="#f97316" />
      </motion.div>
    </div>
  )
}

function PaletteVisual() {
  const rows = [
    ['New page', 'N'],
    ['Search workspace', '/'],
    ['Jump to Roadmap', 'G R'],
    ['Invite teammate', 'I'],
  ]
  return (
    <div className="mt-6 flex-1 rounded-xl border p-2" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-sf)' }}>
      <div className="mb-1.5 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: 'var(--s-cd)', color: 'var(--s-mu)' }}>
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
          <circle cx="7" cy="7" r="4.2" />
          <path d="m10.2 10.2 3 3" />
        </svg>
        Type a command
        <kbd className="ml-auto rounded border px-1.5 py-px text-[10px]" style={{ borderColor: 'var(--s-ln)' }}>
          ⌘K
        </kbd>
      </div>
      {rows.map(([label, key], i) => (
        <div key={label} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px]" style={{ background: i === 2 ? 'color-mix(in oklab, var(--s-ac) 16%, transparent)' : undefined, color: i === 2 ? 'var(--s-fg)' : 'var(--s-mu)' }}>
          <span className="size-3.5 rounded-[4px]" style={{ background: i === 2 ? 'var(--s-ac)' : 'var(--s-ln)' }} />
          {label}
          <span className="ml-auto text-[10px] tracking-widest opacity-70">{key}</span>
        </div>
      ))}
    </div>
  )
}

function DiffVisual() {
  const lines: [string, string, 'add' | 'del' | 'ctx'][] = [
    ['-', 'Launch is scheduled for Oct 14.', 'del'],
    ['+', 'Launch moves to Oct 21 after review.', 'add'],
    [' ', 'Owner: Priya · Reviewer: Jun', 'ctx'],
    ['+', 'Added rollback checklist.', 'add'],
  ]
  return (
    <div className="mt-6 flex-1 overflow-hidden rounded-xl border font-mono text-[11px] leading-5" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-sf)' }}>
      <div className="flex items-center gap-2 border-b px-3 py-2 font-sans text-[11px]" style={{ borderColor: 'var(--s-ln)', color: 'var(--s-mu)' }}>
        <Avatar name="Jun" className="size-5 text-[9px]" />
        Jun edited · 2 min ago
      </div>
      {lines.map(([sign, text, kind], i) => (
        <div
          key={i}
          className="flex gap-2 px-3"
          style={{
            background: kind === 'add' ? 'rgba(52,211,153,0.13)' : kind === 'del' ? 'rgba(248,113,113,0.13)' : undefined,
            color: kind === 'add' ? '#34d399' : kind === 'del' ? '#f87171' : 'var(--s-mu)',
          }}
        >
          <span className="w-2 opacity-80">{sign}</span>
          <span className="truncate">{text}</span>
        </div>
      ))}
    </div>
  )
}

const TILES: { c: [string, string]; glyph: ReactNode }[] = [
  { c: ['#f472b6', '#be185d'], glyph: <circle cx="12" cy="12" r="5" fill="#fff" /> },
  { c: ['#60a5fa', '#1d4ed8'], glyph: <path d="M12 6.5 18 17H6z" fill="#fff" /> },
  { c: ['#34d399', '#047857'], glyph: <rect x="7" y="7" width="10" height="10" rx="2.5" fill="#fff" /> },
  { c: ['#fbbf24', '#b45309'], glyph: <path d="m12 6 1.9 4.1 4.5.5-3.4 3 1 4.4L12 15.7 8 18l1-4.4-3.4-3 4.5-.5z" fill="#fff" /> },
  { c: ['#a78bfa', '#5b21b6'], glyph: <path d="M7 12h10M12 7v10" stroke="#fff" strokeWidth="3" strokeLinecap="round" /> },
  { c: ['#fb923c', '#c2410c'], glyph: <path d="M8 8h8v8H8z M12 6v12" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" /> },
]

function TilesVisual() {
  return (
    <div className="mt-6 grid flex-1 grid-cols-3 content-center gap-3">
      {TILES.map((t, i) => (
        <div key={i} className="grid aspect-square place-items-center rounded-2xl border" style={{ borderColor: 'var(--s-ln)', background: `linear-gradient(145deg, ${t.c[0]}, ${t.c[1]})`, boxShadow: '0 10px 24px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35)' }}>
          <svg viewBox="0 0 24 24" className="size-[46%]" aria-hidden>
            {t.glyph}
          </svg>
        </div>
      ))}
    </div>
  )
}

function BarsVisual({ reduced }: { reduced: boolean }) {
  const bars = [34, 52, 41, 66, 58, 79, 100]
  return (
    <div className="mt-6 flex flex-1 flex-col justify-end rounded-xl border p-4" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-sf)' }}>
      <div className="text-[26px] leading-none font-semibold tabular-nums" style={{ letterSpacing: '-0.03em' }}>
        312<span className="text-[15px]" style={{ color: 'var(--s-mu)' }}> decisions</span>
      </div>
      <div className="mt-1 text-[11px]" style={{ color: '#34d399' }}>
        +18% vs last quarter
      </div>
      <div className="mt-4 flex h-20 items-end gap-2">
        {bars.map((b, i) => (
          <motion.span
            key={i}
            className="flex-1 origin-bottom rounded-md"
            style={{ height: `${b}%`, background: i === bars.length - 1 ? 'var(--s-ac)' : 'color-mix(in oklab, var(--s-ac) 26%, transparent)' }}
            initial={reduced ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
    </div>
  )
}

export function FeaturesBentoGrid({ className, style, ...props }: FeaturesBentoGridProps) {
  const o = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const font = FONTS[o.font as keyof typeof FONTS] ?? FONTS.geist
  const mirrored = o.layout === 'mirrored'
  const cards = [
    { id: 'doc', title: 'Write together, never in each other’s way', body: 'Live cursors, inline comments and per-block locks keep five people in one page without overwrites.', span: 'lg:col-span-4', visual: <DocVisual reduced={reduced} /> },
    { id: 'cmd', title: 'Jump anywhere in two keystrokes', body: 'Every page, person and action is one command away.', span: 'lg:col-span-2', visual: <PaletteVisual /> },
    { id: 'diff', title: 'See exactly what changed', body: 'Line-level history with who, when and why.', span: 'lg:col-span-2', visual: <DiffVisual /> },
    { id: 'apps', title: 'Plays well with your stack', body: '38 integrations, and a webhook for the rest.', span: 'lg:col-span-2', visual: <TilesVisual /> },
    { id: 'num', title: 'Decisions you can count', body: 'Every decision is logged with an owner and a date.', span: 'lg:col-span-2', visual: <BarsVisual reduced={reduced} /> },
  ]
  const order = mirrored ? [1, 0, 3, 2, 4] : [0, 1, 2, 3, 4]
  const spans = mirrored ? ['lg:col-span-2', 'lg:col-span-4'] : ['lg:col-span-4', 'lg:col-span-2']

  return (
    <section
      className={cn('relative w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: BODY, ...style }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden style={{ background: 'radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--s-ac) 18%, transparent), transparent)' }} />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px]" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)', color: 'var(--s-mu)' }}>
            <span className="size-1.5 rounded-full" style={{ background: 'var(--s-ac)' }} />
            {o.eyebrow}
          </span>
          <h2 className="mt-6 text-balance text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05]" style={{ fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking }}>
            {o.heading}
          </h2>
          <p className="mt-5 text-pretty text-[16px] leading-relaxed" style={{ color: 'var(--s-mu)' }}>
            {o.subline}
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-6">
          {order.map((idx, pos) => {
            const c = cards[idx]!
            const span = pos < 2 ? spans[pos]! : 'lg:col-span-2'
            return (
              <motion.article
                key={c.id}
                initial={reduced ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + pos * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className={cn('group relative flex min-h-[340px] flex-col overflow-hidden border p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5', span)}
                style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)', borderRadius: `${o.radius}px` }}
              >
                <h3 className="text-[17px] leading-snug font-semibold" style={{ letterSpacing: '-0.015em' }}>
                  {c.title}
                </h3>
                <p className="mt-2 max-w-md text-[13.5px] leading-relaxed" style={{ color: 'var(--s-mu)' }}>
                  {c.body}
                </p>
                {c.visual}
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
