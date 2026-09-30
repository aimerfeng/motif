// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/team-section-block.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import type { CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  font: 'serif',
  layout: 'cards',
  columns: 4,
  members: 8,
  avatarShape: 'squircle',
  heading: 'The people behind Halcyon',
  subheading: 'Forty-one people across nine time zones, shipping small and often.',
  animate: true,
}
/* @motif:end */

export type TeamGridProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const TEAM = [
  { name: 'Amara Osei', role: 'Co-founder & CEO', bio: 'Built two analytics products before this one. Reads every support thread on Fridays.' },
  { name: 'Lucas Ferreira', role: 'Co-founder & CTO', bio: 'Database nerd. Rewrote our query engine over one long weekend and never mentions it.' },
  { name: 'Mika Tanaka', role: 'Head of Design', bio: 'Sets the tone for how Halcyon looks, feels and, more importantly, stays out of the way.' },
  { name: 'Priya Raman', role: 'Staff Engineer', bio: 'Owns the sync layer. Believes every bug report is a gift, gently wrapped.' },
  { name: 'Noah Lindqvist', role: 'Product Lead', bio: 'Turns forty feature requests into the one thing customers needed. Coffee, black.' },
  { name: 'Sofia Marchetti', role: 'Head of Growth', bio: 'Runs the experiments behind our pricing page and writes half of the newsletter.' },
  { name: 'Ibrahim Yusuf', role: 'Infrastructure', bio: 'Keeps the lights on at 99.99% and the on-call rotation surprisingly humane.' },
  { name: 'Chloe Beaumont', role: 'Customer Success', bio: 'Knows most of our customers by first name and their dashboards by heart.' },
]

const FONT: Record<string, { family: string; weight: number; tracking: string }> = {
  serif: { family: "'Instrument Serif', ui-serif, Georgia, serif", weight: 400, tracking: '-0.005em' },
  sans: { family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em' },
}
const COLS: Record<number, string> = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }

function hash(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  return h
}

/** 首字母头像：按姓名哈希生成渐变，叠一层高光和细环，看起来像一张拍好的头像。 */
function Avatar({ name, size, shape }: { name: string; size: string; shape: string }) {
  const h = hash(name)
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2)
  return (
    <span
      className={cn('relative grid shrink-0 place-items-center overflow-hidden font-semibold text-white ring-1 ring-white/15 ring-inset', size, shape === 'circle' ? 'rounded-full' : 'rounded-[32%]')}
      style={{ background: `linear-gradient(140deg, hsl(${h} 72% 62%), hsl(${(h + 55) % 360} 70% 40%))` }}
      aria-hidden
    >
      <span className="absolute -top-1/2 -left-1/4 size-full rounded-full bg-white/25 blur-xl" />
      <span className="relative tracking-wide drop-shadow-sm">{initials}</span>
    </span>
  )
}

function Icon({ kind }: { kind: 'mail' | 'link' }) {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {kind === 'mail' ? (
        <>
          <rect x="3" y="4.5" width="14" height="11" rx="2" />
          <path d="m3.5 6 6.5 5 6.5-5" />
        </>
      ) : (
        <>
          <path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.8.8" />
          <path d="M11.5 8.5a3 3 0 0 0-4.2 0L4.700 11.100a3 3 0 0 0 4.200 4.200l.8-.8" />
        </>
      )}
    </svg>
  )
}

function Socials({ name }: { name: string }) {
  return (
    <div className="flex gap-1.5">
      {(['mail', 'link'] as const).map((k) => (
        <a
          key={k}
          href="#"
          aria-label={`${name} ${k}`}
          className="grid size-8 place-items-center rounded-lg border text-muted-foreground transition-colors outline-none hover:border-[color-mix(in_oklab,var(--acc)_50%,var(--border))] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon kind={k} />
        </a>
      ))}
    </div>
  )
}

/** 团队区块：卡片、居中头像、名册三种排法；头像用姓名首字母生成，不带任何位图。 */
export function TeamGrid({ className, style, ...props }: TeamGridProps) {
  const { accent, font, layout, columns, members, avatarShape, heading, subheading, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const f = FONT[font] ?? FONT.serif
  const people = TEAM.slice(0, Math.max(2, Math.min(8, members)))
  const ease = [0.22, 1, 0.36, 1] as const
  const enter = (i: number) => ({
    initial: run ? { opacity: 0, y: 18 } : (false as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.15 + i * 0.07, ease },
  })

  return (
    <section className={cn('w-full text-foreground', className)} style={{ ['--acc' as string]: accent, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style }}>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <motion.header className={cn('max-w-2xl', layout === 'centered' && 'mx-auto text-center')} initial={run ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--acc)' }}>
            Team
          </p>
          <h2 className="mt-3 text-balance text-4xl sm:text-5xl" style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: 1.05 }}>
            {heading}
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground">{subheading}</p>
        </motion.header>

        {layout === 'roster' ? (
          <ul className="mt-12 divide-y border-y">
            {people.map((p, i) => (
              <motion.li key={p.name} {...enter(i)} className="group grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 py-5 sm:grid-cols-[auto_14rem_1fr_auto] sm:gap-x-6">
                <Avatar name={p.name} size="size-12" shape={avatarShape} />
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.role}</p>
                </div>
                <p className="col-span-2 text-sm leading-relaxed text-muted-foreground sm:col-span-1">{p.bio}</p>
                <div className="col-span-2 sm:col-span-1">
                  <Socials name={p.name} />
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <ul className={cn('mt-12 grid gap-4 sm:gap-5', COLS[columns] ?? COLS[4])}>
            {people.map((p, i) =>
              layout === 'centered' ? (
                <motion.li key={p.name} {...enter(i)} className="group flex flex-col items-center text-center">
                  <div className="transition-transform duration-300 group-hover:-translate-y-1">
                    <Avatar name={p.name} size="size-24 text-xl" shape={avatarShape} />
                  </div>
                  <p className="mt-5 font-medium">{p.name}</p>
                  <p className="mt-0.5 text-sm" style={{ color: 'var(--acc)' }}>
                    {p.role}
                  </p>
                  <p className="mt-3 max-w-56 text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
                </motion.li>
              ) : (
                <motion.li
                  key={p.name}
                  {...enter(i)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-5 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--acc)_40%,var(--border))]"
                >
                  <span className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25" style={{ background: 'var(--acc)' }} />
                  <Avatar name={p.name} size="size-16 text-lg" shape={avatarShape} />
                  <p className="mt-5 font-medium">{p.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.role}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground/90">{p.bio}</p>
                  <div className="mt-5">
                    <Socials name={p.name} />
                  </div>
                </motion.li>
              ),
            )}
          </ul>
        )}
      </div>
    </section>
  )
}
