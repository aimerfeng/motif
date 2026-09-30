// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Mikolaj Dobrucki
// Source: https://github.com/launch-ui/launch-ui/blob/b0d4d5b/components/sections/faq/default.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Questions teams ask before they switch',
  subline: 'The short answers. For anything else, a person will reply.',
  contact: 'Still unsure? Ask the team',
  accent: '#34d399',
  tone: 'dark',
  font: 'geist',
  radius: 18,
  layout: 'split',
  allowMultiple: false,
  firstOpen: true,
}
/* @motif:end */

export type FaqAccordionProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：当前展开的问题序号。不传时组件自己管理。 */
  open?: number[]
  onOpenChange?: (open: number[]) => void
}

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
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.62)' : 'rgba(12,13,16,0.62)',
    '--s-ln': dark ? 'rgba(255,255,255,0.1)' : 'rgba(12,13,16,0.12)',
    '--s-cd': dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
    '--s-ac': accent,
    '--s-on': onColor(accent),
  } as CSSProperties
}

const QUESTIONS = [
  { q: 'What counts as a request?', a: 'One call to the ingest API, whether it carries a single trace or a batch of up to 500 spans. Health checks and retries with the same idempotency key are free.' },
  { q: 'Can we keep our data in the EU?', a: 'Yes. Pick Frankfurt or Dublin when you create a project and nothing leaves that region, including backups and support access logs.' },
  { q: 'How do rollbacks work?', a: 'Every deploy is stored with its config and artifact hash. A rollback re-releases the previous artifact through the same pipeline, so approvals and audit entries still apply.' },
  { q: 'What happens when we go over a plan limit?', a: 'Nothing breaks. We keep ingesting, email the project owners at 80% and 100%, and bill overage at the same per-request rate as your plan.' },
  { q: 'Do you offer a self-hosted version?', a: 'Team customers can run the collector in their own cluster and send only aggregates to us. The full self-hosted edition is on the roadmap for next year.' },
  { q: 'How do I cancel?', a: 'From Settings, Billing, Cancel plan. Your projects stay readable for 30 days so you can export everything before they are removed.' },
]

function Plus({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0 transition-transform duration-300" style={{ transform: open ? 'rotate(45deg)' : 'none' }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M8 3v10M3 8h10" />
    </svg>
  )
}

export function FaqAccordion({ className, style, open: controlled, onOpenChange, ...props }: FaqAccordionProps) {
  const o = { ...defaults, ...props }
  const font = FONTS[o.font as keyof typeof FONTS] ?? FONTS.geist
  const uid = useId()
  const [inner, setInner] = useState<number[]>(o.firstOpen ? [0] : [])
  const open = controlled ?? inner
  const centered = o.layout === 'centered'

  const toggle = (i: number) => {
    const next = open.includes(i) ? open.filter((x) => x !== i) : o.allowMultiple ? [...open, i] : [i]
    setInner(next)
    onOpenChange?.(next)
  }

  const list = (
    <div className="border-t" style={{ borderColor: 'var(--s-ln)' }}>
      {QUESTIONS.map((item, i) => {
        const on = open.includes(i)
        return (
          <div key={item.q} className="border-b" style={{ borderColor: 'var(--s-ln)' }}>
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`${uid}-a${i}`}
                id={`${uid}-q${i}`}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-[16.5px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: on ? 'var(--s-fg)' : 'color-mix(in oklab, var(--s-fg) 82%, transparent)', outlineColor: 'var(--s-ac)', letterSpacing: '-0.01em' }}
              >
                {item.q}
                <span className="grid size-7 shrink-0 place-items-center rounded-full border" style={{ borderColor: on ? 'var(--s-ac)' : 'var(--s-ln)', color: on ? 'var(--s-on)' : 'var(--s-mu)', background: on ? 'var(--s-ac)' : 'transparent', transition: 'background-color 0.25s, color 0.25s, border-color 0.25s' }}>
                  <Plus open={on} />
                </span>
              </button>
            </h3>
            <div id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`} className="grid transition-[grid-template-rows,opacity] duration-300 ease-out" style={{ gridTemplateRows: on ? '1fr' : '0fr', opacity: on ? 1 : 0 }}>
              <div className="overflow-hidden">
                <p className="max-w-xl pb-6 text-[15px] leading-relaxed" style={{ color: 'var(--s-mu)' }}>
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <section
      className={cn('relative w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: BODY, ...style }}
    >
      <div className={cn('mx-auto w-full px-6 py-24 sm:px-10', centered ? 'max-w-3xl' : 'max-w-6xl')}>
        <div className={cn(centered ? 'flex flex-col' : 'grid gap-14 lg:grid-cols-[0.8fr_1.2fr]')}>
          <div className={cn(centered && 'mb-12 text-center')}>
            <span className="text-[12px] font-medium tracking-[0.14em] uppercase" style={{ color: 'var(--s-ac)' }}>
              FAQ
            </span>
            <h2 className={cn('mt-4 text-balance text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05]', !centered && 'max-w-md')} style={{ fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking }}>
              {o.heading}
            </h2>
            <p className={cn('mt-5 text-pretty text-[16px] leading-relaxed', !centered ? 'max-w-sm' : 'mx-auto max-w-lg')} style={{ color: 'var(--s-mu)' }}>
              {o.subline}
            </p>
            {!centered && (
              <div className="mt-9 flex max-w-sm items-center gap-4 border p-4" style={{ borderColor: 'var(--s-ln)', background: 'var(--s-cd)', borderRadius: `${o.radius}px` }}>
                <span className="flex -space-x-2">
                  {['Noor', 'Emil', 'Wren'].map((n, i) => (
                    <span key={n} className="grid size-9 place-items-center rounded-full text-[12px] font-semibold text-white ring-2" style={{ background: `linear-gradient(135deg, hsl(${i * 96 + 210} 75% 60%), hsl(${i * 96 + 260} 70% 42%))`, ['--tw-ring-color' as string]: 'var(--s-bg)' }}>
                      {n[0]}
                    </span>
                  ))}
                </span>
                <div className="text-[13px] leading-snug">
                  <div className="font-semibold">{o.contact}</div>
                  <div style={{ color: 'var(--s-mu)' }}>Replies within 2 hours</div>
                </div>
              </div>
            )}
          </div>
          {list}
        </div>
      </div>
    </section>
  )
}
