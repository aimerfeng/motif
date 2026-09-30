// SPDX-License-Identifier: MIT
// Copyright (c) Mudunuri Bhaskara Karthikeya Varma
// Source: https://github.com/karthikmudunuri/eldoraui/blob/6bb8fd2/apps/www/registry/blocks/cta-02/components/orbiting-circle.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo, useRef, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  font: 'serif',
  layout: 'split',
  tiles: 'color',
  count: 10,
  rings: 2,
  speed: 1,
  heading: 'Plugs into the tools you already pay for',
  subheading: 'Two-way sync with your billing, docs, chat and warehouse. Set up in minutes, no glue code.',
  showLabels: false,
  animate: true,
}
/* @motif:end */

export type ShowcaseIntegrationsProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

// 全部是虚构品牌：只有名字、色相和一个几何字形，不涉及任何真实商标。
const BRANDS = [
  { name: 'Ferrow', blurb: 'Invoicing and dunning', hue: 24 },
  { name: 'Quillon', blurb: 'Docs and wikis', hue: 262 },
  { name: 'Tessel', blurb: 'Design handoff', hue: 168 },
  { name: 'Marlo', blurb: 'Team chat', hue: 330 },
  { name: 'Cindra', blurb: 'Transactional email', hue: 8 },
  { name: 'Vantry', blurb: 'Payments and payouts', hue: 214 },
  { name: 'Ostra', blurb: 'Data warehouse', hue: 190 },
  { name: 'Brindle', blurb: 'Ticketing', hue: 46 },
  { name: 'Halden', blurb: 'Calendars', hue: 148 },
  { name: 'Pomelo', blurb: 'Surveys and forms', hue: 98 },
  { name: 'Driftwood', blurb: 'Source control', hue: 285 },
  { name: 'Sundial', blurb: 'Time tracking', hue: 34 },
]

const GLYPHS = [
  'm12 3.500 7.500 4.300v8.400L12 20.500l-7.500-4.300V7.800zM12 9v6',
  'M6 19v-6M12 19V6M18 19v-9',
  'M9.500 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10ZM14.500 19a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z',
  'M5 6.500A1.500 1.500 0 0 1 6.500 5h11A1.500 1.500 0 0 1 19 6.500v8a1.500 1.500 0 0 1-1.500 1.500H11l-4 3.500V16h-.5A1.500 1.500 0 0 1 5 14.500z',
  'M4 12 20 4l-4 16-4.500-6.500zM11.500 13.500 20 4',
  'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 8v8M9.500 10.500c.5-1 1.500-1.500 2.500-1.500s2.200.5 2.500 1.500c.3 2-5 1.200-5 3.500 0 1 1.200 1.500 2.500 1.500s2-.5 2.500-1.500',
  'M5 7c0-1.700 3.100-3 7-3s7 1.300 7 3-3.100 3-7 3-7-1.300-7-3ZM5 7v10c0 1.700 3.100 3 7 3s7-1.300 7-3V7M5 12c0 1.700 3.100 3 7 3s7-1.300 7-3',
  'M4 9a2 2 0 0 0 0 4v3.500A1.500 1.500 0 0 0 5.500 18h13a1.500 1.500 0 0 0 1.500-1.500V13a2 2 0 0 0 0-4V7.500A1.500 1.500 0 0 0 18.500 6h-13A1.500 1.500 0 0 0 4 7.500zM13 6v12',
  'M5 7.500A1.500 1.500 0 0 1 6.500 6h11A1.500 1.500 0 0 1 19 7.500v10a1.500 1.500 0 0 1-1.500 1.500h-11A1.500 1.500 0 0 1 5 17.500zM5 10.500h14M9 4v3M15 4v3',
  'M12 4v8h8A8 8 0 1 1 12 4ZM15 3.500A6 6 0 0 1 20.500 9H15z',
  'M7 5.500a1.500 1.500 0 1 0 0 3 1.500 1.500 0 0 0 0-3ZM7 8.500v7M7 18.500a1.500 1.500 0 1 0 0-3 1.500 1.500 0 0 0 0 3ZM17 8.500a1.500 1.500 0 1 0 0-3 1.500 1.500 0 0 0 0 3ZM17 8.500c0 5-10 3-10 7',
  'M12 15.500a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7ZM12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800',
]

const FONT: Record<string, { family: string; weight: number; tracking: string }> = {
  serif: { family: "'Instrument Serif', ui-serif, Georgia, serif", weight: 400, tracking: '-0.005em' },
  sans: { family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em' },
}
const RING_RADII: Record<number, number[]> = { 1: [0.36], 2: [0.25, 0.4], 3: [0.19, 0.3, 0.42] }

function Tile({ index, mode, size }: { index: number; mode: string; size: string }) {
  const b = BRANDS[index % BRANDS.length]
  const color = mode === 'color'
  return (
    <span
      className={cn('grid place-items-center rounded-xl ring-1 shadow-lg', size, color ? 'text-white ring-white/20' : 'bg-card ring-border')}
      style={color ? { background: `linear-gradient(140deg, hsl(${b.hue} 78% 62%), hsl(${(b.hue + 40) % 360} 72% 44%))`, boxShadow: `0 8px 20px -8px hsl(${b.hue} 80% 50% / .6)` } : { color: 'var(--acc)' }}
    >
      <svg viewBox="0 0 24 24" className="size-[52%]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={GLYPHS[index % GLYPHS.length]} />
      </svg>
    </span>
  )
}

function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('relative grid place-items-center rounded-2xl text-white', className)} style={{ background: 'linear-gradient(145deg, color-mix(in oklab, var(--acc) 85%, #fff), var(--acc) 55%, color-mix(in oklab, var(--acc) 70%, #000))', boxShadow: '0 20px 50px -14px color-mix(in oklab, var(--acc) 80%, transparent), inset 0 1px 0 rgb(255 255 255 / .35)' }}>
      <svg viewBox="0 0 24 24" className="size-1/2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3.500 19.500 7.800v8.400L12 20.500l-7.500-4.300V7.800zM12 9v6M9 10.500l3-1.500 3 1.500" />
      </svg>
    </span>
  )
}

function distribute(count: number, radii: number[]) {
  const total = radii.reduce((a, b) => a + b, 0)
  const per = radii.map((r) => Math.max(1, Math.round((count * r) / total)))
  let diff = count - per.reduce((a, b) => a + b, 0)
  for (let i = per.length - 1; diff !== 0; i = (i - 1 + per.length) % per.length) {
    per[i] += diff > 0 ? 1 : -1
    diff += diff > 0 ? -1 : 1
  }
  return per
}

function Orbit({ tiles, count, rings, speed, showLabels, run, accentMode }: { tiles: string; count: number; rings: number; speed: number; showLabels: boolean; run: boolean; accentMode: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const radii = RING_RADII[Math.max(1, Math.min(3, rings))]
  const layout = useMemo(() => {
    const per = distribute(count, radii)
    const out: { ring: number; a0: number; dir: number; w: number }[] = []
    per.forEach((n, ring) => {
      for (let k = 0; k < n; k++) out.push({ ring, a0: (k / n) * Math.PI * 2 + ring * 0.7, dir: ring % 2 === 0 ? 1 : -1, w: 0.16 / (1 + ring * 0.55) })
    })
    return out
  }, [count, radii])
  const place = (t: number) => {
    layout.forEach((l, i) => {
      const el = refs.current[i]
      if (!el) return
      const a = l.a0 + l.dir * l.w * t
      el.style.left = `${50 + Math.cos(a) * radii[l.ring] * 100}%`
      el.style.top = `${50 + Math.sin(a) * radii[l.ring] * 100}%`
    })
  }
  useFrameLoop(box, ({ time }) => place(time), { speed, reducedMotion: 'static', staticTime: 0 })

  return (
    <div ref={box} className="relative mx-auto aspect-square w-full max-w-[34rem]">
      <div className="pointer-events-none absolute inset-[6%] rounded-full opacity-70 blur-3xl" style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--acc) 30%, transparent), transparent)' }} />
      {radii.map((r) => (
        <span key={r} aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed" style={{ width: `${r * 200}%`, height: `${r * 200}%`, borderColor: 'color-mix(in oklab, var(--foreground) 14%, transparent)' }} />
      ))}
      {run &&
        [0, 1].map((k) => (
          <motion.span
            key={k}
            aria-hidden
            className="absolute top-1/2 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-3xl border"
            style={{ borderColor: 'var(--acc)' }}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 2.6 }}
            transition={{ duration: 3.2, delay: k * 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      <Logo className="absolute top-1/2 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 sm:size-24" />
      {layout.map((l, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${50 + Math.cos(l.a0) * radii[l.ring] * 100}%`, top: `${50 + Math.sin(l.a0) * radii[l.ring] * 100}%` }}
        >
          <div className="transition-transform duration-300 group-hover:scale-110">
            <Tile index={i} mode={accentMode ? 'accent' : tiles} size="size-10 sm:size-12" />
          </div>
          <span className={cn('pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 rounded-md border bg-popover px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-popover-foreground shadow transition-opacity', showLabels ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
            {BRANDS[i % BRANDS.length].name}
          </span>
        </div>
      ))}
    </div>
  )
}

const POINTS = ['Two-way sync, refreshed every five minutes', 'Field mapping that survives schema changes', 'One audit log across every connection']

/** 集成展示：轨道环绕、居中轨道、目录网格三种；品牌全是虚构字标与几何字形。 */
export function ShowcaseIntegrations({ className, style, ...props }: ShowcaseIntegrationsProps) {
  const { accent, font, layout, tiles, count, rings, speed, heading, subheading, showLabels, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const f = FONT[font] ?? FONT.serif
  const n = Math.max(6, Math.min(12, count))
  const ease = [0.22, 1, 0.36, 1] as const
  const enter = (d: number) => ({ initial: run ? { opacity: 0, y: 18 } : (false as const), animate: { opacity: 1, y: 0 }, transition: { duration: 0.65, delay: d, ease } })
  const title = (
    <h2 className="mt-3 text-balance text-4xl sm:text-5xl" style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: 1.05 }}>
      {heading}
    </h2>
  )

  return (
    <section className={cn('relative w-full overflow-hidden text-foreground', className)} style={{ ['--acc' as string]: accent, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style }}>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        {layout === 'split' && (
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-8">
            <motion.div {...enter(0)}>
              <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--acc)' }}>
                Integrations
              </p>
              {title}
              <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground">{subheading}</p>
              <ul className="mt-7 space-y-3">
                {POINTS.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm">
                    <span className="grid size-5 place-items-center rounded-full" style={{ background: 'color-mix(in oklab, var(--acc) 18%, transparent)', color: 'var(--acc)' }}>
                      <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m3.500 8.500 3 3 6-7" />
                      </svg>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#" className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ background: 'var(--acc)' }}>
                  Browse 60+ integrations
                </a>
                <a href="#" className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted">
                  Read the docs
                </a>
              </div>
            </motion.div>
            <motion.div {...enter(0.15)} className="min-w-0">
              <Orbit tiles={tiles} count={n} rings={rings} speed={speed} showLabels={showLabels} run={run} accentMode={tiles === 'mono'} />
            </motion.div>
          </div>
        )}

        {layout === 'center' && (
          <div>
            <motion.header {...enter(0)} className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--acc)' }}>
                Integrations
              </p>
              {title}
              <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground">{subheading}</p>
            </motion.header>
            <motion.div {...enter(0.15)} className="mt-10">
              <Orbit tiles={tiles} count={n} rings={Math.max(2, rings)} speed={speed} showLabels={showLabels} run={run} accentMode={tiles === 'mono'} />
            </motion.div>
          </div>
        )}

        {layout === 'grid' && (
          <div>
            <motion.header {...enter(0)} className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--acc)' }}>
                Integrations
              </p>
              {title}
              <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground">{subheading}</p>
            </motion.header>
            <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: n }, (_, i) => (
                <motion.li key={i} {...enter(0.12 + i * 0.045)}>
                  <a href="#" className="group flex items-center gap-3.5 rounded-xl border bg-card p-3.5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--acc)_45%,var(--border))]">
                    <Tile index={i} mode={tiles === 'mono' ? 'accent' : tiles} size="size-11" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{BRANDS[i % BRANDS.length].name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{BRANDS[i % BRANDS.length].blurb}</span>
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
