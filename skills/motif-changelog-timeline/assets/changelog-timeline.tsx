// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/glassmorphism-product-update-block.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c8cff',
  font: 'serif',
  layout: 'split',
  entries: 4,
  heading: 'What’s new in Halcyon',
  subheading: 'Release notes for every shipped change, newest first.',
  showVisuals: true,
  animate: true,
}
/* @motif:end */

export type ChangelogTimelineProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

type Tag = 'New' | 'Improved' | 'Fixed'
type Entry = { version: string; date: string; title: string; lead: string; tags: Tag[]; notes: string[]; art: number }

const ENTRIES: Entry[] = [
  {
    version: 'v2.4',
    date: 'Sep 22, 2026',
    title: 'Shared views and instant search',
    lead: 'Save any filter combination as a view, pin it for the whole team, and jump to anything with one keystroke.',
    tags: ['New', 'Improved'],
    notes: ['Shared views keep their filters, sort order and column widths for everyone.', 'Search now indexes comments and attachments, and returns results in under 40 ms.', 'Press / anywhere to open search, then Tab to scope it to a project.'],
    art: 0,
  },
  {
    version: 'v2.3',
    date: 'Sep 8, 2026',
    title: 'Scheduled exports',
    lead: 'Send a CSV or a PDF digest to any inbox on a schedule, without opening the app.',
    tags: ['New'],
    notes: ['Daily, weekly and monthly schedules with a per-recipient timezone.', 'Exports respect row-level permissions, so nobody sees more than they should.', 'A failed delivery retries three times and then notifies the owner.'],
    art: 1,
  },
  {
    version: 'v2.2',
    date: 'Aug 19, 2026',
    title: 'Billing settings, redesigned',
    lead: 'Usage, invoices and seats now live on one page, with the numbers you asked for first.',
    tags: ['Improved', 'Fixed'],
    notes: ['Usage meters warn before you reach a plan limit, not after.', 'Fixed invoices showing the previous month’s VAT for EU customers.', 'Seat changes are prorated and previewed before you confirm them.'],
    art: 2,
  },
  {
    version: 'v2.1',
    date: 'Aug 4, 2026',
    title: 'Webhooks, second edition',
    lead: 'Signed payloads, replayable deliveries and a log you can actually read.',
    tags: ['New', 'Improved'],
    notes: ['Every delivery is signed with a rotating secret and can be replayed for 30 days.', 'The delivery log groups retries under their original event.', 'Payload size limit raised from 256 KB to 1 MB.'],
    art: 3,
  },
  {
    version: 'v2.0',
    date: 'Jul 15, 2026',
    title: 'A new home for your data',
    lead: 'Workspaces now have a proper overview: what changed, what needs attention and what is coming up.',
    tags: ['New', 'Improved', 'Fixed'],
    notes: ['A single overview replaces the old dashboard and the activity page.', 'Imports are three times faster and can be resumed after a network drop.', 'Fixed a rare crash when a workspace contained more than 50,000 rows.'],
    art: 4,
  },
]

const FONT: Record<string, { family: string; size: string; weight: number; tracking: string }> = {
  serif: { family: "'Instrument Serif', ui-serif, Georgia, serif", size: 'text-[1.7rem] leading-[1.15] sm:text-[2rem]', weight: 400, tracking: '-0.005em' },
  sans: { family: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", size: 'text-[1.4rem] leading-[1.2] sm:text-[1.65rem]', weight: 600, tracking: '-0.025em' },
  grotesk: { family: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", size: 'text-[1.4rem] leading-[1.2] sm:text-[1.65rem]', weight: 600, tracking: '-0.03em' },
}
const TAG_TONE: Record<Tag, string> = {
  New: 'bg-[color-mix(in_oklab,var(--acc)_16%,transparent)] text-[color-mix(in_oklab,var(--acc)_75%,var(--foreground))]',
  Improved: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
  Fixed: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
}

/** 每条更新配一张自绘的线框插图：全是 SVG，没有位图。 */
function Art({ kind }: { kind: number }) {
  const line = 'stroke-foreground/25'
  const acc = 'var(--acc)'
  const shapes: ReactNode[] = [
    // 搜索面板
    <g key="0">
      <rect x="60" y="28" width="200" height="30" rx="8" className="fill-card" stroke="currentColor" strokeOpacity=".2" />
      <circle cx="78" cy="43" r="5" fill="none" stroke={acc} strokeWidth="1.6" />
      <path d="m82 47 4 4" stroke={acc} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="94" y="40" width="70" height="6" rx="3" fill={acc} opacity=".7" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(0 ${i * 26})`}>
          <rect x="60" y="68" width="200" height="22" rx="6" className={i === 1 ? '' : 'fill-transparent'} fill={i === 1 ? acc : undefined} opacity={i === 1 ? 0.16 : 1} />
          <circle cx="74" cy="79" r="4" fill={acc} opacity={i === 1 ? 1 : 0.35} />
          <rect x="86" y="76" width={90 - i * 12} height="5" rx="2.5" className="fill-foreground/35" />
          <rect x="216" y="76" width="30" height="5" rx="2.5" className="fill-foreground/15" />
        </g>
      ))}
    </g>,
    // 计划导出
    <g key="1">
      <rect x="54" y="26" width="212" height="128" rx="10" className="fill-card" stroke="currentColor" strokeOpacity=".2" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0 ${i * 34})`}>
          <rect x="70" y="42" width="70" height="6" rx="3" className="fill-foreground/40" />
          <rect x="70" y="54" width="46" height="5" rx="2.5" className="fill-foreground/15" />
          <rect x="216" y="42" width="34" height="18" rx="9" fill={acc} opacity={i === 2 ? 0.2 : 0.9} />
          <circle cx={i === 2 ? 226 : 241} cy="51" r="6" fill="#fff" />
        </g>
      ))}
    </g>,
    // 账单柱图
    <g key="2">
      <rect x="54" y="26" width="212" height="128" rx="10" className="fill-card" stroke="currentColor" strokeOpacity=".2" />
      <rect x="72" y="42" width="60" height="7" rx="3.5" className="fill-foreground/40" />
      <rect x="72" y="56" width="90" height="16" rx="4" fill={acc} opacity=".85" />
      {[36, 52, 44, 66, 58, 82].map((h, i) => (
        <rect key={i} x={158 + i * 15} y={140 - h} width="9" height={h} rx="3" fill={i === 5 ? acc : 'currentColor'} opacity={i === 5 ? 1 : 0.18} />
      ))}
      <path d="M72 100h70M72 112h50M72 124h60" className={line} strokeWidth="5" strokeLinecap="round" />
    </g>,
    // 节点连线
    <g key="3">
      <path d="M96 90h40c14 0 14-38 34-38h54M136 90c14 0 14 38 34 38h54M136 90h34" fill="none" stroke={acc} strokeWidth="1.6" opacity=".6" strokeDasharray="3 4" />
      <rect x="62" y="74" width="48" height="32" rx="8" className="fill-card" stroke="currentColor" strokeOpacity=".22" />
      <circle cx="86" cy="90" r="7" fill={acc} />
      {[52, 90, 128].map((y, i) => (
        <g key={y}>
          <rect x="224" y={y - 14} width="48" height="28" rx="8" className="fill-card" stroke="currentColor" strokeOpacity=".22" />
          <rect x="234" y={y - 4} width={22 - i * 3} height="6" rx="3" className="fill-foreground/40" />
        </g>
      ))}
    </g>,
    // 数据网格
    <g key="4">
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4].map((c) => {
          const on = (r * 5 + c) % 4 === 1
          return <rect key={`${r}${c}`} x={62 + c * 40} y={30 + r * 32} width="34" height="26" rx="6" className={on ? '' : 'fill-card'} fill={on ? acc : undefined} opacity={on ? 0.9 : 1} stroke="currentColor" strokeOpacity={on ? 0 : 0.18} />
        }),
      )}
    </g>,
  ]
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border text-foreground" style={{ background: 'radial-gradient(120% 90% at 20% 0%, color-mix(in oklab, var(--acc) 26%, var(--card)), var(--card) 70%)' }}>
      <svg viewBox="0 0 320 180" className="absolute inset-0 size-full" aria-hidden>
        {shapes[kind % shapes.length]}
      </svg>
    </div>
  )
}

function Tags({ tags }: { tags: Tag[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', TAG_TONE[t])}>
          {t}
        </span>
      ))}
    </div>
  )
}

/** 更新日志：左侧日期与版本号，右侧标题、要点与自绘插图；也可切成带节点的竖轴。 */
export function ChangelogTimeline({ className, style, ...props }: ChangelogTimelineProps) {
  const { accent, font, layout, entries, heading, subheading, showVisuals, animate: animated } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = animated && !reduced
  const f = FONT[font] ?? FONT.serif
  const list = ENTRIES.slice(0, Math.max(2, Math.min(5, entries)))
  const rail = layout === 'rail'
  const mono = "'Geist Mono Variable', ui-monospace, monospace"

  return (
    <section className={cn('w-full text-foreground', className)} style={{ ['--acc' as string]: accent, fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", ...style }}>
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <motion.header
          className="max-w-xl"
          initial={run ? { opacity: 0, y: 14 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--acc)' }}>
            <span className="size-1.5 rounded-full" style={{ background: 'var(--acc)' }} />
            Changelog
          </p>
          <h2 className="mt-3 text-balance text-4xl sm:text-5xl" style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking, lineHeight: 1.05 }}>
            {heading}
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground">{subheading}</p>
        </motion.header>

        <ol className={cn('relative mt-14', rail ? 'pl-8 sm:pl-10' : 'space-y-14 sm:space-y-16')}>
          {rail && (
            <motion.span
              aria-hidden
              className="absolute top-2 bottom-2 left-[5px] w-px origin-top sm:left-[7px]"
              style={{ background: 'linear-gradient(to bottom, var(--acc), var(--border) 22%, var(--border) 88%, transparent)' }}
              initial={run ? { scaleY: 0 } : false}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
          {list.map((e, i) => (
            <motion.li
              key={e.version}
              className={cn('relative', rail ? 'pb-14 last:pb-0' : 'grid gap-4 sm:grid-cols-[9.5rem_1fr] sm:gap-10')}
              initial={run ? { opacity: 0, y: 22 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {rail && (
                <span className="absolute top-1.5 -left-8 grid size-3 place-items-center sm:-left-10 sm:size-4" aria-hidden>
                  <span className="absolute inset-0 rounded-full opacity-25" style={{ background: 'var(--acc)' }} />
                  <span className="size-1.5 rounded-full sm:size-2" style={{ background: i === 0 ? 'var(--acc)' : 'var(--muted-foreground)' }} />
                </span>
              )}
              <div className={cn(rail ? 'mb-3' : 'sm:sticky sm:top-6 sm:self-start')}>
                <div className="flex items-center gap-2.5 sm:flex-col sm:items-start sm:gap-1.5">
                  <span className="rounded-md border px-1.5 py-0.5 text-xs font-medium tabular-nums" style={{ fontFamily: mono, color: i === 0 ? 'var(--acc)' : undefined, borderColor: i === 0 ? 'color-mix(in oklab, var(--acc) 40%, var(--border))' : undefined }}>
                    {e.version}
                  </span>
                  <time className="text-sm text-muted-foreground">{e.date}</time>
                </div>
              </div>
              <article className="min-w-0">
                <Tags tags={e.tags} />
                <h3 className={cn('mt-3 text-balance', f.size)} style={{ fontFamily: f.family, fontWeight: f.weight, letterSpacing: f.tracking }}>
                  {e.title}
                </h3>
                <p className="mt-2.5 text-pretty text-[15px] leading-relaxed text-muted-foreground">{e.lead}</p>
                {showVisuals && (
                  <div className="mt-5">
                    <Art kind={e.art} />
                  </div>
                )}
                <ul className="mt-5 space-y-2.5">
                  {e.notes.map((n) => (
                    <li key={n} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                      <svg viewBox="0 0 16 16" className="mt-1 size-3.5 shrink-0" fill="none" stroke="var(--acc)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m3.5 8.5 3 3 6-7" />
                      </svg>
                      {n}
                    </li>
                  ))}
                </ul>
              </article>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
