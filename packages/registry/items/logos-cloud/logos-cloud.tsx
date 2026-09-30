// SPDX-License-Identifier: MIT
// Copyright (c) Mudunuri Bhaskara Karthikeya Varma
// Source: https://github.com/karthikmudunuri/eldoraui/blob/6bb8fd2/apps/www/registry/blocks/logo-cloud-02/page.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { CSSProperties, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Trusted by product teams who ship every week',
  count: '1,200+',
  accent: '#8b7bff',
  colorGlyphs: false,
  tone: 'dark',
  layout: 'marquee',
  duration: 36,
  pauseOnHover: true,
}
/* @motif:end */

export type LogosCloudProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

const BODY = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"

function palette(tone: string, accent: string): CSSProperties {
  const dark = tone === 'dark'
  return {
    '--s-bg': dark ? '#08090c' : '#f7f6f2',
    '--s-fg': dark ? '#f5f5f7' : '#0c0d10',
    '--s-mu': dark ? 'rgba(245,245,247,0.5)' : 'rgba(12,13,16,0.5)',
    '--s-ln': dark ? 'rgba(255,255,255,0.09)' : 'rgba(12,13,16,0.1)',
    '--s-ac': accent,
  } as CSSProperties
}

interface Wordmark {
  name: string
  font: string
  weight: number
  size: number
  tracking: string
  italic?: boolean
  upper?: boolean
  glyph: ReactNode
}

/** 虚构品牌的字标：各用一种字体 + 一个简单几何图形，不对应任何真实公司。 */
const MARKS: Wordmark[] = [
  { name: 'Northlight', font: "'Syne Variable', sans-serif", weight: 700, size: 22, tracking: '-0.02em', glyph: <path d="M3 17a9 9 0 0 1 18 0zM12 3v4M4.5 7.5l2.6 2.6M19.5 7.5l-2.6 2.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
  { name: 'Kestrel', font: "'Archivo Black', sans-serif", weight: 400, size: 19, tracking: '0.14em', upper: true, glyph: <path d="m3 15 9-9 9 9M3 20l9-9 9 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /> },
  { name: 'Brightwell', font: "'DM Serif Display', serif", weight: 400, size: 25, tracking: '-0.01em', italic: true, glyph: <><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3.2" fill="currentColor" /></> },
  { name: 'orchard', font: "'Fraunces Variable', serif", weight: 600, size: 26, tracking: '-0.03em', glyph: <path d="M12 21c-5 0-8-3.4-8-8 5 0 8 3 8 8Zm0 0c5 0 8-3.4 8-8-5 0-8 3-8 8ZM12 3v9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
  { name: 'plum_street', font: "'JetBrains Mono Variable', monospace", weight: 700, size: 18, tracking: '-0.04em', glyph: <path d="M4 4h16v16H4zM4 12h16M12 4v16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /> },
  { name: 'Foxglove', font: "'Bricolage Grotesque Variable', sans-serif", weight: 800, size: 23, tracking: '-0.04em', glyph: <path d="M6 20V9M12 20V4M18 20v-8" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" /> },
  { name: 'Lumen&Co', font: "'Space Grotesk Variable', sans-serif", weight: 500, size: 21, tracking: '-0.02em', glyph: <path d="M12 3.5 20 8v8l-8 4.5L4 16V8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /> },
  { name: 'Saltmarsh', font: "'Instrument Serif', serif", weight: 400, size: 28, tracking: '-0.01em', glyph: <path d="M3 9c3-3 6 3 9 0s6 3 9 0M3 16c3-3 6 3 9 0s6 3 9 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> },
]

function Logo({ m, colored }: { m: Wordmark; colored: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-2.5 whitespace-nowrap" style={{ color: 'var(--s-fg)' }}>
      <svg viewBox="0 0 24 24" className="size-[26px]" style={{ color: colored ? 'var(--s-ac)' : 'currentColor' }} aria-hidden>
        {m.glyph}
      </svg>
      <span style={{ fontFamily: m.font, fontWeight: m.weight, fontSize: m.size, letterSpacing: m.tracking, fontStyle: m.italic ? 'italic' : undefined, textTransform: m.upper ? 'uppercase' : undefined, lineHeight: 1 }}>{m.name}</span>
    </span>
  )
}

export function LogosCloud({ className, style, ...props }: LogosCloudProps) {
  const o = { ...defaults, ...props }
  const grid = o.layout === 'grid'
  const fade = 'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)'

  return (
    <section
      className={cn('lc-cloud relative w-full overflow-hidden', className)}
      style={{ ...palette(o.tone, o.accent), background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: BODY, ...style }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden style={{ background: 'radial-gradient(45% 70% at 50% 50%, color-mix(in oklab, var(--s-ac) 9%, transparent), transparent)' }} />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:px-10">
        <p className="mx-auto max-w-md text-center text-[14px] leading-relaxed text-balance" style={{ color: 'var(--s-mu)' }}>
          {o.heading}
        </p>

        {grid ? (
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 border-t border-l sm:grid-cols-4" style={{ borderColor: 'var(--s-ln)' }}>
            {MARKS.map((m) => (
              <div key={m.name} className="flex h-28 items-center justify-center border-r border-b px-4" style={{ borderColor: 'var(--s-ln)' }}>
                <Logo m={m} colored={o.colorGlyphs} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 overflow-hidden" style={{ maskImage: fade, WebkitMaskImage: fade }}>
            <div className={cn('lc-track flex w-max', o.pauseOnHover && 'lc-pausable')} style={{ ['--lc-dur' as string]: `${o.duration}s` }}>
              {[0, 1].map((copy) => (
                <div key={copy} aria-hidden={copy === 1 ? true : undefined} className="flex shrink-0 items-center gap-16 pr-16">
                  {MARKS.map((m) => (
                    <Logo key={m.name} m={m} colored={o.colorGlyphs} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-12 text-center text-[13px]" style={{ color: 'var(--s-mu)' }}>
          <span className="font-semibold" style={{ color: 'var(--s-fg)' }}>
            {o.count}
          </span>{' '}
          teams shipped on it last quarter
        </p>
      </div>
    </section>
  )
}
