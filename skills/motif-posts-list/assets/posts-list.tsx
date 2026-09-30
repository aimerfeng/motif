// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/blog-block.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  font: 'serif',
  layout: 'grid',
  count: 6,
  seed: 8,
  heading: 'Notes from the studio',
  subheading: 'Engineering write-ups, design thinking and the occasional post-mortem.',
  showCovers: true,
  animate: true,
}
/* @motif:end */

export type PostsListProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

type Post = { title: string; excerpt: string; category: string; read: string; author: string; date: string }

const POSTS: Post[] = [
  { title: 'How we cut cold starts from 900 ms to 60 ms', excerpt: 'A tour of the profiler traces, three dead ends and the one-line change that finally moved the needle.', category: 'Engineering', read: '9 min', author: 'Mara Okafor', date: 'Sep 24, 2026' },
  { title: 'Designing empty states people actually read', excerpt: 'An empty screen is the most honest moment in your product. Here is how we write for it.', category: 'Design', read: '6 min', author: 'Mika Tanaka', date: 'Sep 17, 2026' },
  { title: 'A gentler way to onboard a team of forty', excerpt: 'Why we stopped sending seven emails on day one and what replaced them.', category: 'Product', read: '7 min', author: 'Noah Lindqvist', date: 'Sep 9, 2026' },
  { title: 'Pricing experiments: what we learned from 14 tests', excerpt: 'Most of them did nothing. Two of them changed how we think about the entry plan.', category: 'Growth', read: '11 min', author: 'Sofia Marchetti', date: 'Aug 30, 2026' },
  { title: 'Notes on building a local-first sync engine', excerpt: 'Conflict resolution, offline queues and the surprising joy of deleting a loading spinner.', category: 'Engineering', read: '14 min', author: 'Priya Raman', date: 'Aug 21, 2026' },
  { title: 'Inside our quarterly planning ritual', excerpt: 'One document, one afternoon and a rule about saying no that everyone has to sign.', category: 'Company', read: '5 min', author: 'Amara Osei', date: 'Aug 12, 2026' },
]

const FONT: Record<string, { family: string; weight: number; tracking: string; lead: number }> = {
  serif: { family: "'Instrument Serif', ui-serif, Georgia, serif", weight: 400, tracking: '-0.005em', lead: 1.12 },
  sans: { family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em', lead: 1.18 },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em', lead: 1.18 },
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 封面：按序号与种子生成的抽象 SVG 构图（光斑、同心环、点阵、波浪），主色驱动配色。 */
function Cover({ index, seed, className }: { index: number; seed: number; className?: string }) {
  const uid = useId().replace(/:/g, '')
  const rand = rng(seed * 131 + index * 17 + 3)
  const kind = index % 4
  const mixes = ['var(--acc)', 'color-mix(in oklab, var(--acc) 55%, #ff7ab8)', 'color-mix(in oklab, var(--acc) 55%, #38bdf8)', 'color-mix(in oklab, var(--acc) 50%, #fbbf24)']
  const c1 = mixes[(index + Math.floor(rand() * 2)) % 4]
  const c2 = mixes[(index + 2) % 4]
  return (
    <div className={cn('relative overflow-hidden', className)} style={{ background: `linear-gradient(135deg, color-mix(in oklab, ${c1} 32%, var(--card)), color-mix(in oklab, ${c2} 14%, var(--card)))` }}>
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <radialGradient id={`${uid}r`}>
            <stop offset="0" stopColor="#fff" stopOpacity=".55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {kind === 0 && (
          <g>
            {[0, 1].map((i) => (
              <circle key={i} cx={110 + i * 130 + rand() * 40} cy={70 + rand() * 100} r={70 + rand() * 40} style={{ fill: i === 0 ? c1 : c2, filter: 'blur(14px)' }} opacity={0.55} />
            ))}
            <circle cx="150" cy="120" r="64" fill="none" stroke="#fff" strokeOpacity=".35" />
            <circle cx="250" cy="100" r="44" fill="#fff" fillOpacity=".12" stroke="#fff" strokeOpacity=".5" />
            <circle cx={120 + rand() * 160} cy={100 + rand() * 40} r="26" fill={`url(#${uid}r)`} />
          </g>
        )}
        {kind === 1 && (
          <g fill="none" style={{ stroke: '#fff' }}>
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} cx={260 + rand() * 20} cy={110 + rand() * 20} r={16 + i * 22} strokeOpacity={0.5 - i * 0.055} strokeWidth="1.5" />
            ))}
            <circle cx="268" cy="118" r="10" fill="#fff" stroke="none" opacity=".85" />
          </g>
        )}
        {kind === 2 && (
          <g style={{ fill: '#fff' }}>
            {Array.from({ length: 9 }, (_, r) =>
              Array.from({ length: 15 }, (_, c) => {
                const d = Math.hypot(c - 10, r - 3.5)
                return <circle key={`${r}-${c}`} cx={22 + c * 26} cy={20 + r * 25} r={Math.max(1, 7 - d * 0.7)} opacity={Math.max(0.12, 0.85 - d * 0.09)} />
              }),
            )}
          </g>
        )}
        {kind === 3 && (
          <g fill="none" style={{ stroke: '#fff' }} strokeLinecap="round">
            {Array.from({ length: 6 }, (_, i) => {
              const y = 70 + i * 22
              const a = 14 + rand() * 20
              return <path key={i} d={`M-10 ${y} C 60 ${y - a}, 120 ${y + a}, 200 ${y} S 340 ${y - a}, 410 ${y}`} strokeOpacity={0.18 + i * 0.09} strokeWidth={1.5 + i * 0.4} />
            })}
          </g>
        )}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  return (
    <span className="grid size-6 place-items-center rounded-full text-[9px] font-semibold text-white" style={{ background: `linear-gradient(135deg, hsl(${h} 70% 58%), hsl(${(h + 50) % 360} 68% 42%))` }} aria-hidden>
      {name.split(' ').map((p) => p[0]).join('')}
    </span>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.500 11.500 11.500 4.500M5.500 4.500h6v6" />
    </svg>
  )
}

function Meta({ p }: { p: Post }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
      <Avatar name={p.author} />
      <span className="text-foreground/80">{p.author}</span>
      <span aria-hidden>·</span>
      <time>{p.date}</time>
      <span aria-hidden>·</span>
      <span>{p.read}</span>
    </div>
  )
}

/** 文章列表：卡片网格（首篇通栏）、封面列表、纯文字目录三种排法，可按分类筛选。 */
export function PostsList({ className, style, ...props }: PostsListProps) {
  const { accent, font, layout, count, seed, heading, subheading, showCovers, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const f = FONT[font] ?? FONT.serif
  const all = POSTS.slice(0, Math.max(3, Math.min(6, count)))
  const cats = ['All', ...Array.from(new Set(all.map((p) => p.category)))]
  const [cat, setCat] = useState('All')
  const shown = all.filter((p) => cat === 'All' || p.category === cat)
  const ease = [0.22, 1, 0.36, 1] as const
  const enter = (i: number) => ({ initial: run ? { opacity: 0, y: 18 } : (false as const), animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.15 + i * 0.08, ease } })
  const title = (p: Post, size: string) => (
    <h3 className={cn('text-balance', size)} style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: f.lead }}>
      {p.title}
    </h3>
  )

  return (
    <section className={cn('w-full text-foreground', className)} style={{ ['--acc' as string]: accent, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style }}>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <motion.header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" initial={run ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--acc)' }}>
              Journal
            </p>
            <h2 className="mt-3 text-balance text-4xl sm:text-5xl" style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: 1.05 }}>
              {heading}
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground">{subheading}</p>
          </div>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter posts">
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  cat === c ? 'border-transparent text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
                style={cat === c ? { background: 'color-mix(in oklab, var(--acc) 18%, transparent)' } : undefined}
              >
                {c}
              </button>
            ))}
          </div>
        </motion.header>

        {layout === 'grid' && (
          <ul key={cat} className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p, i) => {
              const feature = i === 0 && shown.length >= 4
              return (
                <motion.li key={p.title} {...enter(i)} className={cn('group', feature && 'lg:col-span-2 lg:grid lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-8')}>
                  <a href="#" className="contents outline-none">
                    {showCovers && <Cover index={i + (cat === 'All' ? 0 : 3)} seed={seed} className={cn('rounded-2xl border transition-transform duration-500 group-hover:scale-[1.015]', 'aspect-[16/10]')} />}
                    <div className={cn(showCovers && !feature && 'mt-5', showCovers && feature && 'mt-5 lg:mt-0 lg:flex lg:flex-col lg:justify-center', !showCovers && 'border-t pt-5')}>
                      <p className="mb-2.5 text-xs font-medium" style={{ color: 'var(--acc)' }}>
                        {p.category}
                      </p>
                      {title(p, feature ? 'text-3xl sm:text-[2.2rem]' : 'text-[1.45rem]')}
                      <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                      <div className="mt-4">
                        <Meta p={p} />
                      </div>
                    </div>
                  </a>
                </motion.li>
              )
            })}
          </ul>
        )}

        {layout === 'list' && (
          <ul key={cat} className="mt-12 divide-y border-y">
            {shown.map((p, i) => (
              <motion.li key={p.title} {...enter(i)} className="group">
                <a href="#" className="grid gap-5 py-7 outline-none sm:grid-cols-[13rem_1fr] sm:gap-8 md:grid-cols-[16rem_1fr]">
                  {showCovers ? <Cover index={i} seed={seed} className="aspect-[16/10] rounded-xl border transition-transform duration-500 group-hover:scale-[1.02]" /> : <p className="text-sm font-medium" style={{ color: 'var(--acc)' }}>{p.category}</p>}
                  <div className="flex flex-col justify-center">
                    {showCovers && (
                      <p className="mb-2 text-xs font-medium" style={{ color: 'var(--acc)' }}>
                        {p.category}
                      </p>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      {title(p, 'text-2xl sm:text-[1.7rem]')}
                      <span className="mt-1.5 hidden text-muted-foreground group-hover:text-foreground sm:block">
                        <Arrow />
                      </span>
                    </div>
                    <p className="mt-2.5 line-clamp-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                    <div className="mt-4">
                      <Meta p={p} />
                    </div>
                  </div>
                </a>
              </motion.li>
            ))}
          </ul>
        )}

        {layout === 'index' && (
          <ol key={cat} className="mt-12 border-t">
            {shown.map((p, i) => (
              <motion.li key={p.title} {...enter(i)} className="group border-b">
                <a href="#" className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 py-6 outline-none sm:grid-cols-[3rem_1fr_9rem_6rem] sm:gap-x-8">
                  <span className="text-sm text-muted-foreground tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <div className="transition-transform duration-300 group-hover:translate-x-1.5">{title(p, 'text-2xl sm:text-[1.9rem]')}</div>
                  <span className="col-start-2 mt-2 text-xs text-muted-foreground sm:col-start-3 sm:mt-0 sm:text-sm">{p.category}</span>
                  <time className="col-start-2 mt-1 text-xs text-muted-foreground sm:col-start-4 sm:mt-0 sm:text-right sm:text-sm">{p.date.replace(/, 2026/, '')}</time>
                </a>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
