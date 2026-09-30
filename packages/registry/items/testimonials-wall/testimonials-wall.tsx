// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/marquee.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  rating: '4.9 from 2,300 teams',
  heading: 'Engineers say it better than we do',
  subline: 'A few notes from the teams who run their releases on it every day.',
  accent: '#f5a524',
  tone: 'dark',
  font: 'geist',
  radius: 18,
  layout: 'columns',
  duration: 60,
  pauseOnHover: true,
}
/* @motif:end */

export type TestimonialsWallProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

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
    '--s-sf': dark ? '#101218' : '#ffffff',
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.62)' : 'rgba(12,13,16,0.62)',
    '--s-ln': dark ? 'rgba(255,255,255,0.09)' : 'rgba(12,13,16,0.1)',
    '--s-cd': dark ? 'rgba(255,255,255,0.045)' : '#ffffff',
    '--s-ac': accent,
    '--s-on': onColor(accent),
  } as CSSProperties
}

function Avatar({ name }: { name: string }) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full text-[14px] font-semibold text-white" style={{ background: `linear-gradient(135deg, hsl(${h} 78% 60%), hsl(${(h + 52) % 360} 72% 42%))` }}>
      {name.slice(0, 1)}
    </span>
  )
}

interface Quote {
  name: string
  role: string
  text: string
  metric?: string
}

const QUOTES: Quote[] = [
  { name: 'Ines Duarte', role: 'Platform lead, Northlight Freight', text: 'We retired three internal dashboards in a weekend. The on-call rota alone paid for the year.', metric: '3 tools retired' },
  { name: 'Marcus Oyelaran', role: 'CTO, Brightwell Labs', text: 'Our deploy reviews went from a 40-minute meeting to a link in Slack.' },
  { name: 'Hana Kobayashi', role: 'Design engineer, Foxglove', text: 'It is the first tool the designers open on their own. That never happens.' },
  { name: 'Tomás Rivero', role: 'Head of ops, Kestrel Mobility', text: 'Rollbacks used to be a prayer. Now it is a button and a timeline I can show finance.', metric: '-63% incident time' },
  { name: 'Priya Nair', role: 'Staff engineer, Orchard Health', text: 'Audit season took two days instead of two weeks. Nobody had to hunt for screenshots.' },
  { name: 'Elliot Frost', role: 'Founder, Tandem & Vale', text: 'Set up in an afternoon, on the team by Monday, and I never had to write a doc about it.' },
  { name: 'Amara Okafor', role: 'VP Eng, Lumen Grocers', text: 'The digest email is the only report my leadership team actually reads.', metric: '9 of 10 open it' },
  { name: 'Jonas Weber', role: 'SRE, Pilot Cargo', text: 'Alerts finally have context. I know which deploy caused it before I open a laptop.' },
  { name: 'Sofía Marín', role: 'PM, Saltmarsh Bank', text: 'Compliance stopped asking me for exports. They just have a login now.' },
  { name: 'Ravi Menon', role: 'Tech lead, Cedar & Co', text: 'Fewer tabs, fewer Slack threads, fewer surprises. That is the whole review.' },
  { name: 'Clara Lindqvist', role: 'Engineering manager, Nordvik', text: 'New hires ship in their first week because the history explains itself.', metric: '5 days to first ship' },
  { name: 'Diego Fuentes', role: 'Founder, Plum Street', text: 'I cancelled two subscriptions the week we adopted it and nobody noticed.' },
]

function Card({ q, radius }: { q: Quote; radius: number }) {
  return (
    <figure className="flex shrink-0 flex-col gap-4 border p-5" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)', borderRadius: `${radius}px`, boxShadow: '0 1px 0 rgba(255,255,255,0.03) inset' }}>
      <blockquote className="text-[14.5px] leading-relaxed" style={{ color: 'var(--s-fg)' }}>
        “{q.text}”
      </blockquote>
      {q.metric && (
        <span className="w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: 'color-mix(in oklab, var(--s-ac) 16%, transparent)', color: 'var(--s-ac)' }}>
          {q.metric}
        </span>
      )}
      <figcaption className="flex items-center gap-3">
        <Avatar name={q.name} />
        <span className="min-w-0">
          <span className="block truncate text-[13.5px] font-semibold">{q.name}</span>
          <span className="block truncate text-[12px]" style={{ color: 'var(--s-mu)' }}>
            {q.role}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}

/** 一条无限滚动的轨道：内容复制两份，位移 -50% 时首尾无缝相接。 */
function Track({ items, vertical, reverse, duration, radius }: { items: Quote[]; vertical: boolean; reverse: boolean; duration: number; radius: number }) {
  return (
    <div className={cn('tw-track flex', vertical ? 'tw-vertical flex-col' : 'tw-horizontal flex-row', reverse && 'tw-reverse')} style={{ ['--tw-dur' as string]: `${duration}s` }}>
      {[0, 1].map((copy) => (
        <div key={copy} aria-hidden={copy === 1 ? true : undefined} className={cn('flex gap-4', vertical ? 'flex-col pb-4' : 'flex-row pr-4')}>
          {items.map((q) => (
            <div key={q.name} className={vertical ? '' : 'w-[340px]'}>
              <Card q={q} radius={radius} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function TestimonialsWall({ className, style, ...props }: TestimonialsWallProps) {
  const o = { ...defaults, ...props }
  const font = FONTS[o.font as keyof typeof FONTS] ?? FONTS.geist
  const rows = o.layout === 'rows'
  const vFade = 'linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent)'
  const hFade = 'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)'
  const cols = [QUOTES.filter((_, i) => i % 3 === 0), QUOTES.filter((_, i) => i % 3 === 1), QUOTES.filter((_, i) => i % 3 === 2)]

  return (
    <section
      className={cn('tw-wall relative w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: BODY, ...style }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px]" aria-hidden style={{ background: 'radial-gradient(50% 100% at 50% 0%, color-mix(in oklab, var(--s-ac) 16%, transparent), transparent)' }} />
      <div className="relative mx-auto w-full max-w-6xl px-6 pt-24 pb-20 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: 'var(--s-ac)' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
                <path d="m8 1.2 2 4.4 4.8.5-3.6 3.2 1 4.7L8 11.6 3.8 14l1-4.7L1.2 6.1 6 5.6z" />
              </svg>
            ))}
            <span className="ml-1.5">{o.rating}</span>
          </span>
          <h2 className="mt-5 text-balance text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05]" style={{ fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking }}>
            {o.heading}
          </h2>
          <p className="mt-5 text-pretty text-[16px] leading-relaxed" style={{ color: 'var(--s-mu)' }}>
            {o.subline}
          </p>
        </div>

        {rows ? (
          <div className={cn('-mx-6 mt-14 flex flex-col gap-4 sm:-mx-10', o.pauseOnHover && 'tw-pausable')} style={{ maskImage: hFade, WebkitMaskImage: hFade }}>
            <div className="overflow-hidden">
              <Track items={QUOTES.slice(0, 6)} vertical={false} reverse={false} duration={o.duration} radius={o.radius} />
            </div>
            <div className="overflow-hidden">
              <Track items={QUOTES.slice(6)} vertical={false} reverse duration={o.duration * 1.15} radius={o.radius} />
            </div>
          </div>
        ) : (
          <div className={cn('mt-14 grid h-[620px] gap-4 overflow-hidden md:grid-cols-2 lg:grid-cols-3', o.pauseOnHover && 'tw-pausable')} style={{ maskImage: vFade, WebkitMaskImage: vFade }}>
            {cols.map((items, i) => (
              <div key={i} className={cn('overflow-hidden', i === 2 && 'hidden lg:block', i === 1 && 'hidden md:block')}>
                <Track items={items} vertical reverse={i === 1} duration={o.duration * (1 + i * 0.12)} radius={o.radius} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
